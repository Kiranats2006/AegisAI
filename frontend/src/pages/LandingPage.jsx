import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Testimonials from '../components/Testimonials';


const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '💬',
      title: 'AI Emergency Chat',
      description: 'Connect with AI specialists instantly for guidance and support during critical situations.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📍',
      title: 'Live Tracking',
      description: 'Share your location with emergency contacts and authorities for rapid assistance.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '⚠️',
      title: 'Real-time Alerts',
      description: 'Receive immediate notifications about potential threats and safety updates.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: '👮',
      title: 'Authority Connect',
      description: 'Seamlessly connect with local authorities for coordinated emergency response.',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-gray-950/98 backdrop-blur-lg border-b border-blue-800/50 py-2 shadow-lg shadow-blue-500/20' 
          : 'bg-gray-950/50 backdrop-blur-sm py-4'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h2 className="text-white text-2xl font-bold">
                AegisAI
              </h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-200 hover:text-white transition-colors duration-300 font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-200 hover:text-white transition-colors duration-300 font-medium">How It Works</a>
              <a href="#" className="text-slate-200 hover:text-white transition-colors duration-300 font-medium">Safety</a>
            </nav>
            <div className="flex items-center gap-4">
              <Link 
                to="/signup"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transform hover:scale-105 transition-all duration-300"
              >
                Start Protection
              </Link>
              <Link 
                to="/login"
                className="px-6 py-3 rounded-xl bg-white/15 text-white font-bold hover:bg-white/25 border-2 border-slate-600 hover:border-slate-400 transition-all duration-300"
              >
                AI Chat
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gray-950/90">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/30 via-purple-900/20 to-transparent"></div>
          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/50 rounded-full animate-float shadow-lg shadow-blue-400/50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
              <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] block">
                Your AI
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(147,51,234,0.8)] block">
                Safety Net
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-12 leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] font-medium">
              AegisAI provides real-time protection and support during emergencies, 
              ensuring your safety and peace of mind with cutting-edge AI technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/signup"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold shadow-2xl shadow-blue-500/50 hover:shadow-3xl hover:shadow-blue-500/60 transform hover:scale-105 transition-all duration-300"
              >
                Start Protection Now
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 rounded-2xl bg-white/15 text-white text-lg font-bold border-2 border-slate-600 hover:bg-white/25 hover:border-slate-400 transition-all duration-300 inline-block"
              >
                Learn How It Works
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center shadow-lg">
            <div className="w-1 h-3 bg-slate-300 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-950/80">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Powerful Features <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"></span>
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto font-medium">
              Everything you need to stay safe and connected during emergencies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gray-900/90 backdrop-blur-lg p-6 rounded-2xl border-2 border-gray-700/80 transition-all duration-500 hover:scale-105 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/30 hover:bg-gray-900"
              >
                <div className={`flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 transform group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-100 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-950/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              How It Works<span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"></span>
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Activate Protection', desc: 'Start tracking and enable emergency monitoring with one click' },
              { step: '02', title: 'AI Monitoring', desc: 'Our AI continuously analyzes your situation and location' },
              { step: '03', title: 'Instant Response', desc: 'Get immediate assistance and guidance when needed' },
              { step: '04', title: 'Stay Connected', desc: 'Emergency contacts and authorities are notified automatically' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-6 p-6 bg-slate-800/80 rounded-2xl border-2 border-slate-700 hover:border-slate-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/50">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-12 rounded-3xl border-2 border-slate-700 shadow-2xl shadow-blue-500/20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Ready to Feel Safe?<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"></span>
            </h2>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust AegisAI for their safety and peace of mind
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/signup"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold shadow-2xl shadow-blue-500/50 hover:shadow-3xl hover:shadow-blue-500/60 transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link 
                to="/login"
                className="px-8 py-4 rounded-2xl bg-white/15 text-white text-lg font-bold border-2 border-slate-600 hover:bg-white/25 hover:border-slate-400 transition-all duration-300"
              >
                Try AI Chat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t-2 border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/50"></div>
              <h2 className="text-white text-xl font-bold">AegisAI</h2>
            </div>
            <div className="flex gap-8">
              <a className="text-slate-300 hover:text-white transition-colors duration-300 font-medium" href="#">Privacy</a>
              <a className="text-slate-300 hover:text-white transition-colors duration-300 font-medium" href="#">Terms</a>
              <a className="text-slate-300 hover:text-white transition-colors duration-300 font-medium" href="#">Contact</a>
            </div>
            <p className="text-slate-400 text-sm">© 2024 AegisAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;