import { NextResponse } from 'next/server';
import { createApiClient } from '@/models/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('=== INICIANDO EXTRAÇÃO DO CONTEÚDO REAL ===');
    
    // Ler o conteúdo real do livro do arquivo
    const livroPath = path.join(process.cwd(), 'data', 'livro-adventismo-cabo-verde.txt');
    
    if (!fs.existsSync(livroPath)) {
      console.log('❌ Arquivo do livro não encontrado!');
      throw new Error('Arquivo do livro não encontrado. Verifique se o arquivo data/livro-adventismo-cabo-verde.txt existe.');
    }
    
    console.log('✅ Arquivo do livro encontrado!');
    const realContent = fs.readFileSync(livroPath, 'utf-8');
    
    console.log(`✅ Conteúdo REAL extraído com sucesso!`);
    console.log(`- Tamanho do texto: ${realContent.length} caracteres`);
    
    // Dividir em seções baseado na estrutura completa do livro
    const sections: Array<{title: string, content: string, keywords: string[]}> = [];
    
    // 1. FICHA TÉCNICA
    const fichaTecnicaMatch = realContent.match(/Ficha Técnica[\s\S]*?(?=Dedicatória|Capítulo|$)/i);
    if (fichaTecnicaMatch) {
      sections.push({
        title: "📋 FICHA TÉCNICA",
        content: fichaTecnicaMatch[0].trim(),
        keywords: extractKeywords(fichaTecnicaMatch[0])
      });
    }
    
    // 2. DEDICATÓRIA
    const dedicatoriaMatch = realContent.match(/Dedicatória[\s\S]*?(?=Agradecimentos|Capítulo|$)/i);
    if (dedicatoriaMatch) {
      sections.push({
        title: "💝 DEDICATÓRIA",
        content: dedicatoriaMatch[0].trim(),
        keywords: extractKeywords(dedicatoriaMatch[0])
      });
    }
    
    // 3. AGRADECIMENTOS
    const agradecimentosMatch = realContent.match(/Agradecimentos[\s\S]*?(?=Prefácio|Capítulo|$)/i);
    if (agradecimentosMatch) {
      sections.push({
        title: "🙏 AGRADECIMENTOS",
        content: agradecimentosMatch[0].trim(),
        keywords: extractKeywords(agradecimentosMatch[0])
      });
    }
    
    // 4. PREFÁCIO
    const prefacioMatch = realContent.match(/Prefácio[\s\S]*?(?=Nota|Capítulo|$)/i);
    if (prefacioMatch) {
      sections.push({
        title: "📖 PREFÁCIO",
        content: prefacioMatch[0].trim(),
        keywords: extractKeywords(prefacioMatch[0])
      });
    }
    
    // 5. NOTA
    const notaMatch = realContent.match(/Nota[\s\S]*?(?=Resumo|Capítulo|$)/i);
    if (notaMatch) {
      sections.push({
        title: "📝 NOTA",
        content: notaMatch[0].trim(),
        keywords: extractKeywords(notaMatch[0])
      });
    }
    
    // 6. RESUMO
    const resumoMatch = realContent.match(/Resumo[\s\S]*?(?=Abstract|Capítulo|$)/i);
    if (resumoMatch) {
      sections.push({
        title: "📋 RESUMO",
        content: resumoMatch[0].trim(),
        keywords: extractKeywords(resumoMatch[0])
      });
    }
    
    // 7. ABSTRACT
    const abstractMatch = realContent.match(/Abstract[\s\S]*?(?=Capítulo|$)/i);
    if (abstractMatch) {
      sections.push({
        title: "🌍 ABSTRACT",
        content: abstractMatch[0].trim(),
        keywords: extractKeywords(abstractMatch[0])
      });
    }
    
    // 8. CAPÍTULOS
    const chapterMatches = realContent.match(/CAPÍTULO\s+[IVX]+\s*[–-]\s*([^\n]+)/gi);
    if (chapterMatches) {
      chapterMatches.forEach((match, index) => {
        const title = match.trim();
        const startIndex = realContent.indexOf(match);
        const endIndex = index < chapterMatches.length - 1 
          ? realContent.indexOf(chapterMatches[index + 1]) 
          : realContent.length;
        
        const sectionContent = realContent.substring(startIndex, endIndex).trim();
        
        sections.push({
          title: title,
          content: sectionContent,
          keywords: extractKeywords(title + ' ' + sectionContent)
        });
      });
    }
    
    // 9. BIBLIOGRAFIA
    const bibliografiaMatch = realContent.match(/Bibliografia[\s\S]*?(?=Anexos|$)/i);
    if (bibliografiaMatch) {
      sections.push({
        title: "📚 BIBLIOGRAFIA",
        content: bibliografiaMatch[0].trim(),
        keywords: extractKeywords(bibliografiaMatch[0])
      });
    }
    
    // 10. ANEXOS
    const anexosMatch = realContent.match(/Anexos[\s\S]*?$/i);
    if (anexosMatch) {
      sections.push({
        title: "📎 ANEXOS",
        content: anexosMatch[0].trim(),
        keywords: extractKeywords(anexosMatch[0])
      });
    }
    
    // Preparar dados para salvar no Supabase
    const bookData = {
      title: "História do Adventismo em Cabo Verde",
      author: "Karl Marx Morgan Lima Monteiro",
      extracted_at: new Date().toISOString(),
      full_content: realContent,
      original_content: realContent,
      total_characters: realContent.length,
      total_words: realContent.split(/\s+/).length,
      sections: sections
    };

    // Salvar no Supabase
    const supabase = createApiClient();
    
    // Primeiro, limpar a tabela existente
    await supabase.from('book_content').delete().neq('id', 0);
    
    // Inserir novo conteúdo
    const { data, error } = await supabase
      .from('book_content')
      .insert([bookData]);

    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      throw new Error('Falha ao salvar no banco de dados: ' + error.message);
    }

    console.log('✅ Conteúdo salvo no Supabase com sucesso!');
    console.log(`📋 Seções extraídas: ${sections.length}`);
    console.log('Dados salvos:', data);

    return NextResponse.json({
      success: true,
      message: 'Conteúdo real do livro extraído e salvo com sucesso!',
      data: {
        title: bookData.title,
        contentLength: realContent.length,
        sections: sections.length,
        extractedAt: bookData.extracted_at
      }
    });

  } catch (error) {
    console.error('❌ Erro na extração:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Falha na extração: ' + (error instanceof Error ? error.message : 'Erro desconhecido') 
      },
      { status: 500 }
    );
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
