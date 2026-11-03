import React, { useState } from 'react';

export interface TeamBadgeInfo {
  name: string;
  slug: string | null;
  logoUrl: string | null;
  initials: string;
  bgColor: string;
  textColor: string;
}

// Normalized mapping to FootyLogos slugs (https://www.footylogos.com/pt-br/logos)
export const TEAM_LOGO_SLUGS: Record<string, { slug: string; initials: string; bg: string; text?: string }> = {
  // Brazilian Serie A & Serie B
  'palmeiras': { slug: 'palmeiras', initials: 'PAL', bg: '#006437' },
  'flamengo': { slug: 'flamengo', initials: 'FLA', bg: '#c70000' },
  'corinthians': { slug: 'corinthians', initials: 'COR', bg: '#111111' },
  'sao paulo': { slug: 'sao-paulo', initials: 'SAO', bg: '#dc2626' },
  'santos': { slug: 'santos-fc', initials: 'SAN', bg: '#1f2937' },
  'santos fc': { slug: 'santos-fc', initials: 'SAN', bg: '#1f2937' },
  'fluminense': { slug: 'fluminense', initials: 'FLU', bg: '#7f1d1d' },
  'botafogo': { slug: 'botafogo', initials: 'BOT', bg: '#000000' },
  'botafogo fr': { slug: 'botafogo', initials: 'BOT', bg: '#000000' },
  'vasco': { slug: 'vasco-da-gama', initials: 'VAS', bg: '#111111' },
  'vasco da gama': { slug: 'vasco-da-gama', initials: 'VAS', bg: '#111111' },
  'internacional': { slug: 'sc-internacional', initials: 'INT', bg: '#dc2626' },
  'inter': { slug: 'sc-internacional', initials: 'INT', bg: '#dc2626' },
  'gremio': { slug: 'gremio', initials: 'GRE', bg: '#0284c7' },
  'cruzeiro': { slug: 'cruzeiro', initials: 'CRU', bg: '#1d4ed8' },
  'bahia': { slug: 'bahia', initials: 'BAH', bg: '#0284c7' },
  'ec bahia': { slug: 'bahia', initials: 'BAH', bg: '#0284c7' },
  'red bull bragantino': { slug: 'red-bull-bragantino', initials: 'RBB', bg: '#dc2626' },
  'bragantino': { slug: 'red-bull-bragantino', initials: 'RBB', bg: '#dc2626' },
  'chapecoense': { slug: 'chapecoense', initials: 'CHA', bg: '#15803d' },
  'remo': { slug: 'clube-do-remo', initials: 'REM', bg: '#0f172a' },
  'clube do remo': { slug: 'clube-do-remo', initials: 'REM', bg: '#0f172a' },
  'atletico mineiro': { slug: 'atletico-mineiro', initials: 'CAM', bg: '#111111' },
  'atletico mg': { slug: 'atletico-mineiro', initials: 'CAM', bg: '#111111' },
  'atletico-mg': { slug: 'atletico-mineiro', initials: 'CAM', bg: '#111111' },
  'athletico paranaense': { slug: 'athletico-paranaense', initials: 'CAP', bg: '#991b1b' },
  'athletico pr': { slug: 'athletico-paranaense', initials: 'CAP', bg: '#991b1b' },
  'athletico-pr': { slug: 'athletico-paranaense', initials: 'CAP', bg: '#991b1b' },
  'fortaleza': { slug: 'fortaleza-ec', initials: 'FOR', bg: '#1d4ed8' },
  'ceara': { slug: 'ceara-sc', initials: 'CEA', bg: '#111111' },
  'sport': { slug: 'sport-recife', initials: 'SPO', bg: '#b91c1c' },
  'sport recife': { slug: 'sport-recife', initials: 'SPO', bg: '#b91c1c' },
  'coritiba': { slug: 'coritiba-fbc', initials: 'CFC', bg: '#047857' },
  'vitoria': { slug: 'ec-vitoria', initials: 'VIT', bg: '#b91c1c' },
  'goias': { slug: 'goias-ec', initials: 'GOI', bg: '#047857' },
  'juventude': { slug: 'ec-juventude', initials: 'JUV', bg: '#15803d' },
  'criciuma': { slug: 'criciuma-ec', initials: 'CRI', bg: '#ca8a04' },
  'cuiaba': { slug: 'cuiaba-ec', initials: 'CUI', bg: '#15803d' },
  'mirassol': { slug: 'mirassol-fc', initials: 'MIR', bg: '#ca8a04' },
  'ponte preta': { slug: 'aa-ponte-preta', initials: 'PON', bg: '#111111' },
  'guarani': { slug: 'guarani-fc', initials: 'GUA', bg: '#047857' },
  'vila nova': { slug: 'vila-nova-fc', initials: 'VIL', bg: '#dc2626' },
  'novorizontino': { slug: 'gremio-novorizontino', initials: 'NOV', bg: '#ca8a04' },
  'operario': { slug: 'operario-ferroviario', initials: 'OPE', bg: '#111111' },
  'paysandu': { slug: 'paysandu-sc', initials: 'PAY', bg: '#0284c7' },
  'avai': { slug: 'avai-fc', initials: 'AVA', bg: '#0284c7' },
  'amazonas': { slug: 'amazonas-fc', initials: 'AMA', bg: '#ca8a04' },
  'ituano': { slug: 'ituano-fc', initials: 'ITU', bg: '#b91c1c' },
  'crb': { slug: 'crb', initials: 'CRB', bg: '#b91c1c' },

  // European Clubs (Champions League, Premier, Serie A, La Liga, Bundesliga)
  'real madrid': { slug: 'real-madrid', initials: 'RMA', bg: '#1e3a8a' },
  'barcelona': { slug: 'fc-barcelona', initials: 'BAR', bg: '#1e3a8a' },
  'fc barcelona': { slug: 'fc-barcelona', initials: 'BAR', bg: '#1e3a8a' },
  'manchester city': { slug: 'manchester-city', initials: 'MCI', bg: '#38bdf8' },
  'manchester united': { slug: 'manchester-united', initials: 'MUN', bg: '#dc2626' },
  'liverpool': { slug: 'liverpool-fc', initials: 'LIV', bg: '#dc2626' },
  'arsenal': { slug: 'arsenal', initials: 'ARS', bg: '#dc2626' },
  'chelsea': { slug: 'chelsea', initials: 'CHE', bg: '#1d4ed8' },
  'tottenham': { slug: 'tottenham-hotspur', initials: 'TOT', bg: '#1e293b' },
  'bayern de munique': { slug: 'bayern-munich', initials: 'BAY', bg: '#dc2626' },
  'bayern munich': { slug: 'bayern-munich', initials: 'BAY', bg: '#dc2626' },
  'borussia dortmund': { slug: 'borussia-dortmund', initials: 'BVB', bg: '#eab308' },
  'bayer leverkusen': { slug: 'bayer-leverkusen', initials: 'LEV', bg: '#dc2626' },
  'wolfsburg': { slug: 'vfl-wolfsburg', initials: 'WOL', bg: '#16a34a' },
  'freiburg': { slug: 'sc-freiburg', initials: 'FRE', bg: '#111111' },
  'stuttgart': { slug: 'vfb-stuttgart', initials: 'STU', bg: '#dc2626' },
  'schalke 04': { slug: 'fc-schalke-04', initials: 'S04', bg: '#1d4ed8' },
  'hertha berlin': { slug: 'hertha-bsc', initials: 'HER', bg: '#1d4ed8' },
  'hoffenheim': { slug: 'tsg-1899-hoffenheim', initials: 'TSG', bg: '#1d4ed8' },
  'holstein kiel': { slug: 'holstein-kiel', initials: 'KIE', bg: '#1d4ed8' },
  'paderborn': { slug: 'sc-paderborn-07', initials: 'PAD', bg: '#1d4ed8' },
  'hannover 96': { slug: 'hannover-96', initials: 'H96', bg: '#16a34a' },
  'magdeburg': { slug: '1-fc-magdeburg', initials: 'MAG', bg: '#1d4ed8' },
  'nurnberg': { slug: '1-fc-nurnberg', initials: 'NUR', bg: '#991b1b' },
  'dynamo dresden': { slug: 'sg-dynamo-dresden', initials: 'DRE', bg: '#eab308' },
  'kaiserlautern': { slug: '1-fc-kaiserslautern', initials: 'FCK', bg: '#dc2626' },

  // Italian Serie A
  'frosinone': { slug: 'frosinone-calcio', initials: 'FRO', bg: '#ca8a04' },
  'lecce': { slug: 'us-lecce', initials: 'LEC', bg: '#dc2626' },
  'fiorentina': { slug: 'acffiorentina', initials: 'FIO', bg: '#7c3aed' },
  'atalanta': { slug: 'atalanta-bc', initials: 'ATA', bg: '#1d4ed8' },
  'inter de milao': { slug: 'inter-milan', initials: 'INT', bg: '#1d4ed8' },
  'inter milan': { slug: 'inter-milan', initials: 'INT', bg: '#1d4ed8' },
  'milan': { slug: 'ac-milan', initials: 'MIL', bg: '#dc2626' },
  'ac milan': { slug: 'ac-milan', initials: 'MIL', bg: '#dc2626' },
  'juventus': { slug: 'juventus', initials: 'JUV', bg: '#111111' },
  'napoli': { slug: 'ssc-napoli', initials: 'NAP', bg: '#0284c7' },
  'roma': { slug: 'as-roma', initials: 'ROM', bg: '#b91c1c' },
  'as roma': { slug: 'as-roma', initials: 'ROM', bg: '#b91c1c' },
  'bolonga': { slug: 'bologna-fc-1909', initials: 'BOL', bg: '#1e3a8a' },
  'bologna': { slug: 'bologna-fc-1909', initials: 'BOL', bg: '#1e3a8a' },
  'genoa': { slug: 'genoa-cfc', initials: 'GEN', bg: '#b91c1c' },
  'monza': { slug: 'ac-monza', initials: 'MON', bg: '#dc2626' },
  'parma': { slug: 'parma-calcio-1913', initials: 'PAR', bg: '#eab308' },
  'udinese': { slug: 'udinese-calcio', initials: 'UDI', bg: '#111111' },
  'venezia': { slug: 'venezia-fc', initials: 'VEN', bg: '#047857' },

  // English Premier & Cups
  'everton': { slug: 'everton-fc', initials: 'EVE', bg: '#1d4ed8' },
  'newcastle': { slug: 'newcastle-united', initials: 'NEW', bg: '#111111' },
  'brighton': { slug: 'brighton-hove-albion', initials: 'BHA', bg: '#0284c7' },
  'aston villa': { slug: 'aston-villa', initials: 'AVL', bg: '#831843' },
  'crystal palace': { slug: 'crystal-palace', initials: 'CRY', bg: '#1d4ed8' },
  'brentford': { slug: 'brentford-fc', initials: 'BRE', bg: '#dc2626' },
  'fulham': { slug: 'fulham-fc', initials: 'FUL', bg: '#111111' },
  'bournemouth': { slug: 'afc-bournemouth', initials: 'BOU', bg: '#dc2626' },
  'sunderland': { slug: 'sunderland-afc', initials: 'SUN', bg: '#dc2626' },

  // Saudi Pro League
  'al-nassr': { slug: 'al-nassr-fc', initials: 'NAS', bg: '#eab308' },
  'al nassr': { slug: 'al-nassr-fc', initials: 'NAS', bg: '#eab308' },
  'al-kholood': { slug: 'al-kholood-club', initials: 'KHO', bg: '#dc2626' },
  'al kholood': { slug: 'al-kholood-club', initials: 'KHO', bg: '#dc2626' },
  'al-riyadh': { slug: 'al-riyadh-sc', initials: 'RIY', bg: '#dc2626' },
  'al riyadh': { slug: 'al-riyadh-sc', initials: 'RIY', bg: '#dc2626' },
  'al-qadsiah': { slug: 'al-qadsiah-fc', initials: 'QAD', bg: '#b91c1c' },
  'al qadsiah': { slug: 'al-qadsiah-fc', initials: 'QAD', bg: '#b91c1c' },

  // Spanish La Liga & Copa del Rey
  'atletico de madrid': { slug: 'atletico-madrid', initials: 'ATM', bg: '#dc2626' },
  'valencia': { slug: 'valencia-cf', initials: 'VAL', bg: '#ea580c' },
  'celta de vigo': { slug: 'rc-celta-de-vigo', initials: 'CEL', bg: '#38bdf8' },
  'real betis': { slug: 'real-betis', initials: 'BET', bg: '#16a34a' },
  'alaves': { slug: 'deportivo-alaves', initials: 'ALA', bg: '#1d4ed8' },
  'levante': { slug: 'ud-levante', initials: 'LEV', bg: '#1e3a8a' },

  // Portugal, France, Scotland
  'benfica': { slug: 'sl-benfica', initials: 'BEN', bg: '#dc2626' },
  'porto': { slug: 'fc-porto', initials: 'POR', bg: '#1d4ed8' },
  'sporting': { slug: 'sporting-cp', initials: 'SPO', bg: '#16a34a' },
  'paris saint-germain': { slug: 'paris-saint-germain', initials: 'PSG', bg: '#1e3a8a' },
  'lyon': { slug: 'olympique-lyonnais', initials: 'OL', bg: '#1d4ed8' },
  'rangers': { slug: 'rangers-fc', initials: 'RAN', bg: '#1d4ed8' },
  'hearts': { slug: 'heart-of-midlothian', initials: 'HEA', bg: '#831843' },

  // MLS
  'inter miami': { slug: 'inter-miami-cf', initials: 'MIA', bg: '#f472b6' },
  'fc cincinnati': { slug: 'fc-cincinnati', initials: 'CIN', bg: '#ea580c' },
  'atlanta united': { slug: 'atlanta-united-fc', initials: 'ATL', bg: '#991b1b' },
  'charlotte fc': { slug: 'charlotte-fc', initials: 'CLT', bg: '#0284c7' },
  'cf montreal': { slug: 'cf-montreal', initials: 'MTL', bg: '#1d4ed8' },
  'ne revolution': { slug: 'new-england-revolution', initials: 'NER', bg: '#1e3a8a' },
  'ny red bulls': { slug: 'new-york-red-bulls', initials: 'RBNY', bg: '#dc2626' },
  'new york city': { slug: 'new-york-city-fc', initials: 'NYC', bg: '#38bdf8' },
  'toronto fc': { slug: 'toronto-fc', initials: 'TOR', bg: '#dc2626' },
  'dc united': { slug: 'd-c-united', initials: 'DCU', bg: '#111111' },
  'austin fc': { slug: 'austin-fc', initials: 'ATX', bg: '#16a34a' },
  'real salt lake': { slug: 'real-salt-lake', initials: 'RSL', bg: '#991b1b' },
  'chicago fire': { slug: 'chicago-fire-fc', initials: 'CHI', bg: '#dc2626' },
  'orlando city': { slug: 'orlando-city-sc', initials: 'ORL', bg: '#7c3aed' },
  'fc dallas': { slug: 'fc-dallas', initials: 'DAL', bg: '#dc2626' },
  'columbus crew': { slug: 'columbus-crew', initials: 'CLB', bg: '#eab308' },
  'minnesota united': { slug: 'minnesota-united-fc', initials: 'MIN', bg: '#64748b' },
  'sporting kc': { slug: 'sporting-kansas-city', initials: 'SKC', bg: '#38bdf8' },
  'nashville sc': { slug: 'nashville-sc', initials: 'NSH', bg: '#eab308' },
  'philadelphia union': { slug: 'philadelphia-union', initials: 'PHI', bg: '#1e3a8a' },
  'st. louis city': { slug: 'st-louis-city-sc', initials: 'STL', bg: '#e11d48' },
  'portland timbers': { slug: 'portland-timbers', initials: 'POR', bg: '#15803d' },
  'sj earthquakes': { slug: 'san-jose-earthquakes', initials: 'SJE', bg: '#1d4ed8' },
  'colorado rapids': { slug: 'colorado-rapids', initials: 'COL', bg: '#831843' },
  'seattle sounders': { slug: 'seattle-sounders-fc', initials: 'SEA', bg: '#16a34a' },
  'houston dynamo': { slug: 'houston-dynamo-fc', initials: 'HOU', bg: '#ea580c' },
  'vancouver whitecaps': { slug: 'vancouver-whitecaps-fc', initials: 'VAN', bg: '#1e3a8a' },
  'san diego fc': { slug: 'san-diego-fc', initials: 'SD', bg: '#0284c7' },

  // South America & Concacaf
  'olimpia': { slug: 'club-olimpia', initials: 'OLI', bg: '#111111' },
  'independiente santa fe': { slug: 'independiente-santa-fe', initials: 'SFE', bg: '#dc2626' },
  'carabobo': { slug: 'carabobo-fc', initials: 'CBB', bg: '#78350f' },
  'la guaira': { slug: 'deportivo-la-guaira', initials: 'DLG', bg: '#ea580c' },
  'metropolitanos': { slug: 'metropolitanos-fc', initials: 'MET', bg: '#7c3aed' },
  'portuguesa-ven': { slug: 'portuguesa-fc', initials: 'POR', bg: '#dc2626' },
  'deportivo saprissa': { slug: 'deportivo-saprissa', initials: 'SAP', bg: '#831843' },
};

