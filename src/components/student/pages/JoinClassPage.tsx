'use client';

import { Users, Key, Plus, CheckCircle } from "lucide-react";

export default function JoinClassPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Class</h1>
        <p className="text-gray-600">Join your teacher's class using a class code to access assignments and feedback.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Your Class</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            This feature is coming soon! You'll be able to join your teacher's class 
            using a unique class code.
          </p>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">How it works:</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs">1</span>
                  </div>
                  <span>Get the class code from your teacher</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs">2</span>
                  </div>
                  <span>Enter the code in the field below</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs">3</span>
                  </div>
                  <span>Start receiving assignments and feedback</span>
                </div>
              </div>
            </div>
            
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto">
              <Plus className="h-5 w-5" />
              <span>Join New Class</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 