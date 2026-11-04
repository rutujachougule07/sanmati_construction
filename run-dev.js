// SANMATI CONSTRUCTIONS ERP - Root Dev Runner (Client + Server)
import { spawn } from 'child_process';
import path from 'path';

console.log('=======================================================');
console.log('🏗️  SANMATI CONSTRUCTIONS ERP - Kolhapur');
console.log('⚡ Launching Backend Server (5000) & Vite Client (3000)...');
console.log('=======================================================');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Spawn Backend Server
const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('./server'),
  stdio: 'inherit',
  shell: true
});

// Spawn Frontend Client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('./client'),
  stdio: 'inherit',
  shell: true
});

// Handle termination signals
const cleanup = () => {
  console.log('\n🛑 Shutting down ERP services...');
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
