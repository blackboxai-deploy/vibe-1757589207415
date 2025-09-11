"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CallInterfaceProps {
  isCallActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isVoiceSupported: boolean;
  onStartVoice: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onEndCall: () => void;
  error: string | null;
}

export default function CallInterface({
  isCallActive,
  isListening,
  isSpeaking,
  isVoiceSupported,
  onStartVoice,
  onStopListening,
  onStopSpeaking,
  onEndCall,
  error
}: CallInterfaceProps) {
  const getStatusText = () => {
    if (isSpeaking) return "AI Assistant Speaking...";
    if (isListening) return "Listening...";
    if (isCallActive) return "Call Active - Ready";
    return "Call Ended";
  };

  const getStatusColor = () => {
    if (isSpeaking) return "text-blue-600";
    if (isListening) return "text-green-600";
    if (isCallActive) return "text-teal-600";
    return "text-gray-500";
  };

  const getStatusIcon = () => {
    if (isSpeaking) return "🗣️";
    if (isListening) return "👂";
    if (isCallActive) return "📞";
    return "❌";
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-teal-50">
        <CardTitle className="flex items-center justify-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">🤖</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">SmileCare AI Assistant</h2>
            <p className={`text-lg font-medium ${getStatusColor()}`}>
              {getStatusIcon()} {getStatusText()}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Error Display */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              ⚠️ {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Voice Support Warning */}
        {!isVoiceSupported && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-700">
              🎤 Voice features require a modern browser. You can still use text input below.
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Voice Input Button */}
          {isVoiceSupported && isCallActive && (
            <Button
              onClick={isListening ? onStopListening : onStartVoice}
              disabled={isSpeaking}
              size="lg"
              className={`px-6 py-3 ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <span className="animate-pulse mr-2">🔴</span>
                  Stop Listening
                </>
              ) : (
                <>
                  🎤 Start Speaking
                </>
              )}
            </Button>
          )}

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <Button
              onClick={onStopSpeaking}
              size="lg"
              variant="outline"
              className="px-6 py-3 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              🔇 Stop AI Speaking
            </Button>
          )}

          {/* End Call Button */}
          {isCallActive && (
            <Button
              onClick={onEndCall}
              size="lg"
              variant="destructive"
              className="px-6 py-3"
            >
              📞 End Call
            </Button>
          )}
        </div>

        {/* Visual Feedback */}
        <div className="mt-6">
          {/* Listening Indicator */}
          {isListening && (
            <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-6 bg-green-500 rounded animate-pulse"></div>
                <div className="w-2 h-8 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-6 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-8 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-2 h-6 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-green-700 font-medium">Listening for your voice...</span>
            </div>
          )}

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700 font-medium">AI Assistant is speaking...</span>
            </div>
          )}

          {/* Ready State */}
          {isCallActive && !isListening && !isSpeaking && (
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <span className="text-teal-700 font-medium">
                💬 Ready to help! {isVoiceSupported ? 'Click "Start Speaking" or type below.' : 'Type your message below.'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}