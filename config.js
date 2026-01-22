// Configuração do Supabase
// IMPORTANTE: Esta chave ANON_KEY é projetada para ser pública no frontend
// A segurança real vem das políticas RLS (Row Level Security) no Supabase
// CERTIFIQUE-SE de que as políticas RLS estão configuradas corretamente!

const SUPABASE_CONFIG = {
    URL: 'https://cevzvsfzlknqdtpmlckv.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnp2c2Z6bGtucWR0cG1sY2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NDk4MzcsImV4cCI6MjA4MjAyNTgzN30.y3qOxEo5M7bHV279Dw1ueCsSXMfECPXqSexWSWuZSZ8'
};

// Inicializar Supabase
(function() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    } else if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.supabaseClient = supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    } else {
        console.error('Supabase SDK não carregado corretamente');
    }
})();
