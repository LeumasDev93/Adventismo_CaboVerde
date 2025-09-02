# Assistente IA - História do Adventismo em Cabo Verde

Este é um assistente de inteligência artificial especializado na História do Adventismo em Cabo Verde, desenvolvido para fornecer análises profundas sobre pioneiros, igrejas, eventos históricos e o desenvolvimento do movimento adventista no arquipélago.

## 🎯 Funcionalidades

- **Análise Profunda**: Respostas detalhadas sobre a história adventista em Cabo Verde
- **Contexto Histórico**: Fornecimento de contexto histórico-cultural completo
- **Geração de Imagens**: Criação de imagens educacionais relacionadas à história
- **Análise Teológica**: Exploração dos fundamentos doutrinários e suas implicações
- **Exemplos Concretos**: Uso de exemplos históricos e contemporâneos
- **Ligações Históricas**: Relacionamento com outros movimentos religiosos e eventos

## 📚 Livro Base

O assistente foi treinado com base no livro "História do Adventismo em Cabo Verde", que inclui análises sobre:

- Pioneiros do Adventismo em Cabo Verde
- Primeiras Igrejas Adventistas
- História da Igreja Adventista
- Desenvolvimento do Movimento
- Líderes e Pastores Históricos
- Eventos e Conferências
- Educação Adventista
- Missão e Evangelismo
- Crescimento da Comunidade
- Impacto Social e Cultural

## 🚀 Tecnologias

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Next.js API Routes
- **IA**: Google Gemini (gratuito)
- **Estilização**: Tailwind CSS
- **Autenticação**: Supabase
- **Armazenamento**: Local (localStorage)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd Historia_Adventismo
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure as seguintes variáveis no `.env.local`:
```
# Supabase Configuration (apenas para autenticação)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```

**Nota**: O Google Gemini é usado gratuitamente e não requer configuração de API key.

5. Execute o projeto:
```bash
npm run dev
```

## 🎨 Interface

O projeto possui uma interface moderna e responsiva com:

- **Tema Escuro/Claro**: Suporte a múltiplos temas
- **Chat Interativo**: Interface de conversação fluida
- **Quick Replies**: Respostas rápidas para temas comuns
- **Geração de PDF**: Exportação de conversas em PDF
- **Síntese de Voz**: Leitura em voz alta das respostas
- **Histórico**: Salvamento e recuperação de conversas

## 🔧 Configuração do Supabase

1. Crie um projeto no Supabase (https://supabase.com)
2. Configure apenas a autenticação de usuários
3. Copie as credenciais do projeto:
   - URL do projeto
   - Chave anônima (anon key)
4. Adicione as credenciais no arquivo `.env.local`

**Nota**: Este projeto usa o Supabase apenas para autenticação. O histórico de chat é salvo localmente no navegador.

## 📊 Capacidades Especiais

### Respostas Detalhadas
O assistente fornece respostas completas e bem formatadas sobre:
- História adventista em Cabo Verde
- Contexto histórico-cultural
- Análise teológica aprofundada
- Exemplos e aplicações práticas
- Formatação rica em markdown

### Contextualização Histórica
- Fornecimento de contexto histórico-cultural completo
- Análise de eventos históricos relacionados
- Explicação de influências e consequências

### Análise Teológica
- Exploração dos fundamentos doutrinários
- Análise de implicações práticas
- Relacionamento com movimentos religiosos contemporâneos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Leumas Andrade**
- Desenvolvedor Full Stack
- Especialista em IA e Machine Learning
- Entusiasta de filosofia e teoria social

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através do email ou abra uma issue no repositório.

---

**Nota**: Este assistente é uma ferramenta educacional e pode cometer erros. Sempre verifique informações importantes e use como complemento ao estudo acadêmico.
