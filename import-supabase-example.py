# Exemplo de script Python para importar convidados em massa no Supabase
# Requer: pip install supabase

from supabase import create_client, Client
import random
import string

# Configuração do Supabase
SUPABASE_URL = 'SUA_SUPABASE_URL'
SUPABASE_SERVICE_KEY = 'SUA_SERVICE_KEY'  # Use a service key, não a anon key!

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Função para gerar código único aleatório
def generate_code(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

# Lista de convidados - ADICIONE SEUS CONVIDADOS AQUI
guests = [
    {
        "name": "João Silva",
        "code": "ABC123",  # Ou use generate_code() para gerar automaticamente
        "companions": [
            {"name": "Maria Silva", "confirmed": False}
        ]
    },
    {
        "name": "Pedro Santos",
        "code": "DEF456",
        "companions": [
            {"name": "Ana Santos", "confirmed": False},
            {"name": "Lucas Santos", "confirmed": False}
        ]
    },
    {
        "name": "Carla Oliveira",
        "code": generate_code(),  # Gera código aleatório
        "companions": []  # Sem acompanhantes
    }
    # Adicione mais convidados aqui...
]

async def import_guests():
    print('Iniciando importação...\n')
    
    for guest in guests:
        try:
            # Verificar se código já existe
            existing = supabase.table('guests').select('id').eq('code', guest['code'].upper()).execute()
            
            if existing.data:
                print(f"⚠️  Código {guest['code']} já existe. Pulando {guest['name']}")
                continue
            
            # Inserir convidado
            data = supabase.table('guests').insert({
                "name": guest['name'],
                "code": guest['code'].upper(),
                "confirmed": False,
                "companions": guest.get('companions', []),
                "phone": None,
                "message": None,
                "confirmed_at": None,
                "confirmed_guests": []
            }).execute()
            
            print(f"✅ Importado: {guest['name']} (Código: {guest['code']})")
            
        except Exception as error:
            print(f"❌ Erro ao importar {guest['name']}: {error}")
    
    print('\n✨ Importação concluída!')

if __name__ == '__main__':
    import asyncio
    asyncio.run(import_guests())



