'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardHome() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const firstName = user?.first_name || 'there';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
        <p className="text-gray-600">Here is an overview of your health</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-red-600 text-xl">BP</span>
          </div>
          <span className="font-medium text-gray-900">Log BP</span>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-blue-600 text-xl">G</span>
          </div>
          <span className="font-medium text-gray-900">Log Glucose</span>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-green-600 text-xl">W</span>
          </div>
          <span className="font-medium text-gray-900">Log Weight</span>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow text-left">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <span className="text-purple-600 text-xl">A</span>
          </div>
          <span className="font-medium text-gray-900">Book Appt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Blood Pressure</h3>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Normal</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">120/80</span>
            <span className="ml-2 text-sm text-gray-500">mmHg</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last reading: Today at 9:00 AM</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Blood Glucose</h3>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Normal</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">98</span>
            <span className="ml-2 text-sm text-gray-500">mg/dL</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last reading: Today at 8:00 AM</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Weight</h3>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">-1.5 kg</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">72.5</span>
            <span className="ml-2 text-sm text-gray-500">kg</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Last reading: Yesterday</p>
        </div>
      </div>
    </div>
  );
}
