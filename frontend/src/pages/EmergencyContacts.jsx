import React, { useState, useEffect } from 'react';

export default function EmergencyContacts() {
    const [contacts, setContacts] = useState([]);
    const [formData, setFormData] = useState({ 
        name: '', 
        phone: '', 
        email: '',
        relationship: 'family',
        priority: 3,
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aegisai-9xwi.onrender.com';
    const token = localStorage.getItem('token');

    // Fetch contacts from backend
    const fetchContacts = async () => {
        try {
            setLoading(true);
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            if (!userId) {
                console.error('No user ID found');
                setContacts([]);
                return;
            }

            console.log("Fetching contacts for user:", userId);

            const response = await fetch(`${API_BASE_URL}/api/emergencies?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            console.log("Contacts API response:", result);

            if (response.ok && result.success) {
                setContacts(result.data || []);
            } else {
                console.error('Failed to fetch contacts:', result.message);
                setContacts([]);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    // Add a new contact
    const handleAddContact = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            if (!userId) {
                alert('User not found. Please login again.');
                return;
            }

            // ✅ All required fields for backend
            const contactData = {
                userId: userId,
                name: formData.name,
                phone: formData.phone,
                relationship: formData.relationship,
                email: formData.email || '',
                priority: parseInt(formData.priority) || 3,
                notes: formData.notes || ''
            };

            console.log("Sending contact data:", contactData);

            const response = await fetch(`${API_BASE_URL}/api/emergencies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(contactData)
            });

            const result = await response.json();
            console.log("Add contact response:", result);

            if (response.ok && result.success) {
                setFormData({ 
                    name: '', 
                    phone: '', 
                    email: '',
                    relationship: 'family',
                    priority: 3,
                    notes: ''
                });
                fetchContacts();
                alert("✅ Contact added successfully!");
            } else {
                console.error('Failed to add contact:', result.message);
                alert(`❌ Failed to add contact: ${result.message}`);
            }
        } catch (error) {
            console.error('Failed to add contact:', error);
            alert('❌ Failed to add contact. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete a contact
    const deleteContact = async (contactId) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) {
            return;
        }

        try {
            setLoading(true);
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            if (!userId) {
                alert('User not found. Please login again.');
                return;
            }

            console.log("Deleting contact:", contactId, "for user:", userId);

            const response = await fetch(`${API_BASE_URL}/api/emergencies/${contactId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            const result = await response.json();
            console.log("Delete contact response:", result);

            if (response.ok && result.success) {
                fetchContacts();
                alert("✅ Contact deleted successfully!");
            } else {
                console.error('Failed to delete contact:', result.message);
                alert(`❌ Failed to delete contact: ${result.message}`);
            }
        } catch (error) {
            console.error('Failed to delete contact:', error);
            alert('❌ Failed to delete contact. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Update contact
    const updateContact = async (contactId, updatedData) => {
        try {
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            const response = await fetch(`${API_BASE_URL}/api/emergencies/${contactId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userId,
                    ...updatedData
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                fetchContacts();
                alert("✅ Contact updated successfully!");
            } else {
                alert(`❌ Failed to update contact: ${result.message}`);
            }
        } catch (error) {
            console.error('Failed to update contact:', error);
            alert('❌ Failed to update contact. Please try again.');
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-8 shadow-2xl shadow-blue-500/20 mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Emergency Contacts</h1>
                    <p className="text-gray-300 text-lg">Manage your emergency contact list</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Add Contact Form */}
                    <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Add New Contact</h2>
                        
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Relationship *
                                    </label>
                                    <select
                                        value={formData.relationship}
                                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="family">Family</option>
                                        <option value="friend">Friend</option>
                                        <option value="colleague">Colleague</option>
                                        <option value="neighbor">Neighbor</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="1">High (1)</option>
                                        <option value="2">Medium (2)</option>
                                        <option value="3">Low (3)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Notes
                                </label>
                                <textarea
                                    placeholder="Additional notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                {loading ? 'Adding Contact...' : 'Add Emergency Contact'}
                            </button>
                        </form>
                    </div>

                    {/* Contacts List */}
                    <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Your Contacts</h2>
                            <button 
                                onClick={fetchContacts}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-colors"
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="text-white">Loading contacts...</div>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">📞</div>
                                <h3 className="text-xl font-bold text-white mb-2">No Emergency Contacts</h3>
                                <p className="text-gray-400">Add your first emergency contact to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {contacts.map((contact) => (
                                    <div key={contact._id} className="bg-gray-800/50 rounded-xl border border-gray-700/80 p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-white font-bold text-lg">{contact.name}</h3>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        contact.priority === 1 ? 'bg-red-500/20 text-red-400' :
                                                        contact.priority === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-green-500/20 text-green-400'
                                                    }`}>
                                                        {contact.priority === 1 ? 'High' : contact.priority === 2 ? 'Medium' : 'Low'}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-1 text-sm text-gray-300">
                                                    <p>📱 {contact.phone}</p>
                                                    {contact.email && <p>📧 {contact.email}</p>}
                                                    <p>👥 {contact.relationship}</p>
                                                    {contact.notes && <p>📝 {contact.notes}</p>}
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => deleteContact(contact._id)}
                                                disabled={loading}
                                                className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}