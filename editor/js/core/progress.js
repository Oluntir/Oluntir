// Kleine wiederverwendbare Fortschrittsanzeige (Overlay), damit lang laufende
// Aktionen (Export, Galerie erstellen) nicht wie ein Einfrieren wirken.

let progressEls = null;

function getProgressEls() {
  if (!progressEls) {
    progressEls = {
      overlay: document.getElementById('progress-overlay'),
      title: document.getElementById('progress-title'),
      status: document.getElementById('progress-status'),
      bar: document.getElementById('progress-bar'),
    };
  }
  return progressEls;
}

function showProgress(title) {
  const els = getProgressEls();
  els.title.textContent = title;
  els.status.textContent = '';
  els.bar.style.width = '0%';
  els.bar.classList.remove('indeterminate');
  els.overlay.classList.add('visible');
}

// percent: Zahl 0-100, oder null/undefined für einen unbestimmten ("läuft…") Zustand
function updateProgress(percent, statusText) {
  const els = getProgressEls();
  if (percent == null) {
    els.bar.classList.add('indeterminate');
    els.bar.style.width = '30%';
  } else {
    els.bar.classList.remove('indeterminate');
    els.bar.style.width = Math.max(0, Math.min(100, percent)) + '%';
  }
  if (statusText != null) els.status.textContent = statusText;
}

function hideProgress() {
  const els = getProgressEls();
  els.overlay.classList.remove('visible');
}

// Kurze Pause, damit der Browser die aktualisierte Fortschrittsanzeige auch
// tatsächlich zeichnet, bevor die nächste (evtl. schwere) Teilaufgabe startet.
// Bewusst setTimeout statt requestAnimationFrame: rAF wird von Browsern in
// Hintergrund-/nicht fokussierten Tabs komplett angehalten – wechselt man während
// eines Exports kurz das Fenster, würde der gesamte Vorgang sonst unbegrenzt hängen
// bleiben (fühlt sich wie ein Einfrieren an). setTimeout läuft auch im Hintergrund
// weiter (höchstens gedrosselt), der Fortschritt kommt also so oder so voran.
function nextFrame() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
