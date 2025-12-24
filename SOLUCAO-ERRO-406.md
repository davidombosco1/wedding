# 🔧 Solução para Erro 406 (Not Acceptable)

O erro 406 geralmente indica problema com as **Políticas RLS (Row Level Security)** no Supabase.

## ✅ Solução Rápida

### Passo 1: Executar Script SQL

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `fix-rls-policies.sql`
3. **Copie TODO o conteúdo** e cole no SQL Editor
4. Clique em **Run** (ou Ctrl+Enter)

Este script vai:
- ✅ Habilitar RLS na tabela
- ✅ Remover políticas antigas (se houver)
- ✅ Criar políticas corretas de leitura e atualização

### Passo 2: Verificar no Supabase Dashboard

1. Vá em **Authentication** → **Policies**
2. Ou vá em **Table Editor** → `guests` → **Policies**
3. Você deve ver duas políticas:
   - `Allow public read` (SELECT)
   - `Allow update if not confirmed` (UPDATE)

### Passo 3: Testar Novamente

1. Recarregue a página do site
2. Tente buscar o código `TESTE123` novamente
3. Deve funcionar agora! ✅

## 🔍 Verificação Manual

Se ainda não funcionar, execute este SQL para verificar:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'guests';

-- Verificar políticas existentes
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'guests';
```

Você deve ver:
- `rowsecurity = true`
- Pelo menos uma política de SELECT
- Pelo menos uma política de UPDATE

## ❌ Se Ainda Não Funcionar

### Verificar Headers da API

1. No Supabase Dashboard, vá em **Settings** → **API**
2. Verifique se a **anon key** está correta no `index.html`
3. Verifique se há alguma restrição em **Allowed Origins**

### Verificar se a Tabela Existe

```sql
SELECT * FROM guests LIMIT 1;
```

Se der erro, a tabela não existe ou você não tem permissão.

### Verificar Código do Convidado

```sql
SELECT name, code, confirmed FROM guests WHERE code = 'TESTE123';
```

Se não retornar nada, o convidado não existe. Execute o `insert-test-guest.sql` novamente.



