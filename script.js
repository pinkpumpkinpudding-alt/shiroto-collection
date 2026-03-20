const state = {
  products: [],
  currentProduct: null,
};

const ageGate = document.getElementById("ageGate");
const enterSiteBtn = document.getElementById("enterSiteBtn");

const heroImage = document.getElementById("heroImage");
const heroTitle = document.getElementById("heroTitle");
const heroMeta = document.getElementById("heroMeta");
const heroDesc = document.getElementById("heroDesc");
const heroLink = document.getElementById("heroLink");
const heroDetailBtn = document.getElementById("heroDetailBtn");

const postList = document.getElementById("postList");
const rankingList = document.getElementById("rankingList");
const detailContent = document.getElementById("detailContent");
const tagCloud = document.getElementById("tagCloud");

function normalizeProduct(item, index) {
  return {
    id: item.id || index + 1,
    title: item.title || item.name || "タイトル未設定",
    image:
      item.image ||
      item.jacket ||
      item.thumbnail ||
      item.packageImage ||
      "https://via.placeholder.com/800x500?text=No+Image",
    description:
      item.description ||
      item.comment ||
      item.excerpt ||
      "作品紹介文がまだ設定されていません。",
    actress: item.actress || item.performer || "出演者情報なし",
    maker: item.maker || item.brand || "メーカー不明",
    label: item.label || "レーベル不明",
    category: item.category || item.genre || "素人系",
    code: item.code || item.content_id || item.productId || "未設定",
    releaseDate: item.releaseDate || item.date || "日付不明",
    duration: item.duration || item.playtime || "不明",
    price: item.price || item.salePrice || "価格未設定",
    rating: Number(item.rating || item.score || 80),
    affiliateLink:
      item.affiliateLink ||
      item.url ||
      item.detailUrl ||
      item.link ||
      "#",
    gallery: Array.isArray(item.gallery)
      ? item.gallery
      : [item.image || item.jacket || item.thumbnail].filter(Boolean),
    tags: Array.isArray(item.tags)
      ? item.tags
      : [item.category || item.genre || "素人系"],
    points: Array.isArray(item.points)
      ? item.points
      : [
          "自然な空気感があり、レビュー記事との相性が良いです。",
          "作品ページへの導線が作りやすい構成です。",
          "気になったら公式サンプルで確認しやすいタイプです。",
        ],
  };
}

async function loadProducts() {
  try {
    const res = await fetch("./products.json");
    const raw = await res.json();

    const list = Array.isArray(raw) ? raw : raw.products || [];
    state.products = list.map(normalizeProduct);

    if (!state.products.length) {
      postList.innerHTML = "<p>作品データがありません。</p>";
      return;
    }

    renderHome();
  } catch (error) {
    console.error(error);
    postList.innerHTML = "<p>データの読み込みに失敗しました。</p>";
  }
}

function renderHome() {
  const sortedByLatest = [...state.products].sort((a, b) => {
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
  });

  const sortedByRating = [...state.products].sort((a, b) => b.rating - a.rating);

  const featured = sortedByLatest[0];
  state.currentProduct = featured;

  renderHero(featured);
  renderPostList(sortedByLatest);
  renderRanking(sortedByRating.slice(0, 8));
  renderDetail(featured);
  renderTagCloud(state.products);
}

function renderHero(item) {
  heroImage.src = item.image;
  heroImage.alt = item.title;
  heroTitle.textContent = item.title;
  heroMeta.textContent = `${item.releaseDate} / ${item.category} / 品番 ${item.code}`;
  heroDesc.textContent = item.description;
  heroLink.href = item.affiliateLink;

  heroDetailBtn.onclick = () => {
    renderDetail(item);
    document.getElementById("detailSection").scrollIntoView({ behavior: "smooth" });
  };
}

