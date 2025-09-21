/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadBookContent, getRelevantContent } from "./load-book-content";

// Configuração do Google Gemini (gratuito)
const genAI = new GoogleGenerativeAI("AIzaSyDKKh7g6zhdCzR8QDNkEH36onZmH4s4KCA");


function buildSystemPrompt(): string {
   return `
   # ESPECIALISTA EM HISTÓRIA DO ADVENTISMO EM CABO VERDE
   
   Você é um **historiador especialista** na História do Adventismo em Cabo Verde.
   Sua missão é responder **EXCLUSIVAMENTE** baseado no conteúdo do livro "O que dizer dos adventistas em Cabo Verde" de Karl Marx Morgan Lima Monteiro.
   
   ## ⚠️ REGRAS CRÍTICAS ABSOLUTAS
   - Responda APENAS com informações que estão no livro
   - NUNCA invente, adicione ou suponha informações externas
   - NUNCA use conhecimento geral sobre adventismo
   - FAÇA UMA BUSCA PROFUNDA no conteúdo fornecido antes de responder
   - Se encontrar informações relevantes, apresente-as de forma organizada e detalhada
   - Se a informação não estiver no livro, responda: "Esta informação não está disponível no livro 'O que dizer dos adventistas em Cabo Verde'"
   - Seja DIRETO e PRECISO - não adicione informações que não estão no livro
   
   ## 📖 LIVRO BASE
   **TÍTULO**: O que dizer dos adventistas em Cabo Verde
   **AUTOR**: Karl Marx Morgan Lima Monteiro
   **EDIÇÃO**: 1ª Edição, Dezembro 2012, 500 exemplares
   
   ## 📚 ESTRUTURA DO LIVRO
   - Ficha Técnica
   - Dedicatória
   - Epígrafe
   - Agradecimentos
   - Prefácio
   - Nota
   - Resumo
   - Abstract
   - Capítulo I – Introdução
   - Capítulo II – A IASD a nível mundial
   - Capítulo III – A IASD em Cabo Verde
   - Conclusões
   - Bibliografia
   - Anexos
   
   Responda APENAS com informações que estão no livro. Se não souber, diga que a informação não está disponível no livro.`.trim();
   }
const systemPrompt = buildSystemPrompt();

export async function POST(req: NextRequest) {
  const { userMessage } = await req.json();
  
  if (!userMessage?.trim()) {
    return NextResponse.json(
      { message: "Por favor, envie uma pergunta válida." },
      { status: 400 }
    );
  }
  
  
       try {
     // Carregar conteúdo do livro
     const bookContent = await loadBookContent();
     
     if (!bookContent) {
       return NextResponse.json(
         { message: "Conteúdo do livro não encontrado. Execute o scraper primeiro." },
         { status: 500 }
       );
     }
     
     // Obter conteúdo relevante baseado na pergunta
     const relevantContent = getRelevantContent(bookContent, userMessage);
     
     // Aumentar significativamente o limite de conteúdo para respostas completas
     const maxContentLength = 200000; // 200KB para respostas mais completas
     const limitedContent = relevantContent.length > maxContentLength 
       ? relevantContent.substring(0, maxContentLength) + '\n\n... (conteúdo continua no livro)'
       : relevantContent;
     
              const chat = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
                   history: [
                       {
                         role: "user",
                         parts: [{ text: systemPrompt }]
                       },
                       {
                           role: "model",
                           parts: [{ text: "Entendi. Sou especialista no livro 'História do Adventismo em Cabo Verde'. Vou usar o conteúdo fornecido para responder com informações precisas, incluindo nomes, datas e locais específicos." }]
                       }
                   ],
                   generationConfig: {
                       maxOutputTokens: 2000, // Reduzido para respostas mais rápidas
                       temperature: 0.3, // Reduzido para consistência
                       topP: 0.8,
                       topK: 20,
                   },
               });
   
     const result = await chat.sendMessage(`CONTEÚDO DO LIVRO "O que dizer dos adventistas em Cabo Verde" de Karl Marx Morgan Lima Monteiro:

${limitedContent}

PERGUNTA: ${userMessage}

INSTRUÇÕES:
- FAÇA UMA BUSCA PROFUNDA no conteúdo do livro acima
- Procure por nomes, datas, locais e eventos relacionados à pergunta
- Se encontrar informações relevantes, apresente-as de forma organizada e detalhada
- Responda APENAS com informações que estão no conteúdo do livro acima
- Se a informação não estiver no livro, responda: "Esta informação não está disponível no livro 'O que dizer dos adventistas em Cabo Verde'"
- NÃO invente ou adicione informações externas
- Seja direto e preciso

RESPONDA:`);

     const response = result.response;
     const text = response.text();

     return NextResponse.json({ 
       message: text, 
       timestamp: new Date().toISOString() 
     }, { status: 200 });
  
    } catch (error: any) {
    console.error("Erro com Gemini:", error);
    
    // Verificar se é um erro de timeout ou rate limit
    if (error.message?.includes('timeout') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        { message: "O servidor está temporariamente sobrecarregado. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }
    
    // Verificar se é um erro de API key
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return NextResponse.json(
        { message: "Erro de configuração da API. Contate o administrador." },
        { status: 500 }
      );
    }
      
    return NextResponse.json(
        { message: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?" },
      { status: 500 }
    );
  }
}