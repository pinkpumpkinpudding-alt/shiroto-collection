// ========================================
// グローバル変数
// ========================================
const AFFILIATE_ID = 'YOUR-AFFILIATE-ID-HERE'; // FANZAアフィリエイトID（要差し替え）
const FANZA_BASE_URL = `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fadult%2F&af_id=${AFFILIATE_ID}&ch=toolbar&ch_id=link`;

// ========================================
// ダミー作品データ（15作品）
// ※実際の作品に差し替える際は、このデータを編集してください
// ========================================
const productsData = [
    {
        id: 1,
        title: 'はじめての撮影 Vol.1',
        genre: 'newcomer',
        tags: ['新人', '初撮り', 'ナチュラル'],
        description: 'カメラの前に初めて立つ、緊張と素顔。自然体の魅力がつまった一作。',
        longDescription: 'カメラの前に初めて立つ緊張感と、そこから見える素顔の魅力。演技ではない、本物のリアクションと表情をお楽しみいただけます。',
        ranking: 1,
        isNew: true
    },
    {
        id: 2,
        title: 'となりのあの子 素人ファイル',
        genre: 'amateur',
        tags: ['素人', '日常系', '清楚'],
        description: 'どこにでもいそうな親しみやすさと、隠された魅力のギャップが見どころ。',
        longDescription: '日常の中にいそうな親しみやすい雰囲気と、撮影を通じて見えてくる新たな一面。自然体の魅力を大切にした作品です。',
        ranking: 3,
        isNew: true
    },
    {
        id: 3,
        title: '新人デビュー作 〜はじまりの一歩〜',
        genre: 'newcomer',
        tags: ['新人', 'フレッシュ', '注目'],
        description: '期待の新人が踏み出す記念すべき第一歩。初々しさが光る注目作。',
        longDescription: '業界に足を踏み入れたばかりの新人が見せる、フレッシュな魅力と成長の過程。これからの活躍が期待される注目の一作です。',
        ranking: 5,
        isNew: true
    },
    {
        id: 4,
        title: 'ナチュラルビューティー 素顔のまま',
        genre: 'clean',
        tags: ['ナチュラル', '素人', '清楚'],
        description: '作り込まない自然な美しさ。メイクを抑えた素顔の魅力を堪能できる。',
        longDescription: '過度なメイクや演出を避け、ありのままの魅力を大切にした作品。自然体の美しさと清潔感を感じていただけます。',
        ranking: 7,
        isNew: false
    },
    {
        id: 5,
        title: '日常のかけら〜普通の毎日〜',
        genre: 'daily',
        tags: ['日常系', '素人', '自然体'],
        description: '日々の何気ない瞬間を切り取った、リアリティ溢れる日常系作品。',
        longDescription: '特別なシチュエーションではなく、日常の延長線上にある自然な空気感を大切にしました。親しみやすさが魅力です。',
        ranking: 12,
        isNew: false
    },
    {
        id: 6,
        title: '初撮り素人 突撃インタビュー',
        genre: 'amateur',
        tags: ['初撮り', '素人', 'リアル'],
        description: 'カメラの前で語られる本音と、撮影への素直な反応が見どころ。',
        longDescription: '撮影前のインタビューから本編まで、ありのままの姿を収録。緊張しながらも真摯に向き合う姿勢が印象的です。',
        ranking: 8,
        isNew: false
    },
    {
        id: 7,
        title: '清楚系新人 Vol.3',
        genre: 'clean',
        tags: ['清楚', '新人', '上品'],
        description: '清潔感あふれる佇まいと、控えめながら芯のある魅力が光る。',
        longDescription: '派手さはないけれど、確かな存在感を放つ清楚系新人。上品な雰囲気と内に秘めた情熱のコントラストが魅力です。',
        ranking: 4,
        isNew: false
    },
    {
        id: 8,
        title: 'ふたりのじかん〜彼女系〜',
        genre: 'couple',
        tags: ['カップル', '彼女系', '日常'],
        description: 'カップルの等身大の日常を覗き見るような、親密な空気感。',
        longDescription: 'カップルの日常的な時間を切り取った作品。演出を最小限にし、ふたりの自然なやり取りを大切にしました。',
        ranking: 6,
        isNew: false
    },
    {
        id: 9,
        title: '素の表情〜メイクなしの素顔〜',
        genre: 'natural',
        tags: ['ナチュラル', '素顔', '個性派'],
        description: 'メイクを落とした素顔で魅せる、飾らない魅力と個性。',
        longDescription: '厚化粧を避け、素顔に近い状態で撮影。作り込まない美しさと、個性が際立つ仕上がりになっています。',
        ranking: 10,
        isNew: false
    },
    {
        id: 10,
        title: '新人発掘 2025春',
        genre: 'newcomer',
        tags: ['新人', '注目', 'フレッシュ'],
        description: '2025年春注目の新人を発掘。期待値の高いフレッシュな魅力。',
        longDescription: '今季注目の新人をピックアップ。これからの活躍が期待される逸材の、初々しくもエネルギー溢れるパフォーマンスをお楽しみください。',
        ranking: 2,
        isNew: true
    },
    {
        id: 11,
        title: 'アマチュア記録集 Vol.2',
        genre: 'amateur',
        tags: ['素人', 'アマチュア', 'リアル'],
        description: 'プロではないからこその自然な反応と、リアルな雰囲気が魅力。',
        longDescription: 'アマチュアならではの飾らない姿と、緊張しながらも前向きに撮影に臨む姿勢が印象的な一作です。',
        ranking: 9,
        isNew: false
    },
    {
        id: 12,
        title: '清楚な休日〜オフの彼女〜',
        genre: 'clean',
        tags: ['清楚', '日常', 'ナチュラル'],
        description: '休日のリラックスした空気の中で見せる、自然体の清楚な魅力。',
        longDescription: 'オフの日のゆったりとした時間を切り取った作品。普段着姿の清楚な雰囲気と、リラックスした表情が魅力です。',
        ranking: 11,
        isNew: false
    },
    {
        id: 13,
        title: '初めての告白〜新人特集〜',
        genre: 'newcomer',
        tags: ['新人', '初撮り', 'フレッシュ'],
        description: '撮影への想いを語る新人の姿と、初々しいパフォーマンスが見どころ。',
        longDescription: '撮影に至るまでの経緯や想いを丁寧にインタビュー。初めての経験に真摯に向き合う姿勢が印象的です。',
        ranking: 13,
        isNew: false
    },
    {
        id: 14,
        title: 'どこにでもいる彼女 Season2',
        genre: 'daily',
        tags: ['日常', '素人', '親しみ'],
        description: '好評だった前作に続く第2弾。親しみやすさが際立つ日常系作品。',
        longDescription: '前作で好評だった日常系シリーズの続編。変わらぬ親しみやすさと、少し成長した姿の両方をお楽しみいただけます。',
        ranking: 14,
        isNew: false
    },
    {
        id: 15,
        title: '素顔のドキュメント〜リアルの日常〜',
        genre: 'documentary',
        tags: ['ドキュメント', 'リアル', '自然体'],
        description: '日常を丁寧に追ったドキュメンタリータッチの意欲作。',
        longDescription: '演出を極力排除し、日常の延長線上にある自然な姿を記録。ドキュメンタリーのような空気感が特徴の作品です。',
        ranking: 15,
        isNew: false
    }
];

