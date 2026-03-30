const state = {
  products: [],
  articles: [],
};

const ageGate = document.getElementById("ageGate");
const enterSiteBtn = document.getElementById("enterSiteBtn");

const heroImage = document.getElementById("heroImage");
const heroTitle = document.getElementById("heroTitle");
const heroMeta = document.getElementById("heroMeta");
const heroDesc = document.getElementById("heroDesc");
const heroLink = document.getElementById("heroLink");
const heroDetailBtn = document.getElementById("heroDetailBtn");
const heroBadge = document.getElementById("heroBadge");

const articleList = document.getElementById("articleList");
const productList = document.getElementById("productList");
const rankingList = document.getElementById("rankingList");
const detailContent = document.getElementById("detailContent");
const tagCloud = document.getElementById("tagCloud");
const categoryList = document.getElementById("categoryList");

const articleSection = document.getElementById("articles");
const rankingTitle = document.querySelector("#ranking h3");
const detailHeading = document.querySelector("#detailSection .section-head h3");

const FRONT_ALLOW_KEYWORDS = [
  "素人",
  "シロウト",
  "新人",
  "デビュー",
  "初撮り",
  "初体験",
  "初出演",
  "デビュー作",
  "初脱ぎ"
];

const FRONT_BLOCK_KEYWORDS = [
  "VR",
  "8KVR",
  "VR専用",
  "ニューハーフ",
  "男の娘",
  "女装",
  "SM",
  "アナル",
  "アナルセックス",
  "蝋燭",
  "ベスト",
  "BEST",
  "総集編",
  "4時間以上作品",
  "熟女",
  "人妻",
  "レズ",
  "レズビアン"
];

function normalizeConceptText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "").trim();
}

function includesKeyword(text, keywords) {
  const normalized = normalizeConceptText(text);
  return keywords.some((keyword) => normalized.includes(normalizeConceptText(keyword)));
}

function isTargetConceptProduct(item) {
  const searchText = [
    item.title,
    item.category,
    ...(item.tags || []),
    item.maker,
    item.label
  ].filter(Boolean).join(" / ");

  const hasAllow = includesKeyword(searchText, FRONT_ALLOW_KEYWORDS);
  const hasBlock = includesKeyword(searchText, FRONT_BLOCK_KEYWORDS);

  return hasAllow && !hasBlock;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function normalizeProduct(item, index) {
  return {
    id: item.id ?? index + 1,
    title: item.title || item.name || "タイトル未設定",
    image:
      item.image ||
      item.jacket ||
      item.thumbnail ||
      item.packageImage ||
      "https://picsum.photos/seed/fallback-product/900/600",
    description:
      item.description ||
      item.comment ||
      item.excerpt ||
      "商品説明がまだありません。",
    actress: item.actress || item.performer || "出演者情報なし",
    maker: item.maker || item.brand || "メーカー不明",
    label: item.label || "レーベル不明",
    category: item.category || item.genre || "商品",
    code: item.code || item.content_id || item.productId || "未設定",
    releaseDate: item.releaseDate || item.date || "日付不明",
    duration: item.duration || item.playtime || "不明",
    price: item.price || item.salePrice || "価格未設定",
    rating: Number(item.rating || item.score || 80),
    affiliateLink:
      item.affiliateLink ||
      item.affiliateURL ||
      item.url ||
      item.detailUrl ||
      item.link ||
      "#",
    gallery: Array.isArray(item.gallery) && item.gallery.length
      ? item.gallery
      : [item.image || item.jacket || item.thumbnail].filter(Boolean),
    tags: Array.isArray(item.tags) && item.tags.length
      ? item.tags
      : [item.category || item.genre || "商品"],
    points: Array.isArray(item.points) && item.points.length
      ? item.points
      : [
          "自動取得された商品です。",
          "詳細は公式ページでご確認ください。",
          "気になる作品はサンプルと価格を公式でチェックできます。"
        ],
  };
}

function normalizeArticle(item, index) {
  const rawUrl = String(item.articleUrl || "").trim();
  return {
    id: item.id || `article-${index + 1}`,
    title: item.title || "記事タイトル未設定",
    slug: item.slug || `article-${index + 1}`,
    category: item.category || "記事",
    date: item.date || "日付不明",
    thumbnail: item.thumbnail || "https://picsum.photos/seed/fallback-article/1200/700",
    excerpt: item.excerpt || "",
    content: Array.isArray(item.content) ? item.content : [],
    relatedProductIds: Array.isArray(item.relatedProductIds) ? item.relatedProductIds : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    articleUrl: isExternalUrl(rawUrl) ? rawUrl : ""
  };
}

async function fetchJsonWithFallback(paths, fallbackValue) {
  for (const path of paths) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch (error) {
      console.warn(`Failed to load ${path}`, error);
    }
  }
  return fallbackValue;
}

