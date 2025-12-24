-- Script para corrigir política de UPDATE e resolver erro 401
-- Execute este script no SQL Editor do Supabase

-- 1. Remover política de UPDATE antiga (se existir)
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;
DROP POLICY IF EXISTS "Allow public update" ON guests;

-- 2. Criar política de UPDATE mais permissiva (para testes)
-- Esta política permite atualizar qualquer registro que ainda não foi confirmado
CREATE POLICY "Allow update if not confirmed" ON guests
  FOR UPDATE
  USING (NOT confirmed)
  WITH CHECK (true);

-- 3. Alternativa: Se a política acima não funcionar, use esta (mais permissiva)
-- ATENÇÃO: Esta política permite atualizar qualquer registro (use apenas para testes)
-- Descomente as linhas abaixo se a política acima não funcionar:

/*
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;
CREATE POLICY "Allow public update" ON guests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
*/

-- 4. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'guests' AND cmd = 'UPDATE';

-- 5. Testar UPDATE manualmente (opcional)
-- Descomente para testar:
/*
UPDATE guests 
SET phone = '11999999999'
WHERE code = 'TESTE123' AND confirmed = false;
*/



