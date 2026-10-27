import { vtonService } from '../backend/src/services/vtonService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testVtonService() {
  console.log('Testing vtonService status...');
  console.log(vtonService.getStatus());
}

testVtonService();
