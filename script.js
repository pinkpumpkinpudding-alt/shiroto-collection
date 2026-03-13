// ========================================
// グローバル変数
// ========================================
const AFFILIATE_ID = 'miumiudayo-003'; // 予備
const FANZA_BASE_URL = `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fadult%2F&af_id=${AFFILIATE_ID}&ch=toolbar&ch_id=link`;

let productsData = [];

// ========================================
// 外部JSON読み込み
// ========================================
async function loadProducts() {
    try {
        const res = await fetch('./data/products.json', { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to load products.json: ${res.status}`);
        }

        const data = await res.json();
        productsData = Array.isArray(data) ? data : [];

        console.log(`Loaded ${productsData.length} products`);

        renderFeaturedCarousel();
        renderTop5Ranking();
        renderNewProducts();
        renderProductsList();
    } catch (error) {
        console.error('loadProducts error:', error);
        productsData = [];
    }
}

// ========================================
// ジャンルマッピング
// ========================================
const genreMap = {
    amateur: { name: '素人系', description: 'リアルな素人感を大切にした作品' },
    newcomer: { name: '新人・初撮り', description: '緊張と期待が入り混じる初めての撮影' },
    clean: { name: '清楚・ナチュラル', description: '飾らない自然体の魅力' },
    documentary: { name: 'ドキュメンタリー風', description: 'リアルな日常を切り取った作品' },
    daily: { name: '日常系', description: '親しみやすい日常のシーン' },
    couple: { name: 'カップル・彼女系', description: '等身大のカップルの日常' },
    natural: { name: 'ナチュラル系', description: '作り込みすぎない自然な雰囲気' }
};

// ========================================
// ページロード時の初期化
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initAgeVerification();
    initHamburgerMenu();
    initFilters();
    initFAQ();
    initTabs();
    navigateTo('home');
    loadProducts();
});

// ========================================
// 共通ヘルパー
// ========================================
function getProductLink(product) {
    return product.affiliateUrl || product.fanzaUrl || FANZA_BASE_URL;
}

function getProductImageHtml(product, className = 'product-real-image') {
    if (product.imageUrl) {
        return `<img src="${product.imageUrl}" alt="${escapeHtml(product.title || '')}" class="${className}">`;
    }
    return `<div class="product-image-placeholder">📷</div>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ========================================
// 年齢確認モーダル
// ========================================
function initAgeVerification() {
    const modal = document.getElementById('age-verification-modal');
    const yesBtn = document.getElementById('age-yes');
    const noBtn = document.getElementById('age-no');

    if (!modal || !yesBtn || !noBtn) return;

    const verified = sessionStorage.getItem('age-verified');

    if (verified === 'true') {
        modal.classList.add('hidden');
    } else {
        modal.classList.remove('hidden');
    }

    yesBtn.addEventListener('click', function () {
        sessionStorage.setItem('age-verified', 'true');
        modal.classList.add('hidden');
    });

    noBtn.addEventListener('click', function () {
        window.location.href = 'https://www.google.com';
    });
}

// ========================================
// ハンバーガーメニュー
// ========================================
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// ========================================
// ページナビゲーション
// ========================================
function navigateTo(page, param = null) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (page) {
        case 'products':
            renderProductsList();
            break;
        case 'genres':
            renderGenrePage(param);
            break;
        case 'detail':
            renderProductDetail(param);
            break;
        case 'ranking':
            renderRankingPage();
            break;
        case 'beginners':
            renderBeginnersPage();
            break;
        default:
            break;
    }
}

// ========================================
// おすすめ作品カルーセル（トップページ）
// ========================================
function renderFeaturedCarousel() {
    const container = document.getElementById('featured-carousel');
    if (!container) return;

    const featured = productsData.slice(0, 8);
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

function carouselPrev() {
    const carousel = document.getElementById('featured-carousel');
    if (!carousel) return;
    carousel.scrollBy({ left: -350, behavior: 'smooth' });
}

function carouselNext() {
    const carousel = document.getElementById('featured-carousel');
    if (!carousel) return;
    carousel.scrollBy({ left: 350, behavior: 'smooth' });
}

// ========================================
// TOP5ランキング（トップページ）
// ========================================
function renderTop5Ranking() {
    const container = document.getElementById('top5-ranking');
    if (!container) return;

    const top5 = [...productsData]
        .sort((a, b) => (a.ranking ?? 9999) - (b.ranking ?? 9999))
        .slice(0, 5);

    container.innerHTML = top5.map((product, index) => {
        const rank = index + 1;
        const imageHtml = getProductImageHtml(product);

        return `
            <div class="ranking-card ${rank === 1 ? 'rank-1' : ''}">
                <div class="ranking-badge rank-${rank <= 3 ? rank : 'other'}">${rank}</div>
                <div class="product-image">
                    ${imageHtml}
                </div>
                <div class="product-content">
                    <div class="product-tags">
                        ${(product.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                    <h3 class="product-title">${escapeHtml(product.title || '')}</h3>
                    <p class="product-desc">${escapeHtml(product.description || '')}</p>
                    <div class="product-buttons">
                        <button onclick="window.open('${getProductLink(product)}', '_blank')" class="btn btn-outline btn-small">無料サンプルを見る</button>
                        <button onclick="window.open('${getProductLink(product)}', '_blank')" class="btn btn-accent btn-small">FANZAで詳細を見る →</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// 新着作品（トップページ）
// ========================================
function renderNewProducts() {
    const container = document.getElementById('new-products');
    if (!container) return;

    const newProducts = productsData.filter(p => p.isNew).slice(0, 6);
    container.innerHTML = newProducts.map(product => createProductCard(product, true)).join('');
}

// ========================================
// プロダクトカード生成
// ========================================
function createProductCard(product, showNewBadge = false) {
    const imageHtml = getProductImageHtml(product);

    return `
        <div class="product-card">
            <div class="product-image">
                ${imageHtml}
                ${showNewBadge && product.isNew ? '<span class="product-badge">NEW</span>' : ''}
            </div>
            <div class="product-content">
                <div class="product-tags">
                    ${(product.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <h3 class="product-title">${escapeHtml(product.title || '')}</h3>
                <p class="product-desc">${escapeHtml(product.description || '')}</p>
                <div class="product-buttons">
                    <button onclick="window.open('${getProductLink(product)}', '_blank')" class="btn btn-outline">無料サンプルを見る</button>
                    <button onclick="navigateTo('detail', ${product.id})" class="btn btn-primary">詳細を見る →</button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// 作品一覧ページ
// ========================================
let currentFilter = 'all';
let currentSort = 'popular';

function initFilters() {
    const filterToggle = document.getElementById('filter-toggle');
    const filterContent = document.getElementById('filter-content');

    if (filterToggle && filterContent) {
        filterToggle.addEventListener('click', function () {
            filterToggle.classList.toggle('active');
            filterContent.classList.toggle('active');
        });
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderProductsList();
        });
    });

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentSort = this.value;
            renderProductsList();
        });
    }
}

function renderProductsList() {
    const container = document.getElementById('products-list');
    if (!container) return;

    let filtered = [...productsData];

    if (currentFilter !== 'all') {
        const filterMap = {
            amateur: 'amateur',
            newcomer: 'newcomer',
            'first-time': ['newcomer', 'amateur'],
            clean: 'clean',
            natural: 'natural'
        };

        const filterValue = filterMap[currentFilter];
        if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.genre));
        } else {
            filtered = filtered.filter(p => p.genre === filterValue);
        }
    }

    if (currentSort === 'popular') {
        filtered.sort((a, b) => (a.ranking ?? 9999) - (b.ranking ?? 9999));
    } else if (currentSort === 'newest') {
        filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    } else if (currentSort === 'recommended') {
        filtered.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }

    container.innerHTML = filtered.map(product => createProductCard(product)).join('');
}

