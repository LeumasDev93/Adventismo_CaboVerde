/* eslint-disable @typescript-eslint/no-unused-vars */
import { createComponentClient } from "@/models/supabase";
import fs from 'fs';
import path from 'path';

// Cache global para o conteúdo do livro
let bookContentCache: BookContent | null = null;

export interface BookContent {
  id: number;
  title: string;
  author: string;
  extracted_at: string;
  full_content: string;
  original_content: string;
  total_characters: number;
  total_words: number;
  sections: Array<{
    title: string;
    content: string;
    keywords: string[];
  }>;
}

// Função para salvar o conteúdo do livro no Supabase
export async function saveBookContentToSupabase(): Promise<boolean> {
  try {
    console.log('💾 Salvando conteúdo do livro no Supabase...');
    
    const livroPath = path.join(process.cwd(), 'data', 'livro-adventismo-cabo-verde.txt');
    
    if (!fs.existsSync(livroPath)) {
      console.error('❌ Arquivo do livro não encontrado!');
      return false;
    }
    
    const content = fs.readFileSync(livroPath, 'utf-8');
    
    // Dividir em seções baseado na estrutura completa do livro
    const sections: Array<{title: string, content: string, keywords: string[]}> = [];
    
    // 1. FICHA TÉCNICA
    const fichaTecnicaMatch = content.match(/Ficha Técnica[\s\S]*?(?=Dedicatória|Capítulo|$)/i);
    if (fichaTecnicaMatch) {
      sections.push({
        title: "📋 FICHA TÉCNICA",
        content: fichaTecnicaMatch[0].trim(),
        keywords: extractKeywords(fichaTecnicaMatch[0])
      });
    }
    
    // 2. DEDICATÓRIA
    const dedicatoriaMatch = content.match(/Dedicatória[\s\S]*?(?=Agradecimentos|Capítulo|$)/i);
    if (dedicatoriaMatch) {
      sections.push({
        title: "💝 DEDICATÓRIA",
        content: dedicatoriaMatch[0].trim(),
        keywords: extractKeywords(dedicatoriaMatch[0])
      });
    }
    
    // 3. AGRADECIMENTOS
    const agradecimentosMatch = content.match(/Agradecimentos[\s\S]*?(?=Prefácio|Capítulo|$)/i);
    if (agradecimentosMatch) {
      sections.push({
        title: "🙏 AGRADECIMENTOS",
        content: agradecimentosMatch[0].trim(),
        keywords: extractKeywords(agradecimentosMatch[0])
      });
    }
    
    // 4. PREFÁCIO
    const prefacioMatch = content.match(/Prefácio[\s\S]*?(?=Nota|Capítulo|$)/i);
    if (prefacioMatch) {
      sections.push({
        title: "📖 PREFÁCIO",
        content: prefacioMatch[0].trim(),
        keywords: extractKeywords(prefacioMatch[0])
      });
    }
    
    // 5. NOTA
    const notaMatch = content.match(/Nota[\s\S]*?(?=Resumo|Capítulo|$)/i);
    if (notaMatch) {
      sections.push({
        title: "📝 NOTA",
        content: notaMatch[0].trim(),
        keywords: extractKeywords(notaMatch[0])
      });
    }
    
    // 6. RESUMO
    const resumoMatch = content.match(/Resumo[\s\S]*?(?=Abstract|Capítulo|$)/i);
    if (resumoMatch) {
      sections.push({
        title: "📋 RESUMO",
        content: resumoMatch[0].trim(),
        keywords: extractKeywords(resumoMatch[0])
      });
    }
    
    // 7. ABSTRACT
    const abstractMatch = content.match(/Abstract[\s\S]*?(?=Capítulo|$)/i);
    if (abstractMatch) {
      sections.push({
        title: "🌍 ABSTRACT",
        content: abstractMatch[0].trim(),
        keywords: extractKeywords(abstractMatch[0])
      });
    }
    
    // 8. CAPÍTULOS
    const chapterMatches = content.match(/CAPÍTULO\s+[IVX]+\s*[–-]\s*([^\n]+)/gi);
    if (chapterMatches) {
      chapterMatches.forEach((match, index) => {
        const title = match.trim();
        const startIndex = content.indexOf(match);
        const endIndex = index < chapterMatches.length - 1 
          ? content.indexOf(chapterMatches[index + 1]) 
          : content.length;
        
        const sectionContent = content.substring(startIndex, endIndex).trim();
        
        sections.push({
          title: title,
          content: sectionContent,
          keywords: extractKeywords(title + ' ' + sectionContent)
        });
      });
    }
    
    // 9. BIBLIOGRAFIA
    const bibliografiaMatch = content.match(/Bibliografia[\s\S]*?(?=Anexos|$)/i);
    if (bibliografiaMatch) {
      sections.push({
        title: "📚 BIBLIOGRAFIA",
        content: bibliografiaMatch[0].trim(),
        keywords: extractKeywords(bibliografiaMatch[0])
      });
    }
    
    // 10. ANEXOS
    const anexosMatch = content.match(/Anexos[\s\S]*?$/i);
    if (anexosMatch) {
      sections.push({
        title: "📎 ANEXOS",
        content: anexosMatch[0].trim(),
        keywords: extractKeywords(anexosMatch[0])
      });
    }
    
    // Se não encontrou seções estruturadas, dividir por parágrafos
    if (sections.length === 0) {
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 100);
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          const lines = paragraph.trim().split('\n');
          const title = lines[0]?.trim().substring(0, 100) || `Parágrafo ${index + 1}`;
          const content = paragraph.trim();
          
          sections.push({
            title: title,
            content: content,
            keywords: extractKeywords(title + ' ' + content)
          });
        }
      });
    }
    
    const bookData = {
      title: "O que dizer dos adventistas em Cabo Verde",
      author: "Karl Marx Morgan Lima Monteiro",
      extracted_at: new Date().toISOString(),
      full_content: content,
      original_content: content,
      total_characters: content.length,
      total_words: content.split(/\s+/).length,
      sections: sections
    };
    
    // Salvar no Supabase
    const supabase = createComponentClient();
    
    await supabase.from('book_content').delete().neq('id', 0);
    
    // Inserir novo conteúdo
    console.log('📝 Inserindo novo conteúdo...');
    const { data, error } = await supabase
      .from('book_content')
      .insert([bookData])
      .select();
    
    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      return false;
    }
    
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao salvar conteúdo do livro:', error);
    return false;
  }
}

