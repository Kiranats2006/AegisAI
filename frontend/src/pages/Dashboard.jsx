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
    const [nearbyServices, setNearbyServices] = useState([]);
    const [safetyScore, setSafetyScore] = useState(100);
    const [isLoadingServices, setIsLoadingServices] = useState(false);

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

    // Location tracking with nearby services
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
                    
                    // 🆕 FETCH NEARBY SERVICES WHEN LOCATION UPDATES
                    fetchNearbyEmergencyServices(pos.coords.latitude, pos.coords.longitude);
                    
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
                setEmergencyContacts([]);
            }
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
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

    const fetchNearbyEmergencyServices = async (lat, lng, radius = 3000) => {
        try {
            setIsLoadingServices(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/api/location/nearby-services?lat=${lat}&lng=${lng}&radius=${radius}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Nearby services response:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Nearby services result:', result);
                
                if (result.success && Array.isArray(result.data)) {
                    setNearbyServices(result.data);
                    calculateSafetyScore(result.data);
                    return result.data;
                }
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch nearby services:', error);
            return [];
        } finally {
            setIsLoadingServices(false);
        }
    };

    const calculateSafetyScore = (services) => {
        if (!services || services.length === 0) {
            setSafetyScore(40);
            return;
        }
        
        const hospitals = services.filter(s => s.type === 'hospital');
        const police = services.filter(s => s.type === 'police');
        const fireStations = services.filter(s => s.type === 'fire');
        
        let score = 100;
        
        if (hospitals.length === 0) score -= 30;
        if (police.length === 0) score -= 20;
        if (fireStations.length === 0) score -= 10;
        
        const closeServices = services.filter(s => s.distanceInMeters < 1000);
        if (closeServices.length > 0) score += 15;
        
        const veryCloseServices = services.filter(s => s.distanceInMeters < 500);
        if (veryCloseServices.length > 0) score += 10;
        
        setSafetyScore(Math.max(0, Math.min(100, score)));
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
                setStats({
                    emergenciesThisMonth: 0,
                    responseTime: '0min',
                    contactsReachable: emergencyContacts.length
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setStats({
                emergenciesThisMonth: 0,
                responseTime: '0min',
                contactsReachable: emergencyContacts.length
            });
        }
    };

    const setupNotifications = () => {
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
                navigate('/chat');
            } else {
                console.error('Failed to trigger emergency:', response.status);
                navigate('/chat');
            }
        } catch (error) {
            console.error('Failed to trigger emergency:', error);
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

    const openDirections = (service) => {
        if (service.coordinates && service.coordinates.length === 2) {
            window.open(`https://maps.google.com/?q=${service.coordinates[1]},${service.coordinates[0]}`, '_blank');
        } else {
            console.error('Invalid coordinates for service:', service);
        }
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <div className="text-yellow-400 text-sm font-medium">Safety Score</div>
                                    <div className="text-white text-lg font-bold mt-1">
                                        {safetyScore}/100
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

                        {/* Safety & Location Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Safety Monitor */}
                            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                                <h4 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <span className="text-green-400">🛡️</span>
                                    Safety Monitor
                                </h4>
                                
                                {/* Safety Score */}
                                <div className={`p-4 rounded-xl border-2 mb-4 ${
                                    safetyScore >= 70 ? 'border-green-500 bg-green-500/10' :
                                    safetyScore >= 40 ? 'border-yellow-500 bg-yellow-500/10' :
                                    'border-red-500 bg-red-500/10'
                                }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-bold">Safety Score</span>
                                        <span className={`text-lg font-bold ${
                                            safetyScore >= 70 ? 'text-green-400' :
                                            safetyScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                            {safetyScore}/100
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3">
                                        <div 
                                            className={`h-3 rounded-full ${
                                                safetyScore >= 70 ? 'bg-green-500' :
                                                safetyScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${safetyScore}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {safetyScore >= 70 ? '✅ High safety area' :
                                        safetyScore >= 40 ? '⚠️ Moderate safety' : '🚨 Low safety - be cautious'}
                                    </div>
                                </div>

                                {/* Nearby Services Summary */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Nearby Hospitals:</span>
                                        <span className="text-white font-medium">
                                            {nearbyServices.filter(s => s.type === 'hospital').length} found
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Police Stations:</span>
                                        <span className="text-white font-medium">
                                            {nearbyServices.filter(s => s.type === 'police').length} found
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Fire Stations:</span>
                                        <span className="text-white font-medium">
                                            {nearbyServices.filter(s => s.type === 'fire').length} found
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Nearby Services Widget */}
                            <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-6">
                                <h4 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                    <span className="text-blue-400">📍</span>
                                    Nearby Emergency Services
                                    {isLoadingServices && (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                    )}
                                </h4>
                                
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {nearbyServices.slice(0, 4).map((service, index) => (
                                        <div key={service.id || index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    service.type === 'hospital' ? 'bg-red-500/20' :
                                                    service.type === 'police' ? 'bg-blue-500/20' : 'bg-orange-500/20'
                                                }`}>
                                                    <span className={
                                                        service.type === 'hospital' ? 'text-red-400' :
                                                        service.type === 'police' ? 'text-blue-400' : 'text-orange-400'
                                                    }>
                                                        {service.type === 'hospital' ? '🏥' :
                                                        service.type === 'police' ? '👮' : '🚒'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white font-medium text-sm truncate">{service.name || 'Unknown Service'}</div>
                                                    <div className="text-gray-400 text-xs">{service.distance}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => openDirections(service)}
                                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-colors whitespace-nowrap"
                                            >
                                                Directions
                                            </button>
                                        </div>
                                    ))}
                                    {nearbyServices.length === 0 && !isLoadingServices && (
                                        <div className="text-center py-4 text-gray-400">
                                            {tracking ? 'No services found in your area' : 'Enable location tracking to see nearby services'}
                                        </div>
                                    )}
                                    {isLoadingServices && (
                                        <div className="text-center py-4 text-gray-400">
                                            <div className="flex justify-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            </div>
                                            <p className="text-sm mt-2">Finding nearby services...</p>
                                        </div>
                                    )}
                                </div>
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
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Nearby Services</span>
                                    <span className="text-white font-bold">{nearbyServices.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}