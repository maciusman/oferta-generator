// bookmarklet.js - Główny kod bookmarklet (kompatybilny z Google Docs)
window.bookmarkletCode = `
(function() {
    // Sprawdź czy jesteśmy w Google Docs
    if (!window.location.hostname.includes('docs.google.com')) {
        alert('Ten bookmarklet działa tylko w Google Docs!\\nOtwórz swój dokument z ofertą w Google Docs i kliknij ponownie.');
        return;
    }

    // Sprawdź czy dokument jest w trybie edycji
    if (!document.querySelector('.kix-appview-editor')) {
        alert('Nie można pobrać treści dokumentu.\\nUpewnij się, że dokument jest otwarty w trybie edycji.');
        return;
    }

    // Sprawdź czy modal już istnieje
    if (document.getElementById('offerGeneratorModal')) {
        document.getElementById('offerGeneratorModal').remove();
    }

    // Utwórz modal programowo (bez insertAdjacentHTML)
    const modal = document.createElement('div');
    modal.id = 'offerGeneratorModal';
    modal.style.cssText = \`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Google Sans', Roboto, sans-serif;
    \`;

    // Utwórz główny kontener
    const container = document.createElement('div');
    container.style.cssText = \`
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    \`;

    // Nagłówek
    const header = document.createElement('div');
    header.style.cssText = 'text-align: center; margin-bottom: 25px;';
    
    const title = document.createElement('h2');
    title.style.cssText = 'color: #1a73e8; margin: 0 0 10px 0; font-size: 24px; font-weight: 500;';
    title.textContent = '🎯 Generator Interaktywnych Ofert';
    
    const subtitle = document.createElement('p');
    subtitle.style.cssText = 'color: #5f6368; margin: 0; font-size: 14px;';
    subtitle.textContent = 'Przekształć ten dokument w interaktywną ofertę HTML';

    header.appendChild(title);
    header.appendChild(subtitle);

    // Sekcja konfiguracji
    const configSection = document.createElement('div');
    configSection.id = 'configSection';

    // Klucz API
    const apiSection = document.createElement('div');
    apiSection.style.cssText = 'margin-bottom: 20px;';
    
    const apiLabel = document.createElement('label');
    apiLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500; color: #202124;';
    apiLabel.textContent = 'Klucz API Gemini:';
    
    const apiInput = document.createElement('input');
    apiInput.type = 'password';
    apiInput.id = 'apiKeyInput';
    apiInput.placeholder = 'Wklej swój klucz API...';
    apiInput.style.cssText = \`
        width: 100%;
        padding: 12px;
        border: 2px solid #e8eaed;
        border-radius: 8px;
        font-size: 14px;
        box-sizing: border-box;
    \`;

    const apiLink = document.createElement('a');
    apiLink.href = 'https://aistudio.google.com/app/apikey';
    apiLink.target = '_blank';
    apiLink.style.cssText = 'color: #1a73e8; font-size: 12px; text-decoration: none; margin-top: 5px; display: block;';
    apiLink.textContent = '🔗 Pobierz klucz API (darmowy)';

    apiSection.appendChild(apiLabel);
    apiSection.appendChild(apiInput);
    apiSection.appendChild(apiLink);

    // Model selection
    const modelSection = document.createElement('div');
    modelSection.style.cssText = 'margin-bottom: 25px;';
    
    const modelLabel = document.createElement('label');
    modelLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500; color: #202124;';
    modelLabel.textContent = 'Model Gemini:';
    
    const modelSelect = document.createElement('select');
    modelSelect.id = 'modelSelect';
    modelSelect.style.cssText = \`
        width: 100%;
        padding: 12px;
        border: 2px solid #e8eaed;
        border-radius: 8px;
        font-size: 14px;
        box-sizing: border-box;
        background: white;
    \`;

    const models = [
        { value: 'gemini-2.5-flash-preview-04-17', text: 'Gemini 2.5 Flash (Preview 04-17)' },
        { value: 'gemini-1.5-pro', text: 'Gemini 1.5 Pro' },
        { value: 'gemini-1.5-flash', text: 'Gemini 1.5 Flash' }
    ];

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.text;
        modelSelect.appendChild(option);
    });

    modelSection.appendChild(modelLabel);
    modelSection.appendChild(modelSelect);

    // Przyciski
    const buttonSection = document.createElement('div');
    buttonSection.style.cssText = 'display: flex; gap: 10px;';
    
    const generateBtn = document.createElement('button');
    generateBtn.id = 'generateBtn';
    generateBtn.textContent = '🚀 Generuj Ofertę';
    generateBtn.style.cssText = \`
        flex: 1;
        background: #1a73e8;
        color: white;
        border: none;
        padding: 14px 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    \`;

    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelBtn';
    cancelBtn.textContent = 'Anuluj';
    cancelBtn.style.cssText = \`
        background: #f8f9fa;
        color: #5f6368;
        border: 2px solid #e8eaed;
        padding: 14px 20px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
    \`;

    buttonSection.appendChild(generateBtn);
    buttonSection.appendChild(cancelBtn);

    // Sekcja loading
    const loadingSection = document.createElement('div');
    loadingSection.id = 'loadingSection';
    loadingSection.style.cssText = 'display: none; text-align: center;';
    
    const spinner = document.createElement('div');
    spinner.style.cssText = \`
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #1a73e8;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px auto;
    \`;

    const loadingTitle = document.createElement('h3');
    loadingTitle.style.cssText = 'color: #202124; margin: 0 0 10px 0;';
    loadingTitle.textContent = 'Generowanie oferty...';

    const loadingText = document.createElement('p');
    loadingText.id = 'loadingText';
    loadingText.style.cssText = 'color: #5f6368; margin: 0; font-size: 14px;';
    loadingText.textContent = 'Pobieranie treści dokumentu...';

    loadingSection.appendChild(spinner);
    loadingSection.appendChild(loadingTitle);
    loadingSection.appendChild(loadingText);

    // Składanie wszystkiego
    configSection.appendChild(apiSection);
    configSection.appendChild(modelSection);
    configSection.appendChild(buttonSection);

    container.appendChild(header);
    container.appendChild(configSection);
    container.appendChild(loadingSection);

    modal.appendChild(container);

    // Dodaj style animacji
    const style = document.createElement('style');
    style.textContent = \`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #offerGeneratorModal button:hover {
            opacity: 0.9;
        }
    \`;
    document.head.appendChild(style);

    // Dodaj modal do strony
    document.body.appendChild(modal);

    // Załaduj zapisane ustawienia
    const savedApiKey = localStorage.getItem('gemini_api_key');
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash-preview-04-17';
    
    if (savedApiKey) {
        apiInput.value = savedApiKey;
    }
    modelSelect.value = savedModel;

    // Funkcje pomocnicze
    function showSection(section) {
        configSection.style.display = section === 'config' ? 'block' : 'none';
        loadingSection.style.display = section === 'loading' ? 'block' : 'none';
    }

    function closeModal() {
        modal.remove();
        style.remove();
    }

    // Funkcja do pobierania tekstu z Google Docs
    function getDocumentText() {
        try {
            // Metoda 1: Próbuj pobrać z elementów z tekstem
            const textElements = document.querySelectorAll('.kix-lineview-text-block');
            if (textElements.length > 0) {
                return Array.from(textElements)
                    .map(el => el.textContent || el.innerText)
                    .filter(text => text.trim())
                    .join('\\n\\n');
            }

            // Metoda 2: Alternatywna metoda dla różnych wersji Google Docs
            const contentElements = document.querySelectorAll('.kix-paragraphrenderer');
            if (contentElements.length > 0) {
                return Array.from(contentElements)
                    .map(el => el.textContent || el.innerText)
                    .filter(text => text.trim())
                    .join('\\n\\n');
            }

            // Metoda 3: Ogólna metoda
            const editor = document.querySelector('.kix-appview-editor');
            if (editor) {
                return (editor.textContent || editor.innerText || '').trim();
            }

            throw new Error('Nie można znaleźć treści dokumentu');
        } catch (error) {
            console.error('Błąd podczas pobierania tekstu:', error);
            throw new Error('Nie udało się pobrać treści dokumentu. Upewnij się, że dokument jest otwarty w trybie edycji.');
        }
    }

    // Funkcja generowania oferty
    async function generateOffer() {
        const apiKey = apiInput.value.trim();
        const model = modelSelect.value;

        if (!apiKey) {
            alert('Proszę wprowadzić klucz API Gemini');
            return;
        }

        // Zapisz ustawienia
        localStorage.setItem('gemini_api_key', apiKey);
        localStorage.setItem('gemini_model', model);

        showSection('loading');

        try {
            // Pobierz treść dokumentu
            loadingText.textContent = 'Pobieranie treści dokumentu...';
            await new Promise(resolve => setTimeout(resolve, 500)); // Krótka pauza dla UX

            const documentText = getDocumentText();
            
            if (!documentText || documentText.trim().length < 50) {
                throw new Error('Dokument jest pusty lub zbyt krótki. Dodaj więcej treści do oferty.');
            }

            // Wywołaj API
            loadingText.textContent = 'Generowanie interaktywnej oferty...';
            
            // Pobierz URL deployment z window.location
            const baseUrl = 'https://oferta-generator-v2.vercel.app'; // Twardy URL na wypadek problemów
            
            const response = await fetch(baseUrl + '/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentText: documentText,
                    apiKey: apiKey,
                    modelName: model
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Wystąpił błąd podczas generowania oferty');
            }

            // Zapisz dane oferty w localStorage
            if (result.offerData && result.offerId) {
                const storageKey = \`offer_\${result.offerId}\`;
                localStorage.setItem(storageKey, JSON.stringify(result.offerData));
            }

            // Stwórz sekcję sukcesu
            const successSection = document.createElement('div');
            successSection.style.cssText = 'text-align: center;';

            const successIcon = document.createElement('div');
            successIcon.style.cssText = 'color: #0d7377; font-size: 48px; margin-bottom: 10px;';
            successIcon.textContent = '✅';

            const successTitle = document.createElement('h3');
            successTitle.style.cssText = 'color: #0d7377; margin: 0 0 10px 0;';
            successTitle.textContent = 'Oferta gotowa!';

            const successText = document.createElement('p');
            successText.style.cssText = 'color: #5f6368; margin: 0 0 20px 0; font-size: 14px;';
            successText.textContent = 'Link jest ważny przez 7 dni';

            const linkContainer = document.createElement('div');
            linkContainer.style.cssText = \`
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border: 2px solid #e8eaed;
                margin-bottom: 20px;
                word-break: break-all;
            \`;

            const linkLabel = document.createElement('div');
            linkLabel.style.cssText = 'font-size: 12px; color: #5f6368; margin-bottom: 5px;';
            linkLabel.textContent = 'Link do oferty:';

            const offerLink = document.createElement('a');
            offerLink.href = result.url;
            offerLink.target = '_blank';
            offerLink.style.cssText = \`
                color: #1a73e8;
                text-decoration: none;
                font-weight: 500;
                font-size: 14px;
            \`;
            offerLink.textContent = result.url;

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = 'display: flex; gap: 10px;';

            const copyBtn = document.createElement('button');
            copyBtn.style.cssText = \`
                flex: 1;
                background: #1a73e8;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
            \`;
            copyBtn.textContent = '📋 Kopiuj Link';

            const openBtn = document.createElement('button');
            openBtn.style.cssText = \`
                flex: 1;
                background: #0d7377;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
            \`;
            openBtn.textContent = '🚀 Otwórz Ofertę';

            // Event listeners dla przycisków sukcesu
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(result.url);
                    copyBtn.textContent = '✅ Skopiowano!';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 Kopiuj Link';
                    }, 2000);
                } catch (error) {
                    // Fallback
                    const textArea = document.createElement('textarea');
                    textArea.value = result.url;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    copyBtn.textContent = '✅ Skopiowano!';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 Kopiuj Link';
                    }, 2000);
                }
            });

            openBtn.addEventListener('click', () => {
                window.open(result.url, '_blank');
            });

            // Składanie sekcji sukcesu
            linkContainer.appendChild(linkLabel);
            linkContainer.appendChild(offerLink);
            buttonContainer.appendChild(copyBtn);
            buttonContainer.appendChild(openBtn);

            successSection.appendChild(successIcon);
            successSection.appendChild(successTitle);
            successSection.appendChild(successText);
            successSection.appendChild(linkContainer);
            successSection.appendChild(buttonContainer);

            // Zastąp loading sekcję sukcesem
            container.removeChild(loadingSection);
            container.appendChild(successSection);

        } catch (error) {
            console.error('Błąd:', error);
            
            // Stwórz sekcję błędu
            const errorSection = document.createElement('div');
            errorSection.style.cssText = 'text-align: center;';

            const errorIcon = document.createElement('div');
            errorIcon.style.cssText = 'color: #d93025; font-size: 48px; margin-bottom: 10px;';
            errorIcon.textContent = '❌';

            const errorTitle = document.createElement('h3');
            errorTitle.style.cssText = 'color: #d93025; margin: 0 0 10px 0;';
            errorTitle.textContent = 'Wystąpił błąd';

            const errorText = document.createElement('p');
            errorText.style.cssText = 'color: #5f6368; margin: 0 0 20px 0; font-size: 14px;';
            errorText.textContent = error.message || 'Wystąpił nieoczekiwany błąd';

            const retryBtn = document.createElement('button');
            retryBtn.style.cssText = \`
                width: 100%;
                background: #1a73e8;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
            \`;
            retryBtn.textContent = '🔄 Spróbuj ponownie';

            retryBtn.addEventListener('click', () => {
                container.removeChild(errorSection);
                container.appendChild(configSection);
                showSection('config');
            });

            errorSection.appendChild(errorIcon);
            errorSection.appendChild(errorTitle);
            errorSection.appendChild(errorText);
            errorSection.appendChild(retryBtn);

            // Zastąp loading sekcję błędem
            container.removeChild(loadingSection);
            container.appendChild(errorSection);
        }
    }

    // Event listeners
    generateBtn.addEventListener('click', generateOffer);
    cancelBtn.addEventListener('click', closeModal);

    // Zamknij modal po kliknięciu tła
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Zamknij modal na ESC
    const escapeHandler = (e) => {
        if (e.key === 'Escape' && document.getElementById('offerGeneratorModal')) {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);

})();
`;

    // Pobierz elementy
    const modal = document.getElementById('offerGeneratorModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    const generateBtn = document.getElementById('generateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const configSection = document.getElementById('configSection');
    const loadingSection = document.getElementById('loadingSection');
    const successSection = document.getElementById('successSection');
    const errorSection = document.getElementById('errorSection');
    const loadingText = document.getElementById('loadingText');
    const errorMessage = document.getElementById('errorMessage');
    const offerLink = document.getElementById('offerLink');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const openLinkBtn = document.getElementById('openLinkBtn');
    const retryBtn = document.getElementById('retryBtn');

    // Załaduj zapisane ustawienia
    const savedApiKey = localStorage.getItem('gemini_api_key');
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash-preview-04-17';
    
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
    modelSelect.value = savedModel;

    // Funkcje pomocnicze
    function showSection(section) {
        configSection.style.display = section === 'config' ? 'block' : 'none';
        loadingSection.style.display = section === 'loading' ? 'block' : 'none';
        successSection.style.display = section === 'success' ? 'block' : 'none';
        errorSection.style.display = section === 'error' ? 'block' : 'none';
    }

    function closeModal() {
        modal.remove();
    }

    function showError(message) {
        errorMessage.textContent = message;
        showSection('error');
    }

    // Funkcja do pobierania tekstu z Google Docs
    function getDocumentText() {
        try {
            // Metoda 1: Próbuj pobrać z elementów z tekstem
            const textElements = document.querySelectorAll('.kix-lineview-text-block');
            if (textElements.length > 0) {
                return Array.from(textElements)
                    .map(el => el.textContent || el.innerText)
                    .filter(text => text.trim())
                    .join('\\n\\n');
            }

            // Metoda 2: Alternatywna metoda dla różnych wersji Google Docs
            const contentElements = document.querySelectorAll('.kix-paragraphrenderer');
            if (contentElements.length > 0) {
                return Array.from(contentElements)
                    .map(el => el.textContent || el.innerText)
                    .filter(text => text.trim())
                    .join('\\n\\n');
            }

            // Metoda 3: Ogólna metoda
            const editor = document.querySelector('.kix-appview-editor');
            if (editor) {
                return (editor.textContent || editor.innerText || '').trim();
            }

            throw new Error('Nie można znaleźć treści dokumentu');
        } catch (error) {
            console.error('Błąd podczas pobierania tekstu:', error);
            throw new Error('Nie udało się pobrać treści dokumentu. Upewnij się, że dokument jest otwarty w trybie edycji.');
        }
    }

    // Funkcja generowania oferty
    async function generateOffer() {
        const apiKey = apiKeyInput.value.trim();
        const model = modelSelect.value;

        if (!apiKey) {
            alert('Proszę wprowadzić klucz API Gemini');
            return;
        }

        // Zapisz ustawienia
        localStorage.setItem('gemini_api_key', apiKey);
        localStorage.setItem('gemini_model', model);

        showSection('loading');

        try {
            // Pobierz treść dokumentu
            loadingText.textContent = 'Pobieranie treści dokumentu...';
            await new Promise(resolve => setTimeout(resolve, 500)); // Krótka pauza dla UX

            const documentText = getDocumentText();
            
            if (!documentText || documentText.trim().length < 50) {
                throw new Error('Dokument jest pusty lub zbyt krótki. Dodaj więcej treści do oferty.');
            }

            // Wywołaj API
            loadingText.textContent = 'Generowanie interaktywnej oferty...';
            
            const response = await fetch(window.location.origin + '/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentText: documentText,
                    apiKey: apiKey,
                    modelName: model
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Wystąpił błąd podczas generowania oferty');
            }

            // Zapisz dane oferty w localStorage
            if (result.offerData && result.offerId) {
                const storageKey = \`offer_\${result.offerId}\`;
                localStorage.setItem(storageKey, JSON.stringify(result.offerData));
            }

            // Pokaż sukces
            offerLink.href = result.url;
            offerLink.textContent = result.url;
            showSection('success');

        } catch (error) {
            console.error('Błąd:', error);
            showError(error.message || 'Wystąpił nieoczekiwany błąd');
        }
    }

    // Event listeners
    generateBtn.addEventListener('click', generateOffer);
    cancelBtn.addEventListener('click', closeModal);
    retryBtn.addEventListener('click', () => showSection('config'));

    copyLinkBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(offerLink.href);
            copyLinkBtn.textContent = '✅ Skopiowano!';
            setTimeout(() => {
                copyLinkBtn.textContent = '📋 Kopiuj Link';
            }, 2000);
        } catch (error) {
            // Fallback dla starszych przeglądarek
            const textArea = document.createElement('textarea');
            textArea.value = offerLink.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyLinkBtn.textContent = '✅ Skopiowano!';
            setTimeout(() => {
                copyLinkBtn.textContent = '📋 Kopiuj Link';
            }, 2000);
        }
    });

    openLinkBtn.addEventListener('click', () => {
        window.open(offerLink.href, '_blank');
    });

    // Zamknij modal po kliknięciu tła
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Zamknij modal na ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('offerGeneratorModal')) {
            closeModal();
        }
    });

})();
`;
