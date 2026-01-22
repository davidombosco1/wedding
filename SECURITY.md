# Segurança do Site

## Credenciais do Supabase

### ⚠️ IMPORTANTE: Chave ANON_KEY

A chave `ANON_KEY` do Supabase está no arquivo `config.js` e é **projetada para ser pública** no frontend. Isso é normal e esperado pelo Supabase.

### 🔒 Segurança Real: Row Level Security (RLS)

A segurança real do seu banco de dados vem das **políticas RLS (Row Level Security)** configuradas no Supabase. A chave anônima sozinha não permite acesso aos dados se o RLS estiver configurado corretamente.

### ✅ Checklist de Segurança

Certifique-se de que:

1. **RLS está habilitado** em todas as tabelas:
   - `guests`
   - `lista_presentes`

2. **Políticas RLS estão configuradas** para:
   - ✅ Leitura: apenas dados permitidos
   - ✅ Escrita: apenas operações permitidas
   - ✅ Atualização: apenas registros permitidos
   - ✅ Exclusão: apenas quando apropriado

3. **Nunca exponha a SERVICE_ROLE_KEY** (chave de serviço) no frontend
   - A SERVICE_ROLE_KEY deve ser usada apenas em servidores backend
   - Ela ignora RLS e tem acesso total ao banco

### 📋 Verificações Recomendadas

1. No painel do Supabase, vá em **Authentication > Policies**
2. Verifique se todas as tabelas têm políticas RLS ativas
3. Teste as políticas para garantir que usuários não autenticados não podem:
   - Ver dados de outros convidados
   - Modificar dados sem autorização
   - Acessar informações sensíveis

### 🔐 Boas Práticas

- ✅ A chave ANON_KEY pode estar no código frontend (é segura com RLS)
- ✅ Use RLS para controlar acesso aos dados
- ✅ Valide dados no backend quando possível
- ❌ Nunca exponha SERVICE_ROLE_KEY
- ❌ Nunca confie apenas no frontend para validação

### 📚 Recursos

- [Documentação RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Guia de Segurança do Supabase](https://supabase.com/docs/guides/auth/security)
