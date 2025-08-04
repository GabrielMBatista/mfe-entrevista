"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
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

interface StrengthsVsImprovementsChartProps {
  sessions: any[];
  options?: any;
}

export default function StrengthsVsImprovementsChart({
  sessions,
  options,
}: StrengthsVsImprovementsChartProps) {
  const data = {
    labels: ["Pontos Fortes", "Pontos de Melhoria"],
    datasets: [
      {
        label: "Quantidade",
        data: [50, 30], // Exemplo de dados
        backgroundColor: ["#22c55e", "#ef4444"],
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
          Este gráfico compara a quantidade de pontos fortes e pontos de
          melhoria identificados nas sessões.
        </p>
        <div className="mt-2 text-left text-xs text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside">
            <li>
              <strong>Eixo X:</strong> Representa as categorias "Pontos Fortes"
              e "Pontos de Melhoria".
            </li>
            <li>
              <strong>Eixo Y:</strong> Indica a quantidade de ocorrências em
              cada categoria.
            </li>
            <li>
              <strong>Cores:</strong> Verde para "Pontos Fortes" e vermelho para
              "Pontos de Melhoria".
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
