# 🧪 Guia de Teste Rápido

Siga estes passos para testar se tudo está funcionando:

## ✅ Passo 1: Verificar Configuração (Opcional)

Se quiser verificar se tudo está configurado corretamente:

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `verificar-configuracao.sql`
3. Copie e cole no SQL Editor
4. Execute para verificar:
   - Se todas as colunas existem ✅
   - Se o índice único está criado ✅
   - Se RLS está habilitado ✅
   - Se as políticas estão configuradas ✅

## ✅ Passo 2: Inserir Convidado de Teste

**Opção A - Via SQL (Recomendado):**

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `insert-test-guest.sql`
3. Copie e cole no SQL Editor
4. Clique em **Run**
5. Você deve ver o registro criado ✅

**Opção B - Via Table Editor:**

1. No menu lateral, clique em **Table Editor** → **guests**
2. Clique em **Insert row**
3. Preencha:
   - **name**: `João Silva (TESTE)`
   - **code**: `TESTE123`
   - **confirmed**: `false`
   - **companions**: Clique em `{}` e cole:
   ```json
   [{"name": "Maria Silva", "confirmed": false}]
   ```
4. Clique em **Save**

## ✅ Passo 3: Testar no Site

1. Abra o arquivo `index.html` no navegador
2. Role até a seção **"Confirmação de Presença"**
3. Digite o código: **TESTE123**
4. Clique em **"Buscar Convite"**
5. Você deve ver:
   - Nome: "João Silva (TESTE)"
   - Um checkbox para "Maria Silva" (acompanhante)
6. Marque o checkbox do acompanhante
7. Preencha o telefone (ex: (11) 99999-9999)
8. Clique em **"Confirmar Presença"**
9. Você deve ver a mensagem de sucesso! ✅

## ✅ Passo 4: Verificar no Banco de Dados

1. Volte ao **Table Editor** do Supabase
2. Clique na tabela `guests`
3. Encontre o registro com código "TESTE123"
4. Verifique se:
   - `confirmed` está como `true` ✅
   - `phone` tem o telefone que você digitou ✅
   - `confirmed_at` tem uma data/hora ✅
   - `confirmed_guests` tem os nomes confirmados ✅
   - `companions` mostra o acompanhante como `confirmed: true` ✅

## 🎉 Se tudo funcionou:

Parabéns! O sistema está funcionando perfeitamente!

Agora você pode:
1. Adicionar seus convidados reais na tabela
2. Gerar códigos únicos para cada um
3. Enviar os códigos junto com os convites

## ❌ Se algo não funcionou:

### Erro: "Supabase não configurado"
- Verifique se as credenciais no `index.html` estão corretas
- Abra o Console do navegador (F12) e veja se há erros

### Erro: "Código não encontrado"
- Verifique se executou o script SQL corretamente
- Verifique se o código está em maiúsculas (o sistema converte automaticamente)

### Erro ao confirmar presença
- Verifique as políticas RLS no Supabase
- Verifique o Console do navegador para erros
- Certifique-se de que a coluna `confirmed` não está bloqueada

### Erro de CORS
- No Supabase Dashboard, vá em **Settings** → **API**
- Adicione seu domínio em **Allowed Origins** (ou deixe vazio para permitir todos durante testes)

## 📝 Próximos Passos

Depois de testar, você pode:

1. **Adicionar mais convidados**:
   - Via Table Editor (manual)
   - Via SQL (INSERT statements)
   - Via script de importação (veja `import-supabase-example.js`)

2. **Personalizar os códigos**:
   - Gere códigos únicos para cada convidado
   - Exemplo: "ABC123", "DEF456", etc.

3. **Remover o convidado de teste**:
   ```sql
   DELETE FROM guests WHERE code = 'TESTE123';
   ```

