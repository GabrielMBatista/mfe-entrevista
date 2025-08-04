"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScoreDistributionChart from "@/components/dashboard/charts/ScoreDistributionChart";
import AverageScoresChart from "@/components/dashboard/charts/AverageScoresChart";
import StrengthsVsImprovementsChart from "@/components/dashboard/charts/StrengthsVsImprovementsChart";
import InterviewFunnelChart from "@/components/dashboard/charts/InterviewFunnelChart";
import CompletionRateChart from "@/components/dashboard/charts/CompletionRateChart";
import AverageTimeChart from "@/components/dashboard/charts/AverageScoresChart";
import StatusOverTimeChart from "@/components/dashboard/charts/StatusOverTimeChart";

interface ChartsProps {
  sessions: any[];
  chartData: any;
  chartOptions: any;
}

export default function Charts({
  sessions,
  chartData,
  chartOptions,
}: ChartsProps) {
  return (
    <Tabs defaultValue="distribution" className="w-full">
      <TabsList>
        <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        <TabsTrigger value="averageScores">Média de Scores</TabsTrigger>
        <TabsTrigger value="strengthsVsImprovements">
          Pontos Fortes vs Melhoria
        </TabsTrigger>
        <TabsTrigger value="funnel">Funil de Entrevistas</TabsTrigger>
        <TabsTrigger value="completionRate">Taxa de Conclusão</TabsTrigger>
        <TabsTrigger value="averageTime">Tempo Médio por Nível</TabsTrigger>
        <TabsTrigger value="statusOverTime">
          Status ao Longo do Tempo
        </TabsTrigger>
      </TabsList>

      <TabsContent value="distribution">
        <ScoreDistributionChart data={chartData} options={chartOptions} />
      </TabsContent>

      <TabsContent value="averageScores">
        <AverageScoresChart sessions={sessions} />
      </TabsContent>

      <TabsContent value="strengthsVsImprovements">
        <StrengthsVsImprovementsChart sessions={sessions} />
      </TabsContent>

      <TabsContent value="funnel">
        <InterviewFunnelChart sessions={sessions} />
      </TabsContent>

      <TabsContent value="completionRate">
        <CompletionRateChart sessions={sessions} />
      </TabsContent>

      <TabsContent value="averageTime">
        <AverageTimeChart sessions={sessions} />
      </TabsContent>

      <TabsContent value="statusOverTime">
        <StatusOverTimeChart sessions={sessions} />
      </TabsContent>
    </Tabs>
  );
}
