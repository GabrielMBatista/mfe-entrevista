"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import { calculateAverageScoresByDate } from "@/lib/dashboardDataUtils";
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

interface AverageScoresChartProps {
  sessions: any[];
  options?: any;
}

export default function AverageScoresChart({
  sessions,
  options,
}: AverageScoresChartProps) {
  const data = {
    labels: calculateAverageScoresByDate(sessions).map((d) => d.date),
    datasets: [
      {
        label: "Média de Scores",
        data: calculateAverageScoresByDate(sessions).map((d) => d.average),
        backgroundColor: "#3b82f6",
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
          Este gráfico apresenta a média de pontuações obtidas ao longo do
          tempo, permitindo análise de tendências.
        </p>
        <div className="mt-2 text-left text-xs text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside">
            <li>
              <strong>Eixo X:</strong> Representa as datas das sessões.
            </li>
            <li>
              <strong>Eixo Y:</strong> Indica a média de pontuações obtidas.
            </li>
            <li>
              <strong>Cores:</strong> Azul para representar a média de
              pontuações ao longo do tempo.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
