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

const articleSection = document.getElementById("articles");
const articleList = document.getElementById("articleList");
const productList = document.getElementById("productList");
const rankingList = document.getElementById("rankingList");
const detailContent = document.getElementById("detailContent");
const tagCloud = document.getElementById("tagCloud");
const categoryList = document.getElementById("categoryList");
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
  "初脱ぎ",
  "新卒",
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
  "レズビアン",
  "M男",
  "女王様",
  "ハード系",
];

function normalizeProduct(item, index) {
  return {
    id: item.id ?? index + 1,
    title: item.title || item.name || "タイトル未設定",
  image:
  item.image ||
  item.jacket ||
  item.thumbnail ||
  item.packageImage ||
  "",
    description:
      item.description ||
      item.comment ||
      item.excerpt ||
      "商品説明がありません。",
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
    gallery:
      Array.isArray(item.gallery) && item.gallery.length
        ? item.gallery
        : [item.image || item.jacket || item.thumbnail].filter(Boolean),
    tags:
      Array.isArray(item.tags) && item.tags.length
        ? item.tags
        : [item.category || item.genre || "商品"],
    points:
      Array.isArray(item.points) && item.points.length
        ? item.points
        : [
            "素人・新人デビュー系の作品を優先して表示しています。",
            "価格・サンプル・配信状況は公式ページでご確認ください。",
            "気になる作品は詳細画面からそのまま確認できます。",
          ],
  };
}

function normalizeArticle(item, index) {
  return {
    id: item.id || `article-${index + 1}`,
    title: item.title || "記事タイトル未設定",
    slug: item.slug || `article-${index + 1}`,
    category: item.category || "記事",
    date: item.date || "日付不明",
    thumbnail:
      item.thumbnail || "https://picsum.photos/seed/fallback-article/1200/700",
    excerpt: item.excerpt || "",
    content: Array.isArray(item.content) ? item.content : [],
    relatedProductIds: Array.isArray(item.relatedProductIds)
      ? item.relatedProductIds
      : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    articleUrl: item.articleUrl || "",
  };
}

function normalizeConceptText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "").trim();
}

function includesKeyword(text, keywords) {
  const normalized = normalizeConceptText(text);
  return keywords.some((keyword) =>
    normalized.includes(normalizeConceptText(keyword))
  );
}

function isTargetConceptProduct(item) {
  const searchText = [
    item.title,
    item.category,
    item.description,
    item.actress,
    item.maker,
    item.label,
    ...(item.tags || []),
  ]
    .filter(Boolean)
    .join(" / ");

  const hasAllow = includesKeyword(searchText, FRONT_ALLOW_KEYWORDS);
  const hasBlock = includesKeyword(searchText, FRONT_BLOCK_KEYWORDS);

  return hasAllow && !hasBlock;
}

function toDateValue(value) {
  const time = new Date(value || "").getTime();
  return Number.isFinite(time) ? time : 0;
}

