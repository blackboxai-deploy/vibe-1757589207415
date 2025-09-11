// Core data types for the dental clinic voice agent system

export interface Lead {
  id: string;
  timestamp: Date;
  fullName: string;
  contactNumber: string;
  email?: string;
  reasonForVisit: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  priority: 'normal' | 'urgent' | 'emergency';
}

export interface Appointment {
  id: string;
  leadId: string;
  patientName: string;
  contactNumber: string;
  email?: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  hours: {
    [key: string]: string;
  };
  services: string[];
  insuranceAccepted: string[];
  emergencyHours: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'hours' | 'services' | 'insurance' | 'location' | 'emergency' | 'pricing';
  keywords: string[];
}

export interface ConversationMessage {
  id: string;
  timestamp: Date;
  type: 'user' | 'agent';
  content: string;
  isVoice: boolean;
}

export interface VoiceAgentState {
  isListening: boolean;
  isSpeaking: boolean;
  isCallActive: boolean;
  currentStep: ConversationStep;
  collectedData: Partial<Lead>;
  conversation: ConversationMessage[];
}

export type ConversationStep = 
  | 'greeting'
  | 'collecting_name'
  | 'collecting_phone'
  | 'collecting_email'
  | 'collecting_reason'
  | 'scheduling_appointment'
  | 'answering_faq'
  | 'transferring'
  | 'closing';

export interface SpeechServiceConfig {
  language: string;
  voiceURI?: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface AvailableSlot {
  date: string;
  time: string;
  duration: number;
  serviceType: string;
}