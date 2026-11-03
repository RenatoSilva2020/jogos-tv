# ⚽ Portal de Canais Esportivos & Agenda 365Scores

Hub esportivo moderno com lineup de canais (Premiere, SporTV, ESPN, CazéTV, BandSports, Paramount+, TNT, etc.), player integrado e **sincronização automática com a agenda ao vivo do 365Scores** (escudos oficiais, horários, resultados e detecção automática de canal de transmissão).

---

## 🚀 Como Publicar no GitHub Pages (100% no GitHub, Sem Vercel)

O projeto já vem pronto com o fluxo automatizado do **GitHub Actions** em `.github/workflows/deploy.yml`. Tudo é construído e hospedado gratuitamente pelo próprio GitHub!

### Passo 1: Criar o Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new)
2. Dê um nome ao seu repositório (exemplo: `jogos-tv` ou `futebol-canais`)
3. Escolha **Público** (ou Privado) e clique em **Create repository**

### Passo 2: Enviar o Projeto para o GitHub
No seu computador ou terminal na pasta do projeto:
```bash
git init
git add .
git commit -m "feat: site esportivo com agenda 365Scores"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
git push -u origin main
```

*(Ou se preferir pela interface web do GitHub: clique em **"uploading an existing file"** e arraste os arquivos do projeto).*

### Passo 3: Ativar o GitHub Pages com 1 Clique
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações) no topo.
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment > Source**, selecione:
   👉 **GitHub Actions**
4. Pronto! O GitHub vai rodar automaticamente a compilação na aba **Actions**.
5. Em cerca de 1 a 2 minutos, seu link oficial estará no ar:
   👉 `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

Toda vez que você fizer um novo `git push`, o GitHub atualiza seu site automaticamente!

---

## 💻 Como Rodar no Computador (Local)

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse no navegador: `http://localhost:3000`

3. **Gerar versão de produção (opcional):**
   ```bash
   npm run build
   ```

---

## 📁 Estrutura do Projeto

- `.github/workflows/deploy.yml`: Fluxo do GitHub Actions para compilar e publicar automaticamente no GitHub Pages.
- `vite.config.ts`: Configurado com `base: './'` para funcionar em qualquer subpasta do GitHub Pages.
- `src/services/matchesFetcher.ts`: Busca unificada dos jogos direto da API do 365Scores com CORS liberado, suporte a ontém/hoje/amanhã e pareamento de canais.
- `src/services/appSettings.ts`: Gerenciamento do lineup padrão, personalizações de marca e salvamento local.
- `src/data/channelsData.ts`: Lista completa de canais pré-configurados (Premiere, SporTV, ESPN, CazéTV, etc.).
- `src/components/`: Componentes visuais e modais de personalização e exportação.
