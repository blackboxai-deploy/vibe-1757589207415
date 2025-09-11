"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLeadManager } from "@/lib/leadManager";
import { Lead, Appointment } from "@/types";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    scheduledLeads: 0,
    emergencyLeads: 0,
    totalAppointments: 0,
    todayAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    const leadManager = getLeadManager();
    
    try {
      const allLeads = leadManager.getAllLeads();
      const allAppointments = leadManager.getAllAppointments();
      const statsData = leadManager.getLeadsStats();
      
      setLeads(allLeads);
      setAppointments(allAppointments);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    const leadManager = getLeadManager();
    leadManager.updateLead(leadId, { status: newStatus });
    loadData();
  };

  const exportData = () => {
    const leadManager = getLeadManager();
    const csvData = leadManager.exportToCSV();
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage leads and appointments from the AI voice agent</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={loadData} variant="outline">
              🔄 Refresh
            </Button>
            <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
              📁 Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLeads}</div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.newLeads}</div>
              <div className="text-sm text-gray-600">New Leads</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.contactedLeads}</div>
              <div className="text-sm text-gray-600">Contacted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.scheduledLeads}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.emergencyLeads}</div>
              <div className="text-sm text-gray-600">Emergency</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.totalAppointments}</div>
              <div className="text-sm text-gray-600">Appointments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.todayAppointments}</div>
              <div className="text-sm text-gray-600">Today</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">👥 Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="appointments">📅 Appointments ({appointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-4">
          {leads.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No leads yet</h3>
                <p className="text-gray-600">Leads from the AI voice agent will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{lead.fullName}</span>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </CardTitle>
                      <span className="text-sm text-gray-500">
                        {formatDate(lead.timestamp)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-medium">{lead.contactNumber}</p>
                        {lead.email && <p className="text-sm text-gray-600">{lead.email}</p>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reason for Visit</p>
                        <p className="font-medium">{lead.reasonForVisit}</p>
                        {lead.preferredDate && (
                          <p className="text-sm text-gray-600">
                            Preferred: {lead.preferredDate} {lead.preferredTime && `at ${lead.preferredTime}`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {lead.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{lead.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'contacted')}
                        disabled={lead.status === 'contacted'}
                      >
                        📞 Mark Contacted
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'scheduled')}
                        disabled={lead.status === 'scheduled'}
                      >
                        📅 Mark Scheduled
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, 'closed')}
                      >
                        ✅ Close Lead
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="appointments" className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No appointments yet</h3>
                <p className="text-gray-600">Scheduled appointments will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{appointment.patientName}</span>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </CardTitle>
                      <span className="text-sm text-gray-500">
                        ID: {appointment.id.slice(-8)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-medium">{appointment.contactNumber}</p>
                        {appointment.email && <p className="text-sm text-gray-600">{appointment.email}</p>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Appointment</p>
                        <p className="font-medium">{appointment.appointmentDate}</p>
                        <p className="text-sm text-gray-600">{appointment.appointmentTime} ({appointment.duration} min)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="font-medium">{appointment.serviceType}</p>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}