// ========================================
// ジャンル別ページ
// ========================================
function renderGenrePage(genreKey) {
    const genre = genreMap[genreKey];
    if (!genre) {
        navigateTo('home');
        return;
    }

    const genreTitle = document.getElementById('genre-title');
    const genreDescription = document.getElementById('genre-description');
    const genreBreadcrumb = document.getElementById('genre-breadcrumb');
    const container = document.getElementById('genre-products');

    if (genreTitle) genreTitle.textContent = genre.name;
    if (genreDescription) genreDescription.textContent = genre.description;
    if (genreBreadcrumb) genreBreadcrumb.innerHTML = `<span>/</span><span>${genre.name}</span>`;
    if (!container) return;

    const genreProducts = productsData.filter(p => p.genre === genreKey);
    container.innerHTML = genreProducts.map(product => createProductCard(product)).join('');
}

// ========================================
// 作品詳細ページ
// ========================================
function renderProductDetail(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) {
        navigateTo('home');
        return;
    }

    const breadcrumb = document.getElementById('detail-breadcrumb');
    const container = document.getElementById('product-detail');

    if (breadcrumb) breadcrumb.textContent = product.title;
    if (!container) return;

    const mainImageHtml = getProductImageHtml(product, 'product-detail-real-image');

    const gallery = Array.isArray(product.galleryImages)
        ? product.galleryImages.slice(0, 8)
        : [];

    const thumbnailHtml = gallery.length
        ? gallery.map(url => `
            <div class="thumbnail">
                <img src="${url}" alt="${escapeHtml(product.title || '')}" class="product-real-image">
            </div>
        `).join('')
        : `
            <div class="thumbnail">${mainImageHtml}</div>
        `;

    const sampleHtml = product.sampleVideoUrl
    ? `
        <a href="${product.sampleVideoUrl}" target="_blank" rel="noopener noreferrer" class="sample-video-btn">
            <span>▶</span>
            <span>サンプル動画を見る</span>
        </a>
      `
    : `
        <a href="${getProductLink(product)}" target="_blank" rel="noopener noreferrer" class="sample-video-btn">
            <span>▶</span>
            <span>FANZAでサンプルを見る</span>
        </a>
      `;

    container.innerHTML = `
        <div class="product-detail-media">
            <div class="product-detail-main-image">
                ${mainImageHtml}
            </div>

            <div class="product-detail-thumbnails">
                ${thumbnailHtml}
            </div>

            <div class="product-detail-sample">
                <h3>サンプル動画</h3>
                ${sampleHtml}
            </div>
        </div>

        <div class="product-detail-info">
            <div class="product-tags">
                ${(product.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="related-ranking">
<h3>今人気の作品</h3>
<div id="detail-ranking"></div>
</div>
            <h1 class="product-detail-title">${escapeHtml(product.title || '')}</h1>
            <p class="product-detail-desc">${escapeHtml(product.longDescription || product.description || '')}</p>

            <div class="product-detail-points">
                <h3>おすすめポイント</h3>
                <ul>
                    <li>自然体の魅力がつまった一作</li>
                    <li>作り込みすぎない演出</li>
                    <li>初心者から上級者まで楽しめる内容</li>
                </ul>
            </div>

            <div class="product-detail-target">
                <div>
                    <strong>こんな方におすすめ</strong><br>
                    作り込みすぎていない自然な雰囲気が好きな方、リアルな素人感を求める方向けの作品です。
                </div>
            </div>

            <div class="product-detail-cta">
                <button onclick="window.open('${getProductLink(product)}', '_blank')" class="btn btn-outline btn-large" style="width: 100%;">無料サンプルを見る</button>
                <button onclick="window.open('${getProductLink(product)}', '_blank')" class="btn btn-primary btn-large" style="width: 100%;">FANZAで詳細を確認する →</button>
            </div>

            <table class="product-detail-table">
                <tr>
                    <th>収録時間</th>
                    <td>約120分</td>
                </tr>
                <tr>
                    <th>配信開始日</th>
                    <td>${escapeHtml(product.releaseDate || '取得データ準備中')}</td>
                </tr>
                <tr>
                    <th>シリーズ</th>
                    <td>${genreMap[product.genre]?.name || '—'}</td>
                </tr>
                <tr>
                    <th>タグ</th>
                    <td>${(product.tags || []).map(escapeHtml).join(', ')}</td>
                </tr>
            </table>
        </div>
    `;

    renderReviews();
    renderRelatedProducts(product);
}

