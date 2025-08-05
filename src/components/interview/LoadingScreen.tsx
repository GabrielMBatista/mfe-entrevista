import React from "react";

export default function LoadingScreen({ fontFamily }: { fontFamily: string }) {
  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300">
          Carregando entrevista...
        </p>
      </div>
    </div>
  );
}
