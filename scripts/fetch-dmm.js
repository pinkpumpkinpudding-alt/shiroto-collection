const fs = require("fs");
const path = require("path");

const API_ID = process.env.DMM_API_ID;
const AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;
const SERVICE = process.env.DMM_SERVICE || "digital";
const FLOOR = process.env.DMM_FLOOR || "videoa";
const HITS = String(process.env.DMM_HITS || "30");
const SORT = process.env.DMM_SORT || "date";
const FETCH_DETAIL_CONCURRENCY = Number(process.env.DMM_DETAIL_CONCURRENCY || 3);
const FETCH_TIMEOUT_MS = Number(process.env.DMM_FETCH_TIMEOUT_MS || 15000);

// 最初の数件だけ抽出状況をログに出す
const DEBUG_SAMPLE_COUNT = Number(process.env.DMM_DEBUG_SAMPLE_COUNT || 5);

const PLACEHOLDER_DESCRIPTION = "商品説明がありません。";

console.log("DEBUG: fetch-dmm.js loaded");
console.log("DEBUG: file =", __filename);
console.log("DEBUG: cwd =", process.cwd());

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

  if (!images.length) {
    const cover = pickImage(item);
    if (cover) images.push(cover);
  }

  return [...new Set(images)].slice(0, 4);
}

