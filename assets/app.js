const GROWTH = {
  upright: "直立", climbing: "攀援", shrub: "灌木", tree: "乔木", rosette: "莲座",
  epiphytic: "附生", trailing: "垂吊", spreading: "蔓延", groundcover: "地被", other: "其他",
};
const CARE = { very_easy: "极易", easy: "容易", moderate: "中等", hard: "较难", expert: "专家级" };
const CARE_ORDER = Object.keys(CARE);
const IUCN = {
  LC: "无危 LC", NT: "近危 NT", VU: "易危 VU", EN: "濒危 EN", CR: "极危 CR",
  EW: "野外灭绝 EW", EX: "灭绝 EX", DD: "数据缺乏 DD",
};

const $ = (id) => document.getElementById(id);
const el = { q: $("q"), grid: $("grid"), count: $("count"), empty: $("empty"), dlg: $("dlg"), detail: $("detail") };
const filters = {
  growth: $("f-growth"), care: $("f-care"), family: $("f-family"), iucn: $("f-iucn"),
};
let all = [];

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fillSelect(select, label, values, labels = {}) {
  select.innerHTML = `<option value="">${label}</option>` +
    values.map((v) => `<option value="${esc(v)}">${esc(labels[v] || v)}</option>`).join("");
}

function init() {
  $("total").textContent = all.length;
  const uniq = (key) => [...new Set(all.map((s) => s[key]).filter(Boolean))];
  fillSelect(filters.growth, "全部生长类型", uniq("growth_type").sort(), GROWTH);
  fillSelect(filters.care, "全部养护难度", CARE_ORDER.filter((c) => uniq("care_difficulty").includes(c)), CARE);
  fillSelect(filters.family, "全部科", uniq("family").sort());
  fillSelect(filters.iucn, "全部 IUCN 等级", Object.keys(IUCN).filter((c) => uniq("iucnCategory").includes(c)), IUCN);

  readHash();
  [el.q, ...Object.values(filters), $("sort")].forEach((n) => n.addEventListener("input", render));
  $("reset").addEventListener("click", () => {
    el.q.value = "";
    Object.values(filters).forEach((s) => (s.value = ""));
    $("sort").value = "name";
    render();
  });
  el.grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openDetail(card.dataset.id);
  });
  el.dlg.addEventListener("click", (e) => { if (e.target === el.dlg) el.dlg.close(); });
  el.dlg.addEventListener("close", () => { if (location.hash.startsWith("#s=")) history.replaceState(null, "", location.pathname); });
  render();
  const m = location.hash.match(/^#s=(\d+)$/);
  if (m) openDetail(m[1]);
}

function readHash() {
  const params = new URLSearchParams(location.search);
  el.q.value = params.get("q") || "";
}

function matches(s, q) {
  if (!q) return true;
  const hay = [s.scientificName, ...(s.commonNames || []), s.family, s.genus, s.origin, s.description]
    .join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).every((t) => hay.includes(t));
}

function render() {
  const q = el.q.value.trim();
  const g = filters.growth.value, c = filters.care.value, f = filters.family.value, i = filters.iucn.value;
  const sort = $("sort").value;
  const list = all.filter((s) =>
    matches(s, q) && (!g || s.growth_type === g) && (!c || s.care_difficulty === c) &&
    (!f || s.family === f) && (!i || s.iucnCategory === i));
  list.sort((a, b) => {
    if (sort === "family") return (a.family || "").localeCompare(b.family || "") || a.scientificName.localeCompare(b.scientificName);
    if (sort === "care") return CARE_ORDER.indexOf(a.care_difficulty) - CARE_ORDER.indexOf(b.care_difficulty) || a.scientificName.localeCompare(b.scientificName);
    return a.scientificName.localeCompare(b.scientificName);
  });
  el.count.textContent = `共 ${list.length} 个物种`;
  el.empty.hidden = list.length > 0;
  el.grid.innerHTML = list.map(cardHtml).join("");
}

function cardHtml(s) {
  const name = s.scientificNameWithoutAuthor || s.scientificName;
  const cn = (s.commonNames || []).slice(0, 3).join(" / ");
  return `<button class="card" data-id="${esc(s.id)}">
    <h2>${esc(name)}</h2>
    ${cn ? `<div class="cn">${esc(cn)}</div>` : ""}
    <div class="meta">${esc(s.family)} · ${esc(s.origin)}</div>
    <div class="tags">
      <span class="tag">${esc(GROWTH[s.growth_type] || s.growth_type)}</span>
      <span class="tag care-${esc(s.care_difficulty)}">${esc(CARE[s.care_difficulty] || s.care_difficulty)}</span>
      ${s.iucnCategory ? `<span class="tag">${esc(s.iucnCategory)}</span>` : ""}
    </div>
  </button>`;
}

function openDetail(id) {
  const s = all.find((x) => x.id === String(id));
  if (!s) return;
  const rows = [
    ["科", s.family], ["属", s.genus], ["原产地", s.origin],
    ["生长类型", GROWTH[s.growth_type] || s.growth_type], ["株高", s.height_range],
    ["养护难度", CARE[s.care_difficulty] || s.care_difficulty],
    ["IUCN", s.iucnCategory && (IUCN[s.iucnCategory] || s.iucnCategory)],
    ["常用名", (s.commonNames || []).join("、")],
  ].filter(([, v]) => v);
  const links = [];
  if (s.gbifId) links.push(`<a href="https://www.gbif.org/species/${encodeURIComponent(s.gbifId)}" target="_blank" rel="noopener">GBIF</a>`);
  if (s.powoId) links.push(`<a href="https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:${encodeURIComponent(s.powoId)}" target="_blank" rel="noopener">POWO</a>`);
  el.detail.innerHTML = `
    <h2>${esc(s.scientificNameWithoutAuthor || s.scientificName)}
      <span class="auth">${esc(s.scientificNameAuthorship || "")}</span></h2>
    <p>${esc(s.description)}</p>
    <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
    <div class="links">${links.join("")}</div>`;
  history.replaceState(null, "", `#s=${s.id}`);
  if (!el.dlg.open) el.dlg.showModal();
}

fetch("data/species.json")
  .then((r) => r.json())
  .then((data) => { all = data; init(); })
  .catch(() => { el.count.textContent = "数据加载失败,请通过 http 服务器访问(不要直接打开文件)。"; });
