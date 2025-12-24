-- Script para atualizar políticas RLS e permitir desfazer confirmação
-- Execute este script no SQL Editor do Supabase

-- 1. Remover política de UPDATE antiga
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;
DROP POLICY IF EXISTS "Allow public update" ON guests;

-- 2. Criar política de UPDATE mais permissiva
--    A validação de 60 dias é feita no JavaScript
--    Esta política permite UPDATE para registros não confirmados ou confirmados
CREATE POLICY "Allow update confirmation" ON guests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- NOTA: A validação de 60 dias antes do casamento (31/05/2026) é feita no JavaScript
-- Esta política permite UPDATE, mas o código JavaScript valida se está dentro do prazo

-- 3. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'guests' AND cmd = 'UPDATE';

-- NOTA: A verificação de 60 dias também é feita no JavaScript
-- Esta política permite UPDATE, mas o JavaScript valida o prazo

