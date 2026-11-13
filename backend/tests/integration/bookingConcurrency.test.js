const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../../src/app');
const db = require('../../src/models/db');
const userRepository = require('../../src/repositories/userRepository');
const bcrypt = require('bcryptjs');

describe('Sprint 2 Integration Tests: Occupancy & Concurrency Slot Booking', () => {
  let server;
  let baseUrl;
  let memberToken;
  let testUsers = [];
  const runId = Date.now();

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // Login default member to get token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@fitcrowd.com', password: 'MemberPass123!' })
    });
    const loginData = await loginRes.json();
    memberToken = loginData.data.token;

    // Create 5 unique test members for concurrency test
    for (let i = 1; i <= 5; i++) {
      const email = `conc_user_${i}_${runId}@test.com`;
      const passHash = await bcrypt.hash('TestPass123!', 10);
      const user = userRepository.create({
        email,
        passwordHash: passHash,
        fullName: `Concurrency User ${i}`,
        role: 'member'
      });
      const authService = require('../../src/services/authService');
      const token = authService.generateToken(user);
      testUsers.push({ user, token });
    }
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('2.1 GET /api/crowd/live returns current occupancy and valid level', async () => {
    const res = await fetch(`${baseUrl}/api/crowd/live`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(typeof body.data.currentOccupancy === 'number');
    assert.ok(typeof body.data.maxCapacity === 'number');
    assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(body.data.crowdLevel));
  });

  it('2.2 Check-in and check-out cycle updates live count', async () => {
    const initialRes = await fetch(`${baseUrl}/api/crowd/live`);
    const initial = await initialRes.json();

    // Check-in
    const checkInRes = await fetch(`${baseUrl}/api/crowd/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({ checkInType: 'MANUAL_APP' })
    });
    assert.strictEqual(checkInRes.status, 200);
    const checkInData = await checkInRes.json();
    assert.strictEqual(checkInData.data.currentOccupancy, initial.data.currentOccupancy + 1);

    // Check-out
    const checkOutRes = await fetch(`${baseUrl}/api/crowd/check-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      }
    });
    assert.strictEqual(checkOutRes.status, 200);
    const checkOutData = await checkOutRes.json();
    assert.strictEqual(checkOutData.data.currentOccupancy, initial.data.currentOccupancy);
  });

  it('2.3 GET /api/bookings/slots returns 16 hourly slots for given date', async () => {
    const testDate = `2027-01-01`;
    const res = await fetch(`${baseUrl}/api/bookings/slots?date=${testDate}`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 16); // 06:00 to 22:00
    assert.strictEqual(body.data[0].startHour, 6);
  });

  it('2.4 Member can book a slot and see available seats decrement', async () => {
    const testDate = `2027-01-02`;
    const slotsRes = await fetch(`${baseUrl}/api/bookings/slots?date=${testDate}`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    const slots = (await slotsRes.json()).data;
    const targetSlot = slots[4]; // 10:00 slot

    // Clean up any existing booking for this slot
    db.run('DELETE FROM bookings WHERE slot_id = ?;', [targetSlot.id]);
    db.run('UPDATE slots SET current_bookings = 0 WHERE id = ?;', [targetSlot.id]);

    const bookRes = await fetch(`${baseUrl}/api/bookings/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({ slotId: targetSlot.id })
    });
    assert.strictEqual(bookRes.status, 201);
    const bookData = await bookRes.json();
    assert.strictEqual(bookData.success, true);
    assert.strictEqual(bookData.data.status, 'BOOKED');

    // Duplicate booking attempt should fail
    const dupRes = await fetch(`${baseUrl}/api/bookings/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({ slotId: targetSlot.id })
    });
    assert.strictEqual(dupRes.status, 400);

    // Cancel booking
    const cancelRes = await fetch(`${baseUrl}/api/bookings/${bookData.data.bookingId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    assert.strictEqual(cancelRes.status, 200);
    const cancelData = await cancelRes.json();
    assert.strictEqual(cancelData.data.status, 'CANCELLED');
  });

  it('2.5 CONCURRENCY TEST: 5 simultaneous requests for 1 remaining seat', async () => {
    const testDate = `2027-01-03`;
    db.run('DELETE FROM slots WHERE slot_date = ?;', [testDate]);
    db.run(
      `INSERT INTO slots (slot_date, start_hour, end_hour, max_capacity, current_bookings)
       VALUES (?, 18, 19, 1, 0);`,
      [testDate]
    );
    const slot = db.get('SELECT * FROM slots WHERE slot_date = ? AND start_hour = 18;', [testDate]);
    assert.strictEqual(slot.max_capacity, 1);
    assert.strictEqual(slot.current_bookings, 0);

    // 2. Dispatch 5 concurrent booking requests at the same millisecond
    const requests = testUsers.map((tu) =>
      fetch(`${baseUrl}/api/bookings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tu.token}`
        },
        body: JSON.stringify({ slotId: slot.id })
      })
    );

    const responses = await Promise.all(requests);
    const statusCodes = responses.map((r) => r.status);

    // Count 201 Created vs 409 Conflict
    const successCount = statusCodes.filter((s) => s === 201).length;
    const conflictCount = statusCodes.filter((s) => s === 409).length;

    console.log(` Concurrency result: Successes: ${successCount}, Conflicts: ${conflictCount}`);

    // EXACTLY 1 request must succeed, and 4 must receive 409 Conflict
    assert.strictEqual(successCount, 1, 'Only one user must succeed in booking the last seat');
    assert.strictEqual(conflictCount, 4, 'Remaining 4 users must receive 409 Conflict');

    // Verify slot table: current_bookings must not exceed max_capacity (no overbooking!)
    const updatedSlot = db.get('SELECT current_bookings, max_capacity FROM slots WHERE id = ?;', [slot.id]);
    assert.strictEqual(updatedSlot.current_bookings, 1);
  });
});
