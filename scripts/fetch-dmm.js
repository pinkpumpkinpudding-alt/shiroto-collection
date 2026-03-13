const fs = require('fs');
const path = require('path');

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;

if (!API_ID || !AFFILIATE_ID) {
  throw new Error('DMM_API_ID or DMM_AFFILIATE_ID is not set.');
}

const ENDPOINT = 'https://api.dmm.com/affiliate/v3/ItemList';

async function fetchItems({ hits = 100, offset = 1, keyword = '' } = {}) {
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

  if (keyword) {
    params.set('keyword', keyword);
  }

  const url = `${ENDPOINT}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`DMM API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (!json.result || !json.result.items) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error('Invalid DMM API response');
  }

  return json.result.items;
}

function mapGenre(item) {
  const text = [
    item.iteminfo?.genre?.map(g => g.name).join(' '),
    item.title || '',
    item.comment || ''
  ].join(' ');

  if (/新人|初撮り|デビュー/i.test(text)) return 'newcomer';
  if (/素人/i.test(text)) return 'amateur';
  if (/清楚|ナチュラル/i.test(text)) return 'clean';
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

function normalizeItem(item, index) {
  const imageUrl =
    item.imageURL?.large ||
    item.imageURL?.list ||
    item.imageURL?.small ||
    '';

  const sampleVideoUrl =
    item.sampleMovieURL?.size_720_480 ||
    item.sampleMovieURL?.size_644_414 ||
    item.sampleMovieURL?.pc?.flag ||
    '';

  const fanzaUrl = item.URL || '';

  const description =
    item.comment?.replace(/<[^>]*>/g, '').slice(0, 80) ||
    '作品説明は準備中です。';

  const longDescription =
    item.comment?.replace(/<[^>]*>/g, '') ||
    '詳細説明は準備中です。';

  return {
    id: index + 1,
    contentId: item.content_id || '',
    title: item.title || 'タイトル未設定',
    genre: mapGenre(item),
    tags: buildTags(item),
    description,
    longDescription,
    ranking: index + 1,
    isNew: true,
    imageUrl,
    sampleVideoUrl,
    fanzaUrl,
    affiliateUrl: fanzaUrl
  };
}

async function main() {
  const allItems = [];
  const pages = 5; // 100件×5ページ = 500件。まずは500件で開始

  for (let i = 0; i < pages; i++) {
    const offset = i * 100 + 1;
    console.log(`Fetching offset=${offset}`);
    const items = await fetchItems({ hits: 100, offset });
    allItems.push(...items);

    if (items.length < 100) {
      break;
    }
  }

  const normalized = allItems.map((item, index) => normalizeItem(item, index));

  const outputPath = path.join(process.cwd(), 'data', 'products.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf8');

  console.log(`Saved ${normalized.length} products to ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
