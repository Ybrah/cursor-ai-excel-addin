/**
 * API Service for communicating with the backend
 */

import axios, { type AxiosInstance } from 'axios'

export interface ChatRequest {
  message: string
  context?: any
  session_id?: string
}

export interface ChatResponse {
  response: string
  actions?: any[]
  session_id: string
  suggestions?: string[]
}

export interface AnalysisRequest {
  data: any
  query?: string
  analysis_type?: string
}

export interface AnalysisResponse {
  insights: any[]
  suggestions: any[]
  visualizations?: any[]
  summary: string
}

export class ApiService {
  private client: AxiosInstance

  constructor(baseURL: string = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL: `${baseURL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error)
        if (error.response?.status === 500) {
          throw new Error('Server error. Please try again later.')
        } else if (error.response?.status === 404) {
          throw new Error('API endpoint not found.')
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to backend. Please ensure the server is running.')
        }
        throw error
      }
    )
  }

  /**
   * Send a chat message to the backend
   */
  async sendChatMessage(message: string, context?: any, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await this.client.post('/chat', {
        message,
        context,
        session_id: sessionId,
      } as ChatRequest)

      return response.data
    } catch (error) {
      // Fallback for development when backend is not available
      console.warn('Backend not available, using mock response')
      return this.getMockChatResponse(message, context)
    }
  }

  /**
   * Request data analysis from the backend
   */
  async requestAnalysis(data: any, query?: string, analysisType?: string): Promise<AnalysisResponse> {
    try {
      const response = await this.client.post('/analysis/insights', {
        data,
        query,
        analysis_type: analysisType,
      } as AnalysisRequest)

      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock analysis response')
      return this.getMockAnalysisResponse(data)
    }
  }

  /**
   * Generate a formula from natural language
   */
  async generateFormula(data: any, description: string): Promise<any> {
    try {
      const response = await this.client.post('/analysis/formula', {
        data,
        description,
      })

      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock formula response')
      return {
        formula: '=SUM(A:A)',
        explanation: 'Sums all values in column A',
        example: 'If A1:A10 contains numbers, this will sum them all',
        confidence: 0.8
      }
    }
  }

  /**
   * Get chart suggestions for data
   */
  async getChartSuggestions(data: any, context?: string): Promise<any> {
    try {
      const response = await this.client.post('/analysis/chart-suggestions', {
        data,
        context,
      })

      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock chart suggestions')
      return {
        suggestions: [
          {
            chart_type: 'column_chart',
            title: 'Data Overview',
            reasoning: 'Column charts work well for comparing values across categories',
            data_columns: data.headers || ['Column1', 'Column2'],
            confidence: 0.8
          }
        ]
      }
    }
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/chat/history/${sessionId}`)
      return response.data
    } catch (error) {
      console.warn('Backend not available, returning empty chat history')
      return []
    }
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  /**
   * Mock chat response for development
   */
  private getMockChatResponse(message: string, context?: any): ChatResponse {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('analyze') || lowerMessage.includes('insights')) {
      return {
        response: `I can see you have ${context?.data?.values?.length || 0} rows of data. Based on the structure, this appears to be ${context?.data?.headers?.join(', ') || 'structured data'}. Let me analyze the key patterns and trends for you.`,
        session_id: 'mock-session',
        suggestions: ['Create a chart', 'Generate summary statistics', 'Look for outliers']
      }
    } else if (lowerMessage.includes('chart') || lowerMessage.includes('visualiz')) {
      return {
        response: `For your data, I recommend a column chart to compare values across categories. The data structure with ${context?.data?.headers?.length || 0} columns would work well for visualization.`,
        session_id: 'mock-session',
        actions: [
          {
            type: 'create_chart',
            target: context?.data?.address || 'A1:C10',
            payload: { chart_type: 'column', title: 'Data Visualization' },
            description: 'Create a column chart from your data'
          }
        ]
      }
    } else if (lowerMessage.includes('formula')) {
      return {
        response: `I can help you create formulas for your data. Based on your selection, you might want to use SUM, AVERAGE, or COUNT functions. What specific calculation are you looking for?`,
        session_id: 'mock-session',
        suggestions: ['Sum values', 'Calculate average', 'Count items', 'Find maximum']
      }
    } else {
      return {
        response: `I'm here to help with your Excel data! I can analyze data, create charts, generate formulas, and provide insights. What would you like me to help you with today?`,
        session_id: 'mock-session',
        suggestions: ['Analyze my data', 'Create a chart', 'Generate a formula']
      }
    }
  }

  /**
   * Mock analysis response for development
   */
  private getMockAnalysisResponse(data: any): AnalysisResponse {
    return {
      insights: [
        {
          title: 'Data Structure',
          description: `Your dataset has ${data.values?.length || 0} rows and ${data.headers?.length || 0} columns`,
          confidence: 1.0,
          category: 'summary'
        },
        {
          title: 'Data Quality',
          description: 'The data appears to be well-structured with proper headers',
          confidence: 0.9,
          category: 'summary'
        }
      ],
      suggestions: [
        {
          title: 'Create Visualization',
          description: 'Consider creating a chart to better understand the data patterns',
          action_type: 'chart',
          priority: 'high',
          estimated_benefit: 'Better data understanding'
        }
      ],
      visualizations: [
        {
          chart_type: 'column',
          title: 'Data Overview',
          data_range: data.address || 'A1:C10',
          description: 'Column chart showing data distribution',
          config: { columns: data.headers || ['Column1', 'Column2'] }
        }
      ],
      summary: `Analysis complete: Your data has ${data.values?.length || 0} rows with ${data.headers?.length || 0} columns. The data appears well-structured and suitable for various types of analysis.`
    }
  }
} 