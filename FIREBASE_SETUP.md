# 🔥 Guia de Configuração do Firebase

Este guia explica como configurar o Firebase para o sistema de confirmação de presença com códigos únicos.

## 📋 Pré-requisitos

1. Conta no Google (para acessar Firebase)
2. Navegador web moderno

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto" ou "Create a project"
3. Digite o nome do projeto (ex: "casamento-yasmin-davi")
4. Aceite os termos e clique em "Continuar"
5. Desative o Google Analytics (opcional) e clique em "Criar projeto"
6. Aguarde a criação e clique em "Continuar"

### 2. Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha uma localização (ex: `southamerica-east1` para Brasil)
5. Clique em "Ativar"

### 3. Configurar Regras de Segurança

1. Na aba "Regras" do Firestore, cole o seguinte código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita apenas para a coleção guests
    match /guests/{guestId} {
      allow read: if true; // Permite leitura pública (necessário para buscar por código)
      allow write: if true; // Permite escrita pública (apenas para confirmação)
    }
  }
}
```

2. Clique em "Publicar"

⚠️ **IMPORTANTE**: Essas regras permitem acesso público. Para produção, considere implementar autenticação.

### 4. Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ ao lado de "Visão geral do projeto"
2. Clique em "Configurações do projeto"
3. Role até "Seus aplicativos" e clique no ícone `</>` (Web)
4. Registre um app com um nome (ex: "Site Casamento")
5. **Copie as credenciais** que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 5. Configurar no Site

1. Abra o arquivo `index.html`
2. Encontre a seção com `firebaseConfig` (linha ~210)
3. Substitua os valores pelos seus dados do Firebase:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_AUTH_DOMAIN_AQUI",
    projectId: "SEU_PROJECT_ID_AQUI",
    storageBucket: "SEU_STORAGE_BUCKET_AQUI",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID_AQUI",
    appId: "SEU_APP_ID_AQUI"
};
```

### 6. Criar Estrutura de Dados no Firestore

1. No Firebase Console, vá para "Firestore Database"
2. Clique em "Iniciar coleção"
3. Nome da coleção: `guests`
4. Adicione o primeiro documento:

**ID do documento**: (deixe vazio para gerar automaticamente)

**Campos**:
- `name` (string): "Nome do Convidado"
- `code` (string): "ABC123" (código único)
- `confirmed` (boolean): `false`
- `companions` (array): 
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
- `phone` (string): "" (vazio inicialmente)
- `message` (string): "" (vazio inicialmente)
- `confirmedAt` (timestamp): (deixe vazio)
- `confirmedGuests` (array): [] (vazio inicialmente)

5. Clique em "Salvar"

### 7. Criar Múltiplos Convidados

Para cada convidado, repita o passo 6. Você pode:

**Opção A - Manual**: Criar cada documento manualmente no Firebase Console

**Opção B - Script**: Use o script abaixo para importar em massa (veja seção "Importação em Massa")

## 📊 Estrutura de Dados

Cada documento na coleção `guests` deve ter:

```javascript
{
  name: "Nome do Convidado Principal",
  code: "ABC123", // Código único (geralmente 6 caracteres)
  confirmed: false, // true quando confirmar
  companions: [
    {
      name: "Acompanhante 1",
      confirmed: false
    },
    {
      name: "Acompanhante 2",
      confirmed: false
    }
  ],
  phone: "", // Preenchido na confirmação
  message: "", // Mensagem opcional
  confirmedAt: null, // Timestamp quando confirmou
  confirmedGuests: [] // Array com nomes dos confirmados
}
```

## 🔧 Importação em Massa (Opcional)

Se você tem muitos convidados, pode usar um script Node.js para importar:

1. Instale o Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Crie um arquivo `import-guests.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Lista de convidados
const guests = [
  {
    name: "João Silva",
    code: "ABC123",
    companions: [
      { name: "Maria Silva", confirmed: false }
    ]
  },
  {
    name: "Pedro Santos",
    code: "DEF456",
    companions: [
      { name: "Ana Santos", confirmed: false },
      { name: "Lucas Santos", confirmed: false }
    ]
  }
  // Adicione mais convidados aqui
];

async function importGuests() {
  for (const guest of guests) {
    await db.collection('guests').add({
      ...guest,
      confirmed: false,
      phone: "",
      message: "",
      confirmedAt: null,
      confirmedGuests: []
    });
    console.log(`Importado: ${guest.name} (${guest.code})`);
  }
  console.log('Importação concluída!');
}

importGuests();
```

3. Para obter o `serviceAccountKey.json`:
   - Firebase Console → Configurações do projeto → Contas de serviço
   - Clique em "Gerar nova chave privada"
   - Baixe o arquivo JSON

## 🔐 Segurança (Produção)

Para produção, considere:

1. **Regras mais restritivas**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guests/{guestId} {
      allow read: if request.query.limit <= 1; // Apenas uma leitura por vez
      allow update: if !resource.data.confirmed; // Só permite atualizar se não confirmou
    }
  }
}
```

2. **Autenticação**: Implemente autenticação Firebase para acesso administrativo

3. **Validação**: Adicione validação de dados no backend

## ✅ Teste

1. Abra o site no navegador
2. Vá para a seção "Confirmação"
3. Digite um código de teste
4. Verifique se aparece o nome e acompanhantes
5. Confirme a presença
6. Verifique no Firebase Console se os dados foram atualizados

## 🆘 Problemas Comuns

**Erro: "Firebase não configurado"**
- Verifique se as credenciais no `index.html` estão corretas
- Verifique se o Firebase está carregado (console do navegador)

**Código não encontrado**
- Verifique se o código está correto no Firestore
- Verifique se o campo `code` está em maiúsculas (o código converte para maiúsculas)

**Erro ao confirmar**
- Verifique as regras do Firestore
- Verifique o console do navegador para erros

## 📞 Suporte

Para mais informações, consulte a [documentação do Firebase](https://firebase.google.com/docs).


