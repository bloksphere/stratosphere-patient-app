'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  ReferenceArea
} from 'recharts';

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
  const { theme } = useTheme();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [healthReadings, setHealthReadings] = useState<HealthReading[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Helper to get current date/time in local format
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  // Form states
  const [bpForm, setBpForm] = useState({ systolic: '', diastolic: '', date: getCurrentDate(), time: getCurrentTime(), notes: '' });
  const [glucoseForm, setGlucoseForm] = useState({ value: '', date: getCurrentDate(), time: getCurrentTime(), notes: '' });
  const [weightForm, setWeightForm] = useState({ value: '', date: getCurrentDate(), time: getCurrentTime(), notes: '' });
  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    type: 'in-person' as 'in-person' | 'video',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Set mounted state for client-side rendering of charts
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Get BP status based on NICE Hypertension Guidelines (NG136)
  // https://www.nice.org.uk/guidance/ng136
  const getBPStatus = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return { label: 'No data', color: 'gray', description: '' };

    // NICE Guidelines stages:
    // Normal: <120/80
    // High-normal: 120-129 and/or 80-84
    // Stage 1 hypertension: 140-159 and/or 90-99 (clinic) or 135-149 and/or 85-94 (home/ABPM)
    // Stage 2 hypertension: 160-179 and/or 100-109 (clinic) or 150-179 and/or 95-109 (home/ABPM)
    // Stage 3 (Severe): ≥180 and/or ≥110

    // Using home/self-monitoring thresholds as these are patient-entered readings
    if (systolic < 120 && diastolic < 80) {
      return { label: 'Normal', color: 'green', description: 'Your blood pressure is in the healthy range' };
    }
    if (systolic < 135 && diastolic < 85) {
      return { label: 'High-Normal', color: 'yellow', description: 'Slightly elevated - maintain healthy lifestyle' };
    }
    if (systolic < 150 && diastolic < 95) {
      return { label: 'Stage 1', color: 'orange', description: 'Stage 1 hypertension - consult your doctor' };
    }
    if (systolic < 180 && diastolic < 110) {
      return { label: 'Stage 2', color: 'red', description: 'Stage 2 hypertension - seek medical advice' };
    }
    return { label: 'Stage 3', color: 'red', description: 'Severe hypertension - seek urgent medical attention' };
  };

  // Get Glucose status based on NICE Diabetes Guidelines (NG28)
  // https://www.nice.org.uk/guidance/ng28
  // Using fasting plasma glucose thresholds for self-monitoring
  const getGlucoseStatus = (value?: number) => {
    if (!value) return { label: 'No data', color: 'gray', description: '', target: '' };

    // NICE Guidelines (NG28) - Target ranges for self-monitoring:
    // Fasting: 4-7 mmol/L (for people with diabetes)
    // Non-diabetic normal: <6.0 mmol/L fasting
    // Pre-diabetes (IGT/IFG): 6.0-6.9 mmol/L fasting
    // Diabetes diagnosis threshold: ≥7.0 mmol/L fasting
    // Hypoglycemia: <4.0 mmol/L

    if (value < 4.0) {
      return {
        label: 'Low',
        color: 'red',
        description: 'Hypoglycemia - take fast-acting glucose immediately',
        target: 'Target: 4.0-5.9 mmol/L (fasting)'
      };
    }
    if (value < 6.0) {
      return {
        label: 'Normal',
        color: 'green',
        description: 'Your blood glucose is in the healthy range',
        target: 'Target: 4.0-5.9 mmol/L (fasting)'
      };
    }
    if (value < 7.0) {
      return {
        label: 'Pre-diabetes',
        color: 'yellow',
        description: 'Impaired fasting glucose - lifestyle changes recommended',
        target: 'Target: 4.0-5.9 mmol/L (fasting)'
      };
    }
    if (value < 11.1) {
      return {
        label: 'High',
        color: 'orange',
        description: 'Elevated glucose - consult your healthcare provider',
        target: 'Diabetes target: 4.0-7.0 mmol/L (fasting)'
      };
    }
    return {
      label: 'Very High',
      color: 'red',
      description: 'Significantly elevated - seek medical advice promptly',
      target: 'Diabetes target: 4.0-7.0 mmol/L (fasting)'
    };
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

    // Create timestamp from user-selected date and time
    const timestamp = new Date(`${bpForm.date}T${bpForm.time}`).toISOString();

    const newReading: HealthReading = {
      id: crypto.randomUUID(),
      type: 'bp',
      value: `${bpForm.systolic}/${bpForm.diastolic}`,
      systolic: parseInt(bpForm.systolic),
      diastolic: parseInt(bpForm.diastolic),
      timestamp,
      notes: bpForm.notes || undefined
    };

    const updatedReadings = [...healthReadings, newReading];
    setHealthReadings(updatedReadings);
    localStorage.setItem('health_readings', JSON.stringify(updatedReadings));

    setBpForm({ systolic: '', diastolic: '', date: getCurrentDate(), time: getCurrentTime(), notes: '' });
    setSaving(false);
    setActiveModal(null);
  };

  // Save Glucose reading
  const handleSaveGlucose = () => {
    if (!glucoseForm.value) return;
    setSaving(true);

    // Create timestamp from user-selected date and time
    const timestamp = new Date(`${glucoseForm.date}T${glucoseForm.time}`).toISOString();

    const newReading: HealthReading = {
      id: crypto.randomUUID(),
      type: 'glucose',
      value: glucoseForm.value,
      glucose: parseFloat(glucoseForm.value),
      timestamp,
      notes: glucoseForm.notes || undefined
    };

    const updatedReadings = [...healthReadings, newReading];
    setHealthReadings(updatedReadings);
    localStorage.setItem('health_readings', JSON.stringify(updatedReadings));

    setGlucoseForm({ value: '', date: getCurrentDate(), time: getCurrentTime(), notes: '' });
    setSaving(false);
    setActiveModal(null);
  };

  // Save Weight reading
  const handleSaveWeight = () => {
    if (!weightForm.value) return;
    setSaving(true);

    // Create timestamp from user-selected date and time
    const timestamp = new Date(`${weightForm.date}T${weightForm.time}`).toISOString();

    const newReading: HealthReading = {
      id: crypto.randomUUID(),
      type: 'weight',
      value: weightForm.value,
      weight: parseFloat(weightForm.value),
      timestamp,
      notes: weightForm.notes || undefined
    };

    const updatedReadings = [...healthReadings, newReading];
    setHealthReadings(updatedReadings);
    localStorage.setItem('health_readings', JSON.stringify(updatedReadings));

    setWeightForm({ value: '', date: getCurrentDate(), time: getCurrentTime(), notes: '' });
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
      {/* Quick Actions - Stratosphere EMR Style Gradient Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <button
          onClick={() => setActiveModal('bp')}
          className="p-5 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #fb7185 0%, #be123c 100%)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white/90 text-sm font-medium">Blood Pressure</h3>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <span className="text-white font-bold text-lg">Log BP</span>
        </button>
        <button
          onClick={() => setActiveModal('glucose')}
          className="p-5 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white/90 text-sm font-medium">Blood Glucose</h3>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <span className="text-white font-bold text-lg">Log Glucose</span>
        </button>
        <button
          onClick={() => setActiveModal('weight')}
          className="p-5 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #34d399 0%, #047857 100%)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white/90 text-sm font-medium">Weight</h3>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          <span className="text-white font-bold text-lg">Log Weight</span>
        </button>
        <button
          onClick={() => setActiveModal('appointment')}
          className="p-5 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white/90 text-sm font-medium">Appointments</h3>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <span className="text-white font-bold text-lg">Book Appt</span>
        </button>
      </div>

      {/* Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
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
            <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-gray-900'}`}>
              {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
            </span>
            <span className="ml-2 text-sm text-gray-500">mmHg</span>
          </div>
          {bpStatus.description && (
            <p className={`mt-2 text-xs ${
              bpStatus.color === 'green' ? 'text-green-600' :
              bpStatus.color === 'yellow' ? 'text-yellow-600' :
              bpStatus.color === 'orange' ? 'text-orange-600' :
              bpStatus.color === 'red' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {bpStatus.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {latestBP ? `Last reading: ${formatTimestamp(latestBP.timestamp)}` : 'No readings yet'}
          </p>
          <p className="mt-1 text-xs text-gray-400 italic">Based on NICE Guidelines (NG136)</p>
        </div>

        <div className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Blood Glucose</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              glucoseStatus.color === 'green' ? 'text-green-600 bg-green-50' :
              glucoseStatus.color === 'yellow' ? 'text-yellow-600 bg-yellow-50' :
              glucoseStatus.color === 'orange' ? 'text-orange-600 bg-orange-50' :
              glucoseStatus.color === 'red' ? 'text-red-600 bg-red-50' :
              'text-gray-600 bg-gray-50'
            }`}>{glucoseStatus.label}</span>
          </div>
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-gray-900'}`}>
              {latestGlucose ? latestGlucose.glucose?.toFixed(1) : '--'}
            </span>
            <span className="ml-2 text-sm text-gray-500">mmol/L</span>
          </div>
          {glucoseStatus.description && (
            <p className={`mt-2 text-xs ${
              glucoseStatus.color === 'green' ? 'text-green-600' :
              glucoseStatus.color === 'yellow' ? 'text-yellow-600' :
              glucoseStatus.color === 'orange' ? 'text-orange-600' :
              glucoseStatus.color === 'red' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {glucoseStatus.description}
            </p>
          )}
          {glucoseStatus.target && (
            <p className="mt-1 text-xs text-gray-500">{glucoseStatus.target}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {latestGlucose ? `Last reading: ${formatTimestamp(latestGlucose.timestamp)}` : 'No readings yet'}
          </p>
          <p className="mt-1 text-xs text-gray-400 italic">Based on NICE Guidelines (NG28)</p>
        </div>

        <div className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px]" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
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
            <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-gray-900'}`}>
              {latestWeight ? latestWeight.weight?.toFixed(1) : '--'}
            </span>
            <span className="ml-2 text-sm text-gray-500">kg</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {latestWeight ? `Last reading: ${formatTimestamp(latestWeight.timestamp)}` : 'No readings yet'}
          </p>
        </div>
      </div>

      {/* Health History Graphs */}
      <div className="space-y-6">
        {/* BP History Graph */}
        {isMounted && healthReadings.filter(r => r.type === 'bp').length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Blood Pressure History</h3>
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center">
                  <span className="w-3 h-0.5 bg-red-500 mr-1"></span>
                  Systolic
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-0.5 bg-emerald-500 mr-1"></span>
                  Diastolic
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={healthReadings
                    .filter(r => r.type === 'bp')
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .slice(-14)
                    .map(r => ({
                      date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      systolic: r.systolic,
                      diastolic: r.diastolic
                    }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <YAxis domain={[40, 200]} tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number, name: string) => [
                      `${value} mmHg`,
                      name === 'systolic' ? 'Systolic' : 'Diastolic'
                    ]}
                  />
                  {/* Healthy range shading */}
                  <ReferenceArea y1={90} y2={120} fill="#22c55e" fillOpacity={0.05} />
                  <ReferenceArea y1={60} y2={80} fill="#10b981" fillOpacity={0.05} />
                  {/* NICE Guidelines reference lines - subtle */}
                  <ReferenceLine y={120} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <ReferenceLine y={135} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend below chart */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
              <span className="flex items-center"><span className="w-4 h-0.5 bg-green-500 mr-1.5"></span><span className="text-gray-600">Normal: &lt;120/80</span></span>
              <span className="flex items-center"><span className="w-4 h-0.5 bg-amber-500 mr-1.5"></span><span className="text-gray-600">Stage 1: 135/85</span></span>
            </div>
          </div>
        )}

        {/* Glucose History Graph */}
        {isMounted && healthReadings.filter(r => r.type === 'glucose').length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Blood Glucose History</h3>
              <span className="text-xs text-gray-500">mmol/L</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={healthReadings
                    .filter(r => r.type === 'glucose')
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .slice(-14)
                    .map(r => ({
                      date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      glucose: r.glucose
                    }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <YAxis domain={[0, 15]} tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value.toFixed(1)} mmol/L`, 'Glucose']}
                  />
                  {/* Healthy range shading (4.0-5.9 mmol/L) */}
                  <ReferenceArea y1={4.0} y2={5.9} fill="#22c55e" fillOpacity={0.08} />
                  {/* NICE Guidelines reference lines - subtle */}
                  <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <ReferenceLine y={5.9} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <ReferenceLine y={7.0} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <ReferenceLine y={11.1} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <Line
                    type="monotone"
                    dataKey="glucose"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend below chart */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
              <span className="flex items-center"><span className="w-4 h-0.5 bg-red-500 mr-1.5"></span><span className="text-gray-600">Low: &lt;4.0</span></span>
              <span className="flex items-center"><span className="w-4 h-0.5 bg-green-500 mr-1.5"></span><span className="text-gray-600">Normal: 4.0-5.9</span></span>
              <span className="flex items-center"><span className="w-4 h-0.5 bg-amber-500 mr-1.5"></span><span className="text-gray-600">Pre-diabetes: 7.0</span></span>
              <span className="flex items-center"><span className="w-4 h-0.5 bg-red-500 mr-1.5"></span><span className="text-gray-600">Very High: 11.1+</span></span>
            </div>
          </div>
        )}

        {/* Weight History Graph */}
        {isMounted && healthReadings.filter(r => r.type === 'weight').length > 0 && (
          <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Weight History</h3>
              <span className="text-xs text-gray-500">kg</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={healthReadings
                    .filter(r => r.type === 'weight')
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .slice(-14)
                    .map(r => ({
                      date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      weight: r.weight
                    }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d1d5db" />
                  <YAxis
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fontSize: 11 }}
                    stroke="#d1d5db"
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Track your weight over time. Consistent monitoring helps identify trends.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-main)' }}>Upcoming Appointments</h3>
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    apt.type === 'video' ? 'bg-primary-100' : 'bg-purple-100'
                  }`}>
                    {apt.type === 'video' ? (
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bpForm.date}
                    onChange={(e) => setBpForm({ ...bpForm, date: e.target.value })}
                    max={getCurrentDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={bpForm.time}
                    onChange={(e) => setBpForm({ ...bpForm, time: e.target.value })}
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
                    placeholder="5.5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">mmol/L</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={glucoseForm.date}
                    onChange={(e) => setGlucoseForm({ ...glucoseForm, date: e.target.value })}
                    max={getCurrentDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={glucoseForm.time}
                    onChange={(e) => setGlucoseForm({ ...glucoseForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={weightForm.date}
                    onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
                    max={getCurrentDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={weightForm.time}
                    onChange={(e) => setWeightForm({ ...weightForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
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
