/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState, memo } from "react";
import {
  User,
  Bot,
  Copy,
  FileText,
  Volume2,
  Play,
  Pause,
  CircleUser,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MessageType } from "@/types";
import Image from "next/image";
import logo2 from "@/assets/LgoTemaEscuro.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

interface MessageProps {
  message: MessageType & {
    id?: string;
  };
  isLastMessage?: boolean;
  onActionClick?: (action: "copy" | "pdf" | "speak") => void;
  isStreaming?: boolean;
  streamingContent?: string;
}

const Message: React.FC<MessageProps> = memo(
  ({
    message,
    isLastMessage = false,
    onActionClick,
    isStreaming = false,
    streamingContent = "",
  }) => {
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
      "dark"
    );
    const [showActions, setShowActions] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pdfSalve, setPdfSalve] = useState(false);
    const user = useSupabaseUser();

    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const prepareForSpeech = (text: string) => {
      // Limpeza de formatação com preservação de pontuação
      let cleanText = text
        .replace(/#+\s*/g, "") // Remove títulos
        .replace(/\*\*(.*?)\*\*/g, "$1") // Mantém conteúdo do negrito
        .replace(/\*(.*?)\*/g, "$1") // Mantém conteúdo do itálico
        .replace(/_(.*?)_/g, "$1") // Mantém conteúdo sublinhado
        .replace(/`(.*?)`/g, "$1") // Mantém conteúdo de código
        .replace(/~~(.*?)~~/g, "$1") // Mantém conteúdo riscado
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
        .replace(/!\[.*?\]\(.*?\)/g, "") // Remove imagens
        .replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML

      // Adiciona pausas naturais para leitura fluida
      cleanText = cleanText
        .replace(/([.!?:;])\s*/g, "$1\n") // Pausa após pontuação
        .replace(/(\n)+/g, "\n\n") // Pausa maior entre parágrafos
        .replace(/\s+/g, " ") // Normaliza espaços
        .replace(/\*/g, "") // Remove asteriscos residuais
        .trim();

      return cleanText;
    };

    // Função para ler o texto
    const handleSpeak = () => {
      if (isSpeaking && !isPaused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
        return;
      }

      if (isSpeaking && isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        return;
      }

      const preparedText = prepareForSpeech(message.text);
      if (!preparedText.trim()) return;

      const utterance = new SpeechSynthesisUtterance(preparedText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1;
      utterance.lang = "pt-PT";

      const voices = window.speechSynthesis.getVoices();
      const ptPtVoices = voices.filter((v) => v.lang === "pt-PT");
      const ptVoice = ptPtVoices.length
        ? ptPtVoices[0]
        : voices.find((v) => v.lang.startsWith("pt"));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
      return () => {
        window.speechSynthesis.cancel();
      };
    }, []);

    const isBot = message.sender === "bot";
    const isDark = resolvedTheme === "dark";

    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Classes para estilos
    const userBubbleClass = isDark
      ? "bg-blue-600 text-white"
      : "bg-blue-100 text-gray-900";

    const userAvatarClass = isDark
      ? "bg-blue-700 text-white"
      : "bg-blue-200 text-blue-800";

    const botBubbleClass = isDark
      ? "bg-gray-800 text-white"
      : "bg-gray-100 text-gray-900";

    const botAvatarClass = isDark ? " text-white" : "bg-white text-gray-800";

    const handleCopy = () => {
      try {
        // Método moderno (funciona na maioria dos navegadores)
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(message.text)
            .then(() => showCopySuccess())
            // eslint-disable-next-line react-hooks/rules-of-hooks
            .catch(() => useFallbackCopyMethod());
        } else {
          // Fallback para dispositivos mobile e navegadores antigos
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useFallbackCopyMethod();
        }
      } catch (error) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useFallbackCopyMethod();
      }
    };

    const useFallbackCopyMethod = () => {
      // Criar um elemento textarea temporário
      const textarea = document.createElement("textarea");
      textarea.value = message.text;
      textarea.style.position = "fixed"; // Evitar rolagem
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      // Selecionar e copiar o texto
      textarea.select();
      try {
        document.execCommand("copy");
        showCopySuccess();
      } catch (err) {
        console.error("Falha ao copiar texto", err);
        alert("Não foi possível copiar o texto. Tente manualmente.");
      }

      // Remover o textarea
      document.body.removeChild(textarea);
    };

    const showCopySuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onActionClick?.("copy");
    };

    const handleGeneratePDF = async (topicTitle: string) => {
      onActionClick?.("pdf");
      try {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
        });

        // Configurações de estilo
        const mainFont = "times";
        const titleSize = 14;
        const textSize = 12;
        const margin = 20;
        const lineHeight = 6;
        let yPosition = margin;

        // Função para adicionar texto formatado
        const addText = (
          text: string,
          size = textSize,
          style: string = "normal",
          x = margin
        ) => {
          pdf.setFont(mainFont, style);
          pdf.setFontSize(size);

          const lines = pdf.splitTextToSize(
            text,
            pdf.internal.pageSize.getWidth() - 2 * margin
          );

          for (const line of lines) {
            if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
              pdf.addPage();
              yPosition = margin;
            }

            pdf.text(line, x, yPosition);
            yPosition += lineHeight;
          }
        };

        // Título principal (Análise sobre Karl Marx)
        addText(topicTitle, titleSize, "bold");
        yPosition += lineHeight;

        // Data/hora
        addText(
          `Data: ${new Date(
            message.timestamp
          ).toLocaleDateString()} - Hora: ${formattedTime}`
        );
        yPosition += lineHeight * 1.5;

        // Processar Markdown completo
        const processMarkdown = (content: string) => {
          const blocks = content.split(/\n\s*\n/);

          for (const block of blocks) {
            if (block.startsWith("# ")) {
              addText(block.substring(2), titleSize, "bold");
            } else if (block.startsWith("## ")) {
              addText(block.substring(3), textSize, "bold");
            } else if (block.startsWith("### ")) {
              addText(block.substring(4), textSize, "bolditalic");
            } else if (block.startsWith("* ")) {
              const items = block.split("\n* ");
              for (const item of items.filter((i) => i)) {
                addText(
                  `• ${item.replace("* ", "").trim()}`,
                  textSize,
                  "normal",
                  margin + 5
                );
              }
            } else if (block.startsWith("> ")) {
              addText(block.substring(2), textSize, "italic", margin + 5);
            } else if (block.startsWith("```")) {
              // Bloco de código
              const code = block.split("\n").slice(1, -1).join("\n");
              addText(code, textSize - 1, "normal", margin + 10);
              yPosition += lineHeight;
            } else if (block.match(/\[.*\]\(.*\)/)) {
              // Links
              const linkText = block.replace(/\[(.*?)\]\(.*?\)/g, "$1");
              addText(linkText, textSize, "normal");
            } else if (block.match(/\*\*.*\*\*/)) {
              // Negrito
              const boldText = block.replace(/\*\*(.*?)\*\*/g, "$1");
              addText(boldText, textSize, "bold");
            } else if (block.match(/_.*_/)) {
              // Itálico
              const italicText = block.replace(/_(.*?)_/g, "$1");
              addText(italicText, textSize, "italic");
            } else if (block.match(/`.*`/)) {
              // Código inline
              const codeText = block.replace(/`(.*?)`/g, "$1");
              addText(codeText, textSize - 1, "normal");
            } else {
              // Texto normal
              addText(block);
            }

            yPosition += lineHeight / 2;
          }
        };

        // Processar o conteúdo da mensagem
        processMarkdown(message.text);

        // Rodapé
        pdf.setFontSize(10);
        pdf.text(
          `Gerado em: ${new Date().toLocaleString()}`,
          pdf.internal.pageSize.getWidth() - margin,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );

        pdf.save(`${topicTitle.replace(/[^a-z0-9]/gi, "_")}.pdf`);
        setPdfSalve(true);
        setTimeout(() => setPdfSalve(false), 2000);
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao gerar PDF. Uma versão simplificada será criada.");

        // Fallback simples
        const mainFont = "times";
        const titleSize = 14;
        const textSize = 12;
        const margin = 20;
        const pdf = new jsPDF();
        pdf.setFont(mainFont);
        pdf.setFontSize(titleSize);
        pdf.text(topicTitle, margin, margin);
        pdf.setFontSize(textSize);
        pdf.text(message.text, margin, margin + 10);
        pdf.save(`${topicTitle}_simplificado.pdf`);
      }
    };

    return (
      <div
        className={`flex ${
          isBot ? "justify-start" : "justify-end"
        } animate-fadeIn relative mb-6`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Avatar */}
        <div
          className={`flex items-center justify-center bg-gray-700 rounded-full flex-shrink-0 mr-3 ${
            isBot ? "h-10 w-10 sm:w-14 sm:h-14" : "h-10 w-10 sm:w-12 sm:h-12"
          }`}
          aria-label={isBot ? "Bot" : "Usuário"}
        >
          {isBot ? (
            <Image
              src={logo2}
              alt="User profile"
              width={100}
              height={100}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <CircleUser size={20} />
          )}
        </div>

        {/* Bubble da mensagem */}
        <div
          className={`max-w-[75%] p-4 whitespace-pre-wrap break-words ${
            isBot ? botBubbleClass : "bg-blue-600 rounded-lg shadow-lg"
          } `}
        >
          {isStreaming && isBot ? (
            <div>
              {streamingContent ? (
                <div>
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="animate-pulse">●</div>
                  <div className="animate-pulse delay-100">●</div>
                  <div className="animate-pulse delay-200">●</div>
                </div>
              )}
            </div>
          ) : (
            <ReactMarkdown>{message.text}</ReactMarkdown>
          )}
          {!isStreaming && (
            <div
              className={`text-xs mt-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-right`}
            >
              {formattedTime}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
