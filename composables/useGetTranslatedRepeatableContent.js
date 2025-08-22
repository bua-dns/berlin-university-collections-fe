// /composables/useGetTranslatedRepeatableContent.js
export function useGetTranslatedRepeatableContent(fieldKey, locale, data, index) {
  if (!data || typeof data !== "object") return ""

  const translations = Array.isArray(data.translations) ? data.translations : []

  // 1) passende Übersetzung suchen (languages_id ODER languages_code)
  const pickByLocale = (loc) => translations.find((t) => t?.languages_id === loc || t?.languages_code === loc)

  const tLocale = pickByLocale(locale)
  const tDe = pickByLocale("de")

  // Helper: Alle Kandidaten-Array-Keys bestimmen, die auf Root und in der Übersetzung existieren
  const findCandidateArrayKey = (t) => {
    if (!t || typeof t !== "object") return null

    const candidates = Object.keys(t).filter((k) => Array.isArray(t[k]) && Array.isArray(data[k]))

    // Bevorzugen wir den Kandidaten, bei dem an `index` ein Objekt mit `fieldKey` existiert
    for (const k of candidates) {
      const el = t[k]?.[index]
      if (el && typeof el === "object" && fieldKey in el) {
        return k
      }
    }
    // Falls keiner exakt passt, nehmen wir den ersten sinnvollen Kandidaten
    return candidates[0] || null
  }

  // Versuche: Locale → Deutsch → (zur Not) aus Root erraten
  const arrayKey =
    findCandidateArrayKey(tLocale) ||
    findCandidateArrayKey(tDe) ||
    // letzter Versuch: irgendein Array, das es auf Root gibt und
    // dessen Element an index ein Objekt ist, das `fieldKey` tragen könnte
    Object.keys(data).find((k) => {
      const rootArr = data[k]
      return (
        Array.isArray(rootArr) && rootArr[index] && typeof rootArr[index] === "object" && fieldKey in rootArr[index]
      )
    }) ||
    null

  if (!arrayKey || typeof index !== "number") {
    // Fallback komplett: nichts gefunden
    return ""
  }

  // 2) Wert aus gewünschter Locale
  const fromTranslation = (t) => t?.[arrayKey]?.[index] && t[arrayKey][index][fieldKey]

  const vLocale = fromTranslation(tLocale)
  if (vLocale) return vLocale

  // 3) Fallback: Deutsch
  const vDe = fromTranslation(tDe)
  if (vDe) return vDe

  // 4) Fallback: Originaldaten (Root)
  const rootEl = data?.[arrayKey]?.[index]
  if (rootEl && typeof rootEl === "object" && fieldKey in rootEl) {
    return rootEl[fieldKey] ?? ""
  }

  return ""
}
