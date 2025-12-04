export async function checkImageExists(src) {
  try {
    const response = await fetch(src, { method: "HEAD" })

    const contentType = response.headers.get("content-type") || ""

    if (response.ok && contentType.startsWith("image/")) {
      return src
    }

    return null
  } catch (err) {
    return null
  }
}