async function loadAllData() {
  try {
    const [productsRes, articlesRes] = await Promise.all([
      fetch("./products.json", { cache: "no-store" }),
      fetch("./data/articles.json", { cache: "no-store" })
    ]);

    const rawProducts = await productsRes.json();
    const rawArticles = await articlesRes.json();

    const productListData = Array.isArray(rawProducts) ? rawProducts : rawProducts.products || [];
    const articleListData = Array.isArray(rawArticles) ? rawArticles : rawArticles.articles || [];

    state.products = productListData
      .map(normalizeProduct)
      .filter(isTargetConceptProduct);

    state.articles = articleListData.map(normalizeArticle);

    function renderHome() {
  const productsByDate = [...state.products].sort((a, b) => {
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
  });

  const articlesByDate = [...state.articles].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (articleSection) {
    articleSection.style.display = "none";
  }

  if (rankingTitle) {
    rankingTitle.textContent = "新着商品";
  }

  if (detailHeading) {
    detailHeading.textContent = "商品詳細";
  }

  if (productsByDate.length) {
    renderHeroFromProduct(productsByDate[0]);
    renderProducts(productsByDate);
    renderRanking([], productsByDate);
    renderCategories([], productsByDate);
    renderTagCloud([], productsByDate);
    showProduct(productsByDate[0].id);
    return;
  }

  if (articlesByDate.length) {
    renderHeroFromArticle(articlesByDate[0]);
    renderArticles(articlesByDate);
    renderRanking(articlesByDate, []);
    renderCategories(articlesByDate, []);
    renderTagCloud(articlesByDate, []);
    showArticle(articlesByDate[0].id);
    return;
  }

  renderEmptyHero();
  renderProducts([]);
  renderRanking([], []);
  renderCategories([], []);
  renderTagCloud([], []);
  detailContent.innerHTML = `<div class="empty-box">表示できる商品がまだありません。</div>`;
}

function renderHeroFromProduct(product) {
  heroBadge.textContent = "今週の注目商品";
  heroImage.src = product.image;
  heroImage.alt = product.title;
  heroImage.setAttribute("referrerpolicy", "no-referrer");
  heroTitle.textContent = product.title;
  heroMeta.textContent = `${product.releaseDate} / ${product.category} / 品番 ${product.code}`;
  heroDesc.textContent = product.description || "";
  heroLink.href = product.affiliateLink || "https://www.dmm.co.jp/";
  heroDetailBtn.textContent = "商品を見る";
  heroDetailBtn.onclick = () => showProduct(product.id);
}

function renderEmptyHero() {
  heroBadge.textContent = "準備中";
  heroImage.src = "https://picsum.photos/seed/empty-hero/1200/700";
  heroImage.alt = "準備中";
  heroTitle.textContent = "記事と商品を準備中です";
  heroMeta.textContent = "";
  heroDesc.textContent = "products.json は読み込めています。記事が未設置でもサイトは表示されます。";
  heroLink.href = "https://www.dmm.co.jp/";
  heroDetailBtn.textContent = "詳細を見る";
  heroDetailBtn.onclick = () => {
    document.getElementById("detailSection").scrollIntoView({ behavior: "smooth" });
  };
}

function renderArticles(items) {
  if (!items.length) {
    articleList.innerHTML = `<div class="empty-box">記事ファイルがまだないため、商品だけ表示しています。</div>`;
    return;
  }

  articleList.innerHTML = items
    .map((item) => `
      <article class="card">
        <div class="card-thumb">
          <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer">
        </div>
        <div>
          <div class="card-meta">
            <span>${escapeHtml(item.category)}</span>
            <span>${escapeHtml(item.date)}</span>
          </div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.excerpt)}</p>
          <div class="tag-list">
            ${(item.tags || []).map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="card-actions" style="margin-top:14px;">
            <button class="mini-btn dark" type="button" data-article-id="${escapeHtml(String(item.id))}">記事を読む</button>
          </div>
        </div>
      </article>
    `)
    .join("");

  articleList.querySelectorAll("[data-article-id]").forEach((button) => {
    button.addEventListener("click", () => showArticle(button.dataset.articleId));
  });
}

function renderProducts(items) {
  if (!items.length) {
    productList.innerHTML = `<div class="empty-box">商品はまだありません。API更新後にここへ表示されます。</div>`;
    return;
  }

  productList.innerHTML = items
    .map((item) => `
      <article class="card">
        <div class="card-thumb">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer">
        </div>
        <div>
          <div class="card-meta">
            <span>${escapeHtml(item.category)}</span>
            <span>${escapeHtml(item.releaseDate)}</span>
            <span>品番 ${escapeHtml(item.code)}</span>
          </div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.description)}</p>
          <div class="tag-list">
            ${(item.tags || []).map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="card-actions" style="margin-top:14px;">
            <button class="mini-btn dark" type="button" data-product-id="${escapeHtml(String(item.id))}">商品を見る</button>
            <a class="mini-btn" href="${escapeHtml(item.affiliateLink)}" target="_blank" rel="noopener noreferrer sponsored">FANZAで見る</a>
          </div>
        </div>
      </article>
    `)
    .join("");

  productList.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => showProduct(button.dataset.productId));
  });
}

