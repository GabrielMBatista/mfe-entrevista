"use client";

import React from "react";
import { useGoogleFont } from "@/utils/fonts";
import Link from "next/link";
import {
  Play,
  Users,
  BarChart3,
  ArrowRight,
  Mic,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/components/Layout";

export default function Home() {
  const fontFamily = useGoogleFont("Inter");

  const features = [
    {
      icon: Play,
      title: "Entrevistas Inteligentes",
      description:
        "Conduza entrevistas estruturadas com perguntas personalizadas e gravação automática.",
    },
    {
      icon: BarChart3,
      title: "Análise Detalhada",
      description:
        "Visualize métricas e insights sobre o desempenho dos candidatos em tempo real.",
    },
    {
      icon: Users,
      title: "Gestão de Candidatos",
      description:
        "Organize e acompanhe todos os candidatos em um só lugar com facilidade.",
    },
  ];

  const quickActions = [
    {
      title: "Nova Entrevista",
      description: "Inicie uma nova sessão de entrevista",
      icon: Play,
      href: "/dashboard",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Convidar Candidato",
      description: "Envie convites para candidatos",
      icon: Users,
      href: "/invite",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Ver Relatórios",
      description: "Acesse análises e métricas",
      icon: BarChart3,
      href: "/dashboard",
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Layout>
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Mic className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-white mb-6">
              Bem-vindo ao
              <span className="text-blue-600 dark:text-blue-400 block">
                Entrevistas
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              A plataforma completa para conduzir entrevistas profissionais,
              analisar candidatos e tomar decisões informadas de contratação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Começar Agora
                </Button>
              </Link>
              <Link href="/invite">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Convidar Candidato
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-12">
              Recursos Principais
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-12">
              Ações Rápidas
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                        Acessar
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-8">
              Por que escolher nossa plataforma?
            </h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  100%
                </div>
                <div className="text-slate-600 dark:text-slate-300">Seguro</div>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  24/7
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Disponível
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Mic className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  ∞
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Entrevistas
                </div>
              </div>
              <div className="flex flex-col items-center">
                <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  AI
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
