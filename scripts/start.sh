#!/bin/bash
# Script de lancement du serveur et préparation automatique du vector store

PROJECT_ROOT="$(dirname "$0")/.."
VECTORS_JSON_SRC=""
VECTORS_JSON_DST="$PROJECT_ROOT/data/vectors.json"

# Recherche vectors.json ailleurs (assets/, src/, ./)
for d in "$PROJECT_ROOT/assets/vectors.json" "$PROJECT_ROOT/src/vectors.json" "$PROJECT_ROOT/vectors.json"; do
  if [ -f "$d" ]; then
    VECTORS_JSON_SRC="$d"
    break
  fi
done

if [ -n "$VECTORS_JSON_SRC" ]; then
  cp "$VECTORS_JSON_SRC" "$VECTORS_JSON_DST"
  echo "✔ vectors.json copié dans ./data (prêt pour le moteur RAG)"
else
  if [ -f "$VECTORS_JSON_DST" ]; then
    echo "✔ vectors.json déjà présent dans ./data (prêt)"
  else
    echo "⚠️  vectors.json absent : effectuez d'abord une indexation via l'UI puis cliquez sur Télécharger dans Indexation. Copiez-le dans ./data/ avant de lancer le chat."
  fi
fi

cd "$PROJECT_ROOT"
echo "Démarrage du serveur local sur http://localhost:8000 (ouvrir assets/template.html pour tester RAGBuilder UI)"
npx http-server . -p 8000
