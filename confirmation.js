// Sistema de Confirmação de Presença com Código Único - Supabase

// Usar uma variável local para evitar conflitos
let supabaseClient;
let currentGuestData = null;

// Data do casamento: 31 de Maio de 2026, 11:00
const WEDDING_DATE = new Date('2026-05-31T11:00:00');

// Verificar se pode desfazer confirmação (baseado na data confirmation_deadline)
function canUndoConfirmation() {
    if (!currentGuestData || !currentGuestData.confirmation_deadline) {
        // Se não houver data limite, permitir edição (comportamento padrão)
        return true;
    }
    const now = new Date();
    const deadline = new Date(currentGuestData.confirmation_deadline);
    // Permitir edição se ainda não passou a data limite
    return now <= deadline;
}

// Formatar data de deadline para exibição
function formatDeadlineDate() {
    if (!currentGuestData || !currentGuestData.confirmation_deadline) {
        return null;
    }
    const deadline = new Date(currentGuestData.confirmation_deadline);
    return deadline.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Converter data UTC para UTC-3 (horário de Brasília)
function formatDateToUTC3(dateString) {
    if (!dateString) return null;
    // Garantir que a data seja interpretada como UTC
    let dateStr = dateString;
    if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
        // Se não tem indicador de timezone, assumir UTC adicionando Z
        dateStr = dateStr + 'Z';
    }
    // Criar data interpretando como UTC
    const date = new Date(dateStr);
    // Usar toLocaleString com timezone específico de São Paulo (UTC-3)
    return date.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Verificar se Supabase está disponível
function waitForSupabase() {
    return new Promise((resolve) => {
        if (window.supabaseClient) {
            supabaseClient = window.supabaseClient;
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabaseClient) {
                    supabaseClient = window.supabaseClient;
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// Elementos DOM
const codeEntryScreen = document.getElementById('code-entry-screen');
const confirmationScreen = document.getElementById('confirmation-screen');
const guestCodeInput = document.getElementById('guest-code');
const searchCodeBtn = document.getElementById('search-code-btn');
const backToCodeBtn = document.getElementById('back-to-code-btn');
const codeErrorMessage = document.getElementById('code-error-message');
const confirmationForm = document.getElementById('confirmation-form');
const confirmationMessage = document.getElementById('confirmation-message');
const guestNameDisplay = document.getElementById('guest-name-display');
const guestCodeDisplay = document.getElementById('guest-code-display');
const guestsCheckboxes = document.getElementById('guests-checkboxes');

// Buscar convidado por código
async function searchGuestByCode() {
    const code = guestCodeInput.value.trim().toUpperCase();
    
    if (!code) {
        showCodeError('Por favor, digite um código válido.');
        return;
    }

    // Verificar se Supabase está disponível
    if (!supabaseClient) {
        await waitForSupabase();
    }

    if (!supabaseClient) {
        showCodeError('Erro: Supabase não configurado. Verifique a configuração.');
        return;
    }

    try {
        // Buscar na tabela 'guests' pelo código
        const { data, error } = await supabaseClient
            .from('guests')
            .select('*')
            .eq('code', code)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Nenhum resultado encontrado
                showCodeError('Código não encontrado. Verifique se digitou corretamente.');
            } else {
                throw error;
            }
            return;
        }

        currentGuestData = data;

        // Verificar se já confirmou e se pode desfazer
        if (data.confirmed) {
            const canUndo = canUndoConfirmation();
            if (!canUndo) {
                const deadlineDate = formatDeadlineDate();
                const deadlineText = deadlineDate ? ` até ${deadlineDate}` : '';
                showCodeError(`Este convite já foi confirmado. O prazo para desfazer a confirmação expirou${deadlineText}.`);
                return;
            }
            // Se pode desfazer, mostrar tela de confirmação com opção de desfazer
        }

        // Mostrar tela de confirmação
        displayConfirmationScreen();

    } catch (error) {
        console.error('Erro ao buscar convidado:', error);
        showCodeError('Erro ao buscar convite. Tente novamente mais tarde.');
    }
}

// Mostrar tela de confirmação
function displayConfirmationScreen() {
    codeEntryScreen.style.display = 'none';
    confirmationScreen.style.display = 'block';
    
    // Limpar todas as mensagens anteriores ao mostrar a tela
    if (confirmationMessage) {
        confirmationMessage.style.display = 'none';
        confirmationMessage.textContent = '';
        confirmationMessage.className = '';
    }
    if (codeErrorMessage) {
        codeErrorMessage.style.display = 'none';
        codeErrorMessage.textContent = '';
        codeErrorMessage.className = '';
    }
    
    // Preencher informações do convidado
    guestNameDisplay.textContent = currentGuestData.name;
    guestCodeDisplay.textContent = currentGuestData.code;
    
    // Remover foto do card (não queremos foto de perfil)
    const existingPhoto = guestNameDisplay.parentElement.querySelector('.guest-photo-container');
    if (existingPhoto) {
        existingPhoto.remove();
    }
    
    const isConfirmed = currentGuestData.confirmed;
    const canUndo = canUndoConfirmation();
    
    // Remover cartões de confirmação anteriores (evitar acúmulo)
    const existingConfirmedInfo = guestNameDisplay.parentElement.querySelectorAll('.confirmed-info');
    existingConfirmedInfo.forEach(info => info.remove());
    
    // Verificar se há pessoas confirmadas
        const confirmedPeople = [];
        
    // Função para verificar pessoas confirmadas
    const checkConfirmedPeople = () => {
        const mainConfirmed = currentGuestData.confirmed_guests?.includes(currentGuestData.name) || 
                              (currentGuestData.confirmed && !currentGuestData.confirmed_guests?.length);
        
        if (mainConfirmed) {
            confirmedPeople.push(currentGuestData.name);
        }
        
        // Adicionar companions confirmados
        if (currentGuestData.companions) {
            currentGuestData.companions.forEach(companion => {
                const companionConfirmed = companion.confirmed || 
                                         currentGuestData.confirmed_guests?.includes(companion.name);
                if (companionConfirmed) {
                    confirmedPeople.push(companion.name);
                }
            });
        }
        
        // Fallback: se não encontrou ninguém, usar confirmed_guests
        if (confirmedPeople.length === 0 && currentGuestData.confirmed_guests && currentGuestData.confirmed_guests.length > 0) {
            currentGuestData.confirmed_guests.forEach(name => {
                confirmedPeople.push(name);
            });
        }
    };
    
    checkConfirmedPeople();
    
    // Adicionar informações no card de resumo
    const guestInfoCard = document.querySelector('.guest-info-card');
    if (guestInfoCard) {
        // Remover informações anteriores se existirem
        const existingSummary = guestInfoCard.querySelector('.guest-confirmation-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
        
        // Remover foto anterior se existir
        const existingPhoto = guestInfoCard.querySelector('.guest-photo-container');
        if (existingPhoto) {
            existingPhoto.remove();
        }
        
        // Remover classe has-photo se existir
        guestInfoCard.classList.remove('has-photo');
        
        // Verificar se precisa criar wrapper de conteúdo
        let contentWrapper = guestInfoCard.querySelector('.guest-info-card-content');
        if (!contentWrapper) {
            // Criar wrapper e mover conteúdo existente
            const guestNameDisplay = guestInfoCard.querySelector('h3');
            const guestCodeDisplay = guestInfoCard.querySelector('.guest-code-display');
            
            contentWrapper = document.createElement('div');
            contentWrapper.className = 'guest-info-card-content';
            
            // Mover elementos para o wrapper (não clonar, mover de fato)
            if (guestNameDisplay && guestNameDisplay.parentElement === guestInfoCard) {
                contentWrapper.appendChild(guestNameDisplay);
            }
            if (guestCodeDisplay && guestCodeDisplay.parentElement === guestInfoCard) {
                contentWrapper.appendChild(guestCodeDisplay);
            }
            
            guestInfoCard.appendChild(contentWrapper);
        }
        
        // Adicionar foto se houver confirmação e foto disponível
        // Adicionar foto se houver confirmação e foto disponível
        if (confirmedPeople.length > 0 && currentGuestData.photo_url) {
            // Remover foto anterior se existir
            const existingPhotoContainer = guestInfoCard.querySelector('.guest-photo-container');
            if (existingPhotoContainer) {
                existingPhotoContainer.remove();
            }
            
            const photoContainer = document.createElement('div');
            photoContainer.className = 'guest-photo-container';
            
            const photoDiv = document.createElement('div');
            photoDiv.className = 'guest-photo-polaroid';
            
            const photoImg = document.createElement('img');
            photoImg.alt = currentGuestData.name;
            photoImg.className = 'guest-photo-polaroid-img';
            
            // Inicialmente esconder até confirmar que carregou
            photoContainer.style.display = 'none';
            
            // Verificar se a imagem carrega corretamente
            photoImg.onload = () => {
                // Se carregar, mostrar e adicionar classe has-photo
                photoContainer.style.display = 'flex';
                guestInfoCard.classList.add('has-photo');
            };
            
            photoImg.onerror = () => {
                // Se não carregar, remover o container e não adicionar classe has-photo
                photoContainer.remove();
                guestInfoCard.classList.remove('has-photo');
            };
            
            // Definir src depois dos handlers para garantir que os eventos sejam capturados
            photoImg.src = currentGuestData.photo_url;
            
            // Se a imagem já estiver em cache, verificar se está completa
            if (photoImg.complete) {
                if (photoImg.naturalWidth > 0) {
                    // Imagem carregada com sucesso
                    photoContainer.style.display = 'flex';
                    guestInfoCard.classList.add('has-photo');
                } else {
                    // Imagem falhou ao carregar
                    photoContainer.remove();
                    guestInfoCard.classList.remove('has-photo');
                }
            }
            
            photoDiv.appendChild(photoImg);
            photoContainer.appendChild(photoDiv);
            
            // Inserir no início do card (antes do contentWrapper)
            guestInfoCard.insertBefore(photoContainer, contentWrapper);
        } else {
            // Remover foto e classe se não houver confirmação ou foto
            const existingPhotoContainer = guestInfoCard.querySelector('.guest-photo-container');
            if (existingPhotoContainer) {
                existingPhotoContainer.remove();
            }
            guestInfoCard.classList.remove('has-photo');
        }
        
        if (confirmedPeople.length > 0) {
            const confirmDate = currentGuestData.confirmed_at 
                ? formatDateToUTC3(currentGuestData.confirmed_at)
                : 'anteriormente';
            
            const deadlineInfo = canUndo ? (() => {
                const deadlineDate = formatDeadlineDate();
                return deadlineDate ? `<p class="guest-confirmation-info">Você pode editar sua confirmação até ${deadlineDate}.</p>` : '<p class="guest-confirmation-info">Você pode editar sua confirmação.</p>';
            })() : '';
            
            const confirmationInfo = document.createElement('div');
            confirmationInfo.className = 'guest-confirmation-summary';
            confirmationInfo.innerHTML = `
                <p class="guest-confirmation-date">✓ Confirmado em <strong>${confirmDate}</strong></p>
                ${deadlineInfo}
            `;
            contentWrapper.appendChild(confirmationInfo);
        } else {
            const confirmationInfo = document.createElement('div');
            confirmationInfo.className = 'guest-confirmation-summary';
            confirmationInfo.innerHTML = `
                <p class="guest-confirmation-date">Não confirmado</p>
            `;
            contentWrapper.appendChild(confirmationInfo);
        }
    }
    
    // Criar card de informações detalhadas da confirmação apenas se houver pessoas confirmadas
    if (confirmedPeople.length > 0) {
        const confirmedInfo = document.createElement('div');
        confirmedInfo.className = 'confirmed-info';
        
        // Função para formatar nome com numeração da sandália
        const formatNameWithShoeSize = (name, shoeSize) => {
            if (shoeSize && shoeSize !== 'disabled' && shoeSize !== null) {
                return `${name} (${shoeSize})`;
            }
            return name;
        };
        
        // Formatar nomes com numeração da sandália
        const confirmedPeopleFormatted = confirmedPeople.map(name => {
                let shoeSize = null;
                if (name === currentGuestData.name) {
                    shoeSize = currentGuestData.shoe_size;
                } else if (currentGuestData.companions) {
                    const companion = currentGuestData.companions.find(c => c.name === name);
                    if (companion) {
                        shoeSize = companion.shoe_size;
                    }
                }
            return formatNameWithShoeSize(name, shoeSize);
            });
        
        let confirmedPeopleHTML = '';
        if (confirmedPeopleFormatted.length > 0) {
            confirmedPeopleHTML = `
                <div class="confirmed-people-list">
                    <strong>Pessoas confirmadas (${confirmedPeopleFormatted.length}):</strong>
                    <ul class="confirmed-people-ul">
                        ${confirmedPeopleFormatted.map(name => `<li>${name}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        confirmedInfo.innerHTML = `
            <div class="confirmed-badge">✓ Confirmado</div>
            ${confirmedPeopleHTML}
            ${currentGuestData.confirmed_at ? `<p class="confirmed-date">Confirmado em: ${formatDateToUTC3(currentGuestData.confirmed_at)}</p>` : ''}
            ${currentGuestData.phone ? `<p class="confirmed-phone">Telefone: ${currentGuestData.phone}</p>` : ''}
        `;
        guestNameDisplay.parentElement.appendChild(confirmedInfo);
    }
    
    // Criar checkboxes para o convidado principal e acompanhantes
    guestsCheckboxes.innerHTML = '';
    
    // Se já confirmou, esconder o bloco completo e criar botão para mostrar/esconder
    const guestsListContainer = document.querySelector('.guests-list');
    const confirmationForm = document.querySelector('#confirmation-form');
    
    // Encontrar campos de telefone e mensagem usando seletores específicos
    const phoneField = confirmationForm?.querySelector('label[for="phone"]')?.closest('.form-group');
    const messageField = confirmationForm?.querySelector('label[for="message"]')?.closest('.form-group');
    const submitButton = confirmationForm?.querySelector('button[type="submit"]');
    const backButton = confirmationForm?.querySelector('#back-to-code-btn');
    
    if (guestsListContainer && confirmationForm && isConfirmed && confirmedPeople.length > 0) {
        // Verificar se já existe o botão toggle
        let editButton = confirmationForm.querySelector('.edit-confirmation-toggle-btn');
        
        if (!editButton) {
            // Criar botão toggle antes do guests-list
            editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'edit-confirmation-toggle-btn';
            editButton.textContent = 'Altere sua confirmação';
            
            // Esconder todos os campos do formulário inicialmente
            guestsListContainer.style.display = 'none';
            guestsListContainer.classList.add('hidden-by-default');
            
            // Esconder campos de telefone e mensagem
            if (phoneField) {
                phoneField.style.display = 'none';
                phoneField.classList.add('hidden-by-default');
            }
            if (messageField) {
                messageField.style.display = 'none';
                messageField.classList.add('hidden-by-default');
            }
            
            // Esconder botões de submit e voltar
            if (submitButton) {
                submitButton.style.display = 'none';
                submitButton.classList.add('hidden-by-default');
            }
            if (backButton) {
                backButton.style.display = 'none';
                backButton.classList.add('hidden-by-default');
            }
            
            // Adicionar evento de clique para mostrar/esconder
            editButton.addEventListener('click', () => {
                const isHidden = guestsListContainer.style.display === 'none';
                
                if (isHidden) {
                    // Mostrar formulário e esconder botão
                    guestsListContainer.style.display = 'block';
                    editButton.style.display = 'none';
                    
                    if (phoneField) {
                        phoneField.style.display = 'block';
                    }
                    if (messageField) {
                        messageField.style.display = 'block';
                    }
                    if (submitButton) {
                        submitButton.style.display = 'block';
                    }
                    if (backButton) {
                        backButton.style.display = 'block';
                    }
                } else {
                    // Esconder formulário e mostrar botão
                    guestsListContainer.style.display = 'none';
                    editButton.style.display = 'block';
                    
                    if (phoneField) {
                        phoneField.style.display = 'none';
                    }
                    if (messageField) {
                        messageField.style.display = 'none';
                    }
                    if (submitButton) {
                        submitButton.style.display = 'none';
                    }
                    if (backButton) {
                        backButton.style.display = 'none';
                    }
                }
            });
            
            // Inserir botão antes do guests-list dentro do form
            confirmationForm.insertBefore(editButton, guestsListContainer);
        }
    } else {
        // Se não há confirmação, garantir que está visível
        if (guestsListContainer) {
            guestsListContainer.style.display = 'block';
            guestsListContainer.classList.remove('hidden-by-default');
        }
        if (phoneField) {
            phoneField.style.display = 'block';
            phoneField.classList.remove('hidden-by-default');
        }
        if (messageField) {
            messageField.style.display = 'block';
            messageField.classList.remove('hidden-by-default');
        }
        if (submitButton) {
            submitButton.style.display = 'block';
            submitButton.classList.remove('hidden-by-default');
        }
        if (backButton) {
            backButton.style.display = 'block';
            backButton.classList.remove('hidden-by-default');
        }
        // Remover botão toggle se existir
        const existingToggleBtn = document.querySelector('.edit-confirmation-toggle-btn');
        if (existingToggleBtn) {
            existingToggleBtn.remove();
        }
    }
    
    const shoeSizeOptions = ['33/34', '35/36', '37/38', '39/40', '41/42'];
    
    // Usar guestsCheckboxes diretamente (não precisa de actualCheckboxesContainer)
    
    // Convidado principal
    const mainGuestDiv = document.createElement('div');
    mainGuestDiv.className = 'guest-checkbox-item';
    const mainChecked = isConfirmed && currentGuestData.confirmed_guests?.includes(currentGuestData.name);
    // Permitir desmarcar se pode editar (dentro do prazo de confirmation_deadline)
    const mainDisabled = isConfirmed && !canUndo;
    const showMainShoeSize = currentGuestData.shoe_size !== 'disabled';
    const mainShoeSizeValue = currentGuestData.shoe_size || '';
    
    mainGuestDiv.innerHTML = `
        <div class="guest-checkbox-wrapper">
            <label class="guest-checkbox-label">
                <input type="checkbox" name="guest" value="main" ${mainChecked ? 'checked' : ''} ${mainDisabled ? 'disabled' : ''}>
                <span class="guest-name">${currentGuestData.name}</span>
            </label>
            ${showMainShoeSize ? `
                <select id="shoe-size-main" name="shoe-size-main" class="shoe-size-select-inline" ${mainDisabled ? 'disabled' : ''}>
                    <option value="">Numeração da sandália</option>
                    ${shoeSizeOptions.map(opt => `<option value="${opt}" ${opt === mainShoeSizeValue ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            ` : ''}
        </div>
    `;
    guestsCheckboxes.appendChild(mainGuestDiv);
    
    // Acompanhantes
    if (currentGuestData.companions && currentGuestData.companions.length > 0) {
        currentGuestData.companions.forEach((companion, index) => {
            const companionDiv = document.createElement('div');
            companionDiv.className = 'guest-checkbox-item';
            const companionChecked = companion.confirmed || (isConfirmed && currentGuestData.confirmed_guests?.includes(companion.name));
            // Permitir desmarcar se pode editar (dentro do prazo de confirmation_deadline)
            const companionDisabled = isConfirmed && !canUndo;
            const showCompanionShoeSize = companion.shoe_size !== 'disabled';
            const companionShoeSizeValue = companion.shoe_size || '';
            
            companionDiv.innerHTML = `
                <div class="guest-checkbox-wrapper">
                    <label class="guest-checkbox-label">
                        <input type="checkbox" name="guest" value="${index}" ${companionChecked ? 'checked' : ''} ${companionDisabled ? 'disabled' : ''}>
                        <span class="guest-name">${companion.name}</span>
                    </label>
                    ${showCompanionShoeSize ? `
                        <select id="shoe-size-companion-${index}" name="shoe-size-companion-${index}" class="shoe-size-select-inline" ${companionDisabled ? 'disabled' : ''}>
                            <option value="">Numeração da sandália</option>
                            ${shoeSizeOptions.map(opt => `<option value="${opt}" ${opt === companionShoeSizeValue ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    ` : ''}
                </div>
            `;
            guestsCheckboxes.appendChild(companionDiv);
        });
    } else {
        const noCompanionsDiv = document.createElement('div');
        noCompanionsDiv.className = 'no-companions';
        noCompanionsDiv.textContent = 'Nenhum acompanhante cadastrado.';
        guestsCheckboxes.appendChild(noCompanionsDiv);
    }
    
    // Remover mensagem anterior se existir (evitar acúmulo)
    const existingAlreadyMsg = confirmationForm.querySelector('.already-confirmed-message');
    if (existingAlreadyMsg) {
        existingAlreadyMsg.remove();
    }
    
    // Limpar mensagens de confirmação anteriores
    if (confirmationMessage) {
        confirmationMessage.style.display = 'none';
        confirmationMessage.textContent = '';
        confirmationMessage.className = '';
    }
    
    // Preencher campos do formulário se já confirmou
    if (isConfirmed) {
        document.getElementById('phone').value = currentGuestData.phone || '';
        document.getElementById('message').value = currentGuestData.message || '';
        
        // Os campos de shoe_size já são preenchidos no HTML acima
        
        // Mensagem removida - informações agora estão no card de resumo
        
        // Se não pode editar, desabilitar formulário completamente
        if (!canUndo) {
            confirmationForm.querySelectorAll('input, textarea, select, button[type="submit"]').forEach(el => {
                el.disabled = true;
            });
            // Desabilitar checkboxes também
            document.querySelectorAll('input[name="guest"]').forEach(checkbox => {
                checkbox.disabled = true;
            });
        } else {
            // Pode editar - mudar texto do botão para "Atualizar Confirmação"
            const submitBtn = confirmationForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Atualizar Confirmação';
            }
            // Permitir desmarcar checkboxes para remover confirmações
            // Os checkboxes já estão habilitados acima
        }
    }
}

// Confirmar presença
async function confirmPresence(event) {
    event.preventDefault();
    
    if (!supabaseClient) {
        await waitForSupabase();
    }

    if (!supabaseClient || !currentGuestData) {
        showErrorModal('Erro: Dados não encontrados. Recarregue a página.');
        return;
    }

    // Verificar se já confirmou e não pode editar
    const isConfirmed = currentGuestData.confirmed;
    const canUndo = canUndoConfirmation();
    
    if (isConfirmed && !canUndo) {
        const deadlineDate = formatDeadlineDate();
        const deadlineText = deadlineDate ? ` até ${deadlineDate}` : '';
        showErrorModal(`Você já confirmou sua presença e o prazo para editar expirou${deadlineText}.`);
        return;
    }

    // Desabilitar botão para evitar múltiplos cliques
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processando...';
    }

    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    // Coletar quais convidados confirmaram
    const checkedBoxes = document.querySelectorAll('input[name="guest"]:checked');
    const confirmedGuests = [];
    
    checkedBoxes.forEach(checkbox => {
        if (checkbox.value === 'main') {
            confirmedGuests.push({
                name: currentGuestData.name,
                type: 'main'
            });
        } else {
            const index = parseInt(checkbox.value);
            if (currentGuestData.companions && currentGuestData.companions[index]) {
                confirmedGuests.push({
                    name: currentGuestData.companions[index].name,
                    type: 'companion',
                    index: index
                });
            }
        }
    });
    
    // Verificar se o convidado principal foi selecionado
    const mainSelected = confirmedGuests.some(g => g.type === 'main');
    
    // Coletar shoe_size do convidado principal (se não for 'disabled')
    let mainShoeSize = currentGuestData.shoe_size || null;
    if (currentGuestData.shoe_size !== 'disabled') {
        const mainShoeSizeSelect = document.getElementById('shoe-size-main');
        if (mainShoeSizeSelect && mainSelected) {
            mainShoeSize = mainShoeSizeSelect.value || null;
        } else if (!mainSelected) {
            mainShoeSize = null;
        }
    } else {
        mainShoeSize = 'disabled';
    }

    // Permitir desmarcar todos para cancelar confirmação (se dentro do prazo)
    if (confirmedGuests.length === 0) {
        if (isConfirmed && canUndo) {
            // Permitir cancelar confirmação desmarcando todos
            // Continuar com o processo
        } else if (!isConfirmed) {
            reenableSubmitButton(submitBtn, isConfirmed);
            showErrorModal('Por favor, selecione pelo menos um convidado.');
            return;
        } else {
            reenableSubmitButton(submitBtn, isConfirmed);
            showErrorModal('Você não pode cancelar a confirmação. O prazo para editar expirou.');
            return;
        }
    }

    // Validar se todos os convidados confirmados que podem escolher numeração o fizeram
    const missingShoeSizes = [];
    
    confirmedGuests.forEach(guest => {
        if (guest.type === 'main') {
            // Verificar convidado principal
            if (currentGuestData.shoe_size !== 'disabled') {
                const mainShoeSizeSelect = document.getElementById('shoe-size-main');
                if (!mainShoeSizeSelect || !mainShoeSizeSelect.value) {
                    missingShoeSizes.push(currentGuestData.name);
                }
            }
        } else {
            // Verificar companion
            const companion = currentGuestData.companions[guest.index];
            if (companion && companion.shoe_size !== 'disabled') {
                const companionShoeSizeSelect = document.getElementById(`shoe-size-companion-${guest.index}`);
                if (!companionShoeSizeSelect || !companionShoeSizeSelect.value) {
                    missingShoeSizes.push(companion.name);
                }
            }
        }
    });
    
    if (missingShoeSizes.length > 0) {
        const namesList = missingShoeSizes.join(', ');
        reenableSubmitButton(submitBtn, isConfirmed);
        showErrorModal(`Por favor, selecione a numeração da sandália para: ${namesList}`);
        return;
    }

    try {
        // Atualizar acompanhantes confirmados e coletar shoe_size
        const updatedCompanions = currentGuestData.companions ? [...currentGuestData.companions] : [];
        confirmedGuests.forEach(guest => {
            if (guest.type === 'companion') {
                const companionIndex = updatedCompanions.findIndex(c => c.name === guest.name);
                if (companionIndex !== -1) {
                    updatedCompanions[companionIndex].confirmed = true;
                    
                    // Coletar shoe_size do companion (se não for 'disabled')
                    const companion = updatedCompanions[companionIndex];
                    if (companion.shoe_size !== 'disabled') {
                        const companionShoeSizeSelect = document.getElementById(`shoe-size-companion-${guest.index}`);
                        if (companionShoeSizeSelect) {
                            companion.shoe_size = companionShoeSizeSelect.value || null;
                        }
                    } else {
                        companion.shoe_size = 'disabled';
                    }
                }
            }
        });

        // Se não selecionou nenhum acompanhante que estava confirmado, desmarcar e limpar shoe_size
        updatedCompanions.forEach((companion, index) => {
            const wasConfirmed = companion.confirmed;
            const isSelected = confirmedGuests.some(g => g.type === 'companion' && g.name === companion.name);
            if (wasConfirmed && !isSelected) {
                updatedCompanions[index].confirmed = false;
                // Limpar shoe_size se desmarcou (mas manter 'disabled' se já estava)
                if (companion.shoe_size !== 'disabled') {
                    updatedCompanions[index].shoe_size = null;
                }
            }
        });

        // Verificar se algum convidado foi confirmado
        // Se desmarcou todos e está dentro do prazo, permite cancelar confirmação
        const hasConfirmedGuests = confirmedGuests.length > 0;
        
        // Se o convidado principal não foi selecionado, limpar shoe_size (mas manter 'disabled' se já estava)
        if (!mainSelected && currentGuestData.shoe_size !== 'disabled') {
            mainShoeSize = null;
        } else if (!mainSelected && currentGuestData.shoe_size === 'disabled') {
            mainShoeSize = 'disabled';
        }

        // Atualizar registro no Supabase
        const { error } = await supabaseClient
            .from('guests')
            .update({
                confirmed: hasConfirmedGuests,
                confirmed_at: hasConfirmedGuests ? new Date().toISOString() : null,
                phone: phone,
                message: message || null,
                confirmed_guests: hasConfirmedGuests ? confirmedGuests.map(g => g.name) : [],
                companions: updatedCompanions,
                shoe_size: mainSelected ? mainShoeSize : (currentGuestData.shoe_size === 'disabled' ? 'disabled' : null)
            })
            .eq('id', currentGuestData.id);

        if (error) {
            throw error;
        }

        // Recarregar dados do banco para garantir sincronização
        const { data: updatedData, error: fetchError } = await supabaseClient
            .from('guests')
            .select('*')
            .eq('id', currentGuestData.id)
            .single();

        if (fetchError) {
            console.warn('Erro ao recarregar dados do banco:', fetchError);
            // Se falhar ao recarregar, atualizar dados locais como fallback
            currentGuestData.confirmed = hasConfirmedGuests;
            currentGuestData.confirmed_at = hasConfirmedGuests ? new Date().toISOString() : null;
            currentGuestData.phone = phone;
            currentGuestData.message = message || null;
            currentGuestData.confirmed_guests = hasConfirmedGuests ? confirmedGuests.map(g => g.name) : [];
            currentGuestData.companions = updatedCompanions;
            if (mainSelected) {
                currentGuestData.shoe_size = mainShoeSize;
            } else if (currentGuestData.shoe_size !== 'disabled') {
                currentGuestData.shoe_size = null;
            }
        } else {
            // Atualizar com dados do banco (mais confiável)
            currentGuestData = updatedData;
        }

        if (hasConfirmedGuests) {
            // Se é uma nova confirmação (não era confirmado antes), mostrar modal
            if (!isConfirmed) {
                showThankYouModal(confirmedGuests);
            } else {
                // Se é uma atualização, mostrar mensagem de sucesso
                showConfirmationMessage(
                    'Confirmação atualizada com sucesso!',
                    'success'
                );
            }
        } else {
            showConfirmationMessage(
                'Confirmação desfeita com sucesso. Você pode confirmar novamente quando quiser.',
                'success'
            );
        }

        // Recarregar a tela para mostrar estado atualizado
        setTimeout(() => {
            displayConfirmationScreen();
        }, hasConfirmedGuests && !isConfirmed ? 3000 : 1500);
        
        // Reabilitar botão após processamento
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isConfirmed ? 'Atualizar Confirmação' : 'Confirmar Presença';
        }

    } catch (error) {
        console.error('Erro ao confirmar presença:', error);
        showConfirmationMessage('Erro ao confirmar presença. Tente novamente.', 'error');
        
        // Reabilitar botão em caso de erro
        const submitBtn = confirmationForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            const isConfirmed = currentGuestData?.confirmed;
            submitBtn.textContent = isConfirmed ? 'Atualizar Confirmação' : 'Confirmar Presença';
        }
    }
}

// Mostrar mensagem de erro no código
function showCodeError(message) {
    // Limpar mensagens anteriores
    if (codeErrorMessage) {
        codeErrorMessage.textContent = '';
        codeErrorMessage.className = '';
        codeErrorMessage.style.display = 'none';
    }
    
    // Mostrar nova mensagem
    codeErrorMessage.textContent = message;
    codeErrorMessage.className = 'confirmation-message error';
    codeErrorMessage.style.display = 'block';
    
    setTimeout(() => {
        if (codeErrorMessage) {
            codeErrorMessage.style.display = 'none';
            codeErrorMessage.textContent = '';
            codeErrorMessage.className = '';
        }
    }, 5000);
}

// Mostrar mensagem de confirmação
function showConfirmationMessage(message, type) {
    // Limpar mensagens anteriores
    if (confirmationMessage) {
        confirmationMessage.textContent = '';
        confirmationMessage.className = '';
        confirmationMessage.style.display = 'none';
    }
    
    // Mostrar nova mensagem
    confirmationMessage.textContent = message;
    confirmationMessage.className = `confirmation-message ${type}`;
    confirmationMessage.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            if (confirmationMessage) {
                confirmationMessage.style.display = 'none';
                confirmationMessage.textContent = '';
                confirmationMessage.className = '';
            }
        }, 10000);
    }
}

