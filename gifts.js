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
        
        // Verificar se o SDK do Supabase está carregado
        if (typeof window.supabase === 'undefined' && typeof supabase === 'undefined') {
            reject(new Error('SDK do Supabase não foi carregado. Verifique se o script está sendo carregado corretamente.'));
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
                reject(new Error('Supabase client não foi inicializado. Verifique a configuração no index.html.'));
            }
        }, 100);
    });
}

// Flag para evitar múltiplas chamadas simultâneas
let isLoadingGifts = false;

// Carregar presentes do Supabase
async function loadGifts() {
    const giftsGrid = document.getElementById('gifts-grid');
    if (!giftsGrid) {
        console.error('Elemento gifts-grid não encontrado');
        return;
    }

    // Evitar múltiplas chamadas simultâneas
    if (isLoadingGifts) {
        console.log('Carregamento de presentes já em andamento, ignorando chamada duplicada');
        return;
    }

    isLoadingGifts = true;

    try {
        // Verificar se Supabase está disponível com timeout
        if (!window.supabaseClient) {
            try {
                await Promise.race([
                    waitForSupabase(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout aguardando Supabase')), 10000))
                ]);
            } catch (timeoutError) {
                console.error('Timeout aguardando Supabase:', timeoutError);
                giftsGrid.innerHTML = '<div class="error-message">Erro: Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.</div>';
                isLoadingGifts = false;
                return;
            }
        }

        if (!window.supabaseClient) {
            giftsGrid.innerHTML = '<div class="error-message">Erro: Supabase não configurado.</div>';
            isLoadingGifts = false;
            return;
        }

        // Buscar TODOS os presentes (disponíveis e confirmados), ordenados por valor (menor para maior)
        let data, error;
        try {
            const result = await window.supabaseClient
                .from('lista_presentes')
                .select('*')
                .order('valor', { ascending: true });
            data = result.data;
            error = result.error;
        } catch (networkError) {
            console.error('Erro de rede ao buscar presentes:', networkError);
            // Se for erro de rede, tentar identificar o tipo
            if (networkError.message && networkError.message.includes('Load failed')) {
                throw new Error('Erro de conexão: Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
            } else if (networkError.message && networkError.message.includes('CORS')) {
                throw new Error('Erro de CORS: Problema de configuração do servidor.');
            } else {
                throw new Error(`Erro de rede: ${networkError.message || 'Erro desconhecido'}`);
            }
        }

        if (error) {
            console.error('Erro na query do Supabase:', error);
            throw error;
        }

        allGifts = data || [];
        console.log('Presentes carregados:', allGifts.length);
        
        // Garantir que o loading message seja removido
        const giftsGrid = document.getElementById('gifts-grid');
        if (giftsGrid) {
            const loadingMessage = giftsGrid.querySelector('.loading-message');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }
        
        // Aplicar filtros após carregar (filtro de disponibilidade está pré-selecionado)
        if (allGifts.length > 0) {
            applyFilters();
        } else {
            // Se não houver presentes, mostrar mensagem
            if (giftsGrid) {
                giftsGrid.innerHTML = '<div class="no-gifts-message">Nenhum presente disponível no momento.</div>';
            }
        }

    } catch (error) {
        console.error('Erro ao carregar presentes:', error);
        const errorMsg = error.message || 'Erro desconhecido';
        giftsGrid.innerHTML = `<div class="error-message">Erro ao carregar presentes: ${errorMsg}. Verifique o console para mais detalhes.</div>`;
    } finally {
        isLoadingGifts = false;
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
    
    let giftsHTML = gifts.map(gift => {
        const imageUrl = gift.foto_display && gift.foto_display.trim() !== '' 
            ? gift.foto_display 
            : placeholderImage;
        
        // Escapar placeholderImage para uso em atributo HTML (escapar aspas simples)
        const escapedPlaceholder = placeholderImage.replace(/'/g, "&#39;");
        
        const isConfirmed = gift.status === 'confirmado';
        const cardClass = isConfirmed ? 'gift-card gift-card-confirmed' : 'gift-card';
        const tooltipText = isConfirmed ? 'Davi e Yas já ganharam 🎉' : '';
        
        return `
        <div class="${cardClass}" data-code="${gift.code}" data-status="${gift.status}" title="${tooltipText}">
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
                ${isConfirmed ? '<div class="gift-card-confirmed-badge">Presenteado 🎉</div>' : `<button class="gift-card-btn" onclick="openGiftModal('${escapeHtml(gift.code)}')">Presentear</button>`}
            </div>
        </div>
        `;
    }).join('');
    
    // Adicionar card de presente surpresa no final
    giftsHTML += `
        <div class="gift-card gift-card-surprise">
            <div class="gift-card-image">
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #FFEEF3 0%, #DADE91 100%); font-size: 4rem; color: #BD7F91;">?</div>
            </div>
            <div class="gift-card-content">
                <h3 class="gift-card-name">Presente Surpresa</h3>
                <div class="gift-card-meta">
                    <span class="gift-card-tema">Surpresa</span>
                    <span class="gift-card-faixa">Valor Livre</span>
                </div>
                <div class="gift-card-price">?</div>
                <button class="gift-card-btn" onclick="openSurpriseGiftModal()">Presentear</button>
            </div>
        </div>
    `;
    
    giftsGrid.innerHTML = giftsHTML;
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
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#FFEEF3"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#6B705C" text-anchor="middle" dy=".3em">Presente</text></svg>';
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
    
    // Não abrir modal se o presente já estiver confirmado
    if (gift.status === 'confirmado') {
        return;
    }

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
    
    // Garantir que a imagem está visível (pode ter sido escondida pelo presente surpresa)
    modalImg.style.display = 'block';
    modalImg.src = imageUrl;
    modalImg.alt = gift.nome;
    modalImg.onerror = function() {
        this.onerror = null;
        this.src = placeholderImage;
    };
    
    // Esconder mensagem de surpresa se existir
    const modalImageContainer = modalImg.parentElement;
    if (modalImageContainer) {
        const messageDiv = modalImageContainer.querySelector('.surprise-message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }
    
    modalValue.textContent = formatCurrency(gift.valor);
    modalPix.textContent = gift.pix_chave;
    
    // Remover atributo data-pix-key se existir (do presente surpresa)
    modalPix.removeAttribute('data-pix-key');
    
    // Limpar formulário
    form.reset();
    
    // Garantir que o formulário está visível (pode ter sido escondido pelo presente surpresa)
    form.style.display = 'block';

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
            const pixKeyElement = document.getElementById('gift-modal-pix');
            if (pixKeyElement) {
                // Verificar se tem atributo data-pix-key (presente surpresa)
                let pixText = pixKeyElement.getAttribute('data-pix-key');
                
                if (!pixText) {
                    // Para presentes normais, usar o texto completo
                    pixText = pixKeyElement.textContent || pixKeyElement.innerText;
                }
                
                navigator.clipboard.writeText(pixText).then(() => {
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
        // Carregar presentes após configurar filtros
        loadGifts();
    });
} else {
    setupGiftEventListeners();
    setupFilters();
    // Carregar presentes após configurar filtros
    loadGifts();
}

// Configurar filtros
function setupFilters() {
    // Função para sincronizar filtros
    const syncFilters = (sourceTab, allTabs) => {
        allTabs.forEach(t => t.classList.remove('active'));
        sourceTab.classList.add('active');
        applyFilters();
    };
    
    // Filtro por tema (abas) - versão normal
    const temaTabs = document.querySelectorAll('.filter-tab');
    temaTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Sincronizar com filtros compactos
            const tema = tab.dataset.tema;
            const compactTabs = document.querySelectorAll('.filter-tab-compact');
            compactTabs.forEach(ct => {
                if (ct.dataset.tema === tema) {
                    syncFilters(ct, compactTabs);
                }
            });
            // Sincronizar com select mobile
            const categoriaSelectCompact = document.getElementById('categoria-filter-compact');
            if (categoriaSelectCompact) {
                categoriaSelectCompact.value = tema;
            }
            syncFilters(tab, temaTabs);
        });
    });

    // Filtro por tema (abas) - versão compacta
    const temaTabsCompact = document.querySelectorAll('.filter-tab-compact');
    temaTabsCompact.forEach(tab => {
        tab.addEventListener('click', () => {
            // Sincronizar com filtros normais
            const tema = tab.dataset.tema;
            const normalTabs = document.querySelectorAll('.filter-tab');
            normalTabs.forEach(nt => {
                if (nt.dataset.tema === tema) {
                    syncFilters(nt, normalTabs);
                }
            });
            // Sincronizar com select mobile
            const categoriaSelectCompact = document.getElementById('categoria-filter-compact');
            if (categoriaSelectCompact) {
                categoriaSelectCompact.value = tema;
            }
            syncFilters(tab, temaTabsCompact);
        });
    });
    
    // Filtro por categoria - select mobile (versão compacta)
    const categoriaSelectCompact = document.getElementById('categoria-filter-compact');
    if (categoriaSelectCompact) {
        categoriaSelectCompact.addEventListener('change', () => {
            const tema = categoriaSelectCompact.value;
            // Sincronizar com botões compactos
            const compactTabs = document.querySelectorAll('.filter-tab-compact');
            compactTabs.forEach(ct => {
                if (ct.dataset.tema === tema) {
                    syncFilters(ct, compactTabs);
                }
            });
            // Sincronizar com filtros normais
            const normalTabs = document.querySelectorAll('.filter-tab');
            normalTabs.forEach(nt => {
                if (nt.dataset.tema === tema) {
                    syncFilters(nt, normalTabs);
                }
            });
            applyFilters();
        });
    }

    // Filtro por faixa (select) - versão normal
    const faixaFilter = document.getElementById('faixa-filter');
    if (faixaFilter) {
        faixaFilter.addEventListener('change', () => {
            // Sincronizar com filtro compacto
            const faixaFilterCompact = document.getElementById('faixa-filter-compact');
            if (faixaFilterCompact) {
                faixaFilterCompact.value = faixaFilter.value;
            }
            applyFilters();
        });
    }
    
    // Filtro por faixa (select) - versão compacta
    const faixaFilterCompact = document.getElementById('faixa-filter-compact');
    if (faixaFilterCompact) {
        faixaFilterCompact.addEventListener('change', () => {
            // Sincronizar com filtro normal
            if (faixaFilter) {
                faixaFilter.value = faixaFilterCompact.value;
            }
            applyFilters();
        });
    }
    
    // Filtro por disponibilidade (select) - versão normal
    const disponibilidadeFilter = document.getElementById('disponibilidade-filter');
    if (disponibilidadeFilter) {
        disponibilidadeFilter.addEventListener('change', () => {
            // Sincronizar com filtro compacto
            const disponibilidadeFilterCompact = document.getElementById('disponibilidade-filter-compact');
            if (disponibilidadeFilterCompact) {
                disponibilidadeFilterCompact.value = disponibilidadeFilter.value;
            }
            applyFilters();
        });
    }
    
    // Filtro por disponibilidade (select) - versão compacta
    const disponibilidadeFilterCompact = document.getElementById('disponibilidade-filter-compact');
    if (disponibilidadeFilterCompact) {
        disponibilidadeFilterCompact.addEventListener('change', () => {
            // Sincronizar com filtro normal
            if (disponibilidadeFilter) {
                disponibilidadeFilter.value = disponibilidadeFilterCompact.value;
            }
            applyFilters();
        });
    }
}

// Aplicar filtros
function applyFilters() {
    // Verificar select mobile primeiro, depois botões
    const categoriaSelectCompact = document.getElementById('categoria-filter-compact');
    const activeTemaFromSelect = categoriaSelectCompact?.value;
    const activeTemaTab = document.querySelector('.filter-tab.active') || document.querySelector('.filter-tab-compact.active');
    const activeTema = activeTemaFromSelect || activeTemaTab?.dataset.tema || 'todos';
    
    const faixaFilter = document.getElementById('faixa-filter') || document.getElementById('faixa-filter-compact');
    const selectedPriceCluster = faixaFilter?.value || 'todos';
    
    const disponibilidadeFilter = document.getElementById('disponibilidade-filter') || document.getElementById('disponibilidade-filter-compact');
    const selectedDisponibilidade = disponibilidadeFilter?.value || 'disponiveis';

    let filteredGifts = [...allGifts];

    // Filtrar por tema
    if (activeTema !== 'todos') {
        filteredGifts = filteredGifts.filter(gift => gift.tema === activeTema);
    }

    // Filtrar por cluster de preço
    if (selectedPriceCluster !== 'todos') {
        filteredGifts = filteredGifts.filter(gift => {
            const valor = parseFloat(gift.valor) || 0;
            
            switch(selectedPriceCluster) {
                case '0-100':
                    return valor >= 0 && valor <= 100;
                case '100-300':
                    return valor > 100 && valor <= 300;
                case '300-500':
                    return valor > 300 && valor <= 500;
                case '500-1000':
                    return valor > 500 && valor <= 1000;
                case '1000+':
                    return valor > 1000;
                default:
                    return true;
            }
        });
    }
    
    // Filtrar por disponibilidade
    if (selectedDisponibilidade === 'disponiveis') {
        filteredGifts = filteredGifts.filter(gift => gift.status !== 'confirmado');
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

        // Recarregar todos os presentes para atualizar o estado (incluindo confirmados)
        await loadGifts();

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

    // Abrir modal de presente surpresa
    function openSurpriseGiftModal() {
        const modal = document.getElementById('gift-modal');
        const modalTitle = document.getElementById('gift-modal-title');
        const modalImg = document.getElementById('gift-modal-img');
        const modalValue = document.getElementById('gift-modal-value');
        const modalPix = document.getElementById('gift-modal-pix');
        const form = document.getElementById('gift-confirmation-form');

        if (!modal || !modalTitle || !modalImg || !modalValue || !modalPix || !form) return;

        // Preencher dados do modal com mensagem especial
        modalTitle.textContent = 'Presente Surpresa';
        
        // Esconder a imagem e mostrar a mensagem no lugar
        modalImg.style.display = 'none';
        const modalImageContainer = modalImg.parentElement;
        if (modalImageContainer) {
            // Criar div para a mensagem se não existir
            let messageDiv = modalImageContainer.querySelector('.surprise-message');
            if (!messageDiv) {
                messageDiv = document.createElement('div');
                messageDiv.className = 'surprise-message';
                messageDiv.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 2rem; text-align: center; background: var(--peach-soft); border-radius: 10px;';
                modalImageContainer.appendChild(messageDiv);
            }
            const surpriseMessage = 'Não achou nada interessante na lista? Deixe ser usado para nos abençoar com ousadia e criatividade. 😜';
            messageDiv.innerHTML = `<div style="line-height: 1.8; color: var(--text-dark); font-size: 1.1rem;">${surpriseMessage}</div>`;
            messageDiv.style.display = 'flex';
        }
        
        modalValue.textContent = '?';
        
        // Chave PIX apenas (sem formatação)
        const pixKey = '44778036808';
        modalPix.textContent = pixKey;
        
        // Armazenar a chave PIX em um atributo data para facilitar a cópia
        modalPix.setAttribute('data-pix-key', pixKey);
        
        // Limpar formulário
        form.reset();
        
        // Esconder formulário de confirmação para presente surpresa (não precisa confirmar no banco)
        form.style.display = 'none';

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
            form.style.display = 'block'; // Restaurar formulário
            
            // Restaurar imagem (pode ter sido escondida pelo presente surpresa)
            modalImg.style.display = 'block';
            const modalImageContainer = modalImg.parentElement;
            if (modalImageContainer) {
                const messageDiv = modalImageContainer.querySelector('.surprise-message');
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
            }
            
            currentGift = null;
        };

        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }

        if (overlay) {
            overlay.onclick = closeModal;
        }
    }

    // Exportar funções necessárias para o escopo global
    window.openGiftModal = openGiftModal;
    window.openSurpriseGiftModal = openSurpriseGiftModal;
})();