// 作品を追加する場合は上記配列に追加してください
// 例:
// {
//     id: 16,
//     title: '新しい作品タイトル',
//     genre: 'amateur', // amateur, newcomer, clean, documentary, daily, couple, natural
//     tags: ['タグ1', 'タグ2', 'タグ3'],
//     description: '短い説明文（2行程度）',
//     longDescription: '詳細な説明文（作品詳細ページで使用）',
//     ranking: 16,
//     isNew: false
// }

// ========================================
// ジャンルマッピング
// ========================================
const genreMap = {
    'amateur': { name: '素人系', description: 'リアルな素人感を大切にした作品' },
    'newcomer': { name: '新人・初撮り', description: '緊張と期待が入り混じる初めての撮影' },
    'clean': { name: '清楚・ナチュラル', description: '飾らない自然体の魅力' },
    'documentary': { name: 'ドキュメンタリー風', description: 'リアルな日常を切り取った作品' },
    'daily': { name: '日常系', description: '親しみやすい日常のシーン' },
    'couple': { name: 'カップル・彼女系', description: '等身大のカップルの日常' },
    'natural': { name: 'ナチュラル系', description: '作り込みすぎない自然な雰囲気' }
};

// ========================================
// ページロード時の初期化
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // 年齢確認モーダルの処理
    initAgeVerification();
    
    // ハンバーガーメニュー
    initHamburgerMenu();
    
    // トップページのコンテンツ生成
    renderFeaturedCarousel();
    renderTop5Ranking();
    renderNewProducts();
    
    // フィルター機能
    initFilters();
    
    // FAQ アコーディオン
    initFAQ();
    
    // タブ機能
    initTabs();
    
    // 初期ページ表示
    navigateTo('home');
});

