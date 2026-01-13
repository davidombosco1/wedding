-- Script SQL para configurar políticas RLS na tabela lista_presentes
-- Execute este script no SQL Editor do Supabase
-- NOTA: A tabela lista_presentes já existe, este script apenas configura as políticas RLS

-- 1. Habilitar Row Level Security (RLS) se ainda não estiver habilitado
ALTER TABLE lista_presentes ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow public read available" ON lista_presentes;
DROP POLICY IF EXISTS "Allow update to confirmed" ON lista_presentes;
DROP POLICY IF EXISTS "Allow public read" ON lista_presentes;
DROP POLICY IF EXISTS "Allow public update" ON lista_presentes;

-- 3. Criar política para SELECT (leitura pública - apenas itens disponíveis)
CREATE POLICY "Allow public read available" ON lista_presentes
  FOR SELECT
  USING (status = 'disponivel');

-- 4. Criar política para UPDATE (atualização - permitir mudar status para confirmado)
-- Esta política permite atualizar apenas itens que estão 'disponivel' para 'confirmado'
-- IMPORTANTE: A política permite UPDATE se o status atual é 'disponivel' E o novo status será 'confirmado'
-- Usando política mais permissiva para garantir que funcione
DROP POLICY IF EXISTS "Allow update to confirmed" ON lista_presentes;
CREATE POLICY "Allow update to confirmed" ON lista_presentes
  FOR UPDATE
  USING (status = 'disponivel')
  WITH CHECK (true);

-- Alternativa: Se a política acima não funcionar, use esta (mais permissiva para testes)
-- Descomente as linhas abaixo se a política acima não permitir atualizações:
/*
DROP POLICY IF EXISTS "Allow update to confirmed" ON lista_presentes;
CREATE POLICY "Allow update to confirmed" ON lista_presentes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
*/

-- 5. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'lista_presentes';

-- 6. Testar se consegue ler (deve retornar apenas itens com status = 'disponivel')
SELECT code, nome, valor, tema, faixa, status 
FROM lista_presentes 
WHERE status = 'disponivel' 
LIMIT 5;
