# Site de Casamento - Yasmin & Davi

Site elegante e responsivo para o casamento de Yasmin e Davi.

## 📋 Funcionalidades

- ✅ Página inicial com foto e história do casal
- ✅ Contagem regressiva para a cerimônia (31/05/2026, 11h)
- ✅ Informações sobre o local (Serra dos Cristais, Jundiaí) com mapa interativo
- ✅ **Sistema robusto de confirmação de presença com código único**
  - Cada convidado recebe um código único
  - Confirmação apenas dos acompanhantes pré-cadastrados
  - Integração com Supabase (PostgreSQL)
- ✅ Lista de presentes com links para chave PIX

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. Para personalizar:
   - **Fotos**: Substitua os placeholders de imagem pelas suas fotos
   - **História**: Edite o texto na seção "Nossa História" no arquivo `index.html`
   - **Chave PIX**: Substitua `SUA_CHAVE_PIX_AQUI` nos cards de presentes pela sua chave PIX real
   - **Cores**: Ajuste as cores no arquivo `styles.css` na seção `:root`

## 📝 Personalização da Chave PIX

No arquivo `index.html`, encontre os elementos com `data-pix="SUA_CHAVE_PIX_AQUI"` e substitua pela sua chave PIX real. Exemplo:

```html
<div class="gift-card" data-pix="seu-email@exemplo.com">
```

ou

```html
<div class="gift-card" data-pix="+5511999999999">
```

## 🎨 Personalização

### Cores
As cores principais podem ser alteradas no arquivo `styles.css`:

```css
:root {
    --primary-color: #d4a574;    /* Cor principal (dourado/bege) */
    --secondary-color: #8b6f47;  /* Cor secundária */
    --accent-color: #f5e6d3;     /* Cor de destaque */
}
```

### Fotos
Para adicionar fotos, substitua os elementos `.image-placeholder` por tags `<img>`. Exemplo:

```html
<img src="caminho/para/sua/foto.jpg" alt="Yasmin e Davi" style="width: 100%; height: 400px; object-fit: cover; border-radius: 20px;">
```

## 📱 Responsivo

O site é totalmente responsivo e funciona bem em:
- Desktop
- Tablet
- Smartphone

## 🔧 Sistema de Confirmação de Presença

O site possui um sistema completo de confirmação de presença com código único:

1. **Cada convidado recebe um código único** (enviado junto ao convite)
2. **O convidado acessa o site e digita seu código**
3. **O sistema busca e exibe** o nome do convidado e seus acompanhantes pré-cadastrados
4. **O convidado confirma a presença** de si mesmo e dos acompanhantes que irão
5. **Os dados são salvos no Supabase** (PostgreSQL)

### Configuração do Supabase

⚠️ **IMPORTANTE**: Para o sistema funcionar, você precisa configurar o Supabase.

📖 **Leia o guia completo**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Resumo rápido**:
1. Crie um projeto no [Supabase](https://supabase.com/)
2. Crie a tabela `guests` no banco de dados
3. Configure as políticas RLS (Row Level Security)
4. Copie as credenciais (URL e Anon Key) e cole no `index.html` (linha ~233)
5. Importe os convidados na tabela

### Estrutura de Dados

Cada convidado na tabela `guests` deve ter:
- `id`: UUID (gerado automaticamente)
- `name`: Nome do convidado
- `code`: Código único (ex: "ABC123") - deve ser único
- `confirmed`: Boolean (false inicialmente)
- `companions`: JSONB com array de acompanhantes pré-cadastrados
- `phone`, `message`, `confirmed_at`, `confirmed_guests`: Preenchidos na confirmação
- `created_at`, `updated_at`: Timestamps automáticos

## 📄 Estrutura de Arquivos

```
Site casamento/
├── index.html                    # Página principal
├── styles.css                    # Estilos
├── script.js                     # JavaScript principal
├── confirmation.js               # Sistema de confirmação (Supabase)
├── SUPABASE_SETUP.md             # Guia de configuração do Supabase
├── import-supabase-example.js     # Exemplo de script Node.js para importar
├── import-supabase-example.py     # Exemplo de script Python para importar
└── README.md                     # Este arquivo
```

## 💡 Dicas

- Teste o site em diferentes navegadores
- Verifique se todas as chaves PIX estão corretas
- Adicione fotos de alta qualidade para melhor visualização
- Considere adicionar um mapa do Google Maps na seção de localização

---

Feito com ❤️ para Yasmin & Davi


