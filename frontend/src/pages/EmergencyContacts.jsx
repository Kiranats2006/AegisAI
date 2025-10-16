import React, { useState, useEffect } from 'react';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    priority: 'medium'
  });

  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({ name: '', phone: '', relationship: '', priority: 'medium' });
        fetchContacts();
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId) => {
    try {
      await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-8 shadow-2xl shadow-blue-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Emergency Contacts</h1>
              <p className="text-gray-300 text-lg">Manage your trusted emergency contacts</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              + Add Contact
            </button>
          </div>
        </div>

        {/* Add Contact Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl border-2 border-gray-700 p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold text-white mb-4">Add Emergency Contact</h3>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Family, Friend, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Contact'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, index) => (
            <div key={contact._id} className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{contact.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contact.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      contact.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {contact.priority} priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteContact(contact._id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  🗑️
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <span>📞</span>
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>👥</span>
                  <span>{contact.relationship}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                  Test Call
                </button>
              </div>
            </div>
          ))}
        </div>

        {contacts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Emergency Contacts</h3>
            <p className="text-gray-400 mb-6">Add your trusted contacts to be notified during emergencies</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Add Your First Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContacts;