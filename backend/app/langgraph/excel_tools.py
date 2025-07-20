from langchain_core.tools import tool
from typing import List, Dict, Any, Optional
import json


@tool
def read_excel_range(range_address: str, worksheet_name: Optional[str] = None) -> str:
    """
    Read data from a specific Excel range.
    
    Args:
        range_address: The range address (e.g., 'A1:C5', 'B2', etc.)
        worksheet_name: Optional worksheet name. If not provided, uses active worksheet.
        
    Returns:
        Confirmation that the Excel range read operation was initiated.
    """
    # This is a frontend tool that will be executed by the browser
    # Return a user-friendly message instead of JSON
    worksheet_text = f" from worksheet '{worksheet_name}'" if worksheet_name else ""
    return f"Reading Excel range {range_address}{worksheet_text}. The data will be retrieved from your Excel workbook."


@tool
def write_excel_cell(cell_address: str, value: Any, worksheet_name: Optional[str] = None) -> str:
    """
    Write a value to a specific Excel cell.
    
    Args:
        cell_address: The cell address (e.g., 'A1', 'B5', etc.)
        value: The value to write (number, text, formula, etc.)
        worksheet_name: Optional worksheet name. If not provided, uses active worksheet.
        
    Returns:
        Confirmation message of the cell update.
    """
    worksheet_text = f" in worksheet '{worksheet_name}'" if worksheet_name else ""
    return f"Writing '{value}' to cell {cell_address}{worksheet_text} in your Excel workbook."


@tool
def write_excel_range(range_address: str, values: List[List[Any]], worksheet_name: Optional[str] = None) -> str:
    """
    Write data to a specific Excel range.
    
    Args:
        range_address: The range address (e.g., 'A1:C5')
        values: 2D array of values to write (e.g., [['A1', 'B1'], ['A2', 'B2']])
        worksheet_name: Optional worksheet name. If not provided, uses active worksheet.
        
    Returns:
        Confirmation message of the range update.
    """
    worksheet_text = f" in worksheet '{worksheet_name}'" if worksheet_name else ""
    rows = len(values)
    cols = len(values[0]) if values else 0
    return f"Writing {rows}x{cols} data array to range {range_address}{worksheet_text} in your Excel workbook."


@tool
def get_excel_workbook_info() -> str:
    """
    Get information about the current Excel workbook including worksheets and active sheet.
    
    Returns:
        Information about the current Excel workbook.
    """
    return "Retrieving information about your current Excel workbook, including worksheet names and active sheet."


@tool
def get_excel_selected_range() -> str:
    """
    Get the currently selected range in Excel.
    
    Returns:
        Information about the currently selected range.
    """
    return "Getting information about the currently selected range in your Excel workbook."


@tool
def create_excel_worksheet(worksheet_name: str) -> str:
    """
    Create a new worksheet in the Excel workbook.
    
    Args:
        worksheet_name: Name for the new worksheet
        
    Returns:
        Confirmation message of worksheet creation.
    """
    return f"Creating a new worksheet named '{worksheet_name}' in your Excel workbook."


@tool
def analyze_excel_data(range_address: Optional[str] = None, worksheet_name: Optional[str] = None) -> str:
    """
    Analyze Excel data and provide comprehensive insights and statistics.
    
    The AI will analyze the Excel data available in the current context and provide:
    - Statistical summary (sum, average, count, min, max, median)
    - Data type breakdown (numbers, text, empty cells)
    - Trends and patterns in the data
    - Key insights and recommendations
    
    Args:
        range_address: Optional specific range to focus analysis on (e.g., 'A1:C5')
        worksheet_name: Optional worksheet name to analyze
        
    Returns:
        Comprehensive analysis and insights about the Excel data.
    """
    # This tool triggers the AI to analyze the Excel context that's already available
    # in the system prompt. The AI will provide comprehensive analysis based on 
    # the current Excel workbook state, active worksheet data, and selected ranges.
    
    analysis_scope = []
    if range_address:
        analysis_scope.append(f"specific range {range_address}")
    if worksheet_name:
        analysis_scope.append(f"worksheet '{worksheet_name}'")
    
    scope_text = " for " + " in ".join(analysis_scope) if analysis_scope else ""
    
    return f"🔍 **ANALYZING EXCEL DATA{scope_text.upper()}**\n\nI will now analyze the available Excel data and provide comprehensive insights including statistical summaries, data patterns, and actionable recommendations."


@tool
def find_excel_data(search_term: str, worksheet_name: Optional[str] = None) -> str:
    """
    Find data in Excel worksheet(s) that matches the search term.
    
    Args:
        search_term: The value to search for
        worksheet_name: Optional worksheet name. If not provided, searches active worksheet.
        
    Returns:
        Results of the search operation.
    """
    worksheet_text = f" in worksheet '{worksheet_name}'" if worksheet_name else ""
    return f"Searching for '{search_term}'{worksheet_text} in your Excel workbook and returning matching cell locations."


@tool
def format_excel_range(range_address: str, format_type: str, worksheet_name: Optional[str] = None) -> str:
    """
    Format a range in Excel (e.g., currency, percentage, date, etc.).
    
    Args:
        range_address: The range to format (e.g., 'A1:C5')
        format_type: Type of formatting ('currency', 'percentage', 'date', 'bold', 'italic', etc.)
        worksheet_name: Optional worksheet name.
        
    Returns:
        Confirmation message of formatting applied.
    """
    worksheet_text = f" in worksheet '{worksheet_name}'" if worksheet_name else ""
    return f"Applying '{format_type}' formatting to range {range_address}{worksheet_text} in your Excel workbook."


@tool
def create_excel_chart(data_range: str, chart_type: str, chart_title: str, worksheet_name: Optional[str] = None) -> str:
    """
    Create a chart in Excel from the specified data range.
    
    Args:
        data_range: Range containing the data for the chart (e.g., 'A1:C10')
        chart_type: Type of chart ('column', 'line', 'pie', 'bar', etc.)
        chart_title: Title for the chart
        worksheet_name: Optional worksheet name.
        
    Returns:
        Confirmation message of chart creation.
    """
    worksheet_text = f" in worksheet '{worksheet_name}'" if worksheet_name else ""
    return f"Creating a {chart_type} chart titled '{chart_title}' from data range {data_range}{worksheet_text} in your Excel workbook."


# List of all Excel tools
excel_tools = [
    read_excel_range,
    write_excel_cell,
    write_excel_range,
    get_excel_workbook_info,
    get_excel_selected_range,
    create_excel_worksheet,
    analyze_excel_data,
    find_excel_data,
    format_excel_range,
    create_excel_chart,
] 