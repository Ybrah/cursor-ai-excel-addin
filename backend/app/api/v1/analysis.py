"""
Analysis API endpoints for AI-powered data analysis
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.excel import ExcelData
from app.models.chat import AnalysisRequest, AnalysisResponse, Insight, Suggestion
from app.services.ai_service import AIService
from app.services.langgraph_service import LangGraphService

router = APIRouter()

# Initialize services
ai_service = AIService()
langgraph_service = LangGraphService()


@router.post("/analysis/insights", response_model=AnalysisResponse)
async def generate_insights(request: AnalysisRequest):
    """
    Generate AI-powered insights from Excel data
    """
    try:
        # Use LangGraph to analyze the data
        analysis_result = await langgraph_service.analyze_data(
            data=request.data,
            query=request.query,
            analysis_type=request.analysis_type
        )
        
        return AnalysisResponse(
            insights=analysis_result.insights,
            suggestions=analysis_result.suggestions,
            visualizations=analysis_result.visualizations,
            summary=analysis_result.summary
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")


@router.post("/analysis/formula")
async def generate_formula(data: ExcelData, description: str):
    """
    Generate Excel formula from natural language description
    """
    try:
        formula_result = await ai_service.generate_formula(
            data=data,
            description=description
        )
        
        return {
            "formula": formula_result.formula,
            "explanation": formula_result.explanation,
            "example": formula_result.example,
            "confidence": formula_result.confidence
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating formula: {str(e)}")


@router.post("/analysis/chart-suggestions")
async def suggest_charts(data: ExcelData, context: Optional[str] = None):
    """
    Suggest appropriate chart types for the data
    """
    try:
        chart_suggestions = await ai_service.suggest_charts(
            data=data,
            context=context
        )
        
        return {
            "suggestions": chart_suggestions,
            "reasoning": [suggestion.reasoning for suggestion in chart_suggestions]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting charts: {str(e)}")


@router.post("/analysis/patterns")
async def detect_patterns(data: ExcelData):
    """
    Detect patterns and anomalies in the data
    """
    try:
        pattern_analysis = await ai_service.detect_patterns(data)
        
        return {
            "patterns": pattern_analysis.patterns,
            "anomalies": pattern_analysis.anomalies,
            "trends": pattern_analysis.trends,
            "correlations": pattern_analysis.correlations
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting patterns: {str(e)}")


@router.post("/analysis/summary")
async def generate_summary(data: ExcelData, focus_areas: Optional[List[str]] = None):
    """
    Generate a comprehensive data summary
    """
    try:
        summary = await ai_service.generate_data_summary(
            data=data,
            focus_areas=focus_areas or []
        )
        
        return {
            "summary": summary.text,
            "key_metrics": summary.key_metrics,
            "highlights": summary.highlights,
            "recommendations": summary.recommendations
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}") 