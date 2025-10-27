// Module Agent principal – orchestrateur du workflow RAG

class Agent {
  constructor(config) {
    this.config = config;
    this.sessionLogs = [];
    // À terme: gérer profils, préférences utilisateur, logs avancés
  }

  /**
   * Démarre une nouvelle session/interaction agent utilisateur
   * Peut intégrer analytics, adaptation profil, etc.
   */
  debutSession() {
    this.sessionLogs = [];
    // TODO: personnalisation greetings, adaptation dynamique, logins…
    // Ex : afficher "Bonjour, comment puis-je vous aider aujourd'hui ?"
  }

  /**
   * Log les échanges question/réponse pour la session
   */
  logInteraction(question, reponse) {
    this.sessionLogs.push({ question, reponse, time: new Date().toISOString() });
    // TODO: Persist log, exporter, analytics, feedback...
  }
}

export default Agent;
