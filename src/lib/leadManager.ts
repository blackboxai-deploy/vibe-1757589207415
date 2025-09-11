import { Lead, Appointment } from "@/types";

export class LeadManager {
  private readonly LEADS_STORAGE_KEY = 'dental_clinic_leads';
  private readonly APPOINTMENTS_STORAGE_KEY = 'dental_clinic_appointments';

  public saveLoad(lead: Lead): void {
    try {
      const existingLeads = this.getAllLeads();
      const updatedLeads = [...existingLeads.filter(l => l.id !== lead.id), lead];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.LEADS_STORAGE_KEY, JSON.stringify(updatedLeads));
      }
    } catch (error) {
      console.error('Failed to save lead:', error);
    }
  }

  public getAllLeads(): Lead[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(this.LEADS_STORAGE_KEY);
      if (!stored) return [];
      
      const leads = JSON.parse(stored) as Lead[];
      // Convert timestamp strings back to Date objects
      return leads.map(lead => ({
        ...lead,
        timestamp: new Date(lead.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load leads:', error);
      return [];
    }
  }

  public getLeadById(id: string): Lead | null {
    const leads = this.getAllLeads();
    return leads.find(lead => lead.id === id) || null;
  }

  public createLead(data: Partial<Lead>): Lead {
    const lead: Lead = {
      id: this.generateId(),
      timestamp: new Date(),
      fullName: data.fullName || '',
      contactNumber: data.contactNumber || '',
      email: data.email || undefined,
      reasonForVisit: data.reasonForVisit || '',
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      notes: data.notes,
      status: 'new',
      priority: data.priority || 'normal'
    };

    this.saveLoad(lead);
    return lead;
  }

  public updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const lead = this.getLeadById(id);
    if (!lead) return null;

    const updatedLead = { ...lead, ...updates };
    this.saveLoad(updatedLead);
    return updatedLead;
  }

  public deleteLead(id: string): boolean {
    try {
      const leads = this.getAllLeads().filter(lead => lead.id !== id);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.LEADS_STORAGE_KEY, JSON.stringify(leads));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete lead:', error);
      return false;
    }
  }

  public saveAppointment(appointment: Appointment): void {
    try {
      const existingAppointments = this.getAllAppointments();
      const updatedAppointments = [
        ...existingAppointments.filter(a => a.id !== appointment.id), 
        appointment
      ];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.APPOINTMENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));
      }
    } catch (error) {
      console.error('Failed to save appointment:', error);
    }
  }

  public getAllAppointments(): Appointment[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(this.APPOINTMENTS_STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored) as Appointment[];
    } catch (error) {
      console.error('Failed to load appointments:', error);
      return [];
    }
  }

  public createAppointment(leadId: string, appointmentData: Partial<Appointment>): Appointment {
    const appointment: Appointment = {
      id: this.generateId(),
      leadId,
      patientName: appointmentData.patientName || '',
      contactNumber: appointmentData.contactNumber || '',
      email: appointmentData.email,
      appointmentDate: appointmentData.appointmentDate || '',
      appointmentTime: appointmentData.appointmentTime || '',
      serviceType: appointmentData.serviceType || '',
      duration: appointmentData.duration || 60,
      status: 'scheduled',
      notes: appointmentData.notes
    };

    this.saveAppointment(appointment);
    return appointment;
  }

  public isTimeSlotAvailable(date: string, time: string, duration: number = 60): boolean {
    const appointments = this.getAllAppointments();
    const requestedStart = new Date(`${date} ${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    return !appointments.some(apt => {
      if (apt.appointmentDate !== date || apt.status === 'cancelled') {
        return false;
      }

      const aptStart = new Date(`${apt.appointmentDate} ${apt.appointmentTime}`);
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);

      // Check for overlap
      return (requestedStart < aptEnd) && (requestedEnd > aptStart);
    });
  }

  public getAvailableSlots(date: string): string[] {
    const workingHours = [
      '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
    ];

    return workingHours.filter(time => this.isTimeSlotAvailable(date, time));
  }

  public exportToCSV(): string {
    const leads = this.getAllLeads();
    const appointments = this.getAllAppointments();

    const csvHeaders = [
      'Lead ID', 'Timestamp', 'Full Name', 'Contact Number', 'Email', 
      'Reason for Visit', 'Preferred Date', 'Preferred Time', 'Status', 
      'Priority', 'Notes', 'Appointment ID', 'Appointment Date', 
      'Appointment Time', 'Service Type', 'Appointment Status'
    ];

    const csvRows = leads.map(lead => {
      const appointment = appointments.find(apt => apt.leadId === lead.id);
      
      return [
        lead.id,
        lead.timestamp.toISOString(),
        `"${lead.fullName}"`,
        lead.contactNumber,
        lead.email || '',
        `"${lead.reasonForVisit}"`,
        lead.preferredDate || '',
        lead.preferredTime || '',
        lead.status,
        lead.priority,
        `"${lead.notes || ''}"`,
        appointment?.id || '',
        appointment?.appointmentDate || '',
        appointment?.appointmentTime || '',
        appointment?.serviceType || '',
        appointment?.status || ''
      ].join(',');
    });

    return [csvHeaders.join(','), ...csvRows].join('\n');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getLeadsStats() {
    const leads = this.getAllLeads();
    const appointments = this.getAllAppointments();
    
    return {
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === 'new').length,
      contactedLeads: leads.filter(l => l.status === 'contacted').length,
      scheduledLeads: leads.filter(l => l.status === 'scheduled').length,
      emergencyLeads: leads.filter(l => l.priority === 'emergency').length,
      totalAppointments: appointments.length,
      todayAppointments: appointments.filter(a => {
        const today = new Date().toISOString().split('T')[0];
        return a.appointmentDate === today;
      }).length
    };
  }
}

// Global instance
let leadManagerInstance: LeadManager | null = null;

export const getLeadManager = (): LeadManager => {
  if (!leadManagerInstance) {
    leadManagerInstance = new LeadManager();
  }
  return leadManagerInstance;
};