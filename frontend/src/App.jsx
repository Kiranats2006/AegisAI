import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-200 to-pink-200 text-gray-800 p-6">
      
      {/* Logos */}
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="h-20 w-20 animate-bounce" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-20 w-20 animate-spin-slow" alt="React logo" />
        </a>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-8 text-purple-700 drop-shadow-lg">
        Vite + React + Tailwind
      </h1>

      {/* Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6 hover:scale-105 transform transition duration-300">
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition"
        >
          count is {count}
        </button>
        <p className="text-gray-600">
          Edit <code className="bg-gray-200 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Footer */}
      <p className="mt-10 text-gray-700 italic">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