function renderReviews() {
    const container = document.getElementById('reviews-list');
    if (!container) return;

    const dummyReviews = [
        { author: 'ユーザーA', rating: '★★★★★', text: '自然体の雰囲気がとても良かったです。作り込みすぎていない感じが好みでした。' },
        { author: 'ユーザーB', rating: '★★★★☆', text: '初心者向けとしてもおすすめできる内容。サンプルで確認してから購入しました。' },
        { author: 'ユーザーC', rating: '★★★★★', text: 'このジャンルが好きな方には間違いなくおすすめ。期待以上の内容でした。' }
    ];

    container.innerHTML = dummyReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">👤</div>
                <div class="review-author">${review.author}</div>
                <div class="review-rating">${review.rating}</div>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');
}

function renderRelatedProducts(currentProduct) {
    const container = document.getElementById('related-products');
    if (!container) return;

    const related = productsData
        .filter(p => {
            if (p.id === currentProduct.id) return false;

            const sameGenre = p.genre === currentProduct.genre;

            const sameTag = (p.tags || []).some(tag =>
                (currentProduct.tags || []).includes(tag)
            );

            return sameGenre || sameTag;
        })
        .slice(0, 8);

    container.innerHTML = related.map(product => createProductCard(product)).join('');
}

// ========================================
// ランキングページ
// ========================================
function initTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetTab = this.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function renderRankingPage() {
    const weeklyContainer = document.getElementById('ranking-weekly');
    const newcomerContainer = document.getElementById('ranking-newcomer');
    const amateurContainer = document.getElementById('ranking-amateur');

    const weekly = [...productsData].sort((a, b) => (a.ranking ?? 9999) - (b.ranking ?? 9999)).slice(0, 10);
    const newcomer = productsData.filter(p => p.genre === 'newcomer').slice(0, 10);
    const amateur = productsData.filter(p => p.genre === 'amateur').slice(0, 10);

    if (weeklyContainer) {
        weeklyContainer.innerHTML = weekly.map((product, index) => createRankingItem(product, index + 1)).join('');
    }
    if (newcomerContainer) {
        newcomerContainer.innerHTML = newcomer.map((product, index) => createRankingItem(product, index + 1)).join('');
    }
    if (amateurContainer) {
        amateurContainer.innerHTML = amateur.map((product, index) => createRankingItem(product, index + 1)).join('');
    }
}

