import { Channel, DEFAULT_CHANNELS } from '../data/channelsData';

export interface TvNetworkItem {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface ClientMatchItem {
  id: string;
  gameId?: number;
  time: string;
  startTimeIso?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string | null;
  awayLogo?: string | null;
  homeScore?: number;
  awayScore?: number;
  confrontation: string;
  championship: string;
  competitionLogo?: string | null;
  channelsRaw: string;
  tvNetworksList?: TvNetworkItem[];
  matchedChannel: {
    id: string;
    name: string;
    category: string;
    canalKey: string;
    url: string;
  } | null;
  isAvailableInApp: boolean;
  statusText?: string;
  statusGroup?: number;
  gameTime?: number;
}

export interface ClientMatchesResponse {
  updatedAt: string;
  source: string;
  sourceType?: string;
  dateLabel: string;
  dateFormatted?: string;
  totalMatches: number;
  availableMatchesCount: number;
  allGamesCount?: number;
  tvGamesCount?: number;
  matches: ClientMatchItem[];
}

export function matchChannelToApp(
  rawChannels: string,
  channelsList: Channel[] = DEFAULT_CHANNELS
): { id: string; name: string; category: string; canalKey: string; url: string } | null {
  const chLower = (rawChannels || '').toLowerCase();

  // 1. Try finding in the current channels list
  for (const ch of channelsList) {
    const nameLower = ch.name.toLowerCase();
    const netLower = (ch.network || '').toLowerCase();
    const canalKeyLower = (ch.canalKey || '').toLowerCase();

    if (
      chLower.includes(nameLower) ||
      (netLower.length > 3 && chLower.includes(netLower)) ||
      (canalKeyLower.length > 3 && chLower.includes(canalKeyLower))
    ) {
      return {
        id: ch.id,
        name: ch.name,
        category: ch.categoryKey,
        canalKey: ch.canalKey,
        url: ch.url,
      };
    }
  }

  // 2. Specific heuristics for common Brazilian sports broadcasts
  if (chLower.includes('premiere')) {
    const p = channelsList.find((c) => c.canalKey === 'premiereclubes') || channelsList[0];
    return { id: p.id, name: p.name, category: p.categoryKey, canalKey: p.canalKey, url: p.url };
  }
  if (chLower.includes('sportv 4') || chLower.includes('sportv4')) {
    const s = channelsList.find((c) => c.canalKey === 'sportv4');
    if (s) return { id: s.id, name: s.name, category: s.categoryKey, canalKey: s.canalKey, url: s.url };
  }
  if (chLower.includes('sportv 2') || chLower.includes('sportv2')) {
    const s = channelsList.find((c) => c.canalKey === 'sportv2');
    if (s) return { id: s.id, name: s.name, category: s.categoryKey, canalKey: s.canalKey, url: s.url };
  }
  if (chLower.includes('sportv 3') || chLower.includes('sportv3')) {
    const s = channelsList.find((c) => c.canalKey === 'sportv3');
    if (s) return { id: s.id, name: s.name, category: s.categoryKey, canalKey: s.canalKey, url: s.url };
  }
  if (chLower.includes('sportv')) {
    const s = channelsList.find((c) => c.canalKey === 'sportv1') || channelsList.find((c) => c.categoryKey === 'sportv');
    if (s) return { id: s.id, name: s.name, category: s.categoryKey, canalKey: s.canalKey, url: s.url };
  }
  if (chLower.includes('espn 2') || chLower.includes('espn2')) {
    const e = channelsList.find((c) => c.canalKey === 'espn2');
    if (e) return { id: e.id, name: e.name, category: e.categoryKey, canalKey: e.canalKey, url: e.url };
  }
  if (chLower.includes('espn 3') || chLower.includes('espn3')) {
    const e = channelsList.find((c) => c.canalKey === 'espn3');
    if (e) return { id: e.id, name: e.name, category: e.categoryKey, canalKey: e.canalKey, url: e.url };
  }
  if (chLower.includes('espn 4') || chLower.includes('espn4')) {
    const e = channelsList.find((c) => c.canalKey === 'espn4');
    if (e) return { id: e.id, name: e.name, category: e.categoryKey, canalKey: e.canalKey, url: e.url };
  }
  if (chLower.includes('espn 5') || chLower.includes('espn5')) {
    const e = channelsList.find((c) => c.canalKey === 'espn5');
    if (e) return { id: e.id, name: e.name, category: e.categoryKey, canalKey: e.canalKey, url: e.url };
  }
  if (chLower.includes('espn 6') || chLower.includes('espn6')) {
    const e = channelsList.find((c) => c.canalKey === 'espn6');
    if (e) return { id: e.id, name: e.name, category: e.categoryKey, canalKey: e.canalKey, url: e.url };
  }
  if (chLower.includes('espn')) {
    const e = channelsList.find((c) => c.canalKey === 'espn') || channelsList.find((c) => c.categoryKey === 'espn');
    if (e) return { id: e.id, name: e.name, category: e.categoryKey, canalKey: e.canalKey, url: e.url };
  }
  if (chLower.includes('cazé') || chLower.includes('caze')) {
    const c = channelsList.find((ch) => ch.categoryKey === 'cazetv');
    if (c) return { id: c.id, name: c.name, category: c.categoryKey, canalKey: c.canalKey, url: c.url };
  }
  if (chLower.includes('disney')) {
    const d = channelsList.find((ch) => ch.categoryKey === 'disney');
    if (d) return { id: d.id, name: d.name, category: d.categoryKey, canalKey: d.canalKey, url: d.url };
  }
  if (chLower.includes('max') || chLower.includes('hbo') || chLower.includes('tnt') || chLower.includes('space')) {
    const m = channelsList.find((ch) => ch.categoryKey === 'max');
    if (m) return { id: m.id, name: m.name, category: m.categoryKey, canalKey: m.canalKey, url: m.url };
  }
  if (chLower.includes('paramount')) {
    const p = channelsList.find((ch) => ch.categoryKey === 'paramount');
    if (p) return { id: p.id, name: p.name, category: p.categoryKey, canalKey: p.canalKey, url: p.url };
  }
  if (chLower.includes('prime video') || chLower.includes('primevideo') || chLower.includes('amazon prime')) {
    const p = channelsList.find((ch) => ch.categoryKey === 'primevideo');
    if (p) return { id: p.id, name: p.name, category: p.categoryKey, canalKey: p.canalKey, url: p.url };
  }
  if (chLower.includes('record')) {
    const r = channelsList.find((ch) => ch.canalKey === 'record');
    if (r) return { id: r.id, name: r.name, category: r.categoryKey, canalKey: r.canalKey, url: r.url };
  }
  if (chLower.includes('sbt')) {
    const s = channelsList.find((ch) => ch.canalKey === 'sbt');
    if (s) return { id: s.id, name: s.name, category: s.categoryKey, canalKey: s.canalKey, url: s.url };
  }
  if (chLower.includes('globo') || chLower.includes('tv globo')) {
    const g = channelsList.find((ch) => ch.canalKey === 'premiereclubes') || channelsList[0];
    return { id: g.id, name: 'PREMIERE / GLOBO', category: g.categoryKey, canalKey: g.canalKey, url: g.url };
  }
  if (chLower.includes('bandsports')) {
    const b = channelsList.find((ch) => ch.canalKey === 'bandsports');
    if (b) return { id: b.id, name: b.name, category: b.categoryKey, canalKey: b.canalKey, url: b.url };
  }

  return null;
}

export function getFallbackChannelsForCompetition(compName?: string, homeTeam?: string, awayTeam?: string): string {
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

// Client-side cache for 365Scores data and TV network details
const clientTvCache = new Map<number, TvNetworkItem[]>();
const clientScoresCache = new Map<string, { timestamp: number; data: ClientMatchesResponse }>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchDirect365Scores(
  dateInput?: string,
  onlyWithTv = true,
  customChannels: Channel[] = DEFAULT_CHANNELS
): Promise<ClientMatchesResponse> {
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
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } else {
    dateStr = dateInput;
  }

  const cacheKey = `${dateStr}_${onlyWithTv}`;
  const cached = clientScoresCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  const apiUrl = `https://webws.365scores.com/web/games/allscores/?appTypeId=5&langId=31&timezoneName=America/Sao_Paulo&userCountryId=21&sports=1&startDate=${encodeURIComponent(dateStr)}&endDate=${encodeURIComponent(dateStr)}&showOdds=true`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Erro 365Scores (${response.status})`);
  }

  const data = await response.json();
  const rawGames: any[] = data.games || [];
  const competitorsMap = new Map((data.competitors || []).map((c: any) => [c.id, c]));
  const competitionsMap = new Map((data.competitions || []).map((c: any) => [c.id, c]));

  // Format date label
  const parts = dateStr.split('/');
  let dateLabel = dateStr;
  if (parts.length === 3) {
    const parsedDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = days[parsedDate.getDay()];
    dateLabel = `${dayName} – ${parts[0]}/${parts[1]}`;
  }

  const targetGames = onlyWithTv ? rawGames.filter((g) => g.hasTVNetworks) : rawGames;

  // TV details fetching for first 25 games with 1.8s timeout
  const tvDetailsMap = new Map<number, TvNetworkItem[]>();
  const gamesNeedingFetch: any[] = [];

  for (const g of targetGames.filter((g) => g.hasTVNetworks)) {
    if (clientTvCache.has(g.id)) {
      tvDetailsMap.set(g.id, clientTvCache.get(g.id)!);
    } else {
      gamesNeedingFetch.push(g);
    }
  }

  if (gamesNeedingFetch.length > 0) {
    await Promise.allSettled(
      gamesNeedingFetch.slice(0, 25).map(async (g) => {
        try {
          const detailUrl = `https://webws.365scores.com/web/game/?gameId=${g.id}&langId=31&appTypeId=5&userCountryId=21&timezoneName=America/Sao_Paulo`;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1800);
          const detailRes = await fetch(detailUrl, { signal: controller.signal });
          clearTimeout(timer);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const nets = (detailData.game?.tvNetworks || []).map((n: any) => ({
              id: n.id,
              name: n.name,
              logoUrl: `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/TvNetworks/${n.id}`,
            }));
            tvDetailsMap.set(g.id, nets);
            clientTvCache.set(g.id, nets);
          }
        } catch {
          // Ignore individual fetch failure
        }
      })
    );
  }

  const matches: ClientMatchItem[] = [];

  for (const g of targetGames) {
    const home: any = competitorsMap.get(g.homeCompetitor?.id) || g.homeCompetitor || {};
    const away: any = competitorsMap.get(g.awayCompetitor?.id) || g.awayCompetitor || {};
    const comp: any = competitionsMap.get(g.competitionId) || {};

    const homeName = home.name || 'Mandante';
    const awayName = away.name || 'Visitante';
    const homeScore = typeof home.score === 'number' ? home.score : undefined;
    const awayScore = typeof away.score === 'number' ? away.score : undefined;

    let timeStr = 'A definir';
    if (g.startTime) {
      try {
        const dt = new Date(g.startTime);
        timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
      } catch {
        timeStr = g.startTime.slice(11, 16) || 'A definir';
      }
    }

    const homeLogo = home.id
      ? `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/Competitors/${home.id}`
      : null;
    const awayLogo = away.id
      ? `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/Competitors/${away.id}`
      : null;
    const compLogo = comp.id
      ? `https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_2/Competitions/${comp.id}`
      : null;

    const tvNetworks = tvDetailsMap.get(g.id) || [];
    let channelsRaw = tvNetworks.length > 0 ? tvNetworks.map((n) => n.name).join(', ') : '';
    if (!channelsRaw || channelsRaw === 'Transmissão a confirmar') {
      channelsRaw = getFallbackChannelsForCompetition(comp.name || g.competitionDisplayName, homeName, awayName);
    }

    const matchedChannel = matchChannelToApp(channelsRaw, customChannels);

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

  const result: ClientMatchesResponse = {
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

  clientScoresCache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

export async function fetchMatchesUnified(options: {
  forceRefresh?: boolean;
  sourceUrl?: string;
  date?: string;
  view?: 'tv' | 'all';
  clientDate?: string;
  customChannels?: Channel[];
}): Promise<ClientMatchesResponse> {
  const {
    forceRefresh = false,
    sourceUrl = 'https://www.365scores.com/pt-br/where-to-watch',
    date = 'today',
    view = 'tv',
    clientDate = '',
    customChannels = DEFAULT_CHANNELS,
  } = options;

  // Try backend proxy first if running with server
  const canTryBackend = typeof window !== 'undefined' && !window.location.hostname.endsWith('github.io');

  if (canTryBackend) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const url = `/api/jogos-hoje?sourceUrl=${encodeURIComponent(sourceUrl)}${
        forceRefresh ? '&refresh=true' : ''
      }&date=${encodeURIComponent(date)}&view=${view}&clientDate=${encodeURIComponent(clientDate)}&_t=${Date.now()}`;

      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.matches)) {
          return data;
        }
      }
    } catch {
      // Backend unavailable or timed out, will fall back to direct client fetching
    }
  }

  // Pure Client Fallback (perfect for GitHub Pages static hosting!)
  return await fetchDirect365Scores(date, view !== 'all', customChannels);
}
