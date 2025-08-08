"use client";

import React, { useState, useEffect } from "react";
import { useGoogleFont } from "@/utils/fonts";
import {
  Send,
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/ui/Header";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  sendInvitation,
  sendInvitationEmail,
} from "@/lib/api";
import Loader from "@/components/ui/loader";

type InterviewType = {
  id: string;
  name: string;
  description: string;
};

type Category = {
  id: string;
  name: string;
  interviewTypeId: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function Invite() {
  const fontFamily = useGoogleFont("Inter");
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]); // Adicionado estado para interviewTypes
  const [selectedInterviewType, setSelectedInterviewType] =
    useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  useEffect(() => {
    const fetchInterviewTypes = async () => {
      try {
        setLoadingTypes(true);
        const types = await getInterviewTypes(); // Busca os tipos de entrevista do banco
        setInterviewTypes(types); // Atualiza o estado com os tipos de entrevista
        setSelectedInterviewType(""); // Reseta o tipo selecionado
      } catch (error) {
        console.error("Erro ao buscar tipos de entrevista:", error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchInterviewTypes();
  }, []);

  useEffect(() => {
    if (selectedInterviewType) {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true);
          const response = await getCategoriesByInterviewType(
            selectedInterviewType
          );
          setCategories(response.data);
          setSelectedCategory("");
        } catch (error) {
          console.error("Erro ao buscar categorias:", error);
        } finally {
          setLoadingCategories(false);
        }
      };

      fetchCategories();
    } else {
      setCategories([]);
      setSelectedCategory("");
    }
  }, [selectedInterviewType]);

  const validateForm = () => {
    if (!candidateName.trim()) {
      setFeedback({
        type: "error",
        message: "Nome do candidato é obrigatório",
      });
      return false;
    }
    if (!candidateEmail.trim() || !candidateEmail.includes("@")) {
      setFeedback({ type: "error", message: "Email válido é obrigatório" });
      return false;
    }
    if (!selectedCategory) {
      setFeedback({ type: "error", message: "Categoria deve ser selecionada" });
      return false;
    }
    return true;
  };

  const handleSendInvitation = async () => {
    setFeedback(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const invitation = await sendInvitation(
        candidateName,
        candidateEmail,
        selectedCategory
      );

      await sendInvitationEmail(candidateEmail, candidateName, invitation.id);

      setFeedback({
        type: "success",
        message: `Convite enviado com sucesso para ${candidateEmail}!`,
      });

      // Reset form
      setCandidateName("");
      setCandidateEmail("");
      setSelectedCategory("");
      setSelectedInterviewType("");
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Erro ao enviar convite. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Header showLinks={true} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="mb-8">
            <p className="text-slate-600 dark:text-slate-300">
              Envie convites personalizados para candidatos selecionando o tipo
              de entrevista e categoria apropriados.
            </p>
          </div>

          {feedback && (
            <Alert
              className={`${feedback.type === "success" ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertDescription
                className={`${feedback.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}
              >
                {feedback.message}
              </AlertDescription>
            </Alert>
          )}

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white">
                Selecionar Tipo de Entrevista
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Escolha o tipo de entrevista e depois selecione uma categoria
                específica
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTypes ? (
                <Loader message="Carregando tipos de entrevista..." />
              ) : (
                <Tabs
                  value={selectedInterviewType}
                  onValueChange={setSelectedInterviewType}
                >
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-700">
                    {interviewTypes.map((type: InterviewType) => (
                      <TabsTrigger
                        key={type.id}
                        value={type.id}
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                      >
                        {type.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {interviewTypes.map((type: InterviewType) => (
                    <TabsContent key={type.id} value={type.id} className="mt-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <h3 className="font-medium text-slate-800 dark:text-white mb-2">
                            {type.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {type.description}
                          </p>
                        </div>

                        {loadingCategories ? (
                          <Loader message="Carregando categorias..." />
                        ) : (
                          categories.length > 0 && (
                            <div>
                              <Label className="text-slate-700 dark:text-slate-300 mb-3 block">
                                Selecione uma categoria:
                              </Label>
                              <RadioGroup
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                              >
                                <div className="grid md:grid-cols-2 gap-3">
                                  {categories.map((category) => (
                                    <div
                                      key={category.id}
                                      className="flex items-center space-x-2 p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                      <RadioGroupItem
                                        value={category.id}
                                        id={category.id}
                                      />
                                      <Label
                                        htmlFor={category.id}
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer flex-1"
                                      >
                                        {category.name}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>
                          )
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800 dark:text-white">
                <User className="w-5 h-5 mr-2" />
                Informações do Candidato
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Preencha os dados do candidato que receberá o convite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="candidateName"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Nome do Candidato
                </Label>
                <Input
                  id="candidateName"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
              </div>
              <div>
                <Label
                  htmlFor="candidateEmail"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Email do Candidato
                </Label>
                <Input
                  id="candidateEmail"
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="joao.silva@email.com"
                  className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={
                isLoading ||
                !candidateName ||
                !candidateEmail ||
                !selectedCategory
              }
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
