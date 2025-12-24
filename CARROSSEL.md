# 📸 Como Adicionar Fotos ao Carrossel

Este guia explica como adicionar fotos ao carrossel na seção "Nossa História".

## 📁 Estrutura de Pastas

1. Crie uma pasta chamada `carrossel` na raiz do projeto (mesmo nível do `index.html`)
2. Coloque suas fotos dentro dessa pasta

## 🖼️ Nomenclatura das Fotos

As fotos devem ser nomeadas como:
- `foto1.jpg`
- `foto2.jpg`
- `foto3.jpg`
- `foto4.jpg`
- `foto5.jpg`
- `foto6.jpg`

Ou use qualquer nome que preferir, mas você precisará atualizar o JavaScript.

## 🔧 Configurar no Código

1. Abra o arquivo `script.js`
2. Encontre a seção do carrossel (procure por `carouselImages`)
3. Atualize a lista com os nomes das suas fotos:

```javascript
const carouselImages = [
    'carrossel/sua-foto-1.jpg',
    'carrossel/sua-foto-2.jpg',
    'carrossel/sua-foto-3.jpg',
    'carrossel/sua-foto-4.jpg',
    'carrossel/sua-foto-5.jpg',
    'carrossel/sua-foto-6.jpg'
];
```

## 📝 Exemplo

Se suas fotos se chamam:
- `IMG_001.jpg`
- `IMG_002.jpg`
- `IMG_003.jpg`
- `IMG_004.jpg`
- `IMG_005.jpg`
- `IMG_006.jpg`

E estão na pasta `carrossel/`, então use:

```javascript
const carouselImages = [
    'carrossel/IMG_001.jpg',
    'carrossel/IMG_002.jpg',
    'carrossel/IMG_003.jpg',
    'carrossel/IMG_004.jpg',
    'carrossel/IMG_005.jpg',
    'carrossel/IMG_006.jpg'
];
```

## 💡 Dicas

- **Quantidade**: Você pode adicionar quantas fotos quiser
- **Formato**: JPG, PNG, WEBP funcionam
- **Tamanho**: Recomendado 800x600px ou maior
- **Orientação**: Fotos horizontais funcionam melhor

## 🎨 Funcionalidades do Carrossel

- ✅ Navegação por setas (← →)
- ✅ Indicadores (dots) na parte inferior
- ✅ Suporte para swipe em mobile
- ✅ Transição suave entre fotos
- ✅ Responsivo para todos os dispositivos

## 🔄 Auto-play (Opcional)

Se quiser que o carrossel avance automaticamente, descomente as linhas no `script.js`:

```javascript
// Descomente estas linhas:
let autoPlayInterval = setInterval(nextSlide, 5000);
carouselTrack.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
carouselTrack.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(nextSlide, 5000);
});
```

Isso fará o carrossel avançar a cada 5 segundos, pausando quando o mouse passar por cima.


