const state = {
  mode: "screen",
  current: 0,
  answers: [],
  inactivityTimer: null
};

const resetAfterMs = 90000;
const app = document.getElementById("app");

const questions = [
  {
    id: "usesAi",
    text: "Nutzen Sie im Unternehmen bereits KI-Tools wie ChatGPT, Copilot, Claude oder ähnliche Systeme?",
    criticalWhen: true
  },
  {
    id: "shadowAi",
    text: "Nutzen Mitarbeitende private oder nicht freigegebene KI-Tools für berufliche Aufgaben?",
    criticalWhen: true,
    block: "shadow"
  },
  {
    id: "inventory",
    text: "Gibt es eine Übersicht, welche KI-Tools im Unternehmen genutzt werden?",
    criticalWhen: false,
    block: "inventory"
  },
  {
    id: "policy",
    text: "Gibt es eine interne KI-Richtlinie?",
    criticalWhen: false,
    block: "policy"
  },
  {
    id: "training",
    text: "Wurden Mitarbeitende zum Umgang mit KI geschult?",
    criticalWhen: false,
    block: "training"
  },
  {
    id: "sensitiveData",
    text: "Werden personenbezogene oder vertrauliche Daten in KI-Tools eingegeben?",
    criticalWhen: true,
    minLevel: "red",
    block: "data"
  },
  {
    id: "sensitiveArea",
    text: "Wird KI in sensiblen Bereichen eingesetzt?",
    hint: "Beispiele: Personal, Kundenbewertung, Finanzen, Recht, Sicherheit oder kritische Prozesse",
    criticalWhen: true,
    minLevel: "red",
    block: "risk"
  },
  {
    id: "externalContent",
    text: "Werden KI-generierte Inhalte extern verwendet, z. B. Website, Social Media, Angebote oder Kundenunterlagen?",
    criticalWhen: true,
    block: "transparency"
  }
];

const resultCopy = {
  green: {
    label: "Grün",
    title: "Gut gesteuerte KI-Nutzung",
    text: "Ihre Antworten zeigen aktuell keinen akuten Handlungsbedarf. Die wesentlichen organisatorischen Grundlagen sind vorhanden oder KI wird derzeit noch nicht aktiv eingesetzt.",
    next: "Status regelmäßig überprüfen."
  },
  yellow: {
    label: "Gelb",
    title: "Regelungsbedarf",
    text: "KI ist für Ihr Unternehmen relevant. Einzelne Grundlagen zur Steuerung sollten ergänzt oder geschärft werden.",
    next: "Fehlende Governance-Bausteine priorisiert schließen."
  },
  red: {
    label: "Rot",
    title: "Erhöhter Prüfbedarf",
    text: "Ihre Antworten zeigen potenziell sensible KI-Nutzung. Daten, Einsatzbereich oder Außenwirkung sollten konkret geprüft und sauber gesteuert werden.",
    next: "Konkreten KI-Anwendungsfall vertieft prüfen."
  }
};

const recommendations = {
  inventory: {
    title: "KI-Inventar erstellen",
    text: "Tools, Zweck, Datenarten, Nutzergruppe und Zuständigkeit erfassen."
  },
  policy: {
    title: "KI-Richtlinie einführen",
    text: "Erlaubte Tools, verbotene Daten, Freigaben und Verantwortung regeln."
  },
  training: {
    title: "KI-Kompetenz nach Art. 4 aufbauen",
    text: "Mitarbeitende zu sicherer Nutzung, Risiken und Grenzen schulen."
  },
  shadow: {
    title: "Private KI-Nutzung regeln",
    text: "Freigegebene Tools definieren und sensible Daten ausschließen."
  },
  data: {
    title: "Datenschutz und Vertraulichkeit prüfen",
    text: "Datenarten, Zweck, Schutzbedarf und IT-/Datenschutzanforderungen klären."
  },
  risk: {
    title: "Risikoreichen Einsatz bewerten",
    text: "Anwendungsfall, Risikoklasse, menschliche Kontrolle und Auswirkungen prüfen."
  },
  transparency: {
    title: "Externe KI-Inhalte prüfen",
    text: "Fachliche Endkontrolle, Transparenz und mögliche Kennzeichnung regeln."
  },
  maintain: {
    title: "Regelmäßig aktualisieren",
    text: "Inventar, Richtlinie und Schulungen bei neuen Tools aktuell halten."
  },
  future: {
    title: "KI-Einsatz frühzeitig steuern",
    text: "Bei Einführung von KI direkt Inventar, Richtlinie und Schulung mitdenken."
  }
};

