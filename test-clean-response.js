// Test script to verify the new clean response format
async function testCleanResponse() {
  const fetch = (await import('node-fetch')).default;

  const testEssay = {
    topic: "Should Students Be Allowed to Use Smartphones in School?",
    content: `Smartphones have become an essential part of modern life, and many students use them daily. However, there is ongoing debate about whether students should be allowed to use smartphones in school. This essay will explore both sides of this important issue.

On one hand, smartphones can be very useful educational tools. Students can use them to research topics, access educational apps, and take notes. Many teachers also use smartphones to enhance their lessons with interactive content and real-time information. Additionally, smartphones can help students stay organized with calendars and reminders for assignments.

However, there are also significant concerns about smartphone use in schools. Many students get distracted by social media, games, and messaging apps during class time. This can lead to lower academic performance and disrupt the learning environment for other students. Some students also use smartphones to cheat on tests or share inappropriate content.

In conclusion, while smartphones have educational benefits, schools need to establish clear rules about their use. Perhaps a compromise solution would be to allow smartphones for specific educational purposes while restricting their use during regular class time. This way, students can benefit from technology without the distractions.`,
  };

  try {
    console.log('🧪 Testing Clean Response Format...');
    console.log('📝 Essay Title:', testEssay.topic);
    console.log('📊 Content Length:', testEssay.content.length, 'characters');
    console.log('\n⏳ Sending request...\n');

    const response = await fetch('http://localhost:3000/api/scoreEssay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEssay),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ SUCCESS! Clean response format:\n');
    console.log('📋 ESSAY TITLE:');
    console.log(`   "${result.essayTitle}"`);
    
    console.log('\n🎯 OVERALL SCORE:');
    console.log(`   ${result.overallScore} / 100`);
    
    console.log('\n📊 WEIGHTED SCORE BREAKDOWN:');
    Object.entries(result.scoreBreakdown).forEach(([category, scoreString]) => {
      console.log(`   • ${category}: ${scoreString}`);
    });
    
    console.log('\n💡 IMPROVEMENT SUGGESTIONS:');
    result.improvementSuggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
    
    console.log('\n⏰ TIMESTAMP:');
    console.log(`   ${result.timestamp}`);

    // Verify the response structure
    const requiredFields = ['essayTitle', 'overallScore', 'scoreBreakdown', 'improvementSuggestions', 'timestamp'];
    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      console.log('\n❌ MISSING FIELDS:', missingFields);
    } else {
      console.log('\n✅ ALL REQUIRED FIELDS PRESENT');
    }

    // Verify score breakdown format
    const breakdownFields = ['grammar', 'structure', 'coherence', 'relevance', 'vocabulary', 'overusedWords'];
    const invalidBreakdown = breakdownFields.filter(field => {
      const scoreString = result.scoreBreakdown[field];
      return !scoreString || !scoreString.includes(' / ');
    });
    
    if (invalidBreakdown.length > 0) {
      console.log('\n❌ INVALID SCORE BREAKDOWN FORMAT:', invalidBreakdown);
    } else {
      console.log('\n✅ ALL SCORE BREAKDOWN FORMATS VALID');
    }

    // Verify overall score is a number 0-100
    if (typeof result.overallScore !== 'number' || result.overallScore < 0 || result.overallScore > 100) {
      console.log('\n❌ INVALID OVERALL SCORE:', result.overallScore);
    } else {
      console.log('\n✅ OVERALL SCORE VALID (0-100)');
    }

    // Verify suggestions are strings
    const invalidSuggestions = result.improvementSuggestions.filter(suggestion => typeof suggestion !== 'string');
    if (invalidSuggestions.length > 0) {
      console.log('\n❌ INVALID SUGGESTIONS FORMAT:', invalidSuggestions.length, 'non-string suggestions');
    } else {
      console.log('\n✅ ALL SUGGESTIONS ARE VALID STRINGS');
    }

    console.log('\n🎉 CLEAN RESPONSE FORMAT TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCleanResponse(); 