function renderRanking(articles, products) {
  const rankingSource = articles.length
    ? articles.slice(0, 5).map((item, index) => ({
        index,
        title: item.title,
        meta: item.date,
        type: "article",
        id: item.id,
      }))
    : products.slice(0, 5).map((item, index) => ({
        index,
        title: item.title,
        meta: item.releaseDate,
        type: "product",
        id: item.id,
      }));

  if (!rankingSource.length) {
    rankingList.innerHTML = `<div class="empty-box">表示するランキングがありません。</div>`;
    return;
  }

  rankingList.innerHTML = rankingSource
    .map((item) => `
      <button class="ranking-item ranking-button" type="button" data-ranking-type="${item.type}" data-ranking-id="${escapeHtml(String(item.id))}">
        <div class="rank-num">${String(item.index + 1).padStart(2, "0")}</div>
        <div>
          <div class="ranking-item-title">${escapeHtml(item.title)}</div>
          <div class="ranking-item-meta">${escapeHtml(item.meta)}</div>
        </div>
      </button>
    `)
    .join("");

  rankingList.querySelectorAll("[data-ranking-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.rankingType === "article") {
        showArticle(button.dataset.rankingId);
      } else {
        showProduct(button.dataset.rankingId);
      }
    });
  });
}

function renderCategories(articles, products) {
  const categories = [
    ...articles.map((item) => item.category),
    ...products.flatMap((item) => String(item.category || "").split("/").map((part) => part.trim()))
  ].filter(Boolean);

  const uniqueCategories = [...new Set(categories)].slice(0, 12);

  if (!uniqueCategories.length) {
    categoryList.innerHTML = `<span class="tag">準備中</span>`;
    return;
  }

  categoryList.innerHTML = uniqueCategories
    .map((category) => `<span class="tag">${escapeHtml(category)}</span>`)
    .join("");
}

function renderTagCloud(articles, products) {
  const tags = [
    ...articles.flatMap((item) => item.tags || []),
    ...products.flatMap((item) => item.tags || [])
  ].filter(Boolean);

  const uniqueTags = [...new Set(tags)].slice(0, 24);

  if (!uniqueTags.length) {
    tagCloud.innerHTML = `<span class="tag">#準備中</span>`;
    return;
  }

  tagCloud.innerHTML = uniqueTags
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");
}

