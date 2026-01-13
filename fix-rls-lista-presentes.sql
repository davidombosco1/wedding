-- Script para corrigir políticas RLS da tabela lista_presentes
-- Execute este script no SQL Editor do Supabase
-- Este script cria políticas mais permissivas para permitir UPDATE

-- 1. Remover TODAS as políticas de UPDATE existentes
DROP POLICY IF EXISTS "Allow update to confirmed" ON lista_presentes;
DROP POLICY IF EXISTS "Allow public update" ON lista_presentes;
DROP POLICY IF EXISTS "Allow update" ON lista_presentes;

-- 2. Criar política de UPDATE PERMISSIVA (permite qualquer UPDATE)
-- ATENÇÃO: Esta política permite UPDATE em qualquer registro
-- A validação de status é feita no JavaScript
CREATE POLICY "Allow public update" ON lista_presentes
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
WHERE tablename = 'lista_presentes' AND cmd = 'UPDATE';

-- 4. Testar UPDATE manualmente (opcional - descomente para testar)
/*
UPDATE lista_presentes 
SET status = 'confirmado', 
    nome_convidado = 'Teste',
    data_confirmacao = now()
WHERE code = 'CODIGO_DO_PRESENTE' AND status = 'disponivel';
*/

-- NOTA: A política mais permissiva (comentada acima) permite qualquer UPDATE.
-- Use apenas para testes. Em produção, prefira a política mais restritiva.
