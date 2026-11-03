import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Tv,
  Play,
  ExternalLink,
  Copy,
  Check,
  Search,
  Star,
  Code,
  Download,
  X,
  Radio,
  Maximize2,
  Minimize2,
  Share2,
  Users,
  Info,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Clock,
  Trophy,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  MonitorPlay,
  ArrowUpRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
} from 'lucide-react';
import { TeamBadge } from './services/teamLogos';
import {
  AppSettings,
  loadStoredSettings,
  saveStoredSettings,
  saveAsCustomDefault,
  resetToCustomDefault,
  resetToFactoryDefault,
} from './services/appSettings';
import { SettingsModal } from './components/SettingsModal';
import { extractYouTubeInfo } from './services/youtubeLinks';
import { Channel, DEFAULT_CHANNELS } from './data/channelsData';
import { fetchMatchesUnified } from './services/matchesFetcher';

export type { Channel };

export function YouTubeIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function getDeviceTodayDateLabel(): string {
  const now = new Date();
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dayName = days[now.getDay()];
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${dayName} – ${d}/${m}`;
}

export function getNetworkColor(networkName: string): { bg: string; text: string; hex: string } {
  const norm = (networkName || '').toLowerCase().trim();
  if (norm.includes('premiere')) return { bg: 'bg-emerald-600', text: 'text-emerald-400', hex: '#10b981' };
  if (norm.includes('sportv')) return { bg: 'bg-blue-600', text: 'text-blue-400', hex: '#2563eb' };
  if (norm.includes('espn')) return { bg: 'bg-red-600', text: 'text-red-400', hex: '#dc2626' };
  if (norm.includes('cazé') || norm.includes('caze')) return { bg: 'bg-amber-500', text: 'text-amber-300', hex: '#f59e0b' };
  if (norm.includes('disney') || norm.includes('star')) return { bg: 'bg-indigo-600', text: 'text-indigo-400', hex: '#4f46e5' };
  if (norm.includes('prime') || norm.includes('amazon')) return { bg: 'bg-sky-600', text: 'text-sky-400', hex: '#0284c7' };
  if (norm.includes('max') || norm.includes('hbo')) return { bg: 'bg-purple-600', text: 'text-purple-400', hex: '#9333ea' };
  if (norm.includes('paramount')) return { bg: 'bg-blue-700', text: 'text-blue-300', hex: '#0064ff' };
  if (norm.includes('record')) return { bg: 'bg-blue-600', text: 'text-blue-400', hex: '#2563eb' };
  if (norm.includes('sbt')) return { bg: 'bg-teal-600', text: 'text-teal-300', hex: '#059669' };
  if (norm.includes('goat')) return { bg: 'bg-yellow-500', text: 'text-yellow-300', hex: '#eab308' };
  if (norm.includes('globo')) return { bg: 'bg-orange-600', text: 'text-orange-400', hex: '#ea580c' };
  if (norm.includes('tnt') || norm.includes('space')) return { bg: 'bg-purple-600', text: 'text-purple-400', hex: '#9333ea' };
  if (norm.includes('band')) return { bg: 'bg-amber-600', text: 'text-amber-300', hex: '#d97706' };
  if (norm.includes('sportynet')) return { bg: 'bg-cyan-600', text: 'text-cyan-400', hex: '#0891b2' };
  if (norm.includes('aberta')) return { bg: 'bg-slate-700', text: 'text-slate-300', hex: '#475569' };
  const fallbackColors = [
    { bg: 'bg-rose-600', text: 'text-rose-400', hex: '#e11d48' },
    { bg: 'bg-violet-600', text: 'text-violet-400', hex: '#7c3aed' },
    { bg: 'bg-teal-600', text: 'text-teal-400', hex: '#0d9488' },
    { bg: 'bg-fuchsia-600', text: 'text-fuchsia-400', hex: '#c026d3' },
    { bg: 'bg-lime-600', text: 'text-lime-400', hex: '#65a30d' },
  ];
  let hash = 0;
  for (let i = 0; i < norm.length; i++) hash = norm.charCodeAt(i) + ((hash << 5) - hash);
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

export interface MatchItem {
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
  tvNetworksList?: { id: number; name: string; logoUrl?: string }[];
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

export interface MatchesResponse {
  updatedAt: string;
  source: string;
  sourceType?: string;
  dateLabel: string;
  dateFormatted?: string;
  totalMatches: number;
  availableMatchesCount: number;
  allGamesCount?: number;
  tvGamesCount?: number;
  matches: MatchItem[];
}

export const CHANNELS: Channel[] = DEFAULT_CHANNELS;

export default function App() {
  const [activeTab, setActiveTab] = useState<'guide' | 'video'>('guide');
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sports_video_favs');
      return saved ? JSON.parse(saved) : ['premiere-c', 'sportv-1', 'espn-1'];
    } catch {
      return ['premiere-c', 'sportv-1', 'espn-1'];
    }
  });

  // Matches State
  const [matchesData, setMatchesData] = useState<MatchesResponse | null>(null);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [matchFilter, setMatchFilter] = useState<'available' | 'all' | 'youtube' | 'brasileirao' | 'seriea' | 'copas'>('available');
  const [matchSearch, setMatchSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<'today' | 'yesterday' | 'tomorrow' | string>('today');
  const [matchesView, setMatchesView] = useState<'tv' | 'all'>('tv');

  const [copiedChannelId, setCopiedChannelId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [standaloneCode, setStandaloneCode] = useState<string>('');
  const [iframeKey, setIframeKey] = useState<number>(0);

  const playerRef = useRef<HTMLDivElement>(null);

  // Fetch standalone HTML from /canais.html for GitHub export
  useEffect(() => {
    fetch('/canais.html')
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => setStandaloneCode(text))
      .catch((err) => console.error('Erro ao carregar canais.html:', err));
  }, []);

  // User Personalization Settings State
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings(CHANNELS));
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [defaultSavedFeedback, setDefaultSavedFeedback] = useState<boolean>(false);

  const handleSetCurrentAsDefault = () => {
    saveAsCustomDefault(settings);
    setDefaultSavedFeedback(true);
    setTimeout(() => setDefaultSavedFeedback(false), 2500);
  };

  // Ensure current state is persisted as default baseline
  useEffect(() => {
    saveAsCustomDefault(settings);
  }, []);

  // Channels effectively available (customized by user or default)
  const effectiveChannels = useMemo(() => {
    return settings.channels && settings.channels.length > 0 ? settings.channels : CHANNELS;
  }, [settings.channels]);

  // Dynamically bake the freshest matches, channels, and brand into standalone index.html
  const compiledStandaloneHtml = useMemo(() => {
    if (!standaloneCode) return '';

    let updated = standaloneCode;

    if (matchesData && matchesData.matches && matchesData.matches.length > 0) {
      const simplifiedMatches = matchesData.matches.map((m) => ({
        time: m.time,
        confrontation: m.confrontation,
        championship: m.championship,
        channels: m.channelsRaw,
        homeLogo: m.homeLogo || null,
        awayLogo: m.awayLogo || null,
        matchedId: m.matchedChannel ? m.matchedChannel.id : null,
        matchedName: m.matchedChannel ? m.matchedChannel.name : null,
        available: m.isAvailableInApp,
      }));

      const matchesJson = JSON.stringify(simplifiedMatches);
      const dateJson = JSON.stringify(matchesData.dateLabel || 'Jogos de Hoje');

      updated = updated.replace(/const DEFAULT_DATE = .*?;/, `const DEFAULT_DATE = ${dateJson};`);
      updated = updated.replace(/const DEFAULT_MATCHES = \[[\s\S]*?\];/, `const DEFAULT_MATCHES = ${matchesJson};`);
      updated = updated.replace(
        /<div id="date-label"[^>]*>[\s\S]*?<\/div>/,
        `<div id="date-label" class="banner-sub" style="margin-top: 0;">Fonte 365Scores · ${matchesData.dateLabel || 'Jogos de Hoje'}</div>`
      );
    }

    // Bake customized channels into exported HTML
    const simplifiedChannels = effectiveChannels.map((c) => ({
      id: c.id,
      name: c.name,
      net: c.network,
      url: c.url,
    }));
    updated = updated.replace(/const channels = \[[\s\S]*?\];/, `const channels = ${JSON.stringify(simplifiedChannels, null, 2)};`);

    // Bake customized brand name into HTML title and header
    if (settings.brandName) {
      updated = updated.replace(/<title>.*?<\/title>/, `<title>${settings.brandName} - Guia de Jogos na TV & Player ao Vivo</title>`);
      updated = updated.replace(/<span>REDE ESPORTE<\/span>/g, `<span>${settings.brandName}</span>`);
    }

    // Bake customized app icon / favicon
    if (settings.appIconUrl && settings.appIconUrl.trim()) {
      const iconUrl = settings.appIconUrl.trim();
      if (updated.includes('<link rel="icon"')) {
        updated = updated.replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${iconUrl}" />`);
      } else {
        updated = updated.replace(/<head>/, `<head>\n  <link rel="icon" href="${iconUrl}" />`);
      }
    }

    // Bake customized badges template
    if (settings.teamBadgesSourceUrl && settings.teamBadgesSourceUrl.trim()) {
      const tmplJson = JSON.stringify(settings.teamBadgesSourceUrl.trim());
      updated = updated.replace(
        /let template = ['"].*?['"];/,
        `let template = ${tmplJson};`
      );
    }

    return updated;
  }, [standaloneCode, matchesData, effectiveChannels, settings.brandName, settings.appIconUrl, settings.teamBadgesSourceUrl]);

  // Fetch games of the day using unified fetcher (works on both local server and GitHub Pages!)
  const fetchMatches = async (
    forceRefresh = false,
    customSourceUrl?: string,
    dateOverride?: string,
    viewOverride?: 'tv' | 'all'
  ) => {
    try {
      setLoadingMatches(true);
      const targetSource = customSourceUrl || settings.sourceUrl;
      const targetDate = dateOverride !== undefined ? dateOverride : selectedDate;
      const targetView = viewOverride !== undefined ? viewOverride : matchesView;
      const deviceDate = getDeviceTodayDateLabel();

      const data = await fetchMatchesUnified({
        forceRefresh,
        sourceUrl: targetSource,
        date: targetDate,
        view: targetView,
        clientDate: deviceDate,
        customChannels: effectiveChannels,
      });

      setMatchesData(data as MatchesResponse);

      // Auto-switch to 'all' if the selected date has 0 available matches in app channels
      // but has games on 365Scores, preventing an empty view
      if (data.availableMatchesCount === 0 && data.totalMatches > 0) {
        setMatchFilter((prev) => (prev === 'available' ? 'all' : prev));
      }
    } catch (err) {
      console.error('Erro ao buscar jogos:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleDateChange = (date: 'today' | 'yesterday' | 'tomorrow' | string) => {
    setSelectedDate(date);
    fetchMatches(false, undefined, date, matchesView);
  };

  const handleViewChange = (view: 'tv' | 'all') => {
    setMatchesView(view);
    fetchMatches(false, undefined, selectedDate, view);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    if (!newSettings.channels.some((c) => c.id === activeChannel.id)) {
      setActiveChannel(newSettings.channels[0] || CHANNELS[0]);
    }
    if (newSettings.sourceUrl !== settings.sourceUrl) {
      fetchMatches(true, newSettings.sourceUrl);
    }
  };

  const handleResetSettings = (toFactory: boolean = false) => {
    const res = toFactory ? resetToFactoryDefault(CHANNELS) : resetToCustomDefault(CHANNELS);
    setSettings(res);
    setActiveChannel(res.channels[0] || CHANNELS[0]);
    fetchMatches(true, res.sourceUrl);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Dynamically update browser tab favicon and mobile shortcut icon
  useEffect(() => {
    if (settings.appIconUrl && settings.appIconUrl.trim()) {
      const url = settings.appIconUrl.trim();
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;

      let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = url;
    }
  }, [settings.appIconUrl]);

  // Toggle favorite
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sports_video_favs', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  // Copy link
  const handleCopy = (url: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedChannelId(id);
      setTimeout(() => setCopiedChannelId(null), 2000);
    });
  };

  // Direct server player launch
  const launchServerPlayerDirect = (channel: Channel, e?: React.MouseEvent) => {
    e?.stopPropagation();
    window.open(channel.url, '_blank', 'noopener,noreferrer');
  };

  // Switch channel
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setIframeKey((prev) => prev + 1);
    setActiveTab('video');
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Switch to match channel
  const handleWatchMatch = (match: MatchItem) => {
    if (match.matchedChannel) {
      const targetChannel = effectiveChannels.find((c) => c.id === match.matchedChannel?.id) || effectiveChannels[0];
      handleSelectChannel(targetChannel);
    }
  };

  // Reload player
  const handleReloadPlayer = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Unique networks list dynamically extracted from channels
  const uniqueNetworks = useMemo(() => {
    const list: string[] = [];
    effectiveChannels.forEach((ch) => {
      const net = (ch.network || 'Geral').trim();
      if (!list.some((existing) => existing.toLowerCase() === net.toLowerCase())) {
        list.push(net);
      }
    });
    return list;
  }, [effectiveChannels]);

  // Enhance matches with effectiveChannels (including any custom channels the user created or edited!)
  const enhancedMatches = useMemo(() => {
    if (!matchesData?.matches) return [];
    return matchesData.matches.map((m) => {
      if (m.matchedChannel) return m;

      const rawLower = m.channelsRaw.toLowerCase();
      const foundChannel = effectiveChannels.find((ch) => {
        const nameLower = ch.name.toLowerCase();
        const netLower = ch.network.toLowerCase();
        return rawLower.includes(nameLower) || rawLower.includes(netLower);
      });

      if (foundChannel) {
        return {
          ...m,
          matchedChannel: {
            id: foundChannel.id,
            name: foundChannel.name,
            category: foundChannel.categoryKey,
            canalKey: foundChannel.canalKey,
            url: foundChannel.url,
          },
          isAvailableInApp: true,
        };
      }
      return m;
    });
  }, [matchesData, effectiveChannels]);

  // Filter channels for sidebar
  const filteredChannels = useMemo(() => {
    return effectiveChannels.filter((ch) => {
      if (selectedNetwork === 'favorites') {
        if (!favorites.includes(ch.id)) return false;
      } else if (selectedNetwork !== 'all') {
        const netLower = (ch.network || '').toLowerCase().trim();
        const catLower = (ch.categoryKey || '').toLowerCase().trim();
        const target = selectedNetwork.toLowerCase().trim();
        if (netLower !== target && catLower !== target) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          ch.name.toLowerCase().includes(q) ||
          ch.network.toLowerCase().includes(q) ||
          ch.tagline.toLowerCase().includes(q) ||
          ch.nowPlaying.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [effectiveChannels, selectedNetwork, searchQuery, favorites]);

  // Total YouTube matches count
  const youtubeMatchesCount = useMemo(() => {
    return enhancedMatches.filter((m) => Boolean(extractYouTubeInfo(m.channelsRaw, m.confrontation))).length;
  }, [enhancedMatches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return enhancedMatches.filter((m) => {
      // Category filter
      if (matchFilter === 'available' && !m.isAvailableInApp) return false;
      if (matchFilter === 'youtube' && !extractYouTubeInfo(m.channelsRaw, m.confrontation)) return false;
      if (matchFilter === 'brasileirao' && !m.championship.toLowerCase().includes('brasileir')) return false;
      if (matchFilter === 'seriea' && !m.championship.toLowerCase().includes('serie a')) return false;
      if (
        matchFilter === 'copas' &&
        !m.championship.toLowerCase().includes('copa') &&
        !m.championship.toLowerCase().includes('libertadores')
      )
        return false;

      // Text search
      if (matchSearch.trim()) {
        const q = matchSearch.toLowerCase().trim();
        return (
          m.confrontation.toLowerCase().includes(q) ||
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.championship.toLowerCase().includes(q) ||
          m.channelsRaw.toLowerCase().includes(q) ||
          m.time.includes(q)
        );
      }

      return true;
    });
  }, [enhancedMatches, matchFilter, matchSearch]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Bar: Brand — Nav Links — Actions */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('guide');
                setMatchFilter('available');
                setMatchSearch('');
              }}
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
            >
              {settings.logoType === 'custom_image' && settings.customLogoUrl ? (
                <img
                  src={settings.customLogoUrl}
                  alt={settings.brandName}
                  className="w-8 h-8 rounded-lg object-contain bg-black/40 p-0.5 border border-white/10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${
                    settings.themeColor === 'emerald'
                      ? 'bg-emerald-600 shadow-emerald-600/30'
                      : settings.themeColor === 'blue'
                      ? 'bg-blue-600 shadow-blue-600/30'
                      : settings.themeColor === 'purple'
                      ? 'bg-purple-600 shadow-purple-600/30'
                      : settings.themeColor === 'amber'
                      ? 'bg-amber-500 shadow-amber-500/30'
                      : 'bg-red-600 shadow-red-600/30'
                  }`}
                >
                  {settings.logoIcon === 'fire' ? (
                    <Flame className="w-4 h-4 fill-white" />
                  ) : settings.logoIcon === 'tv' ? (
                    <Tv className="w-4 h-4" />
                  ) : settings.logoIcon === 'trophy' ? (
                    <Trophy className="w-4 h-4" />
                  ) : settings.logoIcon === 'sparkles' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </div>
              )}
              <span className="font-extrabold tracking-tight">{settings.brandName}</span>
            </a>
          </div>

          {/* Navigation Mode Switcher: Jogos do Dia (Principal) vs Player & Canais */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('guide')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Jogos do Dia</span>
              {matchesData && (
                <span className="bg-red-950 text-red-300 border border-red-800/60 text-[10px] px-1.5 rounded-full font-mono">
                  {matchesData.availableMatchesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Player & Canais</span>
            </button>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSetCurrentAsDefault}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                defaultSavedFeedback
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/40 ring-1 ring-emerald-400'
                  : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
              }`}
              title="Fixa todas as configurações, canais e fontes atuais como o padrão definitivo do portal"
            >
              {defaultSavedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Padrão Salvo!</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Definir como Padrão</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Abrir Painel de Personalização"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Personalizar</span>
            </button>
            <button
              onClick={() => launchServerPlayerDirect(activeChannel)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm shadow-red-600/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Servidor</span>
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-red-400" />
              <span>index.html</span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: GUIA DE JOGOS DO DIA (MANTOS DO FUTEBOL) */}
      {activeTab === 'guide' && (
        <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Guide Header Banner */}
          <div className="bg-[#0f1420] border border-white/5 rounded-2xl p-5 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 flex-wrap">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Programação Oficial
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Fonte: 365Scores Onde Assistir
                  </span>
                  <span>·</span>
                  <span className="font-bold text-slate-200">{matchesData?.dateLabel || 'Jogos de Hoje'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span>Onde Assistir Futebol na TV</span>
                  <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase">
                    AO VIVO
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                  Agenda completa com escudos oficiais dos clubes, campeonatos e canais de transmissão (TV e Streaming) direto do 365Scores.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={() => fetchMatches(true)}
                  disabled={loadingMatches}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  title="Atualizar dados diretamente do 365Scores"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMatches ? 'animate-spin' : ''}`} />
                  <span>Atualizar Grade</span>
                </button>
                <a
                  href="https://www.365scores.com/pt-br/where-to-watch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>365Scores ↗</span>
                </a>
              </div>
            </div>

            {/* Date Switcher & View Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleDateChange('yesterday')}
                  disabled={loadingMatches}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedDate === 'yesterday'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {loadingMatches && selectedDate === 'yesterday' && (
                    <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                  )}
                  <span>Ontem</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDateChange('today')}
                  disabled={loadingMatches}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedDate === 'today'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {loadingMatches && selectedDate === 'today' && (
                    <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                  )}
                  <span>Hoje</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDateChange('tomorrow')}
                  disabled={loadingMatches}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedDate === 'tomorrow'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {loadingMatches && selectedDate === 'tomorrow' && (
                    <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                  )}
                  <span>Amanhã</span>
                </button>
              </div>

              <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleViewChange('tv')}
                  disabled={loadingMatches}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    matchesView === 'tv'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Apenas jogos com canal de TV ou Streaming definido"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Onde Assistir (Na TV)</span>
                  {matchesData?.tvGamesCount !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 bg-black/40 rounded text-[10px]">
                      {matchesData.tvGamesCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange('all')}
                  disabled={loadingMatches}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    matchesView === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Todos os jogos e campeonatos do dia"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Todos os Jogos</span>
                  {matchesData?.allGamesCount !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 bg-black/40 rounded text-[10px]">
                      {matchesData.allGamesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Channels Bar on Main Guide Page */}
          <div className="mb-6 flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold text-xs whitespace-nowrap hidden sm:inline">
              Assistir direto nos canais ao vivo:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'premiere') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Premiere ({effectiveChannels.filter((c) => c.categoryKey === 'premiere').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'sportv') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/50 text-blue-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>SporTV ({effectiveChannels.filter((c) => c.categoryKey === 'sportv').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'espn') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-800/50 text-red-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>ESPN ({effectiveChannels.filter((c) => c.categoryKey === 'espn').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'cazetv') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/50 border border-amber-800/50 text-amber-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>CazéTV ({effectiveChannels.filter((c) => c.categoryKey === 'cazetv').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'disney') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/50 text-indigo-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Disney+ ({effectiveChannels.filter((c) => c.categoryKey === 'disney').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'max') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/50 text-purple-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>HBO Max ({effectiveChannels.filter((c) => c.categoryKey === 'max').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'primevideo') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/50 hover:bg-sky-900/50 border border-sky-800/50 text-sky-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Prime Video ({effectiveChannels.filter((c) => c.categoryKey === 'primevideo').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'paramount') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/50 text-cyan-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Paramount+ ({effectiveChannels.filter((c) => c.categoryKey === 'paramount').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'sportynet') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/50 hover:bg-teal-900/50 border border-teal-800/50 text-teal-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Sportynet ({effectiveChannels.filter((c) => c.categoryKey === 'sportynet').length})</span>
              </button>
              <button
                onClick={() => {
                  const ch = effectiveChannels.find((c) => c.categoryKey === 'bandsports') || effectiveChannels[0];
                  handleSelectChannel(ch);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/50 border border-amber-800/50 text-amber-300 font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>BandSports</span>
              </button>
            </div>
          </div>

          {/* Filter Bar & Search for Matches */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl text-xs">
              <button
                onClick={() => setMatchFilter('available')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  matchFilter === 'available'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Canais do Portal ({matchesData?.availableMatchesCount || 0})
              </button>
              <button
                onClick={() => setMatchFilter('youtube')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  matchFilter === 'youtube'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <YouTubeIcon className="w-3.5 h-3.5 fill-red-500" />
                <span>No YouTube ({youtubeMatchesCount})</span>
              </button>
              <button
                onClick={() => setMatchFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  matchFilter === 'all'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos os Jogos ({matchesData?.totalMatches || 0})
              </button>
              <button
                onClick={() => setMatchFilter('brasileirao')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  matchFilter === 'brasileirao'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Brasileirão
              </button>
              <button
                onClick={() => setMatchFilter('seriea')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  matchFilter === 'seriea'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Serie A Italiana
              </button>
              <button
                onClick={() => setMatchFilter('copas')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  matchFilter === 'copas'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Copas & Ligas
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={matchSearch}
                onChange={(e) => setMatchSearch(e.target.value)}
                placeholder="Buscar time, campeonato ou canal..."
                className="w-full bg-[#0f1420] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              {matchSearch && (
                <button
                  onClick={() => setMatchSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Matches Grid */}
          {loadingMatches ? (
            <div className="py-20 text-center bg-[#0f1420] border border-white/5 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Carregando partidas de {selectedDate === 'yesterday' ? 'Ontem' : selectedDate === 'tomorrow' ? 'Amanhã' : 'Hoje'}...</p>
              <p className="text-xs text-slate-400 mt-1">Conectando ao 365Scores Onde Assistir</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="py-20 text-center bg-[#0f1420] border border-white/5 rounded-2xl">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Nenhum jogo encontrado com este filtro</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {matchesData?.totalMatches
                  ? `Existem ${matchesData.totalMatches} jogos nesta data no 365Scores. Clique abaixo para ver todos!`
                  : 'Nenhum jogo com transmissão encontrado para esta data.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMatchFilter('all');
                  setMatchSearch('');
                }}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Ver Todos os Jogos ({matchesData?.totalMatches || 0})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className={`bg-[#0f1420] border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                    match.isAvailableInApp
                      ? 'border-white/10 hover:border-red-500/50'
                      : 'border-white/5 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div>
                    {/* Header: Time, Status & Tournament */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-black text-white bg-black/60 border border-white/10 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3 h-3 text-red-500" />
                          <span>{match.time}</span>
                        </span>

                        {match.statusText && (
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                              match.statusText.toLowerCase().includes('ao vivo') || match.statusGroup === 3
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 animate-pulse'
                                : match.statusText.toLowerCase().includes('fim') || match.statusGroup === 4
                                ? 'bg-slate-800/80 text-slate-300 border-white/10'
                                : 'bg-black/50 text-slate-400 border-white/10'
                            }`}
                          >
                            {match.statusText}
                          </span>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-1.5 truncate max-w-[190px]"
                        title={match.championship}
                      >
                        {match.competitionLogo && (
                          <img
                            src={match.competitionLogo}
                            alt=""
                            className="w-4 h-4 object-contain shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-[11px] font-bold text-slate-400 truncate">
                          {match.championship}
                        </span>
                      </div>
                    </div>

                    {/* Confrontation with 365Scores Official Badges & Scores */}
                    <div className="my-2.5 p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-2.5">
                      {/* Home Team */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <TeamBadge
                          name={match.homeTeam}
                          directLogoUrl={match.homeLogo}
                          size="md"
                          customSourceTemplate={settings.teamBadgesSourceUrl}
                        />
                        <span className="text-xs sm:text-sm font-black text-white truncate" title={match.homeTeam}>
                          {match.homeTeam}
                        </span>
                        {match.homeScore !== undefined && (
                          <span className="ml-auto text-sm font-black text-amber-300 font-mono px-1.5 py-0.5 rounded bg-black/60 border border-white/10 shrink-0">
                            {match.homeScore}
                          </span>
                        )}
                      </div>

                      {/* VS / Score Divider Badge */}
                      <div className="px-2 py-0.5 rounded-md bg-red-950/60 border border-red-500/30 text-[10px] font-black text-red-400 shrink-0 select-none shadow-sm">
                        {match.homeScore !== undefined && match.awayScore !== undefined ? 'X' : 'VS'}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
                        {match.awayScore !== undefined && (
                          <span className="mr-auto text-sm font-black text-amber-300 font-mono px-1.5 py-0.5 rounded bg-black/60 border border-white/10 shrink-0">
                            {match.awayScore}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-black text-white truncate" title={match.awayTeam}>
                          {match.awayTeam || 'A definir'}
                        </span>
                        {match.awayTeam && (
                          <TeamBadge
                            name={match.awayTeam}
                            directLogoUrl={match.awayLogo}
                            size="md"
                            customSourceTemplate={settings.teamBadgesSourceUrl}
                          />
                        )}
                      </div>
                    </div>

                    {/* Broadcast Channels (Where to watch with official channel logos) */}
                    <div className="mt-2 text-xs text-slate-400">
                      <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Onde Assistir:</span>
                        {match.tvNetworksList && match.tvNetworksList.length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-medium font-mono">
                            {match.tvNetworksList.length} canais
                          </span>
                        )}
                      </span>
                      <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                        {match.tvNetworksList && match.tvNetworksList.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {match.tvNetworksList.map((net) => (
                              <span
                                key={net.id}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[11px] font-bold text-slate-200"
                              >
                                {net.logoUrl && (
                                  <img
                                    src={net.logoUrl}
                                    alt=""
                                    className="w-3.5 h-3.5 object-contain"
                                    loading="lazy"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                <span>{net.name}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-200 font-medium leading-relaxed">
                            {match.channelsRaw}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button: Tune into Channel or YouTube or Info */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
                    {(() => {
                      const yt = extractYouTubeInfo(match.channelsRaw, match.confrontation);
                      if (match.isAvailableInApp && match.matchedChannel) {
                        return (
                          <>
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Disponível no Portal</span>
                            </span>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleWatchMatch(match)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm shadow-red-600/30 transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Assistir ({match.matchedChannel.name})</span>
                              </button>

                              {yt && (
                                <a
                                  href={yt.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-red-950/70 hover:bg-red-600 border border-red-500/40 rounded-lg transition-all cursor-pointer"
                                  title={`Assistir no YouTube (${yt.name})`}
                                >
                                  <YouTubeIcon className="w-3.5 h-3.5 fill-red-400 group-hover:fill-white" />
                                  <span>{yt.name} ↗</span>
                                </a>
                              )}
                            </div>
                          </>
                        );
                      } else if (yt) {
                        return (
                          <>
                            <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span>Ao Vivo no YouTube</span>
                            </span>

                            <a
                              href={yt.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 border border-red-500/40 rounded-lg shadow-sm shadow-red-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                            >
                              <YouTubeIcon className="w-3.5 h-3.5 fill-current" />
                              <span>Assistir no {yt.name} ↗</span>
                            </a>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <span className="text-[11px] text-slate-500">Transmissão Externa / Streaming</span>
                            <a
                              href="https://mantosdofutebol.com.br/guia-de-jogos-tv-hoje-ao-vivo/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Mais detalhes</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* VIEW 2: VIDEO PLATFORM & LIVE CHANNELS */}
      {activeTab === 'video' && (
        <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Quick Notice Banner with Today's Matches highlight */}
          {matchesData && matchesData.availableMatchesCount > 0 && (
            <div className="mb-6 bg-gradient-to-r from-red-950/60 via-[#0f1420] to-[#0f1420] border border-red-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-600/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Guia Mantos do Futebol · {matchesData.dateLabel}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      · {matchesData.availableMatchesCount} jogos nos seus canais
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Jogos de hoje na TV com transmissão nos canais Premiere, SporTV, ESPN e Sportynet
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('guide')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow transition-colors cursor-pointer"
                >
                  <span>Abrir Guia de Jogos Completo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div
            className={`grid gap-6 transition-all duration-300 ${
              isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
            }`}
          >
            {/* LEFT/CENTER: VIDEO PLAYER & CHANNEL DETAILS */}
            <div
              ref={playerRef}
              className={`space-y-4 ${isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-9'}`}
            >
              {/* The Main Video Player Frame */}
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <iframe
                  key={iframeKey}
                  src={activeChannel.url}
                  title={`Player do Servidor - ${activeChannel.name}`}
                  className="w-full h-full border-0 absolute inset-0 z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />

                {/* Floating Quick Action Overlay on Player */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleReloadPlayer}
                    className="px-2.5 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-medium rounded-lg border border-white/15 transition-colors backdrop-blur-md flex items-center gap-1 cursor-pointer shadow-lg"
                    title="Recarregar sinal do servidor"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Recarregar</span>
                  </button>

                  <button
                    onClick={() => launchServerPlayerDirect(activeChannel)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Abrir o player oficial do servidor diretamente"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Player do Servidor</span>
                  </button>

                  <button
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className="p-1.5 bg-black/80 hover:bg-black text-white rounded-lg border border-white/15 transition-colors backdrop-blur-md cursor-pointer shadow-lg hidden md:inline-flex"
                    title={isTheaterMode ? 'Sair do Modo Cinema' : 'Modo Cinema'}
                  >
                    {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Top-Left Channel Status */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-lg pointer-events-none">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-black tracking-wider text-white">
                    AO VIVO · {activeChannel.name}
                  </span>
                </div>
              </div>

              {/* Video Title and Action Bar */}
              <div className="bg-[#0f1420] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                      <span
                        className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded"
                        style={{ backgroundColor: activeChannel.brandColor }}
                      >
                        {activeChannel.network}
                      </span>
                      <span>·</span>
                      <span className="text-slate-300 font-medium">{activeChannel.numberLabel}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <MonitorPlay className="w-3.5 h-3.5" /> Player 3 RedeCanais
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-red-400 font-semibold">
                        <Users className="w-3.5 h-3.5" /> {activeChannel.viewers} assistindo
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {activeChannel.name}: {activeChannel.nowPlaying}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {activeChannel.description}
                    </p>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex items-center flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => launchServerPlayerDirect(activeChannel)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Abrir Player do Servidor</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    <button
                      onClick={(e) => toggleFavorite(activeChannel.id, e)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                        favorites.includes(activeChannel.id)
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          favorites.includes(activeChannel.id) ? 'fill-current' : ''
                        }`}
                      />
                      <span>{favorites.includes(activeChannel.id) ? 'Favorito' : 'Salvar'}</span>
                    </button>

                    <button
                      onClick={(e) => handleCopy(activeChannel.url, activeChannel.id, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-colors cursor-pointer"
                      title="Copiar URL exata do player no servidor"
                    >
                      {copiedChannelId === activeChannel.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Link Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-colors cursor-pointer hidden md:inline-flex"
                      title={isTheaterMode ? 'Modo Normal' : 'Modo Cinema'}
                    >
                      {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Informative server status box */}
                <div className="pt-3 border-t border-white/5 bg-black/20 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-200 font-semibold">URL no servidor:</span>{' '}
                      <a
                        href={activeChannel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-400 hover:underline break-all"
                      >
                        {activeChannel.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => launchServerPlayerDirect(activeChannel)}
                      className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                    >
                      Abrir em Janela Dedicada &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Shelves dynamically grouped by Network */}
              <div className="pt-6 space-y-8">
                {uniqueNetworks.map((net) => {
                  const shelfChannels = effectiveChannels.filter(
                    (c) => (c.network || '').toLowerCase().trim() === net.toLowerCase().trim()
                  );
                  if (shelfChannels.length === 0) return null;
                  const color = getNetworkColor(net);
                  return (
                    <ChannelShelf
                      key={net}
                      title={`Canais ${net}`}
                      badgeText={net.toUpperCase()}
                      badgeColor={color.bg}
                      channels={shelfChannels}
                      activeChannelId={activeChannel.id}
                      onSelectChannel={handleSelectChannel}
                      onOpenServer={launchServerPlayerDirect}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={(id) => favorites.includes(id)}
                    />
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDEBAR: "TRANSMITINDO AGORA" PLAYLIST */}
            <div
              className={`space-y-4 ${
                isTheaterMode ? 'lg:col-span-12 mt-4' : 'lg:col-span-4 xl:col-span-3'
              }`}
            >
              <div className="bg-[#0f1420] border border-white/5 rounded-2xl p-4 sticky top-20 flex flex-col max-h-[calc(100vh-6rem)]">
                {/* Sidebar Header */}
                <div className="pb-3 border-b border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-red-500" />
                      <h2 className="font-extrabold text-sm text-white tracking-wide uppercase">
                        Player dos Canais
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                      {filteredChannels.length} canais
                    </span>
                  </div>

                  {/* Quick Search */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar por canal..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
                    <button
                      onClick={() => setSelectedNetwork('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedNetwork === 'all'
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      Todos
                    </button>
                    {uniqueNetworks.map((net) => {
                      const color = getNetworkColor(net);
                      const isSel = selectedNetwork.toLowerCase() === net.toLowerCase();
                      return (
                        <button
                          key={net}
                          onClick={() => setSelectedNetwork(net.toLowerCase())}
                          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                            isSel ? `${color.bg} text-white font-bold` : 'text-slate-400 hover:text-white bg-white/5'
                          }`}
                        >
                          {net}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setSelectedNetwork('favorites')}
                      className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                        selectedNetwork === 'favorites'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'text-slate-400 hover:text-white bg-white/5'
                      }`}
                      title="Meus Favoritos"
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Channels List */}
                <div
                  className={`overflow-y-auto space-y-2.5 pt-3 pr-1 flex-1 ${
                    isTheaterMode ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 space-y-0' : ''
                  }`}
                >
                  {filteredChannels.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Nenhum canal encontrado.
                    </div>
                  ) : (
                    filteredChannels.map((channel) => {
                      const isSelected = channel.id === activeChannel.id;
                      const isFav = favorites.includes(channel.id);

                      return (
                        <div
                          key={channel.id}
                          className={`group relative p-2.5 rounded-xl border transition-all flex flex-col gap-2 ${
                            isSelected
                              ? 'bg-red-950/30 border-red-500/50 shadow-md shadow-red-900/20'
                              : 'bg-black/30 border-white/5 hover:border-white/15 hover:bg-white/5'
                          }`}
                        >
                          <div
                            onClick={() => handleSelectChannel(channel)}
                            className="flex gap-3 cursor-pointer"
                          >
                            <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-white/10 flex items-center justify-center">
                              <div
                                className="absolute inset-0 opacity-40 bg-gradient-to-tr"
                                style={{
                                  backgroundImage: `linear-gradient(to top right, ${channel.brandColor}33, #020617)`,
                                }}
                              />
                              <div className="relative z-10 text-center px-1">
                                <span className="text-[11px] font-black tracking-tight text-white block">
                                  {channel.name}
                                </span>
                                <span className="text-[9px] text-slate-400 block font-medium">
                                  {channel.numberLabel}
                                </span>
                              </div>

                              {isSelected ? (
                                <div className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                  <span>NO AR</span>
                                </div>
                              ) : (
                                <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-slate-300 font-bold px-1 rounded">
                                  AO VIVO
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className="text-[10px] font-bold uppercase truncate"
                                    style={{ color: channel.brandColor }}
                                  >
                                    {channel.network}
                                  </span>
                                  <button
                                    onClick={(e) => toggleFavorite(channel.id, e)}
                                    className={`text-slate-500 hover:text-amber-400 p-0.5 ${
                                      isFav ? 'text-amber-400' : ''
                                    }`}
                                  >
                                    <Star className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                                  </button>
                                </div>
                                <h3
                                  className={`text-xs font-bold truncate ${
                                    isSelected ? 'text-red-400' : 'text-white'
                                  }`}
                                >
                                  {channel.name}
                                </h3>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {channel.nowPlaying}
                                </p>
                              </div>

                              <div className="text-[10px] text-slate-500">
                                <span>{channel.viewers} esp.</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                            <button
                              onClick={() => handleSelectChannel(channel)}
                              className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3 text-red-500 fill-current" />
                              <span>Carregar</span>
                            </button>

                            <button
                              onClick={() => launchServerPlayerDirect(channel)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/40 px-2 py-0.5 rounded border border-red-800/40 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Abrir no Servidor</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* HTML Export / Standalone Viewer Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#0f1420] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-red-500" />
                  Código do index.html com Player do Servidor
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estrutura HTML5 com os links diretos para o servidor player3 e visual de vídeos.
                </p>
              </div>

              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GitHub Pages Tip */}
            <div className="px-6 py-2.5 bg-emerald-950/30 border-b border-emerald-500/20 flex items-start gap-2.5 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold text-sm shrink-0">✓</span>
              <div>
                <strong className="text-emerald-300">Pronto para GitHub Pages sem erros:</strong> Os{' '}
                <span className="text-white font-bold">{matchesData?.totalMatches || 56} jogos do dia</span> já estão
                embutidos diretamente dentro deste arquivo <code className="text-emerald-400 font-mono">index.html</code>.
                Mesmo sem servidor Node.js ou se proxies falharem, a grade carrega imediatamente na tela!
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#07090e] font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="whitespace-pre-wrap select-all">{compiledStandaloneHtml || 'Carregando código index.html...'}</pre>
            </div>

            <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-slate-400">
                Arquivo 100% autônomo com Jogos do Dia e Player pronto para o <strong>GitHub Pages</strong>.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(compiledStandaloneHtml).then(() => {
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([compiledStandaloneHtml], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'index.html';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm shadow-red-600/30 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo index.html</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings / Personalization Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
        onRefreshMatchesWithSource={(url) => fetchMatches(true, url)}
        defaultChannels={CHANNELS}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 bg-[#05070a] py-8">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">{settings.brandName}</span>
            <span>·</span>
            <span>{settings.brandSubtitle}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('guide')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Guia de Jogos na TV
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Personalizar App</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Exportar index.html
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponent: Video Shelf
function ChannelShelf({
  title,
  badgeText,
  badgeColor,
  channels,
  activeChannelId,
  onSelectChannel,
  onOpenServer,
  onToggleFavorite,
  isFavorite,
}: {
  title: string;
  badgeText: string;
  badgeColor: string;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (channel: Channel) => void;
  onOpenServer: (channel: Channel, e?: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  isFavorite: (id: string) => boolean;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[10px] font-black uppercase tracking-wider text-white px-2 py-0.5 rounded ${badgeColor}`}
          >
            {badgeText}
          </span>
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
        </div>
        <span className="text-xs text-slate-500">{channels.length} canais</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {channels.map((channel) => {
          const isSelected = channel.id === activeChannelId;
          const fav = isFavorite(channel.id);

          return (
            <div
              key={channel.id}
              className={`group bg-[#0f1420] border rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                isSelected
                  ? 'border-red-500 shadow-md shadow-red-950/40 bg-red-950/10'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div
                onClick={() => onSelectChannel(channel)}
                className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <div
                  className="absolute inset-0 opacity-40 bg-gradient-to-tr"
                  style={{
                    backgroundImage: `linear-gradient(to top right, ${channel.brandColor}44, #020617)`,
                  }}
                />

                <div className="relative z-10 text-center px-4">
                  <div className="text-base font-black text-white tracking-wide">
                    {channel.name}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">{channel.numberLabel}</div>
                </div>

                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span>AO VIVO</span>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-slate-300 font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                  {channel.viewers}
                </div>

                <div className="absolute inset-0 bg-red-600/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color: channel.brandColor }}
                    >
                      {channel.network}
                    </span>
                    <button
                      onClick={(e) => onToggleFavorite(channel.id, e)}
                      className={`text-slate-500 hover:text-amber-400 transition-colors ${
                        fav ? 'text-amber-400' : ''
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h3
                    onClick={() => onSelectChannel(channel)}
                    className={`text-sm font-bold truncate cursor-pointer ${
                      isSelected ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {channel.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {channel.nowPlaying}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectChannel(channel)}
                    className="text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    Assistir Aqui
                  </button>
                  <button
                    onClick={(e) => onOpenServer(channel, e)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-white bg-red-950/60 hover:bg-red-600 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>No Servidor</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

