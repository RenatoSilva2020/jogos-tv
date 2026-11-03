import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Endpoint: Player do Servidor
  // Proxies the stream page from redecanais with proper Referer & User-Agent,
  // strips restrictive framing headers so it can play cleanly inside the app or iframe.
  app.get(['/api/player', '/api/player/:canal'], async (req, res) => {
    try {
      const canalParam = (req.params.canal || req.query.canal || 'premiereclubes') as string;
      const sanitizedCanal = canalParam.replace(/[^a-zA-Z0-9_-]/g, '');

      const targetUrl = `https://redecanais.by/player3/ch.php?canal=${sanitizedCanal}`;

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://redecanais.by/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        res.status(response.status).send(`Erro ao carregar canal do servidor (${response.status})`);
        return;
      }

      let html = await response.text();

      // Ensure base URL is set to redecanais player3 for relative scripts & styles
      if (!html.includes('<base')) {
        if (html.includes('<head>')) {
          html = html.replace('<head>', '<head><base href="https://redecanais.by/player3/">');
        } else {
          html = `<base href="https://redecanais.by/player3/">` + html;
        }
      }

      // Permissive framing & CORS headers so the local browser can embed the player seamlessly
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(html);
    } catch (err: any) {
      console.error('Erro no player do servidor:', err);
      res.status(500).send(`Erro interno ao processar player do servidor: ${err.message}`);
    }
  });

  // Helper to match channel strings against internal app channels
  function matchChannelToApp(rawChannels: string): { id: string; name: string; category: string; canalKey: string; url: string } | null {
    const chLower = (rawChannels || '').toLowerCase();

    if (chLower.includes('premiere')) {
      return {
        id: 'premiere-c',
        name: 'PREMIERE',
        category: 'premiere',
        canalKey: 'premiereclubes',
        url: 'https://redecanais.by/player3/ch.php?canal=premiereclubes',
      };
    } else if (chLower.includes('sportv 4') || chLower.includes('sportv4')) {
      return {
        id: 'sportv-4',
        name: 'SPORTV 4',
        category: 'sportv',
        canalKey: 'sportv4',
        url: 'https://ww0.embedtv.cc/sportv4',
      };
    } else if (chLower.includes('sportv 2') || chLower.includes('sportv2')) {
      return {
        id: 'sportv-2',
        name: 'SPORTV 2',
        category: 'sportv',
        canalKey: 'sportv2',
        url: 'https://redecanais.by/player3/ch.php?canal=sportv2',
      };
    } else if (chLower.includes('sportv 3') || chLower.includes('sportv3')) {
      return {
        id: 'sportv-3',
        name: 'SPORTV 3',
        category: 'sportv',
        canalKey: 'sportv3',
        url: 'https://redecanais.by/player3/ch.php?canal=sportv3',
      };
    } else if (chLower.includes('sportv')) {
      return {
        id: 'sportv-1',
        name: 'SPORTV 1',
        category: 'sportv',
        canalKey: 'sportv1',
        url: 'https://redecanais.by/player3/ch.php?canal=sportv1',
      };
    } else if (chLower.includes('espn 2') || chLower.includes('espn2')) {
      return {
        id: 'espn-2',
        name: 'ESPN 2',
        category: 'espn',
        canalKey: 'espn2',
        url: 'https://redecanais.by/player3/ch.php?canal=espn2',
      };
    } else if (chLower.includes('espn 3') || chLower.includes('espn3')) {
      return {
        id: 'espn-3',
        name: 'ESPN 3',
        category: 'espn',
        canalKey: 'espn3',
        url: 'https://redecanais.by/player3/ch.php?canal=espn3',
      };
    } else if (chLower.includes('espn 4') || chLower.includes('espn4')) {
      return {
        id: 'espn-4',
        name: 'ESPN 4',
        category: 'espn',
        canalKey: 'espn4',
        url: 'https://redecanais.by/player3/ch.php?canal=espn4',
      };
    } else if (chLower.includes('espn 5') || chLower.includes('espn5')) {
      return {
        id: 'espn-5',
        name: 'ESPN 5',
        category: 'espn',
        canalKey: 'espn5',
        url: 'https://redecanais.by/player3/ch.php?canal=espn5',
      };
    } else if (chLower.includes('espn 6') || chLower.includes('espn6')) {
      return {
        id: 'espn-6',
        name: 'ESPN 6',
        category: 'espn',
        canalKey: 'espn6',
        url: 'https://redecanais.by/player3/ch.php?canal=espn6',
      };
    } else if (chLower.includes('espn')) {
      return {
        id: 'espn-1',
        name: 'ESPN 1',
        category: 'espn',
        canalKey: 'espn',
        url: 'https://redecanais.by/player3/ch.php?canal=espn',
      };
    } else if (chLower.includes('cazé') || chLower.includes('caze')) {
      return {
        id: 'cazetv-1',
        name: 'CAZETV 1',
        category: 'cazetv',
        canalKey: 'caze1',
        url: 'https://ww0.embedtv.cc/caze1',
      };
    } else if (chLower.includes('disney')) {
      return {
        id: 'disney-1',
        name: 'DISNEY+ 1',
        category: 'disney',
        canalKey: 'disneyplus1',
        url: 'https://ww0.embedtv.cc/disneyplus1',
      };
    } else if (chLower.includes('max') || chLower.includes('hbo') || chLower.includes('tnt') || chLower.includes('space')) {
      return {
        id: 'max-1',
        name: 'HBO MAX 1',
        category: 'max',
        canalKey: 'max1',
        url: 'https://ww0.embedtv.cc/max1',
      };
    } else if (chLower.includes('paramount')) {
      return {
        id: 'paramount-1',
        name: 'PARAMOUNT+ 1',
        category: 'paramount',
        canalKey: 'paramountplus',
        url: 'https://ww0.embedtv.cc/paramountplus',
      };
    } else if (chLower.includes('prime video') || chLower.includes('primevideo') || chLower.includes('amazon prime')) {
      return {
        id: 'primevideo-1',
        name: 'PRIME VIDEO 1',
        category: 'primevideo',
        canalKey: 'primevideo',
        url: 'https://ww0.embedtv.cc/primevideo',
      };
    } else if (chLower.includes('record')) {
      return {
        id: 'record',
        name: 'RECORD',
        category: 'aberta',
        canalKey: 'record',
        url: 'https://redecanais.by/player3/ch.php?canal=record',
      };
    } else if (chLower.includes('sbt')) {
      return {
        id: 'sbt',
        name: 'SBT',
        category: 'aberta',
        canalKey: 'sbt',
        url: 'https://redecanais.by/player3/ch.php?canal=sbt',
      };
    } else if (chLower.includes('globo') || chLower.includes('tv globo')) {
      return {
        id: 'premiere-c',
        name: 'PREMIERE / GLOBO',
        category: 'premiere',
        canalKey: 'premiereclubes',
        url: 'https://redecanais.by/player3/ch.php?canal=premiereclubes',
      };
    } else if (chLower.includes('sportynet 2')) {
      return {
        id: 'sportynet-2',
        name: 'SPORTYNET 2',
        category: 'sportynet',
        canalKey: 'sportynet2',
        url: 'https://redecanais.by/player3/ch.php?canal=sportynet2',
      };
    } else if (chLower.includes('sportynet 3')) {
      return {
        id: 'sportynet-3',
        name: 'SPORTYNET 3',
        category: 'sportynet',
        canalKey: 'sportynet3',
        url: 'https://redecanais.by/player3/ch.php?canal=sportynet3',
      };
    } else if (chLower.includes('sportynet')) {
      return {
        id: 'sportynet-1',
        name: 'SPORTYNET 1',
        category: 'sportynet',
        canalKey: 'sportynet1',
        url: 'https://redecanais.by/player3/ch.php?canal=sportynet1',
      };
    } else if (chLower.includes('bandsports')) {
      return {
        id: 'bandsports',
        name: 'BANDSPORTS',
        category: 'bandsports',
        canalKey: 'bandsports',
        url: 'https://redecanais.by/player3/ch.php?canal=bandsports',
      };
    }

    return null;
  }

  function getFallbackChannelsForCompetition(compName?: string, homeTeam?: string, awayTeam?: string): string {
    const lower = ((compName || '') + ' ' + (homeTeam || '') + ' ' + (awayTeam || '')).toLowerCase();
    if (lower.includes('ásia') || lower.includes('asia') || lower.includes('afc') || lower.includes('nassr') || lower.includes('hilal')) return 'ESPN 4, Disney+';
    if (lower.includes('liga dos campeões') || lower.includes('champions league') || lower.includes('champions')) return 'TNT Sports, Space, HBO Max, SBT';
    if (lower.includes('europa league') || lower.includes('liga europa')) return 'CazéTV, Disney+, ESPN';
    if (lower.includes('conference league')) return 'CazéTV, Disney+';
    if (lower.includes('premier league') || lower.includes('inglês') || lower.includes('ingles')) return 'ESPN, Disney+';
    if (lower.includes('laliga') || lower.includes('la liga') || lower.includes('espanhol')) return 'ESPN, Disney+';
    if (lower.includes('serie a') || lower.includes('italiano') || lower.includes('calcio')) return 'ESPN 4, Disney+';
    if (lower.includes('bundesliga') || lower.includes('alemão') || lower.includes('alemao')) return 'CazéTV, SporTV, RedeTV';
    if (lower.includes('ligue 1') || lower.includes('francês') || lower.includes('frances')) return 'CazéTV, YouTube';
    if (lower.includes('libertadores')) return 'Paramount+, Disney+, ESPN, TV Globo';
    if (lower.includes('sul-americana') || lower.includes('sudamericana')) return 'Paramount+, ESPN, Disney+';
    if (lower.includes('brasileirão') || lower.includes('brasileiro') || lower.includes('serie a') || lower.includes('série a')) return 'Premiere, SporTV, TV Globo';
    if (lower.includes('série b') || lower.includes('serie b')) return 'Premiere, SporTV, Canal GOAT, Band';
    if (lower.includes('copa do brasil')) return 'Premiere, SporTV, Prime Video, TV Globo';
    if (lower.includes('paulistão') || lower.includes('paulista')) return 'CazéTV, Record, HBO Max, TNT';
    if (lower.includes('carioca')) return 'Band, Canal GOAT, CazéTV';
    if (lower.includes('copa do rei')) return 'ESPN 4, Disney+';
    if (lower.includes('copa da inglaterra') || lower.includes('fa cup')) return 'ESPN, Disney+';
    if (lower.includes('saudita') || lower.includes('saudi') || lower.includes('roshn')) return 'BandSports, Canal GOAT, YouTube';
    return 'Disney+, ESPN 4, SporTV';
  }

  // Global persistent memory cache for TV networks details and date games
  const globalTvDetailsCache = new Map<number, { id: number; name: string; logoUrl: string }[]>();
  const cache365Scores = new Map<string, { timestamp: number; data: any }>();
  let matchesCache: { timestamp: number; dateStr: string; data: any } | null = null;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Helper to fetch and parse matches directly from 365scores.com
  async function fetch365ScoresData(dateInput?: string, onlyWithTv = true) {
    let dateStr = '';
    const now = new Date();

    if (!dateInput || dateInput === 'today') {
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      dateStr = `${d}/${m}/${y}`;
    } else if (dateInput === 'yesterday') {
      const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const d = String(yest.getDate()).padStart(2, '0');
      const m = String(yest.getMonth() + 1).padStart(2, '0');
      const y = yest.getFullYear();
      dateStr = `${d}/${m}/${y}`;
    } else if (dateInput === 'tomorrow') {
      const tom = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const d = String(tom.getDate()).padStart(2, '0');
      const m = String(tom.getMonth() + 1).padStart(2, '0');
      const y = tom.getFullYear();
      dateStr = `${d}/${m}/${y}`;
    } else if (dateInput.includes('-')) {
      // YYYY-MM-DD to DD/MM/YYYY
      const parts = dateInput.split('-');
      if (parts.length === 3) {
        dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } else {
      dateStr = dateInput;
    }

    const apiUrl = `https://webws.365scores.com/web/games/allscores/?appTypeId=5&langId=31&timezoneName=America/Sao_Paulo&userCountryId=21&sports=1&startDate=${encodeURIComponent(dateStr)}&endDate=${encodeURIComponent(dateStr)}&showOdds=true`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.365scores.com/pt-br/where-to-watch',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao conectar ao 365Scores (${response.status})`);
    }

    const data = await response.json();
    const rawGames: any[] = data.games || [];
    const competitorsMap = new Map((data.competitors || []).map((c: any) => [c.id, c]));
    const competitionsMap = new Map((data.competitions || []).map((c: any) => [c.id, c]));

    // Format human readable date label
    const parts = dateStr.split('/');
    let dateLabel = dateStr;
    if (parts.length === 3) {
      const parsedDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayName = days[parsedDate.getDay()];
      dateLabel = `${dayName} – ${parts[0]}/${parts[1]}`;
    }

    // Filter games
    const targetGames = onlyWithTv ? rawGames.filter((g) => g.hasTVNetworks) : rawGames;

    // Parallel fetch TV details for games that have TV networks with caching & 2s timeout
    const gamesToFetchTv = targetGames.filter((g) => g.hasTVNetworks);
    const tvDetailsMap = new Map<number, { id: number; name: string; logoUrl: string }[]>();

    const gamesNeedingFetch: any[] = [];
    for (const g of gamesToFetchTv) {
      if (globalTvDetailsCache.has(g.id)) {
        tvDetailsMap.set(g.id, globalTvDetailsCache.get(g.id)!);
      } else {
        gamesNeedingFetch.push(g);
      }
    }

    if (gamesNeedingFetch.length > 0) {
      await Promise.allSettled(
        gamesNeedingFetch.slice(0, 35).map(async (g) => {
          try {
            const detailUrl = `https://webws.365scores.com/web/game/?gameId=${g.id}&langId=31&appTypeId=5&userCountryId=21&timezoneName=America/Sao_Paulo`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const detailRes = await fetch(detailUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://www.365scores.com/pt-br/where-to-watch',
              },
            });
            clearTimeout(timeoutId);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const nets = (detailData.game?.tvNetworks || []).map((n: any) => ({
                id: n.id,
                name: n.name,
                logoUrl: `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/TvNetworks/${n.id}`,
              }));
              tvDetailsMap.set(g.id, nets);
              globalTvDetailsCache.set(g.id, nets);
            }
          } catch {
            // Ignore individual match TV fetch failures
          }
        })
      );
    }

    const matches: any[] = [];

    for (const g of targetGames) {
      const home: any = competitorsMap.get(g.homeCompetitor?.id) || g.homeCompetitor || {};
      const away: any = competitorsMap.get(g.awayCompetitor?.id) || g.awayCompetitor || {};
      const comp: any = competitionsMap.get(g.competitionId) || {};

      const homeName = home.name || 'Mandante';
      const awayName = away.name || 'Visitante';
      const homeScore = typeof home.score === 'number' ? home.score : undefined;
      const awayScore = typeof away.score === 'number' ? away.score : undefined;

      // Extract kick-off time (e.g. 16:00)
      let timeStr = 'A definir';
      if (g.startTime) {
        try {
          const dt = new Date(g.startTime);
          timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
        } catch {
          timeStr = g.startTime.slice(11, 16) || 'A definir';
        }
      }

      // High-resolution official shields directly from 365Scores CDN
      const homeLogo = home.id
        ? `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/Competitors/${home.id}`
        : null;
      const awayLogo = away.id
        ? `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/Competitors/${away.id}`
        : null;
      const compLogo = comp.id
        ? `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/Competitions/${comp.id}`
        : null;

      // TV networks
      const tvNetworks = tvDetailsMap.get(g.id) || [];
      let channelsRaw = tvNetworks.length > 0 ? tvNetworks.map((n) => n.name).join(', ') : '';
      if (!channelsRaw || channelsRaw === 'Transmissão a confirmar') {
        channelsRaw = getFallbackChannelsForCompetition(comp.name || g.competitionDisplayName, homeName, awayName);
      }

      // Match against our app's channels
      const matchedChannel = matchChannelToApp(channelsRaw);

      matches.push({
        id: `365-${g.id}`,
        gameId: g.id,
        time: timeStr,
        startTimeIso: g.startTime,
        homeTeam: homeName,
        awayTeam: awayName,
        homeLogo,
        awayLogo,
        homeScore,
        awayScore,
        confrontation: `${homeName} x ${awayName}`,
        championship: comp.name || g.competitionDisplayName || 'Futebol Internacional',
        competitionLogo: compLogo,
        channelsRaw,
        tvNetworksList: tvNetworks,
        matchedChannel,
        isAvailableInApp: Boolean(matchedChannel),
        statusText: g.statusText || '',
        statusGroup: g.statusGroup,
        gameTime: g.gameTime,
      });
    }

    return {
      updatedAt: new Date().toISOString(),
      source: 'https://www.365scores.com/pt-br/where-to-watch',
      sourceType: '365scores',
      dateLabel,
      dateFormatted: dateStr,
      totalMatches: matches.length,
      availableMatchesCount: matches.filter((m) => m.isAvailableInApp).length,
      allGamesCount: rawGames.length,
      tvGamesCount: rawGames.filter((g) => g.hasTVNetworks).length,
      matches,
    };
  }

  // Dedicated endpoint for 365Scores matches
  app.get('/api/365scores/jogos', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
      const forceRefresh = req.query.refresh === 'true';
      const date = (req.query.date as string)?.trim() || 'today';
      const onlyWithTv = req.query.view !== 'all';
      const cacheKey = `${date}_tv_${onlyWithTv}`;
      const now = Date.now();

      const cached = cache365Scores.get(cacheKey);
      if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL) {
        res.json({ ...cached.data, cached: true });
        return;
      }

      const result = await fetch365ScoresData(date, onlyWithTv);
      cache365Scores.set(cacheKey, { timestamp: now, data: result });
      res.json(result);
    } catch (err: any) {
      console.error('Erro na API 365Scores:', err);
      res.status(500).json({ error: 'Falha ao obter jogos do 365Scores: ' + err.message });
    }
  });

  // Main games endpoint (Supports both 365Scores and Mantos do Futebol)
  app.get('/api/jogos-hoje', async (req, res) => {
    // Strictly prevent browser or intermediary proxy caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    try {
      const forceRefresh = req.query.refresh === 'true';
      const clientDate = (req.query.clientDate as string)?.trim() || '';
      const sourceUrl = (req.query.sourceUrl as string) || 'https://www.365scores.com/pt-br/where-to-watch';
      const dateParam = (req.query.date as string)?.trim() || '';
      const onlyWithTv = req.query.view !== 'all';
      const now = Date.now();
      const todayIsoDate = new Date().toISOString().slice(0, 10);

      // Route 1: 365Scores (Always used for dates, or when 365scores/default source is active)
      const shouldUse365 =
        Boolean(dateParam && dateParam !== 'today') ||
        sourceUrl.includes('365scores.com') ||
        sourceUrl.includes('where-to-watch') ||
        !sourceUrl.includes('mantosdofutebol.com.br');

      if (shouldUse365) {
        const cacheKey = `365_${dateParam || 'today'}_tv_${onlyWithTv}`;
        const cached = cache365Scores.get(cacheKey);
        if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL) {
          const cachedData = { ...cached.data };
          if (clientDate && clientDate.length >= 4 && !dateParam) {
            cachedData.dateLabel = clientDate;
          }
          res.json({ ...cachedData, cached: true });
          return;
        }

        try {
          const result = await fetch365ScoresData(dateParam || 'today', onlyWithTv);
          cache365Scores.set(cacheKey, { timestamp: now, data: result });
          res.json(result);
          return;
        } catch (scoresErr: any) {
          console.warn('Erro ao carregar do 365Scores, tentando cache ou fallback:', scoresErr.message);
          if (cached) {
            res.json({ ...cached.data, cached: true, warning: 'Usando cache do 365Scores' });
            return;
          }
          // Fall through to Mantos do Futebol if 365Scores fails
        }
      }

      // Route 2: Mantos do Futebol (Traditional web scraper)
      if (
        !forceRefresh &&
        sourceUrl.includes('mantosdofutebol.com.br') &&
        matchesCache &&
        matchesCache.dateStr === todayIsoDate &&
        now - matchesCache.timestamp < CACHE_TTL
      ) {
        const cachedData = { ...matchesCache.data };
        if (clientDate && clientDate.length >= 4) {
          cachedData.dateLabel = clientDate;
        }
        res.json({ ...cachedData, cached: true });
        return;
      }

      const response = await fetch(sourceUrl.includes('mantosdofutebol') ? sourceUrl : 'https://mantosdofutebol.com.br/guia-de-jogos-tv-hoje-ao-vivo/', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        if (matchesCache) {
          const fallbackData = { ...matchesCache.data };
          if (clientDate && clientDate.length >= 4) {
            fallbackData.dateLabel = clientDate;
          }
          res.json({ ...fallbackData, cached: true, warning: 'Usando cache anterior' });
          return;
        }
        res.status(502).json({ error: `Erro ao conectar à fonte de jogos (${response.status})` });
        return;
      }

      const html = await response.text();

      // Extract date label (e.g. "Sexta – 30/10")
      let dateLabel = '';
      const dateMatchWithDay = html.match(/<h[1-4][^>]*>(?:<span[^>]*>)?\s*([A-Za-zçãéíóú\s&#0-9;–-]+?\d{1,2}\/\d{1,2})\s*(?:<\/span>)?<\/h[1-4]>/i);
      const dateMatchH2 = html.match(/<h2><span[^>]*>(.*?)<\/span><\/h2>/i);

      if (dateMatchWithDay && dateMatchWithDay[1]) {
        dateLabel = dateMatchWithDay[1].replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&amp;/g, '&').trim();
      } else if (dateMatchH2 && dateMatchH2[1]) {
        dateLabel = dateMatchH2[1].replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&amp;/g, '&').trim();
      }

      if (clientDate && clientDate.length >= 4) {
        dateLabel = clientDate;
      } else if (!dateLabel || dateLabel.length < 4) {
        const nowObj = new Date();
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const dayName = days[nowObj.getDay()];
        const d = String(nowObj.getDate()).padStart(2, '0');
        const m = String(nowObj.getMonth() + 1).padStart(2, '0');
        dateLabel = `${dayName} – ${d}/${m}`;
      }

      // Parse matches: <h3><strong>Time – Confronto – Campeonato</strong></h3> ... <p><span><strong>Canais: Canais</strong></span></p>
      const regex =
        /<h3><strong>(.*?)<\/strong><\/h3>[\s\S]*?<p><span[^>]*><strong>Canais:\s*(.*?)<\/strong><\/span><\/p>/gi;
      let m;
      const matches: any[] = [];

      while ((m = regex.exec(html)) !== null) {
        const rawTitle = m[1].replace(/&#8211;/g, '–').replace(/&amp;/g, '&').trim();
        const rawChannels = m[2].replace(/&#8211;/g, '–').replace(/&amp;/g, '&').trim();

        // Parts separation
        const parts = rawTitle.split('–').map((s) => s.trim());
        const time = parts[0] || '';
        const confrontation = parts[1] || '';
        const championship = parts.slice(2).join(' – ') || '';

        let homeTeam = confrontation;
        let awayTeam = '';
        if (confrontation.includes(' x ')) {
          const teams = confrontation.split(' x ').map((s) => s.trim());
          homeTeam = teams[0];
          awayTeam = teams[1] || '';
        }

        const matchedChannel = matchChannelToApp(rawChannels);

        matches.push({
          id: `match-${matches.length + 1}`,
          time,
          homeTeam,
          awayTeam,
          confrontation,
          championship,
          channelsRaw: rawChannels,
          matchedChannel,
          isAvailableInApp: Boolean(matchedChannel),
        });
      }

      const result = {
        updatedAt: new Date().toISOString(),
        source: 'https://mantosdofutebol.com.br/guia-de-jogos-tv-hoje-ao-vivo/',
        sourceType: 'mantosdofutebol',
        dateLabel,
        totalMatches: matches.length,
        availableMatchesCount: matches.filter((m) => m.isAvailableInApp).length,
        matches,
      };

      matchesCache = { timestamp: now, dateStr: todayIsoDate, data: result };
      res.json(result);
    } catch (err: any) {
      console.error('Erro ao buscar jogos do Mantos do Futebol:', err);
      if (matchesCache) {
        res.json({ ...matchesCache.data, cached: true, warning: 'Erro ao atualizar dados online' });
        return;
      }
      res.status(500).json({ error: 'Falha ao obter jogos do dia: ' + err.message });
    }
  });

  app.get('/player/:canal', (req, res) => {
    const canal = req.params.canal.replace(/[^a-zA-Z0-9_-]/g, '');
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Player Servidor - ${canal}</title>
  <style>
    * { margin:0; padding:0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe src="/api/player?canal=${canal}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>
</body>
</html>`);
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
