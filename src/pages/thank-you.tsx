import React from "react";
import { useGoogleFont } from "@/utils/fonts";
import Header from "@/components/ui/Header";

export default function ThankYou() {
  const fontFamily = useGoogleFont("Inter");

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center"
    >
      <Header showLinks={false} />
      <main className="text-center">
        <h1 className="text-3xl font-bold">Obrigado por participar!</h1>
        <p className="mt-4 text-lg">
          Sua entrevista foi finalizada com sucesso. Agradecemos sua
          colaboração.
        </p>
      </main>
    </div>
  );
}