// Mostrar modal de erro (trava-tela)
function showErrorModal(message) {
    const errorModal = document.getElementById('error-modal');
    const errorModalMessage = document.getElementById('error-modal-message');
    
    if (!errorModal || !errorModalMessage) return;
    
    errorModalMessage.textContent = message;
    errorModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Travar scroll
    
    // Fechar modal ao clicar no botão ou no overlay
    const closeBtn = document.getElementById('error-modal-close');
    const overlay = errorModal.querySelector('.error-modal-overlay');
    
    const closeModal = () => {
        errorModal.style.display = 'none';
        document.body.style.overflow = ''; // Liberar scroll
    };
    
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    
    if (overlay) {
        overlay.onclick = closeModal;
    }
}

// Reabilitar botão de submit
function reenableSubmitButton(submitBtn, isConfirmed) {
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = isConfirmed ? 'Atualizar Confirmação' : 'Confirmar Presença';
    }
}

// Desfazer confirmação
async function undoConfirmation() {
    if (!confirm('Tem certeza que deseja desfazer a confirmação?')) {
        return;
    }

    if (!supabaseClient || !currentGuestData) {
        showConfirmationMessage('Erro: Dados não encontrados. Recarregue a página.', 'error');
        return;
    }

    if (!canUndoConfirmation()) {
        const deadlineDate = formatDeadlineDate();
        const deadlineText = deadlineDate ? ` até ${deadlineDate}` : '';
        showConfirmationMessage(`O prazo para desfazer a confirmação expirou${deadlineText}.`, 'error');
        return;
    }

    try {
        // Resetar todos os acompanhantes
        const resetCompanions = currentGuestData.companions ? currentGuestData.companions.map(c => ({
            ...c,
            confirmed: false
        })) : [];

        const { error } = await supabaseClient
            .from('guests')
            .update({
                confirmed: false,
                confirmed_at: null,
                confirmed_guests: [],
                companions: resetCompanions
            })
            .eq('id', currentGuestData.id);

        if (error) {
            throw error;
        }

        // Atualizar dados locais
        currentGuestData.confirmed = false;
        currentGuestData.confirmed_at = null;
        currentGuestData.confirmed_guests = [];
        currentGuestData.companions = resetCompanions;

        showConfirmationMessage('Confirmação desfeita com sucesso!', 'success');

        // Recarregar a tela
        setTimeout(() => {
            displayConfirmationScreen();
        }, 1500);

    } catch (error) {
        console.error('Erro ao desfazer confirmação:', error);
        showConfirmationMessage('Erro ao desfazer confirmação. Tente novamente.', 'error');
    }
}

