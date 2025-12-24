// Exemplo de script para importar convidados em massa no Supabase
// Requer: npm install @supabase/supabase-js

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'SUA_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = 'SUA_SERVICE_KEY'; // Use a service key, não a anon key!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
      const { data: existing } = await supabase
        .from('guests')
        .select('id')
        .eq('code', guest.code.toUpperCase())
        .single();
      
      if (existing) {
        console.log(`⚠️  Código ${guest.code} já existe. Pulando ${guest.name}`);
        continue;
      }
      
      const { data, error } = await supabase
        .from('guests')
        .insert({
          name: guest.name,
          code: guest.code.toUpperCase(),
          confirmed: false,
          companions: guest.companions || [],
          phone: null,
          message: null,
          confirmed_at: null,
          confirmed_guests: []
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log(`✅ Importado: ${guest.name} (Código: ${guest.code})`);
    } catch (error) {
      console.error(`❌ Erro ao importar ${guest.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Importação concluída!');
  process.exit(0);
}

importGuests();



