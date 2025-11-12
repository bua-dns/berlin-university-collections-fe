export function useGetToc(content, depth = 3) {
  if (typeof content !== "string" || !content) {
    return [];
  }

  const maxDepth = Number.isFinite(depth) ? depth : parseInt(depth ?? 3, 10);
  if (!maxDepth || maxDepth < 1) {
    return [];
  }

  const clampDepth = Math.min(Math.max(maxDepth, 1), 6);

  const slugify = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || null;

  const headingRegex = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    if (level > clampDepth) {
      continue;
    }

    const attrs = match[2];
    const innerHtml = match[3];
    const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
    const plainText = innerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (!plainText) {
      continue;
    }

    const headingId = idMatch?.[1] ?? slugify(plainText);
    if (!headingId) {
      continue;
    }

    headings.push({
      level,
      id: headingId,
      title: plainText,
    });
  }

  if (!headings.length) {
    return [];
  }

  const baseLevel = Math.min(...headings.map((item) => item.level));
  const root = { level: baseLevel - 1, children: [] };
  const stack = [root];

  headings.forEach((heading) => {
    const node = { ...heading, children: [] };

    while (stack.length && heading.level <= stack[stack.length - 1].level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1] ?? root;
    parent.children.push(node);
    stack.push(node);
  });

  return root.children;
}