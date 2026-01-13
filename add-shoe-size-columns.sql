-- Script SQL para adicionar colunas shoe_size e confirmation_deadline
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna shoe_size na tabela guests (string nullable)
-- Para homens, use 'disabled'. Para mulheres, use uma das opções: '33/34', '35/36', '37/38', '39/40', '41/42'
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS shoe_size text;

-- 2. Adicionar coluna confirmation_deadline (data limite para confirmação)
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS confirmation_deadline date;

-- 3. Atualizar companions existentes para incluir shoe_size
-- Adiciona shoe_size: null para companions que não possuem essa propriedade
UPDATE guests
SET companions = (
    SELECT jsonb_agg(
        CASE 
            WHEN companion ? 'shoe_size' THEN companion
            ELSE companion || '{"shoe_size": null}'::jsonb
        END
    )
    FROM jsonb_array_elements(companions) AS companion
)
WHERE companions IS NOT NULL 
  AND jsonb_array_length(companions) > 0
  AND EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(companions) AS c
      WHERE NOT (c ? 'shoe_size')
  );

-- 4. Verificar os resultados
SELECT 
    id,
    name,
    code,
    shoe_size,
    confirmation_deadline,
    companions
FROM guests
LIMIT 5;

-- Exemplo de como atualizar um convidado mulher com numeração:
-- UPDATE guests
-- SET shoe_size = '37/38'
-- WHERE code = 'CODIGO_DO_CONVIDADO';

-- Exemplo de como atualizar um convidado homem:
-- UPDATE guests
-- SET shoe_size = 'disabled'
-- WHERE code = 'CODIGO_DO_CONVIDADO';

-- Exemplo de como definir data limite de confirmação:
-- UPDATE guests
-- SET confirmation_deadline = '2026-03-31'
-- WHERE code = 'CODIGO_DO_CONVIDADO';

-- Exemplo de como atualizar um companion mulher com numeração:
-- UPDATE guests
-- SET companions = (
--     SELECT jsonb_agg(
--         CASE 
--             WHEN companion->>'name' = 'Nome do Acompanhante' 
--             THEN companion || '{"shoe_size": "37/38"}'::jsonb
--             ELSE companion
--         END
--     )
--     FROM jsonb_array_elements(companions) AS companion
-- )
-- WHERE code = 'CODIGO_DO_CONVIDADO';

-- Exemplo de como atualizar um companion homem:
-- UPDATE guests
-- SET companions = (
--     SELECT jsonb_agg(
--         CASE 
--             WHEN companion->>'name' = 'Nome do Acompanhante' 
--             THEN companion || '{"shoe_size": "disabled"}'::jsonb
--             ELSE companion
--         END
--     )
--     FROM jsonb_array_elements(companions) AS companion
-- )
-- WHERE code = 'CODIGO_DO_CONVIDADO';
