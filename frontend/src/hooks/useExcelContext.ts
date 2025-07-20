import { useState, useEffect, useCallback } from 'react';
import { excelService } from '../services/excelService';
import type { RangeData, WorksheetInfo } from '../services/excelService';

export interface ExcelContext {
  // Basic workbook info
  workbookName: string;
  worksheets: WorksheetInfo[];
  activeWorksheet: string;
  
  // Current data
  selectedRange: RangeData | null;
  activeWorksheetData: RangeData | null;
  
  // Status
  isExcelReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ExcelActions {
  // Data retrieval
  refreshContext: () => Promise<void>;
  getSelectedRange: () => Promise<RangeData | null>;
  getRangeData: (address: string, worksheet?: string) => Promise<RangeData>;
  
  // Data modification
  setCellValue: (address: string, value: any, worksheet?: string) => Promise<void>;
  setRangeValues: (address: string, values: any[][], worksheet?: string) => Promise<void>;
  createWorksheet: (name: string) => Promise<void>;
}

export function useExcelContext() {
  const [context, setContext] = useState<ExcelContext>({
    workbookName: '',
    worksheets: [],
    activeWorksheet: '',
    selectedRange: null,
    activeWorksheetData: null,
    isExcelReady: false,
    isLoading: true,
    error: null,
  });

  // Initialize Excel connection
  const initializeExcel = useCallback(async () => {
    try {
      setContext(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if Excel is ready
      const isReady = await excelService.initialize();
      
      if (!isReady) {
        throw new Error('Excel is not available. Please ensure this add-in is running in Excel.');
      }

      // Get initial workbook info
      const workbookInfo = await excelService.getWorkbookInfo();
      
      // Get initial selected range
      let selectedRange: RangeData | null = null;
      try {
        selectedRange = await excelService.getSelectedRange();
      } catch (err) {
        // Selected range might be empty, that's ok
        console.warn('No range selected:', err);
      }
      
      // Get active worksheet data
      let activeWorksheetData: RangeData | null = null;
      try {
        activeWorksheetData = await excelService.getActiveWorksheetData();
      } catch (err) {
        // Worksheet might be empty, that's ok
        console.warn('No data in active worksheet:', err);
      }

      setContext({
        workbookName: workbookInfo.workbookName,
        worksheets: workbookInfo.worksheets,
        activeWorksheet: workbookInfo.activeWorksheet,
        selectedRange,
        activeWorksheetData,
        isExcelReady: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setContext(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize Excel',
      }));
    }
  }, []);

  // Refresh context data
  const refreshContext = useCallback(async () => {
    if (!context.isExcelReady) return;
    
    try {
      setContext(prev => ({ ...prev, isLoading: true }));
      
      // Get updated workbook info
      const workbookInfo = await excelService.getWorkbookInfo();
      
      // Get current selected range
      let selectedRange: RangeData | null = null;
      try {
        selectedRange = await excelService.getSelectedRange();
      } catch (err) {
        console.warn('No range selected:', err);
      }
      
      // Get active worksheet data
      let activeWorksheetData: RangeData | null = null;
      try {
        activeWorksheetData = await excelService.getActiveWorksheetData();
      } catch (err) {
        console.warn('No data in active worksheet:', err);
      }

      setContext(prev => ({
        ...prev,
        workbookName: workbookInfo.workbookName,
        worksheets: workbookInfo.worksheets,
        activeWorksheet: workbookInfo.activeWorksheet,
        selectedRange,
        activeWorksheetData,
        isLoading: false,
      }));
    } catch (error) {
      setContext(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh Excel context',
      }));
    }
  }, [context.isExcelReady]);

  // Get selected range
  const getSelectedRange = useCallback(async (): Promise<RangeData | null> => {
    try {
      const selectedRange = await excelService.getSelectedRange();
      setContext(prev => ({ ...prev, selectedRange }));
      return selectedRange;
    } catch (error) {
      console.warn('Failed to get selected range:', error);
      return null;
    }
  }, []);

  // Get range data
  const getRangeData = useCallback(async (address: string, worksheet?: string): Promise<RangeData> => {
    return await excelService.getRangeData(address, worksheet);
  }, []);

  // Set cell value
  const setCellValue = useCallback(async (address: string, value: any, worksheet?: string): Promise<void> => {
    await excelService.setCellValue(address, value, worksheet);
    // Refresh context to reflect changes
    await refreshContext();
  }, [refreshContext]);

  // Set range values
  const setRangeValues = useCallback(async (address: string, values: any[][], worksheet?: string): Promise<void> => {
    await excelService.setRangeValues(address, values, worksheet);
    // Refresh context to reflect changes
    await refreshContext();
  }, [refreshContext]);

  // Create worksheet
  const createWorksheet = useCallback(async (name: string): Promise<void> => {
    await excelService.createWorksheet(name);
    // Refresh context to include new worksheet
    await refreshContext();
  }, [refreshContext]);

  // Initialize on mount
  useEffect(() => {
    initializeExcel();
  }, [initializeExcel]);

  // Set up Excel event listeners for real-time updates
  useEffect(() => {
    if (!context.isExcelReady) return;

    let selectionChangedHandler: any;

    const setupEventListeners = async () => {
      try {
        await Excel.run(async (excelContext) => {
          // Listen for selection changes
          selectionChangedHandler = excelContext.workbook.onSelectionChanged.add(async () => {
            // Debounce the selection change to avoid too many updates
            setTimeout(async () => {
              try {
                const selectedRange = await excelService.getSelectedRange();
                setContext(prev => ({ ...prev, selectedRange }));
              } catch (error) {
                console.warn('Failed to update selected range:', error);
              }
            }, 500);
          });

          await excelContext.sync();
        });
      } catch (error) {
        console.warn('Failed to set up Excel event listeners:', error);
      }
    };

    setupEventListeners();

    // Cleanup
    return () => {
      if (selectionChangedHandler) {
        Excel.run(async (excelContext) => {
          selectionChangedHandler.remove();
          await excelContext.sync();
        }).catch(console.warn);
      }
    };
  }, [context.isExcelReady]);

  const actions: ExcelActions = {
    refreshContext,
    getSelectedRange,
    getRangeData,
    setCellValue,
    setRangeValues,
    createWorksheet,
  };

  return { context, actions };
}

// Helper function to format Excel context for the AI assistant
export function formatExcelContextForAI(context: ExcelContext): string {
  if (!context.isExcelReady) {
    return "Excel is not ready or available.";
  }

  let contextString = `Excel Context:
- Workbook: ${context.workbookName}
- Active Worksheet: ${context.activeWorksheet}
- Available Worksheets: ${context.worksheets.map(ws => ws.name).join(', ')}`;

  if (context.selectedRange) {
    contextString += `
- Selected Range: ${context.selectedRange.address}
- Selected Data: ${JSON.stringify(context.selectedRange.values)}`;
  }

  if (context.activeWorksheetData) {
    const { values } = context.activeWorksheetData;
    const summary = values.length > 5 
      ? `${values.length} rows of data (showing first 5 rows)`
      : `${values.length} rows of data`;
    
    contextString += `
- Active Worksheet Data (${context.activeWorksheetData.address}): ${summary}`;
    
    // Include first few rows as context
    const dataToShow = values.slice(0, 5);
    if (dataToShow.length > 0) {
      contextString += `
- Data Preview: ${JSON.stringify(dataToShow)}`;
    }
  }

  return contextString;
} 