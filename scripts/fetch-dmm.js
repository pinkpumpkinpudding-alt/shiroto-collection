const fs = require("fs");
const path = require("path");

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
const SERVICE = process.env.DMM_SERVICE || "digital";
const FLOOR = process.env.DMM_FLOOR || "videoa";
const HITS = String(process.env.DMM_HITS || "30");
const SORT = process.env.DMM_SORT || "date";

const SEARCH_KEYWORDS = [
  "新人",
  "デビュー",
  "デビュー作",
  "初撮り",
  "初出演",
  "初体験"
];

const OFFSETS = [1, 31, 61];

const PRIMARY_KEYWORDS = [
  "新人",
  "デビュー",
  "デビュー作",
  "初撮り",
  "初出演",
  "初体験",
  "初脱ぎ"
];

const SECONDARY_KEYWORDS = [
  "素人",
  "シロウト"
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
  "レズビアン",
  "盗撮",
  "のぞき",
  "盗撮・のぞき",
  "エステ",
  "マッサージ・エステ",
  "オイル",
  "風俗嬢",
  "着エロ",
  "アイドル・芸能人"
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

  const cover = pickImage(item);
  if (cover) images.push(cover);

  if (Array.isArray(item?.sampleImageURL?.sample_l?.image)) {
    images.push(...item.sampleImageURL.sample_l.image);
  } else if (Array.isArray(item?.sampleImageURL?.sample_s?.image)) {
    images.push(...item.sampleImageURL.sample_s.image);
  }

  return [...new Set(images)].filter(Boolean).slice(0, 4);
}

function pickNames(item, key) {
  const list = item?.iteminfo?.[key];
  if (!Array.isArray(list) || !list.length) return "";
  return list.map((v) => v?.name).filter(Boolean).join(" / ");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

function includesAnyKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) =>
    normalized.includes(normalizeText(keyword))
  );
}

function buildSearchText(item) {
  return [
    item?.title || "",
    pickNames(item, "genre"),
    pickNames(item, "maker"),
    pickNames(item, "label"),
    pickNames(item, "actress")
  ]
    .filter(Boolean)
    .join(" / ");
}

function cleanDescription(value) {
  const text = String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([。、！？])/g, "$1")
    .trim();

  if (!text) return "";

  const invalidPatterns = [
    /^商品説明がありません。?$/i,
    /^商品説明がまだありません。?$/i,
    /^説明文はありません。?$/i,
    /^年齢確認$/i,
    /^18歳未満の方は閲覧できません。?$/i
  ];

  if (invalidPatterns.some((pattern) => pattern.test(text))) {
    return "";
  }

  return text;
}

function toTime(value) {
  const t = new Date(value || "").getTime();
  return Number.isFinite(t) ? t : 0;
}

function scoreConcept(item) {
  const text = buildSearchText(item);

  if (includesAnyKeyword(text, BLOCK_KEYWORDS)) {
    return -999;
  }

  let score = 0;

  if (includesAnyKeyword(text, PRIMARY_KEYWORDS)) {
    score += 3;
  }

  if (includesAnyKeyword(text, SECONDARY_KEYWORDS)) {
    score += 1;
  }

  return score;
}

