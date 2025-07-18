import { useEffect, useState } from 'react'
import { ExcelService } from './services/excelService'
import { ChatInterface } from './components/ChatInterface/ChatInterface'
import './App.css'

declare global {
  interface Window {
    Office: any;
  }
}

function App() {
  const [isOfficeInitialized, setIsOfficeInitialized] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Office.js when available
    if (typeof window.Office !== 'undefined') {
      window.Office.onReady((info: any) => {
        if (info.host === window.Office.HostType.Excel) {
          setIsOfficeInitialized(true)
          console.log('Office.js initialized successfully')
        } else {
          setError('This add-in only works in Excel')
        }
      })
    } else {
      // For development outside Excel
      console.log('Office.js not available - running in development mode')
      setIsOfficeInitialized(true)
    }
  }, [])

  const handleDataSelection = async () => {
    if (!isOfficeInitialized) return

    try {
      const excelService = new ExcelService()
      const data = await excelService.getSelectedRange()
      setSelectedData(data)
    } catch (err) {
      setError('Failed to get selected data from Excel')
      console.error(err)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Cursor AI for Excel
            </h1>
            <p className="text-sm text-gray-600">
              AI-powered assistant for your spreadsheets
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOfficeInitialized ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isOfficeInitialized ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)] bg-white">
        {isOfficeInitialized ? (
          <div className="h-full flex flex-col">
            {/* Data Selection Panel */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedData ? 
                      `Selected: ${selectedData.address} (${selectedData.rows || 0} rows, ${selectedData.columns || 0} columns)` : 
                      'No data selected'
                    }
                  </p>
                </div>
                <button
                  onClick={handleDataSelection}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Selected Data
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 bg-white">
              <ChatInterface selectedData={selectedData} />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing Excel connection...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
