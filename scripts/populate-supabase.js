const fs = require('fs');
const path = require('path');

// Função para ler o arquivo do livro
function readBookFile() {
  const livroPath = path.join(process.cwd(), 'data', 'livro-adventismo-cabo-verde.txt');
  
  if (!fs.existsSync(livroPath)) {
    console.error('❌ Arquivo do livro não encontrado!');
    return null;
  }
  
  return fs.readFileSync(livroPath, 'utf-8');
}

// Função para dividir o conteúdo em seções
function extractSections(content) {
  const sections = [];
  
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
  
  return sections;
}

// Função para extrair palavras-chave
function extractKeywords(text) {
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

// Função principal
async function main() {
  console.log('📚 Iniciando população do Supabase com conteúdo do livro...');
  
  const content = readBookFile();
  if (!content) {
    console.error('❌ Não foi possível ler o arquivo do livro');
    return;
  }
  
  console.log('✅ Arquivo do livro lido com sucesso');
  console.log(`📊 Tamanho do conteúdo: ${content.length} caracteres`);
  
  const sections = extractSections(content);
  console.log(`📋 Seções extraídas: ${sections.length}`);
  
  sections.forEach((section, index) => {
    console.log(`${index + 1}. ${section.title} (${section.content.length} chars, ${section.keywords.length} keywords)`);
  });
  
  console.log('\n🎯 Para popular o Supabase, execute:');
  console.log('curl -X POST http://localhost:3000/api/scrape');
  console.log('\nOu acesse: http://localhost:3000/api/scrape no navegador');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { readBookFile, extractSections, extractKeywords };
