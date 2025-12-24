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
    // Data da cerimônia: 31 de Maio de 2026, 11:00
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

// Abrir modal ao clicar em um presente
giftCards.forEach(card => {
    card.addEventListener('click', () => {
        const pixKey = card.getAttribute('data-pix');
        pixKeyDisplay.textContent = pixKey;
        pixModal.style.display = 'block';
    });
});

// Fechar modal
closeModal.addEventListener('click', () => {
    pixModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === pixModal) {
        pixModal.style.display = 'none';
    }
});

// Copiar chave PIX
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
    
    if (!carouselTrack) return;
    
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
    
    // Criar slides do carrossel
    function createCarouselSlides() {
        carouselTrack.innerHTML = '';
        
        // Filtrar apenas imagens que carregam com sucesso
        let loadedImages = 0;
        const totalImages = duplicatedImages.length;
        
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
                // Iniciar animação quando todas as imagens estiverem carregadas
                if (loadedImages === totalImages) {
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
                    setTimeout(() => {
                        startAutoScroll();
                    }, 200);
                }
            };
            
            slide.appendChild(img);
            carouselTrack.appendChild(slide);
        });
        
        // Fallback: iniciar animação mesmo se algumas imagens não carregarem
        setTimeout(() => {
            if (!animationId) {
                startAutoScroll();
            }
        }, 1000);
    }
    
    // Animação de scroll automático
    function startAutoScroll() {
        // Calcular largura de um conjunto de fotos
        const singleSetWidth = carouselTrack.scrollWidth / 3;
        
        function animate() {
            if (!isPaused) {
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
    
    // Pausar ao passar o mouse
    const carouselWrapper = carouselTrack.closest('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => {
            isPaused = true;
        });
        
        carouselWrapper.addEventListener('mouseleave', () => {
            isPaused = false;
        });
    }
    
    // Inicializar carrossel quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCarouselSlides);
    } else {
        // Aguardar um pouco para garantir que o layout foi calculado
        setTimeout(createCarouselSlides, 100);
    }
})();