function resetTimer() {
  clearTimeout(state.inactivityTimer);
  state.inactivityTimer = setTimeout(showStart, resetAfterMs);
}

["click", "touchstart", "keydown", "mousemove"].forEach(evt => {
  document.addEventListener(evt, resetTimer, { passive: true });
});

function header(progress = null, label = "") {
  return `
    <header class="header">
      <div class="logo-wrap">
        <img class="logo-img" src="assets/hfcon_logo.png" alt="hfcon Logo" />
        <div class="header-copy">
          <strong>EU AI Act Quick Check</strong>
          <span>Orientierung für KMU</span>
        </div>
      </div>
      <div class="progress-wrap ${progress === null ? "hidden" : ""}">
        <div class="progress-meta">${label}</div>
        <div class="progress"><div class="progress-inner" style="width:${progress || 0}%"></div></div>
      </div>
    </header>
  `;
}

function footer(extraButton = "") {
  return `
    <footer class="footer">
      <div class="footer-note">Diese Einschätzung ersetzt keine Rechtsberatung. Sie zeigt typische Handlungsfelder für KMU im Umgang mit dem EU AI Act. KI-generierte Inhalte.</div>
      <div class="footer-actions">${extraButton}<button class="btn ghost" id="homeBtn">Start</button></div>
    </footer>
  `;
}

function render(content, opts = {}) {
  app.innerHTML = `
    <section class="screen">
      ${header(opts.progress ?? null, opts.label ?? "")}
      <section class="content">${content}</section>
      ${footer(opts.footerButton ?? "")}
    </section>
  `;

  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.addEventListener("click", showStart);

  resetTimer();
}

function showStart() {
  state.current = 0;
  state.answers = [];

  render(`
    <div class="hero">
      <div>
        <h1>Sind Sie vom EU AI Act betroffen?</h1>
        <p class="lead">Der Quick Check zeigt in wenigen Minuten, welche nächsten Schritte für Ihr Unternehmen relevant sind.</p>
        <div class="choice-grid">
          <button class="choice-card primary" id="screenMode">
            <h3>Quick Check starten</h3>
            <p>8 kurze Ja/Nein-Fragen direkt am Bildschirm beantworten.</p>
          </button>
          <button class="choice-card" id="samMode">
            <h3>Mit Sam durch den Check</h3>
            <p>Sprachgeführter Check mit Sam.</p>
          </button>
        </div>
      </div>
      <div class="sam-panel">
        <img src="assets/sam.png" alt="Stilisierte Darstellung von Sam, dem hfcon Roboter" />
        <div class="sam-overlay">
          <strong>Mit Sam durch den Check</strong>
          <span>Sagen Sie: „Hey Sam, geh mit mir den EU AI Act Check durch.“</span>
        </div>
      </div>
    </div>
  `);

  document.getElementById("screenMode").addEventListener("click", () => {
    state.mode = "screen";
    showIntro();
  });

  document.getElementById("samMode").addEventListener("click", () => {
    state.mode = "sam";
    showSamInstruction();
  });
}

function showIntro() {
  render(`
    <div class="info-layout">
      <div>
        <div class="kicker">Worum geht es?</div>
        <h2>Der Check zeigt, wo Sie beim KI-Einsatz stehen.</h2>
        <p class="lead">Sie erhalten eine erste Einschätzung zur Betroffenheit und zu möglichen nächsten Schritten.</p>
        <div class="info-cards">
          <div class="info-card">Brauchen wir eine KI-Inventarliste?</div>
          <div class="info-card">Brauchen wir eine KI-Richtlinie?</div>
          <div class="info-card">Brauchen wir Schulung zur KI-Kompetenz?</div>
          <div class="info-card">Ist eine vertiefte Prüfung erforderlich?</div>
        </div>
      </div>
      <div class="info-side">
        <h3>Betroffenheit</h3>
        <p>Sobald KI beruflich genutzt wird, sollte der Einsatz gesteuert werden. Eine KMU-Ausnahme für die grundlegenden Pflichten besteht nicht pauschal.</p>
      </div>
    </div>
  `, {
    footerButton: `<button class="btn ghost" id="introBackBtn">Zurück</button><button class="btn ghost" id="nextBtn">Weiter</button>`
  });

  document.getElementById("introBackBtn").addEventListener("click", showStart);
  document.getElementById("nextBtn").addEventListener("click", () => showQuestion(0));
}

