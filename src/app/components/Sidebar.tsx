// src/app/components/Sidebar.tsx
'use client'

import React, { useState } from 'react'
import { PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default function Sidebar() {
  const [chats, setChats] = useState([
    { id: '1', title: 'First Chat' },
    { id: '2', title: 'Second Chat' }
  ])

  const handleNewChat = () => {
    const newChat = {
      id: String(Date.now()),
      title: `New Chat ${chats.length + 1}`
    }
    setChats([...chats, newChat])
  }

  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
      <button 
        onClick={handleNewChat}
        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 rounded mb-4"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        New Chat
      </button>

      <div className="flex-grow overflow-y-auto">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
          >
            <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
            <span className="truncate">{chat.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}