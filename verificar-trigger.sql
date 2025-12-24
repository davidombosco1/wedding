-- Script para verificar e corrigir o trigger updated_at
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a coluna updated_at existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'guests' AND column_name = 'updated_at';

-- 2. Verificar se a função existe
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- 3. Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'guests' 
  AND trigger_name = 'update_guests_updated_at';

-- 4. Se o trigger não existir, criar a função
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;

-- 6. Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)  -- Só atualiza se houver mudanças
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Verificar se foi criado corretamente
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'guests';

-- 8. Testar o trigger (opcional)
-- Descomente para testar:
/*
-- Verificar updated_at antes
SELECT code, updated_at FROM guests WHERE code = 'TESTE123';

-- Fazer um UPDATE
UPDATE guests 
SET phone = 'TESTE_TRIGGER_' || now()::text
WHERE code = 'TESTE123';

-- Verificar updated_at depois
SELECT code, updated_at FROM guests WHERE code = 'TESTE123';
*/



