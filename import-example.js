// Exemplo de script para importar convidados em massa no Firebase
// Requer: npm install firebase-admin
// E um arquivo serviceAccountKey.json do Firebase

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Função para gerar código único aleatório
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Lista de convidados - ADICIONE SEUS CONVIDADOS AQUI
const guests = [
  {
    name: "João Silva",
    code: "ABC123", // Ou use generateCode() para gerar automaticamente
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
  },
  {
    name: "Carla Oliveira",
    code: generateCode(), // Gera código aleatório
    companions: [] // Sem acompanhantes
  }
  // Adicione mais convidados aqui...
];

async function importGuests() {
  console.log('Iniciando importação...\n');
  
  for (const guest of guests) {
    try {
      // Verificar se código já existe
      const existingQuery = await db.collection('guests')
        .where('code', '==', guest.code)
        .get();
      
      if (!existingQuery.empty) {
        console.log(`⚠️  Código ${guest.code} já existe. Pulando ${guest.name}`);
        continue;
      }
      
      await db.collection('guests').add({
        name: guest.name,
        code: guest.code.toUpperCase(),
        confirmed: false,
        companions: guest.companions || [],
        phone: "",
        message: "",
        confirmedAt: null,
        confirmedGuests: []
      });
      
      console.log(`✅ Importado: ${guest.name} (Código: ${guest.code})`);
    } catch (error) {
      console.error(`❌ Erro ao importar ${guest.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Importação concluída!');
  process.exit(0);
}

importGuests();


