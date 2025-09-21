import { useState, useCallback } from 'react';

interface StreamingMessage {
  content: string;
  isComplete: boolean;
  timestamp: string;
}

export const useStreamingChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);

  const sendMessage = useCallback(async (userMessage: string): Promise<string> => {
    setIsStreaming(true);
    setStreamingMessage({
      content: '',
      isComplete: false,
      timestamp: new Date().toISOString()
    });

    let finalContent = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream não disponível');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6);
              const data = JSON.parse(jsonData);
              
              if (data.type === 'complete') {
                // Fazer efeito de digitação aqui mesmo
                const fullText = data.content;
                finalContent = fullText;
                
                let currentIndex = 0;
                const typeWriter = () => {
                  if (currentIndex < fullText.length) {
                    const currentText = fullText.substring(0, currentIndex + 1);
                    setStreamingMessage({
                      content: currentText,
                      isComplete: false,
                      timestamp: new Date().toISOString()
                    });
                    currentIndex++;
                    setTimeout(typeWriter, 50); // 50ms por caractere
                  } else {
                    setStreamingMessage(prev => prev ? {
                      ...prev,
                      isComplete: true
                    } : null);
                  }
                };
                
                typeWriter();
              } else if (data.type === 'end') {
                setStreamingMessage(prev => prev ? {
                  ...prev,
                  isComplete: true
                } : null);
                break;
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch (parseError) {
              console.error('Erro ao parsear chunk:', parseError);
            }
          }
        }
      }

      return finalContent;
    } catch (error) {
      console.error('Erro no streaming:', error);
      setStreamingMessage(prev => prev ? {
        ...prev,
        content: 'Erro ao processar resposta. Tente novamente.',
        isComplete: true
      } : null);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const clearStreamingMessage = useCallback(() => {
    setStreamingMessage(null);
  }, []);

  return {
    isStreaming,
    streamingMessage,
    sendMessage,
    clearStreamingMessage
  };
};
