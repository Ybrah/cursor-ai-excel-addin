/**
 * Excel Service - Handles all Excel interactions using Office.js
 * This service provides functions to read and write Excel data
 */

export interface CellData {
  address: string;
  value: any;
  formula?: string;
  format?: string;
}

export interface RangeData {
  address: string;
  values: any[][];
  formulas?: string[][];
}

export interface WorksheetInfo {
  name: string;
  id: string;
  isActive: boolean;
}

class ExcelService {
  /**
   * Initialize Office.js and ensure Excel is ready
   */
  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if running in Excel context
      if (typeof Office !== 'undefined' && Office.context) {
        Office.onReady((info) => {
          if (info.host === Office.HostType.Excel) {
            console.log('✅ Office.js initialized in Excel context');
            resolve(true);
          } else {
            console.warn('⚠️ Office.js loaded but not in Excel context');
            resolve(false);
          }
        });
      } else {
        console.warn('⚠️ Office.js not available - running outside Excel context');
        resolve(false);
      }
    });
  }

  /**
   * Get current workbook and worksheet information
   */
  async getWorkbookInfo(): Promise<{
    workbookName: string;
    worksheets: WorksheetInfo[];
    activeWorksheet: string;
  }> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const workbook = context.workbook;
          const worksheets = workbook.worksheets;
          
          // Load properties
          workbook.load("name");
          worksheets.load("items/name, items/id");
          
          await context.sync();
          
          const worksheetInfo: WorksheetInfo[] = worksheets.items.map(ws => ({
            name: ws.name,
            id: ws.id,
            isActive: false // We'll determine the active one separately
          }));
          
          // Get active worksheet
          const activeWorksheet = workbook.worksheets.getActiveWorksheet();
          activeWorksheet.load("name");
          await context.sync();
          
          // Mark active worksheet
          worksheetInfo.forEach(ws => {
            ws.isActive = ws.name === activeWorksheet.name;
          });
          
          resolve({
            workbookName: workbook.name || "Untitled",
            worksheets: worksheetInfo,
            activeWorksheet: activeWorksheet.name
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get selected range data
   */
  async getSelectedRange(): Promise<RangeData | null> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const selectedRange = context.workbook.getSelectedRange();
          selectedRange.load("address, values, formulas");
          
          await context.sync();
          
          resolve({
            address: selectedRange.address,
            values: selectedRange.values,
            formulas: selectedRange.formulas
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get data from a specific range
   */
  async getRangeData(rangeAddress: string, worksheetName?: string): Promise<RangeData> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          let worksheet;
          if (worksheetName) {
            worksheet = context.workbook.worksheets.getItem(worksheetName);
          } else {
            worksheet = context.workbook.worksheets.getActiveWorksheet();
          }
          
          const range = worksheet.getRange(rangeAddress);
          range.load("address, values, formulas");
          
          await context.sync();
          
          resolve({
            address: range.address,
            values: range.values,
            formulas: range.formulas
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get all data from active worksheet (up to used range)
   */
  async getActiveWorksheetData(): Promise<RangeData> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const worksheet = context.workbook.worksheets.getActiveWorksheet();
          const usedRange = worksheet.getUsedRange();
          
          usedRange.load("address, values, formulas");
          
          await context.sync();
          
          resolve({
            address: usedRange.address,
            values: usedRange.values,
            formulas: usedRange.formulas
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Write data to a specific cell
   */
  async setCellValue(cellAddress: string, value: any, worksheetName?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          let worksheet;
          if (worksheetName) {
            worksheet = context.workbook.worksheets.getItem(worksheetName);
          } else {
            worksheet = context.workbook.worksheets.getActiveWorksheet();
          }
          
          const cell = worksheet.getRange(cellAddress);
          cell.values = [[value]];
          
          await context.sync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Write data to a range
   */
  async setRangeValues(rangeAddress: string, values: any[][], worksheetName?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          let worksheet;
          if (worksheetName) {
            worksheet = context.workbook.worksheets.getItem(worksheetName);
          } else {
            worksheet = context.workbook.worksheets.getActiveWorksheet();
          }
          
          const range = worksheet.getRange(rangeAddress);
          range.values = values;
          
          await context.sync();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Create a new worksheet
   */
  async createWorksheet(name: string): Promise<WorksheetInfo> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          const newWorksheet = context.workbook.worksheets.add(name);
          newWorksheet.load("name, id");
          
          await context.sync();
          
          resolve({
            name: newWorksheet.name,
            id: newWorksheet.id,
            isActive: false
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get table data if any tables exist
   */
  async getTables(worksheetName?: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Excel.run(async (context) => {
        try {
          let worksheet;
          if (worksheetName) {
            worksheet = context.workbook.worksheets.getItem(worksheetName);
          } else {
            worksheet = context.workbook.worksheets.getActiveWorksheet();
          }
          
          const tables = worksheet.tables;
          tables.load("items/name, items/id");
          
          await context.sync();
          
          const tableInfo = tables.items.map(table => ({
            name: table.name,
            id: table.id
          }));
          
          resolve(tableInfo);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

// Export singleton instance
export const excelService = new ExcelService(); 