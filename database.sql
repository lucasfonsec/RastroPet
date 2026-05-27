-- ==============================================================================
-- RASTROPET - SETUP DO BANCO DE DADOS (SUPABASE POSTGRESQL)
-- ==============================================================================

-- 1. Criação das Tabelas

-- Tabela de Perfis de Usuários (Estendendo a autenticação do Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Pets
CREATE TABLE public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL, -- Ex: Cachorro, Gato
  breed TEXT,
  color TEXT,
  weight FLOAT,
  birth_date DATE,
  microchip TEXT,
  features TEXT, -- Características marcantes
  image_url TEXT,
  status TEXT DEFAULT 'safe' CHECK (status IN ('safe', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Vacinas
CREATE TABLE public.vaccines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_given DATE NOT NULL,
  next_due DATE,
  veterinarian TEXT
);

-- Tabela de Histórico Médico / Medicações
CREATE TABLE public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date_recorded DATE DEFAULT CURRENT_DATE,
  document_url TEXT
);

-- Tabela de Câmeras de Segurança (Gerenciadas por Admins)
CREATE TABLE public.cameras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline')),
  street TEXT NOT NULL,
  number TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Gravações das Câmeras (Vídeos para IA analisar)
CREATE TABLE public.camera_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camera_id UUID REFERENCES public.cameras(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Alertas de Pets Perdidos
CREATE TABLE public.lost_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_seen_location TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Resultados/Matches da IA
CREATE TABLE public.ai_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.lost_alerts(id) ON DELETE CASCADE NOT NULL,
  camera_id UUID REFERENCES public.cameras(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.camera_videos(id) ON DELETE CASCADE,
  confidence_score FLOAT NOT NULL, -- Ex: 0.95 (95%)
  frame_image_url TEXT NOT NULL, -- Imagem exata de onde o pet foi visto
  match_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. Configuração de ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Pets (Dono vê seus pets, Admin vê todos)
CREATE POLICY "Users can view their own pets" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pets" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pets" ON public.pets FOR DELETE USING (auth.uid() = user_id);
-- Permitir que admins vejam pets (Necessário para a IA buscar/listar todos os pets perdidos)
CREATE POLICY "Admins can view all pets" ON public.pets FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para Alertas (Todos podem ver alertas ativos)
CREATE POLICY "Anyone can view active lost alerts" ON public.lost_alerts FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create their own alerts" ON public.lost_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.lost_alerts FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para Câmeras (Só admins criam/editam, usuários podem ver)
CREATE POLICY "Anyone can view cameras" ON public.cameras FOR SELECT USING (true);
CREATE POLICY "Only admins can insert cameras" ON public.cameras FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can update cameras" ON public.cameras FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==============================================================================
-- 3. Triggers e Funções (Automagicamente criar perfil ao registrar no Auth)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. Buckets do Storage
-- (Nota: Para executar isso, você precisa estar no painel do Supabase -> Storage,
--  ou rodar com as permissões de superusuário do banco)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('pets_images', 'pets_images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('cameras_videos', 'cameras_videos', true) ON CONFLICT DO NOTHING;
