import { Channel, DEFAULT_CHANNELS } from '../data/channelsData';

export const DEFAULT_TEAM_BADGES_SOURCE = 'https://bolarolando.org/escudos/{slug}.webp';

export interface AppSettings {
  brandName: string;
  brandSubtitle: string;
  logoType: 'icon' | 'custom_image';
  logoIcon: 'play' | 'fire' | 'tv' | 'trophy' | 'sparkles';
  customLogoUrl: string;
  appIconUrl: string; // Favicon & browser shortcut icon URL
  teamBadgesSourceUrl: string; // URL template for team badges ({slug} or {name})
  themeColor: 'red' | 'emerald' | 'blue' | 'purple' | 'amber';
  channels: Channel[];
  sourceUrl: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  brandName: 'REDE ESPORTE',
  brandSubtitle: 'Guia de Jogos na TV & Player ao Vivo',
  logoType: 'icon',
  logoIcon: 'play',
  customLogoUrl: '',
  appIconUrl: '',
  teamBadgesSourceUrl: DEFAULT_TEAM_BADGES_SOURCE,
  themeColor: 'red',
  channels: DEFAULT_CHANNELS,
  sourceUrl: 'https://www.365scores.com/pt-br/where-to-watch',
};

const SETTINGS_STORAGE_KEY = 'portal_esportes_custom_settings_v3';
const CUSTOM_DEFAULT_STORAGE_KEY = 'portal_esportes_user_default_v3';
const CUSTOM_DEFAULT_META_KEY = 'portal_esportes_user_default_meta_v3';

export function getCustomDefaultMeta(): { hasDefault: boolean; savedAt?: string } {
  try {
    const raw = localStorage.getItem(CUSTOM_DEFAULT_META_KEY);
    if (!raw) return { hasDefault: false };
    const meta = JSON.parse(raw);
    return {
      hasDefault: true,
      savedAt: meta.savedAt || '',
    };
  } catch {
    return { hasDefault: false };
  }
}

export function saveAsCustomDefault(settings: AppSettings): { success: boolean; savedAt: string } {
  try {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    
    // Save both as current active and as the permanent custom default
    localStorage.setItem(CUSTOM_DEFAULT_STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem(
      CUSTOM_DEFAULT_META_KEY,
      JSON.stringify({
        savedAt: formattedDate,
        channelsCount: settings.channels.length,
        brandName: settings.brandName,
      })
    );
    return { success: true, savedAt: formattedDate };
  } catch (err) {
    console.error('Erro ao definir estado atual como padrão:', err);
    return { success: false, savedAt: '' };
  }
}

export function loadStoredSettings(defaultChannels: Channel[]): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const customDefaultRaw = localStorage.getItem(CUSTOM_DEFAULT_STORAGE_KEY);
    
    // Use saved active settings, or fallback to saved custom default, or factory default
    const sourceRaw = raw || customDefaultRaw;
    if (!sourceRaw) {
      const initial: AppSettings = {
        ...DEFAULT_SETTINGS,
        channels: defaultChannels,
      };
      // Auto-persist new channels state as default baseline
      saveAsCustomDefault(initial);
      return initial;
    }
    const parsed = JSON.parse(sourceRaw);
    const teamBadgesSourceUrl =
      !parsed.teamBadgesSourceUrl || parsed.teamBadgesSourceUrl.includes('assets.footylogos.com')
        ? DEFAULT_TEAM_BADGES_SOURCE
        : parsed.teamBadgesSourceUrl;

    return {
      brandName: parsed.brandName || DEFAULT_SETTINGS.brandName,
      brandSubtitle: parsed.brandSubtitle || DEFAULT_SETTINGS.brandSubtitle,
      logoType: parsed.logoType || DEFAULT_SETTINGS.logoType,
      logoIcon: parsed.logoIcon || DEFAULT_SETTINGS.logoIcon,
      customLogoUrl: parsed.customLogoUrl || '',
      appIconUrl: parsed.appIconUrl || '',
      teamBadgesSourceUrl,
      themeColor: parsed.themeColor || DEFAULT_SETTINGS.themeColor,
      channels: Array.isArray(parsed.channels) && parsed.channels.length >= defaultChannels.length ? parsed.channels : defaultChannels,
      sourceUrl:
        parsed.sourceUrl && !parsed.sourceUrl.includes('mantosdofutebol.com.br')
          ? parsed.sourceUrl
          : DEFAULT_SETTINGS.sourceUrl,
    };
  } catch (err) {
    console.error('Erro ao carregar configurações salvas:', err);
    return {
      ...DEFAULT_SETTINGS,
      channels: defaultChannels,
    };
  }
}

