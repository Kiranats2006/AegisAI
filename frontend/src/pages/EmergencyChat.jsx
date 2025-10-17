import React, { useState, useEffect, useRef } from 'react';

const EmergencyChat = () => {
    const [messages, setMessages] = useState([
        {
            from: 'ai',
            text: 'Hello! I\'m AegisAI Emergency Assistant. Describe your emergency situation and I\'ll guide you through step-by-step help.',
            timestamp: new Date(),
            type: 'greeting'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [emergencyType, setEmergencyType] = useState('');
    const messagesEndRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    // India-specific emergency numbers
    const EMERGENCY_NUMBERS = {
        police: '100',
        ambulance: '102',
        fire: '101',
        disaster: '108',
        women_helpline: '1091',
        child_helpline: '1098'
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const simulateAIResponse = async (userMessage) => {
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/classify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            let aiResponse = "I'm here to help. Can you provide more details about the situation?";
            let detectedType = 'general';

            if (response.ok) {
                const data = await response.json();
                aiResponse = data.instructions?.[0] || data.guidance || aiResponse;
                detectedType = data.emergencyType || detectedType;
                setEmergencyType(detectedType);

                if (!emergencyMode && data.confidence > 0.7) {
                    setEmergencyMode(true);
                    triggerEmergencyProtocol(detectedType, userMessage);
                }
            }

            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    from: 'ai',
                    text: aiResponse,
                    timestamp: new Date(),
                    type: 'instruction',
                    emergencyType: detectedType
                }]);
            }, 2000);

        } catch (error) {
            console.error('AI response error:', error);
            setTimeout(() => {
                setIsTyping(false);
                const fallbackResponse = getFallbackResponse(userMessage);
                setMessages(prev => [...prev, {
                    from: 'ai',
                    text: fallbackResponse,
                    timestamp: new Date(),
                    type: 'instruction'
                }]);
            }, 1500);
        }
    };

    const getFallbackResponse = (message) => {
        const lower = message.toLowerCase();

        if (lower.includes('fire') || lower.includes('आग')) {
            return `🚨 FIRE EMERGENCY: Get low to avoid smoke, cover your mouth with a cloth, and evacuate immediately. Call ${EMERGENCY_NUMBERS.fire} for fire department. Are you able to evacuate?`;
        }
        if (lower.includes('heart') || lower.includes('chest pain') || lower.includes('दिल') || lower.includes('सीने')) {
            return `🚨 CARDIAC EMERGENCY: Sit down and stay calm. If you have aspirin, take one. Call ${EMERGENCY_NUMBERS.ambulance} for ambulance immediately. Are you alone?`;
        }
        if (lower.includes('choking') || lower.includes('दम घुट')) {
            return `🚨 CHOKING EMERGENCY: Can you cough or speak? If not, perform self-Heimlich thrusts. Call ${EMERGENCY_NUMBERS.ambulance} immediately.`;
        }
        if (lower.includes('bleeding') || lower.includes('blood') || lower.includes('खून')) {
            return `🚨 BLEEDING EMERGENCY: Apply direct pressure to the wound with a clean cloth. Elevate the injury if possible. Call ${EMERGENCY_NUMBERS.ambulance} if bleeding is severe.`;
        }
        if (lower.includes('unconscious') || lower.includes('not breathing') || lower.includes('बेहोश')) {
            return `🚨 CRITICAL EMERGENCY: Check for breathing. If not breathing, start CPR immediately. Call ${EMERGENCY_NUMBERS.ambulance}. I'm alerting your emergency contacts.`;
        }
        if (lower.includes('accident') || lower.includes('car') || lower.includes('दुर्घटना')) {
            return `🚨 ACCIDENT EMERGENCY: Check for hazards, move to safety if possible. Call ${EMERGENCY_NUMBERS.police} for police and ${EMERGENCY_NUMBERS.ambulance} for medical help.`;
        }
        if (lower.includes('theft') || lower.includes('robbery') || lower.includes('चोरी')) {
            return `🚨 CRIME EMERGENCY: Stay safe, don't confront. Move to a secure location and call ${EMERGENCY_NUMBERS.police} immediately.`;
        }

        return "I understand this is serious. Please provide more details so I can give you specific instructions. Your safety is my priority.";
    };

    const triggerEmergencyProtocol = async (type, description) => {
        try {
            await fetch(`${API_BASE_URL}/api/emergency/trigger`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: type,
                    description: description,
                    timestamp: new Date().toISOString(),
                    location: 'India' // Would be actual location in real implementation
                })
            });

            setMessages(prev => [...prev, {
                from: 'system',
                text: '🚨 EMERGENCY PROTOCOL ACTIVATED: Your emergency contacts are being notified and help is on the way.',
                timestamp: new Date(),
                type: 'emergency_alert'
            }]);
        } catch (error) {
            console.error('Failed to trigger emergency protocol:', error);
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = {
            from: 'user',
            text: text.trim(),
            timestamp: new Date(),
            type: 'user_message'
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        await simulateAIResponse(text.trim());
    };

    const handleQuickAction = (action) => {
        const quickMessages = {
            'medical': 'I need medical emergency help immediately',
            'fire': 'There is a fire emergency, need help',
            'accident': 'I have been in an accident, need assistance',
            'crime': 'I am in danger, need police help',
            'natural': 'Natural disaster emergency, need evacuation help'
        };

        sendMessage(quickMessages[action]);
    };

    const callEmergencyNumber = (service) => {
        const number = EMERGENCY_NUMBERS[service];
        window.open(`tel:${number}`, '_self');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl border-2 border-red-500/30 p-6 shadow-2xl shadow-red-500/20 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">🚨 Emergency Assistant</h1>
                            <p className="text-red-200">24/7 AI-powered emergency guidance and support</p>
                        </div>
                        {emergencyMode && (
                            <div className="bg-red-500 text-white px-4 py-2 rounded-xl animate-pulse">
                                🔴 EMERGENCY MODE ACTIVE
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Quick Actions Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-4">
                            <h3 className="text-white font-bold mb-3">Quick Emergency</h3>
                            <div className="space-y-2">
                                {[
                                    { type: 'medical', label: '🩺 Medical Emergency', color: 'red' },
                                    { type: 'fire', label: '🔥 Fire Emergency', color: 'orange' },
                                    { type: 'accident', label: '🚗 Accident', color: 'yellow' },
                                    { type: 'crime', label: '👮 Crime', color: 'blue' },
                                    { type: 'natural', label: '🌪️ Natural Disaster', color: 'purple' }
                                ].map((action) => (
                                    <button
                                        key={action.type}
                                        onClick={() => handleQuickAction(action.type)}
                                        className={`w-full text-left p-3 rounded-xl bg-${action.color}-500/10 border border-${action.color}-500/30 text-${action.color}-400 hover:bg-${action.color}-500/20 transition-all duration-300`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Emergency Numbers */}
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 p-4">
                            <h3 className="text-white font-bold mb-3">Emergency Numbers</h3>
                            <div className="space-y-2">
                                {Object.entries(EMERGENCY_NUMBERS).map(([service, number]) => (
                                    <button
                                        key={service}
                                        onClick={() => callEmergencyNumber(service)}
                                        className="w-full flex justify-between items-center p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                                    >
                                        <span className="capitalize">{service.replace('_', ' ')}</span>
                                        <span className="font-mono font-bold">{number}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl border-2 border-gray-700/80 h-[600px] flex flex-col">
                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl p-4 ${
                                                message.from === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : message.from === 'system'
                                                        ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                                                        : 'bg-gray-800 text-white'
                                            }`}
                                        >
                                            <div className="text-sm opacity-80 mb-1">
                                                {message.from === 'user' ? 'You' :
                                                    message.from === 'system' ? 'System' : 'AegisAI Assistant'}
                                            </div>
                                            <div className="whitespace-pre-wrap">{message.text}</div>
                                            <div className="text-xs opacity-60 mt-2 text-right">
                                                {message.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-800 rounded-2xl p-4">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-gray-700 p-4">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        sendMessage(input);
                                    }}
                                    className="flex gap-3"
                                >
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Describe your emergency situation..."
                                        className="flex-1 px-4 py-3 bg-gray-800/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                        disabled={isTyping}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isTyping || !input.trim()}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyChat;