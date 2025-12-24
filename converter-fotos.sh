#!/bin/bash

# Script para converter todas as fotos .HEIC para .jpg na pasta carrossel

cd "carrossel"

echo "🔄 Convertendo fotos .HEIC para .jpg..."

for file in *.HEIC *.heic; do
    if [ -f "$file" ]; then
        filename="${file%.*}"
        jpg_file="${filename}.jpg"
        
        # Verificar se o .jpg já existe
        if [ ! -f "$jpg_file" ]; then
            echo "Convertendo: $file -> $jpg_file"
            sips -s format jpeg "$file" --out "$jpg_file"
        else
            echo "⚠️  $jpg_file já existe, pulando $file"
        fi
    fi
done

echo "✅ Conversão concluída!"
echo ""
echo "📝 Agora edite o arquivo script.js e adicione todas as fotos .jpg na lista carouselImages"


