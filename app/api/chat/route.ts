/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadBookContent, getRelevantContent } from "./load-book-content";

// Configuração do Google Gemini (gratuito)
const genAI = new GoogleGenerativeAI("AIzaSyDKKh7g6zhdCzR8QDNkEH36onZmH4s4KCA");

// Dados do livro História do Adventismo em Cabo Verde
const BOOK_DATA = {
  title: "História do Adventismo em Cabo Verde",
  author: "Autores Diversos",
  description: "Uma obra completa e abrangente sobre a história, desenvolvimento e impacto do movimento adventista em Cabo Verde, incluindo pioneiros, igrejas, eventos históricos, líderes, educação, missão e o crescimento da comunidade adventista no arquipélago.",
  topics: [
    "Pioneiros e Fundadores do Adventismo Em Cabo Verde",
    "Primeiras Igrejas e Congregações",
    "História da Igreja Adventista",
    "Desenvolvimento e Expansão do Movimento",
    "Líderes, Pastores e Ministros Históricos",
    "Eventos, Conferências e Assembleias",
    "Educação e Instituições Adventistas",
    "Missão, Evangelismo e Crescimento",
    "Crescimento da Comunidade e Membros",
    "Impacto Social, Cultural e Religioso",
    "Doutrinas e Ensino Teológico",
    "Organização Eclesiástica",
    "Jovens e Ministério Juvenil",
    "Mulheres e Ministério Feminino",
    "Música e Adoração",
    "Publicações e Literatura",
    "Saúde e Estilo de Vida",
    "Desenvolvimento Comunitário",
    "Relacionamento com Outras Denominações",
    "Perspectivas Futuras do Movimento"
  ]
};

function buildSystemPrompt(): string {
   return `
   # ESPECIALISTA EM HISTÓRIA DO ADVENTISMO EM CABO VERDE
   
   Você é um **historiador especialista** na História do Adventismo em Cabo Verde.
   Sua missão é contar a história **de forma envolvente e convincente**, baseada **exclusivamente** no conteúdo do livro "História do Adventismo em Cabo Verde".
   
   ## 🎯 ESTILO DE RESPOSTA
   - **Seja CONVINCENTE e NATURAL** - como um historiador contando uma história real
   - **APROFUNDE nos detalhes** - use todo o conteúdo disponível
   - **Mencione NOMES, DATAS e LOCAIS** específicos quando disponíveis
   - **Conte a história completa** - não seja superficial
   - **Seja ENVOLVENTE** - faça o leitor sentir que está ouvindo a história real
   
   ## ⚠️ REGRAS CRÍTICAS
   - Responda APENAS com informações do livro
   - NUNCA invente ou adicione informações externas
   - NÃO mencione "resumo do livro" ou "conteúdo fornecido"
   - Seja direto e natural, como um especialista contando história
   - Se a informação não estiver no livro, diga "Esta informação não está disponível no conteúdo fornecido"
   
   ## 📖 LIVRO BASE
   **TÍTULO**: ${BOOK_DATA.title}
   **AUTOR**: ${BOOK_DATA.author}
   
   ## 📚 ESTRUTURA COMPLETA DO LIVRO
   - 📋 **FICHA TÉCNICA** - Informações editoriais e técnicas
   - 💝 **DEDICATÓRIA** - Dedicatória pessoal do autor
   - 🙏 **AGRADECIMENTOS** - Agradecimentos a colaboradores
   - 📖 **PREFÁCIO** - Introdução e contexto da obra
   - 📝 **NOTA** - Observações importantes
   - 📋 **RESUMO** - Resumo em português
   - 🌍 **ABSTRACT** - Resumo em inglês
   - 📖 **CAPÍTULO I** - Introdução e metodologia
   - 📖 **CAPÍTULO II** - IASD a nível mundial
   - 📖 **CAPÍTULO III** - IASD em Cabo Verde (história, evolução, caraterização)
   - 📖 **CAPÍTULO IV** - Conclusões e recomendações
   - 📚 **BIBLIOGRAFIA** - Referências bibliográficas
   - 📎 **ANEXOS** - Documentos e materiais complementares
   
   Responda como um historiador especialista, contando a história real do adventismo em Cabo Verde de forma envolvente e convincente, baseado APENAS no conteúdo fornecido.`.trim();
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
  
             if (/^(ola|oi|olá|hello|bom dia|boa tarde|boa noite)/i.test(userMessage.toLowerCase())) {
         return NextResponse.json({
           message: `# Olá! 👋

Sou especialista na **História do Adventismo em Cabo Verde**.

## Posso responder sobre:
- 👥 **Pioneiros** - António Gomes, Manuel Andrade (Nhô Mocho) e outros
- ⛪ **História da Igreja** - Fundação, desenvolvimento e expansão
- 🎪 **Eventos Históricos** - Batismos, chegada de pastores, conferências
- 🏗️ **Locais** - Ilhas, cidades e zonas específicas
- 👨‍💼 **Líderes Históricos** - Pastores e suas contribuições
- 🎓 **Educação** - Escolas e instituições adventistas
- 🌍 **Missão** - Trabalho missionário em Cabo Verde
- 📋 **Estrutura Completa** - Ficha técnica, dedicatória, agradecimentos, prefácio, resumo, capítulos, bibliografia e anexos

## Exemplos de perguntas:
- "Quando foi fundada a primeira igreja adventista em Cabo Verde?"
- "Quem foram os pioneiros do adventismo em Cabo Verde?"
- "Onde foi construída a primeira igreja?"
- "Quem foi o primeiro pastor?"

**Faça sua pergunta e eu conto a história real baseada no conteúdo do livro!** 📖`
         });
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
     
     const chat = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).startChat({
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
               maxOutputTokens: 4000,
               temperature: 0.4,
           },
       });
   
     const result = await chat.sendMessage(`Você é um especialista na História do Adventismo em Cabo Verde. Baseado EXCLUSIVAMENTE no conteúdo fornecido do livro, responda à pergunta de forma CONVINCENTE e DETALHADA.

REGRAS CRÍTICAS:
- Use APENAS informações do conteúdo fornecido acima
- NUNCA invente ou adicione informações externas
- Mencione NOMES, DATAS e LOCAIS específicos quando disponíveis
- Seja CONVINCENTE e DETALHADO - conte a história completa
- APROFUNDE no conteúdo disponível para dar respostas ricas
- Se a informação não estiver no conteúdo, diga "Esta informação não está disponível no conteúdo fornecido"
- Use TODO o conteúdo disponível para dar respostas completas e envolventes
- NÃO mencione "resumo do livro" ou "conteúdo fornecido" - seja direto e natural

CONTEÚDO DO LIVRO:
${relevantContent}

PERGUNTA: ${userMessage}

RESPONDA de forma CONVINCENTE e DETALHADA, baseado EXCLUSIVAMENTE no conteúdo acima. Seja natural e envolvente, como um historiador contando uma história real.`);
     const response = result.response;
     const text = response.text();
  
      return NextResponse.json({ 
        message: text, 
        bookInfo: BOOK_DATA
      }, { status: 200 });
  
    } catch (error: any) {
    console.error("Erro com Gemini:", error);
      
    return NextResponse.json(
        { message: "Desculpe, estou tendo dificuldades técnicas. Poderia tentar novamente?" },
      { status: 500 }
    );
  }
}