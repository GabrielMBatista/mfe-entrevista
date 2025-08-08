import React from "react";

export function Loader({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="w-full flex items-center justify-center py-8">
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 dark:border-slate-600 border-b-blue-500" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export default Loader;
