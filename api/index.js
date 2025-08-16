import fetch from "node-fetch";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

function parseUserAgent(userAgent) {
  const ua = userAgent || "";
  
  let os = "Desconhecido";
  if (ua.includes("Windows")) os = ua.match(/Windows NT ([\d\.]+)/)?.[0] || "Windows";
  else if (ua.includes("Mac OS X")) os = ua.match(/Mac OS X ([\d_]+)/)?.[0]?.replace(/_/g, '.') || "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = ua.match(/Android ([\d\.]+)/)?.[0] || "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = ua.match(/OS ([\d_]+)/)?.[0]?.replace(/_/g, '.') || "iOS";

  let browser = "Desconhecido";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = ua.match(/Chrome\/([\d\.]+)/)?.[0] || "Chrome";
  else if (ua.includes("Firefox")) browser = ua.match(/Firefox\/([\d\.]+)/)?.[0] || "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = ua.match(/Safari\/([\d\.]+)/)?.[0] || "Safari";
  else if (ua.includes("Edg")) browser = ua.match(/Edg\/([\d\.]+)/)?.[0] || "Edge";
  else if (ua.includes("Opera")) browser = ua.match(/Opera\/([\d\.]+)/)?.[0] || "Opera";

  let deviceType = "Desktop";
  if (ua.includes("Mobile")) deviceType = "Mobile";
  else if (ua.includes("Tablet") || ua.includes("iPad")) deviceType = "Tablet";

  return { os, browser, deviceType, fullUserAgent: ua };
}

async function getLocationInfo(ip) {
  try {
    const cleanIp = ip.replace(/^::ffff:/, '');
    
    if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
      return { 
        ip: cleanIp, 
        country: "Local", 
        region: "Local", 
        city: "Local", 
        isp: "Local Network",
        timezone: "Local"
      };
    }

    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,isp,timezone,lat,lon,query`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        ip: data.query,
        country: data.country,
        region: data.regionName,
        city: data.city,
        isp: data.isp,
        timezone: data.timezone,
        coordinates: `${data.lat}, ${data.lon}`
      };
    }
  } catch (error) {
    console.error("Erro ao obter informações de localização:", error);
  }
  
  return { 
    ip: ip, 
    country: "Desconhecido", 
    region: "Desconhecido", 
    city: "Desconhecido", 
    isp: "Desconhecido",
    timezone: "Desconhecido"
  };
}

function generateTrackingReference() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `TRK-${timestamp}-${random}`;
}

async function saveTrackingData(data) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const fileName = `tracking-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(dataDir, fileName);
    
    let existingData = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
    }
    
    existingData.push(data);
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error("Erro ao salvar dados de rastreamento:", error);
  }
}

export default async function handler(req, res) {
  const emailId = req.query.id || "desconhecido";
  const trackingRef = generateTrackingReference();
  
  const timestamp = new Date();
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || req.ip || "desconhecido";
  const userAgent = req.headers['user-agent'] || "";
  const referer = req.headers['referer'] || req.headers['referrer'] || "Direto";
  const acceptLanguage = req.headers['accept-language'] || "Desconhecido";
  const acceptEncoding = req.headers['accept-encoding'] || "Desconhecido";
  
  const deviceInfo = parseUserAgent(userAgent);
  
  const locationInfo = await getLocationInfo(ip);
  
  const trackingData = {
    trackingReference: trackingRef,
    emailId: emailId,
    timestamp: {
      iso: timestamp.toISOString(),
      local: timestamp.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      unix: timestamp.getTime()
    },
    network: {
      ip: locationInfo.ip,
      location: {
        country: locationInfo.country,
        region: locationInfo.region,
        city: locationInfo.city,
        coordinates: locationInfo.coordinates,
        timezone: locationInfo.timezone
      },
      isp: locationInfo.isp
    },
    device: {
      type: deviceInfo.deviceType,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      userAgent: deviceInfo.fullUserAgent
    },
    request: {
      referer: referer,
      language: acceptLanguage,
      encoding: acceptEncoding,
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers).length
    }
  };

  await saveTrackingData(trackingData);

  const discordMessage = {
    content: `🔍 **TRACKING DETECTADO** 📧`,
    embeds: [{
      title: "📊 Relatório Detalhado de Tracking",
      color: 0x00ff00,
      fields: [
        {
          name: "🆔 Referência",
          value: `\`${trackingRef}\``,
          inline: true
        },
        {
          name: "📧 Email ID",
          value: `\`${emailId}\``,
          inline: true
        },
        {
          name: "⏰ Timestamp",
          value: trackingData.timestamp.local,
          inline: true
        },
        {
          name: "🌍 Localização",
          value: `${locationInfo.city}, ${locationInfo.region}\n${locationInfo.country}`,
          inline: true
        },
        {
          name: "🌐 Rede",
          value: `IP: \`${locationInfo.ip}\`\nISP: ${locationInfo.isp}`,
          inline: true
        },
        {
          name: "💻 Dispositivo",
          value: `${deviceInfo.deviceType}\n${deviceInfo.os}\n${deviceInfo.browser}`,
          inline: true
        },
        {
          name: "🔗 Origem",
          value: referer === "Direto" ? "Acesso direto" : referer,
          inline: false
        }
      ],
      footer: {
        text: `Coordinates: ${locationInfo.coordinates || 'N/A'} | Timezone: ${locationInfo.timezone}`
      },
      timestamp: timestamp.toISOString()
    }]
  };

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1405697169381527562/OOuVoNxUACWzOQASQwtRHL2007whnF141twunZ1Q4DLHdjXzUqnbXxczuB3_r1Vn5o0Y";

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordMessage)
    });
  } catch (err) {
    console.error("Erro ao enviar webhook:", err);
  }

  const pixelPath = path.join(process.cwd(), "public", "pixel.png");
  const pixel = await fs.readFile(pixelPath);
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).send(pixel);
}
