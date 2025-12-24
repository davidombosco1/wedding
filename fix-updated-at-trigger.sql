-- Script para corrigir o trigger de updated_at
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a função existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- 2. Criar ou substituir a função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;

-- 4. Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'guests';

-- 6. Testar o trigger (opcional - descomente para testar)
/*
UPDATE guests 
SET phone = 'TESTE_TRIGGER'
WHERE code = 'TESTE123'
RETURNING updated_at;
*/



