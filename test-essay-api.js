// Use dynamic import for node-fetch
async function testEssayScoring() {
  // Dynamic import for node-fetch
  const fetch = (await import('node-fetch')).default;

  const essayData = {
    topic: "The Impact of Technology on Education",
    content: `Technology has revolutionized the way we approach education in the 21st century. The integration of digital tools and online platforms has transformed traditional learning methods, making education more accessible, interactive, and personalized than ever before.

One of the most significant benefits of technology in education is increased accessibility. Students from remote areas can now access quality education through online courses and virtual classrooms. This democratization of education has opened doors for millions of learners who previously faced geographical or financial barriers to learning.

Furthermore, technology has enhanced the learning experience through interactive multimedia content. Educational videos, simulations, and virtual reality experiences provide students with engaging ways to understand complex concepts. These tools cater to different learning styles and help students retain information more effectively.

However, it's important to acknowledge the challenges that come with technological integration in education. The digital divide remains a significant issue, with many students lacking access to necessary devices and internet connectivity. Additionally, there are concerns about screen time and the potential for technology to distract from learning rather than enhance it.

In conclusion, while technology presents both opportunities and challenges in education, its benefits far outweigh the drawbacks when implemented thoughtfully. The key lies in finding the right balance between traditional teaching methods and innovative technological solutions to create the most effective learning environment for all students.`,
    debug: true // Enable debug mode to see detailed analysis
  };

  try {
    console.log('🚀 Testing Enhanced Essay Scoring API...');
    console.log('📝 Essay Topic:', essayData.topic);
    console.log('📊 Content Length:', essayData.content.length, 'characters');
    console.log('🔍 Debug Mode:', essayData.debug ? 'Enabled' : 'Disabled');
    console.log('\n⏳ Sending request to /api/scoreEssay...\n');

    const response = await fetch('http://localhost:3000/api/scoreEssay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(essayData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('✅ Success! Here are the results:\n');
    console.log('🎯 Overall Score:', result.totalScore, '/ 100');
    
    console.log('\n📊 Raw Score Breakdown:');
    console.log('├─ Grammar:', result.breakdown.grammar);
    console.log('├─ Structure:', result.breakdown.structure);
    console.log('├─ Coherence:', result.breakdown.coherence);
    console.log('├─ Relevance:', result.breakdown.relevance);
    console.log('├─ Vocabulary:', result.breakdown.vocabulary);
    console.log('└─ Overused Words:', result.breakdown.overusedWords);
    
    console.log('\n⚖️ Weighted Score Breakdown:');
    console.log('├─ Grammar:', result.weightedScores.grammar);
    console.log('├─ Structure:', result.weightedScores.structure);
    console.log('├─ Coherence:', result.weightedScores.coherence);
    console.log('├─ Relevance:', result.weightedScores.relevance);
    console.log('├─ Vocabulary:', result.weightedScores.vocabulary);
    console.log('└─ Overused Words:', result.weightedScores.overusedWords);
    
    console.log('\n💡 Smart Feedback Summary:');
    console.log(result.feedback);
    
    console.log('\n🔧 Improvement Suggestions:');
    result.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });

    // Debug information
    if (result.debug) {
      console.log('\n🔍 DEBUG INFORMATION:');
      
      if (result.debug.overusedWordsFound.length > 0) {
        console.log('\n📝 Overused Words Found:');
        result.debug.overusedWordsFound.forEach(word => {
          console.log(`  • "${word.word}" (${word.count} times) → Try: ${word.suggestions.slice(0, 2).join(', ')}`);
        });
      }
      
      if (result.debug.grammarIssues.length > 0) {
        console.log('\n❌ Grammar Issues:');
        result.debug.grammarIssues.forEach(issue => {
          console.log(`  • ${issue.type}: ${issue.description}`);
        });
      }
      
      console.log('\n📋 Structure Analysis:');
      console.log(`  • Paragraphs: ${result.debug.structureAnalysis.paragraphCount}`);
      console.log(`  • Has Introduction: ${result.debug.structureAnalysis.hasIntroduction ? 'Yes' : 'No'}`);
      console.log(`  • Has Conclusion: ${result.debug.structureAnalysis.hasConclusion ? 'Yes' : 'No'}`);
      console.log(`  • Transition Words: ${result.debug.structureAnalysis.transitionWords.join(', ') || 'None found'}`);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\n💡 Make sure your development server is running on http://localhost:3000');
  }
}

// Run the test
testEssayScoring(); 