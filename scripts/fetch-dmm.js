const fs = require("fs");
const path = require("path");

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
const SERVICE = process.env.DMM_SERVICE || "digital";
const FLOOR = process.env.DMM_FLOOR || "videoa";
const HITS = process.env.DMM_HITS || "30";
const SORT = process.env.DMM_SORT || "date";

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

  if (item?.sampleImageURL?.sample_l?.image && Array.isArray(item.sampleImageURL.sample_l.image)) {
    images.push(...item.sampleImageURL.sample_l.image);
  }

  if (!images.length) {
    const cover = pickImage(item);
    if (cover) images.push(cover);
  }

  return images.slice(0, 4);
}

function pickNames(item, key) {
  const list = item?.iteminfo?.[key];
  if (!Array.isArray(list) || !list.length) return "";
  return list.map((v) => v.name).filter(Boolean).join(" / ");
}

async function fetchProducts() {
  console.log("=== DMM fetch start ===");
  console.log("API_ID exists:", !!API_ID);
  console.log("AFFILIATE_ID exists:", !!AFFILIATE_ID);
  console.log("SERVICE:", SERVICE);
  console.log("FLOOR:", FLOOR);
  console.log("HITS:", HITS);
  console.log("SORT:", SORT);

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

  console.log("Request URL:", endpoint.toString().replace(API_ID, "***API_ID***").replace(AFFILIATE_ID, "***AFFILIATE_ID***"));

  const response = await fetch(endpoint.toString(), {
    headers: {
      "User-Agent": "shiroto-collection-bot/1.0"
    }
  });

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  const rawText = await response.text();
  console.log("Raw response preview:", rawText.slice(0, 1500));

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error("APIの返り値がJSONではありません。レスポンスを確認してください。");
  }

  const items = data?.result?.items;

  if (!Array.isArray(items) || !items.length) {
    console.log("Parsed response:", JSON.stringify(data, null, 2));
    throw new Error("APIから商品が取得できませんでした。result.items が空です。");
  }

  const normalized = items.map((item, index) => ({
    id: index + 1,
    title: item.title || "タイトル未設定",
    image: pickImage(item),
    description: item.comment || item.description || "商品説明がありません。",
    actress: pickNames(item, "actress") || "出演者情報なし",
    maker: pickNames(item, "maker") || "メーカー不明",
    label: pickNames(item, "label") || "レーベル不明",
    category: pickNames(item, "genre") || "新着商品",
    code: item.content_id || item.product_id || item.cid || `item-${index + 1}`,
    releaseDate: item.date || "日付不明",
    duration: item.volume || "不明",
    price:
      item?.prices?.price ||
      item?.prices?.delivery ||
      item?.price ||
      "価格未設定",
    rating: 80,
    affiliateLink:
      item.affiliateURL ||
      item.affiliate_url ||
      item.URL ||
      item.url ||
      "#",
    gallery: pickGallery(item),
    tags: (item?.iteminfo?.genre || []).map((v) => v.name).filter(Boolean).slice(0, 5),
    points: [
      "FANZA APIから自動取得した商品です。",
      "最新データに合わせて products.json を更新しています。",
      "価格や配信状況は公式ページでご確認ください。"
    ]
  }));

  const filePath = path.join(process.cwd(), "products.json");
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), "utf-8");

  console.log(`products.json を更新しました: ${normalized.length}件`);
  console.log("=== DMM fetch success ===");
}

fetchProducts().catch((error) => {
  console.error("=== DMM fetch error ===");
  console.error(error);
  process.exit(1);
});
