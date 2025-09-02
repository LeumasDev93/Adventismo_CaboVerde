/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

export default function ResponsiveWrapper({
  children,
  className = "",
  mobileClassName = "",
  tabletClassName = "",
  desktopClassName = "",
}: ResponsiveWrapperProps) {
  const baseClasses = `
    transition-all duration-300 ease-in-out
    ${className}
    ${mobileClassName}
    sm:${tabletClassName}
    lg:${desktopClassName}
  `.trim();

  return <div className={baseClasses}>{children}</div>;
}

// Componente para cards responsivos
export function ResponsiveCard({
  children,
  className = "",
  isDark = false,
}: {
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}) {
  const baseClasses = `
    card-interactive
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    rounded-2xl p-4 sm:p-6
    shadow-lg hover:shadow-xl
    transition-all duration-300
    ${className}
  `.trim();

  return <div className={baseClasses}>{children}</div>;
}

// Componente para botões responsivos
export function ResponsiveButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = `
    font-medium rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300",
    outline:
      "border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

// Componente para inputs responsivos
export function ResponsiveInput({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = `
    input-enhanced
    w-full px-3 sm:px-4 py-2 sm:py-3
    text-sm sm:text-base
    rounded-xl
    ${className}
  `.trim();

  return <input className={baseClasses} {...props} />;
}

// Componente para textarea responsivo
export function ResponsiveTextarea({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = `
    input-enhanced
    w-full px-3 sm:px-4 py-2 sm:py-3
    text-sm sm:text-base
    rounded-xl resize-none
    ${className}
  `.trim();

  return <textarea className={baseClasses} {...props} />;
}
