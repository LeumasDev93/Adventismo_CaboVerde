/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadBookContent, getRelevantContent } from "./load-book-content";

// Configuração do Google Gemini (gratuito)
const genAI = new GoogleGenerativeAI("AIzaSyDKKh7g6zhdCzR8QDNkEH36onZmH4s4KCA");

// Lista de modelos para tentar em sequência
const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-1.5-pro", 
  "gemini-2.0-flash",
  "gemini-1.0-pro"
];

// Função para tentar diferentes modelos em sequência
async function tryMultipleModels(userMessage: string, limitedContent: string): Promise<string> {
  let lastError: Error | null = null;
  
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Tentando modelo: ${modelName}`);
      
      const chat = genAI.getGenerativeModel({ model: modelName }).startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Você é um especialista no livro 'O que dizer dos adventistas em Cabo Verde' de Karl Marx Morgan Lima Monteiro. Responda APENAS com informações que estão no livro fornecido." }]
          },
          {
            role: "model",
            parts: [{ text: "Entendi. Sou especialista no livro 'O que dizer dos adventistas em Cabo Verde'. Vou usar o conteúdo fornecido para responder com informações precisas, incluindo nomes, datas e locais específicos." }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.3,
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
      
      console.log(`✅ Modelo ${modelName} funcionou!`);
      return text;
      
    } catch (error) {
      console.log(`❌ Modelo ${modelName} falhou:`, error);
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      continue; // Tenta o próximo modelo
    }
  }
  
  // Se todos os modelos Gemini falharam, tentar Hugging Face como último recurso
  try {
    console.log('Tentando Hugging Face como último recurso...');
    return await tryHuggingFace(userMessage, limitedContent);
  } catch (huggingFaceError) {
    console.log('Hugging Face também falhou:', huggingFaceError);
  }
  
  // Se todos os modelos falharam
  throw lastError || new Error('Todos os modelos falharam');
}

// Função para tentar Hugging Face como fallback
async function tryHuggingFace(userMessage: string, limitedContent: string): Promise<string> {
  const prompt = `Você é um especialista no livro "O que dizer dos adventistas em Cabo Verde" de Karl Marx Morgan Lima Monteiro.

Conteúdo do livro:
${limitedContent}

Pergunta: ${userMessage}

Responda baseado no conteúdo fornecido de forma detalhada e organizada:`;

  const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Erro na API do Hugging Face: ${response.status}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data) && data.length > 0) {
    return data[0].generated_text || 'Resposta não disponível';
  }

  throw new Error('Resposta inválida da API do Hugging Face');
}

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
     
     // Tentar múltiplos modelos em sequência
     const text = await tryMultipleModels(userMessage, limitedContent);

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