// ========================================
// 年齢確認モーダル
// ========================================
function initAgeVerification() {
    const modal = document.getElementById('age-verification-modal');
    const yesBtn = document.getElementById('age-yes');
    const noBtn = document.getElementById('age-no');
    
    // セッションストレージで確認済みかチェック
    const verified = sessionStorage.getItem('age-verified');
    
    if (verified === 'true') {
        modal.classList.add('hidden');
    } else {
        modal.classList.remove('hidden');
    }
    
    // 18歳以上ボタン
    yesBtn.addEventListener('click', function() {
        sessionStorage.setItem('age-verified', 'true');
        modal.classList.add('hidden');
    });
    
    // 18歳未満ボタン
    noBtn.addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
    });
}

// ========================================
// ハンバーガーメニュー
// ========================================
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });
    
    // ナビゲーションリンククリック時にメニューを閉じる
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// ========================================
// ページナビゲーション
// ========================================
function navigateTo(page, param = null) {
    // すべてのページを非表示
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    
    // 指定されたページを表示
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // ページごとの処理
    switch(page) {
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
    }
}

// ========================================
// おすすめ作品カルーセル（トップページ）
// ========================================
function renderFeaturedCarousel() {
    const container = document.getElementById('featured-carousel');
    const featured = productsData.slice(0, 8);
    
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

function carouselPrev() {
    const carousel = document.getElementById('featured-carousel');
    carousel.scrollBy({ left: -350, behavior: 'smooth' });
}

function carouselNext() {
    const carousel = document.getElementById('featured-carousel');
    carousel.scrollBy({ left: 350, behavior: 'smooth' });
}

// ========================================
// TOP5ランキング（トップページ）
// ========================================
function renderTop5Ranking() {
    const container = document.getElementById('top5-ranking');
    const top5 = productsData
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
    // フィルタートグル
    const filterToggle = document.getElementById('filter-toggle');
    const filterContent = document.getElementById('filter-content');
    
    if (filterToggle) {
        filterToggle.addEventListener('click', function() {
            filterToggle.classList.toggle('active');
            filterContent.classList.toggle('active');
        });
    }
    
    // フィルターボタン
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderProductsList();
        });
    });
    
    // ソート選択
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            renderProductsList();
        });
    }
}

