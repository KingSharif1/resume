// Client-safe database client - can be imported in client components
'use client';

import { neon } from '@neondatabase/serverless';

// This is a simplified client-side database interface
// It should only be used for read operations in client components
// Write operations should be done through API routes

// Create a connection function
const sql = neon(process.env.NEXT_PUBLIC_NEON_DATABASE_URL || '');

// Simple query function that works in the browser
export async function query(text, params = []) {
  try {
    return await sql(text, params);
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export { sql };
