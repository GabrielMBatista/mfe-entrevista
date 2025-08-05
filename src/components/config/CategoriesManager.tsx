import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Plus } from "lucide-react";
import { Category, Question } from "@/types/types";

interface CategoriesManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  newCategoryName: string;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
  handleCreateCategory: () => void;
  handleRemoveCategory: (categoryId: string) => void;
  questions: Question[];
  isLoading: boolean;
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     search: string;
//     setPage: React.Dispatch<React.SetStateAction<number>>;
//     setSearch: React.Dispatch<React.SetStateAction<string>>;
//   };
}

export function CategoriesManager({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  newCategoryName,
  setNewCategoryName,
  handleCreateCategory,
  handleRemoveCategory,
  questions,
  isLoading,
//   pagination,
}: CategoriesManagerProps) {
//   const { page, limit, total, search, setPage, setSearch } = pagination;

  console.log("questions", questions);
  return (
    <div className="space-y-6">

      {/* Create Category */}
      <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 dark:text-white">
            Criar Nova Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da categoria"
              className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      {categories.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 dark:text-white">
              Categorias Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {categories.map((category: Category) => (
                <div
                  key={category.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {category?.questionCount || 0} perguntas
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCategory(category.id); // Atualizado para usar a função correta
                      }}
                      className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
