# 🔍 Sistema de Tracking Pixel Avançado

Um sistema completo de rastreamento de abertura de emails com coleta detalhada de informações e notificações via Discord.

## 🌟 Características

### 📊 Coleta de Dados Detalhada
- **Informações de Rede**: IP real, localização (país, região, cidade), ISP, coordenadas
- **Informações do Dispositivo**: Sistema operacional, navegador, tipo de dispositivo
- **Informações da Requisição**: Referer, idioma, encoding, timestamp preciso
- **Sistema de Referência**: ID único para cada tracking

### 🔔 Notificações Inteligentes
- Notificações via Discord Webhook com embeds ricos
- Informações organizadas e visualmente atrativas
- Detalhes completos em tempo real

### 💾 Armazenamento Local
- Dados salvos localmente em arquivos JSON organizados por data
- Sistema de backup automático
- Fácil exportação e análise

### 📈 Painel de Estatísticas
- Interface web para visualização dos dados
- Estatísticas em tempo real
- Atualização automática a cada 30 segundos

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
```

### 2. URLs Disponíveis

#### 🎯 Tracking Principal
```
/api/index?id=SEU_EMAIL_ID
```
Usado no HTML dos emails como imagem:
```html
<img src="https://seu-dominio.com/api/index?id=campanha-2024-01" width="1" height="1" />
```

#### 📊 Painel de Estatísticas
```
/api/stats
```
Interface visual com todos os dados coletados

#### 📤 Exportar Dados
```
/api/export
```
Download de todos os dados em formato JSON

### 3. Exemplo de Email HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>Meu Email</title>
</head>
<body>
    <h1>Olá!</h1>
    <p>Este é meu email com tracking.</p>
    
    <!-- Pixel de tracking invisível -->
    <img src="https://seu-dominio.com/api/index?id=campanha-newsletter-2024" 
         width="1" height="1" style="display:none;" />
</body>
</html>
```

## 📋 Informações Coletadas

### 🌐 Dados de Rede
- **IP Address**: IP real do usuário
- **Localização**: País, região, cidade, coordenadas GPS
- **ISP**: Provedor de internet
- **Timezone**: Fuso horário da localização

### 💻 Dados do Dispositivo
- **Tipo**: Desktop, Mobile, Tablet
- **Sistema Operacional**: Windows, macOS, Linux, Android, iOS
- **Navegador**: Chrome, Firefox, Safari, Edge, Opera
- **User Agent**: String completa do navegador

### ⏰ Dados Temporais
- **Timestamp ISO**: Data/hora em formato internacional
- **Timestamp Local**: Data/hora em formato brasileiro
- **Unix Timestamp**: Para facilitar cálculos

### 🔗 Dados da Requisição
- **Referer**: De onde veio o acesso
- **Idioma**: Idiomas aceitos pelo navegador
- **Encoding**: Tipos de encoding suportados

## 📊 Exemplo de Dados Coletados

```json
{
  "trackingReference": "TRK-1703856123456-a1b2c3d4",
  "emailId": "campanha-2024-01",
  "timestamp": {
    "iso": "2024-12-29T15:30:45.123Z",
    "local": "29/12/2024 12:30:45",
    "unix": 1703856645123
  },
  "network": {
    "ip": "203.0.113.1",
    "location": {
      "country": "Brasil",
      "region": "São Paulo",
      "city": "São Paulo",
      "coordinates": "-23.5505, -46.6333",
      "timezone": "America/Sao_Paulo"
    },
    "isp": "Vivo S.A."
  },
  "device": {
    "type": "Desktop",
    "os": "Windows NT 10.0",
    "browser": "Chrome/120.0.6099.199",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
  },
  "request": {
    "referer": "https://mail.google.com/",
    "language": "pt-BR,pt;q=0.9,en;q=0.8",
    "encoding": "gzip, deflate, br",
    "method": "GET",
    "url": "/api/index?id=campanha-2024-01",
    "headers": 12
  }
}
```

## 🔧 Configuração

### Discord Webhook
Edite a URL do webhook no arquivo `/api/index.js`:
```javascript
const DISCORD_WEBHOOK_URL = "SUA_URL_DO_DISCORD_WEBHOOK_AQUI";
```

### Personalização das Mensagens
As mensagens do Discord podem ser personalizadas editando o objeto `discordMessage` no código.

## 📁 Estrutura de Arquivos

```
/
├── api/
│   ├── index.js    # Endpoint principal de tracking
│   ├── stats.js    # Painel de estatísticas
│   └── export.js   # Exportação de dados
├── data/           # Dados coletados (criado automaticamente)
│   └── tracking-YYYY-MM-DD.json
├── public/
│   └── pixel.png   # Imagem 1x1 transparente
└── package.json
```

## 🛡️ Privacidade e Segurança

- ✅ Dados armazenados localmente
- ✅ Não utiliza cookies
- ✅ Respeita headers de cache
- ✅ IPs locais são tratados adequadamente
- ✅ Falhas de geolocalização são tratadas graciosamente

## 📈 Estatísticas Disponíveis

- Total de acessos
- IPs únicos
- Emails únicos trackados
- Distribuição geográfica
- Tipos de dispositivos
- Navegadores utilizados
- Distribuição horária
- Tendências diárias

## 🔄 Deploy

Este sistema é compatível com:
- Vercel
- Netlify
- Railway
- Heroku
- Qualquer servidor Node.js

Para deploy na Vercel:
```bash
vercel --prod
```

## 🆘 Troubleshooting

### Tracking não funciona
1. Verifique se o webhook do Discord está correto
2. Confirme que a URL do pixel está acessível
3. Teste com `curl` ou Postman

### Dados não aparecem
1. Verifique as permissões da pasta `/data`
2. Confirme que o servidor tem acesso de escrita
3. Verifique os logs de erro

### Geolocalização imprecisa
- O serviço usa IP público, pode ser impreciso com VPNs
- IPs locais mostram "Local" por padrão
