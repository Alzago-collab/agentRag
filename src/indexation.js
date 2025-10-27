import { getEmbedding } from './moteur.js';

/**
 * Découpe un texte long en morceaux (chunks) de taille targetTokens.
 * @param {string} texte
 * @param {number} targetTokens
 * @returns {Array<string>}
 */
function decoupeEnChunks(texte, targetTokens = 500) {
  // Simplifié : chunk sur la longueur caractères pour démo — à améliorer !
  const regex = new RegExp(`.{1,${targetTokens * 6}}`, 'g');
  return texte.match(regex) || [];
}

/**
 * Vectorise chaque chunk via API embedding
 * @param {Array<string>} chunks
 * @param {string} model
 * @returns {Promise<Array<{text:string, vector:Array<number>}>>}
 */
async function vectoriseChunks(chunks, model = 'nomic-embed-text') {
  const vectors = [];
  for (let text of chunks) {
    const vector = await getEmbedding(text, model);
    vectors.push({ text, vector });
  }
  return vectors;
}

/**
 * Pipeline d'indexation automatique : upload fichier, découpe, vectorisation, export JSON vectorStore.
 * @param {File} fichier
 * @param {number} tailleChunk
 * @returns {Promise<Array<{id:number, text:string, vector:Array<number>}>>}
 */
async function pipelineIndexationAuto(fichier, tailleChunk = 500) {
  const txt = await fichier.text();
  const chunks = decoupeEnChunks(txt, tailleChunk);
  const vectors = await vectoriseChunks(chunks);
  // Formate [{id, text, vector}]
  return vectors.map((v, i) => ({ id: i+1, text: v.text, vector: v.vector }));
}

/**
 * Lance le download du vectorStore JSON côté navigateur (save as ...).
 * @param {Array} data
 * @param {string} nomFichier
 */
function saveVectorStore(data, nomFichier = 'vectors.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  a.click();
  URL.revokeObjectURL(url);
}

// TODO :
// - Support multi-fichiers (batch)
// - Support PDF/Docx, extraction texte avant découpe
// - ProgressBar, logs UI

export { decoupeEnChunks, vectoriseChunks, pipelineIndexationAuto, saveVectorStore };
