// ========================================
// グローバル変数
// ========================================
const AFFILIATE_ID = 'YOUR-AFFILIATE-ID-HERE'; // FANZAアフィリエイトID（要差し替え）
const FANZA_BASE_URL = `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fadult%2F&af_id=${AFFILIATE_ID}&ch=toolbar&ch_id=link`;

// ========================================
// 作品データ
// ※実際の作品に差し替える際は、このデータを編集してください
// ========================================
const productsData = [
    {
        id: 1,
        title: 'Do you like beautiful women？5か国語以上を話せる美スタイル現役通訳 国仲ありな AV Debut！',
        genre: 'newcomer',
        tags: ['新人', '初撮り'],
        description: 'スタイル抜群スレンダー系の美女。',
        longDescription: `五か国語以上を話せる美人通訳さんが出演する注目作。
明るい性格と笑顔が印象的で、自然体の魅力が光る一本です。
知的な雰囲気と抜群のスタイル、そのギャップを楽しめる作品として紹介しています。`,
        ranking: 1,
        isNew: true
    },
    {
        id: 2,
        title: 'となりのあの子 素人ファイル',
        genre: 'amateur',
        tags: ['素人', '日常系', '清楚'],
        description: 'どこにでもいそうな親しみやすさと、隠された魅力のギャップが見どころ。',
        longDescription: `日常の中にいそうな親しみやすい雰囲気と、撮影を通じて見えてくる新たな一面。
自然体の魅力を大切にした作品です。`,
        ranking: 3,
        isNew: true
    },
    {
        id: 3,
        title: '新人デビュー作 〜はじまりの一歩〜',
        genre: 'newcomer',
        tags: ['新人', 'フレッシュ', '注目'],
        description: '期待の新人が踏み出す記念すべき第一歩。初々しさが光る注目作。',
        longDescription: `業界に足を踏み入れたばかりの新人が見せる、フレッシュな魅力と成長の過程。
これからの活躍が期待される注目の一作です。`,
        ranking: 5,
        isNew: true
    },
    {
        id: 4,
        title: 'ナチュラルビューティー 素顔のまま',
        genre: 'clean',
        tags: ['ナチュラル', '素人', '清楚'],
        description: '作り込まない自然な美しさ。メイクを抑えた素顔の魅力を堪能できる。',
        longDescription: `過度なメイクや演出を避け、ありのままの魅力を大切にした作品。
自然体の美しさと清潔感を感じていただけます。`,
        ranking: 7,
        isNew: false
    },
    {
        id: 5,
        title: '日常のかけら〜普通の毎日〜',
        genre: 'daily',
        tags: ['日常系', '素人', '自然体'],
        description: '日々の何気ない瞬間を切り取った、リアリティ溢れる日常系作品。',
        longDescription: `特別なシチュエーションではなく、日常の延長線上にある自然な空気感を大切にしました。
親しみやすさが魅力です。`,
        ranking: 12,
        isNew: false
    },
    {
        id: 6,
        title: '初撮り素人 突撃インタビュー',
        genre: 'amateur',
        tags: ['初撮り', '素人', 'リアル'],
        description: 'カメラの前で語られる本音と、撮影への素直な反応が見どころ。',
        longDescription: `撮影前のインタビューから本編まで、ありのままの姿を収録。
緊張しながらも真摯に向き合う姿勢が印象的です。`,
        ranking: 8,
        isNew: false
    },
    {
        id: 7,
        title: '清楚系新人 Vol.3',
        genre: 'clean',
        tags: ['清楚', '新人', '上品'],
        description: '清潔感あふれる佇まいと、控えめながら芯のある魅力が光る。',
        longDescription: `派手さはないけれど、確かな存在感を放つ清楚系新人。
上品な雰囲気と内に秘めた情熱のコントラストが魅力です。`,
        ranking: 4,
        isNew: false
    },
    {
        id: 8,
        title: 'ふたりのじかん〜彼女系〜',
        genre: 'couple',
        tags: ['カップル', '彼女系', '日常'],
        description: 'カップルの等身大の日常を覗き見るような、親密な空気感。',
        longDescription: `カップルの日常的な時間を切り取った作品。
演出を最小限にし、ふたりの自然なやり取りを大切にしました。`,
        ranking: 6,
        isNew: false
    },
    {
        id: 9,
        title: '素の表情〜メイクなしの素顔〜',
        genre: 'natural',
        tags: ['ナチュラル', '素顔', '個性派'],
        description: 'メイクを落とした素顔で魅せる、飾らない魅力と個性。',
        longDescription: `厚化粧を避け、素顔に近い状態で撮影。
作り込まない美しさと、個性が際立つ仕上がりになっています。`,
        ranking: 10,
        isNew: false
    },
    {
        id: 10,
        title: '新人発掘 2025春',
        genre: 'newcomer',
        tags: ['新人', '注目', 'フレッシュ'],
        description: '2025年春注目の新人を発掘。期待値の高いフレッシュな魅力。',
        longDescription: `今季注目の新人をピックアップ。
これからの活躍が期待される逸材の、初々しくもエネルギー溢れる魅力をお楽しみください。`,
        ranking: 2,
        isNew: true
    },
    {
        id: 11,
        title: 'アマチュア記録集 Vol.2',
        genre: 'amateur',
        tags: ['素人', 'アマチュア', 'リアル'],
        description: 'プロではないからこその自然な反応と、リアルな雰囲気が魅力。',
        longDescription: `アマチュアならではの飾らない姿と、緊張しながらも前向きに撮影に臨む姿勢が印象的な一作です。`,
        ranking: 9,
        isNew: false
    },
    {
        id: 12,
        title: '清楚な休日〜オフの彼女〜',
        genre: 'clean',
        tags: ['清楚', '日常', 'ナチュラル'],
        description: '休日のリラックスした空気の中で見せる、自然体の清楚な魅力。',
        longDescription: `オフの日のゆったりとした時間を切り取った作品。
普段着姿の清楚な雰囲気と、リラックスした表情が魅力です。`,
        ranking: 11,
        isNew: false
    },
    {
        id: 13,
        title: '初めての告白〜新人特集〜',
        genre: 'newcomer',
        tags: ['新人', '初撮り', 'フレッシュ'],
        description: '撮影への想いを語る新人の姿と、初々しいパフォーマンスが見どころ。',
        longDescription: `撮影に至るまでの経緯や想いを丁寧にインタビュー。
初めての経験に真摯に向き合う姿勢が印象的です。`,
        ranking: 13,
        isNew: false
    },
    {
        id: 14,
        title: 'どこにでもいる彼女 Season2',
        genre: 'daily',
        tags: ['日常', '素人', '親しみ'],
        description: '好評だった前作に続く第2弾。親しみやすさが際立つ日常系作品。',
        longDescription: `前作で好評だった日常系シリーズの続編。
変わらぬ親しみやすさと、少し成長した姿の両方をお楽しみいただけます。`,
        ranking: 14,
        isNew: false
    },
    {
        id: 15,
        title: '素顔のドキュメント〜リアルの日常〜',
        genre: 'documentary',
        tags: ['ドキュメント', 'リアル', '自然体'],
        description: '日常を丁寧に追ったドキュメンタリータッチの意欲作。',
        longDescription: `演出を極力排除し、日常の延長線上にある自然な姿を記録。
ドキュメンタリーのような空気感が特徴の作品です。`,
        ranking: 15,
        isNew: false
    }
];

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
    renderFeaturedCarousel();
    renderTop5Ranking();
    renderNewProducts();
    initFilters();
    initFAQ();
    initTabs();
    navigateTo('home');
});

