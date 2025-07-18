"""
Pydantic models for Excel data operations
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union, Literal
from datetime import datetime


class ExcelData(BaseModel):
    """Excel data structure"""
    values: List[List[Any]] = Field(..., description="2D array of cell values")
    formulas: Optional[List[List[str]]] = Field(None, description="2D array of formulas")
    address: str = Field(..., description="Range address (e.g., 'A1:C10')")
    headers: Optional[List[str]] = Field(None, description="Column headers")
    sheet_name: Optional[str] = Field(None, description="Name of the worksheet")
    data_types: Optional[List[str]] = Field(None, description="Data types for each column")


class DataTransformation(BaseModel):
    """Data transformation operation"""
    operation: Literal["sort", "filter", "group", "pivot", "aggregate", "clean"]
    parameters: Dict[str, Any]
    description: str


class ExcelDataRequest(BaseModel):
    """Request containing Excel data and operations"""
    data: ExcelData
    operations: Optional[List[DataTransformation]] = None
    export_format: Optional[Literal["xlsx", "csv", "json", "pdf"]] = None


class ValidationError(BaseModel):
    """Data validation error"""
    row: int
    column: int
    message: str
    severity: Literal["error", "warning", "info"]


class DataValidationResult(BaseModel):
    """Result of data validation"""
    is_valid: bool
    errors: List[ValidationError]
    warnings: List[ValidationError]
    suggestions: List[str]


class DataValidationResponse(BaseModel):
    """Response from data validation endpoint"""
    is_valid: bool
    errors: List[ValidationError]
    warnings: List[ValidationError]
    suggestions: List[str]


class CleanedData(BaseModel):
    """Result of data cleaning operation"""
    values: List[List[Any]]
    changes_applied: List[str]
    rows_removed: int
    cells_modified: int


class ExportResult(BaseModel):
    """Result of data export operation"""
    url: str
    format: str
    size_bytes: int
    expires_at: datetime


class FormulaResult(BaseModel):
    """Result of formula generation"""
    formula: str
    explanation: str
    example: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class ChartSuggestion(BaseModel):
    """Chart type suggestion"""
    chart_type: str
    title: str
    reasoning: str
    data_columns: List[str]
    confidence: float = Field(..., ge=0.0, le=1.0)


class PatternAnalysis(BaseModel):
    """Result of pattern detection"""
    patterns: List[Dict[str, Any]]
    anomalies: List[Dict[str, Any]]
    trends: List[Dict[str, Any]]
    correlations: List[Dict[str, Any]]


class DataSummary(BaseModel):
    """Comprehensive data summary"""
    text: str
    key_metrics: Dict[str, Any]
    highlights: List[str]
    recommendations: List[str] 