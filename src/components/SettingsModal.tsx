import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  Tv,
  Palette,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  RotateCcw,
  Save,
  Check,
  Flame,
  Trophy,
  Sparkles,
  Play,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  FolderPlus,
  Tag,
  BookmarkCheck,
  ShieldCheck,
  Download,
  Upload,
  FileJson,
  Star,
  ChevronDown,
  Layers,
  Shield,
  AppWindow,
} from 'lucide-react';
import { Channel, getNetworkColor } from '../App';
import {
  AppSettings,
  saveAsCustomDefault,
  getCustomDefaultMeta,
  exportSettingsAsJson,
  parseImportedSettings,
  DEFAULT_TEAM_BADGES_SOURCE,
} from '../services/appSettings';
import { buildBadgeUrl, DEFAULT_TEAM_BADGES_TEMPLATE } from '../services/teamLogos';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onReset: (toFactory?: boolean) => void;
  onRefreshMatchesWithSource: (sourceUrl: string) => Promise<void>;
  defaultChannels: Channel[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onReset,
  onRefreshMatchesWithSource,
  defaultChannels,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'channels' | 'source' | 'backup'>('branding');
  const [formState, setFormState] = useState<AppSettings>({ ...settings });
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [isDefaultFeedback, setIsDefaultFeedback] = useState(false);
  const [customMeta, setCustomMeta] = useState(() => getCustomDefaultMeta());
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);
  const [testingSource, setTestingSource] = useState(false);
  const [sourceTestStatus, setSourceTestStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal formState when modal opens with fresh settings
  useEffect(() => {
    if (isOpen) {
      setFormState({ ...settings });
      setCustomMeta(getCustomDefaultMeta());
      setShowResetMenu(false);
      setBackupFeedback(null);
    }
  }, [isOpen, settings]);

  // New channel form state
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelNetwork, setNewChannelNetwork] = useState('Premiere');
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [modalCategoryFilter, setModalCategoryFilter] = useState('all');

  // Unique networks present in channels
  const uniqueNetworks = useMemo(() => {
    const list: string[] = [];
    formState.channels.forEach((c) => {
      const net = (c.network || 'Geral').trim();
      if (!list.some((existing) => existing.toLowerCase() === net.toLowerCase())) {
        list.push(net);
      }
    });
    return list;
  }, [formState.channels]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formState);
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
      onClose();
    }, 1000);
  };

  // Set current state as permanent custom default
  const handleSetAsDefault = () => {
    const res = saveAsCustomDefault(formState);
    if (res.success) {
      setCustomMeta({ hasDefault: true, savedAt: res.savedAt });
      setIsDefaultFeedback(true);
      onSave(formState); // ensure parent App active state updates as well
      setTimeout(() => {
        setIsDefaultFeedback(false);
      }, 3000);
    }
  };

  // Restore to Custom Default
  const handleRestoreCustomDefault = () => {
    onReset(false);
    setShowResetMenu(false);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 1500);
  };

  // Restore to Factory Default
  const handleRestoreFactory = () => {
    onReset(true);
    setCustomMeta({ hasDefault: false });
    setShowResetMenu(false);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 1500);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const jsonStr = exportSettingsAsJson(formState);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rede-esporte-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupFeedback('Backup exportado com sucesso em arquivo JSON!');
    setTimeout(() => setBackupFeedback(null), 3000);
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseImportedSettings(text);
      if (parsed) {
        setFormState(parsed);
        setBackupFeedback('Configurações importadas com sucesso! Clique em "Salvar" ou "Definir como Padrão".');
      } else {
        setBackupFeedback('Arquivo JSON inválido ou formato incompatível.');
      }
      setTimeout(() => setBackupFeedback(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateChannelUrl = (id: string, newUrl: string) => {
    setFormState((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) => (ch.id === id ? { ...ch, url: newUrl } : ch)),
    }));
  };

  const handleUpdateChannelName = (id: string, newName: string) => {
    setFormState((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) => (ch.id === id ? { ...ch, name: newName } : ch)),
    }));
  };

  const handleUpdateChannelNetwork = (id: string, newNet: string) => {
    const cleanNet = newNet.trim() || 'Geral';
    const catKey = cleanNet.toLowerCase().replace(/\s+/g, '-');
    const color = getNetworkColor(cleanNet);
    setFormState((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) =>
        ch.id === id
          ? {
              ...ch,
              network: cleanNet,
              categoryKey: catKey,
              brandColor: color.hex,
            }
          : ch
      ),
    }));
  };

  const handleDeleteChannel = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      channels: prev.channels.filter((ch) => ch.id !== id),
    }));
  };

  const handleAddChannel = () => {
    if (!newChannelName.trim() || !newChannelUrl.trim()) return;

    const id = 'custom-' + Date.now();
    const cleanNet = newChannelNetwork.trim() || 'Geral';
    const catKey = cleanNet.toLowerCase().replace(/\s+/g, '-');
    const color = getNetworkColor(cleanNet);

    const newChan: Channel = {
      id,
      name: newChannelName.trim(),
      network: cleanNet,
      categoryKey: catKey,
      numberLabel: 'Canal',
      url: newChannelUrl.trim(),
      canalKey: id,
      tagline: `Canal ${cleanNet} adicionado pelo usuário`,
      description: 'Transmissão personalizada configurada no painel.',
      brandColor: color.hex,
      accentBg: 'from-slate-900 to-black',
      viewers: '12.4K',
      nowPlaying: 'Programação ao Vivo',
    };

    setFormState((prev) => ({
      ...prev,
      channels: [...prev.channels, newChan],
    }));

    setNewChannelName('');
    setNewChannelUrl('');
    setShowAddChannel(false);
  };

  const handleTestSource = async () => {
    setTestingSource(true);
    setSourceTestStatus(null);
    try {
      await onRefreshMatchesWithSource(formState.sourceUrl);
      setSourceTestStatus('Fonte consultada com sucesso! Jogos atualizados.');
    } catch (err: any) {
      setSourceTestStatus('Erro ao consultar fonte: ' + (err.message || 'Falha na requisição'));
    } finally {
      setTestingSource(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0b0e17] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">Painel de Personalização do App</h2>
                {customMeta.hasDefault && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Padrão Personalizado Ativo</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina os canais, links do player, logotipo e fixe suas escolhas como novo padrão oficial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 bg-black/20 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'branding'
                ? 'border-red-500 text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-red-500" />
            <span>Marca & Logotipo</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'channels'
                ? 'border-red-500 text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4 text-blue-500" />
            <span>Canais & Links ({formState.channels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'source'
                ? 'border-red-500 text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Fontes (Jogos & Escudos)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-amber-500 text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Padrão & Backup</span>
            {customMeta.hasDefault && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* App Name & Slogan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Nome do Portal / App
                  </label>
                  <input
                    type="text"
                    value={formState.brandName}
                    onChange={(e) => setFormState({ ...formState, brandName: e.target.value })}
                    placeholder="Ex: REDE ESPORTE"
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Aparece no cabeçalho e na barra de título.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Slogan / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formState.brandSubtitle}
                    onChange={(e) => setFormState({ ...formState, brandSubtitle: e.target.value })}
                    placeholder="Ex: Guia de Jogos na TV & Player ao Vivo"
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Aparece nos cards e nos banners do portal.</span>
                </div>
              </div>

              {/* Logo Selection */}
              <div className="bg-[#131926] border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Tipo de Logotipo</h3>
                    <p className="text-xs text-slate-400">Escolha entre um ícone estilizado ou a URL de uma imagem própria.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, logoType: 'icon' })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        formState.logoType === 'icon'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Ícone Dinâmico
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, logoType: 'custom_image' })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        formState.logoType === 'custom_image'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Imagem / URL Externa
                    </button>
                  </div>
                </div>

                {formState.logoType === 'icon' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      Escolha o Ícone do Topo:
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: 'play', label: 'Play ▶', icon: Play },
                        { key: 'fire', label: 'Fogo 🔥', icon: Flame },
                        { key: 'tv', label: 'TV 📺', icon: Tv },
                        { key: 'trophy', label: 'Troféu 🏆', icon: Trophy },
                        { key: 'sparkles', label: 'Brilho ✨', icon: Sparkles },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = formState.logoIcon === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFormState({ ...formState, logoIcon: item.key as any })}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-red-600/20 border-red-500 text-white'
                                : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      URL da Imagem do Logotipo (PNG / SVG / WebP):
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="url"
                        value={formState.customLogoUrl}
                        onChange={(e) => setFormState({ ...formState, customLogoUrl: e.target.value })}
                        placeholder="https://exemplo.com/meu-logo.png"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                      {formState.customLogoUrl && (
                        <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={formState.customLogoUrl}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Dica: Use uma imagem com fundo transparente para melhor resultado visual no cabeçalho escuro.
                    </span>
                  </div>
                )}
              </div>

              {/* Theme Color */}
              <div className="bg-[#131926] border border-white/10 rounded-2xl p-4">
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                  Cor de Destaque da Identidade Visual
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'red', name: 'Vermelho Rubro', color: '#dc2626', bgClass: 'bg-red-600' },
                    { key: 'emerald', name: 'Verde Campo', color: '#10b981', bgClass: 'bg-emerald-600' },
                    { key: 'blue', name: 'Azul Elétrico', color: '#2563eb', bgClass: 'bg-blue-600' },
                    { key: 'purple', name: 'Roxo Neon', color: '#9333ea', bgClass: 'bg-purple-600' },
                    { key: 'amber', name: 'Âmbar Ouro', color: '#f59e0b', bgClass: 'bg-amber-500' },
                  ].map((colorOption) => (
                    <button
                      key={colorOption.key}
                      type="button"
                      onClick={() => setFormState({ ...formState, themeColor: colorOption.key as any })}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        formState.themeColor === colorOption.key
                          ? 'border-white bg-white/10 shadow-md'
                          : 'border-white/5 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${colorOption.bgClass} shrink-0`} />
                      <span className="text-xs font-bold text-slate-200 truncate">{colorOption.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* App Icon / Favicon Settings */}
              <div className="bg-[#131926] border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AppWindow className="w-4 h-4 text-amber-400" />
                      <span>Ícone do Aplicativo (Favicon & Atalho do Navegador)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Defina o link do ícone que aparece na aba do navegador, nos favoritos e no arquivo index.html exportado.
                    </p>
                  </div>

                  {formState.customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, appIconUrl: formState.customLogoUrl })}
                      className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      Copiar URL do Logotipo
                    </button>
                  )}
                </div>

                {/* Input and Preview */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Link / URL do Ícone do App (.png, .ico, .svg, .webp):
                    </label>
                    <div className="flex gap-2.5 items-center">
                      <input
                        type="url"
                        value={formState.appIconUrl}
                        onChange={(e) => setFormState({ ...formState, appIconUrl: e.target.value })}
                        placeholder="Ex: https://exemplo.com/meu-icone-app.png"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      {formState.appIconUrl && (
                        <button
                          type="button"
                          onClick={() => setFormState({ ...formState, appIconUrl: '' })}
                          className="px-2.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Limpar ícone"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mockup Browser Tab Preview */}
                  <div className="bg-black/50 border border-white/10 rounded-xl p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Pré-visualização na Aba do Navegador:
                    </span>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e2538] border-t-2 border-amber-500 rounded-t-lg shadow max-w-sm">
                      {formState.appIconUrl ? (
                        <img
                          src={formState.appIconUrl}
                          alt="Favicon"
                          className="w-4 h-4 object-contain rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white text-[9px] font-black">
                          ▶
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
                        {formState.brandName || 'REDE ESPORTE'} - Guia na TV
                      </span>
                      <span className="text-[10px] text-slate-500 hover:text-white ml-2">✕</span>
                    </div>
                  </div>

                  {/* Presets */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Sugestões de Ícones Esportivos:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          name: '⚽ Bola de Futebol',
                          url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=64&auto=format&fit=crop&q=80',
                        },
                        {
                          name: '🏆 Troféu Ouro',
                          url: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=64&auto=format&fit=crop&q=80',
                        },
                        {
                          name: '📺 TV Esporte',
                          url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=64&auto=format&fit=crop&q=80',
                        },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormState({ ...formState, appIconUrl: preset.url })}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <img src={preset.url} alt="" className="w-3.5 h-3.5 rounded object-cover" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANNELS & STREAM LINKS */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              {/* Datalist for Network Autocomplete */}
              <datalist id="networks-datalist">
                {uniqueNetworks.map((net) => (
                  <option key={net} value={net} />
                ))}
                <option value="Premiere" />
                <option value="SporTV" />
                <option value="ESPN" />
                <option value="CazéTV" />
                <option value="Disney+" />
                <option value="HBO Max" />
                <option value="Paramount+" />
                <option value="Prime Video" />
                <option value="Sportynet" />
                <option value="BandSports" />
                <option value="Record" />
                <option value="SBT" />
                <option value="TNT Sports" />
                <option value="Globo" />
                <option value="Canal GOAT" />
                <option value="Nosso Futebol" />
              </datalist>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Canais & Redes / Categorias</span>
                    <span className="text-[11px] font-mono bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                      {formState.channels.length} canais
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Edite a Rede/Categoria, nome e URL de qualquer canal, ou cadastre novas redes livremente.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddChannel(true);
                      setNewChannelNetwork('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ Nova Categoria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddChannel(!showAddChannel)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddChannel ? 'Fechar Formulário' : '+ Novo Canal'}</span>
                  </button>
                </div>
              </div>

              {/* Category Pills Filter Bar */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-red-500" /> Filtrar por Rede / Categoria:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {uniqueNetworks.length} redes cadastradas
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setModalCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      modalCategoryFilter === 'all'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    Todas ({formState.channels.length})
                  </button>
                  {uniqueNetworks.map((net) => {
                    const count = formState.channels.filter(
                      (c) => (c.network || '').toLowerCase().trim() === net.toLowerCase().trim()
                    ).length;
                    const color = getNetworkColor(net);
                    const isSelected = modalCategoryFilter.toLowerCase() === net.toLowerCase();
                    return (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setModalCategoryFilter(net.toLowerCase())}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? `${color.bg} text-white shadow-sm`
                            : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span>{net}</span>
                        <span className="opacity-75 text-[10px] font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Channel / Network Inline Form */}
              {showAddChannel && (
                <div className="bg-[#131926] border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Cadastrar Novo Canal ou Nova Categoria
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Você pode digitar o nome de qualquer rede existente ou criar uma nova
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Nome do Canal
                      </label>
                      <input
                        type="text"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        placeholder="Ex: CAZÉ TV 1, TNT SPORTS, etc."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Rede / Categoria (Digite ou Escolha)
                      </label>
                      <input
                        type="text"
                        list="networks-datalist"
                        value={newChannelNetwork}
                        onChange={(e) => setNewChannelNetwork(e.target.value)}
                        placeholder="Ex: CazéTV, Premiere, ESPN, TNT..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold text-amber-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        URL do Player / Stream
                      </label>
                      <input
                        type="url"
                        value={newChannelUrl}
                        onChange={(e) => setNewChannelUrl(e.target.value)}
                        placeholder="https://redecanais.by/player3/ch.php?canal=..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-slate-400">
                      Ao cadastrar, a nova categoria aparecerá automaticamente nos filtros, prateleiras e guia de jogos.
                    </span>
                    <button
                      type="button"
                      onClick={handleAddChannel}
                      disabled={!newChannelName.trim() || !newChannelUrl.trim()}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shadow-md"
                    >
                      Inserir Canal na Grade
                    </button>
                  </div>
                </div>
              )}

              {/* Channels List */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {formState.channels
                  .filter((ch) => {
                    if (modalCategoryFilter === 'all') return true;
                    return (ch.network || '').toLowerCase().trim() === modalCategoryFilter.toLowerCase().trim();
                  })
                  .map((ch, idx) => {
                    const color = getNetworkColor(ch.network);
                    return (
                      <div
                        key={ch.id}
                        className="bg-[#131926] border border-white/5 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-white/15 transition-all"
                      >
                        {/* Channel Number, Name and Editable Category */}
                        <div className="flex items-start sm:items-center gap-3 min-w-[260px] shrink-0">
                          <span className="w-6 h-6 rounded bg-black/40 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={ch.name}
                              onChange={(e) => handleUpdateChannelName(ch.id, e.target.value)}
                              className="bg-transparent font-bold text-sm text-white focus:outline-none focus:underline w-full"
                              title="Clique para editar o nome do canal"
                            />
                            {/* Editable Category Input / Selector with Datalist */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-semibold">Rede:</span>
                              <input
                                type="text"
                                list="networks-datalist"
                                value={ch.network}
                                onChange={(e) => handleUpdateChannelNetwork(ch.id, e.target.value)}
                                placeholder="Rede / Categoria"
                                className="bg-black/50 border border-white/10 hover:border-white/30 focus:border-emerald-500 rounded px-2 py-0.5 text-xs font-bold text-amber-300 focus:outline-none transition-colors w-36"
                                title="Altere ou digite uma nova Rede/Categoria para este canal"
                              />
                              <span
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded text-white ${color.bg}`}
                              >
                                {ch.network}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stream URL */}
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <input
                              type="url"
                              value={ch.url}
                              onChange={(e) => handleUpdateChannelUrl(ch.id, e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-red-500"
                              title="Edite a URL do player deste canal"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <a
                            href={ch.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            title="Testar link em nova aba"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteChannel(ch.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 rounded-lg transition-colors cursor-pointer"
                            title="Remover este canal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: SOURCES (MATCHES & TEAM BADGES) */}
          {activeTab === 'source' && (
            <div className="space-y-6">
              {/* SOURCE 1: GAMES OF THE DAY */}
              <div className="bg-[#131926] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>Fonte 1: Grade de Jogos do Dia (Transmissões)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Defina de qual endereço web a grade de jogos e canais de TV ao vivo será consultada.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Web Scraper Ativo
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Endereço URL da Fonte dos Jogos
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formState.sourceUrl}
                      onChange={(e) => setFormState({ ...formState, sourceUrl: e.target.value })}
                      placeholder="https://www.365scores.com/pt-br/where-to-watch"
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestSource}
                      disabled={testingSource || !formState.sourceUrl.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl transition-colors shrink-0 cursor-pointer shadow-md shadow-emerald-950/50"
                    >
                      {testingSource ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Consultando...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" />
                          <span>Testar & Atualizar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preset Buttons */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">Fontes recomendadas:</span>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, sourceUrl: 'https://www.365scores.com/pt-br/where-to-watch' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        formState.sourceUrl.includes('365scores')
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <span>⚡ 365Scores (Agenda + Escudos Oficiais + Onde Assistir)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, sourceUrl: 'https://mantosdofutebol.com.br/guia-de-jogos-tv-hoje-ao-vivo/' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        formState.sourceUrl.includes('mantosdofutebol')
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <span>Mantos do Futebol (Guia TV Tradicional)</span>
                    </button>
                  </div>

                  {sourceTestStatus && (
                    <div
                      className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                        sourceTestStatus.includes('sucesso')
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-950/40 text-red-300 border border-red-500/30'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{sourceTestStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SOURCE 2: TEAM BADGES / ESCUDOS DOS TIMES */}
              <div className="bg-[#131926] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Fonte 2: Escudos dos Times (Logotipos dos Clubes)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Personalize a URL base ou modelo de onde os escudos dos times são carregados para os cards de jogos.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Com o 365Scores, os escudos oficiais de todos os clubes do mundo são integrados diretamente em tempo real!</span>
                    </div>
                  </div>

                  {formState.teamBadgesSourceUrl !== DEFAULT_TEAM_BADGES_SOURCE && (
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, teamBadgesSourceUrl: DEFAULT_TEAM_BADGES_SOURCE })}
                      className="text-[11px] font-bold text-blue-300 hover:text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
                    >
                      Restaurar Padrão BolaRolando
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Modelo de URL dos Escudos (URL Template)
                  </label>
                  <input
                    type="text"
                    value={formState.teamBadgesSourceUrl}
                    onChange={(e) => setFormState({ ...formState, teamBadgesSourceUrl: e.target.value })}
                    placeholder="https://bolarolando.org/escudos/{slug}.webp ou https://bolarolando.org/escudos/corinthians.webp"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />

                  {/* Variables explanation */}
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Formato flexível:</span>
                    <span className="text-slate-400">
                      Você pode digitar diretamente <strong className="text-amber-300 font-mono">https://bolarolando.org/escudos/corinthians.webp</strong> ou usar a variável <strong className="text-amber-300 font-mono">&#123;slug&#125;</strong>.
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                    Modelos / Provedores Prontos:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          teamBadgesSourceUrl: 'https://bolarolando.org/escudos/{slug}.webp',
                        })
                      }
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        formState.teamBadgesSourceUrl.includes('bolarolando.org')
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>BolaRolando WebP</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Padrão</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        .../escudos/{'{slug}'}.webp
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          teamBadgesSourceUrl: 'https://assets.footylogos.com/previews/{slug}/{slug}-logo-footylogos-320.webp',
                        })
                      }
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        formState.teamBadgesSourceUrl.includes('footylogos') && formState.teamBadgesSourceUrl.endsWith('.webp')
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">FootyLogos WebP HD</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        .../{'{slug}'}-logo-footylogos-320.webp
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          teamBadgesSourceUrl: 'https://cdn.jsdelivr.net/gh/footylogos/logos/{slug}.png',
                        })
                      }
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        formState.teamBadgesSourceUrl.includes('cdn.jsdelivr.net')
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/5 bg-black/20 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">CDN Direto / GitHub</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        .../logos/{'{slug}'}.png
                      </div>
                    </button>
                  </div>
                </div>

                {/* Live Badges Preview Box */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pré-visualização em Tempo Real dos Escudos:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Atualiza instantaneamente ao digitar a fonte
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                    {[
                      { name: 'Flamengo', slug: 'flamengo', bg: '#c70000' },
                      { name: 'Palmeiras', slug: 'palmeiras', bg: '#006437' },
                      { name: 'Corinthians', slug: 'corinthians', bg: '#111111' },
                      { name: 'São Paulo', slug: 'sao-paulo', bg: '#dc2626' },
                      { name: 'Real Madrid', slug: 'real-madrid', bg: '#1e3a8a' },
                    ].map((team) => {
                      const logoUrl = buildBadgeUrl(team.slug, team.name, formState.teamBadgesSourceUrl);
                      return (
                        <div
                          key={team.slug}
                          className="flex flex-col items-center justify-center p-2.5 bg-[#0e1320] border border-white/5 rounded-xl hover:border-white/20 transition-all text-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center p-1 overflow-hidden shadow-inner mb-1.5">
                            <img
                              src={logoUrl}
                              alt={team.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.fallback-initials')) {
                                  const fallback = document.createElement('span');
                                  fallback.className = 'fallback-initials text-[10px] font-black text-slate-400';
                                  fallback.innerText = team.name.slice(0, 3).toUpperCase();
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white truncate max-w-full">
                            {team.name}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono truncate max-w-full">
                            {team.slug}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & SET AS DEFAULT */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`p-5 rounded-2xl border ${
                  customMeta.hasDefault
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-amber-950/20 border-amber-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      customMeta.hasDefault ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {customMeta.hasDefault ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <BookmarkCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Status do Padrão do Sistema</span>
                      {customMeta.hasDefault ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Personalizado Ativo
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Padrão Original de Fábrica
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {customMeta.hasDefault
                        ? `Seu padrão personalizado foi fixado em ${customMeta.savedAt}. Suas alterações de canais, categorias e links estão seguras e nunca serão perdidas se o navegador reiniciar.`
                        : 'Você ainda está utilizando o padrão original do sistema. Ao clicar no botão abaixo, todas as suas personalizações atuais (canais, URLs, categorias e marca) serão salvas como seu padrão oficial permanente.'}
                    </p>

                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={handleSetAsDefault}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer ${
                          isDefaultFeedback
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                        }`}
                      >
                        {isDefaultFeedback ? (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Definido como Meu Padrão Oficial!</span>
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="w-4 h-4 text-slate-950" />
                            <span>Definir Estado Atual como Meu Padrão</span>
                          </>
                        )}
                      </button>

                      {customMeta.hasDefault && (
                        <button
                          type="button"
                          onClick={handleRestoreCustomDefault}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Recarregar Meu Padrão</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* JSON Backup & Restore Card */}
              <div className="bg-[#131926] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-blue-400" />
                    <span>Backup Externo em Arquivo JSON</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Exporte todas as suas configurações em um arquivo seguro para guardar no computador ou transferir para outros navegadores.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex items-center justify-center gap-2 p-3 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-blue-500/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm group"
                  >
                    <Download className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>Exportar Arquivo de Backup (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-3 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm group"
                  >
                    <Upload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Importar Arquivo de Backup (JSON)</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json,application/json"
                    className="hidden"
                  />
                </div>

                {backupFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                      backupFeedback.includes('sucesso')
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-950/40 text-red-300 border border-red-500/30'
                    }`}
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{backupFeedback}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          {/* Left Actions: Set as Default & Reset with Menu */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Primary 'Definir Atual como Padrão' Button */}
            <button
              type="button"
              onClick={handleSetAsDefault}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer ${
                isDefaultFeedback
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
              title="Fixa todas as alterações atuais como padrão oficial para não perder suas personalizações"
            >
              {isDefaultFeedback ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Definido como Meu Padrão!</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4 text-slate-950" />
                  <span>Definir Atual como Meu Padrão</span>
                </>
              )}
            </button>

            {/* Reset Menu Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowResetMenu(!showResetMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Opções de restauração"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar...</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showResetMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#131926] border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 mb-1">
                    Opções de Restauração
                  </div>

                  {customMeta.hasDefault && (
                    <button
                      type="button"
                      onClick={handleRestoreCustomDefault}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <div>Restaurar Meu Padrão Salvo</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          Recarrega suas personalizações fixadas ({customMeta.savedAt})
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRestoreFactory}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <div>
                      <div>Restaurar Padrão de Fábrica</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        Volta à configuração limpa original do sistema
                      </div>
                    </div>
                  </button>

                  <div className="pt-1 mt-1 border-t border-white/5 text-right">
                    <button
                      type="button"
                      onClick={() => setShowResetMenu(false)}
                      className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: Cancel & Save */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-md shadow-red-600/30 cursor-pointer"
            >
              {isSavedFeedback ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
