import fs from 'fs';

const data = JSON.parse(fs.readFileSync('public/matches_data.json', 'utf8'));
let html = fs.readFileSync('public/canais.html', 'utf8');

const simplifiedMatches = data.matches.map((m) => ({
  time: m.time,
  confrontation: m.confrontation,
  championship: m.championship,
  channels: m.channelsRaw,
  matchedId: m.matchedChannel ? m.matchedChannel.id : null,
  matchedName: m.matchedChannel ? m.matchedChannel.name : null,
  available: m.isAvailableInApp,
}));

const matchesJson = JSON.stringify(simplifiedMatches);
const dateJson = JSON.stringify(data.dateLabel || 'Jogos de Hoje');

html = html.replace(/const DEFAULT_DATE = .*?;/, `const DEFAULT_DATE = ${dateJson};`);
html = html.replace(/const DEFAULT_MATCHES = .*?;/, `const DEFAULT_MATCHES = ${matchesJson};`);
html = html.replace(/<div id="date-label"[^>]*>[\s\S]*?<\/div>/, `<div id="date-label" class="banner-sub" style="margin-top: 0;">Fonte Mantos do Futebol · ${data.dateLabel || 'Jogos de Hoje'}</div>`);
html = html.replace(/● Grade do dia ativa \(\d+ jogos\)/, `● Grade do dia ativa (${data.matches.length} jogos)`);

fs.writeFileSync('public/canais.html', html, 'utf8');
console.log('Successfully updated public/canais.html with latest matches_data!');
