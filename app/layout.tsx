/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import { Suspense, useEffect } from "react";
import { urlBase64ToUint8Array } from "@/utils/push";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    async function initPush() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          return;
        }

        const swReg = await navigator.serviceWorker.register("/sw.js");
        const readyReg = await navigator.serviceWorker.ready;

        console.log("SW pronto:", readyReg);

        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });

        const res = await fetch("/api/notifications/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        console.log("Resposta do backend:", json);
      } catch (error) {
        // console.error("Erro no push:", error);
      }
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      initPush();
    }
  }, []);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <title>IA - História do Adventismo em Cabo Verde</title>
        <meta
          name="description"
          content="Assistente virtual para estudos da História do Adventismo em Cabo Verde"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