// ========================================
// 年齢確認モーダル
// ========================================
function initAgeVerification() {
    const modal = document.getElementById('age-verification-modal');
    const yesBtn = document.getElementById('age-yes');
    const noBtn = document.getElementById('age-no');

    if (!modal || !yesBtn || !noBtn) {
        return;
    }

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

    if (!hamburger || !nav) {
        return;
    }

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
        .sort((a, b) => a.ranking - b.ranking)
        .slice(0, 5);

    container.innerHTML = top5.map((product, index) => {
        const rank = index + 1;
        return `
            <div class="ranking-card ${rank === 1 ? 'rank-1' : ''}">
                <div class="ranking-badge rank-${rank <= 3 ? rank : 'other'}">${rank}</div>
                <div class="product-image">
                    <div class="product-image-placeholder">📷</div>
                </div>
                <div class="product-content">
                    <div class="product-tags">
                        ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-buttons">
                        <button onclick="window.open('${FANZA_BASE_URL}', '_blank')" class="btn btn-outline btn-small">無料サンプルを見る</button>
                        <button onclick="window.open('${FANZA_BASE_URL}', '_blank')" class="btn btn-accent btn-small">FANZAで詳細を見る →</button>
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
    return `
        <div class="product-card">
            <div class="product-image">
                <div class="product-image-placeholder">📷</div>
                ${showNewBadge && product.isNew ? '<span class="product-badge">NEW</span>' : ''}
            </div>
            <div class="product-content">
                <div class="product-tags">
                    ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-buttons">
                    <button onclick="window.open('${FANZA_BASE_URL}', '_blank')" class="btn btn-outline">無料サンプルを見る</button>
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
        filtered.sort((a, b) => a.ranking - b.ranking);
    } else if (currentSort === 'newest') {
        filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    } else if (currentSort === 'recommended') {
        filtered.sort((a, b) => a.id - b.id);
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

    container.innerHTML = `
        <div class="product-detail-media">
            <div class="product-detail-main-image">
                <div class="product-image-placeholder">📷</div>
            </div>
            <div class="product-detail-thumbnails">
                <div class="thumbnail"><div class="product-image-placeholder">📷</div></div>
                <div class="thumbnail"><div class="product-image-placeholder">📷</div></div>
                <div class="thumbnail"><div class="product-image-placeholder">📷</div></div>
                <div class="thumbnail"><div class="product-image-placeholder">📷</div></div>
            </div>
            <div class="product-detail-sample">
                <h3>サンプル動画</h3>
                <button onclick="window.open('${FANZA_BASE_URL}', '_blank')" class="sample-video-btn">
                    <span>▶</span>
                    <span>サンプル動画を見る</span>
                </button>
            </div>
        </div>

        <div class="product-detail-info">
            <div class="product-tags">
                ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <h1 class="product-detail-title">${product.title}</h1>
            <p class="product-detail-desc">${product.longDescription}</p>

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
                <button onclick="window.open('${FANZA_BASE_URL}', '_blank')" class="btn btn-outline btn-large" style="width: 100%;">無料サンプルを見る</button>
                <button onclick="window.open('${FANZA_BASE_URL}', '_blank')" class="btn btn-primary btn-large" style="width: 100%;">FANZAで詳細を確認する →</button>
            </div>

            <table class="product-detail-table">
                <tr>
                    <th>収録時間</th>
                    <td>約120分</td>
                </tr>
                <tr>
                    <th>配信開始日</th>
                    <td>2025年3月</td>
                </tr>
                <tr>
                    <th>シリーズ</th>
                    <td>${genreMap[product.genre]?.name || '—'}</td>
                </tr>
                <tr>
                    <th>タグ</th>
                    <td>${product.tags.join(', ')}</td>
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
        .filter(p => p.id !== currentProduct.id && p.genre === currentProduct.genre)
        .slice(0, 6);

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

    const weekly = [...productsData].sort((a, b) => a.ranking - b.ranking).slice(0, 10);
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
    return `
        <div class="ranking-item">
            <div class="ranking-item-rank rank-${rank <= 3 ? rank : 'other'}">${rank}</div>
            <div class="ranking-item-image">📷</div>
            <div class="ranking-item-content">
                <h3 class="ranking-item-title">${product.title}</h3>
                <div class="product-tags">
                    ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <p class="ranking-item-desc">${product.description}</p>
                <div class="ranking-item-buttons">
                    <button onclick="window.open('${FANZA_BASE_URL}', '_blank')" class="btn btn-outline">無料サンプル</button>
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
console.log(`Total products: ${productsData.length}`);
