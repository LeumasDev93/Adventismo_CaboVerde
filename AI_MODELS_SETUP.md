# 🤖 Configuração de Modelos de IA

## 📋 Modelos Disponíveis

### 1. **Gemini 1.5 Flash** (Recomendado - Padrão)
- **Provider**: Google
- **Custo**: Gratuito
- **Características**: Rápido, eficiente, multimodal
- **Configuração**: Apenas `GOOGLE_API_KEY` necessária

### 2. **Llama 3** (Hugging Face)
- **Provider**: Hugging Face
- **Custo**: Gratuito
- **Características**: Open source, conversacional
- **Configuração**: `HUGGINGFACE_API_KEY` necessária

### 3. **Mistral 7B** (Hugging Face)
- **Provider**: Hugging Face
- **Custo**: Gratuito
- **Características**: Rápido, preciso, eficiente
- **Configuração**: `HUGGINGFACE_API_KEY` necessária

### 4. **Zephyr 7B** (Hugging Face)
- **Provider**: Hugging Face
- **Custo**: Gratuito
- **Características**: Conversacional, otimizado
- **Configuração**: `HUGGINGFACE_API_KEY` necessária

### 5. **DeepSeek Chat**
- **Provider**: DeepSeek
- **Custo**: Gratuito
- **Características**: Técnico, análise, preciso
- **Configuração**: `DEEPSEEK_API_KEY` necessária

## 🔧 Como Configurar

### 1. **Google Gemini** (Mais Fácil)
```bash
# Obtenha sua chave em: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=sua_chave_aqui
```

### 2. **Hugging Face** (Para modelos alternativos)
```bash
# Obtenha sua chave em: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=sua_chave_aqui
```

### 3. **DeepSeek** (Opcional)
```bash
# Obtenha sua chave em: https://platform.deepseek.com/
DEEPSEEK_API_KEY=sua_chave_aqui
```

## ⚙️ Como Trocar o Modelo

### Método 1: Variável de Ambiente
```bash
# No arquivo .env.local
DEFAULT_AI_MODEL=huggingface-mistral
```

### Método 2: Código
```typescript
// Em lib/ai-service.ts
const aiService = new AIService('huggingface-mistral');
```

## 🚀 Modelos Mais Eficientes

### **Para Respostas Rápidas:**
1. **Gemini 1.5 Flash** - Mais rápido e confiável
2. **Mistral 7B** - Muito eficiente
3. **Zephyr 7B** - Otimizado para conversas

### **Para Respostas Técnicas:**
1. **DeepSeek Chat** - Especializado em análise
2. **Llama 3** - Boa para conversas complexas

### **Para Respostas Gratuitas:**
- Todos os modelos listados são gratuitos
- Gemini tem limite mais generoso
- Hugging Face tem rate limits

## 🔄 Fallback Automático

O sistema automaticamente:
1. Tenta o modelo configurado
2. Se falhar, tenta Gemini como fallback
3. Se Gemini falhar, retorna erro amigável

## 📊 Comparação de Performance

| Modelo | Velocidade | Qualidade | Custo | Facilidade |
|--------|------------|-----------|-------|------------|
| Gemini 1.5 Flash | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐⭐⭐ |
| Mistral 7B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐ |
| Llama 3 | ⭐⭐⭐ | ⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐ |
| Zephyr 7B | ⭐⭐⭐⭐ | ⭐⭐⭐ | Gratuito | ⭐⭐⭐ |
| DeepSeek | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratuito | ⭐⭐ |

## 🎯 Recomendação

**Para o seu projeto, recomendo:**
1. **Gemini 1.5 Flash** como padrão (já configurado)
2. **Mistral 7B** como alternativa (se quiser testar)
3. **DeepSeek** para análises mais técnicas

## 🔧 Troubleshooting

### Erro de API Key
- Verifique se a chave está correta
- Verifique se a chave tem permissões adequadas

### Erro de Rate Limit
- Aguarde alguns minutos
- Considere trocar para outro modelo

### Erro de Conectividade
- Verifique sua conexão com a internet
- O sistema tentará fallback automático
