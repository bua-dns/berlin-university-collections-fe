export function useMakeTitleIDs(content, depth = 6) {
  if (typeof content !== "string" || !content) {
    return content;
  }

  const maxDepth = Number.isFinite(depth) ? depth : parseInt(depth ?? 6, 10);
  if (!maxDepth || maxDepth < 1) {
    return content;
  }

  const clampDepth = Math.min(Math.max(maxDepth, 1), 6);
  const usedIds = new Set();

  const existingIdRegex = /<h([1-6])\b[^>]*\sid\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let existingMatch;
  while ((existingMatch = existingIdRegex.exec(content)) !== null) {
    usedIds.add(existingMatch[2]);
  }

  const slugify = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || null;

  const headingRegex = /<h([1-6])\b(?![^>]*\sid=)([^>]*)>([\s\S]*?)<\/h\1>/gi;

  return content.replace(headingRegex, (fullMatch, level, attrs, innerHtml) => {
    const headingLevel = parseInt(level, 10);
    if (headingLevel > clampDepth) {
      return fullMatch;
    }

    const plainText = innerHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    let baseId = 'heading-' + (slugify(plainText) || headingLevel.toString());

    let uniqueId = baseId;
    let counter = 2;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}-${counter++}`;
    }
    usedIds.add(uniqueId);

    return `<h${headingLevel}${attrs} id="${uniqueId}">${innerHtml}</h${headingLevel}>`;
  });
}
