// Sistema de Lista de Presentes - Supabase
// Envolvido em IIFE para evitar conflitos de escopo

(function() {
    'use strict';
    
    // Variáveis locais (não conflitam com outros scripts)
    let allGifts = [];
    let currentGift = null;

// Verificar se Supabase está disponível
function waitForSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabaseClient) {
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo (50 * 100ms)
        
        const checkInterval = setInterval(() => {
            attempts++;
            if (window.supabaseClient) {
                clearInterval(checkInterval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('Supabase não disponível após timeout'));
            }
        }, 100);
    });
}

// Carregar presentes do Supabase
async function loadGifts() {
    const giftsGrid = document.getElementById('gifts-grid');
    if (!giftsGrid) {
        console.error('Elemento gifts-grid não encontrado');
        return;
    }

    try {
        // Verificar se Supabase está disponível
        if (!window.supabaseClient) {
            await waitForSupabase();
        }

        if (!window.supabaseClient) {
            giftsGrid.innerHTML = '<div class="error-message">Erro: Supabase não configurado.</div>';
            return;
        }

        // Buscar todos os presentes disponíveis, ordenados por valor (menor para maior)
        const { data, error } = await window.supabaseClient
            .from('lista_presentes')
            .select('*')
            .eq('status', 'disponivel')
            .order('valor', { ascending: true });

        if (error) {
            console.error('Erro na query do Supabase:', error);
            throw error;
        }

        allGifts = data || [];
        console.log('Presentes carregados:', allGifts.length);
        renderGifts(allGifts);

    } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        const errorMsg = error.message || 'Erro desconhecido';
        giftsGrid.innerHTML = `<div class="error-message">Erro ao carregar presentes: ${errorMsg}. Verifique o console para mais detalhes.</div>`;
    }
}

// Renderizar presentes
function renderGifts(gifts) {
    const giftsGrid = document.getElementById('gifts-grid');
    if (!giftsGrid) return;

    if (gifts.length === 0) {
        giftsGrid.innerHTML = '<div class="no-gifts-message">Nenhum presente disponível no momento.</div>';
        return;
    }

    // Placeholder SVG para quando não houver foto
    const placeholderImage = getPlaceholderImage();
    
    giftsGrid.innerHTML = gifts.map(gift => {
        const imageUrl = gift.foto_display && gift.foto_display.trim() !== '' 
            ? gift.foto_display 
            : placeholderImage;
        
        // Escapar placeholderImage para uso em atributo HTML (escapar aspas simples)
        const escapedPlaceholder = placeholderImage.replace(/'/g, "&#39;");
        
        return `
        <div class="gift-card" data-code="${gift.code}">
            <div class="gift-card-image">
                <img src="${imageUrl}" alt="${escapeHtml(gift.nome)}" onerror="this.onerror=null; this.src='${escapedPlaceholder}';">
            </div>
            <div class="gift-card-content">
                <h3 class="gift-card-name">${escapeHtml(gift.nome)}</h3>
                <div class="gift-card-meta">
                    <span class="gift-card-tema">${escapeHtml(gift.tema)}</span>
                    <span class="gift-card-faixa">${escapeHtml(gift.faixa)}</span>
                </div>
                <div class="gift-card-price">R$ ${formatCurrency(gift.valor)}</div>
                <button class="gift-card-btn" onclick="openGiftModal('${escapeHtml(gift.code)}')">Presentear</button>
            </div>
        </div>
        `;
    }).join('');
}

// Formatar valor como moeda
function formatCurrency(value) {
    return parseFloat(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Criar placeholder SVG em base64 (sem emoji para evitar problemas com btoa)
function getPlaceholderImage() {
    // SVG simples sem emoji - apenas texto "Presente"
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#F9D3C2"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#6B705C" text-anchor="middle" dy=".3em">Presente</text></svg>';
    // Converter para base64 de forma segura
    try {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    } catch (e) {
        // Fallback: usar URL data URI escapada
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }
}

// Abrir modal de presente
async function openGiftModal(code) {
    const gift = allGifts.find(g => g.code === code);
    if (!gift) return;

    currentGift = gift;
    const modal = document.getElementById('gift-modal');
    const modalTitle = document.getElementById('gift-modal-title');
    const modalImg = document.getElementById('gift-modal-img');
    const modalValue = document.getElementById('gift-modal-value');
    const modalPix = document.getElementById('gift-modal-pix');
    const form = document.getElementById('gift-confirmation-form');

    if (!modal || !modalTitle || !modalImg || !modalValue || !modalPix || !form) return;

    // Placeholder SVG para quando não houver foto
    const placeholderImage = getPlaceholderImage();
    
    // Preencher dados do modal
    modalTitle.textContent = gift.nome;
    const imageUrl = gift.foto_display && gift.foto_display.trim() !== '' 
        ? gift.foto_display 
        : placeholderImage;
    modalImg.src = imageUrl;
    modalImg.alt = gift.nome;
    modalImg.onerror = function() {
        this.onerror = null;
        this.src = placeholderImage;
    };
    modalValue.textContent = formatCurrency(gift.valor);
    modalPix.textContent = gift.pix_chave;
    
    // Limpar formulário
    form.reset();

    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Configurar event listeners do modal
    setupGiftEventListeners();

    // Fechar modal ao clicar no X ou overlay
    const closeBtn = document.getElementById('gift-modal-close');
    const overlay = modal.querySelector('.gift-modal-overlay');

    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        currentGift = null;
    };

    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    if (overlay) {
        overlay.onclick = closeModal;
    }
}

// Copiar chave PIX
function setupGiftEventListeners() {
    const copyPixBtn = document.getElementById('copy-pix-btn');
    if (copyPixBtn) {
        // Remover listener anterior se existir
        copyPixBtn.replaceWith(copyPixBtn.cloneNode(true));
        const newCopyBtn = document.getElementById('copy-pix-btn');
        newCopyBtn.addEventListener('click', () => {
            const pixKey = document.getElementById('gift-modal-pix');
            if (pixKey) {
                navigator.clipboard.writeText(pixKey.textContent).then(() => {
                    newCopyBtn.textContent = 'Copiado!';
                    setTimeout(() => {
                        newCopyBtn.textContent = 'Copiar';
                    }, 2000);
                }).catch(err => {
                    console.error('Erro ao copiar:', err);
                });
            }
        });
    }

    // Submeter formulário de confirmação
    const giftForm = document.getElementById('gift-confirmation-form');
    if (giftForm) {
        // Remover listener anterior se existir
        giftForm.replaceWith(giftForm.cloneNode(true));
        const newForm = document.getElementById('gift-confirmation-form');
        newForm.addEventListener('submit', handleGiftConfirmation);
    }
}

// Configurar event listeners quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupGiftEventListeners();
        setupFilters();
    });
} else {
    setupGiftEventListeners();
    setupFilters();
}

