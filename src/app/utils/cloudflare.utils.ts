type MeasurementConfig =
  | { type: 'latency'; numPackets: number }
  | {
      type: 'download' | 'upload';
      bytes: number;
      count: number;
      bypassMinDuration?: boolean;
    }
  | {
      type: 'packetLoss';
      numPackets?: number;
      batchSize?: number;
      batchWaitTime?: number;
      responsesWaitTime?: number;
      connectionTimeout?: number;
    };

const DEFAULT_SEQUENCE: MeasurementConfig[] = [
  { type: 'latency', numPackets: 1 }, // initial latency estimation
  { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true }, // initial download estimation
  { type: 'latency', numPackets: 20 },
  { type: 'download', bytes: 1e5, count: 9 },
  { type: 'download', bytes: 1e6, count: 8 },
  { type: 'upload', bytes: 1e5, count: 8 },
  { type: 'packetLoss', numPackets: 1e3, responsesWaitTime: 3000 },
  { type: 'upload', bytes: 1e6, count: 6 },
  { type: 'download', bytes: 1e7, count: 6 },
  { type: 'upload', bytes: 1e7, count: 4 },
  { type: 'download', bytes: 2.5e7, count: 4 },
  { type: 'upload', bytes: 2.5e7, count: 4 },
  { type: 'download', bytes: 1e8, count: 3 },
  { type: 'upload', bytes: 5e7, count: 3 },
  { type: 'download', bytes: 2.5e8, count: 2 },
];

type ScaleOptions = {
  latencyScale?: number;
  bytesScale?: number;
  countScale?: number;
  packetLossScale?: number;
  responsesWaitTimeScale?: number;
  budgetBytes?: number;
  minBytesPerRequest?: number;
  keepBypassOnSmallSets?: boolean;
  bypassBytesThreshold?: number;
};

const roundInt = (n: number, min = 1) => Math.max(min, Math.round(n));

const isBW = (
  m: MeasurementConfig
): m is Extract<MeasurementConfig, { type: 'download' | 'upload' }> =>
  m.type === 'download' || m.type === 'upload';

const clone = <M>(x: M): M => JSON.parse(JSON.stringify(x));

const estimateTotalBytes = (measurements: MeasurementConfig[]) => {
  let total = 0;
  for (const m of measurements) {
    if (isBW(m)) {
      total += m.bytes * m.count;
    }
  }
  return total;
};

const applyBudget = (
  measurements: MeasurementConfig[],
  budgetBytes: number
) => {
  let total = estimateTotalBytes(measurements);
  if (total <= budgetBytes) {
    return measurements;
  }

  const out = clone(measurements);

  for (let i = out.length - 1; i >= 0 && total > budgetBytes; i--) {
    const m = out[i];
    if (!isBW(m)) {
      continue;
    }

    const bytesPerItem = m.bytes;
    while (m.count > 0 && total > budgetBytes) {
      m.count -= 1;
      total -= bytesPerItem;
    }
    if (m.count <= 0) {
      out.splice(i, 1);
    }
  }
  return out;
};

export const buildScaledMeasurements = (
  opts: ScaleOptions = {},
  base: MeasurementConfig[] = DEFAULT_SEQUENCE
): MeasurementConfig[] => {
  const {
    latencyScale = 1,
    bytesScale = 1,
    countScale = 1,
    packetLossScale = 1,
    responsesWaitTimeScale = 1,
    budgetBytes,
    minBytesPerRequest = 1e5,
    keepBypassOnSmallSets = true,
    bypassBytesThreshold = 1e6,
  } = opts;

  const scaled = base.map((m): MeasurementConfig => {
    if (m.type === 'latency') {
      return {
        type: 'latency',
        numPackets: roundInt(m.numPackets * latencyScale),
      };
    }
    if (m.type === 'packetLoss') {
      return {
        type: 'packetLoss',
        numPackets: m.numPackets
          ? roundInt(m.numPackets * packetLossScale)
          : undefined,
        batchSize: m.batchSize,
        batchWaitTime: m.batchWaitTime,
        responsesWaitTime: m.responsesWaitTime
          ? roundInt(m.responsesWaitTime * responsesWaitTimeScale)
          : undefined,
        connectionTimeout: m.connectionTimeout,
      };
    }
    const bytes = Math.max(
      minBytesPerRequest,
      Math.round(m.bytes * bytesScale)
    );
    const count = roundInt(m.count * countScale);
    const bypassMinDuration =
      (keepBypassOnSmallSets && bytes <= bypassBytesThreshold) ||
      !!m.bypassMinDuration
        ? true
        : undefined;

    return {
      type: m.type,
      bytes,
      count,
      ...(bypassMinDuration ? { bypassMinDuration } : {}),
    };
  });

  return typeof budgetBytes === 'number'
    ? applyBudget(scaled, budgetBytes)
    : scaled;
};

export const estimateTotalMB = (measurements: MeasurementConfig[]) =>
  estimateTotalBytes(measurements) / 1e6;
