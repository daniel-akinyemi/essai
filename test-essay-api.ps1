# PowerShell script to test the Essay Scoring API

Write-Host "🚀 Testing Essay Scoring API with PowerShell..." -ForegroundColor Green
Write-Host ""

# Sample essay data
$topic = "The Impact of Technology on Education"
$content = "Technology has revolutionized the way we approach education in the 21st century. The integration of digital tools and online platforms has transformed traditional learning methods, making education more accessible, interactive, and personalized than ever before. One of the most significant benefits of technology in education is increased accessibility. Students from remote areas can now access quality education through online courses and virtual classrooms. This democratization of education has opened doors for millions of learners who previously faced geographical or financial barriers to learning. Furthermore, technology has enhanced the learning experience through interactive multimedia content. Educational videos, simulations, and virtual reality experiences provide students with engaging ways to understand complex concepts. These tools cater to different learning styles and help students retain information more effectively. However, it's important to acknowledge the challenges that come with technological integration in education. The digital divide remains a significant issue, with many students lacking access to necessary devices and internet connectivity. Additionally, there are concerns about screen time and the potential for technology to distract from learning rather than enhance it. In conclusion, while technology presents both opportunities and challenges in education, its benefits far outweigh the drawbacks when implemented thoughtfully. The key lies in finding the right balance between traditional teaching methods and innovative technological solutions to create the most effective learning environment for all students."

Write-Host "📝 Essay Topic: $topic" -ForegroundColor Cyan
Write-Host "📊 Content Length: $($content.Length) characters" -ForegroundColor Cyan
Write-Host ""

# Create JSON payload
$jsonData = @{
    topic = $topic
    content = $content
} | ConvertTo-Json

Write-Host "⏳ Sending request to /api/scoreEssay..." -ForegroundColor Yellow
Write-Host ""

try {
    # Send POST request
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/scoreEssay" -Method POST -Body $jsonData -ContentType "application/json"
    
    Write-Host "✅ Success! Here are the results:" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Overall Score: $($response.totalScore) / 100" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "📊 Score Breakdown:" -ForegroundColor Cyan
    Write-Host "├─ Grammar: $($response.breakdown.grammar)" -ForegroundColor White
    Write-Host "├─ Structure: $($response.breakdown.structure)" -ForegroundColor White
    Write-Host "├─ Coherence: $($response.breakdown.coherence)" -ForegroundColor White
    Write-Host "├─ Relevance: $($response.breakdown.relevance)" -ForegroundColor White
    Write-Host "├─ Vocabulary: $($response.breakdown.vocabulary)" -ForegroundColor White
    Write-Host "└─ Overused Words: $($response.breakdown.overusedWords)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "💡 Smart Feedback Summary:" -ForegroundColor Yellow
    Write-Host $response.feedback -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔧 Improvement Suggestions:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $response.suggestions.Count; $i++) {
        Write-Host "$($i + 1). $($response.suggestions[$i])" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure your development server is running on http://localhost:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green 