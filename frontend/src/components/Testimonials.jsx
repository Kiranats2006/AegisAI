import React from "react";

const Testimonials = () => {
  const feedbacks = [
    {
      quote:
        "AegisAI detected my fall and notified my family instantly. It gave us so much confidence knowing help was already on the way!",
      name: "Ananya R.",
    },
    {
      quote:
        "It’s like having a digital guardian watching over me — reliable, fast, and reassuring every single day.",
      name: "Rohan K.",
    },
    {
      quote:
        "Setup was quick, and the peace of mind is priceless. AegisAI truly looks out for my safety.",
      name: "Priya S.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-slate-950/60 border-t border-slate-800">
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 drop-shadow-lg">
          User <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Stories</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbacks.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800/70 border border-slate-700 hover:border-blue-500/60 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 backdrop-blur-md"
            >
              <p className="text-slate-200 text-lg leading-relaxed italic mb-6">
                “{item.quote}”
              </p>
              <div className="text-blue-400 font-semibold text-lg">— {item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
