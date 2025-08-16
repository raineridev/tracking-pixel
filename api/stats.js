import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = await fs.readdir(dataDir).catch(() => []);
    
    let allData = [];
    
    for (const file of files) {
      if (file.startsWith('tracking-') && file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        allData = allData.concat(data);
      }
    }
    
    allData.sort((a, b) => b.timestamp.unix - a.timestamp.unix);
    
    const stats = {
      total: allData.length,
      uniqueIPs: [...new Set(allData.map(d => d.network.ip))].length,
      uniqueEmails: [...new Set(allData.map(d => d.emailId))].length,
      countries: [...new Set(allData.map(d => d.network.location.country))],
      browsers: [...new Set(allData.map(d => d.device.browser))],
      devices: [...new Set(allData.map(d => d.device.type))],
      lastAccess: allData[0]?.timestamp.local || 'Nenhum',
      firstAccess: allData[allData.length - 1]?.timestamp.local || 'Nenhum'
    };
    
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>📊 Estatísticas de Tracking</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
                color: #333;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }
            .stat-number {
                font-size: 2em;
                font-weight: bold;
                color: #667eea;
                display: block;
            }
            .stat-label {
                color: #666;
                font-size: 0.9em;
                margin-top: 5px;
            }
            .data-table {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .table-header {
                background: #667eea;
                color: white;
                padding: 15px;
                font-weight: bold;
            }
            .data-row {
                padding: 15px;
                border-bottom: 1px solid #eee;
                display: grid;
                grid-template-columns: 150px 1fr 200px 150px;
                gap: 15px;
                align-items: center;
            }
            .data-row:last-child {
                border-bottom: none;
            }
            .data-row:nth-child(even) {
                background: #f9f9f9;
            }
            .reference {
                font-family: monospace;
                background: #f0f0f0;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85em;
            }
            .location {
                font-size: 0.9em;
            }
            .device-info {
                font-size: 0.9em;
                color: #666;
            }
            .timestamp {
                font-size: 0.85em;
                color: #999;
            }
            .refresh-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #667eea;
                color: white;
                border: none;
                padding: 15px 20px;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: transform 0.2s;
            }
            .refresh-btn:hover {
                transform: translateY(-2px);
            }
            .email-id {
                font-weight: bold;
                color: #667eea;
            }
        </style>
        <script>
            function refreshData() {
                window.location.reload();
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 30000);
        </script>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Painel de Tracking Detalhado</h1>
                <p>Monitoramento em tempo real de abertura de emails</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number">${stats.total}</span>
                    <div class="stat-label">Total de Acessos</div>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${stats.uniqueIPs}</span>
                    <div class="stat-label">IPs Únicos</div>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${stats.uniqueEmails}</span>
                    <div class="stat-label">Emails Únicos</div>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${stats.countries.length}</span>
                    <div class="stat-label">Países Diferentes</div>
                </div>
            </div>
            
            <div class="data-table">
                <div class="table-header">
                    Registros de Tracking (${allData.length} total)
                </div>
                ${allData.map(data => `
                    <div class="data-row">
                        <div>
                            <div class="reference">${data.trackingReference}</div>
                            <div class="email-id">ID: ${data.emailId}</div>
                        </div>
                        <div>
                            <div class="location">
                                🌍 ${data.network.location.city}, ${data.network.location.region}<br>
                                ${data.network.location.country}
                            </div>
                            <div style="font-size: 0.8em; color: #888; margin-top: 5px;">
                                IP: ${data.network.ip} | ${data.network.isp}
                            </div>
                        </div>
                        <div class="device-info">
                            💻 ${data.device.type}<br>
                            🌐 ${data.device.browser}<br>
                            🖥️ ${data.device.os}
                        </div>
                        <div class="timestamp">
                            ⏰ ${data.timestamp.local}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            ${allData.length === 0 ? '<div style="text-align: center; padding: 50px; color: #999;">Nenhum dado de tracking ainda</div>' : ''}
        </div>
        
        <button class="refresh-btn" onclick="refreshData()">
            🔄 Atualizar
        </button>
    </body>
    </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas', details: error.message });
  }
}
