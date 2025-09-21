import { AIModel, getModelById } from './ai-models';

export interface AIResponse {
  message: string;
  model: string;
  tokens?: number;
  error?: string;
}

export class AIService {
  private currentModel: AIModel;

  constructor(modelId: string = 'gemini-1.5-flash') {
    this.currentModel = getModelById(modelId) || getModelById('gemini-1.5-flash')!;
  }

  // Método para trocar o modelo atual
  setModel(modelId: string): boolean {
    const model = getModelById(modelId);
    if (model) {
      this.currentModel = model;
      return true;
    }
    return false;
  }

  // Método para obter o modelo atual
  getCurrentModel(): AIModel {
    return this.currentModel;
  }

  // Método principal para gerar resposta
  async generateResponse(userMessage: string, context: string): Promise<AIResponse> {
    try {
      switch (this.currentModel.provider) {
        case 'Google':
          return await this.callGemini(userMessage, context);
        case 'Hugging Face':
          return await this.callHuggingFace(userMessage, context);
        case 'DeepSeek':
          return await this.callDeepSeek(userMessage, context);
        default:
          return await this.callGemini(userMessage, context);
      }
    } catch (error) {
      console.error('Erro no AI Service:', error);
      
      // Fallback para Gemini 1.5 Flash se o modelo atual falhar
      if (this.currentModel.id !== 'gemini-1.5-flash') {
        console.log('Tentando fallback para Gemini 1.5 Flash...');
        try {
          const fallbackModel = { ...this.currentModel, id: 'gemini-1.5-flash' };
          this.currentModel = fallbackModel;
          return await this.callGemini(userMessage, context);
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      }
      
      return {
        message: 'Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?',
        model: this.currentModel.id,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Chamada para Gemini
  private async callGemini(userMessage: string, context: string): Promise<AIResponse> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    // Usar a chave que já estava funcionando no código original
    const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyDKKh7g6zhdCzR8QDNkEH36onZmH4s4KCA";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: this.currentModel.id });

    const systemPrompt = `Você é um especialista no livro "O que dizer dos adventistas em Cabo Verde" de Karl Marx Morgan Lima Monteiro. 
    FAÇA UMA BUSCA PROFUNDA no conteúdo fornecido antes de responder.
    Se encontrar informações relevantes, apresente-as de forma organizada e detalhada.
    Use o conteúdo do livro para responder de forma precisa e fundamentada.`;

    const prompt = `${systemPrompt}\n\nConteúdo do livro:\n${context}\n\nPergunta do usuário: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      message: text,
      model: this.currentModel.id
    };
  }

  // Chamada para Hugging Face
  private async callHuggingFace(userMessage: string, context: string): Promise<AIResponse> {
    const prompt = `Você é um especialista no livro "O que dizer dos adventistas em Cabo Verde" de Karl Marx Morgan Lima Monteiro.
    
Conteúdo do livro:
${context}

Pergunta: ${userMessage}

Responda baseado no conteúdo fornecido de forma detalhada e organizada:`;

    const response = await fetch(this.currentModel.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: Math.min(this.currentModel.maxTokens, 2048),
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
      return {
        message: data[0].generated_text || 'Resposta não disponível',
        model: this.currentModel.id
      };
    }

    throw new Error('Resposta inválida da API do Hugging Face');
  }

  // Chamada para DeepSeek
  private async callDeepSeek(userMessage: string, context: string): Promise<AIResponse> {
    const response = await fetch(this.currentModel.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista no livro "O que dizer dos adventistas em Cabo Verde" de Karl Marx Morgan Lima Monteiro. Use o conteúdo fornecido para responder de forma precisa e detalhada.`
          },
          {
            role: 'user',
            content: `Conteúdo do livro:\n${context}\n\nPergunta: ${userMessage}`
          }
        ],
        max_tokens: this.currentModel.maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do DeepSeek: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      message: data.choices[0]?.message?.content || 'Resposta não disponível',
      model: this.currentModel.id,
      tokens: data.usage?.total_tokens
    };
  }

  // Método para testar conectividade com um modelo
  async testConnection(): Promise<boolean> {
    try {
      await this.generateResponse('Teste', 'Teste de conectividade');
      return true;
    } catch (error) {
      console.error('Erro no teste de conectividade:', error);
      return false;
    }
  }
}

// Instância singleton
export const aiService = new AIService();
