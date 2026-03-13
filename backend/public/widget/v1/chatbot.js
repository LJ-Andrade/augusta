(function() {
    const script = document.currentScript || document.querySelector('script[data-token]');
    
    if (!script) {
        console.error('Chatbot Widget: Could not find script tag.');
        return;
    }

    const token = script.getAttribute('data-token');
    if (!token) {
        console.error('Chatbot Widget: Missing data-token attribute.');
        return;
    }

    const scriptSrc = script.src;
    const baseUrl = scriptSrc.split('/widget/v1/')[0];
    const apiUrl = `${baseUrl}/api/v1/widget/${token}`;

    let config = null;
    let isOpen = false;
    let messages = [];

    // Fallback for randomUUID if not in secure context
    function generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function parseMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>')
            .replace(/\n/g, '<br>');
    }

    let sessionUuid = sessionStorage.getItem(`chatbot_session_${token}`) || generateUUID();
    sessionStorage.setItem(`chatbot_session_${token}`, sessionUuid);

    // 2. Styles
    const styles = `
        :host {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 2147483647 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: block !important;
            --primary-color: #0ea5e9;
            --secondary-color: #1e293b;
        }

        #chatbot-widget-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            position: relative;
        }

        #chatbot-cta {
            position: absolute;
            right: 70px;
            bottom: 6px;
            background: white;
            color: #1e293b;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            white-space: nowrap;
            display: none;
            align-items: center;
            gap: 8px;
            animation: float 3s ease-in-out infinite, fadeIn 0.5s ease;
            border: 1px solid #e2e8f0;
            z-index: 2147483646;
        }

        #chatbot-cta::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background: white;
            border-right: 1px solid #e2e8f0;
            border-top: 1px solid #e2e8f0;
        }

        #chatbot-cta-close {
            cursor: pointer;
            color: #94a3b8;
            padding: 2px;
            display: flex;
            align-items: center;
            margin-left: 4px;
        }

        #chatbot-cta-close:hover {
            color: #64748b;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }

        #chatbot-bubble {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--primary-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            overflow: hidden;
            border: 2px solid white;
        }

        #chatbot-bubble img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        #chatbot-bubble:hover {
            transform: scale(1.05);
        }

        #chatbot-bubble svg {
            width: 28px;
            height: 28px;
            color: white;
        }

        #chatbot-window {
            width: 380px;
            height: 580px;
            max-height: calc(100vh - 100px);
            background: var(--secondary-color);
            border-radius: 16px;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            margin-bottom: 16px;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #chatbot-header {
            padding: 16px;
            background: var(--secondary-color);
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            position: relative;
            z-index: 2;
        }

        #chatbot-header-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            object-fit: cover;
        }

        #chatbot-header-info h3 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
        }

        #chatbot-header-info p {
            margin: 0;
            font-size: 11px;
            color: rgba(255,255,255,0.7);
        }

        #chatbot-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #f8fafc;
        }

        .message {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .message-bot {
            align-self: flex-start;
            background: white;
            color: #1e293b;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }

        .message-user {
            align-self: flex-end;
            background: var(--primary-color);
            color: white;
        }

        #chatbot-suggestions {
            padding: 8px 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            background: #f8fafc;
        }

        .suggestion-btn {
            background: white;
            border: 1px solid #e2e8f0;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .suggestion-btn:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }

        #chatbot-input-container {
            padding: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 8px;
            background: white;
        }

        #chatbot-input {
            flex: 1;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 13px;
            outline: none;
        }

        #chatbot-input:focus {
            border-color: var(--primary-color);
        }

        #chatbot-send {
            background: var(--primary-color);
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #chatbot-typing {
            font-size: 11px;
            color: #64748b;
            padding-left: 16px;
            display: none;
            background: #f8fafc;
            padding-bottom: 8px;
        }

        .consent-notice {
            font-size: 11px;
            color: #64748b;
            background: #f1f5f9;
            padding: 10px 14px;
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px dashed #cbd5e1;
            line-height: 1.4;
        }

        #chatbot-privacy-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 10;
            display: none;
            flex-direction: column;
            animation: slideUp 0.3s ease;
            border-radius: 16px;
        }

        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }

        #chatbot-privacy-header {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
            background: white;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
        }

        #chatbot-privacy-back {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #64748b;
        }

        #chatbot-privacy-content {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            font-size: 13px;
            line-height: 1.6;
            color: #334155;
        }

        .privacy-link {
            font-size: 11px;
            color: var(--primary-color);
            text-decoration: underline;
            cursor: pointer;
            display: block;
            margin-top: 4px;
        }
    `;

    // 3. UI Construction
    function renderUI() {
        if (!document.body) {
            setTimeout(renderUI, 100);
            return;
        }

        const container = document.createElement('div');
        container.id = 'chatbot-widget-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '2147483647',
            display: 'block',
            width: 'auto',
            height: 'auto'
        });
        
        const shadow = container.attachShadow({ mode: 'open' });
        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        shadow.appendChild(styleTag);

        const widgetBody = document.createElement('div');
        widgetBody.id = 'chatbot-widget-wrapper';
        widgetBody.innerHTML = `
            <div id="chatbot-window">
                <div id="chatbot-header">
                    <img id="chatbot-header-avatar" src="" alt="">
                    <div id="chatbot-header-info">
                        <h3 id="chatbot-header-name">Chatbot</h3>
                        <p id="chatbot-header-desc">Cargando...</p>
                    </div>
                </div>
                
                <div id="chatbot-privacy-screen">
                    <div id="chatbot-privacy-header">
                        <button id="chatbot-privacy-back">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        </button>
                        <span style="font-size: 14px; font-weight: 600;">Política de Privacidad</span>
                    </div>
                    <div id="chatbot-privacy-content"></div>
                </div>

                <div id="chatbot-messages"></div>
                <div id="chatbot-typing">El asistente está escribiendo...</div>
                <div id="chatbot-suggestions"></div>
                <form id="chatbot-input-container">
                    <input type="text" id="chatbot-input" placeholder="Escribe un mensaje..." autocomplete="off">
                    <button type="submit" id="chatbot-send">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
            <div id="chatbot-cta">
                <span>${config.cta_text || '¿Tenés alguna duda? ¡Consultame!'}</span>
                <div id="chatbot-cta-close">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
            </div>
            <div id="chatbot-bubble">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
        `;
        shadow.appendChild(widgetBody);
        document.body.appendChild(container);

        // Update references
        const bubble = shadow.querySelector('#chatbot-bubble');
        const windowEl = shadow.querySelector('#chatbot-window');
        const messagesEl = shadow.querySelector('#chatbot-messages');
        const inputEl = shadow.querySelector('#chatbot-input');
        const formEl = shadow.querySelector('#chatbot-input-container');
        const suggestionsEl = shadow.querySelector('#chatbot-suggestions');
        const typingEl = shadow.querySelector('#chatbot-typing');
        const submitBtn = shadow.querySelector('#chatbot-send');
        const headerName = shadow.querySelector('#chatbot-header-name');
        const headerDesc = shadow.querySelector('#chatbot-header-desc');
        const headerAvatar = shadow.querySelector('#chatbot-header-avatar');
        
        const privacyScreen = shadow.querySelector('#chatbot-privacy-screen');
        const privacyContent = shadow.querySelector('#chatbot-privacy-content');
        const privacyBack = shadow.querySelector('#chatbot-privacy-back');

        const cta = shadow.querySelector('#chatbot-cta');
        const ctaClose = shadow.querySelector('#chatbot-cta-close');

        // CTA Logic: Show after delay, hide on open or close click
        let ctaTimeout = setTimeout(() => {
            if (windowEl.style.display !== 'flex') {
                cta.style.display = 'flex';
            }
        }, 3000);

        ctaClose.onclick = (e) => {
            e.stopPropagation();
            cta.style.display = 'none';
            clearTimeout(ctaTimeout);
        };

        // Initial Data Update
        if (config) {
            // Apply dynamic colors
            if (config.primary_color) {
                container.style.setProperty('--primary-color', config.primary_color);
                styleTag.textContent = styleTag.textContent.replace('--primary-color: #0ea5e9;', `--primary-color: ${config.primary_color};`);
            }
            if (config.secondary_color) {
                styleTag.textContent = styleTag.textContent.replace('--secondary-color: #1e293b;', `--secondary-color: ${config.secondary_color};`);
            }

            headerName.textContent = config.name;
            headerDesc.textContent = config.description || 'En línea';
            const avatar = config.avatar_url || 'https://ui-avatars.com/api/?name=' + config.name;
            headerAvatar.src = avatar;

            // Show avatar in bubble if exists
            if (config.avatar_url) {
                bubble.innerHTML = `<img src="${config.avatar_url}" alt="${config.name}">`;
            }
            
            // 1. Consent Notice (if exists)
            if (config.consent_notice) {
                const consentEl = document.createElement('div');
                consentEl.className = 'consent-notice';
                consentEl.innerHTML = parseMarkdown(config.consent_notice);
                
                // Add privacy policy link to consent notice
                const pLink = document.createElement('span');
                pLink.className = 'privacy-link';
                pLink.textContent = 'Ver Política de Privacidad';
                pLink.onclick = (e) => {
                    e.stopPropagation();
                    privacyContent.innerHTML = parseMarkdown(config.privacy_policy) || 'No hay política de privacidad disponible.';
                    privacyScreen.style.display = 'flex';
                };
                consentEl.appendChild(pLink);
                messagesEl.appendChild(consentEl);
            }

            // 2. Initial Greeting / History
            fetchHistory(messagesEl);

            // Privacy Back button logic
            privacyBack.onclick = () => {
                privacyScreen.style.display = 'none';
            };

            if (config.suggested_questions) {
                config.suggested_questions.forEach(q => {
                    const btn = document.createElement('button');
                    btn.className = 'suggestion-btn';
                    btn.textContent = q;
                    btn.onclick = () => {
                        inputEl.value = q;
                        formEl.requestSubmit();
                    };
                    suggestionsEl.appendChild(btn);
                });
            }

        }

        // Re-bind events
        bubble.addEventListener('click', () => {
            isOpen = !isOpen;
            windowEl.style.display = isOpen ? 'flex' : 'none';
            if (isOpen) {
                cta.style.display = 'none';
                clearTimeout(ctaTimeout);
                inputEl.focus();
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
        });

        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const text = inputEl.value;
            if (!text.trim()) return;
            
            // UI Update for user message
            const msg = document.createElement('div');
            msg.className = `message message-user`;
            msg.textContent = text;
            messagesEl.appendChild(msg);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            
            inputEl.value = '';
            suggestionsEl.style.display = 'none';
            typingEl.style.display = 'block';

            // Send actual message
            performSendMessage(text, messagesEl, typingEl, suggestionsEl);
        });
    }

    async function performSendMessage(text, messagesEl, typingEl, suggestionsEl) {
        try {
            const resp = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    session_uuid: sessionUuid,
                    history: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }))
                })
            });

            const data = await resp.json();
            typingEl.style.display = 'none';
            
            const botMsg = document.createElement('div');
            botMsg.className = `message message-bot`;
            
            if (data.data && data.data.reply) {
                botMsg.innerHTML = parseMarkdown(data.data.reply);
                messages.push({ role: 'user', content: text });
                messages.push({ role: 'assistant', content: data.data.reply });
            } else {
                botMsg.textContent = 'Lo siento, hubo un problema al procesar tu mensaje.';
            }
            messagesEl.appendChild(botMsg);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        } catch (err) {
            typingEl.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.className = `message message-bot`;
            errorMsg.textContent = 'Error de conexión con el servidor.';
            messagesEl.appendChild(errorMsg);
        }
    }

    async function fetchHistory(messagesEl) {
        try {
            const resp = await fetch(`${apiUrl}/history?session_uuid=${sessionUuid}`);
            const data = await resp.json();
            const history = data.data || [];

            if (history.length > 0) {
                // Populate messages array for context
                messages = history.map(m => ({ role: m.role, content: m.content }));
                
                // Render history
                history.forEach(m => {
                    const msg = document.createElement('div');
                    msg.className = `message message-${m.role === 'assistant' ? 'bot' : 'user'}`;
                    if (m.role === 'assistant') {
                        msg.innerHTML = parseMarkdown(m.content);
                    } else {
                        msg.textContent = m.content;
                    }
                    messagesEl.appendChild(msg);
                });
            } else {
                // No history, show welcome message
                const initialMsg = document.createElement('div');
                initialMsg.className = 'message message-bot';
                initialMsg.innerHTML = parseMarkdown(config.welcome_message);
                messagesEl.appendChild(initialMsg);
            }
            messagesEl.scrollTop = messagesEl.scrollHeight;
        } catch (err) {
            console.error('Chatbot Widget: Error fetching history', err);
            // Fallback to welcome message
            const initialMsg = document.createElement('div');
            initialMsg.className = 'message message-bot';
            initialMsg.innerHTML = parseMarkdown(config.welcome_message);
            messagesEl.appendChild(initialMsg);
        }
    }

    // 5. Logic
    async function init() {
        try {
            const resp = await fetch(`${apiUrl}/config`);
            if (!resp.ok) throw new Error('Unauthorized or Bot not found');
            const data = await resp.json();
            config = data.data;

            if (config.is_active === false) {
                console.info('Chatbot Widget: El chatbot está presente pero desactivado desde el servicio.');
                return;
            }
            
            renderUI();
        } catch (err) {
            console.error('Chatbot Widget:', err.message);
        }
    }

    init();
})();
