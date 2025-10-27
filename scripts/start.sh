#!/bin/bash
# Lancement d'un serveur local sur le dossier assets pour développement
echo "Serveur local: assets/ sur http://localhost:8000"
npx http-server ../assets -p 8000
