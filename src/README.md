# src

Ce dossier contient le code source principal :

- Les modules de logique métier (RAG, agents, moteurs, etc.)
- L’intégration avec les modèles de LLM
- Les pipelines de récupération et de génération

## Modules présents
- agent.js (orchestrateur session, logs)
- moteur.js (pipeline RAG)
- indexation.js (découpe et vectorisation)
- ui.js (gestion interface utilisateur)

## Étapes
- [x] Définir la structure des modules (agent, moteur, pipelines)
- [x] Créer les modules JS principaux
- [x] Implémenter le pipeline principal du moteur RAG (processRAGQuestion)
- [x] UI utilisateur complète connectée au moteur (template.html + style + ui.js)
- [x] Gestion historique conversation (localStorage)
- [x] Structure agent.js (init, logs, début orchestrateur pipeline)
- [x] Premières fonctions indexation.js (chunk + vectorise)
- [ ] Pipeline agent/chat avancé, indexation auto multi-docs, feedback utilisateur

---

### Plan pour la suite :
- Finaliser agent.js pour analytics/profil + intégration directe avec le moteur
- Développer pipelineIndexationAuto (batch, multi-fichiers, export vectorStore)
- Ajouter feedback utilisateur, monitoring, adaptation dynamique
- Documenter chaque module

## 🚩 TODO moteur RAG (`moteur.js`)
- [x] Créer squelette du fichier
- [x] Fonction obtenir embedding (API Ollama)
- [x] Charger les vecteurs locaux (JSON)
- [x] Calculer similarité cosinus
- [x] Sélection des passages top-k
- [x] Préparer/construire le prompt pour LLM
- [x] Interroger API génération
- [x] Exporter la fonction principale du moteur (processRAGQuestion)

La fonction `processRAGQuestion(question)` réalise l'ensemble de la chaîne : embedding → search topK → construction du prompt → génération de la réponse contextualisée. 

L'interface utilisateur (template.html) permet un cycle complet question (user) → moteur RAG JS → affichage réponse stylée. L’historique du chat est sauvegardé/restauré automatiquement (localStorage).
