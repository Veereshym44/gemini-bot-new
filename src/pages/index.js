import { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import axios from 'axios';
import TypingAnimation from "../components/TypingAnimation";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { translate } from '@vitalets/google-translate-api';






export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  const next_key=process.env.NEXT_PUBLIC_API_KEY



  
  const handleSubmit = (event) => {
    event.preventDefault();

    // setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: inputValue }])

    sendMessage(inputValue);
    
    setInputValue('');
  }

  const translateText = async (message, to) => {
    try {
      const response = await axios.post('/api/chat', { message, to });
      return response.data.translatedText;
    } catch (error) {
      console.error("Error translating text:", error);
      return "ಪ್ರಸ್ತುತ ಸರ್ವರ್ ಡೌನ್ ಆಗಿದೆ, ಇಂಗ್ಲಿಷ್ ಭಾಷೆಯನ್ನು ಬಳಸಿ";
    }
  };
  const sendMessage = async (message) => {
    // Add user's message to chatLog
    setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: message }]);
    setIsLoading(true);
  
    try {
      let translatedText;
      if (isKannada(message)) {
        // Translate Kannada message to English
        translatedText = await translateText(message, 'en');
      } else {
        // Use the message directly if it's in English
        translatedText = message;
      }
  
      // Call the generative model with the translated message
      const genAI = new GoogleGenerativeAI(next_key);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(translatedText);
      const response = await result.response;
      const text = response.text();
  
      let translatedResponse;
      if (isKannada(message)) {
        // Translate Gemini's response back to Kannada
        translatedResponse = await translateText(text, 'kn');
      } else {
        // Use Gemini's response directly if the input was in English
        translatedResponse = text;
      }
  
      // Add bot's response to chatLog
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: translatedResponse }]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error generating response:", error);
      if(!isKannada)
      setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: "Sorry, I couldn't understand that." }]);
    else setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: 
    "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅದು ಅರ್ಥವಾಗಲಿಲ್ಲ" }]);
    
    }
  };
  
  // Function to detect if the input message is in Kannada
  const isKannada = (text) => {
    // You can implement your own logic to detect Kannada text here
    // For simplicity, let's assume any text containing Kannada characters is Kannada
    const kannadaRegex = /[ಅ-ಹ]+/; // Kannada Unicode range
    return kannadaRegex.test(text);
  };
  
  

  
  
  return (
    <div className="container mx-auto max-w-[700px]">
      <div className="flex flex-col h-screen bg-gray-900">
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center py-3 font-bold text-6xl">Farmers Bot</h1>
        
        <div className="flex-grow p-6 overflow-y-auto">
  <div className="flex flex-col space-y-4">
    {chatLog.map((message, index) => (
      <div key={index} className={`flex ${
        message.type === 'user' ? 'justify-end' : 'justify-start'
      }`}>
        <div className={`${
          message.type === 'user' ? 'bg-purple-500' : 'bg-gray-800'
        } rounded-lg p-4 text-white max-w-md`}>
          {message.message}
        </div>
      </div>
    ))}
    {isLoading && (
      <div key={chatLog.length} className="flex justify-start">
        <div className="bg-gray-800 rounded-lg p-4 text-white max-w-md">
          <TypingAnimation />
        </div>
      </div>
    )}
  </div>
</div>

        <form onSubmit={handleSubmit} className="flex-none p-6">
        
          <div className="flex rounded-lg border border-gray-700 bg-gray-800">  
        <input type="text" className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none" placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button type="submit" className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Send</button>
            </div>
        </form>
        </div>
    </div>
  )
}
