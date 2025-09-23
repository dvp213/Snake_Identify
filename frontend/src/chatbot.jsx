// import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import React, { useState, useEffect, useRef } from "react";

function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, sender: "user" };

    // Simulated bot response
    const botMessage = {
      text: input.toLowerCase().includes("venomous")
        ? "Common Krait is the most venomous snake in Sri Lanka."
        : "I don’t have an answer for that yet.",
      sender: "bot",
    };

    setMessages([...messages, userMessage, botMessage]);
    setInput("");
    setHasStarted(true);
  };

  return (
    <div className="chatbot-wrapper">
      <button className="back-btn" onClick={() => navigate("/")}>
        Go back
      </button>

      {!hasStarted ? (
        <div className="intro-section">
          <div className="intro-icon"></div>

          <h1 className="intro-text">
            You can ask <br /> about Sri Lankan snakes from us...
          </h1>
        </div>
      ) : (
        <div className="chat-section">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${
                msg.sender === "user" ? "user" : "bot"
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} /> {/* invisible marker for auto-scroll */}
        </div>
      )}

      <div className="input-section">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-btn" onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
