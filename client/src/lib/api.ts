import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// ─── Interceptor de REQUEST ───────────────────────────────────────────────────
// Se ejecuta antes de cada petición que salga de la app
api.interceptors.request.use((config) => {
  // Leemos el token directamente de localStorage para no acoplar Zustand aquí
  const raw = localStorage.getItem('ryff-auth')
  const accessToken = raw ? JSON.parse(raw)?.state?.tokens?.accessToken : null

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

// ─── Interceptor de RESPONSE ──────────────────────────────────────────────────
// Se ejecuta cuando llega la respuesta del servidor
api.interceptors.response.use(
  // Respuesta exitosa — la dejamos pasar sin tocarla
  (response) => response,

  // Error — aquí manejamos los casos especiales
  async (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expirado o inválido — limpiamos la sesión y mandamos al login
      // Cuando implementemos refresh tokens, aquí va esa lógica
      localStorage.removeItem('ryff-auth')
      window.location.href = '/auth/login'
    }

    // Para cualquier otro error, lo dejamos pasar para que cada servicio lo maneje
    return Promise.reject(error)
  }
)
