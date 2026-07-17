/* =========================================================================
   CONFIG — tout ce que tu es susceptible de vouloir changer est ici.
   ========================================================================= */
const CONFIG = {

  // -----------------------------------------------------------------------
  // EMAILJS — pour que le bouton "Valider et envoyer" fonctionne :
  // 1. Crée un compte gratuit sur https://www.emailjs.com
  // 2. Ajoute un "Email Service" (ex: Gmail) -> récupère le SERVICE_ID
  // 3. Crée un "Email Template" avec des variables du type
  //    {{dates}}, {{film}}, {{activite}}, {{dodo}} -> récupère le TEMPLATE_ID
  //    (et renseigne l'adresse mail de destination directement dans le
  //    champ "To email" du template, dans ton compte EmailJS)
  // 4. Dans EmailJS, va dans "Account" -> récupère ta PUBLIC_KEY
  // 5. Colle les 3 valeurs ci-dessous.
  // -----------------------------------------------------------------------
  emailjs: {
    publicKey: "kje36i7KxFq4oP236",
    serviceId: "service_21jw95w",
    templateId: "template_8n385mu",
  },

  // Mois affiché dans le calendrier (mois: 0 = janvier ... 6 = juillet)
  calendrier: {
    annee: 2026,
    mois: 6,
    titre: "Juillet 2026",
  },
};

/* =========================================================================
   ÉTAT — les choix de l'utilisateur, remplis au fil du parcours
   ========================================================================= */
const state = {
  dates: [],           // ["2026-07-03", "2026-07-04", ...]
  filmChoice: null,    // "interesse" | "autre"
  activityText: "",
  sleepAt: null,        // "moi" | "toi"
  wrongPillClicks: 0,
};

/* =========================================================================
   NAVIGATION ENTRE PAGES
   ========================================================================= */
const PAGE_ORDER = ["accueil", "dispo", "film", "nourriture", "dodo", "validation", "fin"];

function goToPage(pageName) {
  const target = document.querySelector(`.page[data-page="${pageName}"]`);
  if (!target) return;

  document.querySelectorAll(".page").forEach((el) => el.classList.remove("is-active"));
  target.classList.add("is-active");

  document.body.dataset.page = pageName;
  updateProgressDots(pageName);

  if (pageName === "validation") {
    renderSummary();
  }

  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function updateProgressDots(pageName) {
  const currentIndex = PAGE_ORDER.indexOf(pageName);
  document.querySelectorAll(".progress .dot").forEach((dot) => {
    const dotIndex = PAGE_ORDER.indexOf(dot.dataset.step);
    dot.classList.remove("is-current", "is-done");
    if (dotIndex < currentIndex) dot.classList.add("is-done");
    if (dotIndex === currentIndex) dot.classList.add("is-current");
  });
}

/* =========================================================================
   PAGE 1 — ACCUEIL (pilule bleue / pilule rouge)
   ========================================================================= */
function initAccueil() {
  const section = document.getElementById("section-accueil");
  const hint = document.getElementById("accueil-hint");

  document.getElementById("btn-pill-bleue").addEventListener("click", () => {
    goToPage("dispo");
  });

  document.getElementById("btn-pill-rouge").addEventListener("click", () => {
    state.wrongPillClicks += 1;
    hint.textContent = "Tu me détestes enfaite, c'est ça ?";
    section.classList.remove("is-glitching");
    // force le redémarrage de l'animation même si elle vient de jouer
    void section.offsetWidth;
    section.classList.add("is-glitching");
    section.addEventListener(
      "animationend",
      () => section.classList.remove("is-glitching"),
      { once: true }
    );
  });
}

/* =========================================================================
   PAGE 2 — DISPONIBILITÉS (calendrier)
   ========================================================================= */
function initCalendrier() {
  const { annee, mois, titre } = CONFIG.calendrier;
  document.getElementById("calendar-title").textContent = titre;

  const weekdaysEl = document.getElementById("calendar-weekdays");
  ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].forEach((jour) => {
    const span = document.createElement("span");
    span.textContent = jour;
    weekdaysEl.appendChild(span);
  });

  const gridEl = document.getElementById("calendar-grid");
  const premierJour = new Date(annee, mois, 1);
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  // getDay() : 0 = dimanche ... 6 = samedi -> on convertit pour que la semaine commence lundi
  const decalage = (premierJour.getDay() + 6) % 7;

  for (let i = 0; i < decalage; i++) {
    const vide = document.createElement("span");
    vide.className = "calendar-day is-empty";
    gridEl.appendChild(vide);
  }

  for (let jour = 1; jour <= nbJours; jour++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "calendar-day";
    btn.textContent = jour;

    const mm = String(mois + 1).padStart(2, "0");
    const dd = String(jour).padStart(2, "0");
    const dateStr = `${annee}-${mm}-${dd}`;
    btn.dataset.date = dateStr;

    btn.addEventListener("click", () => toggleDate(dateStr, btn));
    gridEl.appendChild(btn);
  }

  document.getElementById("btn-dispo-valider").addEventListener("click", () => {
    goToPage("film");
  });
}

