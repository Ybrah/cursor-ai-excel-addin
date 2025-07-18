"""
AI Service for handling OpenAI interactions and AI functionality
"""

import openai
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid

from app.models.chat import ChatMessage
from app.models.excel import (
    ExcelData, FormulaResult, ChartSuggestion, 
    PatternAnalysis, DataSummary
)


class AIService:
    """Service for AI operations using OpenAI"""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        
        # In-memory storage for demo (replace with proper database in production)
        self.chat_histories: Dict[str, List[ChatMessage]] = {}
    
    async def get_chat_history(self, session_id: str) -> List[ChatMessage]:
        """Get chat history for a session"""
        return self.chat_histories.get(session_id, [])
    
    async def clear_chat_history(self, session_id: str) -> None:
        """Clear chat history for a session"""
        if session_id in self.chat_histories:
            del self.chat_histories[session_id]
    
    async def add_to_chat_history(self, session_id: str, message: ChatMessage) -> None:
        """Add message to chat history"""
        if session_id not in self.chat_histories:
            self.chat_histories[session_id] = []
        self.chat_histories[session_id].append(message)
    
    async def generate_formula(self, data: ExcelData, description: str) -> FormulaResult:
        """Generate Excel formula from natural language description"""
        
        # Prepare context about the data
        data_context = self._prepare_data_context(data)
        
        prompt = f"""
        You are an Excel formula expert. Generate an Excel formula based on the user's description.
        
        Data Context:
        {data_context}
        
        User Request: {description}
        
        Please provide:
        1. The Excel formula
        2. A clear explanation of what it does
        3. An example of how it would work with the provided data
        4. Your confidence level (0.0 to 1.0)
        
        Respond in JSON format:
        {{
            "formula": "=FORMULA_HERE",
            "explanation": "Clear explanation",
            "example": "Example usage",
            "confidence": 0.95
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            
            result = json.loads(response.choices[0].message.content)
            return FormulaResult(**result)
            
        except Exception as e:
            # Fallback response
            return FormulaResult(
                formula="=SUM(A:A)",
                explanation=f"Error generating formula: {str(e)}",
                example="Example not available",
                confidence=0.1
            )
    
    async def suggest_charts(self, data: ExcelData, context: Optional[str] = None) -> List[ChartSuggestion]:
        """Suggest appropriate chart types for the data"""
        
        data_context = self._prepare_data_context(data)
        
        prompt = f"""
        You are a data visualization expert. Suggest the best chart types for this data.
        
        Data Context:
        {data_context}
        
        Additional Context: {context or "None"}
        
        Suggest 2-3 appropriate chart types with reasoning. Respond in JSON format:
        [
            {{
                "chart_type": "bar_chart",
                "title": "Suggested title",
                "reasoning": "Why this chart is appropriate",
                "data_columns": ["column1", "column2"],
                "confidence": 0.9
            }}
        ]
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            
            suggestions = json.loads(response.choices[0].message.content)
            return [ChartSuggestion(**suggestion) for suggestion in suggestions]
            
        except Exception as e:
            # Fallback response
            return [
                ChartSuggestion(
                    chart_type="bar_chart",
                    title="Data Overview",
                    reasoning=f"Default suggestion due to error: {str(e)}",
                    data_columns=data.headers or ["Column1"],
                    confidence=0.1
                )
            ]
    
    async def detect_patterns(self, data: ExcelData) -> PatternAnalysis:
        """Detect patterns and anomalies in the data"""
        
        data_context = self._prepare_data_context(data)
        
        prompt = f"""
        You are a data analyst. Analyze this data for patterns, anomalies, trends, and correlations.
        
        Data Context:
        {data_context}
        
        Provide analysis in JSON format:
        {{
            "patterns": [
                {{"type": "seasonal", "description": "Description", "confidence": 0.8}}
            ],
            "anomalies": [
                {{"row": 5, "column": 2, "value": "anomalous_value", "description": "Why it's anomalous"}}
            ],
            "trends": [
                {{"direction": "increasing", "strength": "strong", "description": "Trend description"}}
            ],
            "correlations": [
                {{"columns": ["col1", "col2"], "strength": 0.8, "type": "positive"}}
            ]
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            
            analysis = json.loads(response.choices[0].message.content)
            return PatternAnalysis(**analysis)
            
        except Exception as e:
            # Fallback response
            return PatternAnalysis(
                patterns=[],
                anomalies=[],
                trends=[],
                correlations=[]
            )
    
    async def generate_data_summary(self, data: ExcelData, focus_areas: List[str]) -> DataSummary:
        """Generate a comprehensive data summary"""
        
        data_context = self._prepare_data_context(data)
        focus_context = ", ".join(focus_areas) if focus_areas else "general overview"
        
        prompt = f"""
        You are a data analyst. Provide a comprehensive summary of this data.
        
        Data Context:
        {data_context}
        
        Focus Areas: {focus_context}
        
        Provide summary in JSON format:
        {{
            "text": "Comprehensive text summary",
            "key_metrics": {{
                "total_rows": 100,
                "total_columns": 5,
                "data_quality": "good"
            }},
            "highlights": ["Key insight 1", "Key insight 2"],
            "recommendations": ["Recommendation 1", "Recommendation 2"]
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            
            summary = json.loads(response.choices[0].message.content)
            return DataSummary(**summary)
            
        except Exception as e:
            # Fallback response
            return DataSummary(
                text=f"Error generating summary: {str(e)}",
                key_metrics={"error": True},
                highlights=[],
                recommendations=[]
            )
    
    def _prepare_data_context(self, data: ExcelData) -> str:
        """Prepare data context for AI prompts"""
        context = f"Range: {data.address}\n"
        
        if data.headers:
            context += f"Headers: {', '.join(data.headers)}\n"
        
        if data.sheet_name:
            context += f"Sheet: {data.sheet_name}\n"
        
        # Include sample of data (first few rows)
        context += f"Rows: {len(data.values)}, Columns: {len(data.values[0]) if data.values else 0}\n"
        
        if data.values:
            context += "Sample data (first 3 rows):\n"
            for i, row in enumerate(data.values[:3]):
                context += f"Row {i+1}: {row}\n"
        
        return context 