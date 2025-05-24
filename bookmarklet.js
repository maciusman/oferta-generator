// bookmarklet.js - Główny kod bookmarklet
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

    // Utwórz interfejs użytkownika
    const modalHtml = \`
        <div id="offerGeneratorModal" style="
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
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="color: #1a73e8; margin: 0 0 10px 0; font-size: 24px; font-weight: 500;">
                        🎯 Generator Interaktywnych Ofert
                    </h2>
                    <p style="color: #5f6368; margin: 0; font-size: 14px;">
                        Przekształć ten dokument w interaktywną ofertę HTML
                    </p>
                </div>

                <div id="configSection">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #202124;">
                            Klucz API Gemini:
                        </label>
                        <input type="password" id="apiKeyInput" placeholder="Wklej swój klucz API..." style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e8eaed;
                            border-radius: 8px;
                            font-size: 14px;
                            box-sizing: border-box;
                        ">
                        <div style="margin-top: 5px;">
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" style="
                                color: #1a73e8;
                                font-size: 12px;
                                text-decoration: none;
                            ">🔗 Pobierz klucz API (darmowy)</a>
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #202124;">
                            Model Gemini:
                        </label>
                        <select id="modelSelect" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e8eaed;
                            border-radius: 8px;
                            font-size: 14px;
                            box-sizing: border-box;
                            background: white;
                        ">
                            <option value="gemini-2.5-flash-preview-04-17">Gemini 2.5 Flash (Preview 04-17)</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button id="generateBtn" style="
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
                        ">
                            🚀 Generuj Ofertę
                        </button>
                        <button id="cancelBtn" style="
                            background: #f8f9fa;
                            color: #5f6368;
                            border: 2px solid #e8eaed;
                            padding: 14px 20px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                        ">
                            Anuluj
                        </button>
                    </div>
                </div>

                <div id="loadingSection" style="display: none; text-align: center;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f4f6;
                        border-top: 4px solid #1a73e8;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px auto;
                    "></div>
                    <h3 style="color: #202124; margin: 0 0 10px 0;">Generowanie oferty...</h3>
                    <p style="color: #5f6368; margin: 0; font-size: 14px;" id="loadingText">
                        Pobieranie treści dokumentu...
                    </p>
                </div>

                <div id="successSection" style="display: none;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="color: #0d7377; font-size: 48px; margin-bottom: 10px;">✅</div>
                        <h3 style="color: #0d7377; margin: 0 0 10px 0;">Oferta gotowa!</h3>
                        <p style="color: #5f6368; margin: 0; font-size: 14px;">
                            Link jest ważny przez 7 dni
                        </p>
                    </div>
                    <div style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        border: 2px solid #e8eaed;
                        margin-bottom: 20px;
                        word-break: break-all;
                    ">
                        <div style="font-size: 12px; color: #5f6368; margin-bottom: 5px;">Link do oferty:</div>
                        <a id="offerLink" href="#" target="_blank" style="
                            color: #1a73e8;
                            text-decoration: none;
                            font-weight: 500;
                            font-size: 14px;
                        "></a>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="copyLinkBtn" style="
                            flex: 1;
                            background: #1a73e8;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 8px;
                            font-size: 14px;
                            cursor: pointer;
                        ">
                            📋 Kopiuj Link
                        </button>
                        <button id="openLinkBtn" style="
                            flex: 1;
                            background: #0d7377;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 8px;
                            font-size: 14px;
                            cursor: pointer;
                        ">
                            🚀 Otwórz Ofertę
                        </button>
                    </div>
                </div>

                <div id="errorSection" style="display: none;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="color: #d93025; font-size: 48px; margin-bottom: 10px;">❌</div>
                        <h3 style="color: #d93025; margin: 0 0 10px 0;">Wystąpił błąd</h3>
                        <p id="errorMessage" style="color: #5f6368; margin: 0; font-size: 14px;"></p>
                    </div>
                    <button id="retryBtn" style="
                        width: 100%;
                        background: #1a73e8;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        font-size: 14px;
                        cursor: pointer;
                    ">
                        🔄 Spróbuj ponownie
                    </button>
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            #offerGeneratorModal button:hover {
                opacity: 0.9;
            }
        </style>
    \`;

    // Dodaj modal do strony
    document.body.insertAdjacentHTML('beforeend', modalHtml);

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
