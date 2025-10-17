import React, { useState, useEffect } from 'react';

const MedicalProfile = () => {
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: '',
    allergies: [],
    conditions: [],
    medications: [],
    emergencyNotes: ''
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchMedicalInfo();
  }, []);

  const fetchMedicalInfo = async () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const medInfo = user.medicalInformation || {};
      setMedicalInfo({
        bloodType: medInfo.bloodType || '',
        allergies: Array.isArray(medInfo.allergies) ? medInfo.allergies : [],
        conditions: Array.isArray(medInfo.conditions) ? medInfo.conditions : [],
        medications: Array.isArray(medInfo.medications) ? medInfo.medications : [],
        emergencyNotes: medInfo.emergencyNotes || ''
      });
    }
  } catch (error) {
    console.error('Failed to fetch medical info:', error);
  }
};


  const updateMedicalInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/medical`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(medicalInfo)
      });

      if (response.ok) {
        // Update local storage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.medicalInformation = medicalInfo;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('Failed to update medical info:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalInfo({
        ...medicalInfo,
        allergies: [...medicalInfo.allergies, { name: newAllergy.trim() }]
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    const updatedAllergies = medicalInfo.allergies.filter((_, i) => i !== index);
    setMedicalInfo({ ...medicalInfo, allergies: updatedAllergies });
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setMedicalInfo({
        ...medicalInfo,
        conditions: [...medicalInfo.conditions, { name: newCondition.trim() }]
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index) => {
    const updatedConditions = medicalInfo.conditions.filter((_, i) => i !== index);
    setMedicalInfo({ ...medicalInfo, conditions: updatedConditions });
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedicalInfo({
        ...medicalInfo,
        medications: [...medicalInfo.medications, { name: newMedication.trim() }]
      });
      setNewMedication('');
    }
  };

  const removeMedication = (index) => {
    const updatedMedications = medicalInfo.medications.filter((_, i) => i !== index);
    setMedicalInfo({ ...medicalInfo, medications: updatedMedications });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-8 shadow-2xl shadow-blue-500/20 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Medical Profile</h1>
          <p className="text-gray-300 text-lg">This information helps emergency responders provide better care</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Blood Type */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Blood Type</h3>
              <select
                value={medicalInfo.bloodType}
                onChange={(e) => setMedicalInfo({...medicalInfo, bloodType: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Allergies */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Allergies</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy (e.g., Penicillin, Nuts)"
                  className="flex-1 px-4 py-2 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={addAllergy}
                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {medicalInfo.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                    <span className="text-white">⚠️ {allergy.name}</span>
                    <button
                      onClick={() => removeAllergy(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Medical Conditions */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Medical Conditions</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add condition (e.g., Diabetes, Asthma)"
                  className="flex-1 px-4 py-2 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={addCondition}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {medicalInfo.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                    <span className="text-white">❤️ {condition.name}</span>
                    <button
                      onClick={() => removeCondition(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Current Medications</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Add medication"
                  className="flex-1 px-4 py-2 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={addMedication}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {medicalInfo.medications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                    <span className="text-white">💊 {medication.name}</span>
                    <button
                      onClick={() => removeMedication(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Notes */}
        <div className="mt-8 bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Emergency Notes</h3>
          <textarea
            value={medicalInfo.emergencyNotes}
            onChange={(e) => setMedicalInfo({...medicalInfo, emergencyNotes: e.target.value})}
            placeholder="Any additional information for emergency responders..."
            rows="4"
            className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={updateMedicalInfo}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Medical Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalProfile;