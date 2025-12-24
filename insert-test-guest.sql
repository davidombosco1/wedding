-- Script para inserir um convidado de TESTE
-- Execute este script no SQL Editor do Supabase

-- Inserir convidado de teste
INSERT INTO guests (name, code, companions)
VALUES (
  'João Silva (TESTE)',
  'TESTE123',
  '[{"name": "Maria Silva", "confirmed": false}]'::jsonb
)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name,
    companions = EXCLUDED.companions;

-- Verificar se foi inserido
SELECT 
  id,
  name,
  code,
  confirmed,
  companions,
  created_at
FROM guests 
WHERE code = 'TESTE123';



