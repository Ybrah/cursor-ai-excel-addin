import type { ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { useExcelContext, formatExcelContextForAI } from "../hooks/useExcelContext";


/**
 * Preprocess message content by replacing Excel keywords with actual data
 */
async function preprocessMessageContent(
  content: string, 
  excelContext: any, 
  excelActions: any
): Promise<string> {
  let processedContent = content;

  console.log('🔍 [MessagePreprocessor] Processing message:', content);

  try {
    // Replace @selected_range with actual selected range data
    if (processedContent.includes('@selected_range')) {
      console.log('📊 [MessagePreprocessor] Found @selected_range keyword');
      
      if (excelContext.selectedRange) {
        const rangeData = await excelActions.getRangeData(excelContext.selectedRange.address);
        const rangeContent = formatRangeDataForAI(rangeData);
        
        processedContent = processedContent.replace(
          /@selected_range/g, 
          `selected range ${rangeData.address}:\n${rangeContent}`
        );
        
        console.log('✅ [MessagePreprocessor] Replaced @selected_range');
      } else {
        processedContent = processedContent.replace(
          /@selected_range/g, 
          'no range currently selected'
        );
        
        console.log('⚠️ [MessagePreprocessor] No range selected, replaced with fallback');
      }
    }

    // Replace @active_sheet with current worksheet data (first 10 rows)
    if (processedContent.includes('@active_sheet')) {
      console.log('📄 [MessagePreprocessor] Found @active_sheet keyword');
      
      try {
        const worksheetData = await excelActions.getActiveWorksheetData();
        const sheetContent = formatWorksheetDataForAI(worksheetData, 10); // First 10 rows
        
        processedContent = processedContent.replace(
          /@active_sheet/g,
          `active worksheet "${excelContext.activeWorksheet}":\n${sheetContent}`
        );
        
        console.log('✅ [MessagePreprocessor] Replaced @active_sheet');
      } catch (error) {
        console.warn('⚠️ [MessagePreprocessor] Failed to get active sheet data:', error);
        processedContent = processedContent.replace(
          /@active_sheet/g,
          `active worksheet "${excelContext.activeWorksheet}" (data unavailable)`
        );
      }
    }

    // Replace @workbook_info with workbook information
    if (processedContent.includes('@workbook_info')) {
      console.log('📋 [MessagePreprocessor] Found @workbook_info keyword');
      
      const workbookInfo = formatWorkbookInfoForAI(excelContext);
      processedContent = processedContent.replace(
        /@workbook_info/g,
        workbookInfo
      );
      
      console.log('✅ [MessagePreprocessor] Replaced @workbook_info');
    }

  } catch (error) {
    console.error('💥 [MessagePreprocessor] Error during preprocessing:', error);
  }

  return processedContent;
}

/**
 * Format range data for AI consumption
 */
function formatRangeDataForAI(rangeData: any): string {
  if (!rangeData || !rangeData.values) {
    return 'No data available';
  }

  const rows = rangeData.values.map((row: any[], rowIndex: number) => {
    const cells = row.map((cell, colIndex) => {
      const cellAddress = indexToExcelAddress(rowIndex, colIndex);
      return `${cellAddress}: ${cell || '(empty)'}`;
    }).join(', ');
    return `Row ${rowIndex + 1}: ${cells}`;
  });

  return rows.join('\n');
}

/**
 * Format worksheet data for AI consumption (limited rows)
 */
function formatWorksheetDataForAI(worksheetData: any, maxRows: number = 10): string {
  if (!worksheetData || !worksheetData.values) {
    return 'No data available';
  }

  const limitedRows = worksheetData.values.slice(0, maxRows);
  const rows = limitedRows.map((row: any[], rowIndex: number) => {
    const cells = row.map((cell, colIndex) => {
      const cellAddress = indexToExcelAddress(rowIndex, colIndex);
      return `${cellAddress}: ${cell || '(empty)'}`;
    }).join(', ');
    return `Row ${rowIndex + 1}: ${cells}`;
  });

  const totalRows = worksheetData.values.length;
  const footer = totalRows > maxRows ? `\n... (showing first ${maxRows} of ${totalRows} rows)` : '';

  return rows.join('\n') + footer;
}

/**
 * Format workbook information for AI consumption
 */
function formatWorkbookInfoForAI(excelContext: any): string {
  const info = [
    `Workbook: ${excelContext.workbookName || 'Unknown'}`,
    `Active Worksheet: ${excelContext.activeWorksheet || 'Unknown'}`,
    `Available Worksheets: ${excelContext.worksheets.map((ws: any) => ws.name).join(', ')}`,
  ];

  if (excelContext.selectedRange) {
    info.push(`Selected Range: ${excelContext.selectedRange.address}`);
  }

  return info.join('\n');
}

/**
 * Convert row/column indices to Excel address (e.g., 0,0 -> A1)
 */
function indexToExcelAddress(row: number, col: number): string {
  let columnName = '';
  let tempCol = col;
  
  while (tempCol >= 0) {
    columnName = String.fromCharCode(65 + (tempCol % 26)) + columnName;
    tempCol = Math.floor(tempCol / 26) - 1;
  }
  
  return columnName + (row + 1);
}


// Inner component that handles Excel tool execution
function ExcelToolExecutionProvider({ children }: { children: ReactNode }) {
  // Tool execution interception removed - tools now handled by backend
  return <>{children}</>;
}

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { context: excelContext, actions: excelActions } = useExcelContext();

  // Create a proper ChatModelAdapter with streaming support
  const MyModelAdapter: ChatModelAdapter = {
    async *run({ messages, abortSignal }) {
      console.log('🚀 [LocalRuntime] Starting streaming run with messages:', messages);

      // Preprocess the last message for Excel keywords
      let processedMessages = [...messages];
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.role === 'user' && lastMessage.content?.[0]?.type === 'text' && excelContext.isExcelReady) {
        const originalContent = lastMessage.content[0].text;
        const preprocessedContent = await preprocessMessageContent(
          originalContent, 
          excelContext, 
          excelActions
        );
        
        // Update the message with preprocessed content if it changed
        if (preprocessedContent !== originalContent) {
          processedMessages = [
            ...messages.slice(0, -1), 
            {
              ...lastMessage,
              content: [{ type: 'text', text: preprocessedContent }]
            }
          ];
          console.log('🔄 [LocalRuntime] Preprocessed message with Excel keywords');
        }
      }

      const requestBody = {
        messages: processedMessages,
        tools: [],
        system: `You are an AI assistant integrated with Microsoft Excel. You have access to the current Excel workbook and can read and modify Excel data.

${formatExcelContextForAI(excelContext)}

You can use the following Excel capabilities:
- Read data from any range or cell
- Write data to cells and ranges
- Create new worksheets
- Analyze data and provide insights
- Find specific data in worksheets
- Format cells and ranges
- Create charts from data

When users ask about Excel data or want to modify spreadsheets, use the appropriate Excel tools to help them. Always be specific about cell addresses and range references.

KEYWORD PREPROCESSING: 
Users can use these keywords in their messages:
- @selected_range: Replaced with actual selected range data
- @active_sheet: Replaced with current worksheet data (first 10 rows)
- @workbook_info: Replaced with workbook information`,
      };

      console.log('📤 [LocalRuntime] Sending request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortSignal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [LocalRuntime] Request failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ [LocalRuntime] Response received, starting stream processing...');

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                // Parse the streaming format: 0:"text"
                if (line.startsWith('0:')) {
                  const jsonStr = line.substring(2);
                  const chunk = JSON.parse(jsonStr);
                  fullText += chunk;
                  
                  console.log('📥 [LocalRuntime] Stream chunk:', chunk);
                  
                  // Yield the current accumulated text
                  yield {
                    content: [{ type: "text" as const, text: fullText }],
                  };
                }
              } catch (error) {
                console.warn('⚠️ [LocalRuntime] Failed to parse chunk:', line, error);
              }
            }
          }
        }
        
        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            if (buffer.startsWith('0:')) {
              const jsonStr = buffer.substring(2);
              const chunk = JSON.parse(jsonStr);
              fullText += chunk;
              
              yield {
                content: [{ type: "text" as const, text: fullText }],
              };
            }
          } catch (error) {
            console.warn('⚠️ [LocalRuntime] Failed to parse final chunk:', buffer, error);
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log('📥 [LocalRuntime] Stream complete. Final text:', fullText);
    },
  };

  const runtime = useLocalRuntime(MyModelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ExcelToolExecutionProvider>
        {children}
      </ExcelToolExecutionProvider>
    </AssistantRuntimeProvider>
  );
}