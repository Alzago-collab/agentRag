# 🧠 RAGBuilder Assistant (Local + Ollama Edition)

## 🎯 Objectif du projet
RAGBuilder Assistant est une application web locale (HTML + JS + CSS + Ollama) qui guide les employés étape par étape pour créer un chatbot RAG entièrement localisé sur leur machine.

**Aucune dépendance cloud** : toutes les opérations (embedding, retrieval, génération) sont effectuées via Ollama installé sur le poste.

L'objectif est d'avoir un processus standardisé qu'une entreprise peut suivre facilement, jusqu'à l'obtention d'un chatbot prêt à utiliser, connecté à sa propre base documentaire.

## ⚙️ Technologies utilisées

| Fonction | Technologie |
|----------|------------|
| Moteur LLM & Embeddings | Ollama |
| Langage & Interface | HTML, CSS, JavaScript pur |
| Serveur local Ollama | localhost:11434 |
| Vectorisation | `ollama embed` |
| Sauvegarde | localStorage + fichiers .json |
| Export du projet | JSZip (génération ZIP dans le navigateur) |

## 🧭 Phases du projet

### 1️⃣ Analyse (Discovery)
**Objectif** : définir les besoins de l'entreprise.  
**Interface** : `analyse.html`

- Formulaire (nom de l'entreprise, domaine, objectifs, types de documents)
- Enregistrement automatique dans `config/project.json`
- Prévisualisation du plan RAG

**✅ Sortie** :
```json
{
  "entreprise": "NomEntreprise",
  "secteur": "Automobile",
  "objectif": "Support client",
  "langue": "fr",
  "model": "mistral",
  "embedding_model": "nomic-embed-text"
}
```

### 2️⃣ Préparation des données (DataPrep)
**Objectif** : nettoyer et préparer les fichiers.  
**Interface** : `dataprep.html`

- Upload de fichiers .txt, .pdf, .docx (avec pdf.js)
- Extraction du texte brut
- Nettoyage automatique (espaces, retours de ligne)
- Sauvegarde dans `/data/processed/*.txt`

**✅ Sortie** :
`/data/processed/text_cleaned.json`

### 3️⃣ Indexation locale (Vectorisation avec Ollama)
**Objectif** : transformer les documents en embeddings stockés localement.  
**Interface** : `indexation.html`

- Lecture des fichiers nettoyés
- Découpage en chunks (par 400–600 tokens)
- Envoi à l'API Ollama :
  ```
  POST http://localhost:11434/api/embeddings
  {
    "model": "nomic-embed-text",
    "prompt": "Texte à vectoriser"
  }
  ```
- Réception du vecteur → stockage dans `/data/vectors.json`

**✅ Sortie** :
```json
[
  {
    "id": 1,
    "text": "Le support client doit répondre aux FAQ...",
    "vector": [0.012, -0.053, ...]
  }
]
```

### 4️⃣ Moteur RAG local (Retrieval + Generation)
**Objectif** : construire le cœur du chatbot.  
**Interface** : `moteur.html`

**Fonctionnement JS** :
1. L'utilisateur pose une question.
2. Le texte de la question est envoyé à :
   ```
   POST /api/embeddings { "model": "nomic-embed-text", "prompt": "..." }
   ```
3. Calcul de la similarité cosinus entre la question et chaque vecteur du store local.
4. Sélection des 3 passages les plus pertinents.
5. Envoi au modèle LLM :
   ```
   POST /api/generate
   {
     "model": "mistral",
     "prompt": "Contexte : ... \nQuestion : ..."
   }
   ```
6. Le modèle répond à partir du contexte.

**✅ Sortie** : une réponse contextualisée affichée dans l'interface.

### 5️⃣ Interface utilisateur (Chatbot)
**Interface** : `interface.html`

- Champ de saisie utilisateur
- Affichage des bulles de discussion
- Historique sauvegardé dans localStorage
- Bouton Exporter → création d'un ZIP contenant :
  - `rag_config.json`
  - `vectors.json`
  - `chatbot.html`
  - `chatbot.js`

**✅ Sortie** :
Un chatbot complet et autonome, prêt à livrer à l'entreprise.

### 6️⃣ Maintenance & formation
**Interface** : `maintenance.html`

- Rafraîchir les embeddings (si ajout de documents)
- Export/Import du projet
- Documentation intégrée (`docs/guide.html`)
- Système de mise à jour du modèle Ollama

## 🧱 Structure du projet

```
ragbuilder-ollama/
│
├── index.html
├── analyse.html
├── dataprep.html
├── indexation.html
├── moteur.html
├── interface.html
├── maintenance.html
│
├── js/
│   ├── analyse.js
│   ├── dataprep.js
│   ├── vectorizer.js
│   ├── rag_engine.js
│   ├── interface.js
│   ├── maintenance.js
│   └── utils.js
│
├── css/
│   └── style.css
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── vectors.json
│   └── config/
│       └── project.json
│
└── docs/
    └── guide.html
```

## 💻 Fonctionnement local complet

### ⚙️ Étape 1 : Installer Ollama
Télécharger et installer depuis [https://ollama.ai](https://ollama.ai)

Puis installer les modèles :
```bash
ollama pull mistral
ollama pull nomic-embed-text
```

### ⚙️ Étape 2 : Lancer Ollama
```bash
ollama serve
```

Par défaut, il tourne sur `http://localhost:11434`

### ⚙️ Étape 3 : Ouvrir RAGBuilder
Double-clique simplement sur `index.html`

Toutes les pages fonctionnent dans ton navigateur **sans serveur**.

## 🧠 Exemple de workflow

1. Tu lances Ollama (`ollama serve`)
2. Tu ouvres `analyse.html` et remplis les infos
3. Tu charges les documents dans `dataprep.html`
4. Tu vectorises les textes dans `indexation.html`
5. Tu testes le chatbot dans `interface.html`
6. Tu exportes le tout pour livraison à l'entreprise
