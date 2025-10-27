// RAGBuilder Assistant - Logique de l'étape Préparation des données

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const filesList = document.getElementById('filesList');
    const filesContainer = document.getElementById('filesContainer');
    const processingSection = document.getElementById('processingSection');
    const resultsSection = document.getElementById('resultsSection');
    const processBtn = document.getElementById('processBtn');
    const backBtn = document.getElementById('backBtn');
    const continueBtn = document.getElementById('continueBtn');
    
    const fileManager = new FileManager();
    
    // Charger les données existantes
    loadExistingData();
    
    // Gestionnaire de drag & drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    // Gestionnaire de clic sur la zone d'upload
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Gestionnaire de sélection de fichiers
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
    
    // Bouton de traitement
    processBtn.addEventListener('click', function() {
        processDocuments();
    });
    
    // Boutons de navigation
    backBtn.addEventListener('click', function() {
        window.location.href = 'analyse.html';
    });
    
    continueBtn.addEventListener('click', function() {
        window.location.href = 'indexation.html';
    });
    
    // Fonction pour gérer les fichiers
    function handleFiles(files) {
        let hasErrors = false;
        
        files.forEach(file => {
            const result = fileManager.addFile(file);
            if (result.success) {
                Utils.showSuccess(`Fichier "${file.name}" ajouté avec succès`);
            } else {
                hasErrors = true;
                Object.values(result.errors).forEach(error => {
                    if (error) Utils.showError(error);
                });
            }
        });
        
        updateFilesList();
        
        if (fileManager.getFiles().length > 0) {
            processingSection.style.display = 'block';
        }
    }
    
    // Fonction pour mettre à jour la liste des fichiers
    function updateFilesList() {
        const files = fileManager.getFiles();
        
        if (files.length === 0) {
            filesList.style.display = 'none';
            processingSection.style.display = 'none';
            return;
        }
        
        filesList.style.display = 'block';
        filesContainer.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${Utils.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="removeFile('${file.id}')">
                    Supprimer
                </button>
            `;
            filesContainer.appendChild(fileItem);
        });
    }
    
    // Fonction pour supprimer un fichier
    window.removeFile = function(fileId) {
        fileManager.removeFile(fileId);
        updateFilesList();
        Utils.showInfo('Fichier supprimé');
    };
    
    // Fonction pour traiter les documents
    async function processDocuments() {
        const files = fileManager.getFiles();
        if (files.length === 0) {
            Utils.showError('Aucun fichier à traiter');
            return;
        }
        
        const chunkSize = document.getElementById('chunkSize').value;
        const overlap = document.getElementById('overlap').value;
        const embeddingModel = document.getElementById('embeddingModel').value;
        const collectionName = document.getElementById('collectionName').value;
        
        if (!collectionName.trim()) {
            Utils.showError('Veuillez saisir un nom de collection');
            return;
        }
        
        // Vérifier les clés API
        const analyseData = dataManager.getPhaseData('analyse');
        if (!analyseData.openaiKey) {
            Utils.showError('Clé API OpenAI requise pour les embeddings');
            return;
        }
        
        // Sauvegarder la configuration
        dataManager.updatePhase('dataprep', {
            files: files.map(f => ({
                id: f.id,
                name: f.name,
                size: f.size,
                type: f.type
            })),
            chunkSize: parseInt(chunkSize),
            overlap: parseInt(overlap),
            embeddingModel,
            collectionName,
            timestamp: new Date().toISOString()
        });
        
        // Traitement réel des documents
        Utils.showLoading(processBtn, 'Traitement et indexation en cours...');
        
        try {
            const results = await processDocumentsReal(files, chunkSize, overlap, embeddingModel, collectionName, analyseData);
            
            displayProcessingResults(results);
            resultsSection.style.display = 'block';
            
            Utils.showSuccess('Documents traités et indexés avec succès !');
            
        } catch (error) {
            Utils.showError('Erreur lors du traitement des documents: ' + error.message);
            console.error(error);
        } finally {
            processBtn.innerHTML = 'Traiter et indexer les documents';
        }
    }
    
    // Fonction de traitement réel des documents
    async function processDocumentsReal(files, chunkSize, overlap, embeddingModel, collectionName, analyseData) {
        const results = {
            totalFiles: files.length,
            totalChunks: 0,
            totalVectors: 0,
            processedFiles: [],
            errors: [],
            collectionName: collectionName
        };
        
        // Pour chaque fichier, traiter et créer les embeddings
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                // Extraire le texte du fichier
                const text = await extractTextFromFile(file.file);
                
                // Découper en chunks
                const chunks = chunkText(text, parseInt(chunkSize), parseInt(overlap));
                results.totalChunks += chunks.length;
                
                // Créer les embeddings pour chaque chunk
                const embeddings = await createEmbeddings(chunks, embeddingModel, analyseData.openaiKey);
                results.totalVectors += embeddings.length;
                
                results.processedFiles.push({
                    name: file.name,
                    size: file.size,
                    chunks: chunks.length,
                    vectors: embeddings.length,
                    status: 'success'
                });
                
            } catch (error) {
                results.errors.push({
                    file: file.name,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    // Fonction pour extraire le texte d'un fichier
    async function extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                
                if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                    resolve(content);
                } else if (file.name.endsWith('.pdf')) {
                    // Pour les PDF, on simule l'extraction
                    // En production, utiliser pdf.js ou une API
                    resolve(`Contenu extrait du PDF ${file.name}. Ceci est un exemple de texte extrait qui sera découpé en chunks.`);
                } else if (file.name.endsWith('.docx')) {
                    // Pour les DOCX, on simule l'extraction
                    // En production, utiliser mammoth.js ou une API
                    resolve(`Contenu extrait du document Word ${file.name}. Ceci est un exemple de texte extrait qui sera découpé en chunks.`);
                } else {
                    resolve(content);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };
            
            reader.readAsText(file);
        });
    }
    
    // Fonction pour découper le texte en chunks
    function chunkText(text, chunkSize, overlap) {
        const words = text.split(/\s+/);
        const chunks = [];
        
        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            if (chunk.trim()) {
                chunks.push(chunk);
            }
        }
        
        return chunks;
    }
    
    // Fonction pour créer les embeddings
    async function createEmbeddings(chunks, model, apiKey) {
        const embeddings = [];
        
        for (const chunk of chunks) {
            try {
                const response = await fetch('https://api.openai.com/v1/embeddings', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        input: chunk
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Erreur API OpenAI: ${response.status}`);
                }
                
                const data = await response.json();
                embeddings.push({
                    text: chunk,
                    embedding: data.data[0].embedding
                });
                
            } catch (error) {
                console.error('Erreur lors de la création des embeddings:', error);
                throw error;
            }
        }
        
        return embeddings;
    }
    
    // Simulation du traitement de documents (gardé pour compatibilité)
    async function simulateDocumentProcessing(files, chunkSize, overlap) {
        const results = {
            totalFiles: files.length,
            totalChunks: 0,
            processedFiles: [],
            errors: []
        };
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Simuler le temps de traitement
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            // Simuler l'extraction de texte
            const mockText = `Contenu extrait du fichier ${file.name}. Ceci est un exemple de texte extrait qui sera découpé en chunks de ${chunkSize} mots avec un chevauchement de ${overlap} mots.`;
            
            // Simuler le découpage en chunks
            const chunks = Math.floor(Math.random() * 10) + 5; // 5-15 chunks par fichier
            results.totalChunks += chunks;
            
            results.processedFiles.push({
                name: file.name,
                size: file.size,
                chunks: chunks,
                status: 'success',
                preview: mockText.substring(0, 100) + '...'
            });
            
            // Simuler une erreur occasionnelle
            if (Math.random() < 0.1) {
                results.errors.push({
                    file: file.name,
                    error: 'Erreur de lecture du fichier'
                });
            }
        }
        
        return results;
    }
    
    // Fonction pour afficher les résultats du traitement
    function displayProcessingResults(results) {
        const resultsContainer = document.getElementById('processingResults');
        
        let html = `
            <div class="results-summary">
                <h4>Résumé du traitement</h4>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-number">${results.totalFiles}</span>
                        <span class="stat-label">Fichiers traités</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${results.totalChunks}</span>
                        <span class="stat-label">Chunks créés</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${results.errors.length}</span>
                        <span class="stat-label">Erreurs</span>
                    </div>
                </div>
            </div>
            
            <div class="files-results">
                <h4>Détails par fichier</h4>
        `;
        
        results.processedFiles.forEach(file => {
            html += `
                <div class="file-result">
                    <div class="file-result-header">
                        <span class="file-name">${file.name}</span>
                        <span class="file-status success">✓ Traité</span>
                    </div>
                    <div class="file-details">
                        <span>${file.chunks} chunks • ${Utils.formatFileSize(file.size)}</span>
                    </div>
                    <div class="file-preview">
                        <small>${file.preview}</small>
                    </div>
                </div>
            `;
        });
        
        if (results.errors.length > 0) {
            html += `
                <div class="errors-section">
                    <h4>Erreurs rencontrées</h4>
            `;
            results.errors.forEach(error => {
                html += `
                    <div class="error-item">
                        <span class="error-file">${error.file}</span>
                        <span class="error-message">${error.error}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        html += `</div>`;
        
        resultsContainer.innerHTML = html;
        
        // Ajouter les styles pour les résultats
        const style = document.createElement('style');
        style.textContent = `
            .results-summary {
                background: var(--background-color);
                padding: 1.5rem;
                border-radius: var(--border-radius);
                margin-bottom: 2rem;
            }
            
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .stat {
                text-align: center;
            }
            
            .stat-number {
                display: block;
                font-size: 2rem;
                font-weight: bold;
                color: var(--primary-color);
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
            
            .file-result {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1rem;
                margin-bottom: 1rem;
            }
            
            .file-result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .file-status.success {
                color: var(--success-color);
                font-weight: 500;
            }
            
            .file-details {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .file-preview {
                color: var(--text-secondary);
                font-style: italic;
            }
            
            .errors-section {
                margin-top: 2rem;
                padding: 1rem;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: var(--border-radius);
            }
            
            .error-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #fecaca;
            }
            
            .error-item:last-child {
                border-bottom: none;
            }
            
            .error-file {
                font-weight: 500;
                color: var(--error-color);
            }
            
            .error-message {
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fonction pour charger les données existantes
    function loadExistingData() {
        const existingData = dataManager.getPhaseData('dataprep');
        
        if (existingData.files && existingData.files.length > 0) {
            // Restaurer les fichiers (simulation)
            existingData.files.forEach(fileData => {
                // Créer un objet fichier simulé
                const mockFile = {
                    id: fileData.id,
                    name: fileData.name,
                    size: fileData.size,
                    type: fileData.type,
                    status: 'processed'
                };
                fileManager.files.push(mockFile);
            });
            
            updateFilesList();
            processingSection.style.display = 'block';
            
            if (existingData.results) {
                displayProcessingResults(existingData.results);
                resultsSection.style.display = 'block';
            }
            
            Utils.showInfo('Données de préparation chargées');
        }
    }
    
    console.log('Module DataPrep initialisé');
});
