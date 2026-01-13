-- Script para DESABILITAR TEMPORARIAMENTE o RLS na tabela lista_presentes
-- Execute este script APENAS PARA TESTES
-- ATENÇÃO: Isso remove toda a segurança RLS. Use apenas para diagnosticar o problema.

-- 1. Desabilitar RLS temporariamente
ALTER TABLE lista_presentes DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'lista_presentes';
-- Deve retornar rowsecurity = false

-- 3. Testar UPDATE manualmente
-- Descomente e ajuste o código para testar:
/*
UPDATE lista_presentes 
SET status = 'confirmado', 
    nome_convidado = 'Teste',
    data_confirmacao = now()
WHERE code = 'CODIGO_DO_PRESENTE' AND status = 'disponivel';
*/

-- IMPORTANTE: Após os testes, reabilite o RLS e crie as políticas corretas:
/*
ALTER TABLE lista_presentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public update" ON lista_presentes;
CREATE POLICY "Allow public update" ON lista_presentes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
*/
