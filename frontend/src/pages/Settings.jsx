import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      sms: true,
      push: true,
      email: false
    },
    privacy: {
      shareLocation: true,
      shareMedicalInfo: true,
      autoEmergency: true
    },
    preferences: {
      language: 'en',
      theme: 'dark',
      voiceGuidance: true
    }
  });
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      // Load saved settings if available
      if (userObj.settings) {
        setSettings(userObj.settings);
      }
    }
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        // Update local storage
        const userData = localStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          userObj.settings = settings;
          localStorage.setItem('user', JSON.stringify(userObj));
        }
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-8 shadow-2xl shadow-blue-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300 text-lg">Manage your AegisAI preferences and privacy</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notifications Settings */}
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🔔 Notifications</h2>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium capitalize">{key} Notifications</h3>
                    <p className="text-gray-400 text-sm">
                      {key === 'sms' && 'Receive SMS alerts during emergencies'}
                      {key === 'push' && 'Get push notifications on this device'}
                      {key === 'email' && 'Email notifications for emergency updates'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting('notifications', key)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🛡️ Privacy & Safety</h2>
            <div className="space-y-4">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">
                      {key === 'shareLocation' && 'Share Location'}
                      {key === 'shareMedicalInfo' && 'Share Medical Info'}
                      {key === 'autoEmergency' && 'Auto Emergency Detection'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {key === 'shareLocation' && 'Share your location with emergency contacts'}
                      {key === 'shareMedicalInfo' && 'Share medical information with responders'}
                      {key === 'autoEmergency' && 'Automatically detect emergency situations'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSetting('privacy', key)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">⚙️ Preferences</h2>
            <div className="space-y-4">
              {/* Language */}
              <div>
                <label className="block text-white font-medium mb-2">Language</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-white font-medium mb-2">Theme</label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              {/* Voice Guidance */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Voice Guidance</h3>
                  <p className="text-gray-400 text-sm">Audio instructions during emergencies</p>
                </div>
                <button
                  onClick={() => toggleSetting('preferences', 'voiceGuidance')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.preferences.voiceGuidance ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                      settings.preferences.voiceGuidance ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">👤 Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name</label>
                <p className="text-white text-lg">{user.name}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email</label>
                <p className="text-white text-lg">{user.email}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Phone</label>
                <p className="text-white text-lg">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Member Since</label>
                <p className="text-white text-lg">
                  {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;