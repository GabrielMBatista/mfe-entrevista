"use client";

import React, { useState, useEffect } from "react";
import { useGoogleFont } from "@/utils/fonts";
import { usePathname } from "next/navigation";
import {
  Mic,
  Sun,
  Moon,
  Home,
  BarChart3,
  Send,
  Settings,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  showLinks?: boolean; // Define se os links de navegação devem ser exibidos
}

export default function Header({ showLinks = false }: HeaderProps) {
  const fontFamily = useGoogleFont("Inter");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navigation = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Enviar Convite", href: "/invite", icon: Send },
    { name: "Configuração", href: "/config", icon: Settings },
  ];

  return (
    <header
      className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700"
      style={{ fontFamily }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Mic className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xl font-semibold text-slate-800 dark:text-white">
              Entrevistas
            </span>
          </div>

          {/* Navegação Desktop */}
          {showLinks && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Botões à direita */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            {/* Botão de Menu Mobile */}
            {showLinks && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && showLinks && (
        <nav className="md:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
          <ul className="flex flex-col space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
