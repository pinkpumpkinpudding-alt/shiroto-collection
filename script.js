const state = {
  products: [],
  articles: [],
  currentProduct: null,
  currentArticle: null,
};

async function loadAllData() {
  try {
    const [productsRes, articlesRes] = await Promise.all([
      fetch("./products.json"),
      fetch("./data/articles.json")
    ]);

    const rawProducts = await productsRes.json();
    const rawArticles = await articlesRes.json();

    const productList = Array.isArray(rawProducts) ? rawProducts : rawProducts.products || [];
    const articleList = Array.isArray(rawArticles) ? rawArticles : rawArticles.articles || [];

    state.products = productList.map(normalizeProduct);
    state.articles = articleList.map(normalizeArticle);

    renderHome();
  } catch (error) {
    console.error(error);
    document.getElementById("postList").innerHTML = "<p>データの読み込みに失敗しました。</p>";
  }
}

function normalizeArticle(item, index) {
  return {
    id: item.id || `article-${index + 1}`,
    title: item.title || "記事タイトル未設定",
    slug: item.slug || `article-${index + 1}`,
    category: item.category || "記事",
    date: item.date || "日付不明",
    thumbnail: item.thumbnail || "https://picsum.photos/seed/fallback/1200/700",
    excerpt: item.excerpt || "",
    content: Array.isArray(item.content) ? item.content : [],
    relatedProductIds: Array.isArray(item.relatedProductIds) ? item.relatedProductIds : [],
    tags: Array.isArray(item.tags) ? item.tags : []
  };
}
