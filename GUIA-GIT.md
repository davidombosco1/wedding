# 📚 Guia Completo: Git Commit e Push

## 🎯 Passo a Passo para Enviar Alterações ao Netlify

### 1️⃣ **Verificar o Status das Alterações**
```bash
git status
```
Mostra quais arquivos foram modificados, adicionados ou deletados.

### 2️⃣ **Ver Alterações Detalhadas (Opcional)**
```bash
# Ver mudanças em um arquivo específico
git diff styles.css

# Ver todas as mudanças
git diff
```

### 3️⃣ **Adicionar Arquivos ao Stage (Preparar para Commit)**

**Opção A: Adicionar arquivos específicos**
```bash
git add styles.css
git add script.js
git add confirmation.js
```

**Opção B: Adicionar TODOS os arquivos modificados**
```bash
git add .
```
⚠️ **Cuidado:** Isso adiciona TODOS os arquivos modificados, incluindo `.DS_Store` (arquivo do macOS que geralmente não deve ser commitado).

**Opção C: Adicionar apenas arquivos específicos (recomendado)**
```bash
git add styles.css script.js confirmation.js gifts.js
```

### 4️⃣ **Verificar o que será Commitado**
```bash
git status
```
Os arquivos em verde estão prontos para commit.

### 5️⃣ **Fazer o Commit**
```bash
git commit -m "Descrição clara das mudanças"
```

**Exemplos de mensagens:**
```bash
git commit -m "Fix: Adicionar transições suaves para cabeçalho reduzido"
git commit -m "Feat: Sincronizar filtros compactos e normais"
git commit -m "Style: Ajustar cores e espaçamentos"
```

### 6️⃣ **Verificar Commits Locais Não Enviados**
```bash
git log origin/main..HEAD --oneline
```
Mostra commits que estão apenas no seu computador e não no GitHub.

### 7️⃣ **Enviar para o GitHub (Push)**
```bash
git push origin main
```

**Se der erro de certificado SSL:**
```bash
# Desabilitar verificação SSL temporariamente
git config --global http.sslVerify false
git push origin main
# Reabilitar verificação SSL
git config --global http.sslVerify true
```

### 8️⃣ **Verificar se Foi Enviado**
```bash
git status
```
Deve mostrar: "Your branch is up to date with 'origin/main'"

---

## 🔄 Fluxo Completo em Um Comando

```bash
# 1. Ver status
git status

# 2. Adicionar arquivos importantes
git add styles.css script.js confirmation.js gifts.js

# 3. Fazer commit
git commit -m "Fix: Adicionar transições para cabeçalho reduzido"

# 4. Enviar para GitHub
git push origin main
```

---

## 📝 Comandos Úteis

### Ver histórico de commits
```bash
git log --oneline -10
```

### Ver diferenças entre local e remoto
```bash
git log origin/main..HEAD
```

### Desfazer mudanças não commitadas
```bash
git restore styles.css  # Desfaz mudanças em um arquivo
git restore .           # Desfaz TODAS as mudanças não commitadas
```

### Ver o que está em um commit
```bash
git show HEAD
```

---

## ⚠️ Dicas Importantes

1. **Sempre verifique `git status` antes de fazer commit**
2. **Use mensagens de commit descritivas** - facilita entender o histórico
3. **Não commite arquivos temporários** como `.DS_Store`, `node_modules`, etc.
4. **Faça commits frequentes** - é melhor vários commits pequenos que um grande
5. **Após o push, o Netlify detecta automaticamente** e faz deploy

---

## 🚨 Resolução de Problemas

### "Your branch is ahead of origin/main"
Significa que você tem commits locais não enviados. Faça `git push origin main`.

### "Please commit your changes or stash them"
Você tem mudanças não commitadas. Use `git add` e `git commit` primeiro.

### Erro de certificado SSL
Use os comandos de desabilitar/habilitar SSL mostrados acima.
