"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { VoiceAgent as VoiceAgentCore } from "@/lib/voiceAgent";
import { getSpeechService } from "@/lib/speechService";
import { ConversationMessage } from "@/types";
import CallInterface from "./CallInterface";
import ConversationDisplay from "./ConversationDisplay";

interface VoiceAgentProps {
  onEndCall: () => void;
}

export default function VoiceAgent({ onEndCall }: VoiceAgentProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const agentRef = useRef<VoiceAgentCore | null>(null);
  const speechServiceRef = useRef(getSpeechService());

  useEffect(() => {
    // Initialize voice agent
    agentRef.current = new VoiceAgentCore();
    
    // Check voice support
    setIsVoiceSupported(speechServiceRef.current.isSupported());
    
    // Start the call automatically
    startCall();
    
    return () => {
      // Cleanup on unmount
      if (speechServiceRef.current) {
        speechServiceRef.current.stopListening();
        speechServiceRef.current.stopSpeaking();
      }
    };
  }, []);

  const startCall = async () => {
    if (!agentRef.current) return;
    
    setIsCallActive(true);
    setError(null);
    
    const greeting = agentRef.current.startCall();
    updateConversation();
    
    // Speak the greeting
    if (isVoiceSupported) {
      await speakText(greeting);
    }
  };

  const handleVoiceInput = () => {
    if (!speechServiceRef.current || isListening || isSpeaking) return;
    
    setIsListening(true);
    setError(null);
    
    speechServiceRef.current.startListening(
      (result: string) => {
        setIsListening(false);
        if (result.trim()) {
          processUserInput(result, true);
        }
      },
      (error: string) => {
        setIsListening(false);
        setError(error);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleTextInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      processUserInput(currentInput, false);
      setCurrentInput("");
    }
  };

  const processUserInput = async (input: string, isVoice: boolean) => {
    if (!agentRef.current || isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = agentRef.current.processUserInput(input, isVoice);
      updateConversation();
      
      // Speak the response if voice is supported
      if (isVoiceSupported && response) {
        await speakText(response);
      }
    } catch (error) {
      setError('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string): Promise<void> => {
    if (!speechServiceRef.current || !text) return;
    
    setIsSpeaking(true);
    
    try {
      await speechServiceRef.current.speak(
        text,
        () => {
          // On start speaking
        },
        () => {
          // On end speaking
          setIsSpeaking(false);
        },
        (error: string) => {
          // On error
          setIsSpeaking(false);
          console.error('Speech synthesis error:', error);
        }
      );
    } catch (error) {
      setIsSpeaking(false);
      console.error('Failed to speak:', error);
    }
  };

  const updateConversation = () => {
    if (agentRef.current) {
      setConversation(agentRef.current.getConversation());
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    
    if (speechServiceRef.current) {
      speechServiceRef.current.stopListening();
      speechServiceRef.current.stopSpeaking();
    }
    
    onEndCall();
  };

  const handleStopListening = () => {
    if (speechServiceRef.current) {
      speechServiceRef.current.stopListening();
    }
    setIsListening(false);
  };

  const handleStopSpeaking = () => {
    if (speechServiceRef.current) {
      speechServiceRef.current.stopSpeaking();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Call Interface */}
      <CallInterface
        isCallActive={isCallActive}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isVoiceSupported={isVoiceSupported}
        onStartVoice={handleVoiceInput}
        onStopListening={handleStopListening}
        onStopSpeaking={handleStopSpeaking}
        onEndCall={handleEndCall}
        error={error}
      />

      {/* Conversation Display */}
      <ConversationDisplay
        conversation={conversation}
        isProcessing={isProcessing}
      />

      {/* Text Input Alternative */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <span>💬</span>
            <span>Type Your Message</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTextInput} className="flex space-x-4">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!currentInput.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : "Send"}
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            You can type your responses here as an alternative to voice input.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => processUserInput("I need to schedule an appointment", false)}
              disabled={isProcessing}
            >
              📅 Schedule Appointment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => processUserInput("What are your hours?", false)}
              disabled={isProcessing}
            >
              🕒 Hours & Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => processUserInput("I have a dental emergency", false)}
              disabled={isProcessing}
            >
              🚨 Emergency Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => processUserInput("What services do you offer?", false)}
              disabled={isProcessing}
            >
              🦷 Services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}