function pickNames(item, key) {
  const list = item?.iteminfo?.[key];
  if (!Array.isArray(list) || !list.length) return "";
  return list.map((v) => v?.name).filter(Boolean).join(" / ");
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x60;/g, "`")
    .replace(/&#x3D;/g, "=")
    .replace(/&nbsp;/g, " ")
    .replace(/&#10;/g, "\n")
    .replace(/&#13;/g, "\n");
}

function stripHtml(value) {
  return decodeHtml(
    String(value || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([。、！？])/g, "$1")
    .trim();
}

function cleanDescription(value) {
  let normalized = normalizeWhitespace(stripHtml(value));
  if (!normalized) return "";

  // 年齢確認や共通文言を除去
  normalized = normalized
    .replace(/from here on, it will be an adult site that handles adult products\.?/gi, "")
    .replace(/access by anyone under the age of 18 is strictly prohibited\.?/gi, "")
    .replace(/this page is for adults only\.?/gi, "")
    .replace(/adults only\.?/gi, "")
    .replace(/18\+ only\.?/gi, "")
    .replace(/this content is intended for adults only\.?/gi, "")
    .replace(/you must be 18 years or older to enter\.?/gi, "")
    .replace(/この先のページは18歳以上.*$/gim, "")
    .replace(/18歳未満の方は閲覧できません。?/gim, "")
    .replace(/18歳以上対象.*$/gim, "")
    .replace(/年齢確認/gim, "")
    .replace(/サンプル画像.*$/gim, "")
    .replace(/レビュー.*$/gim, "")
    .trim();

  normalized = normalizeWhitespace(normalized);

  const invalidPatterns = [
    /^商品説明がありません。?$/i,
    /^商品説明がまだありません。?$/i,
    /^説明文はありません。?$/i,
    /^年齢確認$/i,
    /^adults only\.?$/i,
    /^18\+ only\.?$/i,
    /^this page is for adults only\.?$/i,
    /^from here on, it will be an adult site that handles adult products\.?$/i,
    /^access by anyone under the age of 18 is strictly prohibited\.?$/i,
    /^続きを読む$/i,
    /^もっと見る$/i,
  ];

  if (!normalized || invalidPatterns.some((pattern) => pattern.test(normalized))) {
    return "";
  }

  return normalized;
}

function hasUsefulDescription(value) {
  const cleaned = cleanDescription(value);
  return cleaned.length >= 20;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMetaContent(html, key, attr = "name") {
  const escapedKey = escapeRegExp(key);

  const patterns = [
    new RegExp(
      `<meta[^>]+${attr}=["']${escapedKey}["'][^>]+content=["']([\\s\\S]*?)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([\\s\\S]*?)["'][^>]+${attr}=["']${escapedKey}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

function collectJsonLdDescriptions(node, results = []) {
  if (!node) return results;

  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdDescriptions(item, results);
    return results;
  }

  if (typeof node === "object") {
    if (typeof node.description === "string") {
      const cleaned = cleanDescription(node.description);
      if (cleaned) results.push(cleaned);
    }

    for (const value of Object.values(node)) {
      collectJsonLdDescriptions(value, results);
    }
  }

  return results;
}

function extractJsonLdDescription(html) {
  const matches = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];

  for (const match of matches) {
    const raw = match?.[1];
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw.trim());
      const descriptions = collectJsonLdDescriptions(parsed, []);
      for (const description of descriptions) {
        if (hasUsefulDescription(description)) {
          return description;
        }
      }
    } catch {
      // 壊れた JSON-LD は無視
    }
  }

  return "";
}

function extractSectionAfterLabel(html, labelPatterns) {
  const labels = labelPatterns.map((v) => escapeRegExp(v)).join("|");

  const patterns = [
    new RegExp(
      `(?:${labels})[\\s\\S]{0,120}?</(?:h2|h3|dt|div|span|p)>\\s*<(?:div|dd|p|section)[^>]*>([\\s\\S]{30,3000}?)</(?:div|dd|p|section)>`,
      "i"
    ),
    new RegExp(
      `(?:${labels})[\\s\\S]{0,80}<p[^>]*>([\\s\\S]{30,3000}?)</p>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const cleaned = cleanDescription(match?.[1] || "");
    if (hasUsefulDescription(cleaned)) return cleaned;
  }

  return "";
}

function extractBodyDescription(html) {
  const blockPatterns = [
    /<p[^>]*class=["'][^"']*(?:mg-b20|summary|lead|description|tx-lead|item-detail|txt|text)[^"']*["'][^>]*>([\s\S]{30,3000}?)<\/p>/i,
    /<div[^>]*class=["'][^"']*(?:mg-b20|summary|lead|description|tx-lead|item-detail|txt|text)[^"']*["'][^>]*>([\s\S]{30,3000}?)<\/div>/i,
    /<section[^>]*class=["'][^"']*(?:description|detail|summary|intro)[^"']*["'][^>]*>([\s\S]{30,3000}?)<\/section>/i,
    /<article[^>]*>([\s\S]{50,4000}?)<\/article>/i,
    /<main[^>]*>([\s\S]{50,5000}?)<\/main>/i,
  ];

  for (const pattern of blockPatterns) {
    const match = html.match(pattern);
    const cleaned = cleanDescription(match?.[1] || "");
    if (hasUsefulDescription(cleaned)) return cleaned;
  }

  const labeled = extractSectionAfterLabel(html, ["作品紹介", "商品紹介", "紹介文", "内容紹介", "解説"]);
  if (hasUsefulDescription(labeled)) return labeled;

  return "";
}

function extractLurl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    const lurl = parsed.searchParams.get("lurl");
    return lurl ? decodeURIComponent(lurl) : "";
  } catch {
    return "";
  }
}

function buildDetailUrl(item) {
  return item?.URL || item?.url || extractLurl(item?.affiliateURL || item?.affiliate_url) || "";
}

async function fetchText(url) {
  if (!url) return "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; shiroto-collection-bot/1.2; +https://github.com/)",
        "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[detail] ${url} -> HTTP ${response.status}`);
      return "";
    }

    return await response.text();
  } catch (error) {
    console.warn(`[detail] ${url} -> ${error.message}`);
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDescriptionFromDetail(item, index = -1) {
  const detailUrl = buildDetailUrl(item);
  if (!detailUrl) {
    console.log(`[debug] no detailUrl: ${item?.content_id || item?.product_id || item?.cid || "unknown"}`);
    return "";
  }

  const html = await fetchText(detailUrl);
  if (!html) {
    console.log(`[debug] empty html: ${detailUrl}`);
    return "";
  }

  const metaDescription = extractMetaContent(html, "description");
  const ogDescription = extractMetaContent(html, "og:description", "property");
  const twitterDescription = extractMetaContent(html, "twitter:description", "name");
  const jsonLdDescription = extractJsonLdDescription(html);
  const bodyDescription = extractBodyDescription(html);

  const candidates = [
    ["meta:description", metaDescription],
    ["og:description", ogDescription],
    ["twitter:description", twitterDescription],
    ["jsonld:description", jsonLdDescription],
    ["body:description", bodyDescription],
  ];

  if (index >= 0 && index < DEBUG_SAMPLE_COUNT) {
    console.log(`\n[debug] ===== item ${index + 1} =====`);
    console.log(`[debug] title: ${item?.title || ""}`);
    console.log(`[debug] url: ${detailUrl}`);
    console.log(`[debug] html head: ${html.slice(0, 800).replace(/\s+/g, " ")}`);

    for (const [label, value] of candidates) {
      const cleaned = cleanDescription(value);
      console.log(`[debug] ${label} raw: ${String(value || "").slice(0, 300).replace(/\s+/g, " ")}`);
      console.log(`[debug] ${label} cleaned: ${String(cleaned || "").slice(0, 300).replace(/\s+/g, " ")}`);
    }
  }

  for (const [, candidate] of candidates) {
    const cleaned = cleanDescription(candidate);
    if (hasUsefulDescription(cleaned)) {
      return cleaned;
    }
  }

  return "";
}

async function mapWithConcurrency(list, limit, mapper) {
  const results = new Array(list.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const current = cursor;
      cursor += 1;
      if (current >= list.length) return;
      results[current] = await mapper(list[current], current);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, list.length || 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
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

  console.log(
    "Request URL:",
    endpoint.toString().replace(API_ID, "***API_ID***").replace(AFFILIATE_ID, "***AFFILIATE_ID***")
  );

  const response = await fetch(endpoint.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; shiroto-collection-bot/1.2; +https://github.com/)",
      "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept": "application/json,text/plain,*/*",
    },
  });

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  const rawText = await response.text();
  console.log("Raw response preview:", rawText.slice(0, 1500));

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("APIの返り値がJSONではありません。レスポンスを確認してください。");
  }

  const items = data?.result?.items;

  if (!Array.isArray(items) || !items.length) {
    console.log("Parsed response:", JSON.stringify(data, null, 2));
    throw new Error("APIから商品が取得できませんでした。result.items が空です。");
  }

  const normalized = await mapWithConcurrency(items, FETCH_DETAIL_CONCURRENCY, async (item, index) => {
    const apiDescription = cleanDescription(item?.comment || item?.description || "");

    const detailDescription = hasUsefulDescription(apiDescription)
      ? ""
      : await fetchDescriptionFromDetail(item, index);

    const description =
      (hasUsefulDescription(apiDescription) ? apiDescription : "") ||
      (hasUsefulDescription(detailDescription) ? detailDescription : "") ||
      PLACEHOLDER_DESCRIPTION;

    return {
      id: index + 1,
      title: item?.title || "タイトル未設定",
      image: pickImage(item),
      description,
      actress: pickNames(item, "actress") || "出演者情報なし",
      maker: pickNames(item, "maker") || "メーカー不明",
      label: pickNames(item, "label") || "レーベル不明",
      category: pickNames(item, "genre") || "新着商品",
      code: item?.content_id || item?.product_id || item?.cid || `item-${index + 1}`,
      releaseDate: item?.date || "日付不明",
      duration: item?.volume || "不明",
      price:
        item?.prices?.price ||
        item?.prices?.delivery ||
        item?.price ||
        "価格未設定",
      rating: 80,
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
        "FANZA APIから自動取得した商品です。",
        "最新データに合わせて products.json を更新しています。",
        "価格や配信状況は公式ページでご確認ください。",
      ],
    };
  });

  const filePath = path.join(process.cwd(), "products.json");
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), "utf-8");

  const filledCount = normalized.filter(
    (item) => item.description !== PLACEHOLDER_DESCRIPTION
  ).length;

  console.log(`products.json を更新しました: ${normalized.length}件`);
  console.log(`説明文あり: ${filledCount}件 / ${normalized.length}件`);
  console.log("=== DMM fetch success ===");
}

fetchProducts().catch((error) => {
  console.error("=== DMM fetch error ===");
  console.error(error);
  process.exit(1);
});
