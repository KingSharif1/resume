'use server';
import { compare, hash } from 'bcrypt';
import { neon } from '@neondatabase/serverless';
import { sign, verify } from 'jsonwebtoken';

// Use the same Neon connection as the resume API
const sql = neon(process.env.NEON_DATABASE_URL!);

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Types
export interface User {
  id: string;
  email: string;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
}

// User registration
export async function registerUser(email: string, password: string): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return null; // User already exists
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Insert new user
    const result = await sql`
      INSERT INTO users (email, password_hash) 
      VALUES (${email}, ${passwordHash}) 
      RETURNING id, email, created_at
    `;

    return result[0] as User;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// User login
export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    // Find user by email
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.length === 0) {
      return null; // User not found
    }

    const user = result[0];

    // Verify password
    const passwordValid = await compare(password, user.password_hash);
    if (!passwordValid) {
      return null; // Invalid password
    }

    // Create session token
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Store session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await sql`
      INSERT INTO sessions (user_id, token, expires_at) 
      VALUES (${user.id}, ${token}, ${expiresAt})
    `;

    return {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      token
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

// Verify session token
export async function verifySession(token: string): Promise<User | null> {
  try {
    // Verify JWT
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return null; // Invalid token
    }

    // Check if session exists and is not expired
    const result = await sql`
      SELECT s.*, u.email, u.created_at 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;

    if (result.length === 0) {
      return null; // Session not found or expired
    }

    const session = result[0];

    return {
      id: session.user_id,
      email: session.email,
      created_at: session.created_at
    };
  } catch (error) {
    console.error('Error verifying session:', error);
    throw error;
  }
}

// Logout user
export async function logoutUser(token: string): Promise<boolean> {
  try {
    // Delete session
    const result = await sql`DELETE FROM sessions WHERE token = ${token}`;
    return result.length > 0;
  } catch (error) {
    console.error('Error logging out user:', error);
    throw error;
  }
}

// Get current user from token
export async function getCurrentUser(token: string): Promise<User | null> {
  return verifySession(token);
}

// Update user password
export async function updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    // Get user by ID
    const userResult = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (userResult.length === 0) {
      return false;
    }

    const user = userResult[0];

    // Verify current password
    const passwordValid = await compare(currentPassword, user.password_hash);
    if (!passwordValid) {
      return false;
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 10);

    // Update password
    await sql`UPDATE users SET password_hash = ${newPasswordHash} WHERE id = ${userId}`;

    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

// Verify authentication from request
export async function verifyAuth(request: NextRequest): Promise<User | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('auth-token')?.value;
    if (!token) {
      // Try to get token from Authorization header
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7);
        if (headerToken) {
          return verifySession(headerToken);
        }
      }
      return null;
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || '') as { userId: string };
    if (!decoded || !decoded.userId) {
      return null;
    }

    // Get user from database
    const result = await sql`SELECT id, email, created_at FROM users WHERE id = ${decoded.userId}`;
    if (result.length === 0) {
      return null;
    }

    return result[0] as User;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return null;
  }
}
