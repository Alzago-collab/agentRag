// RAGBuilder Assistant - JavaScript principal

// Configuration globale
const CONFIG = {
    storageKey: 'ragbuilder-data',
    currentPhase: 0,
    phases: [
        { name: 'Accueil', file: 'index.html' },
        { name: 'Analyse', file: 'analyse.html' },
        { name: 'Préparation', file: 'dataprep.html' },
        { name: 'Indexation', file: 'indexation.html' },
        { name: 'Moteur RAG', file: 'moteur.html' },
        { name: 'Interface', file: 'interface.html' },
        { name: 'Finalisation', file: 'recap.html' }
    ]
};

// Gestion des données
class DataManager {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem(CONFIG.storageKey);
        return stored ? JSON.parse(stored) : {
            analyse: {},
            dataprep: {},
            indexation: {},
            moteur: {},
            interface: {},
            recap: {}
        };
    }

    saveData() {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.data));
    }

    updatePhase(phase, data) {
        this.data[phase] = { ...this.data[phase], ...data };
        this.saveData();
    }

    getPhaseData(phase) {
        return this.data[phase] || {};
    }

    clearData() {
        localStorage.removeItem(CONFIG.storageKey);
        this.data = {
            analyse: {},
            dataprep: {},
            indexation: {},
            moteur: {},
            interface: {},
            recap: {}
        };
    }
}

// Instance globale du gestionnaire de données
const dataManager = new DataManager();

// Utilitaires
const Utils = {
    // Animation de chargement
    showLoading(element, text = 'Chargement...') {
        element.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${text}</p>
            </div>
        `;
    },

    // Message de succès
    showSuccess(message) {
        this.showNotification(message, 'success');
    },

    // Message d'erreur
    showError(message) {
        this.showNotification(message, 'error');
    },

    // Message d'information
    showInfo(message) {
        this.showNotification(message, 'info');
    },

    // Notification générique
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Validation de formulaire
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    },

    // Formatage de taille de fichier
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Génération d'ID unique
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce pour les événements
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Gestionnaire de navigation
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename || 'index.html';
    }

    init() {
        this.setupEventListeners();
        this.updateProgressBar();
    }

    setupEventListeners() {
        // Bouton de démarrage
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.navigateTo('analyse.html');
            });
        }

        // Boutons de retour
        const backBtns = document.querySelectorAll('#backBtn');
        backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.goBack();
            });
        });

        // Boutons de continuation
        const continueBtns = document.querySelectorAll('#continueBtn');
        continueBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.goNext();
            });
        });
    }

    navigateTo(page) {
        window.location.href = page;
    }

    goBack() {
        const currentIndex = CONFIG.phases.findIndex(phase => phase.file === this.currentPage);
        if (currentIndex > 0) {
            this.navigateTo(CONFIG.phases[currentIndex - 1].file);
        }
    }

    goNext() {
        const currentIndex = CONFIG.phases.findIndex(phase => phase.file === this.currentPage);
        if (currentIndex < CONFIG.phases.length - 1) {
            this.navigateTo(CONFIG.phases[currentIndex + 1].file);
        }
    }

    updateProgressBar() {
        const progressBar = document.querySelector('.progress');
        if (progressBar) {
            const currentIndex = CONFIG.phases.findIndex(phase => phase.file === this.currentPage);
            const progress = ((currentIndex + 1) / CONFIG.phases.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
}

// Gestionnaire de fichiers
class FileManager {
    constructor() {
        this.files = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['.pdf', '.docx', '.txt', '.md'];
    }

    validateFile(file) {
        const isValidSize = file.size <= this.maxFileSize;
        const isValidType = this.allowedTypes.some(type => 
            file.name.toLowerCase().endsWith(type)
        );
        
        return {
            valid: isValidSize && isValidType,
            errors: {
                size: !isValidSize ? `Fichier trop volumineux (max ${Utils.formatFileSize(this.maxFileSize)})` : null,
                type: !isValidType ? `Type de fichier non supporté` : null
            }
        };
    }

    addFile(file) {
        const validation = this.validateFile(file);
        if (validation.valid) {
            const fileData = {
                id: Utils.generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file,
                status: 'pending'
            };
            this.files.push(fileData);
            return { success: true, file: fileData };
        } else {
            return { success: false, errors: validation.errors };
        }
    }

    removeFile(fileId) {
        this.files = this.files.filter(file => file.id !== fileId);
    }

    getFiles() {
        return this.files;
    }

    clearFiles() {
        this.files = [];
    }
}

// Gestionnaire de simulation RAG
class RAGSimulator {
    constructor() {
        this.mockDocuments = [
            {
                id: 1,
                content: "Notre politique de remboursement permet aux clients de retourner les produits dans un délai de 30 jours après l'achat. Les produits doivent être en bon état et dans leur emballage d'origine.",
                source: "Politique de remboursement.pdf",
                score: 0.95
            },
            {
                id: 2,
                content: "Pour effectuer un remboursement, vous devez contacter notre service client par email ou téléphone. Un numéro de retour vous sera fourni pour suivre votre demande.",
                source: "Guide client.pdf",
                score: 0.87
            },
            {
                id: 3,
                content: "Les remboursements sont traités dans un délai de 5 à 7 jours ouvrables après réception du produit retourné. Le montant sera crédité sur votre compte bancaire.",
                source: "Processus de retour.pdf",
                score: 0.82
            }
        ];
    }

    async searchDocuments(query, topK = 5) {
        // Simulation d'une recherche vectorielle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return this.mockDocuments
            .map(doc => ({
                ...doc,
                score: Math.random() * 0.3 + 0.7 // Score simulé entre 0.7 et 1.0
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    async generateResponse(query, context, config) {
        // Simulation d'une génération de réponse
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const systemPrompt = config.systemPrompt || "Vous êtes un assistant IA utile.";
        const userPrompt = config.userPromptTemplate
            .replace('{context}', context)
            .replace('{question}', query);
        
        // Réponse simulée basée sur le contexte
        const responses = [
            "Basé sur les informations disponibles, je peux vous dire que...",
            "D'après la documentation fournie, voici ce que je peux vous expliquer...",
            "En me basant sur les documents, voici la réponse à votre question..."
        ];
        
        return {
            response: responses[Math.floor(Math.random() * responses.length)] + 
                     " " + context.split('.')[0] + "...",
            sources: context.split('\n').slice(0, 3),
            tokens: Math.floor(Math.random() * 200) + 100
        };
    }
}

// Instance globale du simulateur RAG
const ragSimulator = new RAGSimulator();

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le gestionnaire de navigation
    new NavigationManager();
    
    // Ajouter les styles pour les notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-success {
            background-color: var(--success-color);
        }
        
        .notification-error {
            background-color: var(--error-color);
        }
        
        .notification-info {
            background-color: var(--primary-color);
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            border-color: var(--error-color) !important;
            box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1) !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('RAGBuilder Assistant initialisé');
});
