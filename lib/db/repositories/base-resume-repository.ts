'use client';

import { User } from '@/lib/auth/auth';

export interface BaseResume {
  id: string;
  user_id: string;
  title: string;
  content?: any;
  sections?: any[];
  contact_info?: any;
  summary?: string;
  experience?: any[];
  education?: any[];
  skills?: any;
  certifications?: any[];
  projects?: any[];
  custom_sections?: any[];
  is_starred?: boolean;
  created_at: Date;
  updated_at: Date;
}

export class BaseResumeRepository {
  // Get all base resumes for a user
  async getByUserId(userId: string): Promise<BaseResume[]> {
    try {
      const response = await fetch('/api/base-resumes', {
        credentials: 'include', // Include cookies for authentication
      });
      if (!response.ok) {
        throw new Error('Failed to fetch base resumes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching base resumes:', error);
      return [];
    }
  }

  // Get a single base resume by ID
  async getById(id: string, userId: string): Promise<BaseResume | null> {
    try {
      const response = await fetch(`/api/base-resumes/get-by-id?id=${id}`, {
        credentials: 'include', // Include cookies for authentication
      });
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch base resume');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching base resume:', error);
      return null;
    }
  }

  // Create a new base resume
  async create(data: Omit<BaseResume, 'id' | 'created_at' | 'updated_at'>): Promise<BaseResume> {
    try {
      const response = await fetch('/api/base-resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to create base resume');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating base resume:', error);
      throw error;
    }
  }

  // Update an existing base resume
  async update(id: string, userId: string, data: Partial<BaseResume>): Promise<BaseResume | null> {
    try {
      const response = await fetch(`/api/base-resumes/update?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to update base resume');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating base resume:', error);
      return null;
    }
  }

  // Delete a base resume
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/base-resumes/delete?id=${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error('Failed to delete base resume');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting base resume:', error);
      return false;
    }
  }
}
