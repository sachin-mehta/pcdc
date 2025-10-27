// import { writeFileSync } from 'fs';
// import { join } from 'path';
// import { environment } from '../../environments/environment';

// const output = [
//   `API_BASE_URL_TOKEN=${environment.token}`,
//   `ENVIRONMENT=${environment.mode}`,
//   `API_BASE_URL=${environment.restAPI}`,
// ].join('\n');

// const filePath = join(
//   __dirname,
//   '../../../androidapp/src/main/assets/env.properties'
// );

// writeFileSync(filePath, output);
// console.log('✅ Native env.properties generated');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to environment file (TypeScript source)
const envPath = path.join(__dirname, '../src/environments/_environment.prod.ts');

// Read file as text
const envContent = fs.readFileSync(envPath, 'utf-8');

// Simple regex extraction (for static environments)
console.log(`GIGA ${envContent}`)
const mode = envContent.match(/mode:\s*['"`](.*?)['"`]/)?.[1] ?? '';
const output = [
  `ENVIRONMENT=${mode}`,
].join('\n');

// Write to Android assets folder
const filePath = path.join(
  __dirname,
  '../android/app/src/main/assets/env.properties'
);
fs.writeFileSync(filePath, output, 'utf-8');

console.log('✅ Native env.properties generated successfully at:');
console.log(filePath);