// Configurar filtros
function setupFilters() {
    // Filtro por tema (abas)
    const temaTabs = document.querySelectorAll('.filter-tab');
    temaTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            temaTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            applyFilters();
        });
    });

    // Filtro por faixa (select)
    const faixaFilter = document.getElementById('faixa-filter');
    if (faixaFilter) {
        faixaFilter.addEventListener('change', applyFilters);
    }
}

// Aplicar filtros
function applyFilters() {
    const activeTema = document.querySelector('.filter-tab.active')?.dataset.tema || 'todos';
    const selectedFaixa = document.getElementById('faixa-filter')?.value || 'todos';

    let filteredGifts = [...allGifts];

    // Filtrar por tema
    if (activeTema !== 'todos') {
        filteredGifts = filteredGifts.filter(gift => gift.tema === activeTema);
    }

    // Filtrar por faixa
    if (selectedFaixa !== 'todos') {
        filteredGifts = filteredGifts.filter(gift => gift.faixa === selectedFaixa);
    }

    renderGifts(filteredGifts);
}

// Confirmar envio do presente
async function handleGiftConfirmation(event) {
    event.preventDefault();

    if (!currentGift || !window.supabaseClient) {
        alert('Erro: Dados não encontrados.');
        return;
    }

    const guestName = document.getElementById('guest-name-gift').value.trim();
    const guestMessage = document.getElementById('guest-message-gift').value.trim();

    if (!guestName) {
        alert('Por favor, informe seu nome.');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processando...';
    }

    try {
        // Atualizar presente no Supabase
        // O filtro .eq('status', 'disponivel') garante que só atualiza se ainda estiver disponível
        const { data, error } = await window.supabaseClient
            .from('lista_presentes')
            .update({
                status: 'confirmado',
                nome_convidado: guestName,
                mensagem: guestMessage || null,
                data_confirmacao: new Date().toISOString()
            })
            .eq('code', currentGift.code)
            .eq('status', 'disponivel') // Garantir que só atualiza se ainda estiver disponível
            .select();

        if (error) {
            console.error('Erro detalhado do Supabase:', error);
            console.error('Código do erro:', error.code);
            console.error('Mensagem:', error.message);
            console.error('Detalhes:', error.details);
            console.error('Hint:', error.hint);
            throw error;
        }

        if (!data || data.length === 0) {
            // Se nenhum registro foi atualizado, pode ser que já foi confirmado por outra pessoa
            // Recarregar a lista para atualizar o estado
            await loadGifts();
            throw new Error('Este presente já foi confirmado por outra pessoa ou não está mais disponível.');
        }

        // Remover presente da lista local
        allGifts = allGifts.filter(g => g.code !== currentGift.code);
        applyFilters();

        // Fechar modal
        const modal = document.getElementById('gift-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        // Mostrar mensagem de sucesso
        alert('Obrigado pelo presente! Sua confirmação foi registrada.');

        currentGift = null;

    } catch (error) {
        console.error('Erro ao confirmar presente:', error);
        const errorMessage = error.message || 'Erro desconhecido';
        const errorCode = error.code || 'N/A';
        
        // Mensagem mais específica baseada no tipo de erro
        let userMessage = 'Erro ao confirmar presente. ';
        if (errorCode === '42501' || errorMessage.includes('permission') || errorMessage.includes('policy')) {
            userMessage += 'Erro de permissão. Verifique se as políticas RLS estão configuradas corretamente.';
        } else if (errorMessage.includes('Nenhum registro foi atualizado')) {
            userMessage += 'Este presente pode já ter sido confirmado por outra pessoa.';
        } else {
            userMessage += `Detalhes: ${errorMessage}`;
        }
        
        alert(userMessage);
        console.error('Código do erro:', errorCode);
        console.error('Mensagem completa:', errorMessage);
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Já enviei o PIX';
        }
    }
}

    // Carregar presentes quando a página carregar
    // Aguardar um pouco para garantir que o Supabase está inicializado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(loadGifts, 100);
        });
    } else {
        setTimeout(loadGifts, 100);
    }

    // Exportar funções necessárias para o escopo global
    window.openGiftModal = openGiftModal;
})();
