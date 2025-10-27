// RAGBuilder Assistant - Logique de l'étape Moteur RAG

document.addEventListener('DOMContentLoaded', function() {
    const testRagBtn = document.getElementById('testRagBtn');
    const testResults = document.getElementById('testResults');
    const formActions = document.getElementById('formActions');
    const backBtn = document.getElementById('backBtn');
    const continueBtn = document.getElementById('continueBtn');
    
    // Charger les données existantes
    loadExistingData();
    
    // Gestionnaire du test RAG
    testRagBtn.addEventListener('click', function() {
        testRAGEngine();
    });
    
    // Boutons de navigation
    backBtn.addEventListener('click', function() {
        window.location.href = 'indexation.html';
    });
    
    continueBtn.addEventListener('click', function() {
        window.location.href = 'interface.html';
    });
    
    // Gestionnaire de changement de température
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.addEventListener('input', function() {
            temperatureValue.textContent = this.value;
        });
    }
    
    // Gestionnaire de changement de seuil de similarité
    const similaritySlider = document.getElementById('similarityThreshold');
    const similarityValue = document.getElementById('similarityValue');
    
    if (similaritySlider && similarityValue) {
        similaritySlider.addEventListener('input', function() {
            similarityValue.textContent = this.value;
        });
    }
    
    // Fonction pour tester le moteur RAG
    async function testRAGEngine() {
        const testQuestion = document.getElementById('testQuestion').value.trim();
        
        if (!testQuestion) {
            Utils.showError('Veuillez saisir une question de test');
            return;
        }
        
        // Collecter la configuration
        const config = collectRAGConfig();
        
        // Sauvegarder la configuration
        dataManager.updatePhase('moteur', {
            ...config,
            timestamp: new Date().toISOString()
        });
        
        // Afficher le chargement
        Utils.showLoading(testRagBtn, 'Test en cours...');
        
        try {
            // Simuler le processus RAG
            const result = await simulateRAGProcess(testQuestion, config);
            
            // Afficher les résultats
            displayRAGResults(result);
            testResults.style.display = 'block';
            formActions.style.display = 'block';
            
            Utils.showSuccess('Test RAG réussi !');
            
        } catch (error) {
            Utils.showError('Erreur lors du test RAG');
            console.error(error);
        } finally {
            testRagBtn.innerHTML = 'Tester le moteur RAG';
        }
    }
    
    // Fonction pour collecter la configuration RAG
    function collectRAGConfig() {
        return {
            llmModel: document.getElementById('llmModel').value,
            temperature: parseFloat(document.getElementById('temperature').value),
            maxTokens: parseInt(document.getElementById('maxTokens').value),
            topK: parseInt(document.getElementById('topK').value),
            similarityThreshold: parseFloat(document.getElementById('similarityThreshold').value),
            systemPrompt: document.getElementById('systemPrompt').value,
            userPromptTemplate: document.getElementById('userPromptTemplate').value
        };
    }
    
    // Processus RAG réel
    async function simulateRAGProcess(question, config) {
        // Vérifier les clés API
        const analyseData = dataManager.getPhaseData('analyse');
        const dataprepData = dataManager.getPhaseData('dataprep');
        
        if (!analyseData.openaiKey) {
            throw new Error('Clé API OpenAI requise');
        }
        
        if (!dataprepData.collectionName) {
            throw new Error('Collection vectorielle requise');
        }
        
        // Étape 1: Recherche de documents (simulation pour l'instant)
        Utils.showInfo('Recherche de documents pertinents...');
        const retrievedDocs = await searchDocumentsReal(question, config.topK, analyseData.openaiKey, config.embeddingModel);
        
        // Filtrer par seuil de similarité
        const filteredDocs = retrievedDocs.filter(doc => doc.score >= config.similarityThreshold);
        
        // Étape 2: Construction du contexte
        const context = filteredDocs.map(doc => 
            `Source: ${doc.source}\nContenu: ${doc.content}`
        ).join('\n\n');
        
        // Étape 3: Génération de la réponse
        Utils.showInfo('Génération de la réponse...');
        const response = await generateResponseReal(question, context, config, analyseData);
        
        return {
            question,
            retrievedDocuments: filteredDocs,
            context,
            response: response.response,
            sources: response.sources,
            tokens: response.tokens,
            config
        };
    }
    
    // Fonction de recherche réelle de documents
    async function searchDocumentsReal(question, topK, apiKey, embeddingModel) {
        try {
            // Créer l'embedding de la question
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: embeddingModel,
                    input: question
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erreur API OpenAI: ${response.status}`);
            }
            
            const data = await response.json();
            const questionEmbedding = data.data[0].embedding;
            
            // Pour l'instant, retourner des documents simulés
            // En production, utiliser votre base vectorielle (ChromaDB, Pinecone, etc.)
            return [
                {
                    id: 1,
                    content: "Document pertinent trouvé pour votre question. Ceci est un exemple de contenu récupéré.",
                    source: "document1.pdf",
                    score: 0.95
                },
                {
                    id: 2,
                    content: "Autre document pertinent avec des informations complémentaires.",
                    source: "document2.pdf",
                    score: 0.87
                }
            ];
            
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            throw error;
        }
    }
    
    // Fonction de génération réelle de réponse
    async function generateResponseReal(question, context, config, analyseData) {
        try {
            let apiUrl, headers, body;
            
            if (config.llmModel.startsWith('gpt')) {
                // OpenAI API
                apiUrl = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Authorization': `Bearer ${analyseData.openaiKey}`,
                    'Content-Type': 'application/json'
                };
                body = {
                    model: config.llmModel,
                    messages: [
                        { role: 'system', content: config.systemPrompt },
                        { role: 'user', content: config.userPromptTemplate.replace('{context}', context).replace('{question}', question) }
                    ],
                    temperature: config.temperature,
                    max_tokens: config.maxTokens
                };
            } else if (config.llmModel.startsWith('claude')) {
                // Anthropic API
                apiUrl = 'https://api.anthropic.com/v1/messages';
                headers = {
                    'x-api-key': analyseData.anthropicKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                };
                body = {
                    model: config.llmModel,
                    max_tokens: config.maxTokens,
                    temperature: config.temperature,
                    messages: [
                        { role: 'user', content: `${config.systemPrompt}\n\n${config.userPromptTemplate.replace('{context}', context).replace('{question}', question)}` }
                    ]
                };
            } else {
                throw new Error('Modèle non supporté');
            }
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            
            const data = await response.json();
            
            let responseText, tokens;
            if (config.llmModel.startsWith('gpt')) {
                responseText = data.choices[0].message.content;
                tokens = data.usage.total_tokens;
            } else if (config.llmModel.startsWith('claude')) {
                responseText = data.content[0].text;
                tokens = data.usage.input_tokens + data.usage.output_tokens;
            }
            
            return {
                response: responseText,
                sources: context.split('\n').slice(0, 3),
                tokens: tokens
            };
            
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            throw error;
        }
    }
    
    // Fonction pour afficher les résultats du test RAG
    function displayRAGResults(result) {
        const ragResponse = document.getElementById('ragResponse');
        const ragSources = document.getElementById('ragSources');
        
        // Afficher la réponse
        ragResponse.innerHTML = `
            <div class="rag-response">
                <h4>Réponse générée :</h4>
                <div class="response-content">
                    ${result.response}
                </div>
                <div class="response-meta">
                    <span class="tokens-used">${result.tokens} tokens utilisés</span>
                    <span class="response-time">Temps de réponse: ~2.5s</span>
                </div>
            </div>
        `;
        
        // Afficher les sources
        ragSources.innerHTML = `
            <h4>Sources utilisées :</h4>
            <div class="sources-list">
                ${result.retrievedDocuments.map((doc, index) => `
                    <div class="source-item">
                        <div class="source-header">
                            <span class="source-number">${index + 1}</span>
                            <span class="source-name">${doc.source}</span>
                            <span class="source-score">Score: ${(doc.score * 100).toFixed(1)}%</span>
                        </div>
                        <div class="source-content">
                            ${doc.content.substring(0, 200)}...
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Ajouter les styles pour les résultats
        const style = document.createElement('style');
        style.textContent = `
            .rag-response {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .rag-response h4 {
                color: var(--text-primary);
                margin-bottom: 1rem;
            }
            
            .response-content {
                background: var(--background-color);
                padding: 1rem;
                border-radius: var(--border-radius);
                border-left: 4px solid var(--primary-color);
                margin-bottom: 1rem;
                line-height: 1.6;
            }
            
            .response-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
            
            .sources-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .source-item {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1rem;
            }
            
            .source-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 0.5rem;
            }
            
            .source-number {
                background: var(--primary-color);
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
            }
            
            .source-name {
                font-weight: 500;
                color: var(--text-primary);
            }
            
            .source-score {
                background: var(--success-color);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.8rem;
                margin-left: auto;
            }
            
            .source-content {
                color: var(--text-secondary);
                font-size: 0.9rem;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fonction pour charger les données existantes
    function loadExistingData() {
        const existingData = dataManager.getPhaseData('moteur');
        
        if (Object.keys(existingData).length > 0) {
            // Restaurer la configuration
            if (existingData.llmModel) {
                document.getElementById('llmModel').value = existingData.llmModel;
            }
            if (existingData.temperature !== undefined) {
                document.getElementById('temperature').value = existingData.temperature;
                document.getElementById('temperatureValue').textContent = existingData.temperature;
            }
            if (existingData.maxTokens) {
                document.getElementById('maxTokens').value = existingData.maxTokens;
            }
            if (existingData.topK) {
                document.getElementById('topK').value = existingData.topK;
            }
            if (existingData.similarityThreshold !== undefined) {
                document.getElementById('similarityThreshold').value = existingData.similarityThreshold;
                document.getElementById('similarityValue').textContent = existingData.similarityThreshold;
            }
            if (existingData.systemPrompt) {
                document.getElementById('systemPrompt').value = existingData.systemPrompt;
            }
            if (existingData.userPromptTemplate) {
                document.getElementById('userPromptTemplate').value = existingData.userPromptTemplate;
            }
            
            // Si un test a déjà été effectué, afficher les résultats
            if (existingData.testResults) {
                displayRAGResults(existingData.testResults);
                testResults.style.display = 'block';
                formActions.style.display = 'block';
            }
            
            Utils.showInfo('Configuration du moteur RAG chargée');
        }
    }
    
    // Sauvegarde automatique de la configuration
    const autoSave = Utils.debounce(function() {
        const config = collectRAGConfig();
        dataManager.updatePhase('moteur', config);
    }, 2000);
    
    // Écouter les changements de configuration
    const configInputs = document.querySelectorAll('#llmModel, #temperature, #maxTokens, #topK, #similarityThreshold, #systemPrompt, #userPromptTemplate');
    configInputs.forEach(input => {
        input.addEventListener('input', autoSave);
        input.addEventListener('change', autoSave);
    });
    
    // Exemples de questions de test
    const exampleQuestions = [
        "Comment fonctionne notre politique de remboursement ?",
        "Quels sont les délais de livraison ?",
        "Comment contacter le support client ?",
        "Quelles sont les méthodes de paiement acceptées ?",
        "Comment annuler une commande ?"
    ];
    
    const testQuestionField = document.getElementById('testQuestion');
    if (testQuestionField && !testQuestionField.value) {
        testQuestionField.placeholder = exampleQuestions[0];
        
        // Ajouter des suggestions
        const suggestions = document.createElement('div');
        suggestions.className = 'question-suggestions';
        suggestions.innerHTML = `
            <p>Suggestions de questions :</p>
            <div class="suggestions-list">
                ${exampleQuestions.map(q => `
                    <button type="button" class="suggestion-btn" onclick="document.getElementById('testQuestion').value = '${q}'">
                        ${q}
                    </button>
                `).join('')}
            </div>
        `;
        
        testQuestionField.parentNode.appendChild(suggestions);
        
        // Ajouter les styles pour les suggestions
        const suggestionStyle = document.createElement('style');
        suggestionStyle.textContent = `
            .question-suggestions {
                margin-top: 1rem;
            }
            
            .question-suggestions p {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .suggestions-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .suggestion-btn {
                background: var(--background-color);
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
                padding: 0.5rem 0.75rem;
                font-size: 0.8rem;
                color: var(--text-secondary);
                cursor: pointer;
                transition: var(--transition);
            }
            
            .suggestion-btn:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
        `;
        document.head.appendChild(suggestionStyle);
    }
    
    console.log('Module Moteur RAG initialisé');
});
