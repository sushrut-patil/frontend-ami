import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Chatbot = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! How can I help you today?' }]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Replace this with actual API call to Django
      const response = await fetch('/api/chatbot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();

      setMessages(prev => [...prev, { sender: 'bot', text: data.response || "Sorry, I didn't get that." }]);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Server error. Please try again later.' }]);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="w-full min-3/5 bg-gradient-to-br from-white to bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col border border-gray-700 rounded-2xl shadow-2xl bg-gray-900 overflow-hidden">
        <div className="px-6 py-4 bg-gray-800 text-white text-2xl font-semibold shadow-md">💬 GreenStock Chat Assistant</div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`rounded-xl px-4 py-2 max-w-[70%] text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex border-t border-gray-700 bg-gray-800 p-4">
          <input
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
