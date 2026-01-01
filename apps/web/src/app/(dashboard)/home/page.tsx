'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HealthReading {
  id: string;
  type: 'bp' | 'glucose' | 'weight';
  value: string;
  systolic?: number;
  diastolic?: number;
  glucose?: number;
  weight?: number;
  timestamp: string;
  notes?: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

type ModalType = 'bp' | 'glucose' | 'weight' | 'appointment' | null;

export default function DashboardHome() {
  const { user, isLoading } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [healthReadings, setHealthReadings] = useState<HealthReading[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Form states
  const [bpForm, setBpForm] = useState({ systolic: '', diastolic: '', notes: '' });
  const [glucoseForm, setGlucoseForm] = useState({ value: '', notes: '' });
  const [weightForm, setWeightForm] = useState({ value: '', notes: '' });
  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    type: 'in-person' as 'in-person' | 'video',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const storedReadings = localStorage.getItem('health_readings');
    const storedAppointments = localStorage.getItem('appointments');
    if (storedReadings) {
      setHealthReadings(JSON.parse(storedReadings));
    }
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
  }, []);

  // Get latest readings
  const getLatestReading = (type: 'bp' | 'glucose' | 'weight') => {
    const readings = healthReadings.filter(r => r.type === type);
    if (readings.length === 0) return null;
    return readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const latestBP = getLatestReading('bp');
  const latestGlucose = getLatestReading('glucose');
  const latestWeight = getLatestReading('weight');

  // Get BP status
  const getBPStatus = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return { label: 'No data', color: 'gray' };
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'green' };
    if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: 'yellow' };
    if (systolic < 140 || diastolic < 90) return { label: 'High Stage 1', color: 'orange' };
    return { label: 'High Stage 2', color: 'red' };
  };

  // Get Glucose status
  const getGlucoseStatus = (value?: number) => {
    if (!value) return { label: 'No data', color: 'gray' };
    if (value < 100) return { label: 'Normal', color: 'green' };
    if (value < 126) return { label: 'Pre-diabetic', color: 'yellow' };
    return { label: 'High', color: 'red' };
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Save BP reading
  const handleSaveBP = () => {
    if (!bpForm.systolic || !bpForm.diastolic) return;
    setSaving(true);

    const newReading: HealthReading = {
      id: crypto.randomUUID(),
      type: 'bp',
      value: `${bpForm.systolic}/${bpForm.diastolic}`,
      systolic: parseInt(bpForm.systolic),
      diastolic: parseInt(bpForm.diastolic),
      timestamp: new Date().toISOString(),
      notes: bpForm.notes || undefined
    };

    const updatedReadings = [...healthReadings, newReading];
    setHealthReadings(updatedReadings);
    localStorage.setItem('health_readings', JSON.stringify(updatedReadings));

    setBpForm({ systolic: '', diastolic: '', notes: '' });
    setSaving(false);
    setActiveModal(null);
  };

  // Save Glucose reading
  const handleSaveGlucose = () => {
    if (!glucoseForm.value) return;
    setSaving(true);

    const newReading: HealthReading = {
      id: crypto.randomUUID(),
      type: 'glucose',
      value: glucoseForm.value,
      glucose: parseInt(glucoseForm.value),
      timestamp: new Date().toISOString(),
      notes: glucoseForm.notes || undefined
    };

    const updatedReadings = [...healthReadings, newReading];
    setHealthReadings(updatedReadings);
    localStorage.setItem('health_readings', JSON.stringify(updatedReadings));

    setGlucoseForm({ value: '', notes: '' });
    setSaving(false);
    setActiveModal(null);
  };

  // Save Weight reading
  const handleSaveWeight = () => {
    if (!weightForm.value) return;
    setSaving(true);

    const newReading: HealthReading = {
      id: crypto.randomUUID(),
      type: 'weight',
      value: weightForm.value,
      weight: parseFloat(weightForm.value),
      timestamp: new Date().toISOString(),
      notes: weightForm.notes || undefined
    };

    const updatedReadings = [...healthReadings, newReading];
    setHealthReadings(updatedReadings);
    localStorage.setItem('health_readings', JSON.stringify(updatedReadings));

    setWeightForm({ value: '', notes: '' });
    setSaving(false);
    setActiveModal(null);
  };

  // Save Appointment
  const handleSaveAppointment = () => {
    if (!appointmentForm.doctorName || !appointmentForm.date || !appointmentForm.time) return;
    setSaving(true);

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      doctorName: appointmentForm.doctorName,
      specialty: appointmentForm.specialty,
      date: appointmentForm.date,
      time: appointmentForm.time,
      type: appointmentForm.type,
      notes: appointmentForm.notes || undefined,
      status: 'scheduled'
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    setAppointmentForm({ doctorName: '', specialty: '', date: '', time: '', type: 'in-person', notes: '' });
    setSaving(false);
    setActiveModal(null);
  };

  // Get weight change
  const getWeightChange = () => {
    const weightReadings = healthReadings.filter(r => r.type === 'weight').sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (weightReadings.length < 2) return null;
    const change = (weightReadings[0].weight || 0) - (weightReadings[1].weight || 0);
    return change;
  };

  const weightChange = getWeightChange();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const firstName = user?.first_name || 'there';
  const bpStatus = getBPStatus(latestBP?.systolic, latestBP?.diastolic);
  const glucoseStatus = getGlucoseStatus(latestGlucose?.glucose);

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(a => a.status === 'scheduled' && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
        <p className="text-gray-600">Here is an overview of your health</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveModal('bp')}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-red-600 text-xl">BP</span>
          </div>
          <span className="font-medium text-gray-900">Log BP</span>
        </button>
        <button
          onClick={() => setActiveModal('glucose')}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-blue-600 text-xl">G</span>
          </div>
          <span className="font-medium text-gray-900">Log Glucose</span>
        </button>
        <button
          onClick={() => setActiveModal('weight')}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-green-600 text-xl">W</span>
          </div>
          <span className="font-medium text-gray-900">Log Weight</span>
        </button>
        <button
          onClick={() => setActiveModal('appointment')}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-purple-600 text-xl">A</span>
          </div>
          <span className="font-medium text-gray-900">Book Appt</span>
        </button>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Blood Pressure</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              bpStatus.color === 'green' ? 'text-green-600 bg-green-50' :
              bpStatus.color === 'yellow' ? 'text-yellow-600 bg-yellow-50' :
              bpStatus.color === 'orange' ? 'text-orange-600 bg-orange-50' :
              bpStatus.color === 'red' ? 'text-red-600 bg-red-50' :
              'text-gray-600 bg-gray-50'
            }`}>{bpStatus.label}</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
            </span>
            <span className="ml-2 text-sm text-gray-500">mmHg</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {latestBP ? `Last reading: ${formatTimestamp(latestBP.timestamp)}` : 'No readings yet'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Blood Glucose</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              glucoseStatus.color === 'green' ? 'text-green-600 bg-green-50' :
              glucoseStatus.color === 'yellow' ? 'text-yellow-600 bg-yellow-50' :
              glucoseStatus.color === 'red' ? 'text-red-600 bg-red-50' :
              'text-gray-600 bg-gray-50'
            }`}>{glucoseStatus.label}</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {latestGlucose ? latestGlucose.glucose : '--'}
            </span>
            <span className="ml-2 text-sm text-gray-500">mg/dL</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {latestGlucose ? `Last reading: ${formatTimestamp(latestGlucose.timestamp)}` : 'No readings yet'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Weight</h3>
            {weightChange !== null && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                weightChange < 0 ? 'text-green-600 bg-green-50' :
                weightChange > 0 ? 'text-orange-600 bg-orange-50' :
                'text-gray-600 bg-gray-50'
              }`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </span>
            )}
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {latestWeight ? latestWeight.weight?.toFixed(1) : '--'}
            </span>
            <span className="ml-2 text-sm text-gray-500">kg</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {latestWeight ? `Last reading: ${formatTimestamp(latestWeight.timestamp)}` : 'No readings yet'}
          </p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    apt.type === 'video' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {apt.type === 'video' ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.doctorName}</p>
                    <p className="text-sm text-gray-500">{apt.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500">{apt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BP Modal */}
      {activeModal === 'bp' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Log Blood Pressure</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Systolic (top)</label>
                  <input
                    type="number"
                    value={bpForm.systolic}
                    onChange={(e) => setBpForm({ ...bpForm, systolic: e.target.value })}
                    placeholder="120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic (bottom)</label>
                  <input
                    type="number"
                    value={bpForm.diastolic}
                    onChange={(e) => setBpForm({ ...bpForm, diastolic: e.target.value })}
                    placeholder="80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={bpForm.notes}
                  onChange={(e) => setBpForm({ ...bpForm, notes: e.target.value })}
                  placeholder="After exercise, before medication, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBP}
                  disabled={!bpForm.systolic || !bpForm.diastolic || saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glucose Modal */}
      {activeModal === 'glucose' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Log Blood Glucose</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Glucose Level</label>
                <div className="relative">
                  <input
                    type="number"
                    value={glucoseForm.value}
                    onChange={(e) => setGlucoseForm({ ...glucoseForm, value: e.target.value })}
                    placeholder="98"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">mg/dL</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={glucoseForm.notes}
                  onChange={(e) => setGlucoseForm({ ...glucoseForm, notes: e.target.value })}
                  placeholder="Fasting, after meal, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGlucose}
                  disabled={!glucoseForm.value || saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {activeModal === 'weight' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Log Weight</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={weightForm.value}
                    onChange={(e) => setWeightForm({ ...weightForm, value: e.target.value })}
                    placeholder="72.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                  placeholder="Morning weight, after workout, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWeight}
                  disabled={!weightForm.value || saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {activeModal === 'appointment' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={appointmentForm.doctorName}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select
                  value={appointmentForm.specialty}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select specialty</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Endocrinologist">Endocrinologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedist">Orthopedist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appointmentType"
                      value="in-person"
                      checked={appointmentForm.type === 'in-person'}
                      onChange={() => setAppointmentForm({ ...appointmentForm, type: 'in-person' })}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">In-person</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appointmentType"
                      value="video"
                      checked={appointmentForm.type === 'video'}
                      onChange={() => setAppointmentForm({ ...appointmentForm, type: 'video' })}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Video call</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                  placeholder="Reason for visit, symptoms, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAppointment}
                  disabled={!appointmentForm.doctorName || !appointmentForm.date || !appointmentForm.time || saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
