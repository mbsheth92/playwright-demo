import { execSync } from 'child_process';
import fetch from 'node-fetch';

describe('RPC and CLI Test Harness', () => {

  it('RPC: should return pong on ping', async () => {
    const res = await fetch('http://localhost:4000/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'ping', params: [] }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.result).toBe('pong');
  });

  it('CLI: should return version info', () => {
    const output = execSync('node ./bin/mycli.js --version').toString();
    expect(output).toContain('1.0.0');
  });

  it('CLI: should fail gracefully with invalid args', () => {
    try {
      execSync('node ./bin/mycli.js --invalid');
    } catch (err: any) {
      expect(err.status).toBe(1);
      expect(err.stdout.toString()).toContain('Unknown option');
    }
  });

});
