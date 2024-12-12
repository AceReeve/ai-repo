// src/app/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  CodeBracketIcon, 
  LightBulbIcon 
} from '@heroicons/react/24/solid'

type MessageStep = {
  id: string;
  title: string;
  content: string;
  icon: React.ComponentType<{ className?: string }>;
}

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
  const [currentAnswer, setCurrentAnswer] = useState<MessageStep[]>([])
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const parseResponseIntoSteps = (text: string): MessageStep[] => {
    // Basic parsing of response into steps
    const steps = text.split('\n\n').map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      content: step.trim(),
      icon: index === 0 
        ? DocumentTextIcon 
        : index === 1 
          ? CodeBracketIcon 
          : LightBulbIcon
    }))
    return steps
  }

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

      // Parse response into steps
      const answerSteps = parseResponseIntoSteps(aiResponseText)
      setCurrentAnswer(answerSteps)

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
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-8 w-8 text-cyan-400 animate-pulse" />
          <h1 className="text-2xl font-bold text-cyan-300">Claude AI</h1>
        </div>
      </header>

      {/* Chat and Answer Container */}
      <div className="flex flex-grow overflow-hidden">
        {/* Chat Messages */}
        <div className="w-1/2 bg-gray-800 border-r border-gray-700 overflow-y-auto p-6 space-y-4 pb-24">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] p-4 rounded-2xl shadow-lg ${
                  msg.sender === 'ai' 
                    ? 'bg-gray-700 text-gray-100 rounded-bl-none' 
                    : 'bg-cyan-600 text-white rounded-br-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 p-4 rounded-2xl animate-pulse">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="h-3 w-3 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
                  <div className="h-3 w-3 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Detailed Answer Steps */}
        <div className="w-1/2 bg-gray-900 p-6 overflow-y-auto pb-24">
          {currentAnswer.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">Detailed Answer</h2>
              {currentAnswer.map((step) => (
                <div 
                  key={step.id} 
                  className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:border-cyan-500 border border-transparent transition-all duration-300 ease-in-out"
                >
                  <div className="flex items-center mb-4">
                    <step.icon className="h-8 w-8 text-cyan-400 mr-4 animate-pulse" />
                    <h3 className="text-xl font-semibold text-cyan-300">{step.title}</h3>
                  </div>
                  <p className="text-gray-300">{step.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Now Sticky */}
      <div className="sticky bottom-0 bg-gray-800 p-6 border-t border-gray-700 z-50">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-grow p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            className="bg-cyan-600 text-white p-4 rounded-full hover:bg-cyan-500 disabled:opacity-50 transition-colors duration-300 ease-in-out"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}