# 🧪 Teste Rápido - Sistema de Confirmação

## ✅ Checklist Antes de Testar

- [ ] Credenciais do Supabase configuradas no `index.html`
- [ ] Tabela `guests` criada no Supabase
- [ ] Políticas RLS configuradas
- [ ] Convidado de teste inserido no banco

## 🚀 Passo a Passo para Testar

### 1️⃣ Garantir que há um convidado de teste

**No Supabase:**

1. Abra o **SQL Editor**
2. Execute este comando:

```sql
-- Inserir ou atualizar convidado de teste
INSERT INTO guests (name, code, companions, confirmed)
VALUES (
  'João Silva (TESTE)',
  'TESTE123',
  '[{"name": "Maria Silva", "confirmed": false}]'::jsonb,
  false
)
ON CONFLICT (code) DO UPDATE 
SET 
  name = EXCLUDED.name,
  companions = EXCLUDED.companions,
  confirmed = false,
  phone = NULL,
  message = NULL,
  confirmed_at = NULL,
  confirmed_guests = '{}';
```

3. Verifique se foi inserido:

```sql
SELECT name, code, confirmed FROM guests WHERE code = 'TESTE123';
```

### 2️⃣ Abrir o site no navegador

1. Abra o arquivo `index.html` no navegador
2. **IMPORTANTE**: Abra o **Console do Desenvolvedor** (F12 ou Cmd+Option+I no Mac)
3. Vá para a aba **Console** para ver possíveis erros

### 3️⃣ Testar a busca por código

1. Role até a seção **"Confirmação de Presença"**
2. No campo de código, digite: **TESTE123**
3. Clique em **"Buscar Convite"**

**O que deve acontecer:**
- ✅ O campo de código desaparece
- ✅ Aparece o nome: "João Silva (TESTE)"
- ✅ Aparece o código: "TESTE123"
- ✅ Aparece um checkbox para "Maria Silva" (acompanhante)
- ✅ O checkbox do convidado principal está marcado e desabilitado

**Se der erro:**
- Veja a mensagem de erro na tela
- Veja o Console do navegador (F12) para mais detalhes

### 4️⃣ Testar a confirmação

1. Marque o checkbox do acompanhante "Maria Silva"
2. Preencha o campo **Telefone** (ex: `(11) 99999-9999`)
3. Opcional: Preencha uma mensagem
4. Clique em **"Confirmar Presença"**

**O que deve acontecer:**
- ✅ Mensagem de sucesso aparece
- ✅ Formulário fica desabilitado
- ✅ Botão "Voltar" aparece

### 5️⃣ Verificar no banco de dados

**No Supabase:**

1. Vá em **Table Editor** → **guests**
2. Encontre o registro com código `TESTE123`
3. Verifique se:
   - ✅ `confirmed` = `true`
   - ✅ `phone` tem o telefone que você digitou
   - ✅ `confirmed_at` tem uma data/hora
   - ✅ `confirmed_guests` tem `["João Silva (TESTE)", "Maria Silva"]`
   - ✅ `companions` mostra `[{"name": "Maria Silva", "confirmed": true}]`

## 🔍 Problemas Comuns e Soluções

### ❌ Erro: "Supabase não configurado"

**Solução:**
1. Abra `index.html`
2. Verifique as linhas 238-239:
   ```javascript
   const SUPABASE_URL = 'https://cevzvsfzlknqdtpmlckv.supabase.co';
   const SUPABASE_ANON_KEY = 'sua-chave-aqui';
   ```
3. Certifique-se de que as credenciais estão corretas

### ❌ Erro: "Código não encontrado"

**Solução:**
1. Verifique no Supabase se o convidado existe:
   ```sql
   SELECT * FROM guests WHERE code = 'TESTE123';
   ```
2. Se não existir, execute o script de inserção novamente
3. Verifique se o código está em MAIÚSCULAS (o sistema converte automaticamente)

### ❌ Erro ao confirmar: "permission denied" ou erro de política

**Solução:**
1. No Supabase, vá em **Authentication** → **Policies**
2. Verifique se existem políticas para a tabela `guests`:
   - Política de SELECT (leitura)
   - Política de UPDATE (atualização)
3. Se não existirem, execute:

```sql
-- Política de leitura
CREATE POLICY "Allow public read" ON guests
  FOR SELECT
  USING (true);

-- Política de atualização
CREATE POLICY "Allow update if not confirmed" ON guests
  FOR UPDATE
  USING (NOT confirmed)
  WITH CHECK (NOT confirmed);
```

### ❌ Erro de CORS

**Solução:**
1. No Supabase Dashboard, vá em **Settings** → **API**
2. Em **Allowed Origins**, adicione:
   - `http://localhost`
   - `file://` (para testar localmente)
   - Ou deixe vazio para permitir todos (apenas para testes)

### ❌ Nada acontece quando clica em "Buscar Convite"

**Solução:**
1. Abra o Console do navegador (F12)
2. Veja se há erros em vermelho
3. Verifique se o Supabase está carregando:
   - No Console, digite: `window.supabaseClient`
   - Deve retornar um objeto, não `undefined`

## ✅ Teste Completo Bem-Sucedido

Se tudo funcionou:
1. ✅ Conseguiu buscar o convidado pelo código
2. ✅ Viu os acompanhantes pré-cadastrados
3. ✅ Conseguiu confirmar a presença
4. ✅ Dados foram salvos no banco

**Parabéns! O sistema está funcionando! 🎉**

Agora você pode:
- Adicionar seus convidados reais
- Gerar códigos únicos para cada um
- Enviar os códigos junto com os convites



