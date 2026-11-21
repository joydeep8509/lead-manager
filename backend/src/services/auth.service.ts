import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface UserRow extends PublicUser {
  password_hash: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(private readonly db: Database.Database) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = this.db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(input.email) as { id: number } | undefined;

    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const result = this.db
      .prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      )
      .run(input.name, input.email, passwordHash);

    const user = this.findById(Number(result.lastInsertRowid));
    if (!user) {
      throw new AppError('Failed to create user account', 500);
    }

    return {
      token: this.signToken(user),
      user,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const row = this.db
      .prepare(
        'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?'
      )
      .get(input.email) as UserRow | undefined;

    if (!row) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(input.password, row.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const user: PublicUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: row.created_at,
    };

    return {
      token: this.signToken(user),
      user,
    };
  }

  findById(userId: number): PublicUser | null {
    const user = this.db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(userId) as PublicUser | undefined;

    return user ?? null;
  }

  private signToken(user: PublicUser): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] }
    );
  }
}
