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
      operatingSystems: [...new Set(allData.map(d => d.device.os))],
      lastAccess: allData[0]?.timestamp || null,
      firstAccess: allData[allData.length - 1]?.timestamp || null,
      topCountries: getTopItems(allData.map(d => d.network.location.country)),
      topCities: getTopItems(allData.map(d => `${d.network.location.city}, ${d.network.location.country}`)),
      topBrowsers: getTopItems(allData.map(d => d.device.browser)),
      topDevices: getTopItems(allData.map(d => d.device.type)),
      topEmails: getTopItems(allData.map(d => d.emailId)),
      hourlyDistribution: getHourlyDistribution(allData),
      dailyDistribution: getDailyDistribution(allData)
    };
    
    const response = {
      summary: stats,
      data: allData,
      exportedAt: new Date().toISOString(),
      dataFiles: files.filter(f => f.startsWith('tracking-') && f.endsWith('.json'))
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="tracking-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.status(200).json(response);
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao exportar dados', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function getTopItems(array, limit = 10) {
  const counts = {};
  array.forEach(item => {
    if (item && item !== 'Desconhecido') {
      counts[item] = (counts[item] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item, count]) => ({ item, count }));
}

function getHourlyDistribution(data) {
  const hours = {};
  for (let i = 0; i < 24; i++) {
    hours[i] = 0;
  }
  
  data.forEach(item => {
    const hour = new Date(item.timestamp.iso).getHours();
    hours[hour]++;
  });
  
  return hours;
}

function getDailyDistribution(data) {
  const days = {};
  
  data.forEach(item => {
    const date = item.timestamp.iso.split('T')[0];
    days[date] = (days[date] || 0) + 1;
  });
  
  return Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
