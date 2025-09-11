import { NextRequest, NextResponse } from 'next/server';
import { getLeadManager } from '@/lib/leadManager';

export async function GET() {
  try {
    const leadManager = getLeadManager();
    const appointments = leadManager.getAllAppointments();
    
    return NextResponse.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leadManager = getLeadManager();
    
    // Validate required fields
    if (!body.leadId || !body.patientName || !body.contactNumber || 
        !body.appointmentDate || !body.appointmentTime || !body.serviceType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if time slot is available
    const isAvailable = leadManager.isTimeSlotAvailable(
      body.appointmentDate, 
      body.appointmentTime, 
      body.duration || 60
    );
    
    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Time slot is not available' },
        { status: 409 }
      );
    }
    
    const appointment = leadManager.createAppointment(body.leadId, body);
    
    return NextResponse.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// Get available time slots for a specific date
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const leadManager = getLeadManager();
    
    if (!body.date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }
    
    const availableSlots = leadManager.getAvailableSlots(body.date);
    
    return NextResponse.json({
      success: true,
      data: {
        date: body.date,
        availableSlots
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get available slots' },
      { status: 500 }
    );
  }
}