async function fetchJsonSafe(url, fallbackValue = []) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.status}`);
      return fallbackValue;
    }
    return await res.json();
  } catch (error) {
    console.warn(`Failed to fetch ${url}:`, error);
    return fallbackValue;
  }
}

async function loadAllData() {
  try {
    const rawProducts = await fetchJsonSafe("./products.json", []);
    const rawArticles = await fetchJsonSafe("./data/articles.json", []);

    const productListData = Array.isArray(rawProducts)
      ? rawProducts
      : rawProducts.products || [];
    const articleListData = Array.isArray(rawArticles)
      ? rawArticles
      : rawArticles.articles || [];

    state.products = productListData
      .map(normalizeProduct)
      .filter(isTargetConceptProduct)
      .sort((a, b) => toDateValue(b.releaseDate) - toDateValue(a.releaseDate));

    state.articles = articleListData
      .map(normalizeArticle)
      .sort((a, b) => toDateValue(b.date) - toDateValue(a.date));

    renderHome();
  } catch (error) {
    console.error(error);
    if (articleList) {
      articleList.innerHTML = `<div class="empty-box">記事データの読み込みに失敗しました。</div>`;
    }
    if (productList) {
      productList.innerHTML = `<div class="empty-box">商品データの読み込みに失敗しました。</div>`;
    }
    if (detailContent) {
      detailContent.innerHTML = `<div class="empty-box">詳細データの読み込みに失敗しました。</div>`;
    }
  }
}

function renderHome() {
  const productsByDate = [...state.products].sort(
    (a, b) => toDateValue(b.releaseDate) - toDateValue(a.releaseDate)
  );
  const articlesByDate = [...state.articles].sort(
    (a, b) => toDateValue(b.date) - toDateValue(a.date)
  );

  if (articleSection) {
    articleSection.style.display = productsByDate.length ? "none" : "";
  }

  if (rankingTitle) {
    rankingTitle.textContent = productsByDate.length ? "新着商品" : "人気記事";
  }

  if (detailHeading) {
    detailHeading.textContent = productsByDate.length
      ? "商品詳細"
      : "記事 / 商品 詳細";
  }

  if (productsByDate.length) {
    renderHeroFromProduct(productsByDate[0]);
    renderProducts(productsByDate);
    renderRanking([], productsByDate);
    renderCategories([], productsByDate);
    renderTagCloud([], productsByDate);
    if (articleList) {
      articleList.innerHTML = "";
    }
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
  if (detailContent) {
    detailContent.innerHTML = `<div class="empty-box">表示できる商品がまだありません。</div>`;
  }
}

function renderHeroFromArticle(article) {
  const firstRelated = state.products.find((p) =>
    (article.relatedProductIds || []).includes(p.id)
  );

  heroBadge.textContent = "今週の注目記事";
  heroImage.src = article.thumbnail;
  heroImage.alt = article.title;
  heroImage.setAttribute("referrerpolicy", "no-referrer");
  heroTitle.textContent = article.title;
  heroMeta.textContent = `${article.date} / ${article.category}`;
  heroDesc.textContent = article.excerpt || "";
  heroLink.href = firstRelated?.affiliateLink || "https://www.dmm.co.jp/";
  heroDetailBtn.textContent = article.articleUrl ? "記事を読む" : "詳細を見る";
  heroDetailBtn.onclick = () => {
    if (article.articleUrl) {
      window.location.href = article.articleUrl;
    } else {
      showArticle(article.id);
    }
  };
}

function renderHeroFromProduct(product) {
  heroBadge.textContent = "最新の注目商品";
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
  heroTitle.textContent = "商品を準備中です";
  heroMeta.textContent = "";
  heroDesc.textContent =
    "条件に合う素人・新人デビュー作品が読み込まれるとここに表示されます。";
  heroLink.href = "https://www.dmm.co.jp/";
  heroDetailBtn.textContent = "詳細を見る";
  heroDetailBtn.onclick = () => {
    document.getElementById("detailSection").scrollIntoView({
      behavior: "smooth",
    });
  };
}

function renderArticles(items) {
  if (!articleList) return;

  if (!items.length) {
    articleList.innerHTML = `<div class="empty-box">記事はまだありません。</div>`;
    return;
  }

  articleList.innerHTML = items
    .map(
      (item) => `
        <article class="card">
          <div class="card-thumb">
            <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(
        item.title
      )}" referrerpolicy="no-referrer">
          </div>
          <div>
            <div class="card-meta">
              <span>${escapeHtml(item.category)}</span>
              <span>${escapeHtml(item.date)}</span>
            </div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.excerpt)}</p>
            <div class="tag-list">
              ${(item.tags || [])
                .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
                .join("")}
            </div>
            <div class="card-actions" style="margin-top:14px;">
              ${
                item.articleUrl
                  ? `<a class="mini-btn dark" href="${escapeHtml(
                      item.articleUrl
                    )}">記事を読む</a>`
                  : `<button class="mini-btn dark" onclick="showArticle('${escapeHtml(
                      String(item.id)
                    )}')">記事を読む</button>`
              }
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderProducts(items) {
  if (!productList) return;

  if (!items.length) {
    productList.innerHTML = `<div class="empty-box">条件に合う商品はまだありません。API更新後にここへ表示されます。</div>`;
    return;
  }

  productList.innerHTML = items
    .map(
      (item) => `
        <article class="card">
          <div class="card-thumb">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(
        item.title
      )}" referrerpolicy="no-referrer">
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
              ${(item.tags || [])
                .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
                .join("")}
            </div>
            <div class="card-actions" style="margin-top:14px;">
              <button class="mini-btn dark" onclick="showProduct('${escapeHtml(
                String(item.id)
              )}')">商品を見る</button>
              <a class="mini-btn" href="${escapeHtml(
                item.affiliateLink
              )}" target="_blank" rel="noopener noreferrer sponsored">FANZAで見る</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderRanking(articles, products) {
  const rankingSource = products.length
    ? products.slice(0, 5).map((item, index) => ({
        index,
        title: item.title,
        meta: item.releaseDate,
        onClick: `showProduct('${escapeHtml(String(item.id))}')`,
      }))
    : articles.slice(0, 5).map((item, index) => ({
        index,
        title: item.title,
        meta: item.date,
        onClick: item.articleUrl
          ? `window.location.href='${escapeHtml(item.articleUrl)}'`
          : `showArticle('${escapeHtml(String(item.id))}')`,
      }));

  if (!rankingList) return;

  if (!rankingSource.length) {
    rankingList.innerHTML = `<div class="empty-box">表示する項目がありません。</div>`;
    return;
  }

  rankingList.innerHTML = rankingSource
    .map(
      (item) => `
        <a class="ranking-item" href="javascript:void(0)" onclick="${item.onClick}">
          <div class="rank-num">${String(item.index + 1).padStart(
            2,
            "0"
          )}</div>
          <div>
            <div class="ranking-item-title">${escapeHtml(item.title)}</div>
            <div class="ranking-item-meta">${escapeHtml(item.meta)}</div>
          </div>
        </a>
      `
    )
    .join("");
}

function renderCategories(articles, products) {
  const categories = [
    ...articles.map((item) => item.category),
    ...products.map((item) => item.category),
  ].filter(Boolean);

  const uniqueCategories = [...new Set(categories)].slice(0, 12);

  if (!categoryList) return;

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
    ...products.flatMap((item) => item.tags || []),
  ].filter(Boolean);

  const uniqueTags = [...new Set(tags)].slice(0, 24);

  if (!tagCloud) return;

  if (!uniqueTags.length) {
    tagCloud.innerHTML = `<span class="tag">#準備中</span>`;
    return;
  }

  tagCloud.innerHTML = uniqueTags
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");
}

