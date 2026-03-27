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
  const jsonLdDescription = extractJsonLdDescription(html);
  const bodyDescription = extractBodyDescription(html);

  const candidates = [
    ["meta:description", metaDescription],
    ["og:description", ogDescription],
    ["jsonld:description", jsonLdDescription],
    ["body:description", bodyDescription],
  ];

  if (index >= 0 && index < 5) {
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