function createRankingItem(product, rank) {
    const imageHtml = product.imageUrl
        ? `<img src="${product.imageUrl}" alt="${escapeHtml(product.title || '')}" class="product-real-image">`
        : '📷';

    return `
        <div class="ranking-item">
            <div class="ranking-item-rank rank-${rank <= 3 ? rank : 'other'}">${rank}</div>
            <div class="ranking-item-image">${imageHtml}</div>
            <div class="ranking-item-content">
                <h3 class="ranking-item-title">${escapeHtml(product.title || '')}</h3>
                <div class="product-tags">
                    ${(product.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <p class="ranking-item-desc">${escapeHtml(product.description || '')}</p>
                <div class="ranking-item-buttons">
                    <button onclick="window.open('${getProductLink(product)}', '_blank')" class="btn btn-outline">無料サンプル</button>
                    <button onclick="navigateTo('detail', ${product.id})" class="btn btn-primary">詳細を見る</button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// 初めての方へページ
// ========================================
function renderBeginnersPage() {
    const standardContainer = document.getElementById('beginner-standard');
    const docContainer = document.getElementById('beginner-documentary');
    const cleanContainer = document.getElementById('beginner-clean');
    const coupleContainer = document.getElementById('beginner-couple');

    const standard = productsData.slice(0, 3);
    const documentary = productsData.filter(p => p.genre === 'documentary' || p.genre === 'daily').slice(0, 3);
    const clean = productsData.filter(p => p.genre === 'clean').slice(0, 3);
    const couple = productsData.filter(p => p.genre === 'couple' || p.genre === 'daily').slice(0, 3);

    if (standardContainer) {
        standardContainer.innerHTML = standard.map(p => createProductCard(p)).join('');
    }
    if (docContainer) {
        docContainer.innerHTML = documentary.map(p => createProductCard(p)).join('');
    }
    if (cleanContainer) {
        cleanContainer.innerHTML = clean.map(p => createProductCard(p)).join('');
    }
    if (coupleContainer) {
        coupleContainer.innerHTML = couple.map(p => createProductCard(p)).join('');
    }
}

// ========================================
// FAQ アコーディオン
// ========================================
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function () {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ========================================
// ユーティリティ関数
// ========================================
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

console.log('ShinStar Selection - Initialized');
console.log(`Current loaded products: ${productsData.length}`);

function renderDetailRanking() {

const container = document.getElementById("detail-ranking");
if (!container) return;

const ranking = [...productsData]
.sort((a,b)=> (a.ranking ?? 9999)-(b.ranking ?? 9999))
.slice(0,5);

container.innerHTML = ranking.map(p=>createProductCard(p)).join("");

}
