// Test script to verify scoring system fixes with new clean format
async function testScoringFix() {
  const fetch = (await import('node-fetch')).default;

  const testEssay = {
    topic: "The Benefits of Exercise",
    content: `Exercise is very important for maintaining good health. Regular physical activity helps people stay fit and healthy. Many studies show that exercise reduces the risk of heart disease and diabetes.

Exercise also improves mental health by reducing stress and anxiety. When people exercise, their bodies release endorphins which make them feel better. This is why many doctors recommend exercise for people with depression.

In conclusion, exercise is really beneficial for both physical and mental health. Everyone should try to exercise regularly to stay healthy and happy.`,
  };

  try {
    console.log('Testing Fixed Essay Scoring System...');
    console.log('Topic:', testEssay.topic);
    console.log('Content Length:', testEssay.content.length, 'characters');
    console.log('\nSending request...\n');

    const response = await fetch('http://localhost:3000/api/scoreEssay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEssay),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    
    console.log('SUCCESS! Clean response format:\n');
    console.log(`Essay Title: "${result.essayTitle}"`);
    console.log(`Overall Score: ${result.overallScore} / 100`);
    
    console.log('\nWeighted Score Breakdown:');
    Object.entries(result.scoreBreakdown).forEach(([category, scoreString]) => {
      console.log(`  * ${category}: ${scoreString}`);
    });
    
    console.log('\nImprovement Suggestions:');
    result.improvementSuggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`);
    });
    
    console.log(`\nTimestamp: ${result.timestamp}`);

    // Verify all required fields are present
    const requiredFields = ['essayTitle', 'overallScore', 'scoreBreakdown', 'improvementSuggestions', 'timestamp'];
    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      console.log('\nMISSING FIELDS:', missingFields);
    } else {
      console.log('\nALL REQUIRED FIELDS PRESENT');
    }

    // Verify overall score is a valid number
    if (typeof result.overallScore !== 'number' || isNaN(result.overallScore)) {
      console.log('\nINVALID OVERALL SCORE:', result.overallScore);
    } else {
      console.log('\nOVERALL SCORE VALID');
    }

    // Verify score breakdown format
    const breakdownFields = ['grammar', 'structure', 'coherence', 'relevance', 'vocabulary', 'overusedWords'];
    const invalidBreakdown = breakdownFields.filter(field => {
      const scoreString = result.scoreBreakdown[field];
      return !scoreString || !scoreString.includes(' / ');
    });
    
    if (invalidBreakdown.length > 0) {
      console.log('\nINVALID SCORE BREAKDOWN FORMAT:', invalidBreakdown);
    } else {
      console.log('\nALL SCORE BREAKDOWN FORMATS VALID');
    }

    // Verify suggestions are strings
    const invalidSuggestions = result.improvementSuggestions.filter(suggestion => typeof suggestion !== 'string');
    if (invalidSuggestions.length > 0) {
      console.log('\nINVALID SUGGESTIONS FORMAT:', invalidSuggestions.length, 'non-string suggestions');
    } else {
      console.log('\nALL SUGGESTIONS ARE VALID STRINGS');
    }

    console.log('\nCLEAN RESPONSE FORMAT TEST COMPLETED!');

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testScoringFix(); 