export async function loadBookContent(): Promise<BookContent | null> {
  // Retornar cache se disponível
  if (bookContentCache) {
    return bookContentCache;
  }

  try {
    // Primeiro, tentar carregar do arquivo local
    const livroPath = path.join(process.cwd(), 'data', 'livro-adventismo-cabo-verde.txt');
    
    if (fs.existsSync(livroPath)) {
      console.log('✅ Carregando conteúdo do arquivo local...');
      const content = fs.readFileSync(livroPath, 'utf-8');
      
      // Dividir em seções baseado na estrutura completa do livro
      const sections: Array<{title: string, content: string, keywords: string[]}> = [];
      
      // 1. FICHA TÉCNICA
      const fichaTecnicaMatch = content.match(/Ficha Técnica[\s\S]*?(?=Dedicatória|Capítulo|$)/i);
      if (fichaTecnicaMatch) {
        sections.push({
          title: "📋 FICHA TÉCNICA",
          content: fichaTecnicaMatch[0].trim(),
          keywords: extractKeywords(fichaTecnicaMatch[0])
        });
      }
      
      // 2. DEDICATÓRIA
      const dedicatoriaMatch = content.match(/Dedicatória[\s\S]*?(?=Agradecimentos|Capítulo|$)/i);
      if (dedicatoriaMatch) {
        sections.push({
          title: "💝 DEDICATÓRIA",
          content: dedicatoriaMatch[0].trim(),
          keywords: extractKeywords(dedicatoriaMatch[0])
        });
      }
      
      // 3. AGRADECIMENTOS
      const agradecimentosMatch = content.match(/Agradecimentos[\s\S]*?(?=Prefácio|Capítulo|$)/i);
      if (agradecimentosMatch) {
        sections.push({
          title: "🙏 AGRADECIMENTOS",
          content: agradecimentosMatch[0].trim(),
          keywords: extractKeywords(agradecimentosMatch[0])
        });
      }
      
      // 4. PREFÁCIO
      const prefacioMatch = content.match(/Prefácio[\s\S]*?(?=Nota|Capítulo|$)/i);
      if (prefacioMatch) {
        sections.push({
          title: "📖 PREFÁCIO",
          content: prefacioMatch[0].trim(),
          keywords: extractKeywords(prefacioMatch[0])
        });
      }
      
      // 5. NOTA
      const notaMatch = content.match(/Nota[\s\S]*?(?=Resumo|Capítulo|$)/i);
      if (notaMatch) {
        sections.push({
          title: "📝 NOTA",
          content: notaMatch[0].trim(),
          keywords: extractKeywords(notaMatch[0])
        });
      }
      
      // 6. RESUMO
      const resumoMatch = content.match(/Resumo[\s\S]*?(?=Abstract|Capítulo|$)/i);
      if (resumoMatch) {
        sections.push({
          title: "📋 RESUMO",
          content: resumoMatch[0].trim(),
          keywords: extractKeywords(resumoMatch[0])
        });
      }
      
      // 7. ABSTRACT
      const abstractMatch = content.match(/Abstract[\s\S]*?(?=Capítulo|$)/i);
      if (abstractMatch) {
        sections.push({
          title: "🌍 ABSTRACT",
          content: abstractMatch[0].trim(),
          keywords: extractKeywords(abstractMatch[0])
        });
      }
      
      // 8. CAPÍTULOS
      const chapterMatches = content.match(/CAPÍTULO\s+[IVX]+\s*[–-]\s*([^\n]+)/gi);
      if (chapterMatches) {
        chapterMatches.forEach((match, index) => {
          const title = match.trim();
          const startIndex = content.indexOf(match);
          const endIndex = index < chapterMatches.length - 1 
            ? content.indexOf(chapterMatches[index + 1]) 
            : content.length;
          
          const sectionContent = content.substring(startIndex, endIndex).trim();
          
          sections.push({
            title: title,
            content: sectionContent,
            keywords: extractKeywords(title + ' ' + sectionContent)
          });
        });
      }
      
      // 9. BIBLIOGRAFIA
      const bibliografiaMatch = content.match(/Bibliografia[\s\S]*?(?=Anexos|$)/i);
      if (bibliografiaMatch) {
        sections.push({
          title: "📚 BIBLIOGRAFIA",
          content: bibliografiaMatch[0].trim(),
          keywords: extractKeywords(bibliografiaMatch[0])
        });
      }
      
      // 10. ANEXOS
      const anexosMatch = content.match(/Anexos[\s\S]*?$/i);
      if (anexosMatch) {
        sections.push({
          title: "📎 ANEXOS",
          content: anexosMatch[0].trim(),
          keywords: extractKeywords(anexosMatch[0])
        });
      }
      
      // Se não encontrou seções estruturadas, dividir por parágrafos
      if (sections.length === 0) {
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 100);
        paragraphs.forEach((paragraph, index) => {
          if (paragraph.trim()) {
            const lines = paragraph.trim().split('\n');
            const title = lines[0]?.trim().substring(0, 100) || `Parágrafo ${index + 1}`;
            const content = paragraph.trim();
            
            sections.push({
              title: title,
              content: content,
              keywords: extractKeywords(title + ' ' + content)
            });
          }
        });
      }
      
      const bookContent = {
        id: 1,
        title: "O que dizer dos adventistas em Cabo Verde",
        author: "Karl Marx Morgan Lima Monteiro",
        extracted_at: new Date().toISOString(),
        full_content: content,
        original_content: content,
        total_characters: content.length,
        total_words: content.split(/\s+/).length,
        sections: sections
      };
      
      // Cache o resultado
      bookContentCache = bookContent;
      return bookContent;
    }
    
    // Se não encontrar o arquivo local, tentar do Supabase
    console.log('📚 Carregando conteúdo do Supabase...');
    const supabase = createComponentClient();
    
    const { data, error } = await supabase
      .from('book_content')
      .select('*')
      .single();
    
    if (error) {
      console.error('Erro ao carregar conteúdo do livro:', error);
      return null;
    }
    
    // Cache o resultado do Supabase
    bookContentCache = data;
    return data;
  } catch (error) {
    console.error('Erro ao carregar conteúdo do livro:', error);
    return null;
  }
}