export function normalizeTeamName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const DEFAULT_TEAM_BADGES_TEMPLATE = 'https://bolarolando.org/escudos/{slug}.webp';

// Special slug mapping for bolarolando.org
export const BOLAROLANDO_SLUGS: Record<string, string> = {
  'sao-paulo': 'spfc',
  'sao paulo': 'spfc',
  'spfc': 'spfc',
  'atletico-mineiro': 'mg',
  'atletico mineiro': 'mg',
  'atletico-mg': 'mg',
  'atletico mg': 'mg',
  'athletico-paranaense': 'pr',
  'athletico paranaense': 'pr',
  'athletico-pr': 'pr',
  'athletico pr': 'pr',
  'santos-fc': 'santos',
  'santos': 'santos',
  'vasco-da-gama': 'vasco',
  'vasco': 'vasco',
  'aa-ponte-preta': 'ponte',
  'ponte-preta': 'ponte',
  'ponte preta': 'ponte',
  'red-bull-bragantino': 'bragantino',
  'bragantino': 'bragantino',
  'real-madrid': 'madrid',
  'manchester-city': 'city',
  'paris-saint-germain': 'psg',
  'psg': 'psg',
  'fc-barcelona': 'barcelona',
  'barcelona': 'barcelona',
  'al-nassr': 'nassr',
  'al-nassr-fc': 'nassr',
  'al-kholood': 'kholood',
  'al-kholood-club': 'kholood',
  'juventus': 'juventus',
};

