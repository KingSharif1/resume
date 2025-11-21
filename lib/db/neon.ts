import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Database client for Neon PostgreSQL
 * Provides unified interface for both serverless and server environments
 */
class NeonClient {
  private pool: Pool | null = null;
  private connectionString: string;
  
  constructor() {
    // For serverless/edge environments
    neonConfig.fetchConnectionCache = true;
    
    // Get connection string from environment
    this.connectionString = process.env.NEON_DATABASE_URL || '';
    
    if (!this.connectionString) {
      console.error('NEON_DATABASE_URL is not defined in environment variables');
    }
  }
  
  /**
   * SQL executor for serverless environments
   */
  private _sql!: ReturnType<typeof neon>;
  
  /**
   * Get SQL executor for serverless environments
   */
  get sql() {
    if (!this._sql) {
      this._sql = neon(this.connectionString);
    }
    return this._sql;
  }
  
  /**
   * Get or create connection pool for Node.js environments
   */
  getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({ connectionString: this.connectionString });
    }
    return this.pool;
  }
  
  /**
   * Execute a query in Node.js environment
   */
  async query<T extends QueryResultRow = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    const client = await this.getPool().connect();
    try {
      return await client.query<T>(text, params);
    } finally {
      client.release();
    }
  }
  
  /**
   * Close all connections
   */
  async end() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// Create and export a singleton instance
const db = new NeonClient();

// Export the instance and its methods for convenience
export default db;
export const sql = db.sql;
export const query = <T extends QueryResultRow = any>(text: string, params: any[] = []) => db.query<T>(text, params);
export const getPool = () => db.getPool();
