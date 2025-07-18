import React, { useState, useCallback } from 'react'
import type { ExcelData } from '../../services/excelService.js'
import { ApiService } from '../../services/apiService.js'

interface ChatInterfaceProps {
  selectedData: ExcelData | null
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedData }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{id: string, content: string, role: 'user' | 'assistant'}>>([
    {
      id: '1',
      content: "Hello! I'm your Excel AI assistant. I can help you analyze data, create formulas, generate charts, and much more. What would you like to do today?",
      role: 'assistant'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const apiService = new ApiService()

  const handleMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    setIsLoading(true)
    setError(null)

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    try {
      // Prepare context with selected data
      const context = selectedData ? {
        current_sheet: 'Sheet1',
        selected_range: selectedData.address,
        data: {
          values: selectedData.values,
          formulas: selectedData.formulas,
          address: selectedData.address,
          headers: selectedData.headers,
          sheet_name: 'Sheet1'
        },
        workbook_name: 'Workbook'
      } : null

      // Send message to backend
      const response = await apiService.sendChatMessage(message, context)
      
      // Add assistant response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant' as const
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Execute any actions returned by the AI
      if (response.actions && response.actions.length > 0) {
        console.log('AI suggested actions:', response.actions)
        // In a full implementation, you'd execute these actions
        // For now, just log them
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      console.error('Chat error:', err)
      
      // Add error message
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant' as const
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }, [selectedData])

  const handleQuickAction = (actionMessage: string) => {
    handleMessage(actionMessage)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleMessage(inputValue)
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Context Display */}
      {selectedData && (
        <div className="bg-blue-50 border-t border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 font-medium">
                Working with: {selectedData.address}
              </span>
              <span className="text-xs text-blue-600">
                ({selectedData.rows} rows, {selectedData.columns} columns)
              </span>
            </div>
            <div className="text-xs text-blue-600">
              {selectedData.headers && selectedData.headers.length > 0 && (
                <span>Headers: {selectedData.headers.join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-700">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Message Composer */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                selectedData 
                  ? "Ask me anything about your selected data..."
                  : "Select some data in Excel and ask me to analyze it, or ask for general Excel help..."
              }
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </form>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <QuickActionButton 
            label="Analyze Data" 
            onClick={() => handleQuickAction("Analyze this data and provide insights")}
            disabled={!selectedData || isLoading}
          />
          <QuickActionButton 
            label="Create Chart" 
            onClick={() => handleQuickAction("Suggest the best chart type for this data")}
            disabled={!selectedData || isLoading}
          />
          <QuickActionButton 
            label="Generate Formula" 
            onClick={() => handleQuickAction("Help me create a formula for this data")}
            disabled={!selectedData || isLoading}
          />
          <QuickActionButton 
            label="Clean Data" 
            onClick={() => handleQuickAction("How can I clean and improve this data?")}
            disabled={!selectedData || isLoading}
          />
        </div>
      </div>
    </div>
  )
}

interface QuickActionButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ label, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1 text-xs rounded-full border transition-colors
        ${disabled 
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }
      `}
    >
      {label}
    </button>
  )
} 