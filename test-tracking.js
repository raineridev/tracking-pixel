import fetch from "node-fetch";

async function testTracking() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testando sistema de tracking...\n');
  
  try {
    console.log('📧 Teste 1: Simulando abertura de email...');
    const response1 = await fetch(`${baseUrl}/api/index?id=teste-email-001`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Referer': 'https://mail.google.com/'
      }
    });
    
    if (response1.ok) {
      console.log('✅ Tracking funcionando! Resposta recebida.');
      console.log(`📊 Content-Type: ${response1.headers.get('content-type')}`);
    } else {
      console.log('❌ Erro no tracking:', response1.status);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n📱 Teste 2: Simulando dispositivo mobile...');
    const response2 = await fetch(`${baseUrl}/api/index?id=teste-mobile-002`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Referer': 'https://outlook.com/'
      }
    });
    
    if (response2.ok) {
      console.log('✅ Tracking mobile funcionando!');
    }
    
    console.log('\n📊 Teste 3: Verificando estatísticas...');
    const response3 = await fetch(`${baseUrl}/api/export`);
    
    if (response3.ok) {
      const data = await response3.json();
      console.log(`✅ Estatísticas disponíveis!`);
      console.log(`📈 Total de registros: ${data.summary.total}`);
      console.log(`🌍 IPs únicos: ${data.summary.uniqueIPs}`);
      console.log(`📧 Emails únicos: ${data.summary.uniqueEmails}`);
    }
    
    console.log('\n🎉 Testes concluídos!');
    console.log(`🌐 Painel de estatísticas: ${baseUrl}/api/stats`);
    console.log(`📤 Exportar dados: ${baseUrl}/api/export`);
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('\n💡 Dicas:');
    console.log('- Certifique-se de que o servidor está rodando');
    console.log('- Verifique a URL base no script');
    console.log('- Confirme que as dependências estão instaladas');
  }
}

testTracking();
