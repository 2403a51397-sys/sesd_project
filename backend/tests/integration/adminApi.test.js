const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../../src/app');

describe('Sprint 4 Integration Tests: Admin Analytics & Controls', () => {
  let server;
  let baseUrl;
  let adminToken;
  let memberToken;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // Login Admin
    const adminRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fitcrowd.com', password: 'AdminPass123!' })
    });
    adminToken = (await adminRes.json()).data.token;

    // Login Member
    const memberRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@fitcrowd.com', password: 'MemberPass123!' })
    });
    memberToken = (await memberRes.json()).data.token;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('4.1 Member is forbidden from accessing /api/admin/analytics (HTTP 403)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /Forbidden/);
  });

  it('4.2 Admin can successfully fetch /api/admin/analytics and KPIs', async () => {
    const res = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.kpis.totalVisitsLogged > 0);
    assert.ok(body.data.weeklyTraffic.length > 0);
    assert.ok(body.data.hourlyDistribution.length > 0);
    assert.ok(body.data.peakHourLabel);
  });

  it('4.3 Admin can update gym floor maximum capacity', async () => {
    const res = await fetch(`${baseUrl}/api/admin/capacity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ maxCapacity: 120 })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.maxCapacity, 120);

    // Verify live crowd now evaluates with maxCapacity 120
    const liveRes = await fetch(`${baseUrl}/api/crowd/live`);
    const liveData = await liveRes.json();
    assert.strictEqual(liveData.data.maxCapacity, 120);

    // Reset back to 100
    await fetch(`${baseUrl}/api/admin/capacity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ maxCapacity: 100 })
    });
  });

  it('4.4 Admin can post and retrieve announcements', async () => {
    const postRes = await fetch(`${baseUrl}/api/admin/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Spin Studio Floor Cleaning',
        content: 'Spin studio will be closed on Saturday from 2 PM to 4 PM for sanitization.',
        priority: 'NORMAL'
      })
    });
    assert.strictEqual(postRes.status, 201);

    const getRes = await fetch(`${baseUrl}/api/admin/announcements`);
    assert.strictEqual(getRes.status, 200);
    const list = await getRes.json();
    assert.ok(list.data.length > 0);
    assert.strictEqual(list.data[0].title, 'Spin Studio Floor Cleaning');
  });

  it('4.5 Demo Simulator: Admin can trigger surge and reset occupancy', async () => {
    const surgeRes = await fetch(`${baseUrl}/api/admin/simulator/surge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(surgeRes.status, 200);
    const surgeData = await surgeRes.json();
    assert.strictEqual(surgeData.crowdLevel, 'HIGH');

    const resetRes = await fetch(`${baseUrl}/api/admin/simulator/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(resetRes.status, 200);
    const resetData = await resetRes.json();
    assert.strictEqual(resetData.crowdLevel, 'LOW');
  });
});
