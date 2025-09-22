async function globalTeardown() {
  const pid = (globalThis as any).__RPC_SERVER_PID__;
  if (pid) {
    try { process.kill(pid); } catch {}
  }
}
export default globalTeardown;
