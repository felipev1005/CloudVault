import pool from "../config/database.js";

interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    `
      SELECT id, name, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const createUser = async (
  userData: CreateUserData
): Promise<UserRecord> => {
  const { name, email, passwordHash } = userData;

  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at, updated_at
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
};