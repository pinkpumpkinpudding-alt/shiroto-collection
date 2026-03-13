const fs = require('fs');
const path = require('path');

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;

if (!API_ID || !AFFILIATE_ID) {
  throw new Error('DMM_API_ID or DMM_AFFILIATE_ID is not set.');
}

const ENDPOINT = 'https://api.dmm.com/affiliate/v3/ItemList';
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'products.json');

async function fetchItems({ hits = 100, offset = 1 } = {}) {
  const params = new URLSearchParams({
    api_id: API_ID,
    affiliate_id: AFFILIATE_ID,
    site: 'FANZA',
    service: 'digital',
    floor: 'videoa',
    hits: String(hits),
    offset: String(offset),
    sort: 'date',
    output: 'json'
  });

  const url = `${ENDPOINT}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`DMM API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (!json.result || !Array.isArray(json.result.items)) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error('Invalid DMM API response');
  }

  return json.result.items;
}

function stripHtml(text = '') {
  return String(text)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapGenre(item) {
  const text = [
    item.iteminfo?.genre?.map(g => g.name).join(' ') || '',
    item.title || '',
    item.comment || ''
  ].join(' ');

  if (/新人|初撮り|デビュー|初出演/i.test(text)) return 'newcomer';
  if (/素人|応募素人|一般人/i.test(text)) return 'amateur';
  if (/清楚|ナチュラル|初々しい/i.test(text)) return 'clean';
  if (/ドキュメンタリー/i.test(text)) return 'documentary';
  if (/日常/i.test(text)) return 'daily';
  if (/彼女|カップル/i.test(text)) return 'couple';
  return 'natural';
}

function buildTags(item) {
  const tags = new Set();
  const genreNames = item.iteminfo?.genre?.map(g => g.name) || [];

  genreNames.slice(0, 3).forEach(name => tags.add(name));

  const title = item.title || '';
  if (/新人|デビュー|初撮り/i.test(title)) tags.add('新人');
  if (/素人/i.test(title)) tags.add('素人');
  if (/清楚/i.test(title)) tags.add('清楚');

  return [...tags].slice(0, 3);
}

function buildFallbackDescription(item, genre, tags) {
  const title = stripHtml(item.title || '');
  const actressNames = item.iteminfo?.actress?.map(a => a.name).filter(Boolean) || [];
  const actressText = actressNames.length ? `${actressNames.join(' / ')}出演。` : '';
  const tagText = tags.length ? `${tags.join('・')}系の注目作品。` : '注目作品。';

  return `${title}。${actressText}${tagText}`.trim();
}

function shouldKeepItem(item) {
  const title = (item.title || '').toLowerCase();
  const genres = (item.iteminfo?.genre || []).map(g => (g.name || '').toLowerCase());
  const text = [title, ...genres].join(' ');

  const includeKeywords = [
    '新人',
    '素人',
    '初撮り',
    'デビュー',
    '初作品',
    '初出演'
  ];

  const excludeKeywords = [
    'vr',
    'ハイクオリティvr',
    'best',
    'ベスト',
    '総集編',
    '4時間',
    '8時間',
    '16時間',
    '人妻',
    '熟女',
    '痴女',
    'ntr',
    '寝取られ',
    'ニューハーフ',
    '男の娘',
    '乱交'
  ];

  const hasInclude = includeKeywords.some(keyword => text.includes(keyword.toLowerCase()));
  const hasExclude = excludeKeywords.some(keyword => text.includes(keyword.toLowerCase()));

  return hasInclude && !hasExclude;
}

function normalizeGalleryImages(item) {
  const largeImages = Array.isArray(item.sampleImageURL?.sample_l?.image)
    ? item.sampleImageURL.sample_l.image
    : [];

  const smallImages = Array.isArray(item.sampleImageURL?.sample_s?.image)
    ? item.sampleImageURL.sample_s.image
    : [];

  const rawImages = largeImages.length ? largeImages : smallImages;

  return rawImages
    .filter(Boolean)
    .map(url => String(url).trim())
    .filter((url, index, arr) => arr.indexOf(url) === index);
}

function normalizeItem(item) {
  const imageUrl =
    item.imageURL?.large ||
    item.imageURL?.list ||
    item.imageURL?.small ||
    '';

  const galleryImages = normalizeGalleryImages(item);

  const sampleVideoUrl =
    item.sampleMovieURL?.size_720_480 ||
    item.sampleMovieURL?.size_644_414 ||
    item.sampleMovieURL?.size_560_360 ||
    item.sampleMovieURL?.pc?.flag ||
    item.sampleMovieURL?.sp?.flag ||
    '';

  const fanzaUrl = item.URL || '';
  const genre = mapGenre(item);
  const tags = buildTags(item);

  const rawComment = stripHtml(item.comment || '');
  const fallbackText = buildFallbackDescription(item, genre, tags);

  const description = rawComment
    ? rawComment.slice(0, 80)
    : fallbackText.slice(0, 80);

  const longDescription = rawComment || fallbackText;

  return {
    contentId: item.content_id || '',
    title: item.title || 'タイトル未設定',
    genre,
    tags,
    description,
    longDescription,
    isNew: true,
    imageUrl,
    galleryImages,
    sampleVideoUrl,
    fanzaUrl,
    affiliateUrl: fanzaUrl,
    releaseDate: item.date || ''
  };
}

function loadExistingProducts() {
  try {
    if (!fs.existsSync(OUTPUT_PATH)) return [];
    const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load existing products.json:', error);
    return [];
  }
}

function mergeProducts(existingProducts, newProducts) {
  const existingMap = new Map();

  for (const product of existingProducts) {
    if (product.contentId) {
      existingMap.set(product.contentId, product);
    }
  }

  for (const product of newProducts) {
    if (!product.contentId) continue;

    if (!existingMap.has(product.contentId)) {
      existingMap.set(product.contentId, product);
    }
  }

  const merged = Array.from(existingMap.values());

  merged.sort((a, b) => {
    const dateA = new Date(a.releaseDate || 0).getTime();
    const dateB = new Date(b.releaseDate || 0).getTime();
    return dateB - dateA;
  });

  return merged.map((product, index) => ({
    ...product,
    id: index + 1,
    ranking: index + 1,
    isNew: index < 30
  }));
}

async function main() {
  const allItems = [];
  const pages = 1000; // 30件 × 10 = 最大1000件取得

  for (let i = 0; i < pages; i++) {
    const offset = i * 100 + 1;
    console.log(`Fetching offset=${offset}`);
    const items = await fetchItems({ hits: 100, offset });
    allItems.push(...items);

    if (items.length < 100) break;
  }

  const filteredItems = allItems.filter(shouldKeepItem);
  const normalizedNewProducts = filteredItems.map(normalizeItem);

  const existingProducts = loadExistingProducts();
  const mergedProducts = mergeProducts(existingProducts, normalizedNewProducts);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedProducts, null, 2), 'utf8');

  console.log(`Existing products: ${existingProducts.length}`);
  console.log(`New fetched products: ${normalizedNewProducts.length}`);
  console.log(`Saved merged products: ${mergedProducts.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
