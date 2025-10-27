// RAGBuilder Assistant - Logique de l'étape Interface

document.addEventListener('DOMContentLoaded', function() {
    const testChatBtn = document.getElementById('testChatBtn');
    const chatTestResults = document.getElementById('chatTestResults');
    const formActions = document.getElementById('formActions');
    const backBtn = document.getElementById('backBtn');
    const continueBtn = document.getElementById('continueBtn');
    const chatPreview = document.getElementById('chatPreview');
    const previewWelcomeMessage = document.getElementById('previewWelcomeMessage');
    
    // Charger les données existantes
    loadExistingData();
    
    // Gestionnaire du test de chat
    testChatBtn.addEventListener('click', function() {
        testChatInterface();
    });
    
    // Boutons de navigation
    backBtn.addEventListener('click', function() {
        window.location.href = 'moteur.html';
    });
    
    continueBtn.addEventListener('click', function() {
        window.location.href = 'recap.html';
    });
    
    // Gestionnaire de changement de thème
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            updateChatPreview();
            saveConfiguration();
        });
    }
    
    // Gestionnaire de changement de style de chat
    const chatStyleRadios = document.querySelectorAll('input[name="chatStyle"]');
    chatStyleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateChatPreview();
            saveConfiguration();
        });
    });
    
    // Gestionnaire de changement de message d'accueil
    const welcomeMessageField = document.getElementById('welcomeMessage');
    if (welcomeMessageField) {
        welcomeMessageField.addEventListener('input', function() {
            if (previewWelcomeMessage) {
                previewWelcomeMessage.textContent = this.value;
            }
            saveConfiguration();
        });
    }
    
    // Gestionnaire de changement de logo
    const logoUrlField = document.getElementById('logoUrl');
    if (logoUrlField) {
        logoUrlField.addEventListener('input', function() {
            updateChatPreview();
            saveConfiguration();
        });
    }
    
    // Fonction pour tester l'interface de chat
    async function testChatInterface() {
        const testMessage = document.getElementById('testMessage').value.trim();
        
        if (!testMessage) {
            Utils.showError('Veuillez saisir un message de test');
            return;
        }
        
        // Collecter la configuration
        const config = collectInterfaceConfig();
        
        // Sauvegarder la configuration
        dataManager.updatePhase('interface', {
            ...config,
            timestamp: new Date().toISOString()
        });
        
        // Afficher le chargement
        Utils.showLoading(testChatBtn, 'Test en cours...');
        
        try {
            // Simuler le test de chat
            const result = await simulateChatTest(testMessage, config);
            
            // Afficher les résultats
            displayChatResults(result);
            chatTestResults.style.display = 'block';
            formActions.style.display = 'block';
            
            Utils.showSuccess('Test d\'interface réussi !');
            
        } catch (error) {
            Utils.showError('Erreur lors du test d\'interface');
            console.error(error);
        } finally {
            testChatBtn.innerHTML = 'Tester le chat';
        }
    }
    
    // Fonction pour collecter la configuration d'interface
    function collectInterfaceConfig() {
        return {
            theme: document.getElementById('theme').value,
            chatStyle: document.querySelector('input[name="chatStyle"]:checked').value,
            logoUrl: document.getElementById('logoUrl').value,
            welcomeMessage: document.getElementById('welcomeMessage').value,
            deploymentType: document.getElementById('deploymentType').value,
            domain: document.getElementById('domain').value,
            authRequired: document.getElementById('authRequired').checked
        };
    }
    
    // Simulation du test de chat
    async function simulateChatTest(message, config) {
        // Simuler le temps de traitement
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Générer une réponse simulée
        const responses = [
            "Merci pour votre question ! Voici ce que je peux vous dire...",
            "Excellente question ! D'après nos informations...",
            "Je comprends votre demande. Voici la réponse...",
            "Parfait ! Voici ce que je peux vous expliquer..."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            userMessage: message,
            botResponse: response,
            responseTime: Math.floor(Math.random() * 2000) + 1000, // 1-3 secondes
            config: config
        };
    }
    
    // Fonction pour afficher les résultats du test de chat
    function displayChatResults(result) {
        const chatResponse = document.getElementById('chatResponse');
        
        chatResponse.innerHTML = `
            <div class="chat-test-result">
                <div class="test-message">
                    <h4>Message de test :</h4>
                    <div class="message-bubble user-message">
                        ${result.userMessage}
                    </div>
                </div>
                
                <div class="test-response">
                    <h4>Réponse du chatbot :</h4>
                    <div class="message-bubble bot-message">
                        ${result.botResponse}
                    </div>
                </div>
                
                <div class="test-metrics">
                    <div class="metric">
                        <span class="metric-label">Temps de réponse :</span>
                        <span class="metric-value">${result.responseTime}ms</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Thème appliqué :</span>
                        <span class="metric-value">${result.config.theme}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Style de chat :</span>
                        <span class="metric-value">${result.config.chatStyle}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter les styles pour les résultats
        const style = document.createElement('style');
        style.textContent = `
            .chat-test-result {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.5rem;
            }
            
            .test-message, .test-response {
                margin-bottom: 1.5rem;
            }
            
            .test-message h4, .test-response h4 {
                color: var(--text-primary);
                margin-bottom: 0.5rem;
                font-size: 1rem;
            }
            
            .message-bubble {
                padding: 1rem;
                border-radius: var(--border-radius);
                max-width: 80%;
                word-wrap: break-word;
            }
            
            .user-message {
                background: var(--primary-color);
                color: white;
                margin-left: auto;
            }
            
            .bot-message {
                background: var(--background-color);
                border: 1px solid var(--border-color);
            }
            
            .test-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border-color);
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .metric-label {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .metric-value {
                color: var(--text-primary);
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fonction pour mettre à jour l'aperçu du chat
    function updateChatPreview() {
        if (!chatPreview) return;
        
        const theme = document.getElementById('theme').value;
        const chatStyle = document.querySelector('input[name="chatStyle"]:checked').value;
        const logoUrl = document.getElementById('logoUrl').value;
        
        // Appliquer le thème
        chatPreview.className = `chat-preview theme-${theme} style-${chatStyle}`;
        
        // Mettre à jour le logo
        const chatLogo = chatPreview.querySelector('.chat-logo');
        if (logoUrl && logoUrl.trim()) {
            chatLogo.innerHTML = `<img src="${logoUrl}" alt="Logo" style="width: 24px; height: 24px; border-radius: 50%;">`;
        } else {
            chatLogo.textContent = '🤖';
        }
        
        // Ajouter les styles de thème
        const themeStyles = getThemeStyles(theme);
        applyThemeStyles(themeStyles);
    }
    
    // Fonction pour obtenir les styles de thème
    function getThemeStyles(theme) {
        const themes = {
            light: {
                '--chat-bg': '#ffffff',
                '--chat-header-bg': '#2563eb',
                '--chat-message-bg': '#f8fafc',
                '--chat-border': '#e2e8f0'
            },
            dark: {
                '--chat-bg': '#1e293b',
                '--chat-header-bg': '#0f172a',
                '--chat-message-bg': '#334155',
                '--chat-border': '#475569'
            },
            blue: {
                '--chat-bg': '#ffffff',
                '--chat-header-bg': '#1e40af',
                '--chat-message-bg': '#dbeafe',
                '--chat-border': '#93c5fd'
            },
            green: {
                '--chat-bg': '#ffffff',
                '--chat-header-bg': '#059669',
                '--chat-message-bg': '#d1fae5',
                '--chat-border': '#6ee7b7'
            },
            purple: {
                '--chat-bg': '#ffffff',
                '--chat-header-bg': '#7c3aed',
                '--chat-message-bg': '#ede9fe',
                '--chat-border': '#c4b5fd'
            }
        };
        
        return themes[theme] || themes.light;
    }
    
    // Fonction pour appliquer les styles de thème
    function applyThemeStyles(styles) {
        const root = document.documentElement;
        Object.entries(styles).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }
    
    // Fonction pour sauvegarder la configuration
    function saveConfiguration() {
        const config = collectInterfaceConfig();
        dataManager.updatePhase('interface', config);
    }
    
    // Fonction pour charger les données existantes
    function loadExistingData() {
        const existingData = dataManager.getPhaseData('interface');
        
        if (Object.keys(existingData).length > 0) {
            // Restaurer la configuration
            if (existingData.theme) {
                document.getElementById('theme').value = existingData.theme;
            }
            if (existingData.chatStyle) {
                const radio = document.querySelector(`input[name="chatStyle"][value="${existingData.chatStyle}"]`);
                if (radio) radio.checked = true;
            }
            if (existingData.logoUrl) {
                document.getElementById('logoUrl').value = existingData.logoUrl;
            }
            if (existingData.welcomeMessage) {
                document.getElementById('welcomeMessage').value = existingData.welcomeMessage;
                if (previewWelcomeMessage) {
                    previewWelcomeMessage.textContent = existingData.welcomeMessage;
                }
            }
            if (existingData.deploymentType) {
                document.getElementById('deploymentType').value = existingData.deploymentType;
            }
            if (existingData.domain) {
                document.getElementById('domain').value = existingData.domain;
            }
            if (existingData.authRequired !== undefined) {
                document.getElementById('authRequired').checked = existingData.authRequired;
            }
            
            // Mettre à jour l'aperçu
            updateChatPreview();
            
            // Si un test a déjà été effectué, afficher les résultats
            if (existingData.testResults) {
                displayChatResults(existingData.testResults);
                chatTestResults.style.display = 'block';
                formActions.style.display = 'block';
            }
            
            Utils.showInfo('Configuration d\'interface chargée');
        }
    }
    
    // Sauvegarde automatique
    const autoSave = Utils.debounce(saveConfiguration, 2000);
    
    // Écouter les changements de configuration
    const configInputs = document.querySelectorAll('#theme, input[name="chatStyle"], #logoUrl, #welcomeMessage, #deploymentType, #domain, #authRequired');
    configInputs.forEach(input => {
        input.addEventListener('input', autoSave);
        input.addEventListener('change', autoSave);
    });
    
    // Mettre à jour l'aperçu au chargement
    updateChatPreview();
    
    console.log('Module Interface initialisé');
});