function toggleDate(dateStr, btn) {
  const index = state.dates.indexOf(dateStr);
  if (index === -1) {
    state.dates.push(dateStr);
    btn.classList.add("is-selected");
  } else {
    state.dates.splice(index, 1);
    btn.classList.remove("is-selected");
  }
  state.dates.sort();
  updateDispoCount();
}

function updateDispoCount() {
  const countEl = document.getElementById("dispo-count");
  const validerBtn = document.getElementById("btn-dispo-valider");
  const n = state.dates.length;

  if (n === 0) {
    countEl.textContent = "Aucune date sélectionnée";
  } else if (n === 1) {
    countEl.textContent = "1 date sélectionnée";
  } else {
    countEl.textContent = `${n} dates sélectionnées`;
  }

  validerBtn.disabled = n === 0;
}

/* =========================================================================
   PAGE 3 — FILM
   ========================================================================= */
function initFilm() {
  const activityBox = document.getElementById("activity-box");
  const activityInput = document.getElementById("activity-input");

  document.getElementById("btn-film-oui").addEventListener("click", () => {
    state.filmChoice = "interesse";
    state.activityText = "";
    goToPage("nourriture");
  });

  document.getElementById("btn-film-autre").addEventListener("click", () => {
    state.filmChoice = "autre";
    activityBox.classList.remove("is-hidden");
    activityInput.focus();
  });

  document.getElementById("btn-activity-valider").addEventListener("click", () => {
    const texte = activityInput.value.trim();
    if (!texte) {
      activityInput.focus();
      return;
    }
    state.activityText = texte;
    goToPage("nourriture");
  });
}

/* =========================================================================
   PAGE 4 — NOURRITURE
   ========================================================================= */
function initNourriture() {
  document.getElementById("btn-nourriture-suivant").addEventListener("click", () => {
    goToPage("dodo");
  });
}

/* =========================================================================
   PAGE 5 — DODO
   ========================================================================= */
function initDodo() {
  document.getElementById("btn-dodo-moi").addEventListener("click", () => {
    state.sleepAt = "moi";
    goToPage("validation");
  });
  document.getElementById("btn-dodo-toi").addEventListener("click", () => {
    state.sleepAt = "toi";
    goToPage("validation");
  });
}

/* =========================================================================
   PAGE 6 — VALIDATION / ENVOI DU MAIL
   ========================================================================= */
function formatDateLisible(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function renderSummary() {
  const list = document.getElementById("summary-list");
  list.innerHTML = "";

  const items = [
    ["Disponibilités", state.dates.length ? state.dates.map(formatDateLisible).join(", ") : "—"],
    ["Film", state.filmChoice === "interesse" ? "The Odyssey" : `Autre idée : ${state.activityText || "—"}`],
    ["Nourriture", "On décide ensemble, sur place"],
    ["On dort", state.sleepAt === "moi" ? "Chez moi" : state.sleepAt === "toi" ? "Chez toi" : "—"],
  ];

  items.forEach(([label, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    list.appendChild(dt);
    list.appendChild(dd);
  });
}

function initValidation() {
  document.getElementById("btn-envoyer").addEventListener("click", () => {
    envoyerMail();
    setTimeout(() => goToPage("fin"), 800);
  });
}

function envoyerMail() {
  const btn = document.getElementById("btn-envoyer");
  const status = document.getElementById("send-status");

  if (typeof emailjs === "undefined") {
    status.textContent = "EmailJS ne s'est pas chargé (vérifie ta connexion).";
    status.className = "status is-error";
    return;
  }

  const templateParams = {
    dates: state.dates.length ? state.dates.map(formatDateLisible).join(", ") : "aucune date choisie",
    film: state.filmChoice === "interesse" ? "The Odyssey" : "Non, autre activité proposée",
    activite: state.activityText || "—",
    dodo: state.sleepAt === "moi" ? "Chez moi" : state.sleepAt === "toi" ? "Chez toi" : "—",
    pilule_rouge: state.wrongPillClicks,
    wrongPillClicks: state.wrongPillClicks,
  };

  btn.disabled = true;
  status.textContent = "Envoi en cours...";
  status.className = "status";

  emailjs
    .send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, templateParams)
    .then(() => {
      status.textContent = "C'est envoyé.";
      status.className = "status is-success";
    })
    .catch((err) => {
      console.error(err);
      status.textContent = "Ya problème";
      status.className = "status is-error";
      btn.disabled = false;
    });
}

/* =========================================================================
   IMAGES — évite l'icône "image cassée" tant que tu n'as pas ajouté
   tes propres fichiers dans /images
   ========================================================================= */
function initImageFallbacks() {
  ["film-image", "food-image"].forEach((id) => {
    const img = document.getElementById(id);
    if (!img) return;
    img.addEventListener("error", () => {
      img.closest(".film-frame, .food-frame")?.classList.add("is-empty");
      img.style.display = "none";
    });
  });
}

/* =========================================================================
   INITIALISATION
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
  }

  initAccueil();
  initCalendrier();
  initFilm();
  initNourriture();
  initDodo();
  initValidation();
  initImageFallbacks();

  document.body.dataset.page = "accueil";
  updateProgressDots("accueil");
});
