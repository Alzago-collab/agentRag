// RAGBuilder Assistant - Logique de l'étape Analyse

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('analyseForm');
    const backBtn = document.getElementById('backBtn');
    
    // Charger les données existantes
    loadExistingData();
    
    // Gestionnaire de soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (Utils.validateForm(form)) {
            const formData = collectFormData();
            dataManager.updatePhase('analyse', formData);
            
            Utils.showSuccess('Données d\'analyse sauvegardées !');
            
            // Rediriger vers la page suivante
            setTimeout(() => {
                window.location.href = 'dataprep.html';
            }, 1000);
        } else {
            Utils.showError('Veuillez remplir tous les champs obligatoires.');
        }
    });
    
    // Bouton retour
    backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Fonction pour collecter les données du formulaire
    function collectFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Collecter les champs simples
        for (let [key, value] of formData.entries()) {
            if (key === 'sources') {
                // Gérer les cases à cocher multiples
                if (!data.sources) data.sources = [];
                data.sources.push(value);
            } else {
                data[key] = value;
            }
        }
        
        // Ajouter des métadonnées
        data.timestamp = new Date().toISOString();
        data.phase = 'analyse';
        
        return data;
    }
    
    // Fonction pour charger les données existantes
    function loadExistingData() {
        const existingData = dataManager.getPhaseData('analyse');
        
        if (Object.keys(existingData).length > 0) {
            // Remplir le formulaire avec les données existantes
            Object.keys(existingData).forEach(key => {
                if (key === 'sources' && Array.isArray(existingData[key])) {
                    // Gérer les cases à cocher
                    existingData[key].forEach(source => {
                        const checkbox = form.querySelector(`input[name="sources"][value="${source}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                } else if (key !== 'timestamp' && key !== 'phase') {
                    const element = form.querySelector(`[name="${key}"]`);
                    if (element) {
                        element.value = existingData[key];
                    }
                }
            });
            
            Utils.showInfo('Données précédentes chargées');
        }
    }
    
    // Validation en temps réel
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
            } else {
                this.classList.add('error');
            }
        });
        
        field.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
            }
        });
    });
    
    // Sauvegarde automatique des données
    const autoSave = Utils.debounce(function() {
        const formData = collectFormData();
        dataManager.updatePhase('analyse', formData);
    }, 2000);
    
    form.addEventListener('input', autoSave);
    form.addEventListener('change', autoSave);
    
    // Gestionnaire de changement de type de base vectorielle
    const vectorDbTypeSelect = document.getElementById('vectorDbType');
    const pineconeConfig = document.getElementById('pineconeConfig');
    const weaviateConfig = document.getElementById('weaviateConfig');
    
    if (vectorDbTypeSelect) {
        vectorDbTypeSelect.addEventListener('change', function() {
            // Masquer toutes les configurations
            if (pineconeConfig) pineconeConfig.style.display = 'none';
            if (weaviateConfig) weaviateConfig.style.display = 'none';
            
            // Afficher la configuration appropriée
            if (this.value === 'pinecone' && pineconeConfig) {
                pineconeConfig.style.display = 'block';
            } else if (this.value === 'weaviate' && weaviateConfig) {
                weaviateConfig.style.display = 'block';
            }
        });
    }
    
    // Génération automatique du nom de collection
    const entrepriseField = document.getElementById('entreprise');
    const collectionNameField = document.getElementById('collectionName');
    
    if (entrepriseField && collectionNameField) {
        entrepriseField.addEventListener('input', function() {
            if (this.value.trim() && !collectionNameField.value.trim()) {
                const baseName = this.value.toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                collectionNameField.value = `${baseName}-documents-${new Date().getFullYear()}`;
            }
        });
    }
    
    // Aide contextuelle
    const helpElements = document.querySelectorAll('[data-help]');
    helpElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const helpText = this.getAttribute('data-help');
            showTooltip(this, helpText);
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
    
    function showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #1e293b;
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            z-index: 1000;
            max-width: 200px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
    }
    
    function hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    console.log('Module Analyse initialisé');
});