// Função para extrair palavras-chave
function extractKeywords(text: string): string[] {
  const keywords = [
    'pioneiros', 'fundadores', 'missionários', 'igreja', 'congregação',
    'pastores', 'líderes', 'eventos', 'conferências', 'educação',
    'escolas', 'missão', 'evangelismo', 'crescimento', 'desenvolvimento',
    'doutrinas', 'ensino', 'organização', 'jovens', 'mulheres',
    'música', 'publicações', 'saúde', 'comunidade', 'denominações',
    'datas', 'locais', 'nomes', 'história', 'adventismo', 'cabo verde',
    'praia', 'mindelo', 'santiago', 'são vicente', 'fogo', 'brava',
    'santo antão', 'são nicolau', '1923', '1927', '1930', '1940',
    '1950', '1960', '1970', '1975', '1980', '1990', '2000', '2010', '2020',
    // Nomes reais mencionados no livro
    'antónio gomes', 'alberto raposo', 'joaquim morgado', 'ernesto ferreira',
    'manuel andrade', 'nhô mocho', 'nazaré raposo', 'milca raposo',
    'joão dias', 'olavo dos santos', 'alexandrino rodrigues', 'domingos sanches',
    'joão félix monteiro', 'marcos da rosa', 'crisolito abreu', 'guilherme vieira lima',
    'artur villares', 'joaquim tango', 'karl marx monteiro', 'irlando pereira de pina',
    // Datas importantes
    '1892', '1933', '1934', '1935', '1936', '1941', '1946', '1951', '2009', '2010', '2012',
    // Locais específicos
    'nossa senhora do monte', 'vila nova sintra', 'porto da furna', 'ferreiros',
    'califórnia', 'hawai', 'estados unidos', 'brasil', 'são paulo', 'são tomé e príncipe',
    // Informações específicas sobre a primeira igreja
    'primeira igreja', 'primeira congregação', 'primeiro templo', 'primeiro batismo',
    'nossa senhora do monte', 'vila nova sintra', 'porto da furna', 'ilha brava',
    'antónio j gomes', 'pastor alberto raposo', 'primeiro pastor', '1935', '1936',
    'primeira missão', 'primeira escola adventista', 'primeira associação'
  ];

  return keywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

export function searchBookContent(content: BookContent, query: string): string {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  const fullContent = content.full_content.toLowerCase();
  
  // Expandir termos de busca com sinônimos e variações
  const expandedTerms = expandSearchTerms(searchTerms);
  
  // Buscar nas seções primeiro (mais estruturado)
  const relevantSections = content.sections.filter(section => {
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    return expandedTerms.some(term => sectionText.includes(term));
  });
  
  if (relevantSections.length > 0) {
    // Ordenar por relevância (seções com mais termos encontrados primeiro)
    const scoredSections = relevantSections.map(section => {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      const score = expandedTerms.filter(term => sectionText.includes(term)).length;
      return { section, score };
    }).sort((a, b) => b.score - a.score);
    
    // Retornar as seções mais relevantes (máximo 5)
    const topSections = scoredSections.slice(0, 5);
    return topSections.map(({ section }) => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
  }
  
  // Buscar contexto específico no conteúdo completo
  const foundTerms = expandedTerms.filter(term => fullContent.includes(term));
  
  if (foundTerms.length > 0) {
    let relevantContent = '';
    const usedIndices = new Set<number>();
    
    // Buscar todas as ocorrências de cada termo
    foundTerms.forEach(term => {
      let searchIndex = 0;
      while (searchIndex < content.full_content.length) {
        const termIndex = content.full_content.toLowerCase().indexOf(term, searchIndex);
        if (termIndex === -1) break;
        
        // Evitar sobreposição de contextos
        if (!usedIndices.has(termIndex)) {
          const startIndex = Math.max(0, termIndex - 1500);
          const endIndex = Math.min(content.full_content.length, termIndex + 2000);
          const context = content.full_content.substring(startIndex, endIndex);
          
          // Verificar se o contexto é relevante (contém pelo menos 2 termos)
          const contextLower = context.toLowerCase();
          const termCount = expandedTerms.filter(t => contextLower.includes(t)).length;
          
          if (termCount >= 2) {
            relevantContent += context + '\n\n---\n\n';
            // Marcar índices usados para evitar duplicação
            for (let i = startIndex; i < endIndex; i++) {
              usedIndices.add(i);
            }
          }
        }
        
        searchIndex = termIndex + 1;
      }
    });
    
    if (relevantContent) {
      return relevantContent;
    }
  }
  
  // Busca mais ampla por palavras-chave relacionadas
  const relatedContent = searchRelatedContent(content, query);
  if (relatedContent) {
    return relatedContent;
  }
  
  // Se não encontrou nada específico, retornar o conteúdo completo
  return content.full_content;
}

// Função para expandir termos de busca com sinônimos e variações
function expandSearchTerms(terms: string[]): string[] {
  const expanded = new Set<string>();
  
  terms.forEach(term => {
    expanded.add(term);
    
    // Adicionar variações comuns
    if (term.includes('adventista')) {
      expanded.add('adventismo');
      expanded.add('iasd');
      expanded.add('sétimo dia');
    }
    
    if (term.includes('igreja')) {
      expanded.add('congregação');
      expanded.add('templo');
      expanded.add('edifício');
    }
    
    if (term.includes('pastor')) {
      expanded.add('ministro');
      expanded.add('pregador');
      expanded.add('missionário');
    }
    
    if (term.includes('escola')) {
      expanded.add('educação');
      expanded.add('ensino');
      expanded.add('alvará');
    }
    
    if (term.includes('batismo')) {
      expanded.add('batizados');
      expanded.add('batizar');
    }
    
    if (term.includes('brava')) {
      expanded.add('ilha brava');
      expanded.add('nossa senhora do monte');
    }
    
    if (term.includes('santiago')) {
      expanded.add('ilha de santiago');
      expanded.add('praia');
    }
    
    if (term.includes('são vicente')) {
      expanded.add('s.vicente');
      expanded.add('mindelo');
    }
    
    if (term.includes('são nicolau')) {
      expanded.add('s.nicolau');
    }
    
    if (term.includes('fogo')) {
      expanded.add('ilha do fogo');
      expanded.add('são filipe');
    }
  });
  
  return Array.from(expanded);
}

// Função para buscar conteúdo relacionado
function searchRelatedContent(content: BookContent, query: string): string {
  const queryLower = query.toLowerCase();
  const fullContent = content.full_content.toLowerCase();
  
  // Palavras-chave relacionadas ao adventismo
  const adventismKeywords = [
    'adventista', 'adventismo', 'iasd', 'sétimo dia', 'sábado', 'sabatismo',
    'ellen white', 'william miller', 'battle creek', 'mensagem', 'evangelho'
  ];
  
  // Palavras-chave relacionadas a Cabo Verde
  const caboVerdeKeywords = [
    'cabo verde', 'ilhas', 'arquipélago', 'brava', 'santiago', 'são vicente',
    'são nicolau', 'fogo', 'sal', 'santo antão', 'maio', 'boavista'
  ];
  
  // Palavras-chave relacionadas a história
  const historyKeywords = [
    'história', 'histórico', 'pioneiro', 'fundador', 'primeiro', 'início',
    'começo', 'desenvolvimento', 'crescimento', 'evolução'
  ];
  
  // Verificar se a pergunta é sobre adventismo em geral
  if (adventismKeywords.some(keyword => queryLower.includes(keyword))) {
    const relevantSections = content.sections.filter(section => {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      return adventismKeywords.some(keyword => sectionText.includes(keyword));
    });
    
    if (relevantSections.length > 0) {
      return relevantSections.map(section => 
        `## ${section.title}\n\n${section.content}`
      ).join('\n\n');
    }
  }
  
  // Verificar se a pergunta é sobre Cabo Verde
  if (caboVerdeKeywords.some(keyword => queryLower.includes(keyword))) {
    const relevantSections = content.sections.filter(section => {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      return caboVerdeKeywords.some(keyword => sectionText.includes(keyword));
    });
    
    if (relevantSections.length > 0) {
      return relevantSections.map(section => 
        `## ${section.title}\n\n${section.content}`
      ).join('\n\n');
    }
  }
  
  // Verificar se a pergunta é sobre história
  if (historyKeywords.some(keyword => queryLower.includes(keyword))) {
    const relevantSections = content.sections.filter(section => {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      return historyKeywords.some(keyword => sectionText.includes(keyword));
    });
    
    if (relevantSections.length > 0) {
      return relevantSections.map(section => 
        `## ${section.title}\n\n${section.content}`
      ).join('\n\n');
    }
  }
  
  return '';
}

export function getRelevantContent(content: BookContent, userMessage: string): string {
  const query = userMessage.toLowerCase();
  
  // Busca específica para primeiros missionários e fundadores
  if (query.includes('primeiros') && (query.includes('missionários') || query.includes('fundadores') || query.includes('pioneiros'))) {
    return searchForMissionaries(content);
  }
  
  // Busca específica para nomes de pessoas
  const names = [
    'antónio gomes', 'alberto raposo', 'américo rodrigues', 'antónio justo soares', 
    'joaquim morgado', 'ernesto ferreira', 'manuel andrade', 'nhô mocho',
    'joão esteves', 'gregório rosa', 'francisco cordas', 'joão mendonça',
    'isaías da silva', 'benjamin schofield', 'aníbal fraga', 'marino da rosa',
    'daniel gomes', 'ricardo orsucci', 'fernando ramos duarte', 'lourenço josé gomes',
    'venâncio teixeira', 'armindo miranda', 'artur de oliveira', 'orlando costa',
    'adelino diogo', 'jaime de almeida', 'manuel miguel', 'filipe esperancinha',
    'anselmo gorgulho de almeida', 'manuel laranjeira', 'joão félix monteiro',
    'irlando pereira de pina', 'olavo dos santos', 'héber mascarenhas',
    'gilberto araújo', 'osni fernandes', 'guilherme lima', 'antónio dos anjos'
  ];
  const foundNames = names.filter(name => query.includes(name));
  
  if (foundNames.length > 0) {
    return searchForSpecificPeople(content, foundNames);
  }
  
  // Busca específica para primeira igreja
  if (query.includes('primeira igreja') || query.includes('primeira congregação')) {
    return searchForFirstChurch(content);
  }
  
  // Busca específica para primeiros batismos
  if (query.includes('primeiros batismos') || query.includes('primeiro batismo')) {
    return searchForFirstBaptisms(content);
  }
  
  // Busca específica para primeira escola
  if (query.includes('primeira escola') || query.includes('primeira escola adventista')) {
    return searchForFirstSchool(content);
  }
  
  // Busca específica para expansão por ilhas
  if (query.includes('expansão') || query.includes('ilhas') || query.includes('arquipélago') || 
      query.includes('brava') || query.includes('santiago') || query.includes('são vicente') ||
      query.includes('são nicolau') || query.includes('fogo') || query.includes('sal') ||
      query.includes('santo antão') || query.includes('maio') || query.includes('boavista')) {
    return searchForIslandExpansion(content);
  }
  
  // Busca geral por termos específicos
  const relevantContent = searchBookContent(content, userMessage);
  if (relevantContent && relevantContent !== content.full_content) {
    return relevantContent;
  }
  
  // Busca abrangente para qualquer pergunta sobre o livro
  const comprehensiveContent = searchComprehensiveContent(content, userMessage);
  if (comprehensiveContent) {
    return comprehensiveContent;
  }
  
  // Se não encontrou nada específico, retornar o conteúdo completo
  const maxLength = 300000;
  if (content.full_content.length > maxLength) {
    return content.full_content.substring(0, maxLength) + '\n\n... (conteúdo continua)';
  }
  
  return content.full_content;
}

// Função específica para buscar informações sobre missionários
function searchForMissionaries(content: BookContent): string {
  const fullText = content.full_content.toLowerCase();
  let result = '';
  
  // PRIMEIROS PIONEIROS E FUNDADORES
  result += `# PRIMEIROS PIONEIROS E FUNDADORES DO ADVENTISMO EM CABO VERDE\n\n`;
  
  // António Gomes - O primeiro pioneiro
  if (fullText.includes('antónio gomes')) {
    const index = content.full_content.toLowerCase().indexOf('antónio gomes');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `## ANTÓNIO GOMES - O PRIMEIRO PIONEIRO\n\n${context}\n\n`;
  }
  
  // Alberto Raposo - Primeiro pastor enviado
  if (fullText.includes('alberto raposo')) {
    const index = content.full_content.toLowerCase().indexOf('alberto raposo');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `## ALBERTO RAPOSO - PRIMEIRO PASTOR ENVIADO\n\n${context}\n\n`;
  }
  
  // Américo Rodrigues - Primeiro colportor
  if (fullText.includes('américo rodrigues')) {
    const index = content.full_content.toLowerCase().indexOf('américo rodrigues');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `## AMÉRICO RODRIGUES - PRIMEIRO COLPORTOR\n\n${context}\n\n`;
  }
  
  // António Justo Soares - Pioneiro em S. Nicolau
  if (fullText.includes('antónio justo soares')) {
    const index = content.full_content.toLowerCase().indexOf('antónio justo soares');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `## ANTÓNIO JUSTO SOARES - PIONEIRO EM S. NICOLAU\n\n${context}\n\n`;
  }
  
  // Manuel Andrade (Nhô Mocho) - Dirigente provisório
  if (fullText.includes('manuel andrade') || fullText.includes('nhô mocho')) {
    const index = content.full_content.toLowerCase().indexOf('manuel andrade');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `## MANUEL ANDRADE (NHÔ MOCHO) - DIRIGENTE PROVISÓRIO\n\n${context}\n\n`;
  }
  
  // OUTROS PASTORES E MISSIONÁRIOS IMPORTANTES
  result += `# OUTROS PASTORES E MISSIONÁRIOS IMPORTANTES\n\n`;
  
  const otherMissionaries = [
    'joão esteves', 'gregório rosa', 'francisco cordas', 'joão mendonça',
    'isaías da silva', 'benjamin schofield', 'aníbal fraga', 'marino da rosa',
    'venâncio teixeira', 'joaquim morgado', 'ernesto ferreira'
  ];
  
  otherMissionaries.forEach(missionary => {
    if (fullText.includes(missionary)) {
      // Buscar múltiplas ocorrências para contexto completo
      const allOccurrences = [];
      let searchIndex = 0;
      
      while (searchIndex < content.full_content.length) {
        const foundIndex = content.full_content.toLowerCase().indexOf(missionary, searchIndex);
        if (foundIndex === -1) break;
        
        const startIndex = Math.max(0, foundIndex - 400);
        const endIndex = Math.min(content.full_content.length, foundIndex + 800);
        const context = content.full_content.substring(startIndex, endIndex);
        allOccurrences.push(context);
        
        searchIndex = foundIndex + 1;
      }
      
      // Combinar todas as ocorrências
      const combinedContext = allOccurrences.join('\n\n---\n\n');
      
      result += `## ${missionary.toUpperCase()}\n\n`;
      result += `### INFORMAÇÕES DETALHADAS\n\n${combinedContext}\n\n`;
      
      // Adicionar informações específicas sobre cada missionário
      if (missionary.includes('joão esteves')) {
        result += `### PAPEL HISTÓRICO\n\nJoão Esteves substituiu Alberto Raposo em 1941 e teve um papel crucial no desenvolvimento da obra, especialmente na Ilha do Fogo onde fixou a sede da Missão.\n\n`;
      } else if (missionary.includes('gregório rosa')) {
        result += `### PAPEL HISTÓRICO\n\nGregório Rosa foi um pastor cabo-verdiano natural da cidade da Praia, que teve um papel importante no desenvolvimento da obra em várias ilhas, incluindo Brava, Fogo e Santiago.\n\n`;
      } else if (missionary.includes('francisco cordas')) {
        result += `### PAPEL HISTÓRICO\n\nFrancisco Cordas foi Presidente da Missão Adventista em Cabo Verde e teve um papel crucial na organização e desenvolvimento da obra, especialmente na obtenção de alvarás para as escolas.\n\n`;
      } else if (missionary.includes('joão mendonça')) {
        result += `### PAPEL HISTÓRICO\n\nJoão Mendonça foi um pastor dedicado que atuou na Ilha Brava nos anos 50 e posteriormente, contribuindo significativamente para o crescimento da igreja e estabelecimento de escolas sabatinas.\n\n`;
      } else if (missionary.includes('isaías da silva')) {
        result += `### PAPEL HISTÓRICO\n\nIsaías da Silva foi um colportor que atuou na Ilha Brava em 1960, contribuindo para a expansão da mensagem através da literatura e venda de livros.\n\n`;
      } else if (missionary.includes('benjamin schofield')) {
        result += `### PAPEL HISTÓRICO\n\nBenjamin Schofield foi um estagiário que substituiu Isaías da Silva, contribuindo para a continuidade do trabalho missionário e realizando batismos.\n\n`;
      } else if (missionary.includes('aníbal fraga')) {
        result += `### PAPEL HISTÓRICO\n\nAníbal Fraga foi pastor na Ilha Brava entre 1968 e 1973, período importante para o desenvolvimento da igreja e continuidade da obra educacional.\n\n`;
      } else if (missionary.includes('marino da rosa')) {
        result += `### PAPEL HISTÓRICO\n\nMarino da Rosa foi um membro da Igreja do Nazareno que, ao estudar a Bíblia, chegou à conclusão de que o dia do Senhor é o Sábado e passou a guardá-lo, formando um pequeno grupo de crentes.\n\n`;
      } else if (missionary.includes('venâncio teixeira')) {
        result += `### PAPEL HISTÓRICO\n\nVenâncio Teixeira foi um pastor cabo-verdiano que ajudou no desenvolvimento da IASD na Ilha do Sal e posteriormente tornou-se Presidente da Associação das Igrejas Adventistas do Sétimo Dia em Cabo Verde.\n\n`;
      } else if (missionary.includes('joaquim morgado')) {
        result += `### PAPEL HISTÓRICO\n\nJoaquim Morgado foi um pastor e historiador que documentou a história do adventismo em Cabo Verde e teve um papel importante na preservação da memória histórica da igreja.\n\n`;
      } else if (missionary.includes('ernesto ferreira')) {
        result += `### PAPEL HISTÓRICO\n\nErnesto Ferreira foi Presidente da União Portuguesa dos Adventistas do Sétimo Dia e teve um papel importante no desenvolvimento da obra em Cabo Verde, incluindo visitas pastorais e apoio à obra missionária.\n\n`;
      }
      
      result += `---\n\n`;
    }
  });
  
  // Buscar seções específicas sobre missionários
  const missionarySections = content.sections.filter(section => {
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    return sectionText.includes('missionário') || 
           sectionText.includes('pioneiro') || 
           sectionText.includes('fundador') ||
           sectionText.includes('brava') ||
           sectionText.includes('santiago') ||
           sectionText.includes('são vicente') ||
           sectionText.includes('são nicolau');
  });
  
  if (missionarySections.length > 0) {
    result += `# SEÇÕES RELEVANTES DO LIVRO\n\n`;
    result += missionarySections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
  }
  
  return result || content.full_content;
}

// Função específica para buscar pessoas específicas
function searchForSpecificPeople(content: BookContent, names: string[]): string {
  let result = '';
  
  result += `# INFORMAÇÕES DETALHADAS SOBRE PIONEIROS E MISSIONÁRIOS\n\n`;
  
  names.forEach(name => {
    const index = content.full_content.toLowerCase().indexOf(name);
    if (index !== -1) {
      // Buscar múltiplas ocorrências do nome para ter contexto completo
      const allOccurrences = [];
      let searchIndex = 0;
      
      while (searchIndex < content.full_content.length) {
        const foundIndex = content.full_content.toLowerCase().indexOf(name, searchIndex);
        if (foundIndex === -1) break;
        
        const startIndex = Math.max(0, foundIndex - 800);
        const endIndex = Math.min(content.full_content.length, foundIndex + 1200);
        const context = content.full_content.substring(startIndex, endIndex);
        allOccurrences.push(context);
        
        searchIndex = foundIndex + 1;
      }
      
      // Combinar todas as ocorrências
      const combinedContext = allOccurrences.join('\n\n---\n\n');
      
      result += `## ${name.toUpperCase()}\n\n`;
      result += `### INFORMAÇÕES COMPLETAS\n\n${combinedContext}\n\n`;
      
      // Adicionar informações específicas baseadas no nome
      if (name.includes('antónio gomes')) {
        result += `### PAPEL HISTÓRICO\n\nAntónio Gomes foi o **primeiro pioneiro** do adventismo em Cabo Verde, emigrante da Ilha Brava que se converteu nos Estados Unidos e retornou em 1933 para lançar as sementes do evangelho.\n\n`;
      } else if (name.includes('alberto raposo')) {
        result += `### PAPEL HISTÓRICO\n\nAlberto Raposo foi o **primeiro pastor** enviado oficialmente a Cabo Verde, vindo de Portugal em 1935 para estabelecer a obra missionária.\n\n`;
      } else if (name.includes('américo rodrigues')) {
        result += `### PAPEL HISTÓRICO\n\nAmérico Rodrigues foi o **primeiro colportor** enviado a Cabo Verde, estabelecendo-se na Ilha de Santiago para iniciar o trabalho missionário.\n\n`;
      } else if (name.includes('antónio justo soares')) {
        result += `### PAPEL HISTÓRICO\n\nAntónio Justo Soares foi um **pioneiro em S. Nicolau**, convertido em 1934 nos Estados Unidos e retornado à sua terra natal para divulgar a mensagem.\n\n`;
      } else if (name.includes('manuel andrade') || name.includes('nhô mocho')) {
        result += `### PAPEL HISTÓRICO\n\nManuel Andrade (Nhô Mocho) foi o **dirigente provisório** da congregação após o retorno de António Gomes aos Estados Unidos e antes da chegada do Pastor Raposo.\n\n`;
      } else if (name.includes('joão esteves')) {
        result += `### PAPEL HISTÓRICO\n\nJoão Esteves foi um **pastor importante** que substituiu Alberto Raposo em 1941 e teve um papel significativo no desenvolvimento da obra.\n\n`;
      } else if (name.includes('gregório rosa')) {
        result += `### PAPEL HISTÓRICO\n\nGregório Rosa foi um **pastor cabo-verdiano** natural da cidade da Praia, que teve um papel importante no desenvolvimento da obra em várias ilhas.\n\n`;
      } else if (name.includes('francisco cordas')) {
        result += `### PAPEL HISTÓRICO\n\nFrancisco Cordas foi **Presidente da Missão Adventista** em Cabo Verde e teve um papel crucial na organização e desenvolvimento da obra.\n\n`;
      } else if (name.includes('joão mendonça')) {
        result += `### PAPEL HISTÓRICO\n\nJoão Mendonça foi um **pastor dedicado** que atuou na Ilha Brava nos anos 50 e posteriormente, contribuindo significativamente para o crescimento da igreja.\n\n`;
      } else if (name.includes('isaías da silva')) {
        result += `### PAPEL HISTÓRICO\n\nIsaías da Silva foi um **colportor** que atuou na Ilha Brava em 1960, contribuindo para a expansão da mensagem através da literatura.\n\n`;
      } else if (name.includes('benjamin schofield')) {
        result += `### PAPEL HISTÓRICO\n\nBenjamin Schofield foi um **estagiário** que substituiu Isaías da Silva, contribuindo para a continuidade do trabalho missionário.\n\n`;
      } else if (name.includes('aníbal fraga')) {
        result += `### PAPEL HISTÓRICO\n\nAníbal Fraga foi **pastor na Ilha Brava** entre 1968 e 1973, período importante para o desenvolvimento da igreja.\n\n`;
      } else if (name.includes('marino da rosa')) {
        result += `### PAPEL HISTÓRICO\n\nMarino da Rosa foi um **membro da Igreja do Nazareno** que, ao estudar a Bíblia, chegou à conclusão de que o dia do Senhor é o Sábado e passou a guardá-lo.\n\n`;
      } else if (name.includes('venâncio teixeira')) {
        result += `### PAPEL HISTÓRICO\n\nVenâncio Teixeira foi um **pastor cabo-verdiano** que ajudou no desenvolvimento da IASD na Ilha do Sal e posteriormente tornou-se Presidente da Associação.\n\n`;
      } else if (name.includes('joaquim morgado')) {
        result += `### PAPEL HISTÓRICO\n\nJoaquim Morgado foi um **pastor e historiador** que documentou a história do adventismo em Cabo Verde e teve um papel importante na preservação da memória histórica.\n\n`;
      } else if (name.includes('ernesto ferreira')) {
        result += `### PAPEL HISTÓRICO\n\nErnesto Ferreira foi **Presidente da União Portuguesa** dos Adventistas do Sétimo Dia e teve um papel importante no desenvolvimento da obra em Cabo Verde.\n\n`;
      }
      
      result += `---\n\n`;
    }
  });
  
  return result || content.full_content;
}

// Função específica para buscar primeira igreja
function searchForFirstChurch(content: BookContent): string {
  const fullText = content.full_content.toLowerCase();
  let result = '';
  
  result += `# A PRIMEIRA IGREJA ADVENTISTA EM CABO VERDE\n\n`;
  
  // Informações sobre a localização e construção
  result += `## LOCALIZAÇÃO E CONSTRUÇÃO\n\n`;
  result += `A primeira igreja adventista em Cabo Verde foi construída na **Ilha Brava**, especificamente na zona de **Nossa Senhora do Monte**.\n\n`;
  
  // Buscar informações sobre António Gomes e a construção
  if (fullText.includes('antónio gomes') && fullText.includes('edifício próprio')) {
    const index = content.full_content.toLowerCase().indexOf('edifício próprio');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### FINANCIAMENTO E CONSTRUÇÃO\n\n${context}\n\n`;
  }
  
  // Informações sobre os primeiros batismos
  result += `## PRIMEIROS BATISMOS E ORGANIZAÇÃO\n\n`;
  if (fullText.includes('primeiros batismos') && fullText.includes('1936')) {
    const index = content.full_content.toLowerCase().indexOf('primeiros batismos');
    const startIndex = Math.max(0, index - 300);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `${context}\n\n`;
  }
  
  // Informações sobre os primeiros batizados
  if (fullText.includes('ferreiros') && fullText.includes('tanque')) {
    const index = content.full_content.toLowerCase().indexOf('ferreiros');
    const startIndex = Math.max(0, index - 200);
    const endIndex = Math.min(content.full_content.length, index + 800);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### LOCAL DOS PRIMEIROS BATISMOS\n\n${context}\n\n`;
  }
  
  // Informações sobre a expansão
  result += `## EXPANSÃO E OUTROS LOCAIS\n\n`;
  if (fullText.includes('vila nova sintra') && fullText.includes('furna')) {
    const index = content.full_content.toLowerCase().indexOf('vila nova sintra');
    const startIndex = Math.max(0, index - 300);
    const endIndex = Math.min(content.full_content.length, index + 1000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `${context}\n\n`;
  }
  
  // Informações sobre a qualidade do edifício
  result += `## QUALIDADE E IMPORTÂNCIA DO EDIFÍCIO\n\n`;
  if (fullText.includes('melhor edifício da ilha')) {
    const index = content.full_content.toLowerCase().indexOf('melhor edifício da ilha');
    const startIndex = Math.max(0, index - 300);
    const endIndex = Math.min(content.full_content.length, index + 800);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `${context}\n\n`;
  }
  
  // Buscar seções específicas sobre a primeira igreja
  const churchSections = content.sections.filter(section => {
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    return sectionText.includes('primeira igreja') || 
           sectionText.includes('primeira congregação') ||
           sectionText.includes('brava') ||
           sectionText.includes('nossa senhora do monte') ||
           sectionText.includes('antónio gomes') ||
           sectionText.includes('primeiros batismos');
  });
  
  if (churchSections.length > 0) {
    result += `# SEÇÕES RELEVANTES DO LIVRO\n\n`;
    result += churchSections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
  }
  
  return result || content.full_content;
}

// Função específica para buscar primeiros batismos
function searchForFirstBaptisms(content: BookContent): string {
  const fullText = content.full_content.toLowerCase();
  let result = '';
  
  result += `# OS PRIMEIROS BATISMOS ADVENTISTAS EM CABO VERDE\n\n`;
  
  // Informações sobre a data dos primeiros batismos
  result += `## DATA E LOCAL DOS PRIMEIROS BATISMOS\n\n`;
  result += `Os primeiros batismos adventistas em Cabo Verde foram realizados em **março de 1936**.\n\n`;
  
  // Buscar informações específicas sobre os primeiros batizados
  if (fullText.includes('ferreiros') && fullText.includes('tanque')) {
    const index = content.full_content.toLowerCase().indexOf('ferreiros');
    const startIndex = Math.max(0, index - 200);
    const endIndex = Math.min(content.full_content.length, index + 1000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### LOCAL DOS BATISMOS\n\n${context}\n\n`;
  }
  
  // Buscar informações sobre os nomes dos primeiros batizados
  if (fullText.includes('andré de burgo') || fullText.includes('alfredo monteiro')) {
    const index = content.full_content.toLowerCase().indexOf('andré de burgo');
    const startIndex = Math.max(0, index - 100);
    const endIndex = Math.min(content.full_content.length, index + 800);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### PRIMEIROS BATIZADOS\n\n${context}\n\n`;
  }
  
  // Buscar informações sobre a organização da igreja
  if (fullText.includes('organizar uma igreja')) {
    const index = content.full_content.toLowerCase().indexOf('organizar uma igreja');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### ORGANIZAÇÃO DA IGREJA\n\n${context}\n\n`;
  }
  
  // Buscar seções relevantes
  const baptismSections = content.sections.filter(section => {
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    return sectionText.includes('batismo') || 
           sectionText.includes('batizados') ||
           sectionText.includes('1936') ||
           sectionText.includes('ferreiros') ||
           sectionText.includes('organizar');
  });
  
  if (baptismSections.length > 0) {
    result += `# SEÇÕES RELEVANTES DO LIVRO\n\n`;
    result += baptismSections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
  }
  
  return result || content.full_content;
}

// Função específica para buscar primeira escola
function searchForFirstSchool(content: BookContent): string {
  const fullText = content.full_content.toLowerCase();
  let result = '';
  
  result += `# A PRIMEIRA ESCOLA ADVENTISTA EM CABO VERDE\n\n`;
  
  // Informações sobre a primeira escola
  result += `## PRIMEIRA ESCOLA ADVENTISTA - ILHA BRAVA\n\n`;
  result += `A primeira escola adventista em Cabo Verde foi estabelecida na **Ilha Brava** e começou a funcionar em **1944**.\n\n`;
  
  // Buscar informações sobre o funcionamento da escola
  if (fullText.includes('1944') && fullText.includes('escola adventista')) {
    const index = content.full_content.toLowerCase().indexOf('1944');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### INÍCIO DO FUNCIONAMENTO\n\n${context}\n\n`;
  }
  
  // Informações sobre o alvará
  result += `## ALVARÁ E AUTORIZAÇÃO\n\n`;
  result += `A escola começou a funcionar em 1944, mas o **alvará foi conseguido posteriormente** pelo Pastor Francisco Cordas, que conseguiu os alvarás para as escolas que se abriram em algumas ilhas.\n\n`;
  
  // Buscar informações sobre Francisco Cordas e os alvarás
  if (fullText.includes('francisco cordas') && fullText.includes('alvará')) {
    const index = content.full_content.toLowerCase().indexOf('alvará');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### PROCESSO DE AUTORIZAÇÃO\n\n${context}\n\n`;
  }
  
  // Informações sobre a importância da educação
  result += `## IMPORTÂNCIA DA EDUCAÇÃO ADVENTISTA\n\n`;
  result += `A educação adventista em Cabo Verde acompanhou de perto a penetração da mensagem do Advento nas ilhas. O Pastor Francisco Cordas defendia que a **principal atividade da Missão de Cabo Verde**, aliada à pregação do Evangelho, era o ramo da Educação.\n\n`;
  
  // Buscar informações sobre a filosofia educacional
  if (fullText.includes('educação') && fullText.includes('pregação')) {
    const index = content.full_content.toLowerCase().indexOf('educação');
    const startIndex = Math.max(0, index - 300);
    const endIndex = Math.min(content.full_content.length, index + 800);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### FILOSOFIA EDUCACIONAL\n\n${context}\n\n`;
  }
  
  // Informações sobre outras escolas
  result += `## EXPANSÃO DAS ESCOLAS ADVENTISTAS\n\n`;
  result += `Após a primeira escola na Brava (1944), outras escolas adventistas foram estabelecidas:\n\n`;
  result += `- **Praia**: Escola a funcionar desde o ano letivo 1950/51, alvará conseguido em 1954\n`;
  result += `- **São Vicente**: Alvará conseguido em 1954\n`;
  result += `- **Fogo**: Escola estabelecida com alvará conseguido\n\n`;
  
  // Buscar informações sobre as outras escolas
  if (fullText.includes('praia') && fullText.includes('1950')) {
    const index = content.full_content.toLowerCase().indexOf('1950');
    const startIndex = Math.max(0, index - 300);
    const endIndex = Math.min(content.full_content.length, index + 800);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### ESCOLAS EM OUTRAS ILHAS\n\n${context}\n\n`;
  }
  
  // Informações sobre a continuidade
  result += `## CONTINUIDADE E DESENVOLVIMENTO\n\n`;
  result += `A escola adventista da Brava continuou a funcionar ao longo dos anos, mesmo durante períodos difíceis como a fome que assolou a ilha. Nos anos 70, a escola ainda funcionava, demonstrando a importância e o sucesso da obra educacional adventista.\n\n`;
  
  // Buscar seções relevantes
  const schoolSections = content.sections.filter(section => {
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    return sectionText.includes('escola') || 
           sectionText.includes('educação') ||
           sectionText.includes('1944') ||
           sectionText.includes('alvará') ||
           sectionText.includes('francisco cordas');
  });
  
  if (schoolSections.length > 0) {
    result += `# SEÇÕES RELEVANTES DO LIVRO\n\n`;
    result += schoolSections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
  }
  
  return result || content.full_content;
}

// Função específica para buscar informações sobre expansão por ilhas
function searchForIslandExpansion(content: BookContent): string {
  const fullText = content.full_content.toLowerCase();
  let result = '';
  
  result += `# EXPANSÃO DO ADVENTISMO EM CABO VERDE - ILHA POR ILHA\n\n`;
  
  // ILHA BRAVA - BERÇO DO ADVENTISMO
  result += `## ILHA BRAVA - O BERÇO DO ADVENTISMO\n\n`;
  result += `A Ilha Brava foi o **berço do adventismo em Cabo Verde**. Foi aqui que António Gomes, emigrante natural da Ilha Brava, retornou em 1933 trazendo as sementes do adventismo dos Estados Unidos.\n\n`;
  
  if (fullText.includes('brava') && fullText.includes('antónio gomes')) {
    const index = content.full_content.toLowerCase().indexOf('brava');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 2000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO NA BRAVA\n\n${context}\n\n`;
  }
  
  // ILHA DO FOGO
  result += `## ILHA DO FOGO\n\n`;
  result += `O adventismo chegou à Ilha do Fogo ainda no tempo do pastor Alberto Raposo. O trabalho começou de forma metódica em 1944, quando o irmão João Esteves se estabeleceu em São Filipe.\n\n`;
  
  if (fullText.includes('fogo') && fullText.includes('joão esteves')) {
    const index = content.full_content.toLowerCase().indexOf('fogo');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 2000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO NO FOGO\n\n${context}\n\n`;
  }
  
  // ILHA DE SANTIAGO
  result += `## ILHA DE SANTIAGO\n\n`;
  result += `A Ilha de Santiago foi a terceira a ter uma igreja organizada. Em 1935 chegou o primeiro obreiro, o irmão Américo Rodrigues, que se estabeleceu na cidade da Praia.\n\n`;
  
  if (fullText.includes('santiago') && fullText.includes('américo rodrigues')) {
    const index = content.full_content.toLowerCase().indexOf('santiago');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 2000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO EM SANTIAGO\n\n${context}\n\n`;
  }
  
  // ILHA DE SÃO VICENTE
  result += `## ILHA DE SÃO VICENTE\n\n`;
  result += `A Ilha de São Vicente teve um desenvolvimento importante do adventismo, especialmente com a transferência da sede da Missão para o Mindelo em 1952.\n\n`;
  
  if (fullText.includes('são vicente') || fullText.includes('s.vicente')) {
    const index = content.full_content.toLowerCase().indexOf('são vicente');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 2000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO EM SÃO VICENTE\n\n${context}\n\n`;
  }
  
  // ILHA DE SÃO NICOLAU
  result += `## ILHA DE SÃO NICOLAU\n\n`;
  result += `A Ilha de São Nicolau teve como pioneiro António Justo Soares, que se converteu ao adventismo em 1934 nos Estados Unidos e retornou à sua terra natal para divulgar a mensagem.\n\n`;
  
  if (fullText.includes('são nicolau') || fullText.includes('s.nicolau')) {
    const index = content.full_content.toLowerCase().indexOf('são nicolau');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 2000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO EM SÃO NICOLAU\n\n${context}\n\n`;
  }
  
  // ILHA DO SAL
  result += `## ILHA DO SAL\n\n`;
  result += `A Ilha do Sal teve um desenvolvimento mais tardio do adventismo. Até finais dos anos 80, não havia Igreja organizada na Ilha do Sal.\n\n`;
  
  if (fullText.includes('sal') && fullText.includes('venâncio teixeira')) {
    const index = content.full_content.toLowerCase().indexOf('sal');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 2000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO NO SAL\n\n${context}\n\n`;
  }
  
  // ILHA DE SANTO ANTÃO
  result += `## ILHA DE SANTO ANTÃO\n\n`;
  result += `A Ilha de Santo Antão teve os primeiros batismos realizados pelo pastor italiano Ricardo Orsucci, que foi enviado para as ilhas em 1974.\n\n`;
  
  if (fullText.includes('santo antão') && fullText.includes('ricardo orsucci')) {
    const index = content.full_content.toLowerCase().indexOf('santo antão');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 2000);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO EM SANTO ANTÃO\n\n${context}\n\n`;
  }
  
  // ILHA DE MAIO
  result += `## ILHA DE MAIO\n\n`;
  result += `A Ilha de Maio teve um desenvolvimento mais recente do adventismo, com a formação de grupos de crentes ao longo do tempo.\n\n`;
  
  if (fullText.includes('maio')) {
    const index = content.full_content.toLowerCase().indexOf('maio');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO EM MAIO\n\n${context}\n\n`;
  }
  
  // ILHA DE BOA VISTA
  result += `## ILHA DE BOA VISTA\n\n`;
  result += `A Ilha de Boa Vista teve um desenvolvimento mais tardio do adventismo, com a formação de grupos de crentes em períodos mais recentes.\n\n`;
  
  if (fullText.includes('boa vista') || fullText.includes('boavista')) {
    const index = content.full_content.toLowerCase().indexOf('boa vista');
    const startIndex = Math.max(0, index - 500);
    const endIndex = Math.min(content.full_content.length, index + 1500);
    const context = content.full_content.substring(startIndex, endIndex);
    result += `### DESENVOLVIMENTO EM BOA VISTA\n\n${context}\n\n`;
  }
  
  // RESUMO DA EXPANSÃO
  result += `# RESUMO DA EXPANSÃO\n\n`;
  result += `A expansão do adventismo em Cabo Verde seguiu uma progressão natural:\n\n`;
  result += `1. **1933 - Ilha Brava**: António Gomes retorna e inicia a obra\n`;
  result += `2. **1935 - Ilha de Santiago**: Américo Rodrigues estabelece-se na Praia\n`;
  result += `3. **1941-1944 - Ilha do Fogo**: João Esteves desenvolve a obra\n`;
  result += `4. **1952 - Ilha de São Vicente**: Transferência da sede da Missão\n`;
  result += `5. **Décadas seguintes**: Expansão para as demais ilhas\n\n`;
  
  result += `O livro confirma que a mensagem adventista está presente em **todas as nove ilhas habitadas** do arquipélago, demonstrando o sucesso da expansão iniciada na Brava.\n\n`;
  
  // Buscar seções relevantes sobre expansão
  const expansionSections = content.sections.filter(section => {
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    return sectionText.includes('expansão') || 
           sectionText.includes('ilhas') ||
           sectionText.includes('arquipélago') ||
           sectionText.includes('brava') ||
           sectionText.includes('santiago') ||
           sectionText.includes('são vicente') ||
           sectionText.includes('são nicolau') ||
           sectionText.includes('fogo') ||
           sectionText.includes('sal') ||
           sectionText.includes('santo antão') ||
           sectionText.includes('maio') ||
           sectionText.includes('boa vista');
  });
  
  if (expansionSections.length > 0) {
    result += `# SEÇÕES RELEVANTES DO LIVRO\n\n`;
    result += expansionSections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
  }
  
  return result || content.full_content;
}

// Função abrangente para buscar qualquer conteúdo sobre o livro
function searchComprehensiveContent(content: BookContent, query: string): string {
  const queryLower = query.toLowerCase();
  const fullText = content.full_content.toLowerCase();
  let result = '';
  
  // Analisar o tipo de pergunta
  const questionType = analyzeQuestionType(query);
  
  result += `# INFORMAÇÕES SOBRE O LIVRO "O QUE DIZER DOS ADVENTISTAS EM CABO VERDE"\n\n`;
  result += `Baseado na pergunta sobre "${query}", aqui estão as informações relevantes encontradas no livro:\n\n`;
  
  // Buscar por palavras-chave principais
  const mainKeywords = extractMainKeywords(query);
  const foundKeywords = mainKeywords.filter(keyword => fullText.includes(keyword));
  
  if (foundKeywords.length > 0) {
    result += `## INFORMAÇÕES ENCONTRADAS\n\n`;
    
    foundKeywords.forEach(keyword => {
      // Buscar todas as ocorrências da palavra-chave
      let searchIndex = 0;
      const keywordContexts = [];
      
      while (searchIndex < content.full_content.length) {
        const keywordIndex = content.full_content.toLowerCase().indexOf(keyword, searchIndex);
        if (keywordIndex === -1) break;
        
        const startIndex = Math.max(0, keywordIndex - 1000);
        const endIndex = Math.min(content.full_content.length, keywordIndex + 1500);
        const context = content.full_content.substring(startIndex, endIndex);
        
        // Verificar se o contexto é relevante
        if (context.length > 200) {
          keywordContexts.push(context);
        }
        
        searchIndex = keywordIndex + 1;
      }
      
      if (keywordContexts.length > 0) {
        result += `### ${keyword.toUpperCase()}\n\n`;
        // Pegar os 3 contextos mais relevantes
        const topContexts = keywordContexts.slice(0, 3);
        result += topContexts.join('\n\n---\n\n') + '\n\n';
      }
    });
  }
  
  // Buscar seções relevantes baseadas no tipo de pergunta
  const relevantSections = findRelevantSections(content, questionType);
  if (relevantSections.length > 0) {
    result += `## SEÇÕES RELEVANTES DO LIVRO\n\n`;
    result += relevantSections.map(section => 
      `### ${section.title}\n\n${section.content}`
    ).join('\n\n---\n\n');
  }
  
  // Adicionar contexto histórico geral se a pergunta for sobre história
  if (questionType.includes('história') || questionType.includes('histórico')) {
    result += `\n\n## CONTEXTO HISTÓRICO GERAL\n\n`;
    result += `O livro "O que dizer dos adventistas em Cabo Verde" de Karl Marx Morgan Lima Monteiro documenta a história completa do adventismo no arquipélago, desde os primeiros missionários até o desenvolvimento atual da igreja em todas as ilhas.\n\n`;
  }
  
  // Adicionar informações sobre o autor e o livro
  result += `\n\n## SOBRE O LIVRO\n\n`;
  result += `**Título**: O que dizer dos adventistas em Cabo Verde\n`;
  result += `**Autor**: Karl Marx Morgan Lima Monteiro\n`;
  result += `**Edição**: 1ª Edição, Dezembro 2012, 500 exemplares\n`;
  result += `**Conteúdo**: Este livro é uma obra acadêmica que documenta de forma detalhada a história, desenvolvimento e características atuais da Igreja Adventista do Sétimo Dia em Cabo Verde.\n\n`;
  
  return result;
}

// Função para analisar o tipo de pergunta
function analyzeQuestionType(query: string): string[] {
  const queryLower = query.toLowerCase();
  const types = [];
  
  if (queryLower.includes('quem') || queryLower.includes('pioneiro') || queryLower.includes('missionário') || queryLower.includes('pastor')) {
    types.push('pessoas');
  }
  
  if (queryLower.includes('quando') || queryLower.includes('data') || queryLower.includes('ano') || queryLower.includes('época')) {
    types.push('cronologia');
  }
  
  if (queryLower.includes('onde') || queryLower.includes('local') || queryLower.includes('ilha') || queryLower.includes('lugar')) {
    types.push('geografia');
  }
  
  if (queryLower.includes('como') || queryLower.includes('processo') || queryLower.includes('desenvolvimento') || queryLower.includes('evolução')) {
    types.push('processo');
  }
  
  if (queryLower.includes('por que') || queryLower.includes('motivo') || queryLower.includes('razão') || queryLower.includes('causa')) {
    types.push('causas');
  }
  
  if (queryLower.includes('história') || queryLower.includes('histórico') || queryLower.includes('passado') || queryLower.includes('origem')) {
    types.push('história');
  }
  
  if (queryLower.includes('igreja') || queryLower.includes('templo') || queryLower.includes('edifício') || queryLower.includes('construção')) {
    types.push('instituições');
  }
  
  if (queryLower.includes('escola') || queryLower.includes('educação') || queryLower.includes('ensino') || queryLower.includes('alvará')) {
    types.push('educação');
  }
  
  if (queryLower.includes('batismo') || queryLower.includes('batizado') || queryLower.includes('conversão') || queryLower.includes('membro')) {
    types.push('religião');
  }
  
  return types;
}

// Função para extrair palavras-chave principais
function extractMainKeywords(query: string): string[] {
  const queryLower = query.toLowerCase();
  const keywords: string[] = [];
  
  // Palavras-chave relacionadas ao adventismo
  const adventismTerms = ['adventista', 'adventismo', 'iasd', 'sétimo dia', 'sábado', 'sabatismo', 'mensagem', 'evangelho'];
  adventismTerms.forEach(term => {
    if (queryLower.includes(term)) keywords.push(term);
  });
  
  // Palavras-chave relacionadas a Cabo Verde
  const caboVerdeTerms = ['cabo verde', 'ilhas', 'arquipélago', 'brava', 'santiago', 'são vicente', 'são nicolau', 'fogo', 'sal', 'santo antão', 'maio', 'boa vista'];
  caboVerdeTerms.forEach(term => {
    if (queryLower.includes(term)) keywords.push(term);
  });
  
  // Palavras-chave relacionadas a pessoas
  const peopleTerms = ['antónio gomes', 'alberto raposo', 'américo rodrigues', 'antónio justo soares', 'joão esteves', 'gregório rosa', 'francisco cordas', 'joão mendonça'];
  peopleTerms.forEach(term => {
    if (queryLower.includes(term)) keywords.push(term);
  });
  
  // Palavras-chave relacionadas a instituições
  const institutionTerms = ['igreja', 'templo', 'escola', 'educação', 'missão', 'associação', 'congregação'];
  institutionTerms.forEach(term => {
    if (queryLower.includes(term)) keywords.push(term);
  });
  
  // Palavras-chave relacionadas a eventos
  const eventTerms = ['batismo', 'batizados', 'primeira igreja', 'primeira escola', 'primeiros missionários', 'expansão', 'desenvolvimento'];
  eventTerms.forEach(term => {
    if (queryLower.includes(term)) keywords.push(term);
  });
  
  return keywords;
}

// Função para encontrar seções relevantes baseadas no tipo de pergunta
function findRelevantSections(content: BookContent, questionTypes: string[]): Array<{title: string, content: string}> {
  const relevantSections: Array<{title: string, content: string}> = [];
  
  questionTypes.forEach(type => {
    switch (type) {
      case 'pessoas':
        relevantSections.push(...content.sections.filter(section => {
          const sectionText = (section.title + ' ' + section.content).toLowerCase();
          return sectionText.includes('pioneiro') || sectionText.includes('missionário') || sectionText.includes('pastor') || sectionText.includes('antónio gomes');
        }));
        break;
        
      case 'cronologia':
        relevantSections.push(...content.sections.filter(section => {
          const sectionText = (section.title + ' ' + section.content).toLowerCase();
          return sectionText.includes('1933') || sectionText.includes('1935') || sectionText.includes('1944') || sectionText.includes('1952');
        }));
        break;
        
      case 'geografia':
        relevantSections.push(...content.sections.filter(section => {
          const sectionText = (section.title + ' ' + section.content).toLowerCase();
          return sectionText.includes('ilha') || sectionText.includes('brava') || sectionText.includes('santiago') || sectionText.includes('são vicente');
        }));
        break;
        
      case 'instituições':
        relevantSections.push(...content.sections.filter(section => {
          const sectionText = (section.title + ' ' + section.content).toLowerCase();
          return sectionText.includes('igreja') || sectionText.includes('templo') || sectionText.includes('escola') || sectionText.includes('missão');
        }));
        break;
        
      case 'educação':
        relevantSections.push(...content.sections.filter(section => {
          const sectionText = (section.title + ' ' + section.content).toLowerCase();
          return sectionText.includes('escola') || sectionText.includes('educação') || sectionText.includes('alvará') || sectionText.includes('ensino');
        }));
        break;
        
      case 'religião':
        relevantSections.push(...content.sections.filter(section => {
          const sectionText = (section.title + ' ' + section.content).toLowerCase();
          return sectionText.includes('batismo') || sectionText.includes('batizados') || sectionText.includes('conversão') || sectionText.includes('membro');
        }));
        break;
        
      default:
        // Para qualquer tipo, buscar seções que contenham termos gerais
        relevantSections.push(...content.sections.filter(section => {
          const sectionText = (section.title + ' ' + section.content).toLowerCase();
          return sectionText.includes('adventista') || sectionText.includes('cabo verde') || sectionText.includes('história');
        }));
    }
  });
  
  // Remover duplicatas
  const uniqueSections = relevantSections.filter((section, index, self) => 
    index === self.findIndex(s => s.title === section.title)
  );
  
  return uniqueSections.slice(0, 5); // Máximo 5 seções
}
