import { NextRequest, NextResponse } from 'next/server';
import { getLeadManager } from '@/lib/leadManager';


export async function GET() {
  try {
    const leadManager = getLeadManager();
    const leads = leadManager.getAllLeads();
    const stats = leadManager.getLeadsStats();
    
    return NextResponse.json({
      success: true,
      data: {
        leads,
        stats
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leadManager = getLeadManager();
    
    // Validate required fields
    if (!body.fullName || !body.contactNumber || !body.reasonForVisit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const lead = leadManager.createLead(body);
    
    return NextResponse.json({
      success: true,
      data: lead
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const leadManager = getLeadManager();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    const updatedLead = leadManager.updateLead(body.id, body);
    
    if (!updatedLead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedLead
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    const leadManager = getLeadManager();
    const success = leadManager.deleteLead(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}