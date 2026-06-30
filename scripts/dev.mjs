import { networkInterfaces } from "os";
import { spawn, execSync } from "child_process";

function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (name.toLowerCase().includes("loopback") || name.toLowerCase().includes("wsl")) continue;
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.")) {
        return net.address;
      }
    }
  }
  return "0.0.0.0";
}

function freePort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const lines = result.trim().split("\n");
    const killed = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const processPid = parts[parts.length - 1];
      if (processPid && /^\d+$/.test(processPid) && processPid !== "0" && !killed.has(processPid)) {
        try {
          execSync(`taskkill /PID ${processPid} /F`, { stdio: "ignore" });
          killed.add(processPid);
        } catch {}
      }
    }
    if (killed.size > 0) {
      console.log(`  Freed port ${port} (killed ${killed.size} process)\n`);
    }
  } catch {
    // port already free
  }
}

const PORT = 3000;
const ip = getLocalIP();

console.log(`\n  Starting Davao Tours dev server...`);
console.log(`  Network IP: ${ip}`);

freePort(PORT);

const proc = spawn(
  `npx next dev --hostname ${ip} --port ${PORT}`,
  [],
  { stdio: "inherit", shell: true, cwd: process.cwd() }
);

proc.on("exit", (code) => process.exit(code ?? 0));