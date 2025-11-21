// Test script for resume API endpoints
// Run with: node test-resume-api.js

async function testResumeAPI() {
  console.log('Testing Resume API...');
  
  // Base URL
  const baseURL = 'http://localhost:3000/api';
  
  // First, let's log in to get an auth token
  console.log('\nLogging in to get auth token...');
  
  // Replace with your actual credentials
  const credentials = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  let authToken;
  
  try {
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    authToken = loginData.token || loginData.user?.id;
    console.log('Login successful, got auth token');
    
    // Extract the auth cookie from the response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('Received auth cookie from server');
    }
  } catch (error) {
    console.error('Login failed:', error);
    console.log('\nCreating a test user instead...');
    
    try {
      const registerResponse = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!registerResponse.ok) {
        throw new Error(`Registration failed: ${registerResponse.status} ${registerResponse.statusText}`);
      }
      
      const registerData = await registerResponse.json();
      console.log('User registered successfully');
      
      // Now try logging in again
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!loginResponse.ok) {
        throw new Error(`Login after registration failed: ${loginResponse.status} ${loginResponse.statusText}`);
      }
      
      const loginData = await loginResponse.json();
      authToken = loginData.token || loginData.user?.id;
      console.log('Login successful after registration, got auth token');
      
      // Extract the auth cookie from the response
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('Received auth cookie from server');
      }
    } catch (registerError) {
      console.error('Registration failed:', registerError);
      console.log('\nUsing a mock token for testing (this will likely fail)');
      authToken = 'mock-token-for-testing';
    }
  }
  
  // Test data
  const newResume = {
    title: 'Test Resume',
    original_content: 'Original resume content',
    job_description: 'Software Engineer job description',
    tailored_content: {
      sections: [
        { title: 'Experience', content: 'Tailored experience content' },
        { title: 'Skills', content: 'Tailored skills content' }
      ]
    }
  };
  
  try {
    // 1. Create a new resume
    console.log('\n1. Creating a new resume...');
    const createResponse = await fetch(`${baseURL}/tailored-resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newResume)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create resume: ${createResponse.status} ${createResponse.statusText}`);
    }
    
    const createdResume = await createResponse.json();
    console.log('Resume created successfully:', createdResume.id);
    console.log('Full created resume data:', JSON.stringify(createdResume, null, 2));
    
    // 2. Get the created resume
    console.log('\n2. Fetching the created resume...');
    console.log(`Fetching resume with ID: ${createdResume.id}`);
    
    // Try listing all resumes first to see what's available
    console.log('Listing all resumes to verify...');
    const listAllResponse = await fetch(`${baseURL}/tailored-resumes`, {
      headers: {
        'Cookie': `auth_token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (listAllResponse.ok) {
      const allResumes = await listAllResponse.json();
      console.log(`Found ${allResumes.length} total resumes:`);
      console.log(JSON.stringify(allResumes.map(r => ({ id: r.id, title: r.title })), null, 2));
    } else {
      console.log(`Failed to list resumes: ${listAllResponse.status} ${listAllResponse.statusText}`);
    }
    
    // Use the new get-by-id endpoint
    const getResponse = await fetch(`${baseURL}/tailored-resumes/get-by-id?id=${createdResume.id}`, {
      headers: {
        'Cookie': `auth_token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch resume: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const fetchedResume = await getResponse.json();
    console.log('Resume fetched successfully:', fetchedResume.title);
    
    // 3. Update the resume
    console.log('\n3. Updating the resume...');
    const updateData = {
      title: 'Updated Test Resume',
      job_description: 'Updated job description'
    };
    
    const updateResponse = await fetch(`${baseURL}/tailored-resumes/update?id=${createdResume.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update resume: ${updateResponse.status} ${updateResponse.statusText}`);
    }
    
    const updatedResume = await updateResponse.json();
    console.log('Resume updated successfully:', updatedResume.title);
    
    // 4. List all resumes
    console.log('\n4. Listing all resumes...');
    const listResponse = await fetch(`${baseURL}/tailored-resumes`, {
      headers: {
        'Cookie': `auth_token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!listResponse.ok) {
      throw new Error(`Failed to list resumes: ${listResponse.status} ${listResponse.statusText}`);
    }
    
    const resumes = await listResponse.json();
    console.log(`Found ${resumes.length} resumes`);
    
    // 5. Delete the resume
    console.log('\n5. Deleting the resume...');
    const deleteResponse = await fetch(`${baseURL}/tailored-resumes/delete?id=${createdResume.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `auth_token=${authToken}`,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete resume: ${deleteResponse.status} ${deleteResponse.statusText}`);
    }
    
    console.log('Resume deleted successfully');
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testResumeAPI();
