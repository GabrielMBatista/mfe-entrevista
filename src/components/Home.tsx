"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center">
        Bem-vindo ao MFE Entrevista
      </h1>
      <p className="mt-4 text-lg text-center">
        Este é um sistema para gerenciar e avaliar sessões de entrevistas.
      </p>
      <div className="mt-8 flex justify-center">
        <Link href="/dashboard">
          <span className="px-6 py-3 bg-blue-500 text-white rounded text-lg">
            Acessar Dashboard
          </span>
        </Link>
      </div>
    </div>
  );
}
