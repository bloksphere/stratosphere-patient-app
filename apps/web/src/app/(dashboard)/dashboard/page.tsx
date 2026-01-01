'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { healthApi, appointmentApi, messageApi, HealthSummary, Appointment, MessageThread } from '@/lib/api';
import { formatDate, formatDateTime, formatBloodPressure, getBloodPressureStatus, formatRelativeTime } from '@/lib/utils';
import {
  Activity,
  Heart,
  Droplets,
  Scale,
  Calendar,
  MessageSquare,
  Plus,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [healthRes, appointmentsRes, messagesRes] = await Promise.all([
          healthApi.getSummary(),
          appointmentApi.getAppointments({ upcoming_only: true, size: 3 }),
          messageApi.getThreads({ size: 10 }),
        ]);

        setHealthSummary(healthRes.data);
        setUpcomingAppointments(appointmentsRes.data.items);

        // Count unread messages
        const unread = messagesRes.data.items.reduce((sum, thread) => sum + thread.unread_count, 0);
        setUnreadMessages(unread);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    { name: 'Add BP Reading', href: '/health?add=blood_pressure', icon: Heart, color: 'bg-red-100 text-red-600' },
    { name: 'Add Glucose', href: '/health?add=glucose', icon: Droplets, color: 'bg-primary-100 text-primary-600' },
    { name: 'Log Weight', href: '/health?add=weight', icon: Scale, color: 'bg-green-100 text-green-600' },
    { name: 'Book Appointment', href: '/appointments/new', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s an overview of your health status.
        </p>
      </div>

      {/* Alerts */}
      {healthSummary?.alerts && healthSummary.alerts.length > 0 && (
        <div className="space-y-3">
          {healthSummary.alerts.map((alert, index) => (
            <Alert key={index} variant="warning" title="Health Alert">
              {alert}
            </Alert>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.name} href={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex flex-col items-center text-center py-2">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.name}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Health summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Blood Pressure</p>
              {healthSummary?.latest_blood_pressure ? (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatBloodPressure(
                      healthSummary.latest_blood_pressure.value,
                      healthSummary.latest_blood_pressure.value_secondary
                    )}
                  </p>
                  <p className={`text-sm mt-1 ${getBloodPressureStatus(
                    healthSummary.latest_blood_pressure.value,
                    healthSummary.latest_blood_pressure.value_secondary
                  ).color}`}>
                    {getBloodPressureStatus(
                      healthSummary.latest_blood_pressure.value,
                      healthSummary.latest_blood_pressure.value_secondary
                    ).label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(healthSummary.latest_blood_pressure.measured_at)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-2">No readings yet</p>
              )}
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Blood Glucose */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Blood Glucose</p>
              {healthSummary?.latest_glucose ? (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {healthSummary.latest_glucose.value} {healthSummary.latest_glucose.unit}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(healthSummary.latest_glucose.measured_at)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-2">No readings yet</p>
              )}
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>

        {/* Weight */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              {healthSummary?.latest_weight ? (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {healthSummary.latest_weight.value} {healthSummary.latest_weight.unit}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(healthSummary.latest_weight.measured_at)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-2">No readings yet</p>
              )}
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Scale className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Heart Rate */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Heart Rate</p>
              {healthSummary?.latest_heart_rate ? (
                <>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {healthSummary.latest_heart_rate.value} {healthSummary.latest_heart_rate.unit}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(healthSummary.latest_heart_rate.measured_at)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-2">No readings yet</p>
              )}
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <Card>
          <CardHeader
            title="Upcoming Appointments"
            action={
              <Link href="/appointments" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            }
          />
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {appointment.appointment_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appointment.scheduled_at
                            ? formatDateTime(appointment.scheduled_at)
                            : 'Pending confirmation'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Link href="/appointments/new">
                  <Button variant="secondary" size="sm" className="mt-3">
                    Book an appointment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader
            title="Messages"
            action={
              <Link href="/messages" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            }
          />
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {unreadMessages > 0
                      ? `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}`
                      : 'No unread messages'}
                  </p>
                  <p className="text-xs text-gray-500">Contact your healthcare team</p>
                </div>
              </div>
              <Link href="/messages">
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Open
                </Button>
              </Link>
            </div>

            <div className="mt-4">
              <Link href="/messages/new">
                <Button className="w-full" leftIcon={<Plus className="w-4 h-4" />}>
                  New Message
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NHS Link reminder */}
      {!user?.nhs_number && (
        <Alert variant="info" title="Link your NHS number">
          Link your NHS number to access your medical records and receive personalized recommendations from your clinic.
          <Link href="/settings" className="ml-2 font-medium underline">
            Link now
          </Link>
        </Alert>
      )}
    </div>
  );
}