export function saveStoredSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Erro ao salvar configurações:', err);
    return false;
  }
}

export function resetToCustomDefault(defaultChannels: Channel[]): AppSettings {
  try {
    const customDefaultRaw = localStorage.getItem(CUSTOM_DEFAULT_STORAGE_KEY);
    if (customDefaultRaw) {
      const parsed = JSON.parse(customDefaultRaw);
      const restored: AppSettings = {
        brandName: parsed.brandName || DEFAULT_SETTINGS.brandName,
        brandSubtitle: parsed.brandSubtitle || DEFAULT_SETTINGS.brandSubtitle,
        logoType: parsed.logoType || DEFAULT_SETTINGS.logoType,
        logoIcon: parsed.logoIcon || DEFAULT_SETTINGS.logoIcon,
        customLogoUrl: parsed.customLogoUrl || '',
        appIconUrl: parsed.appIconUrl || '',
        teamBadgesSourceUrl: parsed.teamBadgesSourceUrl || DEFAULT_SETTINGS.teamBadgesSourceUrl,
        themeColor: parsed.themeColor || DEFAULT_SETTINGS.themeColor,
        channels: Array.isArray(parsed.channels) && parsed.channels.length > 0 ? parsed.channels : defaultChannels,
        sourceUrl: parsed.sourceUrl || DEFAULT_SETTINGS.sourceUrl,
      };
      saveStoredSettings(restored);
      return restored;
    }
  } catch (err) {
    console.error('Erro ao restaurar padrão personalizado:', err);
  }
  return resetToFactoryDefault(defaultChannels);
}

export function resetToFactoryDefault(defaultChannels: Channel[]): AppSettings {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_DEFAULT_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_DEFAULT_META_KEY);
  } catch (err) {
    console.error('Erro ao resetar para fábrica:', err);
  }
  return {
    ...DEFAULT_SETTINGS,
    channels: defaultChannels,
  };
}

export function exportSettingsAsJson(settings: AppSettings): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
    },
    null,
    2
  );
}

export function parseImportedSettings(jsonText: string): AppSettings | null {
  try {
    const parsed = JSON.parse(jsonText);
    const target = parsed.settings || parsed;
    if (!target || typeof target !== 'object') return null;

    return {
      brandName: target.brandName || DEFAULT_SETTINGS.brandName,
      brandSubtitle: target.brandSubtitle || DEFAULT_SETTINGS.brandSubtitle,
      logoType: target.logoType || DEFAULT_SETTINGS.logoType,
      logoIcon: target.logoIcon || DEFAULT_SETTINGS.logoIcon,
      customLogoUrl: target.customLogoUrl || '',
      appIconUrl: target.appIconUrl || '',
      teamBadgesSourceUrl: target.teamBadgesSourceUrl || DEFAULT_SETTINGS.teamBadgesSourceUrl,
      themeColor: target.themeColor || DEFAULT_SETTINGS.themeColor,
      channels: Array.isArray(target.channels) && target.channels.length > 0 ? target.channels : [],
      sourceUrl: target.sourceUrl || DEFAULT_SETTINGS.sourceUrl,
    };
  } catch (err) {
    console.error('Erro ao importar JSON de configurações:', err);
    return null;
  }
}

