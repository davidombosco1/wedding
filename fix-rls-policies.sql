-- Script para corrigir políticas RLS e resolver erro 406
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'guests';

-- 2. Habilitar RLS se não estiver
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow public read" ON guests;
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;
DROP POLICY IF EXISTS "Allow single read" ON guests;

-- 4. Criar política de SELECT (leitura pública)
CREATE POLICY "Allow public read" ON guests
  FOR SELECT
  USING (true);

-- 5. Criar política de UPDATE (atualização - apenas se não confirmou)
CREATE POLICY "Allow update if not confirmed" ON guests
  FOR UPDATE
  USING (NOT confirmed)
  WITH CHECK (NOT confirmed);

-- 6. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'guests';

-- 7. Testar se consegue ler
SELECT * FROM guests WHERE code = 'TESTE123' LIMIT 1;



