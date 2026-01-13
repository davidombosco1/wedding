-- Script para corrigir políticas RLS e permitir atualizações de confirmações
-- Execute este script no SQL Editor do Supabase
-- Este script permite que convidados confirmados possam editar suas confirmações

-- 1. Remover políticas de UPDATE antigas
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;
DROP POLICY IF EXISTS "Allow public update" ON guests;
DROP POLICY IF EXISTS "Allow update confirmation" ON guests;

-- 2. Criar política de UPDATE permissiva
--    A validação de prazo (confirmation_deadline) é feita no JavaScript
--    Esta política permite UPDATE para qualquer registro
CREATE POLICY "Allow update confirmation" ON guests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 3. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'guests' AND cmd = 'UPDATE';

-- NOTA: A validação de confirmation_deadline é feita no JavaScript
-- Esta política permite UPDATE, mas o código JavaScript valida se está dentro do prazo
