import { pool } from '../src/database/mysql';

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    const connection = await pool.getConnection();
    expect(connection).toBeDefined();
    await connection.release();
  });
});
