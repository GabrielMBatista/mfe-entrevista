"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import { calculateInterviewsByStatusOverTime } from "@/lib/dashboardDataUtils";
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

interface StatusOverTimeChartProps {
  sessions: any[];
  options?: any;
}

export default function StatusOverTimeChart({
  sessions,
  options,
}: StatusOverTimeChartProps) {
  const allData = calculateInterviewsByStatusOverTime(sessions);

  // Garantir que as datas sejam formatadas corretamente
  const parsedData = allData.map((d) => ({
    ...d,
    date: new Date(d.date.split("/").reverse().join("-")), // Converter 'DD/MM/YYYY' para 'YYYY-MM-DD'
  }));

  // Determinar a data e hora da última entrevista
  const lastDate = new Date(
    Math.max(...parsedData.map((d) => d.date.getTime()))
  );

  // Calcular a data limite (15 dias antes da última entrevista)
  const limitDate = new Date(lastDate);
  limitDate.setDate(lastDate.getDate() - 15);

  // Filtrar os dados para os últimos 15 dias a partir da última entrevista
  const last15DaysData = parsedData.filter(
    (d) =>
      d.date.getTime() >= limitDate.getTime() &&
      d.date.getTime() <= lastDate.getTime()
  );

  // Verificar se há dados para exibir
  const hasData = last15DaysData.length > 0;

  const data = {
    labels: last15DaysData.map((d) =>
      d.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    ),
    datasets: [
      {
        label: "Enviadas",
        data: last15DaysData.map((d) => d.sent),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Finalizadas",
        data: last15DaysData.map((d) => d.completed),
        backgroundColor: "#22c55e",
      },
      {
        label: "Abandonadas",
        data: last15DaysData.map((d) => d.abandoned),
        backgroundColor: "#f97316",
      },
      {
        label: "Reprovadas",
        data: last15DaysData.map((d) => d.rejected),
        backgroundColor: "#ef4444",
      },
    ],
  };

  return (
    <>
      {/* Versão Desktop */}
      <div className="hidden md:block">
        <div className="mx-auto w-3/4 h-full">
          {hasData ? (
            <Bar data={data} options={options} />
          ) : (
            <p className="text-center text-slate-600 dark:text-slate-300">
              Nenhum dado disponível para os últimos 15 dias.
            </p>
          )}
        </div>
      </div>

      {/* Versão Mobile */}
      <div className="block md:hidden">
        <div className="w-full h-[50%]">
          {hasData ? (
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
          ) : (
            <p className="text-center text-slate-600 dark:text-slate-300">
              Nenhum dado disponível para os últimos 15 dias.
            </p>
          )}
        </div>
      </div>

      {/* Faixa de dias */}
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Exibindo dados de{" "}
          <strong>{limitDate.toLocaleDateString("pt-BR")}</strong> até{" "}
          <strong>{lastDate.toLocaleDateString("pt-BR")}</strong>.
        </p>
      </div>

      {/* Legenda */}
      <div className="mt-2 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Este gráfico mostra o status das entrevistas enviadas, finalizadas,
          abandonadas e reprovadas ao longo do tempo.
        </p>
        <div className="mt-2 text-left text-xs text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside">
            <li>
              <strong>Eixo X:</strong> Representa os dias do período analisado.
            </li>
            <li>
              <strong>Eixo Y:</strong> Indica a quantidade de entrevistas em
              cada status.
            </li>
            <li>
              <strong>Cores:</strong> Azul para "Enviadas", verde para
              "Finalizadas", laranja para "Abandonadas" e vermelho para
              "Reprovadas".
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
