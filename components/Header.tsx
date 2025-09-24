"use client";

import React from "react";
import Image from "next/image";
import LogoTemaEscura from "@/assets/LgoTemaEscuro.png";
import { Plus, MessageCircle } from "lucide-react";

interface HeaderProps {
  onNewChat?: () => void;
}

export default function Header({ onNewChat }: HeaderProps) {
  return (
    <>
      {/* Header Mobile - Design moderno com gradiente e efeitos */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-100 transition-all duration-300 sm:hidden shadow-2xl border-b border-gray-600/50 backdrop-blur-sm">
        <div className="relative overflow-hidden">
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>

          <div className="relative flex items-center justify-between p-2 px-4">
            <div className="flex items-center gap-2">
              {/* Logo com efeito de glow */}
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm group-hover:bg-blue-400/30 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-lg border border-gray-600/50 overflow-hidden w-8 h-8 group-hover:border-blue-400/50 transition-all duration-300">
                  <Image
                    src={LogoTemaEscura}
                    alt="Logo História do Adventismo - Tema Escuro"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover p-1 transition-all duration-300 group-hover:scale-110"
                    priority
                    quality={95}
                  />
                </div>
              </div>

              {/* Título com efeito de texto */}
              <div className="flex flex-col">
                <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  História do Adventismo
                </h1>
                <p className="text-xs text-gray-400 font-medium">Cabo Verde</p>
              </div>
            </div>

            {/* Botão Nova Conversa */}
            <button
              onClick={onNewChat}
              className="relative group flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Nova Conversa"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Plus size={14} className="relative z-10" />
              <span className="text-xs font-medium relative z-10 hidden sm:inline">
                Nova
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Desktop - Design elegante e sofisticado */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-100 transition-all duration-300 hidden sm:block shadow-2xl border-b border-gray-600/50 backdrop-blur-sm">
        <div className="relative overflow-hidden">
          {/* Padrão de fundo sutil */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          </div>

          <div className="relative flex items-center justify-center p-4">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4">
              {/* Logo com efeitos avançados */}
              <div className="relative group">
                {/* Anel de luz externo */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div>

                {/* Container do logo */}
                <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-xl border border-gray-600/50 overflow-hidden w-14 h-14 xl:w-18 xl:h-18 group-hover:border-blue-400/70 transition-all duration-500 group-hover:scale-105">
                  <Image
                    src={LogoTemaEscura}
                    alt="Logo História do Adventismo - Tema Escuro"
                    width={100}
                    height={100}
                    className="w-full h-full object-cover p-2 transition-all duration-500 group-hover:scale-110"
                    priority
                    quality={95}
                  />
                </div>

                {/* Efeito de partículas */}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-300 opacity-75"></div>
              </div>

              {/* Título principal com efeitos */}
              <div className="flex flex-col items-center text-center">
                <h1 className="text-lg xl:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                  História do Adventismo
                </h1>
                <p className="text-xs xl:text-sm text-gray-300 font-medium mt-1">
                  Cabo Verde
                </p>

                {/* Linha decorativa */}
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mt-1"></div>
              </div>

              {/* Botão Nova Conversa Desktop */}
              <button
                onClick={onNewChat}
                className="relative group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Iniciar Nova Conversa"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <MessageCircle size={16} className="relative z-10" />
                <span className="text-sm font-medium relative z-10">
                  Nova Conversa
                </span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaçador invisível para compensar o header fixo */}
      <div className="w-full">
        {/* Espaçador Mobile - altura do header + padding */}
        <div className="h-16 sm:hidden" />
        {/* Espaçador Desktop - altura do header + padding */}
        <div className="h-20 sm:h-24 lg:h-28 hidden sm:block" />
      </div>
    </>
  );
}
