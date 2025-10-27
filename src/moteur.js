// Moteur de recherche pour le système RAG

/**
 * Appelle l'API Ollama pour obtenir l'embedding d'un texte.
 * @param {string} text - Le texte à vectoriser
 * @param {string} model - Le modèle d'embedding (ex: 'nomic-embed-text')
 * @returns {Promise<Array<number>>}
 */
async function getEmbedding(text, model = 'nomic-embed-text') {
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: text })
  });
  if (!response.ok) throw new Error("Erreur API embedding (Ollama)");
  const data = await response.json();
  return data.embedding;
}

/**
 * Charge les vecteurs stockés localement (data/vectors.json).
 * @returns {Promise<Array<{id:number,text:string,vector:number[]}>>}
 */
async function chargerVectors() {
  const response = await fetch('../data/vectors.json');
  if (!response.ok) throw new Error("Impossible de charger les vecteurs");
  return await response.json();
}

/**
 * Calcule la similarité cosinus entre deux vecteurs.
 * @param {Array<number>} v1
 * @param {Array<number>} v2
 * @returns {number}
 */
function similariteCosinus(v1, v2) {
  const dot = v1.reduce((acc, val, i) => acc + val * v2[i], 0);
  const norm1 = Math.sqrt(v1.reduce((acc, val) => acc + val * val, 0));
  const norm2 = Math.sqrt(v2.reduce((acc, val) => acc + val * val, 0));
  if (norm1 === 0 || norm2 === 0) return 0;
  return dot / (norm1 * norm2);
}

/**
 * Renvoie les top-k passages les plus similaires à la requête.
 * @param {Array<{id:number,text:string,vector:number[]}>} passages - Corpus vectorisé
 * @param {Array<number>} requeteEmbedding
 * @param {number} k - Nombre de passages à retourner
 * @returns {Array<{id:number,text:string,vector:number[], score:number}>}
 */
function passagesTopK(passages, requeteEmbedding, k = 3) {
  return passages.map(p => ({ ...p, score: similariteCosinus(p.vector, requeteEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/**
 * Appelle l'API de génération LLM (Ollama) pour obtenir une réponse basée sur le contexte et la question.
 * @param {string} prompt - Le prompt complet (inclus contexte et question)
 * @param {string} model - Modèle LLM à utiliser (ex: 'mistral')
 * @returns {Promise<string>} - Texte généré par le LLM
 */
async function genererReponseLLM(prompt, model = 'mistral') {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt })
  });
  if (!response.ok) throw new Error("Erreur API génération (Ollama)");
  const data = await response.json();
  return data.response || data.generated || JSON.stringify(data);
}

/**
 * Pipeline complet : question utilisateur -> réponse générée
 * @param {string} question   - Question de l'utilisateur
 * @param {number} topK       - Nombre de passages les plus pertinents à utiliser (par défaut 3)
 * @param {string} embedModel - Modèle embedding
 * @param {string} llmModel   - Modèle LLM
 * @returns {Promise<{reponse: string, passages: Array, prompt: string}>}
 */
async function processRAGQuestion(question, topK = 3, embedModel = 'nomic-embed-text', llmModel = 'mistral') {
  // 1. Embedding de la question
  const questionEmbedding = await getEmbedding(question, embedModel);
  // 2. Chargement des vecteurs documents
  const passages = await chargerVectors();
  // 3. Recherche top-k
  const topPassages = passagesTopK(passages, questionEmbedding, topK);
  // 4. Construction du contexte pour le prompt
  const contexte = topPassages.map((p,i) => `Contexte ${i+1}: ${p.text}`).join("\n\n");
  const prompt = `${contexte}\n\nQuestion : ${question}\nRéponds précisément en t'appuyant uniquement sur le contexte ci-dessus.`;
  // 5. Génération réponse
  const reponse = await genererReponseLLM(prompt, llmModel);
  return { reponse, passages: topPassages, prompt };
}

// Export des fonctions principales pour usage UI ou agent
export { getEmbedding, chargerVectors, similariteCosinus, passagesTopK, genererReponseLLM, processRAGQuestion };
