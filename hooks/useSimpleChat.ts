import { useState, useCallback } from 'react';

export const useSimpleChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const sendMessage = useCallback(async (userMessage: string): Promise<string> => {
    // Resetar estados
    setStreamingContent('');
    setIsTypingComplete(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Erro ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Simular efeito de digitação
      const fullText = result.message;
      
      // Iniciar digitação após receber resposta
      let currentIndex = 0;
      const typeWriter = () => {
        if (currentIndex === 0) {
          // Primeira vez - ativar streaming
          setIsStreaming(true);
        }
        
        if (currentIndex < fullText.length) {
          const currentText = fullText.substring(0, currentIndex + 1);
          setStreamingContent(currentText);
          currentIndex++;
          setTimeout(typeWriter, 25); // Mais rápido - 25ms em vez de 50ms
        } else {
          setIsStreaming(false);
          setIsTypingComplete(true);
          // Limpar o conteúdo imediatamente para evitar duplicação
          setTimeout(() => {
            setStreamingContent('');
          }, 100);
        }
      };
      
      // Iniciar após um pequeno delay
      setTimeout(typeWriter, 100);
      
      // Retornar uma Promise que resolve quando a digitação terminar
      return new Promise((resolve) => {
        // Calcular o tempo total de digitação
        const totalTypingTime = fullText.length * 25; // 25ms por caractere
        const finalDelay = Math.max(totalTypingTime + 500, 2000); // Mínimo 2 segundos
        
        setTimeout(() => {
          resolve(fullText);
        }, finalDelay);
      });
    } catch (error) {
      console.error('Erro no chat:', error);
      setIsStreaming(false);
      throw error;
    }
  }, []);

  const clearStreaming = useCallback(() => {
    setStreamingContent('');
    setIsStreaming(false);
    setIsTypingComplete(false);
  }, []);

  return {
    isStreaming,
    streamingContent,
    isTypingComplete,
    sendMessage,
    clearStreaming
  };
};
