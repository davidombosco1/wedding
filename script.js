// Navegação mobile
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Detectar scroll para mudar estilo do navbar
(function() {
    const navbar = document.querySelector('.navbar');
    const hero = document.querySelector('.hero');
    
    function checkScroll() {
        if (!hero) return;
        
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Se scrollou além da seção hero, adicionar classe scrolled
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Verificar no scroll
    window.addEventListener('scroll', checkScroll);
    
    // Verificar inicialmente
    checkScroll();
})();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contagem regressiva
function updateCountdown() {
    // Data da cerimônia: 31 de maio de 2026, 11:00
    const weddingDate = new Date('2026-05-31T11:00:00');
    const now = new Date();
    
    // Se a data já passou, mostrar zeros
    if (now > weddingDate) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    const difference = weddingDate - now;
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Atualizar contagem regressiva a cada segundo
updateCountdown();
setInterval(updateCountdown, 1000);

// Formulário de confirmação agora está em confirmation.js

// Modal PIX
const giftCards = document.querySelectorAll('.gift-card');
const pixModal = document.getElementById('pix-modal');
const pixKeyDisplay = document.getElementById('pix-key-display');
const closeModal = document.querySelector('.close-modal');
const copyPixBtn = document.getElementById('copy-pix-btn');

// Abrir modal ao clicar em um presente (se existir)
if (giftCards.length > 0) {
    giftCards.forEach(card => {
        card.addEventListener('click', () => {
            const pixKey = card.getAttribute('data-pix');
            if (pixKeyDisplay && pixModal) {
                pixKeyDisplay.textContent = pixKey;
                pixModal.style.display = 'block';
            }
        });
    });
}

// Fechar modal (se existir)
if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (pixModal) {
            pixModal.style.display = 'none';
        }
    });
}

if (pixModal) {
    window.addEventListener('click', (e) => {
        if (e.target === pixModal) {
            pixModal.style.display = 'none';
        }
    });
}

// Copiar chave PIX
if (copyPixBtn && pixKeyDisplay) {
    copyPixBtn.addEventListener('click', () => {
        const pixKey = pixKeyDisplay.textContent;
        
        // Usar a API de Clipboard se disponível
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pixKey).then(() => {
                copyPixBtn.textContent = 'Copiado!';
                copyPixBtn.style.background = '#28a745';
                
                setTimeout(() => {
                    copyPixBtn.textContent = 'Copiar Chave PIX';
                    copyPixBtn.style.background = '';
                }, 2000);
            });
        } else {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = pixKey;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                copyPixBtn.textContent = 'Copiado!';
                copyPixBtn.style.background = '#28a745';
                
                setTimeout(() => {
                    copyPixBtn.textContent = 'Copiar Chave PIX';
                    copyPixBtn.style.background = '';
                }, 2000);
            } catch (err) {
                alert('Não foi possível copiar. A chave PIX é: ' + pixKey);
            }
            
            document.body.removeChild(textArea);
        }
    });
}

