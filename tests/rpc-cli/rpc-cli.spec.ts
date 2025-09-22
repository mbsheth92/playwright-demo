import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const RPC_URL = process.env.RPC_URL || 'http://localhost:4000/rpc';

test.describe('RPC', () => {
  test('ping -> pong', async ({ request }) => {
    const res = await request.post(RPC_URL, { data: { method: 'ping', params: [] } });
    expect(res.status()).toBe(200);
    expect((await res.json()).result).toBe('pong');
  });

  test('unknown method -> 400', async ({ request }) => {
    const res = await request.post(RPC_URL, { data: { method: 'nope' } });
    expect(res.status()).toBe(400);
  });

  test('authRequired without token -> 401', async ({ request }) => {
    const res = await request.post(RPC_URL, { data: { method: 'authRequired' } });
    expect(res.status()).toBe(401);
  });

  test('sum -> correct result', async ({ request }) => {
    const res = await request.post(RPC_URL, { data: { method: 'sum', params: [2, 3, 5] } });
    expect(res.status()).toBe(200);
    expect((await res.json()).result).toBe(10);
  });

  test('fixtures loaded', async () => {
    const text = fs.readFileSync('fixtures/seed/users.json', 'utf8');
    const users = JSON.parse(text);
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('name');
  });
});

test.describe('CLI', () => {
  const cmd = 'node bin/mycli.js';

  test('version flag', () => {
    const out = execSync(`${cmd} --version`, { stdio: 'pipe' }).toString().trim();
    expect(out).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);
  });

  test('invalid flag', () => {
    try {
      execSync(`${cmd} --invalid`, { stdio: 'pipe' });
    } catch (err: any) {
      const code = err.status ?? err.code;
      expect(code).toBe(1);
      const msg = `${err.stdout?.toString() || ''}${err.stderr?.toString() || ''}`;
      expect(msg).toContain('Unknown option');
    }
  });
});
