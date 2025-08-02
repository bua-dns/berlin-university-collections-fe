export function useGetSealsBasicInfo(item) {
  if (!item) return null
  if (!item.event || !item.event.length === 0) return null
  const productionEvent = item.event.find((entry) => entry.event_type.vocab_label === "Herstellung/Production")
  const productionEventDate = productionEvent ? productionEvent.event_date?.date_display : null
  return {
    productionEventDate,
  }
}
