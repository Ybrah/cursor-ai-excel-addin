/**
 * Excel Service for handling Office.js interactions
 */

export interface ExcelData {
  values: any[][];
  formulas?: string[][];
  address: string;
  headers?: string[];
  rows?: number;
  columns?: number;
}

export interface ExcelAction {
  type: 'insert_formula' | 'create_chart' | 'format_cells' | 'insert_data' | 'select_range';
  target: string;
  payload: any;
  description: string;
}

export class ExcelService {
  /**
   * Check if Office.js is available
   */
  private isOfficeAvailable(): boolean {
    return typeof window.Office !== 'undefined' && window.Office.context;
  }

  /**
   * Get the currently selected range data
   */
  async getSelectedRange(): Promise<ExcelData> {
    if (!this.isOfficeAvailable()) {
      // Return mock data for development
      return {
        values: [
          ['Product', 'Sales', 'Region'],
          ['Widget A', 1000, 'North'],
          ['Widget B', 1500, 'South'],
          ['Widget C', 1200, 'East']
        ],
        address: 'A1:C4',
        headers: ['Product', 'Sales', 'Region'],
        rows: 4,
        columns: 3
      };
    }

    return new Promise((resolve, reject) => {
      window.Excel.run(async (context: any) => {
        try {
          const range = context.workbook.getSelectedRange();
          range.load(['values', 'formulas', 'address', 'rowCount', 'columnCount']);
          
          await context.sync();
          
          const data: ExcelData = {
            values: range.values,
            formulas: range.formulas,
            address: range.address,
            rows: range.rowCount,
            columns: range.columnCount
          };

          // Extract headers if the first row looks like headers
          if (data.values && data.values.length > 0) {
            const firstRow = data.values[0];
            const looksLikeHeaders = firstRow.every((cell: any) => 
              typeof cell === 'string' && cell.trim().length > 0
            );
            
            if (looksLikeHeaders) {
              data.headers = firstRow as string[];
            }
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Insert a formula into a specific range
   */
  async insertFormula(range: string, formula: string): Promise<void> {
    if (!this.isOfficeAvailable()) {
      console.log(`Mock: Insert formula ${formula} into range ${range}`);
      return;
    }

    return new Promise((resolve, reject) => {
      window.Excel.run(async (context: any) => {
        try {
          const targetRange = context.workbook.worksheets.getActiveWorksheet().getRange(range);
          targetRange.formulas = [[formula]];
          
          await context.sync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Create a chart from the specified data range
   */
  async createChart(dataRange: string, chartType: string = 'ColumnClustered'): Promise<void> {
    if (!this.isOfficeAvailable()) {
      console.log(`Mock: Create ${chartType} chart from range ${dataRange}`);
      return;
    }

    return new Promise((resolve, reject) => {
      window.Excel.run(async (context: any) => {
        try {
          const worksheet = context.workbook.worksheets.getActiveWorksheet();
          const range = worksheet.getRange(dataRange);
          
          const chart = worksheet.charts.add(chartType, range, 'Auto');
          chart.title.text = 'Data Analysis Chart';
          
          await context.sync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Select a specific range in Excel
   */
  async selectRange(range: string): Promise<void> {
    if (!this.isOfficeAvailable()) {
      console.log(`Mock: Select range ${range}`);
      return;
    }

    return new Promise((resolve, reject) => {
      window.Excel.run(async (context: any) => {
        try {
          const targetRange = context.workbook.worksheets.getActiveWorksheet().getRange(range);
          targetRange.select();
          
          await context.sync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Insert data into a specific range
   */
  async insertData(range: string, data: any[][]): Promise<void> {
    if (!this.isOfficeAvailable()) {
      console.log(`Mock: Insert data into range ${range}`, data);
      return;
    }

    return new Promise((resolve, reject) => {
      window.Excel.run(async (context: any) => {
        try {
          const targetRange = context.workbook.worksheets.getActiveWorksheet().getRange(range);
          targetRange.values = data;
          
          await context.sync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Execute an Excel action
   */
  async executeAction(action: ExcelAction): Promise<void> {
    try {
      switch (action.type) {
        case 'insert_formula':
          await this.insertFormula(action.target, action.payload.formula);
          break;
        
        case 'create_chart':
          await this.createChart(action.target, action.payload.chart_type);
          break;
        
        case 'select_range':
          await this.selectRange(action.target);
          break;
        
        case 'insert_data':
          await this.insertData(action.target, action.payload.data);
          break;
        
        case 'format_cells':
          await this.formatCells(action.target, action.payload);
          break;
        
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Failed to execute action ${action.type}:`, error);
      throw error;
    }
  }

  /**
   * Format cells in a range
   */
  async formatCells(range: string, formatting: any): Promise<void> {
    if (!this.isOfficeAvailable()) {
      console.log(`Mock: Format range ${range}`, formatting);
      return;
    }

    return new Promise((resolve, reject) => {
      window.Excel.run(async (context: any) => {
        try {
          const targetRange = context.workbook.worksheets.getActiveWorksheet().getRange(range);
          
          if (formatting.backgroundColor) {
            targetRange.format.fill.color = formatting.backgroundColor;
          }
          
          if (formatting.fontColor) {
            targetRange.format.font.color = formatting.fontColor;
          }
          
          if (formatting.bold !== undefined) {
            targetRange.format.font.bold = formatting.bold;
          }
          
          await context.sync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get worksheet information
   */
  async getWorksheetInfo(): Promise<{ name: string; activeSheet: string }> {
    if (!this.isOfficeAvailable()) {
      return { name: 'Mock Workbook', activeSheet: 'Sheet1' };
    }

    return new Promise((resolve, reject) => {
      window.Excel.run(async (context: any) => {
        try {
          const workbook = context.workbook;
          const worksheet = workbook.worksheets.getActiveWorksheet();
          
          workbook.load('name');
          worksheet.load('name');
          
          await context.sync();
          
          resolve({
            name: workbook.name || 'Workbook',
            activeSheet: worksheet.name
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }
} 