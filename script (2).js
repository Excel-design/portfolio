/* =====================================================
   KONFIGURASI: ganti dengan username GitHub kamu
   (atau buka halaman dengan ?user=usernamekamu)
   ===================================================== */
const GITHUB_USERNAME = "octocat";

const params = new URLSearchParams(location.search);
const USERNAME = params.get("user") || GITHUB_USERNAME;
const API = "https://api.github.com";

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572a5", HTML: "#e34c26",
  CSS: "#563d7c", PHP: "#4f5d95", Java: "#b07219", "C++": "#f34b7d", C: "#555555",
  "C#": "#178600", Go: "#00add8", Rust: "#dea584", Dart: "#00b4ab", Kotlin: "#a97bff",
  Swift: "#f05138", Vue: "#41b883", Shell: "#89e051", Ruby: "#701516",
  "Jupyter Notebook": "#da5b0b", Blade: "#f7523f", SCSS: "#c6538c"
};
const colorOf = (l) => LANG_COLORS[l] || "#8b93a7";

const $ = (id) => document.getElementById(id);
let repos = [];

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

/* ---------- Helper ---------- */
const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (d) => new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (res.status === 404) throw new Error("Username GitHub tidak ditemukan.");
  if (res.status === 403) throw new Error("Batas request GitHub API tercapai. Coba lagi nanti.");
  if (!res.ok) throw new Error("Gagal mengambil data dari GitHub.");
  return res.json();
}

/* ---------- Profil ---------- */
function renderProfile(u) {
  const name = u.name || u.login;
  document.title = `${name} | Portfolio`;
  $("name").textContent = name;
  $("bio").textContent = u.bio || "Developer yang suka membangun hal-hal keren.";
  $("location").textContent = u.location ? "📍 " + u.location : "";
  $("company").textContent = u.company ? "🏢 " + u.company : "";
  $("githubLink").href = u.html_url;
  $("contactLink").href = u.blog && /^https?:/.test(u.blog) ? u.blog : u.html_url;
  $("footerName").textContent = name;
  $("statRepos").textContent = u.public_repos;
  $("statFollowers").textContent = u.followers;
  $("statSince").textContent = new Date(u.created_at).getFullYear();
}

/* ---------- Bahasa ---------- */
function renderLanguages() {
  const count = {};
  repos.forEach((r) => { if (r.language) count[r.language] = (count[r.language] || 0) + 1; });
  const entries = Object.entries(count).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;

  $("langBar").innerHTML = entries
    .map(([l, n]) => `<span title="${esc(l)}" style="width:${(n / total) * 100}%;background:${colorOf(l)}"></span>`)
    .join("");
  $("langLegend").innerHTML = entries
    .map(([l, n]) => `<span><i style="background:${colorOf(l)}"></i>${esc(l)} ${Math.round((n / total) * 100)}%</span>`)
    .join("");

  $("langFilter").innerHTML =
    `<option value="">Semua bahasa</option>` +
    entries.map(([l]) => `<option value="${esc(l)}">${esc(l)}</option>`).join("");
}

/* ---------- Repo ---------- */
function renderRepos() {
  const q = $("search").value.trim().toLowerCase();
  const lang = $("langFilter").value;
  const sort = $("sort").value;

  let list = repos.filter((r) =>
    (!lang || r.language === lang) &&
    (!q || r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q))
  );

  list.sort((a, b) =>
    sort === "stars" ? b.stargazers_count - a.stargazers_count
    : sort === "name" ? a.name.localeCompare(b.name)
    : new Date(b.pushed_at) - new Date(a.pushed_at)
  );

  $("empty").hidden = list.length > 0;
  $("repoGrid").innerHTML = list.map((r) => `
    <article class="card">
      <h3>${esc(r.name)}</h3>
      <p>${esc(r.description || "Belum ada deskripsi.")}</p>
      ${r.topics && r.topics.length ? `<div class="topics">${r.topics.slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      <div class="card-foot">
        <span>${r.language ? `<i class="lang-dot" style="background:${colorOf(r.language)}"></i>${esc(r.language)}` : "&nbsp;"}</span>
        <span>⭐ ${r.stargazers_count} · 🍴 ${r.forks_count}</span>
      </div>
      <div class="card-foot"><span>Diperbarui ${fmtDate(r.pushed_at)}</span></div>
      <div class="card-links">
        <a href="${r.html_url}" target="_blank" rel="noopener">Kode →</a>
        ${r.homepage ? `<a href="${esc(r.homepage.startsWith("http") ? r.homepage : "https://" + r.homepage)}" target="_blank" rel="noopener">Demo →</a>` : ""}
      </div>
    </article>`).join("");

  // animasi muncul
  document.querySelectorAll(".card").forEach((c, i) => setTimeout(() => c.classList.add("show"), i * 40));
}

["input", "change"].forEach((ev) => {
  $("search").addEventListener(ev, renderRepos);
  $("langFilter").addEventListener(ev, renderRepos);
  $("sort").addEventListener(ev, renderRepos);
});

/* ---------- Init ---------- */
async function init() {
  $("year").textContent = new Date().getFullYear();
  $("repoGrid").innerHTML = '<div class="skeleton"></div>'.repeat(3);

  try {
    const [user, data] = await Promise.all([
      getJSON(`${API}/users/${USERNAME}`),
      getJSON(`${API}/users/${USERNAME}/repos?per_page=100&sort=updated`)
    ]);
    // tampilkan hanya repo asli (bukan fork), bisa dihapus filter ini kalau mau semua
    repos = data.filter((r) => !r.fork);
    renderProfile(user);
    $("statStars").textContent = repos.reduce((s, r) => s + r.stargazers_count, 0);
    renderLanguages();
    renderRepos();
  } catch (err) {
    $("name").textContent = "Oops!";
    $("bio").textContent = err.message;
    $("repoGrid").innerHTML = "";
  }
}
init();
