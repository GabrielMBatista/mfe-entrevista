import React from "react";
import { useGoogleFont } from "@/utils/fonts";
import dynamic from "next/dynamic";

export default function ThankYou() {
  const fontFamily = useGoogleFont("Inter");
  const Header = dynamic(() => import("@/components/ui/Header"), {
    ssr: false,
  });

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Header showLinks={false} />

      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Obrigado por participar!
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
            Sua entrevista foi finalizada com sucesso. Agradecemos sua
            colaboração e desejamos boa sorte em sua jornada!
          </p>
        </div>
      </main>
    </div>
  );
}