// Mostrar modal de agradecimento com foto
function showThankYouModal(confirmedGuests) {
    // Criar modal se não existir
    let thankYouModal = document.getElementById('thank-you-modal');
    if (!thankYouModal) {
        thankYouModal = document.createElement('div');
        thankYouModal.id = 'thank-you-modal';
        thankYouModal.className = 'thank-you-modal';
        thankYouModal.innerHTML = `
            <div class="thank-you-modal-content">
                <span class="close-thank-you-modal">&times;</span>
                <div class="thank-you-photo-container">
                    <div class="thank-you-photo">
                        <img id="thank-you-photo" src="" alt="" onerror="this.style.display='none';">
                    </div>
                </div>
                <div class="thank-you-message">
                    <h2>Obrigado pela confirmação!</h2>
                    <p class="thank-you-names" id="thank-you-names"></p>
                    <p class="thank-you-signature">Com amor,<br><strong>Yas e Davi</strong></p>
                </div>
            </div>
        `;
        document.body.appendChild(thankYouModal);
        
        // Função para adicionar foto ao card de resumo
        const addPhotoToGuestCard = () => {
            const guestInfoCard = document.querySelector('.guest-info-card');
            if (guestInfoCard && currentGuestData.photo_url) {
                // Remover foto anterior se existir
                const existingPhoto = guestInfoCard.querySelector('.guest-photo-container');
                if (existingPhoto) {
                    existingPhoto.remove();
                }
                
                // Criar container da foto
                const photoContainer = document.createElement('div');
                photoContainer.className = 'guest-photo-container';
                
                const photoDiv = document.createElement('div');
                photoDiv.className = 'guest-photo-polaroid';
                
                const photoImg = document.createElement('img');
                photoImg.alt = currentGuestData.name;
                photoImg.className = 'guest-photo-polaroid-img';
                
                // Inicialmente esconder até confirmar que carrega
                photoContainer.style.display = 'none';
                
                // Verificar se a imagem carrega corretamente
                photoImg.onload = () => {
                    // Se carregar, mostrar e adicionar classe has-photo
                    photoContainer.style.display = 'flex';
                    guestInfoCard.classList.add('has-photo');
                };
                
                photoImg.onerror = () => {
                    // Se não carregar, remover o container e não adicionar classe has-photo
                    photoContainer.remove();
                    guestInfoCard.classList.remove('has-photo');
                };
                
                // Definir src depois dos handlers para garantir que os eventos sejam capturados
                photoImg.src = currentGuestData.photo_url;
                
                // Se a imagem já estiver em cache, verificar se está completa
                if (photoImg.complete) {
                    if (photoImg.naturalWidth > 0) {
                        // Imagem carregada com sucesso
                        photoContainer.style.display = 'flex';
                        guestInfoCard.classList.add('has-photo');
                    } else {
                        // Imagem falhou ao carregar
                        photoContainer.remove();
                        guestInfoCard.classList.remove('has-photo');
                    }
                }
                
                photoDiv.appendChild(photoImg);
                photoContainer.appendChild(photoDiv);
                
                // Inserir após o código do convidado
                const guestCodeDisplay = guestInfoCard.querySelector('.guest-code-display');
                if (guestCodeDisplay) {
                    guestInfoCard.insertBefore(photoContainer, guestCodeDisplay.nextSibling);
                } else {
                    guestInfoCard.appendChild(photoContainer);
                }
            }
        };
        
        // Fechar modal ao clicar no X ou fora
        const closeBtn = thankYouModal.querySelector('.close-thank-you-modal');
        closeBtn.addEventListener('click', () => {
            thankYouModal.style.display = 'none';
            addPhotoToGuestCard();
        });
        
        thankYouModal.addEventListener('click', (e) => {
            if (e.target === thankYouModal) {
                thankYouModal.style.display = 'none';
                addPhotoToGuestCard();
            }
        });
    }
    
    // Preencher informações
    const photoImg = thankYouModal.querySelector('#thank-you-photo');
    const namesList = thankYouModal.querySelector('#thank-you-names');
    const photoContainer = thankYouModal.querySelector('.thank-you-photo-container');
    
    // Foto do convidado - verificar se existe e é válida
    if (currentGuestData.photo_url && photoImg && photoContainer) {
        photoImg.src = currentGuestData.photo_url;
        photoImg.alt = currentGuestData.name;
        
        // Inicialmente esconder até confirmar que carrega
        photoImg.style.display = 'none';
        photoContainer.style.display = 'none';
        
        // Verificar se a imagem carrega corretamente
        photoImg.onload = () => {
        photoImg.style.display = 'block';
            photoContainer.style.display = 'flex';
        };
        
        photoImg.onerror = () => {
            // Se a imagem não carregar, esconder o container da foto
        photoImg.style.display = 'none';
        photoContainer.style.display = 'none';
        };
    } else {
        // Sem foto_url ou elementos não encontrados, esconder completamente
        if (photoImg) photoImg.style.display = 'none';
        if (photoContainer) photoContainer.style.display = 'none';
    }
    
    // Lista de nomes confirmados
    const names = confirmedGuests.map(g => g.name).join(', ');
    namesList.textContent = `Que honra! Nosso dia será ainda mais especial pois celebraremos com você${confirmedGuests.length > 1 ? 's' : ''}: ${names}`;
    
    // Mostrar modal
    thankYouModal.style.display = 'flex';
}

// Voltar para tela de código
function backToCodeScreen() {
    confirmationScreen.style.display = 'none';
    codeEntryScreen.style.display = 'block';
    guestCodeInput.value = '';
    currentGuestData = null;
    confirmationForm.reset();
    confirmationMessage.style.display = 'none';
    
    // Remover elementos adicionados
    const confirmedInfo = document.querySelector('.confirmed-info');
    if (confirmedInfo) {
        confirmedInfo.remove();
    }
    const undoBtn = document.getElementById('undo-confirmation-btn');
    if (undoBtn) {
        undoBtn.remove();
    }
    const photoContainer = document.querySelector('.guest-photo-container');
    if (photoContainer) {
        photoContainer.remove();
    }
}

// Event Listeners
if (searchCodeBtn) {
    searchCodeBtn.addEventListener('click', searchGuestByCode);
}

if (guestCodeInput) {
    guestCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchGuestByCode();
        }
    });
}

if (backToCodeBtn) {
    backToCodeBtn.addEventListener('click', backToCodeScreen);
}

if (confirmationForm) {
    confirmationForm.addEventListener('submit', confirmPresence);
}
