import { makeAssistantToolUI } from "@assistant-ui/react";
import { CheckIcon, LoaderIcon, XIcon, TableIcon, FileSpreadsheetIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Excel Read Range Tool UI
export const ExcelReadRangeUI = makeAssistantToolUI<
  { range_address: string; worksheet_name?: string },
  { address: string; values: any[][]; formulas?: string[][]; summary: string }
>({
  toolName: "read_excel_range",
  render: ({ args, result, status }) => {
    return (
      <div className="my-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <FileSpreadsheetIcon className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Reading Excel Data</h3>
          {status.type === "running" && <LoaderIcon className="h-4 w-4 animate-spin text-green-600" />}
          {status.type === "complete" && <CheckIcon className="h-4 w-4 text-green-600" />}
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Range:</span> {args.range_address}
            {args.worksheet_name && (
              <span className="ml-2">
                <span className="font-medium">Sheet:</span> {args.worksheet_name}
              </span>
            )}
          </p>

          {status.type === "running" && (
            <p className="text-green-700">Fetching data from Excel...</p>
          )}

          {result && (
            <div className="mt-3">
              <p className="text-green-700 mb-2">{result.summary}</p>
              
              {result.values && result.values.length > 0 && (
                <div className="bg-white rounded border overflow-hidden">
                  <div className="max-h-48 overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {result.values[0]?.map((_, colIndex) => (
                            <th key={colIndex} className="px-2 py-1 text-left font-medium text-gray-700">
                              {String.fromCharCode(65 + colIndex)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.values.slice(0, 10).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {row.map((cell, colIndex) => (
                              <td key={colIndex} className="px-2 py-1 border-r border-gray-200">
                                {String(cell || "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.values.length > 10 && (
                    <div className="bg-gray-50 px-2 py-1 text-xs text-gray-600 text-center">
                      Showing first 10 rows of {result.values.length} total rows
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
});

// Excel Write Cell Tool UI
export const ExcelWriteCellUI = makeAssistantToolUI<
  { cell_address: string; value: any; worksheet_name?: string },
  { message: string }
>({
  toolName: "write_excel_cell",
  render: ({ args, result, status }) => {
    return (
      <div className="my-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <PlusIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Writing to Excel</h3>
          {status.type === "running" && <LoaderIcon className="h-4 w-4 animate-spin text-blue-600" />}
          {status.type === "complete" && <CheckIcon className="h-4 w-4 text-blue-600" />}
        </div>

        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <p>
              <span className="font-medium">Cell:</span> {args.cell_address}
            </p>
            <p>
              <span className="font-medium">Value:</span> 
              <code className="ml-1 px-1 bg-white rounded text-xs">
                {String(args.value)}
              </code>
            </p>
          </div>

          {args.worksheet_name && (
            <p>
              <span className="font-medium">Worksheet:</span> {args.worksheet_name}
            </p>
          )}

          {status.type === "running" && (
            <p className="text-blue-700">Updating Excel cell...</p>
          )}

          {result && (
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <p className="text-blue-800">✅ {result.message}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
});

// Excel Analyze Data Tool UI - Now handles AI-generated analysis text
export const ExcelAnalyzeDataUI = makeAssistantToolUI<
  { range_address?: string; worksheet_name?: string },
  string // Backend now returns AI-generated text analysis
>({
  toolName: "analyze_excel_data",
  render: ({ args, result, status }) => {
    return (
      <div className="my-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TableIcon className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-800">🤖 AI Data Analysis</h3>
          {status.type === "running" && <LoaderIcon className="h-4 w-4 animate-spin text-purple-600" />}
          {status.type === "complete" && <CheckIcon className="h-4 w-4 text-purple-600" />}
        </div>

        <div className="space-y-3 text-sm">
          {args.range_address && (
            <p>
              <span className="font-medium">📊 Target Range:</span> 
              <code className="ml-1 px-2 py-1 bg-white rounded text-xs font-medium">
                {args.range_address}
              </code>
            </p>
          )}

          {args.worksheet_name && (
            <p>
              <span className="font-medium">📄 Worksheet:</span> 
              <code className="ml-1 px-2 py-1 bg-white rounded text-xs font-medium">
                {args.worksheet_name}
              </code>
            </p>
          )}

          {status.type === "running" && (
            <div className="flex items-center space-x-2 text-purple-700">
              <LoaderIcon className="h-4 w-4 animate-spin" />
              <span>AI is analyzing your Excel data...</span>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="prose prose-sm max-w-none">
                {/* Display AI-generated analysis as formatted text */}
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {result}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
});

// Excel Create Worksheet Tool UI
export const ExcelCreateWorksheetUI = makeAssistantToolUI<
  { worksheet_name: string },
  { message: string }
>({
  toolName: "create_excel_worksheet",
  render: ({ args, result, status }) => {
    return (
      <div className="my-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <PlusIcon className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Creating Worksheet</h3>
          {status.type === "running" && <LoaderIcon className="h-4 w-4 animate-spin text-green-600" />}
          {status.type === "complete" && <CheckIcon className="h-4 w-4 text-green-600" />}
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Worksheet Name:</span> 
            <code className="ml-1 px-2 py-1 bg-white rounded text-xs font-medium">
              {args.worksheet_name}
            </code>
          </p>

          {status.type === "running" && (
            <p className="text-green-700">Creating new worksheet...</p>
          )}

          {result && (
            <div className="mt-3 p-3 bg-green-100 rounded">
              <p className="text-green-800">✅ {result.message}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}); 