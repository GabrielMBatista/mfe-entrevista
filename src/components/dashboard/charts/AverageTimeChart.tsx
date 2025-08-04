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
import { calculateAverageTimeByLevel } from "@/lib/dashboardDataUtils";

// Registre os módulos necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AverageTimeChartProps {
  sessions: any[];
}

const AverageTimeChart: React.FC<AverageTimeChartProps> = ({ sessions }) => {
  const data = {
    labels: calculateAverageTimeByLevel(sessions).map((d) => d.level),
    datasets: [
      {
        label: "Tempo Médio (min)",
        data: calculateAverageTimeByLevel(sessions).map((d) => d.averageTime),
        backgroundColor: "#10b981",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const }, // Corrigido para "top" como constante
      title: { display: true, text: "Tempo Médio por Nível" },
    },
  };

  return (
    <div className="hidden md:block">
      <div className="mx-auto w-3/4 h-full">
        <Bar data={data} options={options} />
      </div>
      {/* Legenda */}
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Este gráfico exibe o tempo médio gasto em entrevistas, categorizado
          por nível de dificuldade.
        </p>
        <div className="mt-2 text-left text-xs text-slate-600 dark:text-slate-300">
          <ul className="list-disc list-inside">
            <li>
              <strong>Eixo X:</strong> Representa os níveis de dificuldade.
            </li>
            <li>
              <strong>Eixo Y:</strong> Indica o tempo médio gasto em minutos.
            </li>
            <li>
              <strong>Cores:</strong> Verde para representar o tempo médio por
              nível.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AverageTimeChart;
