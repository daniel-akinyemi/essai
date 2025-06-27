'use client';

import { BookOpen, Calendar, CheckCircle, Clock, FileText } from "lucide-react";

export default function AssignmentsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
        <p className="text-gray-600">View and submit assignments from your teachers with AI-powered feedback.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Assignments</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            This feature is coming soon! You'll be able to view assignments from your teachers, 
            submit your work, and receive detailed feedback.
          </p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">Active</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-500">Assignments</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Completed</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-500">Assignments</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Due Soon</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">1</p>
                <p className="text-sm text-gray-500">Assignment</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">What you'll be able to do:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <ul className="space-y-1">
                  <li>• View all assigned work</li>
                  <li>• Submit assignments online</li>
                  <li>• Receive AI feedback</li>
                  <li>• Track due dates</li>
                </ul>
                <ul className="space-y-1">
                  <li>• View teacher comments</li>
                  <li>• Download assignment files</li>
                  <li>• Request extensions</li>
                  <li>• Track grades</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-4">Sample Assignments</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Research Paper on Climate Change</p>
                      <p className="text-sm text-gray-500">English 101 • Due in 3 days</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Pending</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Argumentative Essay</p>
                      <p className="text-sm text-gray-500">Writing Workshop • Due in 1 week</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 