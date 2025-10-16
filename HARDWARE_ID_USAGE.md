# Hardware ID Usage Guide

## Overview

The system hardware ID is automatically fetched from Electron and saved to localStorage when the app starts.

## How It Works

### 1. Electron Side (Main Process)

- When the app starts, `systeminformation` package retrieves the system UUID
- Hardware data is sent to the Angular app via IPC
- An IPC handler (`get-hardware-id`) is available for on-demand requests

### 2. Angular Side (Renderer Process)

- `HardwareIdService` automatically initializes when the app starts
- Listens for hardware ID from Electron and saves it to localStorage
- Provides methods to retrieve the hardware ID

## Usage in Angular Components

### Method 1: Inject the Service

```typescript
import { HardwareIdService } from "./services/hardware-id.service";

export class YourComponent {
  constructor(private hardwareIdService: HardwareIdService) {
    // Get just the hardware ID string
    const hardwareId = this.hardwareIdService.getHardwareId();
    console.log("Hardware ID:", hardwareId);

    // Get full hardware data
    const hardwareData = this.hardwareIdService.getHardwareData();
    console.log("Full hardware data:", hardwareData);
  }
}
```

### Method 2: Direct localStorage Access

```typescript
// Get the hardware data from localStorage directly
const hardwareData = JSON.parse(localStorage.getItem("system_hardware_id"));
console.log("Hardware ID:", hardwareData?.hardwareId);
```

## Hardware Data Structure

```typescript
{
  hardwareId: string; // Primary hardware ID (UUID or serial)
  uuid: string; // System UUID
  serial: string; // System serial number
  sku: string; // Stock Keeping Unit
  manufacturer: string; // System manufacturer
  model: string; // System model
  osSerial: string; // OS serial number
  timestamp: string; // ISO timestamp when data was retrieved
}
```

## API Methods

### HardwareIdService Methods

#### `getHardwareId(): string | null`

Returns just the primary hardware ID string.

#### `getHardwareData(): HardwareData | null`

Returns the complete hardware data object.

#### `fetchHardwareId(): Promise<HardwareData | null>`

Manually fetch hardware ID from Electron (usually not needed as it's automatic).

#### `clearHardwareData(): void`

Clear hardware data from localStorage.

## Console Output

When the app runs, you'll see these console messages:

**Electron (Main Process):**

```
=== SYSTEM HARDWARE ID ===
System UUID: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
System Serial: XXXXXXXXXXXX
System SKU: XXXXX
Manufacturer: Dell Inc.
Model: XPS 15 9570
OS Serial: XXXXX
=========================

🔑 PRIMARY HARDWARE ID (use this): XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
✅ Hardware ID sent to renderer process
```

**Angular (Renderer Process):**

```
📥 Received hardware ID from Electron: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
✅ Fetched hardware ID: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
💾 Hardware ID saved to localStorage
```

## Key Features

✅ **Automatic**: Hardware ID is fetched and saved automatically on app start
✅ **User-Independent**: The ID is tied to hardware, not the Windows user
✅ **Persistent**: Saved to localStorage for quick access
✅ **Safe**: Uses existing IPC communication patterns
✅ **No Breaking Changes**: Follows existing conventions in the codebase

## localStorage Key

`system_hardware_id` - Contains the full hardware data object as JSON
