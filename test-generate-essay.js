// Test script to debug the generateEssay endpoint
import fetch from 'node-fetch';

async function testGenerateEssay() {
  try {
    const response = await fetch('http://localhost:3001/api/generateEssay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'The impact of artificial intelligence on education',
        format: 'clean',
        checkRelevance: false,
        citationsEnabled: false,
        writingStyle: 'academic',
        essayLength: 'medium'
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        error: result.error
      });
      return;
    }

    console.log('Success! Generated essay:');
    console.log('------------------------');
    console.log(result.essay);
    console.log('------------------------');
    console.log('Essay ID:', result.essayId);
    console.log('Relevance Score:', result.relevanceScore);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGenerateEssay();
