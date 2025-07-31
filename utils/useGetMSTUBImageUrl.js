export function useGetMSTUBImageUrl(url) {
  const baseUrl = "https://mstub-db.bua-dns.de/assets/"
  return `${baseUrl}${url}`;
}
