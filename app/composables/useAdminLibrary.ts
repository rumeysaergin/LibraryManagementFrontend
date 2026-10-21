export interface AdminLibrary {
  id: string
  name: string
  address?: string
}

export const useAdminLibrary = () => {
  const { apiFetch } = useApi()

  // Nuxt SSR ve sayfalar arası reaktif state
  const selectedLibraryId = useState<string>('adminSelectedLibraryId', () => '')
  const libraries = useState<AdminLibrary[]>('adminLibrariesList', () => [])
  const librariesLoaded = useState<boolean>('adminLibrariesLoaded', () => false)

  // Sayfa yüklendiğinde localStorage'dan seçili ID'yi al
  if (import.meta.client && !selectedLibraryId.value) {
    const savedId = localStorage.getItem('admin_selected_library_id')
    if (savedId) {
      selectedLibraryId.value = savedId
    }
  }

  // Seçili Kütüphane Nesnesi
  const selectedLibrary = computed(() => {
    if (!selectedLibraryId.value) return null
    return libraries.value.find(l => l.id === selectedLibraryId.value) || null
  })

  // Kütüphaneleri API'dan yükle
  const loadLibraries = async (force = false) => {
    if (librariesLoaded.value && !force && libraries.value.length > 0) {
      return libraries.value
    }

    try {
      const data = await apiFetch<AdminLibrary[]>('/api/Library')
      if (Array.isArray(data)) {
        libraries.value = data
        librariesLoaded.value = true
      }
    } catch (err) {
      console.error('Kütüphaneler yüklenemedi:', err)
    }
    return libraries.value
  }

  // Kütüphane Seçimini Güncelle
  const setLibraryId = (id: string) => {
    selectedLibraryId.value = id
    if (import.meta.client) {
      if (id) {
        localStorage.setItem('admin_selected_library_id', id)
      } else {
        localStorage.removeItem('admin_selected_library_id')
      }
    }
  }

  const clearSelectedLibrary = () => {
    setLibraryId('')
  }

  return {
    selectedLibraryId,
    selectedLibrary,
    libraries,
    loadLibraries,
    setLibraryId,
    clearSelectedLibrary
  }
}
