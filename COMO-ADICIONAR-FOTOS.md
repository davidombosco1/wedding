# 📸 Como Adicionar Fotos dos Convidados

Este guia explica como adicionar fotos para cada convidado e exibi-las no sistema de confirmação.

## 📋 Pré-requisitos

1. Fotos dos convidados em formato digital (JPG, PNG, etc.)
2. Local para hospedar as fotos (veja opções abaixo)

## 🚀 Passo a Passo

### 1. Executar Script SQL

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `add-photo-field.sql`
3. **Copie TODO o conteúdo** e cole no SQL Editor
4. Clique em **Run** (ou Ctrl+Enter)

Isso adiciona a coluna `photo_url` na tabela `guests`.

### 2. Hospedar as Fotos

Você tem algumas opções:

#### Opção A: Supabase Storage (Recomendado)

1. No Supabase Dashboard, vá em **Storage**
2. Crie um bucket chamado `guest-photos`
3. Faça upload das fotos
4. Configure políticas para acesso público (se necessário)
5. Copie a URL pública de cada foto

#### Opção B: Pasta do Projeto

1. Crie uma pasta `fotos` na raiz do projeto
2. Coloque as fotos lá (ex: `fotos/joao-silva.jpg`)
3. Use o caminho relativo: `fotos/joao-silva.jpg`

#### Opção C: Serviço de Hospedagem Externa

- Imgur
- Cloudinary
- Google Drive (com link público)
- Dropbox (com link público)
- Qualquer CDN

### 3. Adicionar URLs das Fotos no Banco

#### Via SQL Editor (Recomendado para muitos convidados):

```sql
-- Exemplo: Atualizar foto de um convidado
UPDATE guests 
SET photo_url = 'https://exemplo.com/fotos/joao-silva.jpg'
WHERE code = 'ABC123';

-- Ou se estiver na pasta do projeto:
UPDATE guests 
SET photo_url = 'fotos/joao-silva.jpg'
WHERE code = 'ABC123';
```

#### Via Table Editor:

1. No Supabase, vá em **Table Editor** → **guests**
2. Encontre o convidado
3. Clique para editar
4. No campo `photo_url`, cole a URL da foto
5. Salve

#### Via Script de Importação:

Atualize o script `import-supabase-example.js` para incluir fotos:

```javascript
const guests = [
  {
    name: "João Silva",
    code: "ABC123",
    photo_url: "https://exemplo.com/fotos/joao-silva.jpg", // Adicione aqui
    companions: [
      { name: "Maria Silva", confirmed: false }
    ]
  }
];
```

### 4. Nomenclatura Recomendada

Para facilitar, use nomes de arquivo consistentes:

- `joao-silva.jpg`
- `maria-santos.jpg`
- `pedro-oliveira.jpg`

Ou use o código do convidado:

- `ABC123.jpg`
- `DEF456.jpg`

## 📝 Estrutura de Dados

A coluna `photo_url` aceita:

- **URL completa**: `https://exemplo.com/fotos/joao.jpg`
- **Caminho relativo**: `fotos/joao.jpg` (se as fotos estiverem na pasta do projeto)
- **NULL**: Se não houver foto, o campo pode ficar vazio

## 🎨 Como Funciona no Site

Quando um convidado acessar via código:

1. Se houver `photo_url` no banco:
   - A foto aparece em um círculo no topo do card
   - Tamanho: 150x150px
   - Com borda dourada
   - Com sombra

2. Se não houver foto:
   - Nada é exibido (não aparece placeholder)

3. Se a foto não carregar:
   - Aparece um placeholder com ícone de câmera

## 💡 Dicas

### Otimização de Fotos

- **Tamanho recomendado**: 300x300px a 500x500px
- **Formato**: JPG (melhor compressão) ou PNG (transparência)
- **Peso**: Máximo 200KB por foto
- **Proporção**: Quadrada (1:1) funciona melhor

### Ferramentas para Redimensionar

- [TinyPNG](https://tinypng.com/) - Comprimir imagens
- [Squoosh](https://squoosh.app/) - Redimensionar e comprimir
- Photoshop / GIMP - Edição profissional

### Exemplo de Script para Atualizar Múltiplas Fotos

```sql
-- Atualizar várias fotos de uma vez
UPDATE guests 
SET photo_url = 'fotos/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
WHERE photo_url IS NULL;
```

## 🔍 Verificar se Funcionou

1. Adicione uma foto para um convidado de teste
2. No site, busque pelo código do convidado
3. A foto deve aparecer no topo do card de informações

## ❌ Problemas Comuns

### Foto não aparece

- Verifique se a URL está correta no banco
- Verifique se a URL é acessível (abra no navegador)
- Verifique o Console do navegador (F12) para erros de CORS

### Foto aparece quebrada

- Verifique se a URL está completa
- Verifique se o arquivo existe no servidor
- Verifique permissões de acesso (se estiver em storage)

### Erro de CORS

- Se usar Supabase Storage, configure políticas de acesso público
- Se usar outro serviço, verifique configurações de CORS

## 📞 Próximos Passos

Depois de adicionar as fotos:

1. ✅ Teste com alguns convidados
2. ✅ Verifique se todas as fotos carregam corretamente
3. ✅ Otimize fotos grandes para melhor performance
4. ✅ Adicione fotos para todos os convidados



