import { useEffect, useRef, useState } from "react";

/*
Chat component - demo/mocked AI assistant. Replace the sendMessage async function
with calls to your backend which then calls Gemini/LLM, or directly call an LLM
from the client cautiously (server recommended).
*/
export default function Chat() {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hello — I'm AegisAI. Tell me what emergency you're facing, and I'll guide you step-by-step.",
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function sendMessage(text) {
    if (!text) return;
    const userMsg = { from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Mocked AI response: simple rule based + simulated thinking delay
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply =
        "I'm here to help. Can you tell me if you or anyone is injured?";
      if (lower.includes("fire"))
        reply =
          "If there is a fire: get low, cover mouth, move to a safe exit and call local emergency services. Should I call for help now?";
      if (lower.includes("unconscious") || lower.includes("not breathing"))
        reply =
          "Start CPR immediately. Place the heel of your hand in the center of the chest and push hard at 100-120 compressions per minute. Do you want step-by-step guidance?";
      if (lower.includes("car") && lower.includes("accident"))
        reply =
          "Check for hazards (fire, leaking fuel). Call emergency services. Are you able to move safely away from the vehicle?";

      setMessages((m) => [...m, { from: "ai", text: reply }]);
    }, 1000);
  }

  return (
    <section className="container mx-auto p-6">
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        Dark mode section
      </div>

      <div className="bg-gray-100 text-black p-6 rounded-lg mt-4">
        Light mode section
      </div>

      <div className="max-w-3xl mx-auto bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-bold text-lg">
          AegisAI — Emergency Assistant
        </h3>
        <div
          ref={listRef}
          className="mt-4 h-64 overflow-auto p-3 space-y-3 bg-white/3 rounded"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`${m.from === "ai" ? "text-left" : "text-right"}`}
            >
              <div
                className={`inline-block px-3 py-2 rounded ${
                  m.from === "ai"
                    ? "bg-white/6"
                    : "bg-primary text-background-dark"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your emergency..."
            className="flex-grow rounded px-3 py-2 bg-white/5"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-primary font-bold"
          >
            Send
          </button>
        </form>

        <div className="mt-4 text-sm text-white/70">
          <strong>Note:</strong> This demo uses a mocked AI assistant. For a
          production-ready AI, connect this chat to a backend that calls an LLM
          (Gemini / OpenAI) and integrates voice & SMS services.
        </div>
      </div>
    </section>
  );
}
