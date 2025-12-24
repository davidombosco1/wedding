-- Script SQL para criar a tabela guests no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar a tabela guests
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  confirmed boolean NOT NULL DEFAULT false,
  companions jsonb DEFAULT '[]'::jsonb,
  phone text,
  message text,
  confirmed_at timestamptz,
  confirmed_guests text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Criar índice único no campo code (garantir que códigos sejam únicos)
CREATE UNIQUE INDEX IF NOT EXISTS guests_code_unique ON guests(code);

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS (permitir leitura e atualização pública)
-- Política para SELECT (leitura)
DROP POLICY IF EXISTS "Allow public read" ON guests;
CREATE POLICY "Allow public read" ON guests
  FOR SELECT
  USING (true);

-- Política para UPDATE (atualização - apenas se não confirmou)
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;
CREATE POLICY "Allow update if not confirmed" ON guests
  FOR UPDATE
  USING (NOT confirmed)
  WITH CHECK (NOT confirmed);

-- 7. Inserir um convidado de TESTE
INSERT INTO guests (name, code, companions)
VALUES (
  'João Silva (TESTE)',
  'TESTE123',
  '[{"name": "Maria Silva", "confirmed": false}]'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- Verificar se foi criado corretamente
SELECT * FROM guests WHERE code = 'TESTE123';



