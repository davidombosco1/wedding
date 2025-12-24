# 🔧 Solução para Erro 401 (Unauthorized) na Atualização

O erro 401 indica que a **política de UPDATE** não está permitindo a atualização do registro.

## ✅ Solução Rápida

### Passo 1: Executar Script SQL

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `fix-update-policy.sql`
3. **Copie TODO o conteúdo** e cole no SQL Editor
4. Clique em **Run** (ou Ctrl+Enter)

Este script vai:
- ✅ Remover políticas de UPDATE antigas
- ✅ Criar uma política de UPDATE que permite atualizar registros não confirmados

### Passo 2: Verificar Políticas

1. Vá em **Table Editor** → `guests` → **Policies**
2. Você deve ver uma política de UPDATE chamada:
   - `Allow update if not confirmed`

### Passo 3: Testar Novamente

1. Recarregue a página do site
2. Busque o código `TESTE123`
3. Preencha o formulário e confirme
4. Deve funcionar agora! ✅

## 🔍 Se Ainda Não Funcionar

### Opção 1: Política Mais Permissiva (Apenas para Testes)

Execute este SQL no Supabase:

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;

-- Criar política mais permissiva (permite qualquer UPDATE)
CREATE POLICY "Allow public update" ON guests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

⚠️ **ATENÇÃO**: Esta política permite atualizar qualquer registro. Use apenas para testes!

### Opção 2: Verificar se RLS Está Bloqueando

Execute este SQL para verificar:

```sql
-- Verificar políticas de UPDATE
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'guests' AND cmd = 'UPDATE';
```

Se não retornar nada, a política não existe. Execute o script `fix-update-policy.sql`.

### Opção 3: Testar UPDATE Manualmente

Execute este SQL para testar se consegue atualizar:

```sql
UPDATE guests 
SET phone = '11999999999'
WHERE code = 'TESTE123' AND confirmed = false
RETURNING *;
```

Se der erro, o problema é nas políticas. Se funcionar, o problema pode ser no código JavaScript.

## 📝 Política Recomendada para Produção

Depois de testar, você pode usar uma política mais segura:

```sql
DROP POLICY IF EXISTS "Allow update if not confirmed" ON guests;

CREATE POLICY "Allow update if not confirmed" ON guests
  FOR UPDATE
  USING (NOT confirmed)
  WITH CHECK (
    -- Permite atualizar apenas se não confirmou
    NOT confirmed OR
    -- Ou se está apenas atualizando campos permitidos
    (confirmed = true AND confirmed_at IS NOT NULL)
  );
```



