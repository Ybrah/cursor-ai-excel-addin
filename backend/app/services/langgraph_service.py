"""
LangGraph Service for orchestrating AI workflows and decision trees
"""

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor
from typing import Dict, List, Optional, Any, TypedDict
import uuid
from datetime import datetime

from app.models.chat import (
    ExcelContext, ExcelAction, LangGraphChatResponse,
    AnalysisRequest, AnalysisResponse, Insight, Suggestion, Visualization
)
from app.models.excel import ExcelData
from app.services.ai_service import AIService


class ChatState(TypedDict):
    """State for chat workflow"""
    message: str
    context: Optional[ExcelContext]
    session_id: str
    response: str
    actions: List[ExcelAction]
    reasoning: str
    intent: str


class AnalysisState(TypedDict):
    """State for analysis workflow"""
    data: ExcelData
    query: Optional[str]
    analysis_type: Optional[str]
    insights: List[Insight]
    suggestions: List[Suggestion]
    visualizations: List[Visualization]
    summary: str


class LangGraphService:
    """Service for LangGraph AI workflow orchestration"""
    
    def __init__(self):
        self.ai_service = AIService()
        
        # Build the chat workflow graph
        self.chat_graph = self._build_chat_workflow()
        
        # Build the analysis workflow graph
        self.analysis_graph = self._build_analysis_workflow()
    
    def _build_chat_workflow(self) -> StateGraph:
        """Build the chat processing workflow using LangGraph"""
        
        workflow = StateGraph(ChatState)
        
        # Add nodes
        workflow.add_node("understand_intent", self._understand_intent)
        workflow.add_node("process_excel_query", self._process_excel_query)
        workflow.add_node("process_general_query", self._process_general_query)
        workflow.add_node("generate_actions", self._generate_actions)
        workflow.add_node("finalize_response", self._finalize_response)
        
        # Add edges (workflow flow)
        workflow.set_entry_point("understand_intent")
        
        # Conditional routing based on intent
        workflow.add_conditional_edges(
            "understand_intent",
            self._route_by_intent,
            {
                "excel_query": "process_excel_query",
                "general_query": "process_general_query"
            }
        )
        
        workflow.add_edge("process_excel_query", "generate_actions")
        workflow.add_edge("process_general_query", "finalize_response")
        workflow.add_edge("generate_actions", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _build_analysis_workflow(self) -> StateGraph:
        """Build the data analysis workflow using LangGraph"""
        
        workflow = StateGraph(AnalysisState)
        
        # Add nodes
        workflow.add_node("analyze_data_structure", self._analyze_data_structure)
        workflow.add_node("generate_insights", self._generate_insights)
        workflow.add_node("suggest_visualizations", self._suggest_visualizations)
        workflow.add_node("create_summary", self._create_summary)
        
        # Add edges
        workflow.set_entry_point("analyze_data_structure")
        workflow.add_edge("analyze_data_structure", "generate_insights")
        workflow.add_edge("generate_insights", "suggest_visualizations")
        workflow.add_edge("suggest_visualizations", "create_summary")
        workflow.add_edge("create_summary", END)
        
        return workflow.compile()
    
    async def process_chat_message(
        self, 
        message: str, 
        context: Optional[ExcelContext] = None,
        session_id: Optional[str] = None
    ) -> LangGraphChatResponse:
        """Process a chat message through the LangGraph workflow"""
        
        # Initialize state
        initial_state = ChatState(
            message=message,
            context=context,
            session_id=session_id or str(uuid.uuid4()),
            response="",
            actions=[],
            reasoning="",
            intent=""
        )
        
        # Run the workflow
        final_state = await self.chat_graph.ainvoke(initial_state)
        
        return LangGraphChatResponse(
            content=final_state["response"],
            actions=final_state["actions"],
            session_id=final_state["session_id"],
            reasoning=final_state["reasoning"]
        )
    
    async def analyze_data(
        self,
        data: ExcelData,
        query: Optional[str] = None,
        analysis_type: Optional[str] = None
    ) -> AnalysisResponse:
        """Analyze data through the LangGraph workflow"""
        
        # Initialize state
        initial_state = AnalysisState(
            data=data,
            query=query,
            analysis_type=analysis_type,
            insights=[],
            suggestions=[],
            visualizations=[],
            summary=""
        )
        
        # Run the workflow
        final_state = await self.analysis_graph.ainvoke(initial_state)
        
        return AnalysisResponse(
            insights=final_state["insights"],
            suggestions=final_state["suggestions"],
            visualizations=final_state["visualizations"],
            summary=final_state["summary"]
        )
    
    # Chat workflow nodes
    async def _understand_intent(self, state: ChatState) -> ChatState:
        """Understand the user's intent"""
        
        message = state["message"]
        context = state.get("context")
        
        # Simple intent classification (in production, use a more sophisticated model)
        excel_keywords = [
            "formula", "chart", "data", "cell", "column", "row", "sum", "average",
            "pivot", "filter", "sort", "analyze", "calculate", "graph", "table"
        ]
        
        has_excel_context = context and (context.data or context.selected_range)
        has_excel_keywords = any(keyword in message.lower() for keyword in excel_keywords)
        
        if has_excel_context or has_excel_keywords:
            intent = "excel_query"
            reasoning = "Message appears to be Excel-related based on context or keywords"
        else:
            intent = "general_query"
            reasoning = "Message appears to be a general query"
        
        state["intent"] = intent
        state["reasoning"] = reasoning
        
        return state
    
    async def _process_excel_query(self, state: ChatState) -> ChatState:
        """Process Excel-specific queries"""
        
        message = state["message"]
        context = state.get("context")
        
        # Use AI service to process the Excel query
        if context and context.data:
            # Analyze the request in context of the data
            response = await self._generate_excel_response(message, context.data)
        else:
            # General Excel help
            response = await self._generate_general_excel_response(message)
        
        state["response"] = response
        
        return state
    
    async def _process_general_query(self, state: ChatState) -> ChatState:
        """Process general queries"""
        
        message = state["message"]
        
        # Simple response for general queries
        response = f"I'm focused on helping with Excel tasks. For '{message}', I'd recommend using the Excel features or asking a more specific Excel-related question."
        
        state["response"] = response
        
        return state
    
    async def _generate_actions(self, state: ChatState) -> ChatState:
        """Generate Excel actions based on the processed query"""
        
        message = state["message"]
        context = state.get("context")
        
        actions = []
        
        # Simple action generation logic
        if "formula" in message.lower() and context and context.selected_range:
            actions.append(ExcelAction(
                type="insert_formula",
                target=context.selected_range,
                payload={"formula": "=SUM(A1:A10)"},  # Placeholder
                description="Insert calculated formula"
            ))
        
        elif "chart" in message.lower() and context and context.data:
            actions.append(ExcelAction(
                type="create_chart",
                target=context.data.address,
                payload={"chart_type": "column", "title": "Data Visualization"},
                description="Create chart from selected data"
            ))
        
        state["actions"] = actions
        
        return state
    
    async def _finalize_response(self, state: ChatState) -> ChatState:
        """Finalize the response"""
        
        # Add any final processing or formatting
        response = state["response"]
        actions = state.get("actions", [])
        
        if actions:
            response += f"\n\nI can help you with {len(actions)} action(s) in Excel."
        
        state["response"] = response
        
        return state
    
    def _route_by_intent(self, state: ChatState) -> str:
        """Route workflow based on detected intent"""
        return state["intent"]
    
    # Analysis workflow nodes
    async def _analyze_data_structure(self, state: AnalysisState) -> AnalysisState:
        """Analyze the structure of the provided data"""
        
        data = state["data"]
        
        # Basic structural analysis
        num_rows = len(data.values) if data.values else 0
        num_cols = len(data.values[0]) if data.values and data.values[0] else 0
        
        # Add structural insights
        insights = []
        
        if num_rows > 1000:
            insights.append(Insight(
                title="Large Dataset",
                description=f"Dataset contains {num_rows} rows, which is quite substantial",
                confidence=1.0,
                category="summary"
            ))
        
        if data.headers:
            insights.append(Insight(
                title="Well-Structured Data",
                description="Data has proper column headers which aids in analysis",
                confidence=0.9,
                category="summary"
            ))
        
        state["insights"] = insights
        
        return state
    
    async def _generate_insights(self, state: AnalysisState) -> AnalysisState:
        """Generate insights from the data"""
        
        data = state["data"]
        existing_insights = state["insights"]
        
        # Use AI service for more sophisticated analysis
        pattern_analysis = await self.ai_service.detect_patterns(data)
        
        # Convert patterns to insights
        for pattern in pattern_analysis.patterns:
            existing_insights.append(Insight(
                title=f"Pattern: {pattern.get('type', 'Unknown')}",
                description=pattern.get('description', 'Pattern detected in data'),
                confidence=pattern.get('confidence', 0.5),
                category="pattern"
            ))
        
        # Add trend insights
        for trend in pattern_analysis.trends:
            existing_insights.append(Insight(
                title=f"Trend: {trend.get('direction', 'Unknown')}",
                description=trend.get('description', 'Trend detected in data'),
                confidence=0.8,
                category="trend"
            ))
        
        state["insights"] = existing_insights
        
        return state
    
    async def _suggest_visualizations(self, state: AnalysisState) -> AnalysisState:
        """Suggest appropriate visualizations"""
        
        data = state["data"]
        
        # Use AI service to suggest charts
        chart_suggestions = await self.ai_service.suggest_charts(data)
        
        # Convert to visualizations
        visualizations = []
        for suggestion in chart_suggestions:
            visualizations.append(Visualization(
                chart_type=suggestion.chart_type,
                title=suggestion.title,
                data_range=data.address,
                description=suggestion.reasoning,
                config={"columns": suggestion.data_columns}
            ))
        
        state["visualizations"] = visualizations
        
        return state
    
    async def _create_summary(self, state: AnalysisState) -> AnalysisState:
        """Create a comprehensive summary"""
        
        insights = state["insights"]
        visualizations = state["visualizations"]
        
        # Generate summary based on insights
        insight_count = len(insights)
        viz_count = len(visualizations)
        
        summary = f"Analysis complete: Found {insight_count} insights and suggested {viz_count} visualizations. "
        
        if insights:
            top_insight = max(insights, key=lambda x: x.confidence)
            summary += f"Key finding: {top_insight.title} - {top_insight.description}"
        
        state["summary"] = summary
        
        return state
    
    # Helper methods
    async def _generate_excel_response(self, message: str, data: ExcelData) -> str:
        """Generate Excel-specific response using AI"""
        
        data_context = f"Working with data: {len(data.values)} rows, {len(data.values[0]) if data.values else 0} columns"
        if data.headers:
            data_context += f", Headers: {', '.join(data.headers)}"
        
        prompt = f"""
        User message: {message}
        Data context: {data_context}
        
        Provide a helpful response for this Excel-related query. Be specific and actionable.
        """
        
        try:
            # In a real implementation, you'd call the AI service
            # For now, return a simple response
            return f"I can help you with that Excel task. Based on your data with {len(data.values)} rows, here's what I suggest..."
        except:
            return "I'd be happy to help with your Excel task. Could you provide more details?"
    
    async def _generate_general_excel_response(self, message: str) -> str:
        """Generate general Excel help response"""
        
        return f"For Excel help with '{message}', I can assist with formulas, charts, data analysis, and more. Try selecting some data first so I can provide more specific help." 