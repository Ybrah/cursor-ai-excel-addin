import { useState } from "react";
import { FileSpreadsheetIcon, InfoIcon, XIcon } from "lucide-react";
import { useExcelContext } from "@/hooks/useExcelContext";
import { TooltipIconButton } from "./tooltip-icon-button";
import { cn } from "@/lib/utils";

export const ExcelContextButton = () => {
  const { context: excelContext } = useExcelContext();
  const [includeContext, setIncludeContext] = useState(false);

  // Format Excel context for display in tooltip
  const getTooltipContent = () => {
    if (!excelContext.isExcelReady) {
      return "Excel not connected";
    }

    const lines = [
      `📊 ${excelContext.workbookName}`,
      `📄 Active: ${excelContext.activeWorksheet}`,
    ];

    if (excelContext.selectedRange) {
      lines.push(`🎯 Selected: ${excelContext.selectedRange.address}`);
    }

    if (excelContext.worksheets.length > 1) {
      lines.push(`📁 ${excelContext.worksheets.length} worksheets`);
    }

    lines.push(`\n${includeContext ? "💬 Excel context is active" : "💬 Excel context available"}`);

    return lines.join("\n");
  };

  // Handle clicking the Excel context button
  const handleClick = () => {
    if (!excelContext.isExcelReady) {
      return;
    }

    // Toggle the visual indicator
    setIncludeContext(!includeContext);
    
    // The Excel context is already automatically included in the runtime provider
    // This button serves as a visual indicator of Excel connectivity and current state
  };

  // Get the appropriate icon and styling based on state
  const getButtonState = () => {
    if (!excelContext.isExcelReady) {
      return {
        icon: <XIcon className="h-4 w-4" />,
        className: "text-red-500 hover:text-red-600",
        tooltip: "Excel not connected"
      };
    }

    if (excelContext.isLoading) {
      return {
        icon: <InfoIcon className="h-4 w-4 animate-pulse" />,
        className: "text-yellow-500 hover:text-yellow-600",
        tooltip: "Loading Excel context..."
      };
    }

    return {
      icon: <FileSpreadsheetIcon className="h-4 w-4" />,
      className: includeContext 
        ? "text-green-500 hover:text-green-600 bg-green-50" 
        : "text-gray-400 hover:text-green-500",
      tooltip: getTooltipContent()
    };
  };

  const buttonState = getButtonState();

  return (
    <TooltipIconButton
      tooltip={buttonState.tooltip}
      onClick={handleClick}
      disabled={!excelContext.isExcelReady || excelContext.isLoading}
      className={cn(
        "my-2.5 size-8 p-2 transition-all ease-in-out duration-200",
        buttonState.className,
        includeContext && "ring-2 ring-green-200"
      )}
      variant="ghost"
    >
      {buttonState.icon}
    </TooltipIconButton>
  );
}; 