// Efeito de scroll na navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Carrossel de Fotos - Horizontal com múltiplas fotos visíveis
(function initCarousel() {
    const carouselTrack = document.getElementById('carousel-track');
    
    if (!carouselTrack) {
        console.warn('Carrossel não encontrado: elemento #carousel-track não existe');
        return;
    }
    
    console.log('Carrossel encontrado, inicializando...');
    
    // Lista de TODAS as fotos do carrossel (17 fotos)
    const carouselImages = [
        'carrossel/IMG_2740.jpg',
        'carrossel/IMG_5112.jpg',
        'carrossel/IMG_5382.jpg',
        'carrossel/IMG_5552.jpg',
        'carrossel/IMG_6084.jpg',
        'carrossel/IMG_6127.jpg',
        'carrossel/IMG_6832.jpg',
        'carrossel/IMG_7168.jpg',
        'carrossel/IMG_7235.jpg',
        'carrossel/IMG_7319.jpg',
        'carrossel/IMG_7391.jpg',
        'carrossel/IMG_7848.jpg',
        'carrossel/IMG_7866.jpg',
        'carrossel/IMG_8080.jpg',
        'carrossel/IMG_8601.jpg',
        'carrossel/IMG_9073.jpg',
        'carrossel/IMG_9321.jpg'
    ];
    
    // Duplicar as fotos para criar loop infinito
    const duplicatedImages = [...carouselImages, ...carouselImages, ...carouselImages];
    
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels por frame (ajuste para velocidade)
    let animationId = null;
    let isPaused = false;
    
    // Variáveis para scroll manual
    let isDragging = false;
    let startX = 0;
    let startScrollPosition = 0;
    let manualScrollTimeout = null;
    let singleSetWidth = 0;
    
    // Criar slides do carrossel
    function createCarouselSlides() {
        console.log('Criando slides do carrossel...');
        console.log('Elemento carouselTrack:', carouselTrack);
        
        if (!carouselTrack) {
            console.error('carouselTrack não encontrado!');
            return;
        }
        
        carouselTrack.innerHTML = '';
        
        // Filtrar apenas imagens que carregam com sucesso
        let loadedImages = 0;
        const totalImages = duplicatedImages.length;
        console.log(`Total de imagens a carregar: ${totalImages}`);
        
        duplicatedImages.forEach((imagePath, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `Nossa História ${(index % carouselImages.length) + 1}`;
            img.className = 'carousel-image';
            img.loading = 'lazy';
            
            img.onload = function() {
                loadedImages++;
                console.log(`Imagem carregada: ${imagePath} (${loadedImages}/${totalImages})`);
                // Iniciar animação quando todas as imagens estiverem carregadas
                if (loadedImages === totalImages) {
                    console.log('Todas as imagens carregadas, iniciando animação...');
                    setTimeout(() => {
                        startAutoScroll();
                    }, 200);
                }
            };
            
            img.onerror = function() {
                console.warn('Erro ao carregar imagem:', imagePath);
                this.style.display = 'none';
                loadedImages++;
                // Mesmo com erro, contar como carregada para não travar
                if (loadedImages === totalImages) {
                    console.log('Todas as imagens processadas (algumas com erro), iniciando animação...');
                    setTimeout(() => {
                        startAutoScroll();
                    }, 200);
                }
            };
            
            slide.appendChild(img);
            carouselTrack.appendChild(slide);
        });
        
        console.log(`Slides criados: ${carouselTrack.children.length}`);
        
        // Fallback: iniciar animação mesmo se algumas imagens não carregarem
        setTimeout(() => {
            if (!animationId && carouselTrack.children.length > 0) {
                console.log('Fallback: iniciando animação após timeout...');
                startAutoScroll();
            }
        }, 2000);
    }
    
    // Animação de scroll automático
    function startAutoScroll() {
        console.log('Iniciando animação do carrossel...');
        
        // Verificar se o carrossel tem conteúdo
        if (carouselTrack.children.length === 0) {
            console.warn('Carrossel não tem slides, tentando criar novamente...');
            setTimeout(createCarouselSlides, 500);
            return;
        }
        
        // Calcular largura de um conjunto de fotos
        singleSetWidth = carouselTrack.scrollWidth / 3;
        console.log(`Largura do conjunto: ${singleSetWidth}px`);
        console.log(`Número de slides: ${carouselTrack.children.length}`);
        
        // Se a largura for 0 ou inválida, tentar novamente
        if (singleSetWidth <= 0 || !isFinite(singleSetWidth)) {
            console.warn('Largura inválida, tentando novamente em 500ms...');
            setTimeout(() => startAutoScroll(), 500);
            return;
        }
        
        function animate() {
            if (!isPaused && carouselTrack.children.length > 0) {
                scrollPosition -= scrollSpeed;
                
                // Resetar posição quando chegar ao final de um conjunto (criar loop infinito)
                if (Math.abs(scrollPosition) >= singleSetWidth) {
                    scrollPosition = scrollPosition + singleSetWidth;
                }
                
                carouselTrack.style.transform = `translateX(${scrollPosition}px)`;
            }
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }
    
    // Função para retomar scroll automático após interação manual
    function resumeAutoScroll() {
        if (manualScrollTimeout) {
            clearTimeout(manualScrollTimeout);
        }
        manualScrollTimeout = setTimeout(() => {
            isPaused = false;
            // Garantir que a posição está dentro dos limites
            normalizeScrollPosition();
        }, 1500); // Retoma após 1.5 segundos sem interação
    }
    
    // Normalizar posição do scroll para manter loop infinito
    function normalizeScrollPosition() {
        if (singleSetWidth <= 0) return;
        
        // Se estiver muito à esquerda, ajustar
        while (scrollPosition < -singleSetWidth) {
            scrollPosition += singleSetWidth;
        }
        // Se estiver muito à direita, ajustar
        while (scrollPosition > 0) {
            scrollPosition -= singleSetWidth;
        }
    }
    
    // Pausar ao passar o mouse (mantém funcionalidade original)
    const carouselWrapper = carouselTrack.closest('.carousel-wrapper');
    if (carouselWrapper) {
        // Scroll manual com mouse drag
        carouselWrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            isPaused = true;
            startX = e.clientX;
            startScrollPosition = scrollPosition;
            carouselWrapper.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        carouselWrapper.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                scrollPosition = startScrollPosition + deltaX;
                normalizeScrollPosition();
                carouselTrack.style.transform = `translateX(${scrollPosition}px)`;
                carouselTrack.style.transition = 'none'; // Remover transição durante drag
            }
        });
        
        carouselWrapper.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                carouselWrapper.style.cursor = 'grab';
                carouselTrack.style.transition = ''; // Restaurar transição
                resumeAutoScroll();
            }
        });
        
        carouselWrapper.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                carouselWrapper.style.cursor = 'grab';
                carouselTrack.style.transition = '';
                resumeAutoScroll();
            }
        });
        
        // Scroll com roda do mouse
        carouselWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            isPaused = true;
            
            // Scroll mais rápido com a roda
            const scrollAmount = e.deltaY * 0.5;
            scrollPosition -= scrollAmount;
            normalizeScrollPosition();
            carouselTrack.style.transform = `translateX(${scrollPosition}px)`;
            carouselTrack.style.transition = 'transform 0.1s ease-out';
            
            resumeAutoScroll();
        }, { passive: false });
        
        // Touch events para mobile
        let touchStartX = 0;
        let touchStartScrollPosition = 0;
        
        carouselWrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            isPaused = true;
            touchStartX = e.touches[0].clientX;
            touchStartScrollPosition = scrollPosition;
            carouselTrack.style.transition = 'none';
        }, { passive: true });
        
        carouselWrapper.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const deltaX = e.touches[0].clientX - touchStartX;
                scrollPosition = touchStartScrollPosition + deltaX;
                normalizeScrollPosition();
                carouselTrack.style.transform = `translateX(${scrollPosition}px)`;
            }
        }, { passive: true });
        
        carouselWrapper.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                carouselTrack.style.transition = '';
                resumeAutoScroll();
            }
        }, { passive: true });
        
        // Mudar cursor para indicar que é arrastável
        carouselWrapper.style.cursor = 'grab';
        
        // Pausar ao passar o mouse (comportamento original mantido)
        carouselWrapper.addEventListener('mouseenter', () => {
            if (!isDragging) {
                isPaused = true;
            }
        });
        
        carouselWrapper.addEventListener('mouseleave', () => {
            if (!isDragging) {
                isPaused = false;
            }
        });
    }
    
    // Inicializar carrossel quando o DOM estiver pronto
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(createCarouselSlides, 300);
            });
        } else {
            // DOM já está pronto, aguardar um pouco para garantir que o layout foi calculado
            setTimeout(createCarouselSlides, 300);
        }
    }
    
    // Tentar inicializar imediatamente
    init();
    
    // Também tentar quando a janela carregar completamente
    window.addEventListener('load', () => {
        if (!animationId) {
            console.log('Tentando inicializar carrossel após load da janela...');
            setTimeout(createCarouselSlides, 500);
        }
    });
})();

