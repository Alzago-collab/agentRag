// RAGBuilder Assistant - Logique de l'étape Finalisation

document.addEventListener('DOMContentLoaded', function() {
    const summaryGrid = document.getElementById('summaryGrid');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportZipBtn = document.getElementById('exportZipBtn');
    const exportDockerBtn = document.getElementById('exportDockerBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const restartBtn = document.getElementById('restartBtn');
    const deploymentInstructions = document.getElementById('deploymentInstructions');
    
    // Charger et afficher le récapitulatif
    loadSummary();
    loadDeploymentInstructions();
    
    // Gestionnaires d'export
    exportJsonBtn.addEventListener('click', function() {
        exportConfiguration('json');
    });
    
    exportZipBtn.addEventListener('click', function() {
        exportConfiguration('zip');
    });
    
    exportDockerBtn.addEventListener('click', function() {
        exportConfiguration('docker');
    });
    
    downloadAllBtn.addEventListener('click', function() {
        downloadAll();
    });
    
    restartBtn.addEventListener('click', function() {
        restartProcess();
    });
    
    // Fonction pour charger et afficher le récapitulatif
    function loadSummary() {
        const allData = dataManager.data;
        const summaryItems = [];
        
        // Phase 1 - Analyse
        if (allData.analyse.entreprise) {
            summaryItems.push({
                title: 'Entreprise',
                content: allData.analyse.entreprise,
                phase: 'Analyse'
            });
        }
        
        if (allData.analyse.casUsage) {
            summaryItems.push({
                title: 'Cas d\'usage',
                content: allData.analyse.casUsage,
                phase: 'Analyse'
            });
        }
        
        if (allData.analyse.sources && allData.analyse.sources.length > 0) {
            summaryItems.push({
                title: 'Sources de données',
                content: allData.analyse.sources.join(', '),
                phase: 'Analyse'
            });
        }
        
        // Phase 2 - Préparation
        if (allData.dataprep.files && allData.dataprep.files.length > 0) {
            summaryItems.push({
                title: 'Fichiers traités',
                content: `${allData.dataprep.files.length} fichiers`,
                phase: 'Préparation'
            });
        }
        
        if (allData.dataprep.totalChunks) {
            summaryItems.push({
                title: 'Chunks créés',
                content: `${allData.dataprep.totalChunks} chunks`,
                phase: 'Préparation'
            });
        }
        
        // Phase 3 - Indexation
        if (allData.indexation.collectionName) {
            summaryItems.push({
                title: 'Collection vectorielle',
                content: allData.indexation.collectionName,
                phase: 'Indexation'
            });
        }
        
        if (allData.indexation.embeddingModel) {
            summaryItems.push({
                title: 'Modèle d\'embeddings',
                content: allData.indexation.embeddingModel,
                phase: 'Indexation'
            });
        }
        
        if (allData.indexation.stats) {
            summaryItems.push({
                title: 'Vecteurs créés',
                content: `${allData.indexation.stats.totalVectors.toLocaleString()} vecteurs`,
                phase: 'Indexation'
            });
        }
        
        // Phase 4 - Moteur RAG
        if (allData.moteur.llmModel) {
            summaryItems.push({
                title: 'Modèle de génération',
                content: allData.moteur.llmModel,
                phase: 'Moteur RAG'
            });
        }
        
        if (allData.moteur.temperature !== undefined) {
            summaryItems.push({
                title: 'Température',
                content: allData.moteur.temperature,
                phase: 'Moteur RAG'
            });
        }
        
        // Phase 5 - Interface
        if (allData.interface.theme) {
            summaryItems.push({
                title: 'Thème d\'interface',
                content: allData.interface.theme,
                phase: 'Interface'
            });
        }
        
        if (allData.interface.deploymentType) {
            summaryItems.push({
                title: 'Type de déploiement',
                content: allData.interface.deploymentType,
                phase: 'Interface'
            });
        }
        
        // Afficher le récapitulatif
        displaySummary(summaryItems);
    }
    
    // Fonction pour afficher le récapitulatif
    function displaySummary(items) {
        if (items.length === 0) {
            summaryGrid.innerHTML = '<p>Aucune donnée à afficher</p>';
            return;
        }
        
        const html = items.map(item => `
            <div class="summary-item">
                <h4>${item.title}</h4>
                <p>${item.content}</p>
                <span class="phase-badge">${item.phase}</span>
            </div>
        `).join('');
        
        summaryGrid.innerHTML = html;
        
        // Ajouter les styles pour le récapitulatif
        const style = document.createElement('style');
        style.textContent = `
            .summary-item {
                position: relative;
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                transition: var(--transition);
            }
            
            .summary-item:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }
            
            .summary-item h4 {
                color: var(--text-primary);
                margin-bottom: 0.5rem;
                font-size: 1.1rem;
            }
            
            .summary-item p {
                color: var(--text-secondary);
                margin-bottom: 1rem;
                line-height: 1.5;
            }
            
            .phase-badge {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: var(--primary-color);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.8rem;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fonction pour charger les instructions de déploiement
    function loadDeploymentInstructions() {
        const deploymentType = dataManager.getPhaseData('interface').deploymentType || 'static';
        
        const instructions = getDeploymentInstructions(deploymentType);
        deploymentInstructions.innerHTML = instructions;
    }
    
    // Fonction pour obtenir les instructions de déploiement
    function getDeploymentInstructions(type) {
        const instructions = {
            static: `
                <h4>Déploiement sur site statique</h4>
                <ol>
                    <li>Téléchargez le fichier ZIP du projet</li>
                    <li>Extrayez les fichiers sur votre serveur web</li>
                    <li>Configurez votre serveur pour servir les fichiers statiques</li>
                    <li>Assurez-vous que votre domaine pointe vers le bon répertoire</li>
                    <li>Testez l'accès à votre chatbot</li>
                </ol>
                <p><strong>Plateformes recommandées :</strong> GitHub Pages, Netlify, Vercel</p>
            `,
            docker: `
                <h4>Déploiement avec Docker</h4>
                <ol>
                    <li>Téléchargez le fichier Docker du projet</li>
                    <li>Construisez l'image : <code>docker build -t rag-chatbot .</code></li>
                    <li>Lancez le conteneur : <code>docker run -p 8000:8000 rag-chatbot</code></li>
                    <li>Configurez votre reverse proxy (nginx, traefik)</li>
                    <li>Testez l'accès à votre chatbot</li>
                </ol>
                <p><strong>Avantages :</strong> Isolation, scalabilité, facilité de déploiement</p>
            `,
            cloud: `
                <h4>Déploiement sur le cloud</h4>
                <ol>
                    <li>Choisissez votre fournisseur cloud (AWS, Azure, GCP)</li>
                    <li>Créez une instance de serveur</li>
                    <li>Installez Docker et les dépendances</li>
                    <li>Déployez votre chatbot</li>
                    <li>Configurez le DNS et les certificats SSL</li>
                </ol>
                <p><strong>Services recommandés :</strong> AWS EC2, Azure Container Instances, GCP Cloud Run</p>
            `,
            local: `
                <h4>Déploiement local</h4>
                <ol>
                    <li>Installez Node.js et npm sur votre serveur</li>
                    <li>Téléchargez et extrayez le projet</li>
                    <li>Installez les dépendances : <code>npm install</code></li>
                    <li>Lancez le serveur : <code>npm start</code></li>
                    <li>Configurez votre pare-feu et routeur</li>
                </ol>
                <p><strong>Avantages :</strong> Contrôle total, coût réduit</p>
            `
        };
        
        return instructions[type] || instructions.static;
    }
    
    // Fonction pour exporter la configuration
    function exportConfiguration(type) {
        const allData = dataManager.data;
        const timestamp = new Date().toISOString().split('T')[0];
        
        switch (type) {
            case 'json':
                exportJSON(allData, timestamp);
                break;
            case 'zip':
                exportZIP(allData, timestamp);
                break;
            case 'docker':
                exportDocker(allData, timestamp);
                break;
        }
    }
    
    // Fonction pour exporter en JSON
    function exportJSON(data, timestamp) {
        const config = {
            metadata: {
                version: '1.0',
                createdAt: new Date().toISOString(),
                projectName: data.analyse.entreprise || 'RAG-Chatbot'
            },
            configuration: data
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rag-config-${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        Utils.showSuccess('Configuration JSON exportée !');
    }
    
    // Fonction pour exporter en ZIP
    function exportZIP(data, timestamp) {
        // Simulation d'export ZIP
        Utils.showInfo('Génération du projet complet...');
        
        setTimeout(() => {
            const zipContent = generateZIPContent(data);
            const blob = new Blob([zipContent], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rag-chatbot-${timestamp}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            
            Utils.showSuccess('Projet ZIP exporté !');
        }, 2000);
    }
    
    // Fonction pour exporter Docker
    function exportDocker(data, timestamp) {
        const dockerConfig = generateDockerConfig(data);
        
        const blob = new Blob([dockerConfig], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Dockerfile-${timestamp}`;
        a.click();
        URL.revokeObjectURL(url);
        
        Utils.showSuccess('Configuration Docker exportée !');
    }
    
    // Fonction pour générer le contenu ZIP
    function generateZIPContent(data) {
        // Simulation du contenu ZIP
        return `# RAG Chatbot Project
        
## Configuration
- Entreprise: ${data.analyse.entreprise || 'Non défini'}
- Modèle: ${data.moteur.llmModel || 'Non défini'}
- Thème: ${data.interface.theme || 'Non défini'}

## Installation
1. npm install
2. npm start

## Configuration
Copiez le fichier rag-config.json dans le dossier config/
`;
    }
    
    // Fonction pour générer la configuration Docker
    function generateDockerConfig(data) {
        return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
`;
    }
    
    // Fonction pour télécharger tout
    function downloadAll() {
        Utils.showInfo('Préparation de tous les fichiers...');
        
        setTimeout(() => {
            exportConfiguration('json');
            setTimeout(() => exportConfiguration('zip'), 500);
            setTimeout(() => exportConfiguration('docker'), 1000);
            
            Utils.showSuccess('Tous les fichiers ont été téléchargés !');
        }, 1000);
    }
    
    // Fonction pour redémarrer le processus
    function restartProcess() {
        if (confirm('Êtes-vous sûr de vouloir recommencer ? Toutes les données seront perdues.')) {
            dataManager.clearData();
            window.location.href = 'index.html';
        }
    }
    
    // Génération automatique des liens de documentation
    generateDocumentationLinks();
    
    function generateDocumentationLinks() {
        const methodologyLink = document.getElementById('methodologyLink');
        const checklistLink = document.getElementById('checklistLink');
        const apiDocLink = document.getElementById('apiDocLink');
        
        if (methodologyLink) {
            methodologyLink.addEventListener('click', function(e) {
                e.preventDefault();
                generateMethodologyDoc();
            });
        }
        
        if (checklistLink) {
            checklistLink.addEventListener('click', function(e) {
                e.preventDefault();
                generateChecklistDoc();
            });
        }
        
        if (apiDocLink) {
            apiDocLink.addEventListener('click', function(e) {
                e.preventDefault();
                generateAPIDoc();
            });
        }
    }
    
    function generateMethodologyDoc() {
        const doc = `# Méthodologie RAGBuilder Assistant

## Vue d'ensemble
Cette méthodologie guide la création de chatbots RAG en 6 phases structurées.

## Phase 1 - Analyse
- Définir les objectifs
- Identifier les sources de données
- Déterminer le ton de communication

## Phase 2 - Préparation
- Extraire le contenu des documents
- Nettoyer et structurer les données
- Découper en chunks appropriés

## Phase 3 - Indexation
- Générer les embeddings
- Stocker dans une base vectorielle
- Optimiser les performances

## Phase 4 - Moteur RAG
- Configurer le modèle de génération
- Définir les templates de prompts
- Tester la qualité des réponses

## Phase 5 - Interface
- Personnaliser l'apparence
- Configurer le déploiement
- Tester l'expérience utilisateur

## Phase 6 - Finalisation
- Exporter la configuration
- Documenter le projet
- Planifier la maintenance
`;
        
        downloadDocument(doc, 'methodologie-ragbuilder.md');
    }
    
    function generateChecklistDoc() {
        const doc = `# Checklist Projet RAG

## Phase 1 - Analyse
- [ ] Nom de l'entreprise défini
- [ ] Cas d'usage identifié
- [ ] Sources de données listées
- [ ] Ton de communication choisi

## Phase 2 - Préparation
- [ ] Fichiers uploadés
- [ ] Documents traités
- [ ] Chunks créés
- [ ] Métadonnées ajoutées

## Phase 3 - Indexation
- [ ] Modèle d'embeddings sélectionné
- [ ] Collection vectorielle créée
- [ ] Vecteurs générés
- [ ] Indexation terminée

## Phase 4 - Moteur RAG
- [ ] Modèle de génération configuré
- [ ] Prompts définis
- [ ] Test de qualité effectué
- [ ] Paramètres optimisés

## Phase 5 - Interface
- [ ] Thème appliqué
- [ ] Interface testée
- [ ] Déploiement configuré
- [ ] Domaine configuré

## Phase 6 - Finalisation
- [ ] Configuration exportée
- [ ] Documentation générée
- [ ] Instructions de déploiement créées
- [ ] Plan de maintenance établi
`;
        
        downloadDocument(doc, 'checklist-projet.md');
    }
    
    function generateAPIDoc() {
        const doc = `# Documentation API RAG Chatbot

## Endpoints

### POST /chat
Envoie un message au chatbot

**Paramètres:**
- message (string): Le message de l'utilisateur
- session_id (string, optionnel): ID de session

**Réponse:**
\`\`\`json
{
  "response": "Réponse du chatbot",
  "sources": ["source1.pdf", "source2.pdf"],
  "session_id": "abc123"
}
\`\`\`

### GET /health
Vérifie l'état du service

**Réponse:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z"
}
\`\`\`
`;
        
        downloadDocument(doc, 'api-documentation.md');
    }
    
    function downloadDocument(content, filename) {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        Utils.showSuccess(`Documentation "${filename}" téléchargée !`);
    }
    
    console.log('Module Finalisation initialisé');
});
