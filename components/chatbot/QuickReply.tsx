import { useTheme } from "@/contexts/ThemeContext";
import React from "react";

interface QuickReplyProps {
  text: string;
  onClick: () => void;
}

// Define allowed theme keys
type ThemeKey = "system" | "light" | "dark";

const themeStyles: Record<
  ThemeKey,
  {
    bg: string;
    text: string;
    hover: string;
    focus: string;
    shadow: string;
  }
> = {
  system: {
    bg: "bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800",
    text: "text-white",
    hover:
      "hover:from-blue-500 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-900",
    focus: "focus:ring-blue-500 dark:focus:ring-blue-400",
    shadow: "shadow-md dark:shadow-2xl",
  },
  light: {
    bg: "bg-gradient-to-r from-blue-400 to-blue-600",
    text: "text-white",
    hover: "hover:from-blue-500 hover:to-blue-700",
    focus: "focus:ring-blue-500",
    shadow: "shadow-md",
  },
  dark: {
    bg: "bg-gradient-to-r from-blue-600 to-blue-800",
    text: "text-white",
    hover: "hover:from-blue-700 hover:to-blue-900",
    focus: "focus:ring-blue-400",
    shadow: "shadow-2xl",
  },
};

const QuickReply: React.FC<QuickReplyProps> = ({ text, onClick }) => {
  const { theme } = useTheme();

  // Seleciona o estilo baseado no tema atual
  const styles = themeStyles[theme as ThemeKey] || themeStyles.system;

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] md:text-xs xl:text-sm transition-colors focus:outline-none focus:ring-1 
      ${styles.bg} ${styles.text} ${styles.hover} ${styles.focus} ${styles.shadow}`}
    >
      {text}
    </button>
  );
};

export default QuickReply;
