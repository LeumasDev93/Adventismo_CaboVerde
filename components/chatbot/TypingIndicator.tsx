import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import logo2 from "@/assets/LgoTemaEscuro.png";

const TypingIndicator: React.FC = () => {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const getSystemTheme = () => (mediaQuery.matches ? "dark" : "light");

    const handleThemeChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
      mediaQuery.addEventListener("change", handleThemeChange);
    } else {
      setResolvedTheme(theme === "dark" ? "dark" : "light");
    }

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [theme]);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="flex max-w-[80%] flex-row">
        <div className="flex-shrink-0 mr-2 self-end">
          <div
            className={`sm:w-14 sm:h-14 w-10 h-10 rounded-full shadow-2xl flex items-center justify-center overflow-hidden ${
              isDark ? "bg-gray-700 " : "bg-gray-700 p-2"
            }`}
          >
            <Image
              src={logo2}
              alt="User profile"
              width={100}
              height={100}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        <div>
          <div
            className={`px-4 py-3 rounded-2xl rounded-bl-none shadow-sm bg-gray-700`}
          >
            <div className="flex space-x-1">
              <div
                className={`w-2 h-2 rounded-full animate-bounce bg-white `}
                style={{ animationDelay: "0ms" }}
              />
              <div
                className={`w-2 h-2 rounded-full animate-bounce bg-white`}
                style={{ animationDelay: "150ms" }}
              />
              <div
                className={`w-2 h-2 rounded-full animate-bounce bg-white `}
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
          <div
            className={`text-xs mt-1 text-left ${
              isDark ? "text-gray-400" : "text-gray-200"
            }`}
          >
            Buscando Resposta...
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
