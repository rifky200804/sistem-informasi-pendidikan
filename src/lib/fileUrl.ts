/**
 * Membangun URL lengkap untuk file/gambar yang disimpan di server.
 *
 * Backend mengembalikan path relatif seperti "/uploads/foto.jpg".
 * Fungsi ini menggabungkannya dengan base URL dari VITE_API_URL (tanpa "/api").
 *
 * Contoh:
 *   VITE_API_URL = "http://192.168.1.184:3000/api"
 *   path         = "/uploads/anecdote/foto.jpg"
 *   hasil        = "http://192.168.1.184:3000/uploads/anecdote/foto.jpg"
 *
 * Jika `path` sudah berupa URL lengkap (http/https), langsung dikembalikan apa adanya.
 * Jika `path` kosong / null / undefined, dikembalikan string kosong.
 */
export function getFileUrl(path: string | null | undefined): string {
  if (!path) return "";

  // Sudah URL lengkap → langsung return
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  // Ambil base host dari VITE_API_URL (buang suffix "/api" atau path lainnya)
  const apiUrl = import.meta.env.VITE_API_URL as string || "http://localhost:3000/api";

  // Hapus segmen "/api" di akhir untuk mendapatkan root server
  // Misal: "http://192.168.1.184:3000/api" → "http://192.168.1.184:3000"
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  // Pastikan path diawali "/"
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}
