/* eslint-disable @typescript-eslint/no-unused-vars */
import { createComponentClient } from "@/models/supabase";
import fs from 'fs';
import path from 'path';

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
      title: "História do Adventismo em Cabo Verde",
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
      
      return {
        id: 1,
        title: "História do Adventismo em Cabo Verde",
        author: "Karl Marx Morgan Lima Monteiro",
        extracted_at: new Date().toISOString(),
        full_content: content,
        original_content: content,
        total_characters: content.length,
        total_words: content.split(/\s+/).length,
        sections: sections
      };
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
  const searchTerms = query.toLowerCase().split(' ');
  
  // Buscar nas seções primeiro (mais estruturado)
  const relevantSections = content.sections.filter(section => {
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    return searchTerms.some(term => sectionText.includes(term));
  });
  
  if (relevantSections.length > 0) {
    // Ordenar por relevância (seções com mais termos encontrados primeiro)
    const scoredSections = relevantSections.map(section => {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      const score = searchTerms.filter(term => sectionText.includes(term)).length;
      return { section, score };
    }).sort((a, b) => b.score - a.score);
    
    // Retornar as seções mais relevantes
    return scoredSections.map(({ section }) => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');
  }
  
  // Se não encontrou nas seções, buscar no conteúdo completo
  const fullContent = content.full_content.toLowerCase();
  const hasRelevantContent = searchTerms.some(term => fullContent.includes(term));
  
  if (hasRelevantContent) {
    // Buscar contexto específico ao redor dos termos encontrados
    let relevantContent = '';
    const foundTerms = searchTerms.filter(term => fullContent.includes(term));
    
    foundTerms.forEach(term => {
      if (fullContent.includes(term)) {
        const termIndex = content.full_content.toLowerCase().indexOf(term);
        const startIndex = Math.max(0, termIndex - 2000);
        const endIndex = Math.min(content.full_content.length, termIndex + 3000);
        const context = content.full_content.substring(startIndex, endIndex);
        relevantContent += context + '\n\n';
      }
    });
    
    if (relevantContent) {
      return relevantContent;
    }
  }
  
  // Se não encontrou nada específico, retornar o conteúdo completo
  return content.full_content;
}

export function getRelevantContent(content: BookContent, userMessage: string): string {
  // Buscar conteúdo relevante baseado na pergunta do usuário
  const relevantContent = searchBookContent(content, userMessage);
  
  // Se o conteúdo relevante for muito longo, pegar apenas uma parte
  if (relevantContent.length > 15000) {
    return relevantContent.substring(0, 15000) + '\n\n... (conteúdo continua)';
  }
  
  // Se o conteúdo relevante for muito curto, incluir mais contexto
  if (relevantContent.length < 3000) {
    // Incluir seções relacionadas para dar mais contexto
    const searchTerms = userMessage.toLowerCase().split(' ');
    const additionalSections = content.sections.filter(section => {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      return searchTerms.some(term => sectionText.includes(term));
    });
    
    if (additionalSections.length > 0) {
      // Ordenar por relevância
      const scoredSections = additionalSections.map(section => {
        const sectionText = (section.title + ' ' + section.content).toLowerCase();
        const score = searchTerms.filter(term => sectionText.includes(term)).length;
        return { section, score };
      }).sort((a, b) => b.score - a.score);
      
      // Pegar as seções mais relevantes
      const topSections = scoredSections.slice(0, 3);
      const additionalContent = topSections.map(({ section }) => 
        `## ${section.title}\n\n${section.content}`
      ).join('\n\n');
      
      return relevantContent + '\n\n' + additionalContent;
    }
  }
  
  return relevantContent;
}