function showArticle(id) {
  const article = state.articles.find((item) => String(item.id) === String(id));
  if (!article) return;

  if (article.articleUrl) {
    window.location.href = article.articleUrl;
    return;
  }

  const relatedProducts = state.products.filter((p) =>
    (article.relatedProductIds || []).includes(p.id)
  );

  const contentHtml = (article.content || [])
    .map((text) => `<p>${escapeHtml(text)}</p>`)
    .join("");

  const relatedHtml = relatedProducts.length
    ? relatedProducts
        .map(
          (item) => `
            <article class="card" style="margin-top:12px;">
              <div class="card-thumb">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(
              item.title
            )}" referrerpolicy="no-referrer">
              </div>
              <div>
                <div class="card-meta">
                  <span>${escapeHtml(item.category)}</span>
                  <span>${escapeHtml(item.releaseDate)}</span>
                </div>
                <h4>${escapeHtml(item.title)}</h4>
                <p>${escapeHtml(item.description)}</p>
                <div class="card-actions">
                  <button class="mini-btn dark" onclick="showProduct('${escapeHtml(
                    String(item.id)
                  )}')">商品を見る</button>
                  <a class="mini-btn" href="${escapeHtml(
                    item.affiliateLink
                  )}" target="_blank" rel="noopener noreferrer sponsored">FANZAで見る</a>
                </div>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="empty-box">関連商品はまだありません。</div>`;

  detailContent.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHtml(article.thumbnail)}" alt="${escapeHtml(
    article.title
  )}" referrerpolicy="no-referrer">
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
      ${contentHtml}
    </div>
    <h3 style="margin-top:28px;">関連商品</h3>
    <div>${relatedHtml}</div>
  `;

  document.getElementById("detailSection").scrollIntoView({
    behavior: "smooth",
  });
}

function showProduct(id) {
  const item = state.products.find((product) => String(product.id) === String(id));
  if (!item) return;

  const galleryHtml = (item.gallery || [])
    .slice(0, 4)
    .map(
      (img) =>
        `<img src="${escapeHtml(img)}" alt="${escapeHtml(
          item.title
        )}" referrerpolicy="no-referrer">`
    )
    .join("");

  const pointsHtml = (item.points || [])
    .map((point) => `<div class="point-item">${escapeHtml(point)}</div>`)
    .join("");

  detailContent.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(
    item.title
  )}" referrerpolicy="no-referrer">
    </div>
    <div class="card-meta">
      <span>${escapeHtml(item.category)}</span>
      <span>${escapeHtml(item.releaseDate)}</span>
      <span>品番 ${escapeHtml(item.code)}</span>
    </div>
    <h2 class="detail-title">${escapeHtml(item.title)}</h2>
    <p class="detail-info">
      出演者: ${escapeHtml(item.actress)} / メーカー: ${escapeHtml(
    item.maker
  )} / レーベル: ${escapeHtml(item.label)}
    </p>
    <p class="detail-desc">${escapeHtml(item.description)}</p>
    <div class="cta-box">
      <h4>公式で確認</h4>
      <p>価格・サンプル・配信状況は公式ページでご確認ください。</p>
      <div class="hero-buttons">
        <a href="${escapeHtml(
          item.affiliateLink
        )}" target="_blank" rel="noopener noreferrer sponsored" class="btn primary">
          FANZAで確認する
        </a>
      </div>
    </div>
    <h3>この商品のポイント</h3>
    <div class="point-list">${pointsHtml}</div>
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

  document.getElementById("detailSection").scrollIntoView({
    behavior: "smooth",
  });
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
  if (!ageGate || !enterSiteBtn) return;

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
