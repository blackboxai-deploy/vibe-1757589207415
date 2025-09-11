import { ConversationStep, ConversationMessage, Lead, VoiceAgentState } from "@/types";
import { getAnswerForQuestion, serviceTypes } from "./clinicData";
import { getLeadManager } from "./leadManager";

export class VoiceAgent {
  private state: VoiceAgentState;
  private leadManager = getLeadManager();

  constructor() {
    this.state = {
      isListening: false,
      isSpeaking: false,
      isCallActive: false,
      currentStep: 'greeting',
      collectedData: {},
      conversation: []
    };
  }

  public getState(): VoiceAgentState {
    return { ...this.state };
  }

  public startCall(): string {
    this.state.isCallActive = true;
    this.state.currentStep = 'greeting';
    this.state.collectedData = {};
    this.state.conversation = [];

    const greeting = "Hello! Welcome to SmileCare Dental. I'm your AI dental assistant, and I'm here to help you schedule appointments, answer questions about our services, or assist with any dental concerns you may have. How can I help you today?";
    
    this.addMessage('agent', greeting, false);
    return greeting;
  }

  public processUserInput(input: string, isVoice: boolean = false): string {
    this.addMessage('user', input, isVoice);

    // Check for emergency keywords first
    if (this.isEmergency(input)) {
      this.state.collectedData.priority = 'emergency';
      return this.handleEmergency();
    }

    // Check if user wants to end call
    if (this.isEndCall(input)) {
      return this.endCall();
    }

    // Check if it's a FAQ question
    const faqAnswer = getAnswerForQuestion(input);
    if (faqAnswer && this.state.currentStep === 'greeting') {
      const response = `${faqAnswer.answer} Is there anything else I can help you with, or would you like to schedule an appointment?`;
      this.addMessage('agent', response, false);
      return response;
    }

    // Process based on current conversation step
    return this.processCurrentStep(input);
  }

  private processCurrentStep(input: string): string {
    switch (this.state.currentStep) {
      case 'greeting':
        return this.handleGreeting(input);
      case 'collecting_name':
        return this.handleNameCollection(input);
      case 'collecting_phone':
        return this.handlePhoneCollection(input);
      case 'collecting_email':
        return this.handleEmailCollection(input);
      case 'collecting_reason':
        return this.handleReasonCollection(input);
      case 'scheduling_appointment':
        return this.handleAppointmentScheduling(input);
      case 'transferring':
        return this.handleTransfer();
      default:
        return this.handleDefault();
    }
  }

  private handleGreeting(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Check for appointment scheduling intent
    if (lowerInput.includes('appointment') || lowerInput.includes('schedule') || lowerInput.includes('book')) {
      this.state.currentStep = 'collecting_name';
      const response = "I'd be happy to help you schedule an appointment! Let me collect some information from you. First, could you please tell me your full name?";
      this.addMessage('agent', response, false);
      return response;
    }

    // Check for general inquiry
    if (lowerInput.includes('question') || lowerInput.includes('ask') || lowerInput.includes('information')) {
      const response = "I'd be happy to answer any questions you have about our dental services, hours, location, insurance, or anything else. What would you like to know?";
      this.addMessage('agent', response, false);
      return response;
    }

    // Default to appointment scheduling
    this.state.currentStep = 'collecting_name';
    const response = "Great! I can help you with that. Let me start by collecting some basic information to assist you better. Could you please tell me your full name?";
    this.addMessage('agent', response, false);
    return response;
  }

  private handleNameCollection(input: string): string {
    if (this.isValidName(input)) {
      this.state.collectedData.fullName = this.cleanName(input);
      this.state.currentStep = 'collecting_phone';
      
      const response = `Thank you, ${this.state.collectedData.fullName}. Now I'll need your contact phone number so we can reach you about your appointment.`;
      this.addMessage('agent', response, false);
      return response;
    } else {
      const response = "I'm sorry, I didn't catch your full name clearly. Could you please repeat your first and last name?";
      this.addMessage('agent', response, false);
      return response;
    }
  }

