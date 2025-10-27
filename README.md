# RAGBuilder Assistant — README (FR)

## 🎯 Objectif du projet
RAGBuilder Assistant est une plateforme web légère (HTML + JS + CSS) qui guide un employé, pas à pas, pour créer un chatbot RAG (Retrieval-Augmented Generation) personnalisé pour une entreprise.

Le but : standardiser et automatiser le processus afin que n'importe quel membre de l'équipe puisse suivre la méthode et générer un projet RAG opérationnel (config, scripts, export).

## 🧭 Vue d'ensemble des phases
Le procédé est divisé en 6 phases :

1. **Analyse (Discovery)** — comprendre l'usage et les sources.
2. **Préparation des données (DataPrep)** — extraction, nettoyage, découpage.
3. **Indexation (Vectorisation)** — embeddings + stockage vectoriel.
4. **Moteur RAG** — retrieval + génération, prompt templates.
5. **Interface & déploiement** — UI, authentification, hébergement.
6. **Maintenance & formation** — pipelines, docs, formation des employés.

## ✅ Checklist complète (cochable)
Sur GitHub / GitLab / Bitbucket, les cases ci-dessous sont cliquables.
Localement, tu peux éditer ce fichier README.md et remplacer `[ ]` par `[x]` pour marquer comme fait.

### Phase 0 — Préparation du projet
- [ ] Créer le repo ragbuilder-assistant
- [ ] Initialiser la structure de dossiers (frontend/, backend/, scripts/, docs/)
- [ ] Ajouter .gitignore, README.md, LICENSE
- [ ] Mettre en place un environnement de test local (simple http-server ou live-server)

### Phase 1 — Analyse (Discovery)
- [ ] Créer la page analyse.html
- [ ] Concevoir le formulaire des besoins (nom entreprise, cas d'usage, sources, ton)
- [ ] Mettre en place sauvegarde locale (localStorage) pour l'étape
- [ ] Générer le fichier ragbrief.json à partir des réponses
- [ ] Valider workflow : démarrer → remplir → sauvegarder → passer à dataprep

### Phase 2 — Préparation des données (DataPrep)
- [ ] Créer la page dataprep.html
- [ ] Autoriser upload de fichiers (PDF, DOCX, ZIP) côté frontend
- [ ] Écrire script JS de prévisualisation / extraction basique (texte brut)
- [ ] Implémenter découpage en chunks (par paragraphe ou N tokens)
- [ ] Sauvegarder métadonnées (source, date, titre) dans data/cleaned/ (simulé via JSON)
- [ ] Ajouter vérification et correction manuelle des extractions

### Phase 3 — Indexation (Vectorisation)
- [ ] Créer la page indexation.html
- [ ] Permettre le choix du modèle d'embeddings (optionnel : liste statique)
- [ ] Implémenter appel simulé à un service d'embeddings (mock ou API)
- [ ] Générer et stocker les vecteurs (fichier JSON/vector_store.json pour la version JS)
- [ ] Ajouter interface de statut/progression et logs

### Phase 4 — Moteur RAG
- [ ] Créer la page moteur.html
- [ ] Définir le template de prompt RAG (system + context + question)
- [ ] Implémenter un retriever simple (recherche par similarité sur vecteurs mock)
- [ ] Intégrer un test de génération (simulation LLM ou appel réel si dispo)
- [ ] Afficher les sources / citations avec chaque réponse

### Phase 5 — Interface & déploiement
- [ ] Créer la page interface.html (choix UI, thème)
- [ ] Implémenter le mini-chat de test (frontend uniquement)
- [ ] Ajouter export : rag_config.json + structure projet zippée
- [ ] Ajouter instructions de déploiement (Docker / simple hébergement statique)
- [ ] Intégrer une page recap.html et un bouton "Générer le projet"

### Phase 6 — Maintenance & formation
- [ ] Rédiger RAGBuilder_Methodologie.md (mode d'emploi pour employés)
- [ ] Créer CheckList_Projet.pdf (exportable)
- [ ] Préparer une courte vidéo / slides de formation (ou script)
- [ ] Mettre en place un système de versioning pour les datasets
- [ ] Planifier pipeline d'actualisation (cron / webhook) pour réindexation

## 📦 Livrables par sprint (1 sprint = version minimale utilisable)

### Sprint 0 (MVP)
- [ ] index.html, analyse.html, dataprep.html, recap.html
- [ ] js/main.js, js/analyse.js, js/dataprep.js, js/recap.js
- [ ] css/style.css
- [ ] Export rag_config.json fonctionnel

### Sprint 1 (Fonctionnel)
- [ ] Mini retriever + moteur simulé
- [ ] Export ZIP du projet généré
- [ ] Documentation utilisateur minimale

### Sprint 2 (Production-ready)
- [ ] Connexion à vrai service d'embeddings + vector DB (optionnel)
- [ ] Auth & multi-utilisateurs
- [ ] Pipelines d'ingestion automatisés

## 🛠️ Instructions d'utilisation (rapide)
1. Cloner le repo.
2. Démarrer un serveur statique (ex. `npx http-server` ou `live-server`).
3. Ouvrir index.html dans le navigateur.
4. Suivre les étapes et remplir les formulaires.
5. À la fin, cliquer sur Exporter pour récupérer rag_config.json ou ZIP.

## 💡 Astuces pour l'équipe
- Héberger le repo sur GitHub pour profiter des cases cochables dans la vue README.
- Pour un suivi plus avancé, intégrer la checklist dans un board (GitHub Projects, Trello).
- Former 1 personne « lead RAG » par équipe pendant 1 sprint, puis lancer la formation interne.

## 🔐 Sécurité & confidentialité
- Ne stocker jamais de données sensibles non chiffrées dans des services externes sans accord.
- Pour la production, utiliser un stockage sécurisé (S3 / Supabase Storage) et accès restreint.
- Documenter les règles d'accès et retention des données dans docs/.

## ✍️ Contribution & gouvernance
- Branches : main (stable), dev (features), hotfix/* (correctifs).
- PRs doivent inclure une checklist de tests.
- Ajouter tests unitaires simples côté JS pour les fonctions critiques (parsing, export).

## 📚 Fichiers importants
- `index.html` — accueil
- `analyse.html` — étape 1
- `dataprep.html` — étape 2
- `indexation.html` — étape 3
- `moteur.html` — étape 4
- `interface.html` — étape 5
- `recap.html` — résumé & export
- `css/style.css` — styles
- `js/*.js` — logique front-end
- `docs/RAGBuilder_Methodologie.md` — méthode complète
