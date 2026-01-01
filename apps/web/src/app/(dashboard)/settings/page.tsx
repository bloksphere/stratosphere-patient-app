'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user data into form
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update user in localStorage (demo mode)
      const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
      const currentUserEmail = user?.email;

      if (currentUserEmail && demoUsers[currentUserEmail]) {
        // Update the user data
        const updatedUser = {
          ...demoUsers[currentUserEmail],
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          phone: profileForm.phone || undefined,
        };

        // If email changed, update the key
        if (profileForm.email !== currentUserEmail) {
          delete demoUsers[currentUserEmail];
          demoUsers[profileForm.email] = { ...updatedUser, email: profileForm.email };
        } else {
          demoUsers[currentUserEmail] = updatedUser;
        }

        // Save to localStorage
        localStorage.setItem('demo_users', JSON.stringify(demoUsers));

        // Update current user session
        const { password, ...userWithoutPassword } = demoUsers[profileForm.email];
        localStorage.setItem('demo_user', JSON.stringify(userWithoutPassword));

        // Refresh the auth context
        await refreshUser();

        setSuccess('Profile updated successfully!');
      }
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      // Update password in localStorage (demo mode)
      const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
      const currentUserEmail = user?.email;

      if (currentUserEmail && demoUsers[currentUserEmail]) {
        // Verify current password
        if (demoUsers[currentUserEmail].password !== passwordForm.currentPassword) {
          setError('Current password is incorrect');
          setLoading(false);
          return;
        }

        // Update password
        demoUsers[currentUserEmail].password = passwordForm.newPassword;
        localStorage.setItem('demo_users', JSON.stringify(demoUsers));

        // Clear form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        setSuccess('Password changed successfully!');
      }
    } catch {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'appearance', name: 'Appearance' },
    { id: 'security', name: 'Security' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'privacy', name: 'Privacy' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account, privacy, and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="+880 1XXX-XXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-main)' }}>Appearance</h2>
          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-main)' }}>Theme</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Theme */}
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    theme === 'light' ? 'border-primary-500 ring-2 ring-primary-200' : ''
                  }`}
                  style={{
                    backgroundColor: theme === 'light' ? 'var(--primary-light)' : 'var(--bg-main)',
                    borderColor: theme === 'light' ? 'var(--primary)' : 'var(--border)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>Light</span>
                  </div>
                  <div className="h-16 rounded-lg bg-white border border-gray-200 p-2">
                    <div className="h-2 w-16 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-gray-100 rounded"></div>
                  </div>
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    theme === 'dark' ? 'border-primary-500 ring-2 ring-primary-200' : ''
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--primary-light)' : 'var(--bg-main)',
                    borderColor: theme === 'dark' ? 'var(--primary)' : 'var(--border)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>Dark</span>
                  </div>
                  <div className="h-16 rounded-lg bg-gray-800 border border-gray-700 p-2">
                    <div className="h-2 w-16 bg-gray-600 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-gray-700 rounded"></div>
                  </div>
                </button>

                {/* System Theme - future enhancement */}
                <button
                  disabled
                  className="p-4 rounded-xl border-2 opacity-50 cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-800 border border-gray-300 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-muted)' }}>System</span>
                  </div>
                  <div className="h-16 rounded-lg bg-gradient-to-r from-white to-gray-800 p-2">
                    <div className="h-2 w-16 bg-gray-400 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-gray-500 rounded"></div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Coming soon</p>
                </button>
              </div>
            </div>

            {/* Current Theme Info */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399 0%, #047857 100%)' }}>
                  {theme === 'light' ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-main)' }}>
                    Currently using {theme === 'light' ? 'Light' : 'Dark'} mode
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Your preference is saved automatically
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-600 text-sm mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Enable 2FA
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your appointments and health</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive appointment reminders via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Medication Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to take your medications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Marketing Communications</p>
                <p className="text-sm text-gray-500">Receive news and updates from Stratosphere</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Data & Privacy</h2>
            <p className="text-gray-600 text-sm mb-6">
              Manage how your data is used and stored. You have full control over your personal information.
            </p>

            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Download My Data</p>
                  <p className="text-sm text-gray-500">Get a copy of all your data</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">View Consent History</p>
                  <p className="text-sm text-gray-500">See what you have agreed to</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Audit Log</p>
                  <p className="text-sm text-gray-500">See who accessed your data</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-red-700 text-sm mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
