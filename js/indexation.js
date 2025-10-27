// RAGBuilder Assistant - Logique de l'étape Indexation

document.addEventListener('DOMContentLoaded', function() {
    const startIndexingBtn = document.getElementById('startIndexingBtn');
    const progressSection = document.getElementById('progressSection');
    const indexingResults = document.getElementById('indexingResults');
    const backBtn = document.getElementById('backBtn');
    const continueBtn = document.getElementById('continueBtn');
    
    // Charger les données existantes
    loadExistingData();
    
    // Bouton de démarrage de l'indexation
    startIndexingBtn.addEventListener('click', function() {
        startIndexing();
    });
    
    // Boutons de navigation
    backBtn.addEventListener('click', function() {
        window.location.href = 'dataprep.html';
    });
    
    continueBtn.addEventListener('click', function() {
        window.location.href = 'moteur.html';
    });
    
    // Fonction pour démarrer l'indexation
    async function startIndexing() {
        const embeddingModel = document.getElementById('embeddingModel').value;
        const vectorStore = document.getElementById('vectorStore').value;
        const collectionName = document.getElementById('collectionName').value;
        
        if (!collectionName.trim()) {
            Utils.showError('Veuillez saisir un nom de collection');
            return;
        }
        
        // Sauvegarder la configuration
        dataManager.updatePhase('indexation', {
            embeddingModel,
            vectorStore,
            collectionName,
            timestamp: new Date().toISOString()
        });
        
        // Afficher la section de progression
        progressSection.style.display = 'block';
        startIndexingBtn.style.display = 'none';
        
        try {
            await simulateIndexingProcess(embeddingModel, vectorStore, collectionName);
            
            // Afficher les résultats
            indexingResults.style.display = 'block';
            Utils.showSuccess('Indexation terminée avec succès !');
            
        } catch (error) {
            Utils.showError('Erreur lors de l\'indexation');
            console.error(error);
        }
    }
    
    // Simulation du processus d'indexation
    async function simulateIndexingProcess(embeddingModel, vectorStore, collectionName) {
        const logsContainer = document.getElementById('indexingLogs');
        const progressBar = document.getElementById('detailedProgress');
        const progressText = document.getElementById('progressText');
        
        const steps = [
            { text: 'Initialisation de la base vectorielle...', progress: 10 },
            { text: 'Connexion au modèle d\'embeddings...', progress: 20 },
            { text: 'Création de la collection...', progress: 30 },
            { text: 'Génération des embeddings...', progress: 50 },
            { text: 'Stockage des vecteurs...', progress: 70 },
            { text: 'Indexation des métadonnées...', progress: 85 },
            { text: 'Finalisation...', progress: 100 }
        ];
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Ajouter le log
            addLogEntry(step.text, 'info');
            
            // Mettre à jour la progression
            progressBar.style.width = `${step.progress}%`;
            progressText.textContent = `${step.progress}%`;
            
            // Simuler le temps de traitement
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
            
            // Ajouter un log de succès
            addLogEntry(`✓ ${step.text}`, 'success');
        }
        
        // Générer les statistiques finales
        const stats = generateIndexingStats(embeddingModel, vectorStore, collectionName);
        displayIndexingStats(stats);
        
        // Sauvegarder les résultats
        dataManager.updatePhase('indexation', {
            status: 'completed',
            stats: stats,
            completedAt: new Date().toISOString()
        });
    }
    
    // Fonction pour ajouter une entrée de log
    function addLogEntry(message, type = 'info') {
        const logsContainer = document.getElementById('indexingLogs');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-entry-${type}`;
        logEntry.textContent = message;
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    // Fonction pour générer les statistiques d'indexation
    function generateIndexingStats(embeddingModel, vectorStore, collectionName) {
        const dataprepData = dataManager.getPhaseData('dataprep');
        const totalChunks = dataprepData.totalChunks || Math.floor(Math.random() * 100) + 50;
        
        return {
            collectionName,
            embeddingModel,
            vectorStore,
            totalChunks,
            totalVectors: totalChunks,
            embeddingDimensions: getEmbeddingDimensions(embeddingModel),
            storageSize: Math.floor(Math.random() * 50) + 10, // MB
            indexingTime: Math.floor(Math.random() * 300) + 120, // secondes
            averageChunkSize: Math.floor(Math.random() * 200) + 150, // mots
            successRate: 100
        };
    }
    
    // Fonction pour obtenir les dimensions d'embedding
    function getEmbeddingDimensions(model) {
        const dimensions = {
            'text-embedding-ada-002': 1536,
            'text-embedding-3-small': 1536,
            'text-embedding-3-large': 3072,
            'sentence-transformers': 384
        };
        return dimensions[model] || 1536;
    }
    
    // Fonction pour afficher les statistiques d'indexation
    function displayIndexingStats(stats) {
        const statsContainer = document.getElementById('indexingStats');
        
        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Collection</h4>
                    <p class="stat-value">${stats.collectionName}</p>
                </div>
                <div class="stat-card">
                    <h4>Modèle d'embeddings</h4>
                    <p class="stat-value">${stats.embeddingModel}</p>
                </div>
                <div class="stat-card">
                    <h4>Stockage vectoriel</h4>
                    <p class="stat-value">${stats.vectorStore}</p>
                </div>
                <div class="stat-card">
                    <h4>Vecteurs créés</h4>
                    <p class="stat-value">${stats.totalVectors.toLocaleString()}</p>
                </div>
                <div class="stat-card">
                    <h4>Dimensions</h4>
                    <p class="stat-value">${stats.embeddingDimensions}</p>
                </div>
                <div class="stat-card">
                    <h4>Taille de stockage</h4>
                    <p class="stat-value">${stats.storageSize} MB</p>
                </div>
                <div class="stat-card">
                    <h4>Temps d'indexation</h4>
                    <p class="stat-value">${Math.floor(stats.indexingTime / 60)}m ${stats.indexingTime % 60}s</p>
                </div>
                <div class="stat-card">
                    <h4>Taux de succès</h4>
                    <p class="stat-value success">${stats.successRate}%</p>
                </div>
            </div>
            
            <div class="indexing-summary">
                <h4>Résumé de l'indexation</h4>
                <p>L'indexation vectorielle a été réalisée avec succès. ${stats.totalVectors} vecteurs ont été créés et stockés dans la collection "${stats.collectionName}" en utilisant le modèle ${stats.embeddingModel}.</p>
                
                <div class="next-steps">
                    <h5>Prochaines étapes :</h5>
                    <ul>
                        <li>Configuration du moteur RAG</li>
                        <li>Test des requêtes de recherche</li>
                        <li>Optimisation des paramètres de récupération</li>
                    </ul>
                </div>
            </div>
        `;
        
        statsContainer.innerHTML = html;
        
        // Ajouter les styles pour les statistiques
        const style = document.createElement('style');
        style.textContent = `
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            
            .stat-card {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                text-align: center;
            }
            
            .stat-card h4 {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--text-primary);
                margin: 0;
            }
            
            .stat-value.success {
                color: var(--success-color);
            }
            
            .indexing-summary {
                background: var(--background-color);
                padding: 2rem;
                border-radius: var(--border-radius);
                margin-top: 2rem;
            }
            
            .indexing-summary h4 {
                color: var(--text-primary);
                margin-bottom: 1rem;
            }
            
            .indexing-summary p {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            
            .next-steps {
                background: var(--surface-color);
                padding: 1.5rem;
                border-radius: var(--border-radius);
                border-left: 4px solid var(--primary-color);
            }
            
            .next-steps h5 {
                color: var(--text-primary);
                margin-bottom: 1rem;
            }
            
            .next-steps ul {
                color: var(--text-secondary);
                padding-left: 1.5rem;
            }
            
            .next-steps li {
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fonction pour charger les données existantes
    function loadExistingData() {
        const existingData = dataManager.getPhaseData('indexation');
        
        if (existingData.status === 'completed') {
            // Afficher les résultats existants
            displayIndexingStats(existingData.stats);
            indexingResults.style.display = 'block';
            startIndexingBtn.style.display = 'none';
            
            Utils.showInfo('Indexation précédente chargée');
        } else if (Object.keys(existingData).length > 0) {
            // Restaurer la configuration
            if (existingData.embeddingModel) {
                document.getElementById('embeddingModel').value = existingData.embeddingModel;
            }
            if (existingData.vectorStore) {
                document.getElementById('vectorStore').value = existingData.vectorStore;
            }
            if (existingData.collectionName) {
                document.getElementById('collectionName').value = existingData.collectionName;
            }
        }
    }
    
    // Génération automatique du nom de collection
    const collectionNameField = document.getElementById('collectionName');
    if (collectionNameField && !collectionNameField.value) {
        const analyseData = dataManager.getPhaseData('analyse');
        if (analyseData.entreprise) {
            const baseName = analyseData.entreprise.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            collectionNameField.value = `${baseName}-documents-${new Date().getFullYear()}`;
        }
    }
    
    console.log('Module Indexation initialisé');
});
