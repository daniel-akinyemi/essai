#!/bin/bash

echo "🚀 Testing Essay Scoring API with curl..."
echo ""

# Sample essay data
TOPIC="The Impact of Technology on Education"
CONTENT="Technology has revolutionized the way we approach education in the 21st century. The integration of digital tools and online platforms has transformed traditional learning methods, making education more accessible, interactive, and personalized than ever before. One of the most significant benefits of technology in education is increased accessibility. Students from remote areas can now access quality education through online courses and virtual classrooms. This democratization of education has opened doors for millions of learners who previously faced geographical or financial barriers to learning. Furthermore, technology has enhanced the learning experience through interactive multimedia content. Educational videos, simulations, and virtual reality experiences provide students with engaging ways to understand complex concepts. These tools cater to different learning styles and help students retain information more effectively. However, it's important to acknowledge the challenges that come with technological integration in education. The digital divide remains a significant issue, with many students lacking access to necessary devices and internet connectivity. Additionally, there are concerns about screen time and the potential for technology to distract from learning rather than enhance it. In conclusion, while technology presents both opportunities and challenges in education, its benefits far outweigh the drawbacks when implemented thoughtfully. The key lies in finding the right balance between traditional teaching methods and innovative technological solutions to create the most effective learning environment for all students."

echo "📝 Essay Topic: $TOPIC"
echo "📊 Content Length: ${#CONTENT} characters"
echo ""

# Create JSON payload
JSON_DATA=$(cat <<EOF
{
  "topic": "$TOPIC",
  "content": "$CONTENT"
}
EOF
)

echo "⏳ Sending request to /api/scoreEssay..."
echo ""

# Send POST request
curl -X POST \
  http://localhost:3000/api/scoreEssay \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA" \
  -s | jq '.'

echo ""
echo "✅ Test completed!" 