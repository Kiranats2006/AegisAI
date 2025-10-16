import React from 'react'
import { Link } from 'react-router-dom'


export default function Header() {
return (
<header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-white/10">
<div className="bg-gray-900 text-white p-6 rounded-lg">
  Dark mode section
</div>

<div className="bg-gray-100 text-black p-6 rounded-lg mt-4">
  Light mode section
</div>
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-20">
<div className="flex items-center gap-3">
<svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path></svg>
<h2 className="text-white text-xl font-bold tracking-tight text-white">AegisAI</h2>
</div>
<nav className="hidden md:flex items-center gap-8">
<Link to="#" className="text-sm font-medium text-white/70 hover:text-primary">Product</Link>
<Link to="#" className="text-sm font-medium text-white/70 hover:text-primary">Pricing</Link>
<Link to="#" className="text-sm font-medium text-white/70 hover:text-primary">Resources</Link>
</nav>
<div className="flex items-center gap-4">
<button onClick={() => window.location.href = '/dashboard'} className="px-6 py-2.5 rounded-lg bg-primary text-background-dark text-sm font-bold shadow-lg glow-effect transition-transform hover:scale-105">Start Protection</button>
<Link to="/chat" className="hidden sm:inline-block px-6 py-2.5 rounded-lg bg-white/10 text-white text-sm font-bold hover:bg-white/20">AI Chat</Link>
</div>
</div>
</div>
</header>
)
}