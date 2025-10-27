import { pipelineIndexationAuto, saveVectorStore } from './indexation.js';

const fileInput = document.getElementById('index-file');
const btnIndexer = document.getElementById('btn-indexer');
const btnDownload = document.getElementById('btn-download');
const indexLog = document.getElementById('index-log');

let lastVectorStore = null;

btnIndexer.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    indexLog.textContent = "Veuillez sélectionner au moins un fichier texte (.txt ou .json).";
    return;
  }
  btnIndexer.disabled = true;
  btnDownload.disabled = true;
  indexLog.textContent = "Indexation en cours…";
  let allVectors = [];
  for (const file of fileInput.files) {
    indexLog.textContent = `Lecture et indexation du fichier : ${file.name}`;
    try {
      const vectors = await pipelineIndexationAuto(file);
      allVectors = allVectors.concat(vectors);
      indexLog.textContent += `\n${vectors.length} chunks vectorisés.`;
    } catch (err) {
      indexLog.textContent += `\nErreur: ${err.message}`;
    }
  }
  if (allVectors.length) {
    lastVectorStore = allVectors;
    btnDownload.disabled = false;
    indexLog.textContent += `\nIndexation terminée. Cliquez sur Télécharger pour récupérer vectors.json.`;
  } else {
    indexLog.textContent += `\nAucun vecteur généré : vérifiez vos fichiers.`;
  }
  btnIndexer.disabled = false;
});

btnDownload.addEventListener('click', () => {
  if (lastVectorStore && lastVectorStore.length)
    saveVectorStore(lastVectorStore);
});
