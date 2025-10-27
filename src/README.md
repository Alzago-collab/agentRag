# src

Ce dossier contient le code source principal :

- Les modules de logique métier (RAG, agents, moteurs, etc.)
- L’intégration avec les modèles de LLM
- Les pipelines de récupération et de génération

## Modules présents
- agent.js
- moteur.js
- indexation.js
- ui.js

## Étapes
- [x] Définir la structure des modules (agent, moteur, pipelines)
- [x] Créer les modules JS principaux
- [x] Implémenter le pipeline principal du moteur RAG (processRAGQuestion)
- [ ] Documenter chaque module

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
