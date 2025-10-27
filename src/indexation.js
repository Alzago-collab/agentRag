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
 * Stub/placeholder pour la pipeline d'indexation automatique complète
 * - Lire .txt/.json
 * - Découper en chunks
 * - Vectoriser
 * - Exporter le JSON final dans le dossier /data
 */
// TODO: pipelineIndexationAuto(fichierSource)

export { decoupeEnChunks, vectoriseChunks };
