/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  X,
  Sparkles,
  LockKeyhole,
  Zap,
  History,
  MessageCircle,
  BookOpen,
  Users,
  Church,
  Calendar,
  MapPin,
  Star,
  Play,
  Plus,
} from "lucide-react";
import { MessageType } from "@/types";
import { generateBotResponse } from "@/utils/botResponses";
import Message from "@/components/chatbot/Message";
import TypingIndicator from "@/components/chatbot/TypingIndicator";

import Header from "@/components/Header";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useTheme } from "@/contexts/ThemeContext";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useSimpleChat } from "@/hooks/useSimpleChat";

import { FaSpinner } from "react-icons/fa6";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

// Tipagens globais para reconhecimento de voz
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export default function Home() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedQuickStart, setSelectedQuickStart] = useState<string>("");
  const [showQuickStartsInModal, setShowQuickStartsInModal] = useState(false);
  const [showWaitMessage, setShowWaitMessage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    chatHistory,
    currentChatId,
    addMessage,
    createNewChat,
    deleteChat,
    setCurrentChatId,
  } = useChatHistory();

  const user = useSupabaseUser();
  const {
    isStreaming,
    streamingContent,
    isTypingComplete,
    sendMessage,
    clearStreaming,
  } = useSimpleChat();

  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (user?.user && currentChatId && chatHistory[currentChatId]) {
      setMessages(chatHistory[currentChatId]);
    } else {
      setMessages([]);
    }
  }, [currentChatId, chatHistory, user?.user]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const isMobile = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [alertMessage, setAlert] = useState(false);
  const [bookPdfUrl, setBookPdfUrl] = useState<string>("");

  useEffect(() => {
    isMobile.current =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  }, []);

  const quickStartCards = [
    {
      id: "pioneiros",
      title: "👥 Primeiros Pioneiros",
      subtitle: "1933-1935",
      description:
        "Descubra quem foram os primeiros missionários e fundadores do adventismo em Cabo Verde",
      icon: Users,
      color: "from-blue-400 to-blue-500",
      bgColor: "from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800",
      darkBgColor: "from-blue-600 to-blue-800",
      borderColor: "border-blue-300 dark:border-blue-500",
      textColor: "text-white",
    },
    {
      id: "primeira-igreja",
      title: "⛪ Primeira Igreja",
      subtitle: "1935",
      description:
        "Conheça a história da primeira igreja adventista fundada na Ilha Brava",
      icon: Church,
      color: "from-purple-400 to-purple-500",
      bgColor:
        "from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800",
      darkBgColor: "from-purple-600 to-purple-800",
      borderColor: "border-purple-300 dark:border-purple-500",
      textColor: "text-white",
    },
    {
      id: "primeiro-pastor",
      title: "👨‍💼 Primeiro Pastor",
      subtitle: "1935",
      description:
        "Saiba mais sobre o Pastor Alberto Raposo e sua chegada a Cabo Verde",
      icon: Star,
      color: "from-amber-400 to-amber-500",
      bgColor:
        "from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800",
      darkBgColor: "from-amber-600 to-amber-800",
      borderColor: "border-amber-300 dark:border-amber-500",
      textColor: "text-white",
    },
    {
      id: "primeiros-batismos",
      title: "🎪 Primeiros Batismos",
      subtitle: "1936",
      description:
        "Descubra quando e onde aconteceram os primeiros batismos adventistas",
      icon: Calendar,
      color: "from-emerald-400 to-emerald-500",
      bgColor:
        "from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800",
      darkBgColor: "from-emerald-600 to-emerald-800",
      borderColor: "border-emerald-300 dark:border-emerald-500",
      textColor: "text-white",
    },
    {
      id: "primeira-escola",
      title: "🎓 Primeira Escola",
      subtitle: "1946",
      description:
        "Conheça a história da primeira escola adventista em Cabo Verde",
      icon: BookOpen,
      color: "from-indigo-400 to-indigo-500",
      bgColor:
        "from-indigo-400 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800",
      darkBgColor: "from-indigo-600 to-indigo-800",
      borderColor: "border-indigo-300 dark:border-indigo-500",
      textColor: "text-white",
    },
    {
      id: "expansao",
      title: "🌍 Expansão para Ilhas",
      subtitle: "1935-1950",
      description:
        "Como o adventismo se expandiu de Brava para outras ilhas do arquipélago",
      icon: MapPin,
      color: "from-rose-400 to-rose-500",
      bgColor: "from-rose-400 to-rose-600 dark:from-rose-600 dark:to-rose-800",
      darkBgColor: "from-rose-600 to-rose-800",
      borderColor: "border-rose-300 dark:border-rose-500",
      textColor: "text-white",
    },
  ];

  useEffect(() => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      console.warn("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition: SpeechRecognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";

    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInputValue(final || interim);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") {
        console.debug("Reconhecimento de voz foi abortado manualmente.");
        return;
      }

      console.error("Erro no reconhecimento de voz:", event.error);

      if (event.error === "not-allowed") {
        alert(
          "Permissão de microfone negada. Ative para usar o reconhecimento de voz."
        );
      }

      setIsRecording(false);
      setIsPressing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsPressing(false);
    };

    return () => {
      recognition.stop();
      recognition.abort();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Salvar no Supabase automaticamente quando a página carrega
  // COMENTADO TEMPORARIAMENTE - Funcionalidade desabilitada
  /*
  useEffect(() => {
    const saveToSupabase = async () => {
      try {
        const response = await fetch("/api/save-book-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log(
            "✅ Conteúdo do livro salvo no Supabase automaticamente!"
          );
        } else {
          console.log("⚠️ Erro ao salvar automaticamente no Supabase");
        }
      } catch (error) {
        console.log("⚠️ Erro ao salvar automaticamente:", error);
      }
    };

    const timer = setTimeout(saveToSupabase, 2000);
    return () => clearTimeout(timer);
  }, []);
  */

  const handleSendMessage = async (
    e?: React.FormEvent | React.KeyboardEvent,
    messageContent?: string
  ) => {
    e?.preventDefault();

    if (isTyping) return;

    const content = messageContent || inputValue.trim();
    if (!content) return;

    let chatId = currentChatId || "";

    if (!chatId) {
      chatId = Date.now().toString();
      setCurrentChatId(chatId);
      setMessages([]);
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: content,
      sender: "user",
      timestamp: new Date(),
      parts: [{ text: content }],
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    addMessage(chatId, userMessage);

    if (!messageContent) {
      setInputValue("");
    }

    try {
      // Mostrar loading primeiro
      setIsTyping(true);

      // Usar streaming para a resposta
      const botResponseText = await sendMessage(content);

      // Adicionar mensagem ao histórico após digitação terminar
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: "bot",
        timestamp: new Date(),
        parts: [{ text: botResponseText }],
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      addMessage(chatId, botMessage);

      // Limpar streaming imediatamente para evitar duplicação
      clearStreaming();
      setIsTyping(false);
      // Verificação adicional - garantir que isTyping seja false
      setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      const errorMessage: MessageType = {
        id: (Date.now() + 2).toString(),
        text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
        sender: "bot",
        timestamp: new Date(),
        parts: [
          {
            text: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?",
          },
        ],
      };

      setMessages([...updatedMessages, errorMessage]);
      addMessage(chatId, errorMessage);
      clearStreaming();
      setIsTyping(false);
      // Verificação adicional - garantir que isTyping seja false
      setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
        }
      }, 100);
    }
  };

  const handleNewChat = () => {
    if (!user?.user) return;

    const newChatId = Date.now().toString();
    setMessages([]);
    setCurrentChatId(newChatId);
  };

  const openChatModal = (
    quickStartId?: string,
    showQuickStarts: boolean = false
  ) => {
    if (quickStartId) {
      setSelectedQuickStart(quickStartId);
      const selectedCard = quickStartCards.find(
        (card) => card.id === quickStartId
      );
      if (selectedCard) {
        setInputValue(selectedCard.description);
      }
      setShowQuickStartsInModal(false); // Quick Start cards não mostram quick starts
    } else {
      setSelectedQuickStart("");
      setInputValue("");
      setShowQuickStartsInModal(showQuickStarts); // Nova Conversa pode mostrar quick starts
    }
    setIsChatModalOpen(true);
    setMessages([]);
    setCurrentChatId("");
  };

  const closeChatModal = () => {
    // Não permitir fechar o modal enquanto o chat está respondendo
    if (isTyping || isStreaming) {
      // Mostrar mensagem de aguarde
      setShowWaitMessage(true);
      // Esconder a mensagem após 3 segundos
      setTimeout(() => {
        setShowWaitMessage(false);
      }, 3000);
      return;
    }

    setIsChatModalOpen(false);
    setSelectedQuickStart("");
    setInputValue("");
    setShowQuickStartsInModal(false);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen transition-colors duration-300 dark bg-gray-900 text-gray-100">
      <div className="flex-grow flex">
        <div className="flex-1 flex flex-col min-w-0">
          <Header onNewChat={() => openChatModal(undefined, true)} />
          <div className="text-center py-6">
            <h1 className="font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-3xl xl:text-4xl">
              O que dizer dos adventistas em Cabo Verde
            </h1>
            <p className="w-[80%] mx-auto text-sm xl:text-lg mt-2 text-center text-gray-300 hidden sm:block">
              Descubra a rica história dos adventistas em Cabo Verde através do
              livro de Karl Marx Morgan Lima Monteiro. Clique em qualquer card
              para começar uma conversa especializada!
            </p>
          </div>
          <div className="flex-1 bg-gray-900 transition-colors ">
            <div className="max-w-7xl mx-auto">
              {/* Cards de Quick Start */}
              <div className="grid grid-cols-2 px-4 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                {quickStartCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => openChatModal(card.id)}
                    className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${card.bgColor} dark:${card.darkBgColor} border ${card.borderColor} rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg hover:shadow-xl relative overflow-hidden`}
                  >
                    {/* Overlay escuro para melhor legibilidade */}
                    <div className="absolute inset-0 bg-black/70 rounded-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between mb-3 sm:mb-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                      >
                        <card.icon size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <Play
                        size={16}
                        className="sm:w-5 sm:h-5 text-white group-hover:text-gray-200 transition-colors"
                      />
                    </div>

                    <h3
                      className={`relative z-10 text-lg sm:text-xl font-bold mb-2 ${card.textColor}`}
                    >
                      {card.title}
                    </h3>

                    <p className="relative z-10 text-xs sm:text-sm text-white/90 mb-2 sm:mb-3 font-medium">
                      {card.subtitle}
                    </p>

                    <p className="relative z-10 text-white/80 text-xs sm:text-sm leading-relaxed">
                      {card.description}
                    </p>

                    <div className="relative z-10 mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-white/70">
                      <MessageCircle size={14} className="sm:w-4 sm:h-4 mr-2" />
                      Clique para conversar
                    </div>
                  </div>
                ))}
              </div>

              {/* Card de Nova Conversa */}
              <div className="text-center mt-4 sm:mt-6 md:mt-8 lg:mt-10">
                <div
                  onClick={() => openChatModal(undefined, true)}
                  className="inline-flex flex-col sm:flex-row items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40 border-2 border-dashed border-blue-300 dark:border-blue-500 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Plus size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      Nova Conversa
                    </h3>
                    <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                      Clique aqui para iniciar uma conversa personalizada sobre
                      qualquer tema do adventismo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Chat */}
      {isChatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4">
          <div className="relative w-full max-w-4xl h-[90vh] sm:h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <MessageCircle
                  size={20}
                  className="sm:w-6 sm:h-6 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold truncate">
                    {selectedQuickStart
                      ? `Conversa: ${
                          quickStartCards.find(
                            (c) => c.id === selectedQuickStart
                          )?.title
                        }`
                      : "Nova Conversa"}
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm truncate">
                    Especialista no livro de Karl Marx Morgan Lima Monteiro
                  </p>
                </div>
              </div>
              <button
                onClick={closeChatModal}
                className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                title="Fechar chat"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Mensagem de Aguarde */}
            {showWaitMessage && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-3 mx-4 mt-2 rounded-r-lg animate-fadeIn">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-500 animate-pulse"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Aguarde!</strong> Ainda está respondendo. Não é
                      possível fechar o chat neste momento.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-gray-800">
              <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
                {messages.map((msg) => (
                  <Message
                    key={msg.id}
                    message={{
                      ...msg,
                      text: (msg.parts ?? [{ text: msg.text }])
                        .map((p) => p.text)
                        .join(" "),
                    }}
                  />
                ))}
                {isTyping && !isStreaming && !streamingContent && (
                  <TypingIndicator />
                )}
                {isStreaming && streamingContent && (
                  <Message
                    message={{
                      id: "streaming",
                      text: streamingContent,
                      sender: "bot",
                      timestamp: new Date(),
                      parts: [{ text: streamingContent }],
                    }}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input e Controles */}
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-3xl mx-auto">
                {/* Quick Replies */}
                {messages.length === 0 && showQuickStartsInModal && (
                  <div className="mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-2">
                      {quickStartCards.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => {
                            setInputValue(card.description);
                            handleSendMessage(undefined, card.description);
                          }}
                          className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 bg-gradient-to-r ${card.bgColor} dark:${card.darkBgColor} border ${card.borderColor} hover:shadow-md hover:scale-105 text-white`}
                        >
                          {card.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form de Input */}
                <form onSubmit={handleSendMessage} className="relative">
                  <div className="relative">
                    <textarea
                      id="message-input"
                      disabled={isTyping}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (user?.user) {
                            handleSendMessage(e);
                          }
                        }
                      }}
                      placeholder={
                        user?.user
                          ? "Digite sua pergunta sobre o livro 'O que dizer dos adventistas em Cabo Verde'..."
                          : "Faça login para enviar mensagens..."
                      }
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-16 sm:pr-20 text-sm sm:text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg resize-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      style={{
                        minHeight: "50px",
                        maxHeight: "150px",
                      }}
                    />

                    {/* Botões */}
                    <div className="absolute right-2 bottom-2 flex gap-1 sm:gap-2">
                      <button
                        type="button"
                        disabled={isTyping}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                        aria-label="Gravação de voz"
                      >
                        <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>

                      <button
                        type="submit"
                        disabled={inputValue.trim() === "" || isTyping}
                        className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        aria-label="Enviar mensagem"
                      >
                        <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Login */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fadeIn">
          <div className="relative flex flex-col max-w-md w-full p-4 sm:p-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-purple-800 to-blue-900 border border-purple-500/50 text-white">
            {/* Botão de fechar */}
            <button
              onClick={() => setAlert(false)}
              className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 rounded-full hover:bg-gray-700"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Conteúdo principal */}
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 mt-4">
              {/* Ícone animado */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></div>
                <LockKeyhole className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-400 bg-clip-text text-transparent">
                Acesso Bloqueado
              </h3>

              <p className="text-base sm:text-lg">
                Inicie sessão para desbloquear:
              </p>

              <ul className="space-y-2 text-left w-full pl-4 sm:pl-6 text-sm sm:text-base">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  Respostas inteligentes e personalizadas
                </li>
                <li className="flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-400" />
                  Histórico completo das suas conversas
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  Acesso prioritário a novos recursos
                </li>
              </ul>
            </div>

            {/* Botão de ação */}
            <Link
              href="/login"
              className="mt-4 sm:mt-6 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-center transition-all duration-200 shadow-lg text-sm sm:text-base bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 hover:shadow-purple-500/30"
            >
              Iniciar Sessão Agora
            </Link>

            <p className="text-xs text-center mt-3 sm:mt-4 opacity-70">
              Leva menos de 30 segundos!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
