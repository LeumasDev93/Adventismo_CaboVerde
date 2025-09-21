import React from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      logo: "w-8 h-8",
      spinner: "w-16 h-16",
    },
    md: {
      container: "w-24 h-24",
      logo: "w-12 h-12",
      spinner: "w-24 h-24",
    },
    lg: {
      container: "w-32 h-32",
      logo: "w-16 h-16",
      spinner: "w-32 h-32",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`relative ${currentSize.container} ${className}`}>
      {/* Logo no centro */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Image
          src={logo}
          alt="Logo"
          width={100}
          height={100}
          className={`${currentSize.logo} object-cover`}
        />
      </div>

      {/* Spinner girando em torno */}
      <div className="absolute inset-0">
        <svg
          className={`${currentSize.spinner} animate-spin text-blue-600 dark:text-blue-400`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Círculo de fundo */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.2"
            fill="none"
          />

          {/* Círculo do spinner */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="70 200"
            strokeDashoffset="0"
            fill="none"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingSpinner;
