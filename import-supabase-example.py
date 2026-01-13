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
        "shoe_size": "disabled",  # "disabled" para homens, ou "33/34", "35/36", "37/38", "39/40", "41/42" para mulheres
        "confirmation_deadline": "2026-03-31",  # Data limite para confirmação (formato: YYYY-MM-DD)
        "companions": [
            {"name": "Maria Silva", "confirmed": False, "is_child": False, "shoe_size": "37/38"}
        ]
    },
    {
        "name": "Pedro Santos",
        "code": "DEF456",
        "shoe_size": "39/40",
        "confirmation_deadline": "2026-03-31",
        "companions": [
            {"name": "Ana Santos", "confirmed": False, "is_child": False, "shoe_size": "39/40"},
            {"name": "Lucas Santos", "confirmed": False, "is_child": True, "shoe_size": "disabled"}
        ]
    },
    {
        "name": "Carla Oliveira",
        "code": generate_code(),  # Gera código aleatório
        "shoe_size": "35/36",
        "confirmation_deadline": "2026-03-31",
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
                "confirmed_guests": [],
                "shoe_size": guest.get('shoe_size'),
                "confirmation_deadline": guest.get('confirmation_deadline')
            }).execute()
            
            print(f"✅ Importado: {guest['name']} (Código: {guest['code']})")
            
        except Exception as error:
            print(f"❌ Erro ao importar {guest['name']}: {error}")
    
    print('\n✨ Importação concluída!')

if __name__ == '__main__':
    import asyncio
    asyncio.run(import_guests())



