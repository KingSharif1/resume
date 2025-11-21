'use client';

export interface TailoredResume {
  id: string;
  user_id: string;
  base_resume_id?: string;
  title: string;
  original_content?: string;
  job_description?: string;
  tailored_content: any;
  score?: number;
  score_breakdown?: any;
  created_at: Date;
  updated_at: Date;
}

export class TailoredResumeRepository {
  // Get all tailored resumes for a user
  async getByUserId(userId: string): Promise<TailoredResume[]> {
    try {
      const response = await fetch('/api/tailored-resumes');
      if (!response.ok) {
        throw new Error('Failed to fetch tailored resumes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tailored resumes:', error);
      return [];
    }
  }

  // Get a single tailored resume by ID
  async getById(id: string, userId: string): Promise<TailoredResume | null> {
    try {
      const response = await fetch(`/api/tailored-resumes/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch tailored resume');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tailored resume:', error);
      return null;
    }
  }

  // Create a new tailored resume
  async create(data: Omit<TailoredResume, 'id' | 'created_at' | 'updated_at'>): Promise<TailoredResume> {
    try {
      const response = await fetch('/api/tailored-resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create tailored resume');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating tailored resume:', error);
      throw error;
    }
  }

  // Update an existing tailored resume
  async update(id: string, userId: string, data: Partial<TailoredResume>): Promise<TailoredResume | null> {
    try {
      const response = await fetch(`/api/tailored-resumes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to update tailored resume');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating tailored resume:', error);
      return null;
    }
  }

  // Delete a tailored resume
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/tailored-resumes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error('Failed to delete tailored resume');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting tailored resume:', error);
      return false;
    }
  }
}
