import request from 'supertest';
import { app, server } from '../src/index';
import db from '../src/db';

describe('Wallet Funding API', () => {
  it('funds wallet successfully with valid token and valid data', async () => {
    const response = await request(app)
      .post('/wallet/fund')
      .set('x-fake-token', 'token123')
      .send({
        userId: 1,
        amount: 100,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Wallet funded successfully');
    expect(response.body).toHaveProperty('balance');
    expect(typeof response.body.balance).toBe('number');
  });

  it('rejects if token userId does not match request userId', async () => {
    const response = await request(app)
      .post('/wallet/fund')
      .set('x-fake-token', 'token456') // userId=2
      .send({
        userId: 1, // Mismatch here, userId=1 in body but token userId=2
        amount: 100,
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'Forbidden: You can only operate on your own account.');
  });

  it('rejects if amount is missing or not a number', async () => {
    const response = await request(app)
      .post('/wallet/fund')
      .set('x-fake-token', 'token123')
      .send({
        userId: 1,
        amount: 'invalid-amount',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'userId and amount are required, and amount must be a number.');
  });
  afterAll(async () => {
    await db.destroy();  // close DB connections (just in case)
    await new Promise((resolve) => server.close(resolve)); // close server properly
  });
});