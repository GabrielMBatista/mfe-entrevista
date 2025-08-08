import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: number;
}

interface AlertsProps {
  alerts: AlertMessage[];
  removeAlert: (alertId: string) => void;
}

export default function Alerts({ alerts, removeAlert }: AlertsProps) {
  return (
    alerts.length > 0 && (
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            className={`shadow-lg border-l-4 ${
              alert.type === "success"
                ? "border-l-green-500 bg-green-50 dark:bg-green-950"
                : alert.type === "error"
                  ? "border-l-red-500 bg-red-50 dark:bg-red-950"
                  : alert.type === "warning"
                    ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                    : "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {alert.type === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {alert.type === "error" && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {alert.type === "warning" && (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                {alert.type === "info" && (
                  <Info className="h-4 w-4 text-blue-600" />
                )}
                <AlertDescription className="text-sm font-medium">
                  {alert.message}
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAlert(alert.id)}
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>
    )
  );
}
