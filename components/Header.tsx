"use client";

import React from "react";
import Image from "next/image";
import LogoTemaEscura from "@/assets/LgoTemaEscuro.png";

export default function Header() {
  return (
    <>
      {/* Header Mobile - Apenas logo e título na mesma linha */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg border-b border-gray-700 bg-gray-900 text-gray-100 transition-all duration-300 sm:hidden p-3">
        <div className="flex items-center justify-start gap-3">
          <div className="relative">
            <div className="bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 overflow-hidden relative w-12 h-12">
              <Image
                src={LogoTemaEscura}
                alt="Logo História do Adventismo - Tema Escuro"
                width={100}
                height={100}
                className="w-full h-full object-cover p-1"
                priority
                quality={95}
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-lg leading-tight">
              O que dizer dos adventistas em Cabo Verde
            </h1>
          </div>
        </div>
      </div>

      {/* Header Desktop - Logo, título e descrição */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg border-b border-gray-700 bg-gray-900 text-gray-100 transition-all duration-300 hidden sm:block p-6 lg:p-8">
        <div className="flex items-center justify-center gap-6 lg:gap-8">
          <div className="relative">
            <div className="bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 overflow-hidden relative w-20 h-20 lg:w-24 lg:h-24">
              <Image
                src={LogoTemaEscura}
                alt="Logo História do Adventismo - Tema Escuro"
                width={100}
                height={100}
                className="w-full h-full object-cover p-2 transition-all duration-300 hover:scale-110"
                priority
                quality={95}
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-3xl lg:text-4xl">
              O que dizer dos adventistas em Cabo Verde
            </h1>
            <p className="w-[80%] mx-auto text-base lg:text-lg mt-2 text-center text-gray-300">
              Descubra a rica história dos adventistas em Cabo Verde através do
              livro de Karl Marx Morgan Lima Monteiro. Clique em qualquer card
              para começar uma conversa especializada!
            </p>
          </div>
        </div>
      </div>

      {/* Espaçador invisível para compensar o header fixo */}
      <div className="w-full">
        {/* Espaçador Mobile - altura do header + padding */}
        <div className="h-20 sm:hidden" />
        {/* Espaçador Desktop - altura do header + padding */}
        <div className="h-36 sm:h-40 lg:h-44 hidden sm:block" />
      </div>
    </>
  );
}
