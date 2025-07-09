'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, Lightbulb, PenLine, ListOrdered, FileCheck2, Link2, CheckCircle, Sparkles } from "lucide-react";

const writingTips = [
  {
    title: "1. Understand the Essay Topic",
    icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    points: [
      "Carefully read the prompt or question.",
      'Identify action words like “explain,” “compare,” “argue.”',
      "Restate the topic in your own words.",
    ],
    color: "from-blue-100 to-blue-50 border-blue-400"
  },
  {
    title: "2. Plan Before You Write",
    icon: <PenLine className="h-6 w-6 text-purple-500" />,
    points: [
      "Jot down quick ideas (brainstorm).",
      "Group similar thoughts together.",
      "Build a simple outline: Introduction, Body (2–3), Conclusion.",
    ],
    color: "from-purple-100 to-purple-50 border-purple-400"
  },
  {
    title: "3. Write a Strong Introduction",
    icon: <Sparkles className="h-6 w-6 text-green-500" />,
    points: [
      "Start with a hook (quote, question, or fact).",
      "Give some background (if needed).",
      "End with a thesis statement.",
    ],
    color: "from-green-100 to-green-50 border-green-400"
  },
  {
    title: "4. Build Body Paragraphs",
    icon: <FileCheck2 className="h-6 w-6 text-yellow-500" />,
    points: [
      "Each paragraph covers one idea.",
      "Start with a topic sentence.",
      "Use examples and link back to your thesis.",
    ],
    color: "from-yellow-100 to-yellow-50 border-yellow-400"
  },
  {
    title: "5. Use Transitions",
    icon: <Link2 className="h-6 w-6 text-pink-500" />,
    points: [
      "Link ideas clearly using: Moreover, However, For example, etc.",
    ],
    color: "from-pink-100 to-pink-50 border-pink-400"
  },
  {
    title: "6. End with a Conclusion",
    icon: <CheckCircle className="h-6 w-6 text-indigo-500" />,
    points: [
      "Summarize key points.",
      "Restate your thesis in new words.",
      "End with a final thought or advice.",
    ],
    color: "from-indigo-100 to-indigo-50 border-indigo-400"
  },
  {
    title: "7. Proofread & Improve",
    icon: <Lightbulb className="h-6 w-6 text-teal-500" />,
    points: [
      "Check grammar, spelling, and punctuation.",
      "Ensure clarity and logical flow.",
      "Did I stay on topic?",
    ],
    color: "from-teal-100 to-teal-50 border-teal-400"
  },
  {
    title: "8. Writing Tips",
    icon: <ListOrdered className="h-6 w-6 text-orange-500" />,
    points: [
      "Avoid vague words (thing, stuff, a lot).",
      "Use strong verbs and varied sentence types.",
      "Don’t copy – write in your own words.",
      "Stick to your outline.",
    ],
    color: "from-orange-100 to-orange-50 border-orange-400"
  },
];

export default function WritingGuidePage() {
  return (
    <div className="py-10 px-4 min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <div className="flex flex-col items-center gap-2 mb-2">
          <BookOpen className="h-12 w-12 text-blue-600" />
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Essay Writing Guide</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Master the art of essay writing with these step-by-step strategies and tips. Each card below guides you through a key part of the process.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {writingTips.map((tip, idx) => (
          <div
            key={idx}
            className={`rounded-2xl shadow-lg border-l-8 bg-gradient-to-br ${tip.color} p-6 transition-transform hover:scale-[1.025] hover:shadow-2xl flex flex-col gap-2`}
          >
            <div className="flex items-center gap-3 mb-2">
              {tip.icon}
              <h3 className="font-bold text-lg text-gray-900">{tip.title}</h3>
            </div>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-1 pl-2">
              {tip.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
              </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 