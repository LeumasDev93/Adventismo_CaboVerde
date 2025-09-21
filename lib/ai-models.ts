// Configuração de modelos de IA disponíveis
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiEndpoint: string;
  apiKey?: string;
  maxTokens: number;
  cost: 'free' | 'paid';
  description: string;
  features: string[];
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    maxTokens: 8192,
    cost: 'free',
    description: 'Modelo rápido e eficiente do Google, ideal para respostas rápidas',
    features: ['Rápido', 'Gratuito', 'Multimodal', 'Contexto longo']
  },
  {
    id: 'huggingface-llama-3',
    name: 'Llama 3 (Hugging Face)',
    provider: 'Hugging Face',
    apiEndpoint: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
    maxTokens: 4096,
    cost: 'free',
    description: 'Modelo Llama 3 via Hugging Face, excelente para conversas naturais',
    features: ['Open Source', 'Gratuito', 'Conversacional', 'Eficiente']
  },
  {
    id: 'huggingface-mistral',
    name: 'Mistral 7B (Hugging Face)',
    provider: 'Hugging Face',
    apiEndpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
    maxTokens: 4096,
    cost: 'free',
    description: 'Modelo Mistral via Hugging Face, muito eficiente e preciso',
    features: ['Rápido', 'Gratuito', 'Preciso', 'Eficiente']
  },
  {
    id: 'huggingface-zephyr',
    name: 'Zephyr 7B (Hugging Face)',
    provider: 'Hugging Face',
    apiEndpoint: 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
    maxTokens: 4096,
    cost: 'free',
    description: 'Modelo Zephyr otimizado para conversas, baseado em Mistral',
    features: ['Conversacional', 'Gratuito', 'Otimizado', 'Responsivo']
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    maxTokens: 4096,
    cost: 'free',
    description: 'Modelo especializado em programação e análise técnica',
    features: ['Técnico', 'Gratuito', 'Análise', 'Preciso']
  }
];

// Modelo padrão
export const DEFAULT_MODEL = 'gemini-1.5-flash';

// Função para obter modelo por ID
export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id);
}

// Função para obter modelos gratuitos
export function getFreeModels(): AIModel[] {
  return AI_MODELS.filter(model => model.cost === 'free');
}

// Função para obter modelo mais eficiente (baseado em features)
export function getMostEfficientModel(): AIModel {
  // Prioriza modelos com mais features de eficiência
  const efficientModels = AI_MODELS.filter(model => 
    model.features.includes('Rápido') || 
    model.features.includes('Eficiente') ||
    model.features.includes('Responsivo')
  );
  
  return efficientModels[0] || AI_MODELS[0];
}
