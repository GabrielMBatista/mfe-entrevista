"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registre os módulos necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ScoreDistributionChartProps {
  data: any;
  options: any;
}

export default function ScoreDistributionChart({
  data,
  options,
}: ScoreDistributionChartProps) {
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
          Este gráfico exibe a distribuição de pontuações entre os
          participantes, categorizando-os por níveis de desempenho.
        </p>
        <div className="mt-2 text-left text-xs text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside">
            <li>
              <strong>Eixo X:</strong> Representa os níveis de desempenho.
            </li>
            <li>
              <strong>Eixo Y:</strong> Indica a quantidade de participantes em
              cada nível.
            </li>
            <li>
              <strong>Cores:</strong> Vermelho para "Insatisfatório", laranja
              para "Baixo", amarelo para "Médio" e verde para "Excelente".
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