async function fetchPage(keyword, offset) {
  const endpoint = new URL("https://api.dmm.com/affiliate/v3/ItemList");
  endpoint.searchParams.set("api_id", API_ID);
  endpoint.searchParams.set("affiliate_id", AFFILIATE_ID);
  endpoint.searchParams.set("site", "FANZA");
  endpoint.searchParams.set("service", SERVICE);
  endpoint.searchParams.set("floor", FLOOR);
  endpoint.searchParams.set("hits", HITS);
  endpoint.searchParams.set("sort", SORT);
  endpoint.searchParams.set("offset", String(offset));
  endpoint.searchParams.set("keyword", keyword);
  endpoint.searchParams.set("output", "json");

  console.log(`keyword=${keyword} offset=${offset} request start`);

  const response = await fetch(endpoint.toString(), {
    headers: {
      "User-Agent": "shiroto-collection-bot/4.0",
      "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const rawText = await response.text();

  console.log(`keyword=${keyword} offset=${offset} status:`, response.status);
  console.log(
    `keyword=${keyword} offset=${offset} preview:`,
    rawText.slice(0, 300)
  );

  if (!response.ok) {
    throw new Error(
      `API取得失敗 keyword=${keyword} offset=${offset} / HTTP ${response.status} / ${rawText.slice(0, 500)}`
    );
  }

  const data = JSON.parse(rawText);
  const items = data?.result?.items;

  return Array.isArray(items) ? items : [];
}

async function fetchProducts() {
  console.log("=== DMM fetch start ===");

  if (!API_ID || !AFFILIATE_ID) {
    throw new Error("DMM_API_ID または DMM_AFFILIATE_ID が未設定です。");
  }

  const allItems = [];

  for (const keyword of SEARCH_KEYWORDS) {
    for (const offset of OFFSETS) {
      const pageItems = await fetchPage(keyword, offset);
      console.log(`keyword=${keyword} offset=${offset}: ${pageItems.length}件`);
      allItems.push(...pageItems);
    }
  }

  const uniqueItems = Array.from(
    new Map(
      allItems.map((item) => [
        item?.content_id || item?.product_id || item?.cid || `${item?.title}-${item?.date}`,
        item
      ])
    ).values()
  );

  console.log(`総取得件数: ${allItems.length}件`);
  console.log(`重複除去後: ${uniqueItems.length}件`);

  let scoredItems = uniqueItems
    .map((item) => ({
      item,
      score: scoreConcept(item)
    }))
    .filter(
      ({ item, score }) =>
        score >= 3 &&
        pickImage(item) &&
        (item?.affiliateURL || item?.affiliate_url || item?.URL || item?.url)
    );

  if (scoredItems.length < 12) {
    scoredItems = uniqueItems
      .map((item) => ({
        item,
        score: scoreConcept(item)
      }))
      .filter(
        ({ item, score }) =>
          score >= 2 &&
          pickImage(item) &&
          (item?.affiliateURL || item?.affiliate_url || item?.URL || item?.url)
      );
  }

  const filteredItems = scoredItems
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return toTime(b.item?.date) - toTime(a.item?.date);
    })
    .slice(0, 30)
    .map(({ item }) => item);

  console.log(`条件一致件数: ${filteredItems.length}件`);

  if (!filteredItems.length) {
    throw new Error("条件に一致する実在商品が0件でした。SEARCH_KEYWORDS / BLOCK_KEYWORDS を見直してください。");
  }

  const normalized = filteredItems.map((item, index) => ({
    id: index + 1,
    title: item?.title || "タイトル未設定",
    image: pickImage(item),
    description:
      cleanDescription(item?.comment || item?.description || "") ||
      "商品説明がありません。",
    actress: pickNames(item, "actress") || "出演者情報なし",
    maker: pickNames(item, "maker") || "メーカー不明",
    label: pickNames(item, "label") || "レーベル不明",
    category: pickNames(item, "genre") || "新着商品",
    code:
      item?.content_id ||
      item?.product_id ||
      item?.cid ||
      `item-${index + 1}`,
    releaseDate: item?.date || "日付不明",
    duration: item?.volume || "不明",
    price:
      item?.prices?.price ||
      item?.prices?.delivery ||
      item?.price ||
      "価格未設定",
    rating: 100 - index,
    affiliateLink:
      item?.affiliateURL ||
      item?.affiliate_url ||
      item?.URL ||
      item?.url ||
      "#",
    gallery: pickGallery(item),
    tags: (item?.iteminfo?.genre || [])
      .map((v) => v?.name)
      .filter(Boolean)
      .slice(0, 5),
    points: [
      "FANZA APIから実在商品だけを抽出しています。",
      "新人・デビュー系を優先して表示しています。",
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
