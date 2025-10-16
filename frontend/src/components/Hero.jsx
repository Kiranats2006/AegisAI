export default function Hero({ onStart }) {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40">
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        Dark mode section
      </div>

      <div className="bg-gray-100 text-black p-6 rounded-lg mt-4">
        Light mode section
      </div>

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(15,35,35,1) 0%, rgba(15,35,35,0.6) 50%, rgba(15,35,35,0) 100%), url(https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&q=80&w=1600&fit=crop)",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-white text-4xl font-black tracking-tighter text-white sm:text-6xl lg:text-7xl">
            Your AI <span className="text-primary">Safety Net</span>
          </h1>
          <p className="mt-6 text-lg text-white/80">
            AegisAI provides real-time protection and support during
            emergencies, ensuring your safety and peace of mind.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={onStart}
              className="px-8 py-3 rounded-lg bg-primary text-background-dark text-base font-bold shadow-lg glow-effect"
            >
              Start Protection
            </button>
            <a
              href="#how"
              className="px-8 py-3 rounded-lg bg-white/10 text-white text-base font-bold hover:bg-white/20"
            >
              Learn How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
