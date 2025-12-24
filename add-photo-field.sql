-- Script para adicionar campo de foto na tabela guests
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna photo_url na tabela guests
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN guests.photo_url IS 'URL da foto do convidado (pode ser URL externa ou caminho relativo)';

-- 3. Verificar se a coluna foi criada
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'guests' AND column_name = 'photo_url';

-- 4. Exemplo de como atualizar um convidado com foto:
-- UPDATE guests 
-- SET photo_url = 'https://exemplo.com/fotos/joao-silva.jpg'
-- WHERE code = 'ABC123';

-- Ou se as fotos estiverem na pasta do projeto:
-- UPDATE guests 
-- SET photo_url = 'fotos/joao-silva.jpg'
-- WHERE code = 'ABC123';



