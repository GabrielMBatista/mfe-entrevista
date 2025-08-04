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

interface CompletionRateChartProps {
  sessions: any[];
  options?: any;
}

export default function CompletionRateChart({
  sessions,
  options,
}: CompletionRateChartProps) {
  const data = {
    labels: ["Concluído", "Não Concluído"],
    datasets: [
      {
        label: "Taxa de Conclusão",
        data: [70, 30], // Exemplo de dados
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
          Este gráfico mostra a taxa de conclusão das entrevistas, dividindo
          entre concluídas e não concluídas.
        </p>
        <div className="mt-2 text-left text-xs text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside">
            <li>
              <strong>Eixo X:</strong> Representa os status "Concluído" e "Não
              Concluído".
            </li>
            <li>
              <strong>Eixo Y:</strong> Indica a porcentagem de entrevistas em
              cada status.
            </li>
            <li>
              <strong>Cores:</strong> Verde para "Concluído" e vermelho para
              "Não Concluído".
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
