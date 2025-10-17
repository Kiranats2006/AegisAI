import React, { useState, useEffect } from 'react';

const EmergencyHistory = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Add this helper function to fix location display
  const getLocationDisplay = (location) => {
    if (!location) return 'Location not available';
    
    if (typeof location.address === 'string') {
      return location.address;
    }
    
    if (location.address && typeof location.address === 'object') {
      const addr = location.address;
      // Return a formatted string instead of the object
      return [addr.street, addr.city, addr.state, addr.country]
        .filter(part => part && part.trim())
        .join(', ') || 'Location available';
    }
    
    return 'Location data available';
  };

  useEffect(() => {
    fetchEmergencyHistory();
  }, []);

  const fetchEmergencyHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      if (!userId || !token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      console.log("Fetching emergency history for user:", userId);
      
      const response = await fetch(`${API_BASE_URL}/api/emergency/history?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.success) {
        const emergencyData = result.data || [];
        setEmergencies(emergencyData);
        console.log("Emergencies set:", emergencyData.length);
      } else {
        setEmergencies([]);
        setError(result.message || "Failed to load emergency history");
      }
    } catch (error) {
      console.error('Failed to fetch emergency history:', error);
      setError(error.message);
      setEmergencies([]);
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
      general: '🚨',
      police: '👮',
      natural_disaster: '🌪️',
      other: '🚨'
    };
    return icons[type] || '🚨';
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const testEmergencyCreation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          text: "Test emergency - my house is on fire",
          location: {
            coordinates: [77.1025, 28.7041],
            address: {
              street: "Test Street",
              city: "Delhi",
              state: "Delhi",
              country: "India"
            }
          },
          userContext: "Testing emergency creation"
        })
      });
      
      const result = await response.json();
      console.log("Test emergency creation:", result);
      
      if (result.success) {
        alert("Test emergency created successfully!");
        fetchEmergencyHistory(); // Refresh the list
      }
    } catch (error) {
      console.error("Test emergency failed:", error);
    }
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
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400">Error: {error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emergency List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Past Emergencies</h2>
                <button 
                  onClick={fetchEmergencyHistory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              {emergencies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Emergency History</h3>
                  <p className="text-gray-400">Your emergency events will appear here once triggered</p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Make sure you've triggered emergencies through the AI chatbot</p>
                    <p>Check browser console for debugging information</p>
                  </div>
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
                            {getTypeIcon(emergency.emergencyType)}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg capitalize">
                              {emergency.emergencyType?.replace('_', ' ') || 'Emergency'} Emergency
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
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(emergency.status)}`}>
                            {emergency.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            emergency.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            emergency.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            emergency.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {emergency.severity || 'unknown'}
                          </span>
                        </div>
                      </div>
                      
                      {emergency.aiAnalysis && (
                        <div className="mb-3">
                          <p className="text-gray-300 text-sm">
                            <span className="font-medium">AI Confidence: </span>
                            {(emergency.aiAnalysis.confidenceScore * 100).toFixed(1)}% • 
                            <span className="ml-2">{emergency.aiAnalysis.detectedEmergencyType}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          {/* FIXED: Use the helper function for location display */}
                          <span>📍 {getLocationDisplay(emergency.location)}</span>
                        </div>
                        <span>⏱️ {formatDuration(emergency.responseTime)}</span>
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
                        <span className="text-white capitalize">{selectedEmergency.emergencyType?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedEmergency.status)}`}>
                          {selectedEmergency.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Severity:</span>
                        <span className="text-white capitalize">{selectedEmergency.severity}</span>
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
                      {selectedEmergency.responseTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Response Time:</span>
                          <span className="text-white">{formatDuration(selectedEmergency.responseTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={testEmergencyCreation}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                  >
                    Test Emergency
                  </button>

                  {/* AI Analysis */}
                  {selectedEmergency.aiAnalysis && (
                    <div>
                      <h3 className="text-white font-bold mb-3">AI Analysis</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Confidence:</span>
                          <span className="text-white">{(selectedEmergency.aiAnalysis.confidenceScore * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Detected Type:</span>
                          <span className="text-white capitalize">{selectedEmergency.aiAnalysis.detectedEmergencyType?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Assessment:</span>
                          <span className="text-white capitalize">{selectedEmergency.aiAnalysis.riskAssessment}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location - FIXED */}
                  {selectedEmergency.location && (
                    <div>
                      <h3 className="text-white font-bold mb-3">Location</h3>
                      <div className="text-gray-300 bg-gray-800/50 p-3 rounded-lg text-sm">
                        {getLocationDisplay(selectedEmergency.location)}
                      </div>
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {selectedEmergency.resolutionNotes && (
                    <div>
                      <h3 className="text-white font-bold mb-3">Resolution Notes</h3>
                      <p className="text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                        {selectedEmergency.resolutionNotes}
                      </p>
                    </div>
                  )}

                  {/* Instructions */}
                  {selectedEmergency.instructions && selectedEmergency.instructions.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold mb-3">Instructions Given</h3>
                      <div className="space-y-2">
                        {selectedEmergency.instructions.map((instruction, index) => (
                          <div key={index} className="flex items-start gap-2 text-gray-300">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              instruction.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <span className="font-medium">{instruction.stepNumber}. {instruction.title}</span>
                              <p className="text-sm text-gray-400">{instruction.description}</p>
                              {instruction.completed && (
                                <span className="text-xs text-green-400">Completed</span>
                              )}
                            </div>
                          </div>
                        ))}
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