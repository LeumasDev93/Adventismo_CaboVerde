/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createComponentClient } from '@/models/supabase';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('💾 Salvando conteúdo do livro no Supabase...');
    
    const livroPath = path.join(process.cwd(), 'data', 'livro-adventismo-cabo-verde.txt');
    
    if (!fs.existsSync(livroPath)) {
      console.error('❌ Arquivo do livro não encontrado!');
      return NextResponse.json({
        success: false,
        error: 'Arquivo do livro não encontrado'
      }, { status: 404 });
    }
    
    const content = fs.readFileSync(livroPath, 'utf-8');
    
    // Dividir em seções baseado nos capítulos
    const sections: { title: string; content: string; keywords: string[]; }[] = [];
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
    
    // Primeiro, deletar conteúdo existente
    console.log('🗑️ Deletando conteúdo existente...');
    await supabase.from('book_content').delete().neq('id', 0);
    
    // Inserir novo conteúdo
    console.log('📝 Inserindo novo conteúdo...');
    const { data, error } = await supabase
      .from('book_content')
      .insert([bookData])
      .select();
    
    if (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      return NextResponse.json({
        success: false,
        error: 'Falha ao salvar no banco de dados: ' + error.message
      }, { status: 500 });
    }
    
    console.log('✅ Conteúdo salvo no Supabase com sucesso!');
    
    return NextResponse.json({
      success: true,
      message: 'Conteúdo do livro salvo no Supabase com sucesso!',
      data: {
        title: bookData.title,
        author: bookData.author,
        totalCharacters: bookData.total_characters,
        totalWords: bookData.total_words,
        sections: sections.length
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar conteúdo do livro:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
    }, { status: 500 });
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
    'califórnia', 'hawai', 'estados unidos', 'brasil', 'são paulo', 'são tomé e príncipe'
  ];

  return keywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}