export function buildBadgeUrl(slug: string, rawName: string, customSourceTemplate?: string): string {
  let template = (customSourceTemplate && customSourceTemplate.trim()) || DEFAULT_TEAM_BADGES_TEMPLATE;
  
  // If user pasted a direct club URL example like https://bolarolando.org/escudos/corinthians.webp
  if (template.includes('corinthians.webp')) {
    template = template.replace(/corinthians\.webp/g, '{slug}.webp');
  }

  const isBolarolando = template.includes('bolarolando.org');
  let effectiveSlug = slug;
  if (isBolarolando) {
    const norm = normalizeTeamName(rawName);
    effectiveSlug =
      BOLAROLANDO_SLUGS[slug] ||
      BOLAROLANDO_SLUGS[norm] ||
      slug.replace(/-fc$/, '').replace(/-sc$/, '').replace(/-ec$/, '');
  }
  
  if (template.includes('{slug}')) {
    return template.replace(/{slug}/g, effectiveSlug);
  }
  if (template.includes('{name}')) {
    const cleanName = normalizeTeamName(rawName).replace(/\s+/g, '-');
    return template.replace(/{name}/g, cleanName);
  }
  
  // If template is a base directory, intelligently append slug pattern
  const cleanBase = template.replace(/\/+$/, '');
  if (cleanBase.includes('bolarolando.org')) {
    return `${cleanBase}/${effectiveSlug}.webp`;
  }
  if (cleanBase.includes('footylogos.com')) {
    return `${cleanBase}/${slug}/${slug}-logo-footylogos-320.webp`;
  }
  return `${cleanBase}/${effectiveSlug}.webp`;
}

