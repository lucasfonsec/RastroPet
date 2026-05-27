# 🐾 RastroPet - Plataforma SaaS de Localização Inteligente de Pets

O RastroPet é uma plataforma SaaS moderna desenvolvida para solucionar um problema crítico: a perda de animais de estimação. Utilizando o cruzamento de dados de Câmeras de Segurança e Inteligência Artificial, o sistema analisa vídeos enviados em busca do seu pet.

## 🚀 Tecnologias (Tech Stack)

- **Frontend:** React + TypeScript + Vite
- **Estilização:** Tailwind CSS (Utilitários e glassmorphism premium)
- **Roteamento:** React Router DOM
- **Gerenciamento de Estado:** Zustand
- **Backend / BaaS:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage (Buckets para imagens e vídeos)
- **Mapas:** Google Maps API (`@react-google-maps/api`)
- **Ícones:** Lucide React

---

## 🛠️ Como rodar o projeto localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto (já deve estar lá se usou o gerador) contendo as chaves do seu Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
   VITE_GOOGLE_MAPS_API_KEY=sua_chave_do_google_aqui
   ```

3. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:5173`.

---

## 🗺️ Como configurar o Google Maps

O mapa inteligente do sistema precisa de uma API Key do Google.
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto.
3. Vá em "APIs & Services" > "Library" e ative a **Maps JavaScript API**.
4. Vá em "Credentials" e crie uma nova API Key.
5. Adicione a restrição de domínio (se for publicar) e cole a chave no seu arquivo `.env` como `VITE_GOOGLE_MAPS_API_KEY`.

---

## 🤖 Como conectar a IA Real de Visão Computacional

Atualmente, o sistema possui a tabela `camera_videos` e um painel de Admin onde você pode fazer upload de vídeos de simulação. O botão azul de "Simular Detecção IA" faz o papel da inteligência.

Para plugar uma IA real (como AWS Rekognition, Google Cloud Vision, OpenAI GPT-4V ou Roboflow):

1. **Supabase Edge Functions**: Crie uma Edge Function no Supabase (em Deno/TypeScript).
2. **Trigger do Banco**: Crie um *Database Webhook* no Supabase que dispara toda vez que um novo registro é inserido na tabela `camera_videos`.
3. **Análise**: A Edge Function recebe o webhook com o link público do vídeo, envia os frames (ou o vídeo completo) para a API externa da IA pedindo para procurar um cachorro ou gato com as características cadastradas na tabela `lost_alerts`.
4. **Retorno (Match)**: Se a IA retornar uma alta probabilidade, a Edge Function roda um comando SQL injetando a latitude e longitude da câmera no alerta e grava em `ai_matches`. 

---

## ☁️ Como publicar no GitHub e fazer o Deploy na Vercel

O RastroPet já está otimizado para deploy contínuo!

### 1. Versionamento no GitHub
Abra seu terminal na pasta do projeto e rode:
```bash
git init
git add .
git commit -m "Primeiro commit - Plataforma RastroPet"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/rastropet.git
git push -u origin main
```

### 2. Deploy Automático na Vercel
1. Crie uma conta em [Vercel.com](https://vercel.com).
2. Clique em **Add New...** > **Project**.
3. Importe o seu repositório do GitHub (`rastropet`).
4. **Importante:** Na seção de *Environment Variables* da Vercel, cole as variáveis do seu `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`
5. Clique em **Deploy**. 

Pronto! Em 2 minutos seu sistema SaaS estará online no ar, responsivo e pronto para uso mundial!
