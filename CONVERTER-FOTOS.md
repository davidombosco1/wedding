# 📸 Como Converter Fotos .HEIC para .jpg

O carrossel está mostrando apenas 5 fotos porque as outras estão no formato `.HEIC`, que não funciona diretamente em navegadores web.

## 🔄 Solução: Converter .HEIC para .jpg

### Opção 1: Usando o Preview (Mac)

1. Abra a foto `.HEIC` no Preview
2. Vá em **Arquivo > Exportar**
3. Escolha formato **JPEG**
4. Salve na pasta `carrossel/` com o mesmo nome (ex: `IMG_2740.jpg`)

### Opção 2: Usando linha de comando (Mac)

Abra o Terminal na pasta do projeto e execute:

```bash
cd "carrossel"
for file in *.HEIC *.heic; do
    if [ -f "$file" ]; then
        filename="${file%.*}"
        sips -s format jpeg "$file" --out "${filename}.jpg"
    fi
done
```

Isso converterá todas as fotos `.HEIC` e `.heic` para `.jpg` automaticamente.

### Opção 3: Usando conversor online

1. Acesse um conversor online (ex: https://cloudconvert.com/heic-to-jpg)
2. Faça upload das fotos `.HEIC`
3. Baixe as versões `.jpg`
4. Coloque na pasta `carrossel/`

## 📝 Depois de converter

Após converter as fotos, edite o arquivo `script.js` e adicione todas as fotos na lista `carouselImages`:

```javascript
const carouselImages = [
    'carrossel/IMG_6832.jpg',
    'carrossel/IMG_7168.jpg',
    'carrossel/IMG_7319.jpg',
    'carrossel/IMG_7391.jpg',
    'carrossel/IMG_8080.jpg',
    // Adicione as novas fotos convertidas aqui:
    'carrossel/IMG_2740.jpg',
    'carrossel/IMG_5112.jpg',
    'carrossel/IMG_5382.jpg',
    'carrossel/IMG_5552.jpg',
    'carrossel/IMG_6084.jpg',
    'carrossel/IMG_6127.jpg',
    'carrossel/IMG_7235.jpg',
    'carrossel/IMG_7848.jpg',
    'carrossel/IMG_8601.jpg',
    'carrossel/IMG_9073.jpg',
    'carrossel/IMG_9321.jpg',
];
```

## ✅ Fotos que já estão prontas

Estas 5 fotos já estão funcionando:
- ✅ IMG_6832.jpg
- ✅ IMG_7168.jpg
- ✅ IMG_7319.jpg
- ✅ IMG_7391.jpg
- ✅ IMG_8080.jpg

## 📋 Fotos que precisam ser convertidas

Estas 12 fotos precisam ser convertidas de .HEIC para .jpg:
- ⏳ IMG_2740.HEIC
- ⏳ IMG_5112.HEIC
- ⏳ IMG_5382.HEIC
- ⏳ IMG_5552.HEIC
- ⏳ IMG_6084.HEIC
- ⏳ IMG_6127.HEIC
- ⏳ IMG_7235.HEIC
- ⏳ IMG_7848.heic
- ⏳ IMG_8601.HEIC
- ⏳ IMG_9073.HEIC
- ⏳ IMG_9321.HEIC

Depois de converter, você terá **17 fotos** no total no carrossel! 🎉


