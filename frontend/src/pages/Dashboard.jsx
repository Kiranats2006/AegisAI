import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [location, setLocation] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [user, setUser] = useState(null);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [activeEmergency, setActiveEmergency] = useState(null);
    const [emergencyHistory, setEmergencyHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [medicalInfo, setMedicalInfo] = useState(null);
    const [stats, setStats] = useState({
        emergenciesThisMonth: 0,
        responseTime: '0min',
        contactsReachable: 0
    });
    const [pulse, setPulse] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aegisai-9xwi.onrender.com';
    const navigate = useNavigate();

    // India Emergency Numbers
    const EMERGENCY_NUMBERS = {
        police: '100',
        ambulance: '102',
        fire: '101',
        disaster: '108'
    };

    // Load user data
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const userObj = JSON.parse(userData);
            setUser(userObj);
            setMedicalInfo(userObj?.medicalInformation || null);
            fetchEmergencyContacts();
            fetchEmergencyHistory();
            fetchStats();
            setupNotifications();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Location tracking
    useEffect(() => {
        let watchId;
        if (tracking && navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const newLocation = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    };
                    setLocation(newLocation);
                    setPulse(true);
                    setTimeout(() => setPulse(false), 2000);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [tracking]);

    const fetchEmergencyContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            console.log('Fetching contacts for user:', userId);

            if (!userId) {
                console.error('No user ID found');
                setEmergencyContacts([]);
                return;
            }

            // Your backend uses /api/emergencies for contacts (not /api/contacts)
            const response = await fetch(`${API_BASE_URL}/api/emergencies?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Contacts response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Fetched contacts result:', result);

                // Handle different response structures
                if (result.success && Array.isArray(result.data)) {
                    setEmergencyContacts(result.data);
                } else if (Array.isArray(result)) {
                    setEmergencyContacts(result);
                } else {
                    console.error('Unexpected contacts response format:', result);
                    setEmergencyContacts([]);
                }
            } else {
                console.error('Failed to fetch contacts:', response.status, response.statusText);
                // Set empty array as fallback
                setEmergencyContacts([]);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            // Set empty array as fallback
            setEmergencyContacts([]);
        }
    };

    const fetchEmergencyHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            if (!userId) {
                console.error('No user ID found');
                setEmergencyHistory([]);
                return;
            }

            // Your backend uses /api/emergency/history with userId query parameter
            const response = await fetch(`${API_BASE_URL}/api/emergency/history?userId=${userId}&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('History response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Fetched history result:', result);

                // Handle different response structures
                if (result.success && Array.isArray(result.data)) {
                    setEmergencyHistory(result.data);
                } else if (Array.isArray(result)) {
                    setEmergencyHistory(result);
                } else {
                    console.error('Unexpected history response format:', result);
                    setEmergencyHistory([]);
                }
            } else {
                console.error('Failed to fetch history:', response.status, response.statusText);
                setEmergencyHistory([]);
            }
        } catch (error) {
            console.error('Failed to fetch emergency history:', error);
            setEmergencyHistory([]);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            if (!userId) {
                console.error('No user ID found');
                setStats({
                    emergenciesThisMonth: 0,
                    responseTime: '0min',
                    contactsReachable: emergencyContacts.length
                });
                return;
            }

            // Your backend uses /api/emergency/analytics/stats with userId query parameter
            const response = await fetch(`${API_BASE_URL}/api/emergency/analytics/stats?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Stats response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Fetched stats result:', result);

                if (result.success && result.data) {
                    // Map backend stats to frontend format
                    const backendStats = result.data;
                    setStats({
                        emergenciesThisMonth: backendStats.overview?.totalEmergencies || 0,
                        responseTime: backendStats.overview?.averageResponseTime
                            ? `${Math.round(backendStats.overview.averageResponseTime / 60)}min`
                            : '0min',
                        contactsReachable: emergencyContacts.length
                    });
                } else {
                    console.error('Unexpected stats response format:', result);
                    setStats({
                        emergenciesThisMonth: 0,
                        responseTime: '0min',
                        contactsReachable: emergencyContacts.length
                    });
                }
            } else {
                console.error('Failed to fetch stats:', response.status, response.statusText);
                // Set default stats
                setStats({
                    emergenciesThisMonth: 0,
                    responseTime: '0min',
                    contactsReachable: emergencyContacts.length
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            // Set default stats
            setStats({
                emergenciesThisMonth: 0,
                responseTime: '0min',
                contactsReachable: emergencyContacts.length
            });
        }
    };

    const setupNotifications = () => {
        // Simulate real-time notifications
        const sampleNotifications = [
            { id: 1, type: 'system', message: 'Emergency contacts updated', time: '2 min ago', read: false },
            { id: 2, type: 'alert', message: 'Medical profile incomplete', time: '1 hour ago', read: true },
            { id: 3, type: 'info', message: 'New safety features available', time: '2 hours ago', read: true }
        ];
        setNotifications(sampleNotifications);
    };

    const triggerEmergency = async (type = 'general') => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            const userObj = userData ? JSON.parse(userData) : null;
            const userId = userObj?._id;

            if (!userId) {
                console.error('No user ID found');
                navigate('/chat');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/emergency/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userId,
                    text: `${type} emergency triggered from dashboard`,
                    type: type,
                    location: location,
                    timestamp: new Date().toISOString()
                })
            });

            console.log('Emergency trigger response:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Emergency trigger result:', result);

                if (result.success) {
                    setActiveEmergency(result.data?.emergency);
                }
                // Navigate to emergency chat regardless of API response
                navigate('/chat');
            } else {
                console.error('Failed to trigger emergency:', response.status);
                // Still navigate to chat even if API fails
                navigate('/chat');
            }
        } catch (error) {
            console.error('Failed to trigger emergency:', error);
            // Still navigate to chat even if API fails
            navigate('/chat');
        }
    };

    const callEmergencyNumber = (service) => {
        const number = EMERGENCY_NUMBERS[service];
        window.open(`tel:${number}`, '_self');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-8 shadow-2xl shadow-blue-500/20 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
                            </h1>
                            <p className="text-gray-300 text-lg">Your safety dashboard is active and monitoring</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 lg:mt-0">
                            <div className="flex items-center gap-2 text-green-400">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">System Online</span>
                            </div>
                            <Link
                                to="/settings"
                                className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                            >
                                ⚙️ Settings
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Protection Control Card */}
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6 shadow-2xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Protection Control</h3>
                                    <p className="text-gray-300 mt-1">Monitor and control your safety features</p>
                                </div>
                                <div className="flex items-center gap-4 mt-4 md:mt-0">
                                    <button
                                        onClick={() => setTracking(t => !t)}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                                            tracking
                                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {tracking ? (
                                                <>
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    Stop Protection
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    Start Protection
                                                </>
                                            )}
                                        </div>
                                    </button>
                                    <Link
                                        to="/chat"
                                        className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 border-2 border-gray-600 transition-all duration-300 transform hover:scale-105"
                                    >
                                        🚨 Emergency Chat
                                    </Link>
                                </div>
                            </div>

                            {/* Status Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <div className="text-blue-400 text-sm font-medium">Location Tracking</div>
                                    <div className="text-white text-lg font-bold mt-1">
                                        {tracking ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <div className="text-green-400 text-sm font-medium">Emergency Contacts</div>
                                    <div className="text-white text-lg font-bold mt-1">
                                        {emergencyContacts.length} Configured
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <div className="text-purple-400 text-sm font-medium">Medical Profile</div>
                                    <div className="text-white text-lg font-bold mt-1">
                                        {medicalInfo ? 'Complete' : 'Incomplete'}
                                    </div>
                                </div>
                            </div>

                            {/* Location Display */}
                            <div className="bg-gray-800/30 rounded-xl border-2 border-gray-700/50 p-4">
                                <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
                                    <span className="text-blue-400">📍</span>
                                    Current Location
                                </h4>
                                <div className={`text-lg font-mono transition-all duration-500 ${
                                    pulse ? 'text-blue-400 scale-105' : 'text-gray-300'
                                }`}>
                                    {location
                                        ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                                        : 'Location services disabled'
                                    }
                                </div>
                                {location && (
                                    <div className="text-gray-400 text-sm mt-2">
                                        Accuracy: ±{(location.accuracy || 0).toFixed(1)} meters
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions & Emergency Numbers */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quick Actions */}
                            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                                <h4 className="text-white font-bold text-xl mb-4">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => triggerEmergency('medical')}
                                        className="p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 transition-all duration-300 transform hover:scale-105 group"
                                    >
                                        <div className="flex items-center gap-2 text-red-400">
                                            <span className="text-xl">🩺</span>
                                            <span className="font-medium">Medical Emergency</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => triggerEmergency('fire')}
                                        className="p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border-2 border-orange-500/30 transition-all duration-300 transform hover:scale-105 group"
                                    >
                                        <div className="flex items-center gap-2 text-orange-400">
                                            <span className="text-xl">🔥</span>
                                            <span className="font-medium">Fire Emergency</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => triggerEmergency('accident')}
                                        className="p-4 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border-2 border-yellow-500/30 transition-all duration-300 transform hover:scale-105 group"
                                    >
                                        <div className="flex items-center gap-2 text-yellow-400">
                                            <span className="text-xl">🚗</span>
                                            <span className="font-medium">Accident</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => triggerEmergency('crime')}
                                        className="p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/30 transition-all duration-300 transform hover:scale-105 group"
                                    >
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <span className="text-xl">👮</span>
                                            <span className="font-medium">Crime</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Emergency Numbers */}
                            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                                <h4 className="text-white font-bold text-xl mb-4">Emergency Numbers</h4>
                                <div className="space-y-3">
                                    {Object.entries(EMERGENCY_NUMBERS).map(([service, number]) => (
                                        <button
                                            key={service}
                                            onClick={() => callEmergencyNumber(service)}
                                            className="w-full flex justify-between items-center p-4 bg-red-500/10 border-2 border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300 transform hover:scale-105"
                                        >
                                            <span className="font-medium capitalize">{service}</span>
                                            <span className="font-mono font-bold text-lg">{number}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Emergencies */}
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-white font-bold text-xl">Recent Emergencies</h4>
                                <Link to="/history" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                    View All →
                                </Link>
                            </div>
                            {emergencyHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">📊</div>
                                    <p className="text-gray-400">No emergency history yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {emergencyHistory.slice(0, 3).map((emergency, index) => (
                                        <div key={emergency._id || index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">
                                                    {emergency.emergencyType === 'medical' ? '🩺' :
                                                        emergency.emergencyType === 'fire' ? '🔥' :
                                                            emergency.emergencyType === 'accident' ? '🚗' : '🚨'}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium capitalize">{emergency.emergencyType || 'Emergency'}</div>
                                                    <div className="text-gray-400 text-sm">
                                                        {new Date(emergency.createdAt || emergency.timestamp).toLocaleDateString('en-IN')}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                emergency.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                                    emergency.status === 'active' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {emergency.status || 'unknown'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Summary */}
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                            <h4 className="text-white font-bold text-xl mb-4">Your Profile</h4>
                            <div className="space-y-4">
                                <Link to="/medical" className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <span className="text-blue-400">🩺</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Medical Profile</div>
                                        <div className="text-gray-400 text-sm">
                                            {medicalInfo ? 'Complete' : 'Setup required'}
                                        </div>
                                    </div>
                                </Link>

                                <Link to="/contacts" className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-colors">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <span className="text-green-400">👥</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Emergency Contacts</div>
                                        <div className="text-gray-400 text-sm">
                                            {emergencyContacts.length} contacts
                                        </div>
                                    </div>
                                </Link>

                                <div className="pt-4 border-t border-gray-700">
                                    <div className="text-gray-400 text-sm mb-2">Account Status</div>
                                    <div className="flex items-center justify-between text-white">
                                        <span>Protection Active</span>
                                        <span className="text-green-400">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                            <h4 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Notifications
                            </h4>
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className={`p-3 rounded-xl border ${
                                        notification.read
                                            ? 'bg-gray-800/50 border-gray-700'
                                            : 'bg-blue-500/10 border-blue-500/30'
                                    }`}>
                                        <div className="text-white text-sm mb-1">{notification.message}</div>
                                        <div className="text-gray-400 text-xs">{notification.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                            <h4 className="text-white font-bold text-xl mb-4">Safety Stats</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Emergencies This Month</span>
                                    <span className="text-white font-bold">{stats.emergenciesThisMonth}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Avg Response Time</span>
                                    <span className="text-white font-bold">{stats.responseTime}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Contacts Reachable</span>
                                    <span className="text-white font-bold">{stats.contactsReachable}/{emergencyContacts.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}