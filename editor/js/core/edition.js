(function () {
  // Zentrale Distributionsschicht. Für die spätere GitHub-Ausgabe kann
  // PAGEBUILDER_EDITION auf "community" gesetzt werden; proprietäre Profile
  // mit nicht dokumentierter Weitergabeberechtigung werden nicht angeboten oder geladen.
  const edition = (window.PAGEBUILDER_EDITION || 'community').toLowerCase();
  window.PAGEBUILDER_DISTRIBUTION = {
    id: edition,
    isCommunity: edition === 'community',
    allowsCommercialTemplates: edition !== 'community'
  };
})();
