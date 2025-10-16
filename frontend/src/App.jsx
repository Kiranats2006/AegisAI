import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'

export default function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home navigate={navigate} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function Home({ navigate }) {
  return (
    <>
      <Hero onStart={() => navigate('/dashboard')} />
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Comprehensive AI Emergency Support
            </h2>
            <p className="mt-4 text-lg text-white/70">
              AegisAI offers features to help you navigate emergencies effectively.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Features />
          </div>
        </div>
      </section>
    </>
  )
}
