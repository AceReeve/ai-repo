// src/app/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { PaperAirplaneIcon, SparklesIcon, UserCircleIcon } from '@heroicons/react/24/solid'

export default function Home() {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: "Hello! I'm Claude, an AI assistant created by Anthropic. I'm helpful, honest, and harmless. How can I help you today?", 
      sender: 'ai' 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (input.trim() === '') return

    const userMessage = {
      id: String(Date.now()),
      text: input,
      sender: 'user'
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const anthropic = new Anthropic({ 
        apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
        dangerouslyAllowBrowser: true 
      })

      const response = await anthropic.messages.create({
        model: "claude-2.1",
        max_tokens: 1000,
        messages: updatedMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      })

      const aiResponseText = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('')

      const aiResponse = {
        id: String(Date.now() + 1),
        text: aiResponseText,
        sender: 'ai'
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: String(Date.now() + 2),
        text: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'ai'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Claude AI</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800">
            New Chat
          </button>
          <UserCircleIcon className="h-10 w-10 text-gray-500" />
        </div>
      </header>

      {/* Chat Messages Container */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] p-4 rounded-2xl shadow-md ${
                msg.sender === 'ai' 
                  ? 'bg-white text-gray-800 rounded-bl-none' 
                  : 'bg-purple-600 text-white rounded-br-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-6 border-t">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="flex-grow relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message Claude..."
              className="w-full p-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            {input.trim() === '' && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <SparklesIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <button 
            onClick={handleSendMessage}
            className={`p-3 rounded-full transition-colors ${
              isLoading || input.trim() === '' 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            disabled={isLoading || input.trim() === ''}
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}