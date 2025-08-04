"use client";

import React from "react";
import { useGoogleFont } from "@/utils/fonts";
import {
  Menu,
  X,
  Home,
  BarChart3,
  Send,
  Settings,
  Mic,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const fontFamily = useGoogleFont("Inter");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark"); // Certifique-se de que a classe está sendo aplicada ao elemento HTML
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
    <div
      className="min-h-screen bg-gray-50 dark:bg-slate-900"
      style={{ fontFamily }}
    >
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Mic className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-semibold text-slate-800 dark:text-white">
                Entrevistas
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

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
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Dark Mode Toggle Mobile */}
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

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-800 dark:text-white">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