function showArticle(id, shouldScroll = true) {
  const article = state.articles.find((item) => String(item.id) === String(id));
  if (!article) return;

  if (article.articleUrl) {
    window.open(article.articleUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const relatedProducts = state.products.filter((p) => (article.relatedProductIds || []).includes(p.id));

  const contentHtml = (article.content || [])
    .map((text) => `<p>${escapeHtml(text)}</p>`)
    .join("");

  const relatedHtml = relatedProducts.length
    ? relatedProducts
        .map((item) => `
          <article class="card" style="margin-top:12px;">
            <div class="card-thumb">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer">
            </div>
            <div>
              <div class="card-meta">
                <span>${escapeHtml(item.category)}</span>
                <span>${escapeHtml(item.releaseDate)}</span>
              </div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.description)}</p>
              <div class="card-actions">
                <button class="mini-btn dark" type="button" data-related-product-id="${escapeHtml(String(item.id))}">商品を見る</button>
                <a class="mini-btn" href="${escapeHtml(item.affiliateLink)}" target="_blank" rel="noopener noreferrer sponsored">FANZAで見る</a>
              </div>
            </div>
          </article>
        `)
        .join("")
    : `<div class="empty-box">関連商品はまだありません。</div>`;

  detailContent.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHtml(article.thumbnail)}" alt="${escapeHtml(article.title)}" referrerpolicy="no-referrer">
    </div>
    <div class="card-meta">
      <span>${escapeHtml(article.category)}</span>
      <span>${escapeHtml(article.date)}</span>
    </div>
    <h2 class="detail-title">${escapeHtml(article.title)}</h2>
    <p class="detail-desc">${escapeHtml(article.excerpt)}</p>
    <div class="cta-box">
      <h4>この記事について</h4>
      <p>自分で書いた特集・レビュー記事です。下に関連商品も表示しています。</p>
    </div>
    <div class="detail-article-content">
      ${contentHtml || `<div class="empty-box">本文はまだありません。</div>`}
    </div>
    <h3 style="margin-top:28px;">関連商品</h3>
    <div>${relatedHtml}</div>
  `;

  detailContent.querySelectorAll("[data-related-product-id]").forEach((button) => {
    button.addEventListener("click", () => showProduct(button.dataset.relatedProductId));
  });

  if (shouldScroll) {
    document.getElementById("detailSection").scrollIntoView({ behavior: "smooth" });
  }
}

function showProduct(id, shouldScroll = true) {
  const item = state.products.find((product) => String(product.id) === String(id));
  if (!item) return;

  const galleryHtml = (item.gallery || [])
    .slice(0, 4)
    .map((img) => `<img src="${escapeHtml(img)}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer">`)
    .join("");

  const pointsHtml = (item.points || [])
    .map((point) => `<div class="point-item">${escapeHtml(point)}</div>`)
    .join("");

  detailContent.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" referrerpolicy="no-referrer">
    </div>
    <div class="card-meta">
      <span>${escapeHtml(item.category)}</span>
      <span>${escapeHtml(item.releaseDate)}</span>
      <span>品番 ${escapeHtml(item.code)}</span>
    </div>
    <h2 class="detail-title">${escapeHtml(item.title)}</h2>
    <p class="detail-info">
      出演者: ${escapeHtml(item.actress)} / メーカー: ${escapeHtml(item.maker)} / レーベル: ${escapeHtml(item.label)}
    </p>
    <p class="detail-desc">${escapeHtml(item.description)}</p>
    <div class="cta-box">
      <h4>公式で確認</h4>
      <p>価格・サンプル・配信状況は公式ページでご確認ください。</p>
      <div class="hero-buttons">
        <a href="${escapeHtml(item.affiliateLink)}" target="_blank" rel="noopener noreferrer sponsored" class="btn primary">
          FANZAで確認する
        </a>
      </div>
    </div>
    <h3>この商品のポイント</h3>
    <div class="point-list">${pointsHtml || `<div class="empty-box">ポイントはまだありません。</div>`}</div>
    <h3 style="margin-top:28px;">サンプルイメージ</h3>
    <div class="detail-gallery">
      ${galleryHtml || `<div class="empty-box">画像がありません。</div>`}
    </div>
    <h3 style="margin-top:28px;">商品情報</h3>
    <table class="detail-table">
      <tr><th>タイトル</th><td>${escapeHtml(item.title)}</td></tr>
      <tr><th>出演者</th><td>${escapeHtml(item.actress)}</td></tr>
      <tr><th>メーカー</th><td>${escapeHtml(item.maker)}</td></tr>
      <tr><th>レーベル</th><td>${escapeHtml(item.label)}</td></tr>
      <tr><th>品番</th><td>${escapeHtml(item.code)}</td></tr>
      <tr><th>配信日</th><td>${escapeHtml(item.releaseDate)}</td></tr>
      <tr><th>収録時間</th><td>${escapeHtml(item.duration)}</td></tr>
      <tr><th>価格</th><td>${escapeHtml(item.price)}</td></tr>
      <tr><th>タグ</th><td>${escapeHtml((item.tags || []).join(" / "))}</td></tr>
    </table>
  `;

  if (shouldScroll) {
    document.getElementById("detailSection").scrollIntoView({ behavior: "smooth" });
  }
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

window.showArticle = showArticle;
window.showProduct = showProduct;

setupAgeGate();
loadAllData();
