import React, { useState, useEffect } from 'react';

export default function EmergencyContacts() {
    const [contacts, setContacts] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aegisai-9xwi.onrender.com';
    const token = localStorage.getItem('token');

    // Fetch contacts from backend
    const fetchContacts = async () => {
        try {
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            const response = await fetch(`${API_BASE_URL}/api/emergencies?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setContacts(result.data);
                } else if (Array.isArray(result)) {
                    setContacts(result);
                }
            } else {
                setContacts([]);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            setContacts([]);
        }
    };

    // Add a new contact
    const handleAddContact = async (e) => {
        e.preventDefault();
        try {
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            const response = await fetch(`${API_BASE_URL}/api/emergencies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, userId })
            });

            if (response.ok) {
                setFormData({ name: '', phone: '' });
                fetchContacts();
            } else {
                console.error('Failed to add contact');
            }
        } catch (error) {
            console.error('Failed to add contact:', error);
        }
    };

    // Delete a contact
    const deleteContact = async (contactId) => {
        try {
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            await fetch(`${API_BASE_URL}/api/emergencies/${contactId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            fetchContacts();
        } catch (error) {
            console.error('Failed to delete contact:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Emergency Contacts</h1>

            {/* Add Contact Form */}
            <form onSubmit={handleAddContact} className="mb-6 flex gap-2">
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="p-2 border rounded w-1/2"
                    required
                />
                <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="p-2 border rounded w-1/2"
                    required
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Add
                </button>
            </form>

            {/* Contacts List */}
            {contacts.length === 0 ? (
                <p className="text-gray-500">No contacts available.</p>
            ) : (
                <ul className="space-y-2">
                    {contacts.map((contact) => (
                        <li key={contact._id} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                            <span className="text-white">{contact.name} - {contact.phone}</span>
                            <button
                                onClick={() => deleteContact(contact._id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
