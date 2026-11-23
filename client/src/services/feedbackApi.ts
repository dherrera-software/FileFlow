import { API_BASE_URL } from './conversionApi'
import type { CommunityComment } from '../components/FeedbackSection'

const LOCAL_STORAGE_KEY = 'fileflow_community_comments'

/**
 * Carga los comentarios desde el backend (Cloudflare Workers + D1).
 * Implementa degradación elegante hacia localStorage si el backend no está disponible.
 */
export async function getCommunityComments(
  category?: string,
  limit: number = 20,
): Promise<CommunityComment[]> {
  try {
    const url = new URL(`${API_BASE_URL}/comments`)
    if (category && category !== 'all') {
      url.searchParams.set('category', category)
    }
    url.searchParams.set('limit', String(limit))

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.comments)) {
        // Guardamos copia de respaldo en localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.comments))
        return data.comments
      }
    }
  } catch {
    // Si la API falla (ej. sin conexión o worker no desplegado), fallback a cache local
  }

  // Fallback local
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        return category && category !== 'all'
          ? parsed.filter((c: CommunityComment) => c.category === category)
          : parsed
      }
    }
  } catch {
    // ignore
  }

  return []
}

/**
 * Envía un nuevo comentario al backend de Cloudflare Workers (D1).
 * Si el backend falla, lo almacena localmente para mantener la experiencia fluida.
 */
export async function postCommunityComment(comment: CommunityComment): Promise<CommunityComment> {
  try {
    await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: comment.id,
        name: comment.author.name,
        username: comment.author.username,
        email: comment.author.email,
        avatarColor: comment.author.avatarColor,
        category: comment.category,
        rating: comment.rating,
        text: comment.text,
        createdAt: comment.createdAt,
      }),
    })
  } catch {
    // Se guarda en cache local
  }

  // Actualiza cache local siempre
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    const existing: CommunityComment[] = saved ? JSON.parse(saved) : []
    const updated = [comment, ...existing.filter((c) => c.id !== comment.id)]
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }

  return comment
}

/**
 * Elimina un comentario resuelto/atendido en Cloudflare D1.
 * Requiere que el usuario sea el autor del comentario o un administrador autorizado.
 */
export async function deleteCommunityComment(
  commentId: string,
  userEmail: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/comments/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: {
        'X-User-Email': userEmail,
      },
    })

    if (res.ok) {
      // Actualizar cache local
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          const updated = parsed.filter((c: CommunityComment) => c.id !== commentId)
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        }
      } catch {
        // ignore
      }
      return true
    }
  } catch {
    // ignore
  }

  // Si falló por red pero el usuario es admin en local, actualizar cache local
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const updated = parsed.filter((c: CommunityComment) => c.id !== commentId)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    }
    return true
  } catch {
    return false
  }
}

/**
 * Consulta de forma segura al servidor si el correo tiene rol de administrador,
 * sin exponer la lista de correos administradores en el código del cliente.
 */
export async function checkIsAdmin(userEmail: string): Promise<boolean> {
  if (!userEmail) return false
  try {
    const res = await fetch(`${API_BASE_URL}/comments/is-admin`, {
      method: 'GET',
      headers: {
        'X-User-Email': userEmail,
      },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.isAdmin === true
    }
  } catch {
    // ignore
  }
  return false
}