export function getTeamBadgeInfo(rawName: string, customSourceTemplate?: string): TeamBadgeInfo {
  const normalized = normalizeTeamName(rawName);

  // Direct lookup
  let entry = TEAM_LOGO_SLUGS[normalized];

  // Fuzzy lookup if not exact
  if (!entry) {
    for (const key of Object.keys(TEAM_LOGO_SLUGS)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        entry = TEAM_LOGO_SLUGS[key];
        break;
      }
    }
  }

  const initials = entry?.initials || rawName.slice(0, 3).toUpperCase();
  const bgColor = entry?.bg || '#1e293b';
  const textColor = entry?.text || '#ffffff';

  const baseSlug = entry?.slug || normalized.replace(/\s+/g, '-');
  const logoUrl = buildBadgeUrl(baseSlug, rawName, customSourceTemplate);

  return {
    name: rawName,
    slug: baseSlug,
    logoUrl,
    initials,
    bgColor,
    textColor,
  };
}

export interface TeamBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  customSourceTemplate?: string;
  directLogoUrl?: string | null;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  name,
  size = 'md',
  className = '',
  customSourceTemplate,
  directLogoUrl,
}) => {
  const [hasDirectError, setHasDirectError] = useState(false);
  const [hasFallbackError, setHasFallbackError] = useState(false);
  const info = getTeamBadgeInfo(name, customSourceTemplate);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  }[size];

  const imgSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11',
  }[size];

  // Priority 1: Direct official logo from 365Scores CDN
  if (directLogoUrl && !hasDirectError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center p-0.5 bg-black/40 border border-white/10 shadow-sm shrink-0 overflow-hidden ${sizeClasses} ${className}`}
        title={`${name} · Escudo Oficial (365Scores)`}
      >
        <img
          src={directLogoUrl}
          alt={name}
          loading="lazy"
          onError={() => setHasDirectError(true)}
          className={`object-contain transition-transform duration-200 hover:scale-110 drop-shadow-sm ${imgSizeClasses}`}
        />
      </div>
    );
  }

  // Priority 2: Custom template or FootyLogos mapping
  if (info.logoUrl && !hasFallbackError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center p-0.5 bg-black/40 border border-white/10 shadow-sm shrink-0 overflow-hidden ${sizeClasses} ${className}`}
        title={`${name} · Escudo`}
      >
        <img
          src={info.logoUrl}
          alt={name}
          loading="lazy"
          onError={() => setHasFallbackError(true)}
          className={`object-contain transition-transform duration-200 hover:scale-110 ${imgSizeClasses}`}
        />
      </div>
    );
  }

  // Priority 3: Fallback initials circle with team colors
  return (
    <div
      className={`rounded-full flex items-center justify-center font-black tracking-tighter shrink-0 border border-white/10 shadow-sm select-none ${sizeClasses} ${className}`}
      style={{ backgroundColor: info.bgColor, color: info.textColor }}
      title={`${name} (Escudo)`}
    >
      <span>{info.initials}</span>
    </div>
  );
};
