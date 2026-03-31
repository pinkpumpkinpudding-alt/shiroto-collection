const fs = require("fs");
const path = require("path");

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
const SERVICE = process.env.DMM_SERVICE || "digital";
const FLOOR = process.env.DMM_FLOOR || "videoa";
const HITS = String(process.env.DMM_HITS || "30");
const SORT = process.env.DMM_SORT || "date";

const ALLOW_KEYWORDS = [
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

const BLOCK_KEYWORDS = [
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
  "M男",
  "女王様",
  "レズ",
  "レズビアン"
];

function pickImage(item) {
  return (
    item?.imageURL?.large ||
    item?.imageURL?.list ||
    item?.imageURL?.small ||
    item?.sampleImageURL?.sample_l?.image?.[0] ||
    item?.sampleImageURL?.sample_s?.image?.[0] ||
    ""
  );
}

function pickGallery(item) {
  const images = [];

  if (Array.isArray(item?.sampleImageURL?.sample_l?.image)) {
    images.push(...item.sampleImageURL.sample_l.image);
  }

  const cover = pickImage(item);
  if (cover) images.unshift(cover);

  return [...new Set(images)].filter(Boolean).slice(0, 4);
}

function pickNames(item, key) {
  const list = item?.iteminfo?.[key];
  if (!Array.isArray(list) || !list.length) return "";
  return list.map((v) => v?.name).filter(Boolean).join(" / ");
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "").trim();
}

function includesAnyKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
}

function buildSearchText(item) {
  return [
    item?.title || "",
    pickNames(item, "genre"),
    pickNames(item, "maker"),
    pickNames(item, "label"),
    pickNames(item, "actress")
  ].filter(Boolean).join(" / ");
}

function isConceptMatch(item) {
  const text = buildSearchText(item);
  const hasAllow = includesAnyKeyword(text, ALLOW_KEYWORDS);
  const hasBlock = includesAnyKeyword(text, BLOCK_KEYWORDS);
  return hasAllow && !hasBlock;
}

function toTime(value) {
  const t = new Date(value || "").getTime();
  return Number.isFinite(t) ? t : 0;
}

async function fetchProducts() {
  console.log("=== DMM fetch start ===");

  if (!API_ID || !AFFILIATE_ID) {
    throw new Error("DMM_API_ID または DMM_AFFILIATE_ID が未設定です。");
  }

  const endpoint = new URL("https://api.dmm.com/affiliate/v3/ItemList");
  endpoint.searchParams.set("api_id", API_ID);
  endpoint.searchParams.set("affiliate_id", AFFILIATE_ID);
  endpoint.searchParams.set("site", "FANZA");
  endpoint.searchParams.set("service", SERVICE);
  endpoint.searchParams.set("floor", FLOOR);
  endpoint.searchParams.set("hits", HITS);
  endpoint.searchParams.set("sort", SORT);
  endpoint.searchParams.set("output", "json");

  const response = await fetch(endpoint.toString(), {
    headers: {
      "User-Agent": "shiroto-collection-bot/3.0",
      "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const rawText = await response.text();

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);
  console.log("Raw response preview:", rawText.slice(0, 1500));

  if (!response.ok) {
    throw new Error(`API取得失敗: HTTP ${response.status} / ${rawText.slice(0, 500)}`);
  }

  const data = JSON.parse(rawText);
  const items = data?.result?.items;

  if (!Array.isArray(items) || !items.length) {
    throw new Error("APIから商品が取得できませんでした。");
  }

  const filteredItems = items
    .filter(isConceptMatch)
    .filter((item) => pickImage(item))
    .filter((item) => item?.affiliateURL || item?.affiliate_url || item?.URL || item?.url)
    .sort((a, b) => toTime(b?.date) - toTime(a?.date))
    .slice(0, 30);

  console.log(`取得件数: ${items.length}件`);
  console.log(`条件一致件数: ${filteredItems.length}件`);

  if (!filteredItems.length) {
    throw new Error("条件に一致する実在商品が0件でした。キーワード条件を見直してください。");
  }

  const normalized = filteredItems.map((item, index) => ({
    id: index + 1,
    title: item?.title || "タイトル未設定",
    image: pickImage(item),
    description: item?.comment || item?.description || "商品説明がありません。",
    actress: pickNames(item, "actress") || "出演者情報なし",
    maker: pickNames(item, "maker") || "メーカー不明",
    label: pickNames(item, "label") || "レーベル不明",
    category: pickNames(item, "genre") || "新着商品",
    code: item?.content_id || item?.product_id || item?.cid || `item-${index + 1}`,
    releaseDate: item?.date || "日付不明",
    duration: item?.volume || "不明",
    price: item?.prices?.price || item?.prices?.delivery || item?.price || "価格未設定",
    rating: 100 - index,
    affiliateLink: item?.affiliateURL || item?.affiliate_url || item?.URL || item?.url || "#",
    gallery: pickGallery(item),
    tags: (item?.iteminfo?.genre || []).map((v) => v?.name).filter(Boolean).slice(0, 5),
    points: [
      "FANZA APIから実在商品だけを抽出しています。",
      "素人・新人デビュー系の条件で絞り込んでいます。",
      "価格や配信状況は公式ページでご確認ください。"
    ]
  }));

  fs.writeFileSync(
    path.join(process.cwd(), "products.json"),
    JSON.stringify(normalized, null, 2),
    "utf-8"
  );

  console.log(`products.json を更新しました: ${normalized.length}件`);
  console.log("=== DMM fetch success ===");
}
fetchProducts().catch((error) => {
  console.error("=== DMM fetch error ===");
  console.error(error);
  process.exit(1);
});
