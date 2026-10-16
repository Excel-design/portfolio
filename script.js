
const CONFIG = {
  name: "Excel Darizq S",
  bio: "Membuat website, proyek IoT, dan mencari bug web/app.",
  github: "",                                
  contact: ""                                
};

const SKILLS = ["PHP", "JavaScript", "CSS", "Python", "HTML", "Arduino", "ESP32"];

const PROJECTS = [
  {
    title: "Web Tahun Baru",
    category: "Web",
    icon: "🎆",
    desc: "Website bertema perayaan tahun baru dengan tampilan interaktif dan animasi yang meriah.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "", demo: ""
  },
  {
    title: "Web Bucin",
    category: "Web",
    icon: "💕",
    desc: "Website romantis untuk mengungkapkan perasaan kepada pasangan, dengan desain manis dan efek interaktif.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "", demo: ""
  },
  {
    title: "Web E-Commerce",
    category: "Web",
    icon: "🛒",
    desc: "Website toko online dengan katalog produk, keranjang belanja, dan alur pemesanan.",
    tags: ["PHP", "JavaScript", "CSS"],
    link: "", demo: ""
  },
  {
    title: "IoT Smart Parking",
    category: "IoT",
    icon: "🅿️",
    desc: "Sistem parkir pintar berbasis ESP32 yang memantau ketersediaan slot parkir secara otomatis.",
    tags: ["ESP32", "IoT", "Sensor"],
    link: "", demo: ""
  },
  {
    title: "Tempat Sampah Pintar",
    category: "IoT",
    icon: "🗑️",
    desc: "Tempat sampah otomatis berbasis mikrokontroler yang bekerja dengan sensor.",
    tags: ["IoT", "Sensor", "Mikrokontroler"],
    link: "", demo: ""
  },
  {
    title: "Mobil Remote Arduino",
    category: "IoT",
    icon: "🚗",
    desc: "Mobil yang dapat dikendalikan dari jarak jauh menggunakan Arduino.",
    tags: ["Arduino", "Elektronika", "Remote"],
    link: "", demo: ""
  },
  {
    title: "Bug Hunting",
    category: "Keamanan",
    icon: "🐞",
    desc: "Mencari dan melaporkan celah keamanan serta bug pada aplikasi web secara bertanggung jawab.",
    tags: ["Keamanan Web", "Bug Hunting"],
    link: "", demo: ""
  }
];

/* ---------- Helper ---------- */
const $ = (id) => document.getElementById(id);
const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let activeCat = "";

/* ---------- Tema ---------- */
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("themeToggle").textContent = t === "dark" ? "🌙" : "☀️";
  try { localStorage.setItem("theme", t); } catch (e) {}
}
(function initTheme() {
  let t = "dark";
  try { t = localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"); } catch (e) {}
  setTheme(t);
})();
$("themeToggle").addEventListener("click", () => {
  setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* ---------- Profil ---------- */
function renderProfile() {
  document.title = `${CONFIG.name} | Portfolio`;
  $("name").textContent = CONFIG.name;
  $("bio").textContent = CONFIG.bio;
  $("footerName").textContent = CONFIG.name;
  $("year").textContent = new Date().getFullYear();

  if (CONFIG.github) {
    $("githubLink").href = CONFIG.github;
    $("githubLink").hidden = false;
  }
  const contact = CONFIG.contact || CONFIG.github;
  if (contact) {
    $("contactLink").href = contact;
    $("contactLink").hidden = false;
  }

  const cats = [...new Set(PROJECTS.map((p) => p.category))];
  $("statProjects").textContent = PROJECTS.length;
  $("statCats").textContent = cats.length;
  $("statTech").textContent = SKILLS.length;

  $("skillList").innerHTML = SKILLS.map((s) => `<span class="chip">${esc(s)}</span>`).join("");

  $("filters").innerHTML = ["Semua", ...cats]
    .map((c) => `<button class="filter${c === "Semua" ? " active" : ""}" data-cat="${c === "Semua" ? "" : esc(c)}">${esc(c)}</button>`)
    .join("");
  $("filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    activeCat = btn.dataset.cat;
    document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === btn));
    renderProjects();
  });
}

/* ---------- Proyek ---------- */
function renderProjects() {
  const q = $("search").value.trim().toLowerCase();
  const list = PROJECTS.filter((p) =>
    (!activeCat || p.category === activeCat) &&
    (!q || (p.title + " " + p.desc + " " + p.tags.join(" ")).toLowerCase().includes(q))
  );

  $("empty").hidden = list.length > 0;
  $("projectGrid").innerHTML = list.map((p) => `
    <article class="card">
      <div class="icon">${p.icon}</div>
      <span class="cat">${esc(p.category)}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.desc)}</p>
      <div class="topics">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      ${p.link || p.demo ? `<div class="card-links">
        ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Kode →</a>` : ""}
        ${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Demo →</a>` : ""}
      </div>` : ""}
    </article>`).join("");

  document.querySelectorAll(".card").forEach((c, i) => setTimeout(() => c.classList.add("show"), i * 50));
}

$("search").addEventListener("input", renderProjects);

renderProfile();
renderProjects();