function renderProductsList() {
    const container = document.getElementById('products-list');
    let filtered = [...productsData];
    
    // フィルター適用
    if (currentFilter !== 'all') {
        const filterMap = {
            'amateur': 'amateur',
            'newcomer': 'newcomer',
            'first-time': ['newcomer', 'amateur'],
            'clean': 'clean',
            'natural': 'natural'
        };
        
        const filterValue = filterMap[currentFilter];
        if (Array.isArray(filterValue)) {
            filtered = filtered.filter(p => filterValue.includes(p.genre));
        } else {
            filtered = filtered.filter(p => p.genre === filterValue);
        }
    }
    
    // ソート適用
    if (currentSort === 'popular') {
        filtered.sort((a, b) => a.ranking - b.ranking);
    } else if (currentSort === 'newest') {
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
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
    
    // ページタイトル更新
    document.getElementById('genre-title').textContent = genre.name;
    document.getElementById('genre-description').textContent = genre.description;
    document.getElementById('genre-breadcrumb').innerHTML = `<span>/</span><span>${genre.name}</span>`;
    
    // 作品リスト
    const container = document.getElementById('genre-products');
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
    
    // パンくず更新
    document.getElementById('detail-breadcrumb').textContent = product.title;
    
    // 詳細コンテンツ
    const container = document.getElementById('product-detail');
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
                <!-- 実際の動画埋め込み例:
                <iframe src="YOUR_SAMPLE_VIDEO_URL" width="100%" height="400" frameborder="0" allowfullscreen></iframe>
                -->
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
    
    // レビュー表示
    renderReviews();
    
    // 関連作品表示
    renderRelatedProducts(product);
}

function renderReviews() {
    const container = document.getElementById('reviews-list');
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
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // タブの切り替え
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // コンテンツの切り替え
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

function renderRankingPage() {
    // 週間人気
    const weeklyContainer = document.getElementById('ranking-weekly');
    const weekly = [...productsData].sort((a, b) => a.ranking - b.ranking).slice(0, 10);
    weeklyContainer.innerHTML = weekly.map((product, index) => createRankingItem(product, index + 1)).join('');
    
    // 新人系おすすめ
    const newcomerContainer = document.getElementById('ranking-newcomer');
    const newcomer = productsData.filter(p => p.genre === 'newcomer').slice(0, 10);
    newcomerContainer.innerHTML = newcomer.map((product, index) => createRankingItem(product, index + 1)).join('');
    
    // 素人系おすすめ
    const amateurContainer = document.getElementById('ranking-amateur');
    const amateur = productsData.filter(p => p.genre === 'amateur').slice(0, 10);
    amateurContainer.innerHTML = amateur.map((product, index) => createRankingItem(product, index + 1)).join('');
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
    // 定番作品
    const standardContainer = document.getElementById('beginner-standard');
    const standard = productsData.slice(0, 3);
    standardContainer.innerHTML = standard.map(p => createProductCard(p)).join('');
    
    // ドキュメンタリー風
    const docContainer = document.getElementById('beginner-documentary');
    const documentary = productsData.filter(p => p.genre === 'documentary' || p.genre === 'daily').slice(0, 3);
    docContainer.innerHTML = documentary.map(p => createProductCard(p)).join('');
    
    // 清楚系
    const cleanContainer = document.getElementById('beginner-clean');
    const clean = productsData.filter(p => p.genre === 'clean').slice(0, 3);
    cleanContainer.innerHTML = clean.map(p => createProductCard(p)).join('');
    
    // カップル系
    const coupleContainer = document.getElementById('beginner-couple');
    const couple = productsData.filter(p => p.genre === 'couple' || p.genre === 'daily').slice(0, 3);
    coupleContainer.innerHTML = couple.map(p => createProductCard(p)).join('');
}

// ========================================
// FAQ アコーディオン
// ========================================
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // すべてのFAQを閉じる
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // クリックされたFAQを開く（既に開いていた場合は閉じる）
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ========================================
// ユーティリティ関数
// ========================================

// スムーススクロール
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// コンソールログ
console.log('ShinStar Selection - Initialized');
console.log(`Total products: ${productsData.length}`);
