# 🚀 Guia de Configuração do Supabase

Este guia explica como configurar o Supabase para o sistema de confirmação de presença com códigos únicos.

## 📋 Pré-requisitos

1. Conta no Supabase (gratuita)
2. Navegador web moderno

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [Supabase](https://supabase.com/)
2. Clique em "Start your project" ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Name**: `casamento-yasmin-davi` (ou outro nome)
   - **Database Password**: Crie uma senha forte (anote ela!)
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
5. Clique em "Create new project"
6. Aguarde alguns minutos enquanto o projeto é criado

### 2. Obter Credenciais da API

1. No dashboard do projeto, vá em **Settings** (⚙️) → **API**
2. Você verá:
   - **Project URL**: `https://xxxxx.supabase.co` #https://cevzvsfzlknqdtpmlckv.supabase.co
   - **anon public key**: `eyJhbGc...` (chave longa) #eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnp2c2Z6bGtucWR0cG1sY2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NDk4MzcsImV4cCI6MjA4MjAyNTgzN30.y3qOxEo5M7bHV279Dw1ueCsSXMfECPXqSexWSWuZSZ8

3. **Copie essas duas informações** - você vai precisar delas!

### 3. Criar Tabela no Banco de Dados

1. No menu lateral, clique em **Table Editor**
2. Clique em **New Table**
3. Configure:
   - **Name**: `guests`
   - **Description**: "Convidados do casamento"
4. Clique em **Create new table**

### 4. Adicionar Colunas na Tabela

Adicione as seguintes colunas (clique em "Add Column" para cada uma):

| Column Name | Type | Default Value | Nullable | Primary Key |
|------------|------|---------------|----------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | ❌ | ✅ |
| `name` | `text` | - | ❌ | ❌ |
| `code` | `text` | - | ❌ | ❌ |
| `confirmed` | `boolean` | `false` | ❌ | ❌ |
| `companions` | `jsonb` | `[]` | ✅ | ❌ |
| `phone` | `text` | - | ✅ | ❌ |
| `message` | `text` | - | ✅ | ❌ |
| `confirmed_at` | `timestamptz` | - | ✅ | ❌ |
| `confirmed_guests` | `text[]` | `[]` | ✅ | ❌ |
| `created_at` | `timestamptz` | `now()` | ❌ | ❌ |
| `updated_at` | `timestamptz` | `now()` | ❌ | ❌ |

**Passo a passo detalhado:**

1. **id** (já criado automaticamente):
   - Type: `uuid`
   - Default: `gen_random_uuid()`
   - Primary key: ✅

2. **name**:
   - Type: `text`
   - Nullable: ❌

3. **code**:
   - Type: `text`
   - Nullable: ❌
   - Unique: ✅ (importante!)

4. **confirmed**:
   - Type: `boolean`
   - Default: `false`
   - Nullable: ❌

5. **companions**:
   - Type: `jsonb`
   - Default: `[]`
   - Nullable: ✅

6. **phone**:
   - Type: `text`
   - Nullable: ✅

7. **message**:
   - Type: `text`
   - Nullable: ✅

8. **confirmed_at**:
   - Type: `timestamptz`
   - Nullable: ✅

9. **confirmed_guests**:
   - Type: `text[]` (array de texto)
   - Default: `[]`
   - Nullable: ✅

10. **created_at**:
    - Type: `timestamptz`
    - Default: `now()`
    - Nullable: ❌

11. **updated_at**:
    - Type: `timestamptz`
    - Default: `now()`
    - Nullable: ❌

### 5. Criar Índice Único no Campo `code`

1. Vá em **SQL Editor** no menu lateral
2. Execute este comando:

```sql
CREATE UNIQUE INDEX guests_code_unique ON guests(code);
```

3. Clique em **Run** (ou F5)

### 6. Configurar Políticas de Segurança (RLS)

1. Vá em **Authentication** → **Policies**
2. Ou vá em **Table Editor** → `guests` → **Policies**

**Opção 1: Permitir acesso público (para desenvolvimento/teste)**

1. Clique em **New Policy**
2. Escolha **For full customization**
3. Configure:
   - **Policy name**: `Allow public read`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
   ```sql
   true
   ```
4. Clique em **Review** e depois **Save policy**

5. Crie outra política:
   - **Policy name**: `Allow public update`
   - **Allowed operation**: `UPDATE`
   - **Policy definition**:
   ```sql
   true
   ```
6. Clique em **Review** e depois **Save policy**

**Opção 2: Políticas mais restritivas (recomendado para produção)**

```sql
-- Permitir leitura pública (necessário para buscar por código)
CREATE POLICY "Allow public read" ON guests
  FOR SELECT
  USING (true);

-- Permitir atualização apenas se não confirmou ainda
CREATE POLICY "Allow update if not confirmed" ON guests
  FOR UPDATE
  USING (NOT confirmed);
```

### 7. Configurar no Site

1. Abra o arquivo `index.html`
2. Encontre a seção com configuração do Supabase (linha ~233)
3. Substitua pelos seus dados:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
```

### 8. Criar Primeiro Convidado (Teste)

1. No **Table Editor**, clique na tabela `guests`
2. Clique em **Insert row**
3. Preencha:
   - **name**: "João Silva"
   - **code**: "ABC123"
   - **confirmed**: `false`
   - **companions**: Clique em `{}` e cole:
   ```json
   [
     {
       "name": "Maria Silva",
       "confirmed": false
     }
   ]
   ```
4. Clique em **Save**

## 📊 Estrutura de Dados

### Tabela `guests`

```sql
CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  confirmed boolean NOT NULL DEFAULT false,
  companions jsonb DEFAULT '[]'::jsonb,
  phone text,
  message text,
  confirmed_at timestamptz,
  confirmed_guests text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Estrutura do campo `companions` (JSONB)

```json
[
  {
    "name": "Nome do Acompanhante 1",
    "confirmed": false
  },
  {
    "name": "Nome do Acompanhante 2",
    "confirmed": false
  }
]
```

## 🔧 Importação em Massa

### Opção 1: Via SQL Editor

1. Vá em **SQL Editor**
2. Execute um INSERT para cada convidado:

```sql
INSERT INTO guests (name, code, companions)
VALUES 
  ('João Silva', 'ABC123', '[{"name": "Maria Silva", "confirmed": false}]'::jsonb),
  ('Pedro Santos', 'DEF456', '[{"name": "Ana Santos", "confirmed": false}, {"name": "Lucas Santos", "confirmed": false}]'::jsonb),
  ('Carla Oliveira', 'GHI789', '[]'::jsonb);
```

### Opção 2: Via Table Editor

1. Vá em **Table Editor** → `guests`
2. Clique em **Insert row** para cada convidado
3. Preencha os campos manualmente

### Opção 3: Via Script Python/Node.js

Veja o arquivo `import-supabase-example.js` ou `import-supabase-example.py` para exemplos de scripts de importação.

## 🔐 Segurança (Produção)

Para produção, considere:

1. **Políticas mais restritivas**:
```sql
-- Apenas leitura de um registro por vez (busca por código)
CREATE POLICY "Allow single read" ON guests
  FOR SELECT
  USING (true);

-- Apenas atualização se não confirmou
CREATE POLICY "Allow update if not confirmed" ON guests
  FOR UPDATE
  USING (NOT confirmed)
  WITH CHECK (NOT confirmed);
```

2. **Rate Limiting**: Configure no Supabase Dashboard → Settings → API

3. **Validação**: Adicione triggers para validar dados

## ✅ Teste

1. Abra o site no navegador
2. Vá para a seção "Confirmação"
3. Digite um código de teste (ex: "ABC123")
4. Verifique se aparece o nome e acompanhantes
5. Confirme a presença
6. Verifique no Supabase se os dados foram atualizados

## 🆘 Problemas Comuns

**Erro: "Supabase não configurado"**
- Verifique se as credenciais no `index.html` estão corretas
- Verifique se o Supabase está carregado (console do navegador)

**Código não encontrado**
- Verifique se o código está correto na tabela
- Verifique se o campo `code` está em maiúsculas (o código converte para maiúsculas)
- Verifique se há um índice único no campo `code`

**Erro ao confirmar**
- Verifique as políticas RLS (Row Level Security)
- Verifique o console do navegador para erros
- Verifique se a coluna `confirmed` não está bloqueada

**Erro de CORS**
- Verifique se o domínio está configurado no Supabase (Settings → API → Allowed Origins)

## 📞 Suporte

Para mais informações, consulte a [documentação do Supabase](https://supabase.com/docs).

## 🎯 Próximos Passos

1. ✅ Configurar projeto no Supabase
2. ✅ Criar tabela `guests`
3. ✅ Configurar políticas RLS
4. ✅ Adicionar credenciais no `index.html`
5. ✅ Importar convidados
6. ✅ Testar o sistema



