"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import { calculateInterviewFunnelData } from "@/lib/dashboardDataUtils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registre os módulos necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InterviewFunnelChartProps {
  sessions: any[];
  options?: any;
}

export default function InterviewFunnelChart({
  sessions,
  options,
}: InterviewFunnelChartProps) {
  const data = {
    labels: [
      "Enviadas",
      "Iniciadas",
      "Finalizadas",
      "Abandonadas",
      "Reprovadas",
      "Aprovadas",
    ],
    datasets: [
      {
        label: "Quantidade",
        data: Object.values(calculateInterviewFunnelData(sessions)),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#22c55e",
          "#f97316",
          "#ef4444",
          "#6366f1",
        ],
      },
    ],
  };

  return (
    <>
      {/* Versão Desktop */}
      <div className="hidden md:block">
        <div className="mx-auto w-3/4 h-full">
          <Bar data={data} options={options} />
        </div>
      </div>

      {/* Versão Mobile */}
      <div className="block md:hidden">
        <div className="w-full h-[50%]">
          <Bar
            data={data}
            options={{
              ...options,
              indexAxis: "y",
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { font: { size: 10 } } },
                y: { ticks: { font: { size: 10 } } },
              },
            }}
          />
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Este gráfico representa o funil de entrevistas, mostrando a quantidade
          de entrevistas em cada etapa do processo.
        </p>
        <div className="mt-2 text-left text-xs text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside">
            <li>
              <strong>Eixo X:</strong> Representa as etapas do funil de
              entrevistas.
            </li>
            <li>
              <strong>Eixo Y:</strong> Indica a quantidade de entrevistas em
              cada etapa.
            </li>
            <li>
              <strong>Cores:</strong> Diferentes cores para cada etapa, como
              azul para "Enviadas" e verde para "Aprovadas".
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
