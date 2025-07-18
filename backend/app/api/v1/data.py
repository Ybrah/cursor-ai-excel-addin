"""
Data API endpoints for Excel data operations
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.models.excel import ExcelData, ExcelDataRequest, DataValidationResponse
from app.services.excel_service import ExcelService

router = APIRouter()

# Initialize service
excel_service = ExcelService()


@router.post("/data/validate", response_model=DataValidationResponse)
async def validate_excel_data(request: ExcelDataRequest):
    """
    Validate Excel data format and structure
    """
    try:
        validation_result = await excel_service.validate_data(request.data)
        
        return DataValidationResponse(
            is_valid=validation_result.is_valid,
            errors=validation_result.errors,
            warnings=validation_result.warnings,
            suggestions=validation_result.suggestions
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating data: {str(e)}")


@router.post("/data/clean")
async def clean_excel_data(request: ExcelDataRequest):
    """
    Clean and preprocess Excel data
    """
    try:
        cleaned_data = await excel_service.clean_data(request.data)
        
        return {
            "original_data": request.data,
            "cleaned_data": cleaned_data,
            "changes_made": cleaned_data.changes_applied
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning data: {str(e)}")


@router.post("/data/transform")
async def transform_excel_data(request: ExcelDataRequest):
    """
    Transform Excel data based on specified operations
    """
    try:
        transformed_data = await excel_service.transform_data(
            data=request.data,
            operations=request.operations
        )
        
        return {
            "original_data": request.data,
            "transformed_data": transformed_data,
            "operations_applied": request.operations
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transforming data: {str(e)}")


@router.post("/data/export")
async def export_excel_data(request: ExcelDataRequest):
    """
    Export data in various formats
    """
    try:
        export_result = await excel_service.export_data(
            data=request.data,
            format=request.export_format or "xlsx"
        )
        
        return {
            "export_url": export_result.url,
            "format": export_result.format,
            "size": export_result.size_bytes
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}") 