// Detectar quando elementos sticky estão fixos e adicionar classe is-sticky
// Também detecta quando o usuário está scrollando dentro da seção para compactar o cabeçalho
(function() {
    const stickyElements = document.querySelectorAll('.story-title-wrapper, .ceremony-title-wrapper, .confirmation-title-wrapper, .gifts-title-wrapper');
    const stickyStartPoints = new Map(); // Armazenar quando cada elemento ficou sticky
    const compactStates = new Map(); // Armazenar estado atual de compacto para cada elemento
    const compactTimeouts = new Map(); // Timeouts para debounce das mudanças
    const pendingStates = new Map(); // Estados pendentes para aplicar quando scroll parar (mobile)
    
    // Detecção de mobile mais robusta (considera touch e viewport)
    const isMobileDevice = window.innerWidth <= 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Timeout global para aplicar mudanças pendentes quando scroll parar (mobile)
    let scrollEndTimeout = null;
    
    function checkSticky() {
        stickyElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const stickyTop = 70; // 70px é o top do sticky
            
            // Verificar se o elemento está na posição sticky (top <= 70px)
            // Para gifts-title-wrapper, verificar se está dentro da seção pai
            const parentSection = element.closest('section');
            let isSticky = rect.top <= stickyTop;
            
            // No mobile, aplicar lógica estável para TODAS as seções para evitar histerese/tilt
            if (isMobileDevice && parentSection) {
                const parentRect = parentSection.getBoundingClientRect();
                const wasSticky = element.classList.contains('is-sticky');
                
                // Lógica estável: uma vez que ficou sticky, manter sticky até sair completamente
                if (wasSticky) {
                    // Se já estava sticky, só remover se saiu completamente da seção (com margem)
                    isSticky = parentRect.bottom > stickyTop && rect.top <= stickyTop + 10;
                } else {
                    // Se não estava sticky, só adicionar se claramente passou do threshold
                    isSticky = rect.top <= stickyTop && parentRect.bottom > stickyTop;
                }
            } else if (element.classList.contains('gifts-title-wrapper') && parentSection) {
                // Desktop: lógica original mais rigorosa para gifts
                const parentRect = parentSection.getBoundingClientRect();
                isSticky = rect.top <= stickyTop && parentRect.bottom > stickyTop;
            }
            
            if (isSticky) {
                element.classList.add('is-sticky');
                
                // Armazenar quando o elemento ficou sticky pela primeira vez
                if (!stickyStartPoints.has(element)) {
                    stickyStartPoints.set(element, scrollTop);
                }
                
                // Calcular quanto o usuário scrollou desde que o cabeçalho ficou sticky
                const startPoint = stickyStartPoints.get(element);
                // Arredondar para evitar oscilações por pequenas variações de pixel
                const scrollOffset = Math.round(scrollTop - startPoint);
                
                // Usar detecção de mobile global (mais robusta)
                const isCurrentlyCompact = compactStates.get(element) || false;
                
                if (isMobileDevice) {
                    // MOBILE: Lógica diferente para gifts (que está funcionando) e outras seções
                    const isGiftsSection = element.classList.contains('gifts-title-wrapper');
                    
                    if (!isGiftsSection) {
                        // Para outras seções: uma vez compacto, permanece até voltar ao topo
                        const activateThreshold = 50; // Ativar compacto após scroll moderado
                        
                        if (!isCurrentlyCompact) {
                            // Se não está compacto: ativar quando passar do threshold
                            if (scrollOffset > activateThreshold) {
                                element.classList.add('is-compact');
                                compactStates.set(element, true);
                            }
                        } else {
                            // Se já está compacto: só desativar quando voltar ao topo da seção (scrollOffset <= 0)
                            // Isso evita alternância durante o scroll
                            if (scrollOffset <= 0) {
                                element.classList.remove('is-compact');
                                compactStates.set(element, false);
                            }
                            // Caso contrário, manter compacto (não fazer nada)
                        }
                    } else {
                        // Para gifts: manter lógica original que está funcionando perfeitamente
                        const activateThreshold = 80;
                        const deactivateThreshold = 10;
                        const earlyActivateThreshold = 50;
                        
                        const isInIntermediateZone = scrollOffset >= deactivateThreshold && scrollOffset <= activateThreshold;
                        
                        if (!isInIntermediateZone) {
                            if (scrollOffset > activateThreshold) {
                                if (!isCurrentlyCompact) {
                                    element.classList.add('is-compact');
                                    compactStates.set(element, true);
                                }
                            } else if (scrollOffset < deactivateThreshold) {
                                if (isCurrentlyCompact) {
                                    element.classList.remove('is-compact');
                                    compactStates.set(element, false);
                                }
                            }
                        } else {
                            if (!isCurrentlyCompact && scrollOffset >= earlyActivateThreshold) {
                                element.classList.add('is-compact');
                                compactStates.set(element, true);
                            } else if (isCurrentlyCompact && scrollOffset <= deactivateThreshold + 5) {
                                element.classList.remove('is-compact');
                                compactStates.set(element, false);
                            }
                        }
                    }
                } else {
                    // DESKTOP: Transição imediata e suave com thresholds menores
                    // Usar histerese robusta para evitar alternância quando está exatamente no threshold
                    const activateThreshold = 60;  // Aumentado para ter mais margem
                    const deactivateThreshold = 15; // Reduzido para ter mais margem
                    
                    // Zona intermediária: SEMPRE manter estado atual (nunca alterar)
                    // Isso evita qualquer alternância quando o scroll está pausado na zona intermediária
                    const isInIntermediateZone = scrollOffset >= deactivateThreshold && scrollOffset <= activateThreshold;
                    
                    if (!isInIntermediateZone) {
                        // Fora da zona intermediária: aplicar mudanças baseado na posição
                        if (scrollOffset > activateThreshold) {
                            // Claramente acima do threshold: ativar compacto
                            if (!isCurrentlyCompact) {
                                element.classList.add('is-compact');
                                compactStates.set(element, true);
                            }
                        } else if (scrollOffset < deactivateThreshold) {
                            // Claramente abaixo do threshold: desativar compacto
                            if (isCurrentlyCompact) {
                                element.classList.remove('is-compact');
                                compactStates.set(element, false);
                            }
                        }
                    }
                    // Se está na zona intermediária, não fazer nada (manter estado atual)
                    // Isso previne alternância mesmo com pequenas variações no scrollOffset
                }
            } else {
                element.classList.remove('is-sticky');
                element.classList.remove('is-compact');
                // Limpar o ponto de início, estado, timeout e estado pendente quando não está mais sticky
                stickyStartPoints.delete(element);
                compactStates.delete(element);
                pendingStates.delete(element);
                if (compactTimeouts.has(element)) {
                    clearTimeout(compactTimeouts.get(element));
                    compactTimeouts.delete(element);
                }
            }
        });
    }
    
    // Função para aplicar estados pendentes (mobile - quando scroll parar)
    function applyPendingStates() {
        if (!isMobileDevice) return;
        
        // Recalcular estado baseado na posição ATUAL (não usar estado pendente armazenado)
        // Isso garante que aplicamos o estado correto para a posição final
        stickyElements.forEach(element => {
            if (!element.classList.contains('is-sticky')) return;
            
            const startPoint = stickyStartPoints.get(element);
            if (!startPoint) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollOffset = scrollTop - startPoint;
            
            const activateThreshold = 80;
            const deactivateThreshold = 10;
            
            const currentState = compactStates.get(element) || false;
            let desiredState;
            
            // Determinar estado baseado na posição ATUAL (quando scroll parou)
            if (scrollOffset <= deactivateThreshold) {
                desiredState = false; // No topo: completo
            } else if (scrollOffset >= activateThreshold) {
                desiredState = true; // Após threshold: compacto
            } else {
                desiredState = currentState; // Zona intermediária: manter atual
            }
            
            // Aplicar apenas se diferente do atual
            if (desiredState !== currentState) {
                if (desiredState) {
                    element.classList.add('is-compact');
                    compactStates.set(element, true);
                } else {
                    element.classList.remove('is-compact');
                    compactStates.set(element, false);
                }
            }
        });
        
        // Limpar estados pendentes após aplicar
        pendingStates.clear();
    }
    
    // Verificar no scroll com throttle para performance
    let ticking = false;
    let lastScrollY = window.scrollY;
    let lastCheckTime = 0;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const scrollDelta = Math.abs(currentScrollY - lastScrollY);
        const currentTime = Date.now();
        
        // MOBILE: Verificação durante o scroll (não apenas quando para)
        // Usar throttle leve para performance, mas aplicar mudanças imediatamente
        if (isMobileDevice) {
            // Throttle mais leve para mobile - verificar mais frequentemente
            const minScrollDelta = 5; // Reduzido para ser mais responsivo
            const minTimeDelta = 30; // Reduzido para ~33fps (mais suave)
            
            if (!ticking && scrollDelta >= minScrollDelta && (currentTime - lastCheckTime) >= minTimeDelta) {
                window.requestAnimationFrame(() => {
                    checkSticky();
                    lastScrollY = currentScrollY;
                    lastCheckTime = Date.now();
                    ticking = false;
                });
                ticking = true;
            }
        } else {
            // DESKTOP: Verificação imediata e suave usando requestAnimationFrame
            // Sem throttle agressivo para transição imediata
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    checkSticky();
                    lastScrollY = currentScrollY;
                    lastCheckTime = Date.now();
                    ticking = false;
                });
                ticking = true;
            }
        }
    }, { passive: true });
    
    // Verificar inicialmente
    checkSticky();
})();

