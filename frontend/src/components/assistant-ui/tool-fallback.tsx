import type { ToolCallContentPartComponent } from "@assistant-ui/react";
import { ChevronDownIcon, ChevronRightIcon, PlayIcon, CheckIcon, XIcon, LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const ToolFallback: ToolCallContentPartComponent = ({ toolName, args, result, status, argsText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status icon based on tool execution state
  const getStatusIcon = () => {
    switch (status.type) {
      case "running":
        return <LoaderIcon className="h-4 w-4 animate-spin text-blue-500" />;
      case "complete":
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case "incomplete":
        if (status.reason === "error") {
          return <XIcon className="h-4 w-4 text-red-500" />;
        }
        return <XIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <PlayIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format tool name for display
  const formatToolName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Check if this is an Excel tool
  const isExcelTool = toolName.toLowerCase().includes('excel') || 
                     toolName.startsWith('read_excel') ||
                     toolName.startsWith('write_excel') ||
                     toolName.startsWith('get_excel') ||
                     toolName.startsWith('create_excel') ||
                     toolName.startsWith('analyze_excel') ||
                     toolName.startsWith('find_excel') ||
                     toolName.startsWith('format_excel');

  const getStatusText = () => {
    switch (status.type) {
      case "running":
        return isExcelTool ? "Working with Excel..." : "Executing...";
      case "complete":
        return isExcelTool ? "Excel operation completed" : "Completed";
      case "incomplete":
        if (status.reason === "error") {
          return isExcelTool ? "Excel operation failed" : "Failed";
        }
        return "Cancelled";
      default:
        return "Ready";
    }
  };

  return (
    <div className={cn(
      "my-2 rounded-lg border bg-white",
      isExcelTool && "border-green-200 bg-green-50",
      status.type === "running" && "border-blue-200 bg-blue-50",
      status.type === "incomplete" && status.reason === "error" && "border-red-200 bg-red-50"
    )}>
      {/* Tool Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h4 className="font-medium text-gray-900">
              {isExcelTool && "📊 "}{formatToolName(toolName)}
            </h4>
            <p className="text-sm text-gray-500">{getStatusText()}</p>
          </div>
        </div>
        
        <button
          type="button"
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <span>Details</span>
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-3 space-y-3">
          {/* Tool Arguments */}
          {args && Object.keys(args).length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                Parameters
              </h5>
              <div className="bg-gray-50 rounded p-2 text-sm">
                {Object.entries(args).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="text-gray-800 ml-2 break-all">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Result */}
          {result && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                Result
              </h5>
              <div className="bg-gray-50 rounded p-2">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Error Details */}
          {status.type === "incomplete" && status.reason === "error" && (
            <div>
              <h5 className="text-xs font-medium text-red-700 uppercase tracking-wide mb-2">
                Error Details
              </h5>
                             <div className="bg-red-50 border border-red-200 rounded p-2">
                 <p className="text-sm text-red-800">
                   {(status.error as Error)?.message || String(status.error) || "An unknown error occurred"}
                 </p>
               </div>
            </div>
          )}

          {/* Excel-specific helpful info */}
          {isExcelTool && status.type === "complete" && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <p className="text-sm text-green-800">
                ✅ Excel operation completed successfully! Your spreadsheet has been updated.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 