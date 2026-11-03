export interface YouTubeChannelInfo {
  url: string;
  liveUrl: string;
  searchUrl: string;
  embedUrl: string | null; // ONLY set when a valid 11-char videoId is available; NEVER listType=search!
  name: string;
  handle?: string;
  isExactChannel: boolean;
  videoId?: string;
  hasDirectEmbed: boolean;
}

/**
 * Extracts a valid 11-character YouTube video ID from various input formats.
 * E.g.: fq06dIa0dNA, youtube.com/watch?v=fq06dIa0dNA, youtu.be/fq06dIa0dNA, youtube.com/embed/fq06dIa0dNA
 */
export function extractYouTubeVideoId(input?: string): string | null {
  if (!input) return null;
  const raw = input.trim();
  // Exact 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return raw;
  }
  const match = raw.match(/(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

/**
 * Builds a strict, high-compatibility YouTube embed URL for a given video ID.
 * Avoids deprecated listType=search which causes Error 153.
 */
export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

/**
 * Fallback to safely convert a URL or query into an embed URL ONLY if a real video ID exists.
 * If no video ID exists, returns null rather than creating a broken search embed.
 */
export function toYouTubeEmbedUrl(urlOrQuery: string): string | null {
  const videoId = extractYouTubeVideoId(urlOrQuery);
  return videoId ? buildYouTubeEmbedUrl(videoId) : null;
}

/**
 * Parses channel strings (from Mantos do Futebol or custom feeds) to detect YouTube broadcasts.
 */
export function extractYouTubeInfo(channelsStr?: string, confrontation?: string): YouTubeChannelInfo | null {
  if (!channelsStr) return null;
  const raw = channelsStr.trim();
  const lower = raw.toLowerCase();

  // 1. Direct video URL or embed in the text (e.g. youtube.com/watch?v=fq06dIa0dNA or embed/fq06dIa0dNA)
  const videoId = extractYouTubeVideoId(raw);
  if (videoId) {
    return {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      liveUrl: `https://www.youtube.com/watch?v=${videoId}`,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(confrontation || 'futebol')}`,
      embedUrl: buildYouTubeEmbedUrl(videoId),
      name: 'YouTube',
      isExactChannel: true,
      videoId,
      hasDirectEmbed: true,
    };
  }

  // 2. Explicit handle in text (e.g. "@canalgoatbr", "Youtube.com/@canalgoatbr", "@CazeTV")
  const handleMatch = raw.match(/@([A-Za-z0-9_.-]+)/);
  if (handleMatch) {
    const handle = handleMatch[1];
    let displayName = '@' + handle;
    const hLow = handle.toLowerCase();
    if (hLow.includes('cazetv') || hLow.includes('caze')) displayName = 'CazéTV';
    else if (hLow.includes('canalgoat') || hLow.includes('goat')) displayName = 'Canal Goat';
    else if (hLow.includes('jovempanesportes') || hLow.includes('jovempan')) displayName = 'Jovem Pan Esportes';
    else if (hLow.includes('canalgolbrasil') || hLow.includes('golbrasil')) displayName = 'Canal Gol Brasil';
    else if (hLow.includes('ulissescostatv') || hLow.includes('ulisses')) displayName = 'Ulisses Costa TV';
    else if (hLow.includes('sportynetbrasil') || hLow.includes('sportynet')) displayName = 'SportyNet Brasil';
    else if (hLow.includes('paulistao')) displayName = 'Paulistão';
    else if (hLow.includes('desimpedidos')) displayName = 'Desimpedidos';
    else if (hLow.includes('flatv')) displayName = 'Fla TV';
    else if (hLow.includes('santostv')) displayName = 'Santos TV';

    const searchTerms = confrontation ? `${confrontation} ${displayName} ao vivo` : `${displayName} ao vivo`;
    return {
      url: `https://www.youtube.com/@${handle}`,
      liveUrl: `https://www.youtube.com/@${handle}/live`,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null, // No static video ID - will be resolved dynamically or launched via channel
      name: displayName,
      handle: `@${handle}`,
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }

  // 3. Known YouTube broadcast channels mentioned by brand name
  if (lower.includes('cazé') || lower.includes('caze')) {
    const searchTerms = confrontation ? `${confrontation} CazéTV ao vivo` : 'CazéTV ao vivo';
    return {
      url: 'https://www.youtube.com/@CazeTV',
      liveUrl: 'https://www.youtube.com/@CazeTV/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'CazéTV',
      handle: '@CazeTV',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }
  if (lower.includes('canal goat') || (lower.includes('goat') && lower.includes('youtube'))) {
    const searchTerms = confrontation ? `${confrontation} Canal Goat ao vivo` : 'Canal Goat ao vivo';
    return {
      url: 'https://www.youtube.com/@canalgoatbr',
      liveUrl: 'https://www.youtube.com/@canalgoatbr/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'Canal Goat',
      handle: '@canalgoatbr',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }
  if (lower.includes('jovem pan')) {
    const searchTerms = confrontation ? `${confrontation} Jovem Pan Esportes ao vivo` : 'Jovem Pan Esportes ao vivo';
    return {
      url: 'https://www.youtube.com/@jovempanesportes',
      liveUrl: 'https://www.youtube.com/@jovempanesportes/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'Jovem Pan Esportes',
      handle: '@jovempanesportes',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }
  if (lower.includes('desimpedidos')) {
    const searchTerms = confrontation ? `${confrontation} Desimpedidos ao vivo` : 'Desimpedidos ao vivo';
    return {
      url: 'https://www.youtube.com/@desimpedidos',
      liveUrl: 'https://www.youtube.com/@desimpedidos/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'Desimpedidos',
      handle: '@desimpedidos',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }
  if (lower.includes('ulisses costa')) {
    const searchTerms = confrontation ? `${confrontation} Ulisses Costa TV ao vivo` : 'Ulisses Costa TV ao vivo';
    return {
      url: 'https://www.youtube.com/@UlissesCostaTV',
      liveUrl: 'https://www.youtube.com/@UlissesCostaTV/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'Ulisses Costa TV',
      handle: '@UlissesCostaTV',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }
  if (lower.includes('gol brasil')) {
    const searchTerms = confrontation ? `${confrontation} Canal Gol Brasil ao vivo` : 'Canal Gol Brasil ao vivo';
    return {
      url: 'https://www.youtube.com/@canalgolbrasil',
      liveUrl: 'https://www.youtube.com/@canalgolbrasil/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'Canal Gol Brasil',
      handle: '@canalgolbrasil',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }
  if (lower.includes('sportynet') && lower.includes('youtube')) {
    const searchTerms = confrontation ? `${confrontation} SportyNet Brasil ao vivo` : 'SportyNet Brasil ao vivo';
    return {
      url: 'https://www.youtube.com/@SportyNetBrasil',
      liveUrl: 'https://www.youtube.com/@SportyNetBrasil/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'SportyNet Brasil',
      handle: '@SportyNetBrasil',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }
  if (lower.includes('paulistao') || lower.includes('paulistão')) {
    const searchTerms = confrontation ? `${confrontation} Paulistão ao vivo` : 'Paulistão ao vivo';
    return {
      url: 'https://www.youtube.com/@paulistao',
      liveUrl: 'https://www.youtube.com/@paulistao/live',
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
      embedUrl: null,
      name: 'Paulistão',
      handle: '@paulistao',
      isExactChannel: true,
      hasDirectEmbed: false,
    };
  }

  // 4. Generic YouTube mention
  if (lower.includes('youtube') || lower.includes('you tube')) {
    const query = confrontation ? `${confrontation} ao vivo` : 'futebol ao vivo';
    return {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      liveUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      embedUrl: null,
      name: 'YouTube',
      isExactChannel: false,
      hasDirectEmbed: false,
    };
  }

  return null;
}
