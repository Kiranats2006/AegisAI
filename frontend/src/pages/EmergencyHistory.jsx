import React, { useState, useEffect } from 'react';

const EmergencyHistory = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchEmergencyHistory();
  }, []);

  const fetchEmergencyHistory = async () => {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(`${API_BASE_URL}/api/emergency/history?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // If your backend returns { history: [...] } instead of just [...], use:
      setEmergencies(Array.isArray(data) ? data : Array.isArray(data.history) ? data.history : []);
    }
  } catch (error) {
    console.error('Failed to fetch emergency history:', error);
    setEmergencies([]); // fallback
  } finally {
    setLoading(false);
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'active': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      medical: '🩺',
      fire: '🔥',
      accident: '🚗',
      crime: '👮',
      natural: '🌪️',
      general: '🚨'
    };
    return icons[type] || '🚨';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading emergency history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-8 shadow-2xl shadow-blue-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Emergency History</h1>
          <p className="text-gray-300 text-lg">Review your past emergency events and responses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emergency List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Past Emergencies</h2>
              
              {emergencies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Emergency History</h3>
                  <p className="text-gray-400">Your emergency events will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emergencies.map((emergency) => (
                    <div
                      key={emergency._id}
                      onClick={() => setSelectedEmergency(emergency)}
                      className={`bg-gray-800/50 rounded-2xl border-2 border-gray-700/80 p-6 cursor-pointer hover:border-blue-500/60 hover:shadow-lg transition-all duration-300 ${
                        selectedEmergency?._id === emergency._id ? 'border-blue-500/60 shadow-lg shadow-blue-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getTypeIcon(emergency.type)}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg capitalize">
                              {emergency.type} Emergency
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {new Date(emergency.createdAt).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(emergency.status)}`}>
                          {emergency.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-3 line-clamp-2">
                        {emergency.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>📍 {emergency.location?.address || 'Location not available'}</span>
                        </div>
                        <span>⏱️ {emergency.duration || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">Emergency Details</h2>
              
              {!selectedEmergency ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-400">Select an emergency to view details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-white font-bold mb-3">Emergency Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white capitalize">{selectedEmergency.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedEmergency.status)}`}>
                          {selectedEmergency.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Started:</span>
                        <span className="text-white">
                          {new Date(selectedEmergency.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {selectedEmergency.resolvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Resolved:</span>
                          <span className="text-white">
                            {new Date(selectedEmergency.resolvedAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-white font-bold mb-3">Description</h3>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                      {selectedEmergency.description}
                    </p>
                  </div>

                  {/* Location */}
                  {selectedEmergency.location && (
                    <div>
                      <h3 className="text-white font-bold mb-3">Location</h3>
                      <p className="text-gray-300">
                        {selectedEmergency.location.address || 'Location data available'}
                      </p>
                    </div>
                  )}

                  {/* Actions Taken */}
                  {selectedEmergency.actions && selectedEmergency.actions.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold mb-3">Actions Taken</h3>
                      <div className="space-y-2">
                        {selectedEmergency.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  {selectedEmergency.notifications && (
                    <div>
                      <h3 className="text-white font-bold mb-3">Notifications Sent</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Contacts notified:</span>
                          <span className="text-white">{selectedEmergency.notifications.contacts || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Authorities alerted:</span>
                          <span className="text-white">{selectedEmergency.notifications.authorities ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyHistory;