export function useGetTranslatedContent(key, locale, data) {
  if (
    data &&
    data.translations &&
    data.translations.length > 0
  ) {
    // DEV: t.languages_code === locale necessary?
    const translation = data.translations.find((t) => t.languages_id === locale || t.languages_code === locale)
    if (translation && translation[key]) {
      return translation[key]
    }

    // Fallback to the first translation if no match found
    const deTranslation = data.translations?.find((t) => t.languages_id === "de" || t.languages_code === "de")
    if (deTranslation && deTranslation[key]) {
      return deTranslation[key]
    }
  }
  if (data && data[key]) {
    return data[key];
  }
  return "";
}