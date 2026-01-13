# 🔧 Solução: Alterações de Confirmação Não Funcionam Após Primeira Confirmação

## ❌ Problema

Após salvar uma confirmação pela primeira vez, não é possível fazer alterações subsequentes. Isso acontece porque a política RLS (Row Level Security) do Supabase está bloqueando atualizações de registros confirmados.

## ✅ Solução

### Passo 1: Executar Script SQL

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `fix-rls-allow-updates.sql`
3. **Copie TODO o conteúdo** e cole no SQL Editor
4. Clique em **Run** (ou Ctrl+Enter)

Este script vai:
- ✅ Remover políticas de UPDATE antigas que bloqueiam atualizações
- ✅ Criar uma política permissiva que permite editar confirmações
- ✅ A validação de `confirmation_deadline` continua sendo feita no JavaScript

### Passo 2: Verificar Políticas

1. Vá em **Table Editor** → `guests` → **Policies**
2. Você deve ver uma política de UPDATE chamada:
   - `Allow update confirmation`

### Passo 3: Testar Novamente

1. Recarregue a página do site
2. Busque um código de convidado
3. Confirme a presença
4. Tente fazer uma alteração (adicionar/remover convidado, mudar numeração, etc.)
5. Deve funcionar agora! ✅

## 🔍 Como Funciona

- **Política RLS**: Permite UPDATE em qualquer registro (confirmado ou não)
- **Validação JavaScript**: Verifica se a data atual é menor ou igual a `confirmation_deadline`
- **Recarregamento**: Após salvar, os dados são recarregados do banco para garantir sincronização

## 📝 Nota Importante

A política RLS permite UPDATE, mas o código JavaScript valida se está dentro do prazo (`confirmation_deadline`). Isso significa que:
- Se `confirmation_deadline` for `null`, permite edição sempre
- Se `confirmation_deadline` existir, só permite edição até essa data
- A segurança é mantida pela validação no JavaScript
