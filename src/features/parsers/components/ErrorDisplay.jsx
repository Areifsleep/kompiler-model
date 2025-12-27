import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const severityConfig = {
  error: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    borderColor: "border-red-500",
    label: "ERROR",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    borderColor: "border-yellow-500",
    label: "WARNING",
  },
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    borderColor: "border-blue-500",
    label: "INFO",
  },
};

export function ErrorDisplay({ errors }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  // Group errors by severity
  const errorsBySeverity = errors.reduce((acc, error) => {
    const severity = error.severity || "error";
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(error);
    return acc;
  }, {});

  const errorCount = errorsBySeverity.error?.length || 0;
  const warningCount = errorsBySeverity.warning?.length || 0;

  return (
    <div className="w-full space-y-4">
      {/* Summary Header */}
      <div className="flex items-center gap-4 text-sm font-medium px-1">
        {errorCount > 0 && (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            <span>
              {errorCount} Error{errorCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {warningCount} Warning{warningCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Error List Container */}
      {/* max-h-150 diganti max-h-[600px] atau class scrollarea custom */}
      <div className="w-full space-y-3 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(errorsBySeverity).map(([severity, errs]) => {
          const config = severityConfig[severity] || severityConfig.error;
          const Icon = config.icon;

          return errs.map((error, index) => (
            <Alert
              key={`${severity}-${index}`}
              className={cn(
                "w-full border-l-4 shadow-sm flex items-start gap-3 p-4", // Tambahkan flex disini agar icon tidak absolute
                config.borderColor,
                config.bgColor
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color)} />

              <div className="flex-1 min-w-0">
                {" "}
                {/* min-w-0 mencegah text overflow flex item */}
                <AlertTitle className="flex items-center gap-2 mb-2">
                  <span className={cn("font-bold tracking-tight", config.color)}>{config.label}</span>
                  {error.line && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground border">
                      Line {error.line}
                    </span>
                  )}
                </AlertTitle>
                <AlertDescription className="text-sm font-medium text-foreground/90 mb-2">
                  {error.message}, please {error.suggestion.toLowerCase()}.
                </AlertDescription>
                {/* Context */}
                {error.context && (
                  <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded inline-block mb-2 border border-black/5 dark:border-white/5">
                    <span className="font-semibold opacity-70">Context:</span> {error.context}
                  </div>
                )}
                {/* Code Preview */}
                {error.codePreview && (
                  <div className="mt-2 rounded-md overflow-hidden border bg-zinc-950 dark:bg-black">
                    <div className="overflow-x-auto p-3">
                      <table className="w-full text-xs font-mono">
                        <tbody>
                          {error.codePreview.map((line, i) => (
                            <tr
                              key={i}
                              className={cn(line.isError ? "bg-red-900/20 text-red-200" : "text-zinc-400")}
                            >
                              <td className="pr-4 text-right select-none w-8 opacity-50 border-r border-zinc-800">{line.lineNumber}</td>
                              <td className="pl-4 whitespace-pre">{line.content || " "}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </Alert>
          ));
        })}
      </div>
    </div>
  );
}

export default ErrorDisplay;
