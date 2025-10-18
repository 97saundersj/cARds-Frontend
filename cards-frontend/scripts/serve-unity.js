#!/usr/bin/env node
import { spawn } from "child_process";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
config({ path: resolve(__dirname, "../.env.local") });
config({ path: resolve(__dirname, "../.env") });

const buildPath = process.env.UNITY_BUILD_PATH || "public/unity";
const port = process.env.VITE_UNITY_SERVER_PORT || "8000";

console.log(`Starting Unity server...`);
console.log(`Path: ${buildPath}`);
console.log(`Port: ${port}`);

const server = spawn("npx", ["http-server", buildPath, "-p", port, "--cors"], {
  stdio: "inherit",
  shell: true,
});

server.on("error", (error) => {
  console.error(`Error starting server: ${error.message}`);
  process.exit(1);
});

server.on("close", (code) => {
  process.exit(code || 0);
});
