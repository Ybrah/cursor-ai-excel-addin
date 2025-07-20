import { excelService } from './excelService';
import type { ExcelActions } from '../hooks/useExcelContext';

export interface ExcelToolCall {
  action: string;
  [key: string]: any;
}

export interface ExcelToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Excel Bridge - Executes Excel operations based on AI tool calls
 * This service translates between backend tool calls and frontend Excel operations
 */
export class ExcelBridge {
  private excelActions: ExcelActions;

  constructor(excelActions: ExcelActions) {
    this.excelActions = excelActions;
  }

  /**
   * Execute an Excel tool call and return the result
   */
  async executeToolCall(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    try {
      switch (toolCall.action) {
        case 'read_range':
          return await this.handleReadRange(toolCall);
        
        case 'write_cell':
          return await this.handleWriteCell(toolCall);
        
        case 'write_range':
          return await this.handleWriteRange(toolCall);
        
        case 'get_workbook_info':
          return await this.handleGetWorkbookInfo();
        
        case 'get_selected_range':
          return await this.handleGetSelectedRange();
        
        case 'create_worksheet':
          return await this.handleCreateWorksheet(toolCall);
        
        case 'analyze_data':
          return await this.handleAnalyzeData(toolCall);
        
        case 'find_data':
          return await this.handleFindData(toolCall);
        
        case 'format_range':
          return await this.handleFormatRange(toolCall);
        
        case 'create_chart':
          return await this.handleCreateChart(toolCall);
        
        default:
          return {
            success: false,
            error: `Unknown Excel action: ${toolCall.action}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async handleReadRange(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    const { range_address, worksheet_name } = toolCall;
    const data = await this.excelActions.getRangeData(range_address, worksheet_name);
    
    return {
      success: true,
      data: {
        address: data.address,
        values: data.values,
        formulas: data.formulas,
        summary: `Read ${data.values.length} rows and ${data.values[0]?.length || 0} columns from ${data.address}`
      }
    };
  }

  private async handleWriteCell(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    const { cell_address, value, worksheet_name } = toolCall;
    await this.excelActions.setCellValue(cell_address, value, worksheet_name);
    
    return {
      success: true,
      data: {
        message: `Successfully wrote "${value}" to cell ${cell_address}${worksheet_name ? ` in worksheet "${worksheet_name}"` : ''}`
      }
    };
  }

  private async handleWriteRange(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    const { range_address, values, worksheet_name } = toolCall;
    await this.excelActions.setRangeValues(range_address, values, worksheet_name);
    
    return {
      success: true,
      data: {
        message: `Successfully wrote ${values.length} rows and ${values[0]?.length || 0} columns to range ${range_address}${worksheet_name ? ` in worksheet "${worksheet_name}"` : ''}`
      }
    };
  }

  private async handleGetWorkbookInfo(): Promise<ExcelToolResult> {
    // This info is already available in the context, but we can refresh it
    await this.excelActions.refreshContext();
    
    return {
      success: true,
      data: {
        message: "Workbook information refreshed and available in context"
      }
    };
  }

  private async handleGetSelectedRange(): Promise<ExcelToolResult> {
    const selectedRange = await this.excelActions.getSelectedRange();
    
    if (!selectedRange) {
      return {
        success: true,
        data: {
          message: "No range is currently selected",
          selectedRange: null
        }
      };
    }
    
    return {
      success: true,
      data: {
        message: `Selected range: ${selectedRange.address}`,
        selectedRange: {
          address: selectedRange.address,
          values: selectedRange.values,
          formulas: selectedRange.formulas
        }
      }
    };
  }

  private async handleCreateWorksheet(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    const { worksheet_name } = toolCall;
    await this.excelActions.createWorksheet(worksheet_name);
    
    return {
      success: true,
      data: {
        message: `Successfully created worksheet "${worksheet_name}"`
      }
    };
  }

  private async handleAnalyzeData(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    console.log('🔍 [ExcelBridge] Preparing Excel data for AI analysis...', toolCall);
    
    try {
      const { range_address, worksheet_name } = toolCall;
      
      // Get the raw Excel data to send to AI backend
      let data;
      if (range_address) {
        console.log(`📊 [ExcelBridge] Getting range data: ${range_address}`);
        data = await this.excelActions.getRangeData(range_address, worksheet_name);
      } else {
        console.log('📊 [ExcelBridge] Getting selected range data...');
        const selectedRange = await this.excelActions.getSelectedRange();
        if (selectedRange) {
          data = selectedRange;
        } else {
          console.warn('⚠️ [ExcelBridge] No range specified and no range selected');
          return {
            success: false,
            error: "No range specified and no range selected for analysis"
          };
        }
      }

      console.log('📊 [ExcelBridge] Raw data retrieved for AI:', data);

      // Validate data exists
      if (!data) {
        return {
          success: false,
          error: "No data retrieved for analysis"
        };
      }

      // NOTE: Analysis should be done by AI backend, not here
      // This is just preparing the data context for the AI
      console.log('🤖 [ExcelBridge] Data ready to send to AI backend for analysis');
      
      return {
        success: true,
        data: {
          range: data.address,
          rawData: data, // Send raw Excel data to backend
          message: `Data from ${data.address} ready for AI analysis`
        }
      };
      
    } catch (error) {
      console.error('💥 [ExcelBridge] Failed to prepare data for AI:', error);
      return {
        success: false,
        error: `Failed to prepare data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleFindData(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    const { search_term, worksheet_name } = toolCall;
    
    // For now, we'll get all data and search through it
    // In a real implementation, you might want to use Excel's find API
    try {
      const data = await excelService.getActiveWorksheetData();
      const results = this.findInData(data.values, search_term);
      
      return {
        success: true,
        data: {
          searchTerm: search_term,
          results: results,
          message: `Found ${results.length} matches for "${search_term}"`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search for "${search_term}": ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleFormatRange(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    // This is a placeholder - actual formatting would require more complex Office.js calls
    const { range_address, format_type, worksheet_name } = toolCall;
    
    return {
      success: true,
      data: {
        message: `Formatting "${format_type}" would be applied to range ${range_address}${worksheet_name ? ` in worksheet "${worksheet_name}"` : ''}. (Note: Advanced formatting not yet implemented)`
      }
    };
  }

  private async handleCreateChart(toolCall: ExcelToolCall): Promise<ExcelToolResult> {
    // This is a placeholder - chart creation would require more complex Office.js calls
    const { data_range, chart_type, chart_title, worksheet_name } = toolCall;
    
    return {
      success: true,
      data: {
        message: `Chart "${chart_title}" of type "${chart_type}" would be created from range ${data_range}${worksheet_name ? ` in worksheet "${worksheet_name}"` : ''}. (Note: Chart creation not yet implemented)`
      }
    };
  }

  // NOTE: Analysis methods removed - AI backend handles all analysis

  /**
   * Find search term in data
   */
  private findInData(values: any[][], searchTerm: string): any[] {
    const results: any[] = [];
    const searchLower = searchTerm.toLowerCase();

    values.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== null && cell !== undefined) {
          const cellStr = String(cell).toLowerCase();
          if (cellStr.includes(searchLower)) {
            results.push({
              row: rowIndex + 1,
              column: colIndex + 1,
              address: this.indexToAddress(rowIndex, colIndex),
              value: cell,
              match: cellStr.includes(searchLower)
            });
          }
        }
      });
    });

    return results;
  }



  /**
   * Convert row/column indices to Excel address (e.g., 0,0 -> A1)
   */
  private indexToAddress(row: number, col: number): string {
    let columnName = '';
    let tempCol = col;
    
    while (tempCol >= 0) {
      columnName = String.fromCharCode(65 + (tempCol % 26)) + columnName;
      tempCol = Math.floor(tempCol / 26) - 1;
    }
    
    return columnName + (row + 1);
  }
} 