-- Script SQL para adicionar a propriedade is_child ao campo companions (JSONB)
-- Execute este script no SQL Editor do Supabase

-- Este script atualiza todos os registros existentes adicionando is_child: false
-- para todos os companions que ainda não possuem essa propriedade

UPDATE guests
SET companions = (
    SELECT jsonb_agg(
        CASE 
            WHEN companion ? 'is_child' THEN companion
            ELSE companion || '{"is_child": false}'::jsonb
        END
    )
    FROM jsonb_array_elements(companions) AS companion
)
WHERE companions IS NOT NULL 
  AND jsonb_array_length(companions) > 0
  AND EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(companions) AS c
      WHERE NOT (c ? 'is_child')
  );

-- Verificar os resultados
SELECT 
    id,
    name,
    code,
    companions
FROM guests
WHERE companions IS NOT NULL 
  AND jsonb_array_length(companions) > 0
LIMIT 5;

-- Para adicionar is_child: true a um companion específico manualmente:
-- UPDATE guests
-- SET companions = (
--     SELECT jsonb_agg(
--         CASE 
--             WHEN companion->>'name' = 'Nome do Acompanhante' 
--             THEN companion || '{"is_child": true}'::jsonb
--             ELSE companion
--         END
--     )
--     FROM jsonb_array_elements(companions) AS companion
-- )
-- WHERE code = 'CODIGO_DO_CONVIDADO';

