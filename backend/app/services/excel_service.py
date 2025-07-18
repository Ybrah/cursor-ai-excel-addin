"""
Excel Service for handling Excel data operations and validation
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime
import re

from app.models.excel import (
    ExcelData, DataValidationResult, ValidationError, CleanedData,
    ExportResult, DataTransformation
)


class ExcelService:
    """Service for Excel data operations"""
    
    def __init__(self):
        self.max_file_size = 50 * 1024 * 1024  # 50MB limit
    
    async def validate_data(self, data: ExcelData) -> DataValidationResult:
        """Validate Excel data format and structure"""
        errors = []
        warnings = []
        suggestions = []
        
        try:
            # Convert to DataFrame for easier validation
            df = self._excel_data_to_dataframe(data)
            
            # Check for empty data
            if df.empty:
                errors.append(ValidationError(
                    row=0, column=0,
                    message="Data is empty",
                    severity="error"
                ))
            
            # Check for inconsistent row lengths
            if data.values:
                expected_cols = len(data.values[0]) if data.values else 0
                for i, row in enumerate(data.values):
                    if len(row) != expected_cols:
                        errors.append(ValidationError(
                            row=i, column=len(row),
                            message=f"Row has {len(row)} columns, expected {expected_cols}",
                            severity="warning"
                        ))
            
            # Check for data type consistency in columns
            for col_idx, column in enumerate(df.columns):
                col_data = df[column].dropna()
                if not col_data.empty:
                    # Check for mixed data types
                    types = set(type(val).__name__ for val in col_data)
                    if len(types) > 2:  # Allow for some flexibility
                        warnings.append(ValidationError(
                            row=0, column=col_idx,
                            message=f"Column '{column}' has mixed data types: {', '.join(types)}",
                            severity="warning"
                        ))
            
            # Check for missing headers
            if not data.headers:
                suggestions.append("Consider adding column headers for better data organization")
            
            # Check for potential duplicates
            if not df.empty:
                duplicates = df.duplicated().sum()
                if duplicates > 0:
                    warnings.append(ValidationError(
                        row=0, column=0,
                        message=f"Found {duplicates} potential duplicate rows",
                        severity="info"
                    ))
            
            # Suggest data cleaning if needed
            if self._needs_cleaning(df):
                suggestions.append("Data may benefit from cleaning (removing empty cells, standardizing formats)")
            
            is_valid = len([e for e in errors if e.severity == "error"]) == 0
            
            return DataValidationResult(
                is_valid=is_valid,
                errors=errors,
                warnings=warnings,
                suggestions=suggestions
            )
            
        except Exception as e:
            return DataValidationResult(
                is_valid=False,
                errors=[ValidationError(
                    row=0, column=0,
                    message=f"Validation error: {str(e)}",
                    severity="error"
                )],
                warnings=[],
                suggestions=[]
            )
    
    async def clean_data(self, data: ExcelData) -> CleanedData:
        """Clean and preprocess Excel data"""
        try:
            df = self._excel_data_to_dataframe(data)
            original_shape = df.shape
            changes_applied = []
            
            # Remove completely empty rows
            initial_rows = len(df)
            df = df.dropna(how='all')
            rows_removed = initial_rows - len(df)
            if rows_removed > 0:
                changes_applied.append(f"Removed {rows_removed} empty rows")
            
            # Clean string columns
            cells_modified = 0
            for column in df.select_dtypes(include=['object']).columns:
                # Remove extra whitespace
                original_values = df[column].astype(str)
                df[column] = df[column].astype(str).str.strip()
                modified_this_col = (original_values != df[column]).sum()
                cells_modified += modified_this_col
                
                if modified_this_col > 0:
                    changes_applied.append(f"Trimmed whitespace in column '{column}'")
            
            # Standardize number formats
            for column in df.columns:
                if df[column].dtype == 'object':
                    # Try to convert strings that look like numbers
                    numeric_mask = df[column].astype(str).str.match(r'^-?\d+\.?\d*$', na=False)
                    if numeric_mask.sum() > len(df) * 0.8:  # If 80% look like numbers
                        try:
                            df[column] = pd.to_numeric(df[column], errors='coerce')
                            changes_applied.append(f"Converted column '{column}' to numeric")
                        except:
                            pass
            
            # Convert back to ExcelData format
            cleaned_values = df.values.tolist()
            
            return CleanedData(
                values=cleaned_values,
                changes_applied=changes_applied,
                rows_removed=rows_removed,
                cells_modified=cells_modified
            )
            
        except Exception as e:
            return CleanedData(
                values=data.values,
                changes_applied=[f"Error during cleaning: {str(e)}"],
                rows_removed=0,
                cells_modified=0
            )
    
    async def transform_data(self, data: ExcelData, operations: List[DataTransformation]) -> ExcelData:
        """Transform Excel data based on specified operations"""
        try:
            df = self._excel_data_to_dataframe(data)
            
            for operation in operations:
                df = self._apply_transformation(df, operation)
            
            # Convert back to ExcelData
            return ExcelData(
                values=df.values.tolist(),
                headers=df.columns.tolist(),
                address=data.address,
                sheet_name=data.sheet_name
            )
            
        except Exception as e:
            # Return original data if transformation fails
            return data
    
    async def export_data(self, data: ExcelData, format: str) -> ExportResult:
        """Export data in various formats"""
        try:
            df = self._excel_data_to_dataframe(data)
            
            # Generate a unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"excel_export_{timestamp}"
            
            if format == "csv":
                file_path = f"/tmp/{filename}.csv"
                df.to_csv(file_path, index=False)
            elif format == "json":
                file_path = f"/tmp/{filename}.json"
                df.to_json(file_path, orient='records', indent=2)
            elif format == "xlsx":
                file_path = f"/tmp/{filename}.xlsx"
                df.to_excel(file_path, index=False)
            else:
                raise ValueError(f"Unsupported format: {format}")
            
            # In a real implementation, you'd upload to cloud storage
            # For now, return a mock URL
            return ExportResult(
                url=f"/downloads/{filename}.{format}",
                format=format,
                size_bytes=1024,  # Mock size
                expires_at=datetime.now()
            )
            
        except Exception as e:
            raise Exception(f"Export failed: {str(e)}")
    
    def _excel_data_to_dataframe(self, data: ExcelData) -> pd.DataFrame:
        """Convert ExcelData to pandas DataFrame"""
        if not data.values:
            return pd.DataFrame()
        
        # Use headers if provided, otherwise generate column names
        if data.headers:
            columns = data.headers
            values = data.values
        else:
            # Generate column names
            num_cols = len(data.values[0]) if data.values else 0
            columns = [f"Column_{i+1}" for i in range(num_cols)]
            values = data.values
        
        return pd.DataFrame(values, columns=columns)
    
    def _needs_cleaning(self, df: pd.DataFrame) -> bool:
        """Check if data needs cleaning"""
        if df.empty:
            return False
        
        # Check for empty rows
        empty_rows = df.isnull().all(axis=1).sum()
        
        # Check for inconsistent data types
        mixed_types = False
        for column in df.columns:
            col_data = df[column].dropna()
            if not col_data.empty:
                types = set(type(val).__name__ for val in col_data)
                if len(types) > 2:
                    mixed_types = True
                    break
        
        return empty_rows > 0 or mixed_types
    
    def _apply_transformation(self, df: pd.DataFrame, operation: DataTransformation) -> pd.DataFrame:
        """Apply a single transformation to the DataFrame"""
        
        if operation.operation == "sort":
            column = operation.parameters.get("column")
            ascending = operation.parameters.get("ascending", True)
            if column in df.columns:
                return df.sort_values(by=column, ascending=ascending)
        
        elif operation.operation == "filter":
            column = operation.parameters.get("column")
            condition = operation.parameters.get("condition")
            value = operation.parameters.get("value")
            
            if column in df.columns and condition and value is not None:
                if condition == "equals":
                    return df[df[column] == value]
                elif condition == "greater_than":
                    return df[df[column] > value]
                elif condition == "less_than":
                    return df[df[column] < value]
                elif condition == "contains":
                    return df[df[column].astype(str).str.contains(str(value), na=False)]
        
        elif operation.operation == "group":
            group_by = operation.parameters.get("group_by")
            agg_func = operation.parameters.get("agg_func", "sum")
            if group_by and group_by in df.columns:
                return df.groupby(group_by).agg(agg_func).reset_index()
        
        # If transformation fails or is not supported, return original DataFrame
        return df 