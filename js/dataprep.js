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
            timestamp: new Date().toISOString()
        });
        
        // Simuler le traitement
        Utils.showLoading(processBtn, 'Traitement en cours...');
        
        try {
            const results = await simulateDocumentProcessing(files, chunkSize, overlap);
            
            displayProcessingResults(results);
            resultsSection.style.display = 'block';
            
            Utils.showSuccess('Documents traités avec succès !');
            
        } catch (error) {
            Utils.showError('Erreur lors du traitement des documents');
            console.error(error);
        } finally {
            processBtn.innerHTML = 'Traiter les documents';
        }
    }
    
    // Simulation du traitement de documents
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