function renderPostList(items) {
  postList.innerHTML = items
    .map(
      (item) => `
      <article class="post-card">
        <div class="post-thumb">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
        </div>
        <div>
          <div class="post-meta">
            <span>${escapeHtml(item.category)}</span>
            <span>${escapeHtml(item.releaseDate)}</span>
            <span>品番 ${escapeHtml(item.code)}</span>
          </div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.description)}</p>
          <div class="tag-list">
            ${item.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="post-actions" style="margin-top:14px;">
            <button class="mini-btn dark" onclick="showDetail(${item.id})">レビューを見る</button>
            <a class="mini-btn" href="${escapeHtml(item.affiliateLink)}" target="_blank" rel="noopener noreferrer sponsored">FANZAで見る</a>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

function renderRanking(items) {
  rankingList.innerHTML = items
    .map(
      (item, index) => `
      <a class="ranking-item" href="javascript:void(0)" onclick="showDetail(${item.id})">
        <div class="rank-num">${String(index + 1).padStart(2, "0")}</div>
        <div>
          <div class="ranking-item-title">${escapeHtml(item.title)}</div>
          <div class="ranking-item-meta">${escapeHtml(item.releaseDate)}</div>
        </div>
      </a>
    `
    )
    .join("");
}

function renderDetail(item) {
  state.currentProduct = item;

  const galleryHtml = (item.gallery || [])
    .slice(0, 4)
    .map(
      (img) => `<img src="${escapeHtml(img)}" alt="${escapeHtml(item.title)}">`
    )
    .join("");

  const pointsHtml = (item.points || [])
    .map((point) => `<div class="point-item">${escapeHtml(point)}</div>`)
    .join("");

  detailContent.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
    </div>

    <div class="post-meta">
      <span>${escapeHtml(item.category)}</span>
      <span>${escapeHtml(item.releaseDate)}</span>
      <span>品番 ${escapeHtml(item.code)}</span>
    </div>

    <h2 class="detail-title">${escapeHtml(item.title)}</h2>
    <p class="detail-info">
      出演者: ${escapeHtml(item.actress)} / メーカー: ${escapeHtml(item.maker)} / 評価: ${escapeHtml(String(item.rating))}
    </p>
    <p class="detail-desc">${escapeHtml(item.description)}</p>

    <div class="cta-box">
      <h4>気になるなら公式でチェック</h4>
      <p>サンプル確認や詳細チェックは公式ページから行えます。</p>
      <div class="hero-buttons">
        <a href="${escapeHtml(item.affiliateLink)}" target="_blank" rel="noopener noreferrer sponsored" class="btn primary">
          FANZAで確認する
        </a>
      </div>
    </div>

    <h3>レビュー要点</h3>
    <div class="point-list">
      ${pointsHtml}
    </div>

    <h3 style="margin-top:28px;">サンプルイメージ</h3>
    <div class="detail-gallery">
      ${galleryHtml || `<p>画像がありません。</p>`}
    </div>

    <h3 style="margin-top:28px;">作品情報</h3>
    <table class="detail-table">
      <tr><th>タイトル</th><td>${escapeHtml(item.title)}</td></tr>
      <tr><th>出演者</th><td>${escapeHtml(item.actress)}</td></tr>
      <tr><th>メーカー</th><td>${escapeHtml(item.maker)}</td></tr>
      <tr><th>レーベル</th><td>${escapeHtml(item.label)}</td></tr>
      <tr><th>品番</th><td>${escapeHtml(item.code)}</td></tr>
      <tr><th>配信日</th><td>${escapeHtml(item.releaseDate)}</td></tr>
      <tr><th>収録時間</th><td>${escapeHtml(item.duration)}</td></tr>
      <tr><th>価格</th><td>${escapeHtml(item.price)}</td></tr>
      <tr><th>タグ</th><td>${escapeHtml(item.tags.join(" / "))}</td></tr>
    </table>
  `;
}

function renderTagCloud(items) {
  const tagSet = new Set();

  items.forEach((item) => {
    (item.tags || []).forEach((tag) => tagSet.add(tag));
  });

  tagCloud.innerHTML = [...tagSet]
    .slice(0, 20)
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");
}

function showDetail(id) {
  const product = state.products.find((item) => String(item.id) === String(id));
  if (!product) return;

  renderDetail(product);
  document.getElementById("detailSection").scrollIntoView({ behavior: "smooth" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupAgeGate() {
  const accepted = localStorage.getItem("adult_site_verified");

  if (accepted === "yes") {
    ageGate.classList.add("hidden");
    return;
  }

  enterSiteBtn.addEventListener("click", () => {
    localStorage.setItem("adult_site_verified", "yes");
    ageGate.classList.add("hidden");
  });
}

window.showDetail = showDetail;

setupAgeGate();
loadProducts();