  private handlePhoneCollection(input: string): string {
    const phoneNumber = this.extractPhoneNumber(input);
    
    if (phoneNumber) {
      this.state.collectedData.contactNumber = phoneNumber;
      this.state.currentStep = 'collecting_email';
      
      const response = "Perfect! And would you like to provide an email address? This is optional, but it helps us send appointment confirmations and reminders.";
      this.addMessage('agent', response, false);
      return response;
    } else {
      const response = "I'm sorry, I didn't catch a valid phone number. Could you please provide your phone number again? You can say the digits or spell it out.";
      this.addMessage('agent', response, false);
      return response;
    }
  }

  private handleEmailCollection(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('no') || lowerInput.includes('skip') || lowerInput.includes('none')) {
      this.state.collectedData.email = undefined;
    } else {
      const email = this.extractEmail(input);
      if (email) {
        this.state.collectedData.email = email;
      }
    }

    this.state.currentStep = 'collecting_reason';
    const response = "Great! Now, what's the reason for your visit? For example, are you looking for a general checkup, cleaning, dealing with tooth pain, interested in cosmetic work, or something else?";
    this.addMessage('agent', response, false);
    return response;
  }

  private handleReasonCollection(input: string): string {
    this.state.collectedData.reasonForVisit = input;
    
    // Check if it's an emergency based on the reason
    if (this.isEmergencyReason(input)) {
      this.state.collectedData.priority = 'urgent';
      const response = "I understand this is urgent. Let me get you scheduled as soon as possible. We have same-day appointments available for urgent dental issues. What day would work best for you - today, tomorrow, or would you prefer to come in immediately if we have an opening?";
      this.state.currentStep = 'scheduling_appointment';
      this.addMessage('agent', response, false);
      return response;
    }

    this.state.currentStep = 'scheduling_appointment';
    const response = `Thank you for that information. Now let's get you scheduled! What day would work best for your ${input.toLowerCase()}? We're open Monday through Friday from 8 AM to 6 PM, and Saturday from 9 AM to 3 PM.`;
    this.addMessage('agent', response, false);
    return response;
  }

  private handleAppointmentScheduling(input: string): string {
    const date = this.extractDate(input);
    const time = this.extractTime(input);

    if (date) {
      this.state.collectedData.preferredDate = date;
      
      if (time) {
        this.state.collectedData.preferredTime = time;
        return this.finalizeAppointment();
      } else {
        const response = `Perfect! I have you down for ${date}. What time would you prefer? We have appointments available throughout the day, typically in 30-minute slots.`;
        this.addMessage('agent', response, false);
        return response;
      }
    } else if (time && this.state.collectedData.preferredDate) {
      this.state.collectedData.preferredTime = time;
      return this.finalizeAppointment();
    } else {
      const response = "I'd be happy to help you find a good time. Could you tell me what day you'd prefer? For example, you could say 'next Tuesday' or 'this Friday' or give me a specific date.";
      this.addMessage('agent', response, false);
      return response;
    }
  }

  private finalizeAppointment(): string {
    // Create the lead
    const lead = this.leadManager.createLead(this.state.collectedData);
    
    // Create appointment
    if (this.state.collectedData.preferredDate && this.state.collectedData.preferredTime) {
      const appointment = this.leadManager.createAppointment(lead.id, {
        patientName: this.state.collectedData.fullName!,
        contactNumber: this.state.collectedData.contactNumber!,
        email: this.state.collectedData.email,
        appointmentDate: this.state.collectedData.preferredDate,
        appointmentTime: this.state.collectedData.preferredTime,
        serviceType: this.state.collectedData.reasonForVisit!,
        duration: 60
      });
    }

    this.state.currentStep = 'closing';
    
    const response = `Excellent! I have all your information and have scheduled your appointment for ${this.state.collectedData.preferredDate} at ${this.state.collectedData.preferredTime}. 

Here's a summary:
- Patient: ${this.state.collectedData.fullName}
- Phone: ${this.state.collectedData.contactNumber}
${this.state.collectedData.email ? `- Email: ${this.state.collectedData.email}` : ''}
- Appointment: ${this.state.collectedData.preferredDate} at ${this.state.collectedData.preferredTime}
- Service: ${this.state.collectedData.reasonForVisit}

Our staff will call you within 24 hours to confirm your appointment. Please arrive 15 minutes early and bring your insurance card and a valid ID. Is there anything else I can help you with today?`;
    
    this.addMessage('agent', response, false);
    return response;
  }

  private handleEmergency(): string {
    const response = "I understand you have a dental emergency. For severe pain, trauma, or urgent issues, please call our 24/7 emergency line immediately at (555) 911-HELP. If this is a life-threatening emergency, please call 911. Would you also like me to collect your information so our emergency team can prepare for your visit?";
    this.addMessage('agent', response, false);
    return response;
  }

  private handleTransfer(): string {
    const response = "I'm connecting you with one of our human receptionists now. They'll be able to assist you further. Please hold the line while I transfer your call. All the information we've discussed will be available to them.";
    this.addMessage('agent', response, false);
    return response;
  }

  private handleDefault(): string {
    const response = "I want to make sure I understand you correctly. Could you please repeat that or let me know how I can help you today?";
    this.addMessage('agent', response, false);
    return response;
  }

  private endCall(): string {
    this.state.isCallActive = false;
    const response = "Thank you for calling SmileCare Dental! Have a wonderful day and we look forward to seeing you soon. Goodbye!";
    this.addMessage('agent', response, false);
    return response;
  }

  // Utility methods
  private addMessage(type: 'user' | 'agent', content: string, isVoice: boolean): void {
    this.state.conversation.push({
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      content,
      isVoice
    });
  }

  private isEmergency(input: string): boolean {
    const emergencyKeywords = ['emergency', 'urgent', 'severe pain', 'bleeding', 'trauma', 'knocked out', 'broken tooth', 'swollen'];
    return emergencyKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isEmergencyReason(reason: string): boolean {
    const urgentReasons = ['pain', 'emergency', 'urgent', 'bleeding', 'swollen', 'trauma', 'broke', 'chipped'];
    return urgentReasons.some(keyword => reason.toLowerCase().includes(keyword));
  }

  private isEndCall(input: string): boolean {
    const endKeywords = ['goodbye', 'bye', 'thanks bye', 'end call', 'hang up', 'that\'s all'];
    return endKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isValidName(input: string): boolean {
    const words = input.trim().split(' ').filter(word => word.length > 0);
    return words.length >= 2 && words.every(word => /^[a-zA-Z]+$/.test(word));
  }

  private cleanName(input: string): string {
    return input.trim().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private extractPhoneNumber(input: string): string | null {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Check if it's a valid phone number length
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
    }
    
    return null;
  }

  private extractEmail(input: string): string | null {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = input.match(emailRegex);
    return match ? match[0] : null;
  }

  private extractDate(input: string): string | null {
    const today = new Date();
    const lowerInput = input.toLowerCase();
    
    // Handle common date phrases
    if (lowerInput.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    
    if (lowerInput.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    if (lowerInput.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }
    
    // Try to extract a specific date pattern
    const dateRegex = /(\d{1,2}\/\d{1,2}\/?\d{0,4}|\d{4}-\d{1,2}-\d{1,2})/;
    const match = input.match(dateRegex);
    if (match) {
      try {
        const date = new Date(match[0]);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Invalid date format
      }
    }
    
    return null;
  }

  private extractTime(input: string): string | null {
    // Look for time patterns like "3pm", "10:30 AM", "2:00"
    const timeRegex = /\b(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s*(?:AM|PM|am|pm)\b|\b(?:[01]?[0-9]|2[0-3]):[0-5][0-9]\b/i;
    const match = input.match(timeRegex);
    return match ? match[0].toUpperCase() : null;
  }

  public getConversation(): ConversationMessage[] {
    return [...this.state.conversation];
  }
}