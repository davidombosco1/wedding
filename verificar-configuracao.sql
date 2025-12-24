-- Script para verificar se tudo está configurado corretamente
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e tem as colunas corretas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'guests'
ORDER BY ordinal_position;

-- 2. Verificar se o índice único no code existe
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'guests';

-- 3. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'guests';

-- 4. Verificar políticas RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'guests';

-- 5. Contar quantos convidados existem
SELECT COUNT(*) as total_guests FROM guests;

-- 6. Listar todos os convidados (se houver)
SELECT 
  name,
  code,
  confirmed,
  created_at
FROM guests
ORDER BY created_at DESC
LIMIT 10;



