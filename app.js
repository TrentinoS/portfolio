/* ============================================================
   Routing — client-side tab switching (Home / Resume / Writing)
   ============================================================ */
const views = {
  home: document.getElementById("view-home"),
  resume: document.getElementById("view-resume"),
  writing: document.getElementById("view-writing"),
};
const navLinks = document.querySelectorAll(".nav-link[data-route]");

function route(name) {
  if (!views[name]) name = "home";
  for (const key in views) views[key].hidden = key !== name;
  navLinks.forEach((l) => l.classList.toggle("active", l.dataset.route === name));
  if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
  window.scrollTo({ top: 0 });
  closeMobileNav();
}

// Delegate every element with data-route
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-route]");
  if (el) {
    e.preventDefault();
    route(el.dataset.route);
  }
});
window.addEventListener("hashchange", () => route(location.hash.slice(1)));

/* ============================================================
   Mobile nav toggle
   ============================================================ */
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
function closeMobileNav() {
  if (sidebar) sidebar.classList.remove("open");
}
if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
}

/* ============================================================
   Resume view toggle — Full / Technical / Leadership
   ============================================================ */
const resumeToggle = document.getElementById("resume-toggle");
if (resumeToggle) {
  resumeToggle.addEventListener("click", (e) => {
    const btn = e.target.closest(".vt");
    if (!btn) return;
    resumeToggle.querySelectorAll(".vt").forEach((b) => b.classList.toggle("active", b === btn));
    applyResumeView(btn.dataset.view);
  });
}
function applyResumeView(mode) {
  document.querySelectorAll("#experience li[data-view]").forEach((li) => {
    li.hidden = mode !== "full" && li.dataset.view !== mode;
  });
  // Hide a role entirely if it has no visible bullets in this mode
  document.querySelectorAll("#experience .role").forEach((role) => {
    const anyVisible = [...role.querySelectorAll("li[data-view]")].some((li) => !li.hidden);
    role.style.display = anyVisible || mode === "full" ? "" : "none";
  });
}

/* ============================================================
   Download résumé as PDF (client-side, via html2pdf)
   ============================================================ */
const downloadBtn = document.getElementById("download-pdf");
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    const src = document.getElementById("resume-doc");
    if (!src || typeof html2pdf === "undefined") {
      alert("PDF generator failed to load. Check your connection and try again.");
      return;
    }

    // Make sure all bullets are visible in the PDF regardless of the active toggle
    const prevActive = document.querySelector("#resume-toggle .vt.active");
    applyResumeView("full");

    const label = downloadBtn.innerHTML;
    downloadBtn.disabled = true;
    downloadBtn.textContent = "Generating…";

    const opts = {
      margin: [12, 12, 14, 12],
      filename: "Milan-Singh-Resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "avoid-all"] },
    };

    html2pdf().set(opts).from(src).save()
      .then(() => {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = label;
        // restore the toggle the user had selected
        if (prevActive && prevActive.dataset.view !== "full") applyResumeView(prevActive.dataset.view);
      })
      .catch((err) => {
        console.error("PDF generation failed:", err);
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = label;
        alert("Sorry, PDF generation failed. Try again.");
      });
  });
}

/* ============================================================
   Writing feed
   ============================================================ */
const posts = [
  { cat: "AI Engineering", title: "Agentic Commerce: Letting an LLM Do the Shopping", desc: "Notes on building an autonomous purchase flow with LangChain agents — tool design, guardrails, and where the model still needs a human.", date: "August 2026" },
  { cat: "AI Engineering", title: "RAG in Production: What the Tutorials Skip", desc: "Chunking, retrieval eval, and the unglamorous plumbing that decides whether a RAG chatbot is useful or just confident.", date: "June 2026" },
  { cat: "Data", title: "Killing the ETL Bill", desc: "How we migrated 35+ pipelines off a third-party ETL tool onto self-hosted Airflow on EC2 in 60 days, and what it cost us to learn.", date: "May 2026" },
  { cat: "Data", title: "Forecasting with XGBoost and LSTM, Honestly", desc: "A pragmatic look at seasonality, promo spikes, and why ~90% accuracy is a starting point, not a finish line.", date: "March 2026" },
  { cat: "Probability", title: "RFM Is Just Clustering With Good PR", desc: "Recency-Frequency-Monetary segmentation, when it beats a fancy model, and when it quietly misleads you.", date: "February 2026" },
  { cat: "Personal", title: "From Chemical Engineering to AI", desc: "The non-linear path — reactors to recommender systems — and what transferred better than expected.", date: "January 2026" },
];
const categories = ["All", ...Array.from(new Set(posts.map((p) => p.cat)))];
const filtersEl = document.getElementById("filters");
const feedEl = document.getElementById("feed");
let activeCat = "All";

function renderFilters() {
  if (!filtersEl) return;
  filtersEl.innerHTML = "";
  categories.forEach((c) => {
    const b = document.createElement("button");
    b.className = "filter" + (c === activeCat ? " active" : "");
    b.textContent = c;
    b.addEventListener("click", () => { activeCat = c; renderFilters(); renderFeed(); });
    filtersEl.appendChild(b);
  });
}
function renderFeed() {
  if (!feedEl) return;
  const shown = activeCat === "All" ? posts : posts.filter((p) => p.cat === activeCat);
  feedEl.innerHTML = "";
  let lastCat = null;
  shown.forEach((p) => {
    if (p.cat !== lastCat) {
      const lbl = document.createElement("div");
      lbl.className = "feed-group-label";
      lbl.textContent = p.cat;
      feedEl.appendChild(lbl);
      lastCat = p.cat;
    }
    const el = document.createElement("div");
    el.className = "post";
    el.innerHTML = `<h3 class="post-title">${p.title}</h3><p class="post-desc">${p.desc}</p><p class="post-date">${p.date}</p>`;
    feedEl.appendChild(el);
  });
}
renderFilters();
renderFeed();

/* ============================================================
   Boot
   ============================================================ */
route(location.hash ? location.hash.slice(1) : "home");
