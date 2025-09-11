"use client";

import { useState, useEffect } from "react";
import VoiceAgent from "@/components/VoiceAgent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAgentReady, setIsAgentReady] = useState(false);

  useEffect(() => {
    // Check for Web Speech API support
    if (typeof window !== "undefined") {
      const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const hasSpeechSynthesis = 'speechSynthesis' in window;
      setIsAgentReady(hasWebSpeech && hasSpeechSynthesis);
    }
  }, []);

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to SmileCare Dental
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your AI dental assistant is here to help you schedule appointments, answer questions, and provide information about our services.
          </p>
          
          {!isAgentReady && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                ⚠️ Voice features require a modern browser with Web Speech API support. 
                You can still use our text-based interface.
              </p>
            </div>
          )}
        </div>

        {/* Call Interface */}
        {!isCallActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Start Call Section */}
            <Card className="p-8 text-center border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Start Voice Call</h2>
                <p className="text-gray-600 mb-6">
                  Speak with our AI assistant to schedule appointments, ask questions, and get help with your dental needs.
                </p>
              </div>
              <Button 
                onClick={handleStartCall}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 text-lg"
              >
                📞 Start Call Now
              </Button>
            </Card>

            {/* Quick Info Section */}
            <Card className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">What Our AI Assistant Can Help With:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">📅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Schedule Appointments</h4>
                    <p className="text-gray-600 text-sm">Book cleanings, checkups, consultations, and emergency visits</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">❓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Answer Questions</h4>
                    <p className="text-gray-600 text-sm">Get info about services, hours, location, and insurance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm">🚨</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Emergency Support</h4>
                    <p className="text-gray-600 text-sm">Immediate assistance for dental emergencies</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm">👥</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Human Transfer</h4>
                    <p className="text-gray-600 text-sm">Connect with our staff when needed</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <VoiceAgent onEndCall={handleEndCall} />
          </div>
        )}

        {/* Quick Access Info */}
        {!isCallActive && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-2">📍 Location</h4>
              <p className="text-gray-600 text-sm">123 Dental Avenue<br />Smile City, SC 12345</p>
            </Card>
            <Card className="p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-2">🕒 Hours</h4>
              <p className="text-gray-600 text-sm">Mon-Fri: 8AM-6PM<br />Sat: 9AM-3PM<br />Emergency: 24/7</p>
            </Card>
            <Card className="p-6 text-center">
              <h4 className="font-bold text-gray-800 mb-2">📞 Contact</h4>
              <p className="text-gray-600 text-sm">(555) 123-SMILE<br />emergency@smilecare.com</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}