function showSamInstruction() {
  render(`
    <div class="hero">
      <div>
        <div class="kicker">Sam-Modus</div>
        <h2>Jetzt Sam ansprechen.</h2>
        <p class="lead">Sagen Sie:</p>
        <div class="info-cards">
          <div class="info-card">„Hey Sam, geh mit mir den EU AI Act Check durch.“</div>
        </div>
      </div>
      <div class="sam-panel">
        <img src="assets/sam.png" alt="Stilisierte Darstellung von Sam, dem hfcon Roboter" />
      </div>
    </div>
  `, {
    footerButton: `<button class="btn ghost" id="screenFallback">Am Bildschirm starten</button>`
  });

  document.getElementById("screenFallback").addEventListener("click", () => {
    state.mode = "screen";
    showIntro();
  });
}

function showQuestion(index) {
  state.current = index;
  const q = questions[index];
  const progress = Math.round(index / questions.length * 100);

  render(`
    <div class="question">
      <div>
        <div class="question-meta">Frage ${index + 1} von ${questions.length}</div>
        <p class="question-text">${q.text}</p>
        ${q.hint ? `<p class="question-hint">${q.hint}</p>` : ""}
      </div>
      <div class="answer-grid">
        <button class="btn" id="yesBtn">Ja</button>
        <button class="btn secondary" id="noBtn">Nein</button>
      </div>
    </div>
  `, {
    progress,
    label: `Frage ${index + 1} von ${questions.length}`,
    footerButton: `<button class="btn ghost" id="backBtn">Zurück</button>`
  });

  document.getElementById("yesBtn").addEventListener("click", () => answer(true));
  document.getElementById("noBtn").addEventListener("click", () => answer(false));

  const back = document.getElementById("backBtn");
  if (back) back.addEventListener("click", () => {
    if (state.current === 0) showIntro();
    else showQuestion(state.current - 1);
  });
}

function answer(value) {
  state.answers[state.current] = value;
  const next = state.current + 1;
  if (next < questions.length) showQuestion(next);
  else showResult();
}

function rank(level) {
  return { green: 0, yellow: 1, red: 2 }[level];
}

function maxLevel(a, b) {
  return rank(a) >= rank(b) ? a : b;
}

function getAnswer(id) {
  const idx = questions.findIndex(q => q.id === id);
  return state.answers[idx];
}

function calculate() {
  const usesAi = getAnswer("usesAi") === true;
  const shadow = getAnswer("shadowAi") === true;
  const hasInventory = getAnswer("inventory") === true;
  const hasPolicy = getAnswer("policy") === true;
  const hasTraining = getAnswer("training") === true;
  const sensitiveData = getAnswer("sensitiveData") === true;
  const sensitiveArea = getAnswer("sensitiveArea") === true;
  const externalContent = getAnswer("externalContent") === true;

  if (!usesAi) {
    return {
      level: "green",
      items: [recommendations.future],
      more: []
    };
  }

  let level = "green";
  let items = [];
  let more = [];

  const push = (condition, key, min = "yellow") => {
    if (!condition) return;
    items.push({ key, ...recommendations[key] });
    level = maxLevel(level, min);
  };

  push(sensitiveData, "data", "red");
  push(sensitiveArea, "risk", "red");
  push(!hasInventory, "inventory", "yellow");
  push(!hasPolicy, "policy", "yellow");
  push(!hasTraining, "training", "yellow");
  push(shadow, "shadow", "yellow");
  push(externalContent, "transparency", "yellow");

  if (items.length === 0) {
    items.push({ key: "maintain", ...recommendations.maintain });
    level = "green";
  }

  return {
    level,
    items,
    more: []
  };
}

function showResult() {
  const calc = calculate();
  const copy = resultCopy[calc.level];

  render(`
    <div class="result-layout">
      <div class="result-main">
        <div class="result-status ${calc.level}">
          <div class="status-dot" aria-hidden="true"></div>
          <div class="status-copy">
            <span>Ihr Ergebnis</span>
            <strong>${copy.label}</strong>
          </div>
        </div>
        <h2 class="result-title">${copy.title}</h2>
        <p class="result-text">${copy.text}</p>
      </div>

      <div class="result-side">
        <div class="block">
          <h3>Handlungsempfehlungen</h3>
          <div class="reco-list">
            ${calc.items.map(item => `
              <div class="reco-card">
                <strong>${item.title}</strong>
                <span>${item.text}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `, {
    progress: 100,
    label: "Auswertung",
    footerButton: `<button class="btn ghost" id="resultBackBtn">Zurück</button><button class="btn ghost" id="restartBtn">Check neu starten</button>`
  });

  document.getElementById("resultBackBtn").addEventListener("click", () => showQuestion(questions.length - 1));
  document.getElementById("restartBtn").addEventListener("click", showStart);
}

showStart();
