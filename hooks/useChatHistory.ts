import { useState, useEffect, useCallback } from 'react';
import { MessageType } from '@/types';

interface ChatHistory {
  [chatId: string]: MessageType[];
}

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [currentChatId, setCurrentChatId] = useState<string>('');

  // Não carregar histórico automaticamente
  useEffect(() => {
    // Começar sempre com histórico limpo
    setChatHistory({});
    setCurrentChatId('');
  }, []);

  // Salvar histórico no localStorage
  const saveToLocalStorage = useCallback((history: ChatHistory) => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }, []);

  const addMessage = useCallback((chatId: string, message: MessageType) => {
    setChatHistory(prev => {
      const updated = {
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
      };
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  const createNewChat = useCallback(() => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setChatHistory(prev => {
      const updated = {
        ...prev,
        [newChatId]: []
      };
      saveToLocalStorage(updated);
      return updated;
    });
    return newChatId;
  }, [saveToLocalStorage]);

  const deleteChat = useCallback((chatId: string) => {
    setChatHistory(prev => {
      const updated = { ...prev };
      delete updated[chatId];
      saveToLocalStorage(updated);
      return updated;
    });

    // Se o chat deletado era o atual, definir outro como atual
    if (currentChatId === chatId) {
      const remainingChats = Object.keys(chatHistory).filter(id => id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0]);
             } else {
         setCurrentChatId('');
       }
    }
  }, [currentChatId, chatHistory, saveToLocalStorage]);

  return {
    chatHistory,
    currentChatId,
    addMessage,
    createNewChat,
    deleteChat,
    setCurrentChatId,
  };
}
