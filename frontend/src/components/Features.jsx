import React from 'react'


const items = [
{ title: 'AI Emergency Chat', desc: 'Connect with AI specialists instantly for guidance and support during critical situations.'},
{ title: 'Live Tracking', desc: 'Share your location with emergency contacts and authorities for rapid assistance.'},
{ title: 'Real-time Alerts', desc: 'Receive immediate notifications about potential threats and safety updates.'},
{ title: 'Authority Connect', desc: 'Seamlessly connect with local authorities for coordinated emergency response.'}
]


export default function Features(){
return (
<>
{items.map((it, idx) => (
<div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 glow-effect-sm">
<div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20 mb-5"> <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Z"/></svg></div>
<h3 className="text-white text-lg font-bold text-white">{it.title}</h3>
<p className="mt-2 text-sm text-white/60">{it.desc}</p>
</div>
))}
</>
)
}