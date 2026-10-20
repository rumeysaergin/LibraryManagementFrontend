
<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KÜTÜPHANE YÖNETİMİ</span>
          <h1>Kütüphaneler</h1>
          <p class="page-desc">
            Kütüphaneleri, şubeleri ve kitap stoklarını yönetin.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="showAddForm = !showAddForm">
            {{ showAddForm ? '✕ İptal' : '+ Yeni Kütüphane' }}
          </button>
          <div class="header-icon" aria-hidden="true">🏛️</div>
        </div>
      </header>

      <!-- Yeni kütüphane formu -->
      <div v-if="showAddForm" class="form-card">
        <h2>Yeni Kütüphane Ekle</h2>

        <div v-if="formError" class="msg error">
          ⚠️ {{ formError }}
        </div>

        <div v-if="formSuccess" class="msg success">
          ✓ {{ formSuccess }}
        </div>

        <form class="form-grid" @submit.prevent="addLibrary">
          <div class="form-group">
            <label>Kütüphane Adı</label>
            <input
              v-model="newLibrary.name"
              type="text"
              placeholder="Kütüphane adını girin"
              required
            />
          </div>

          <div class="form-group">
            <label>Adres</label>
            <input
              v-model="newLibrary.address"
              type="text"
              placeholder="Adres"
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="submit-btn"
              :disabled="formLoading"
            >
              {{ formLoading ? 'Ekleniyor...' : 'Kütüphane Ekle' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Arama -->
      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Kütüphane adına göre ara..."
        />
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kütüphaneler yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadLibraries">
          Tekrar Dene
        </button>
      </div>

      <!-- Kütüphane tablosu -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">
            {{ filteredLibraries.length }} kütüphane
          </span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Kütüphane Adı</th>
              <th>Adres</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredLibraries.length === 0">
              <td colspan="3" class="empty-row">
                Kütüphane bulunamadı.
              </td>
            </tr>

            <tr
              v-for="library in filteredLibraries"
              :key="library.id"
            >
              <td>
                <div class="library-name-cell">
                  <span>🏛️</span>
                  <strong>{{ library.name }}</strong>
                </div>
              </td>

              <td>{{ library.address || '—' }}</td>

              <td>
                <div class="action-buttons">
                  <NuxtLink
                    :to="`/admin/libraries/${library.id}`"
                    class="edit-btn"
                  >
                    ✏️ Düzenle
                  </NuxtLink>

                  <button
                    class="delete-btn"
                    @click="deleteLibrary(library)"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Library {
  id: string
  name: string
  address?: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const libraries = ref<Library[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')

const showAddForm = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')

const newLibrary = ref({
  name: '',
  address: ''
})

const filteredLibraries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  if (!q) return libraries.value

  return libraries.value.filter(library =>
    library.name.toLowerCase().includes(q)
  )
})

const loadLibraries = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const data = await apiFetch<Library[]>('/api/Library')
    libraries.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Kütüphaneler yüklenirken hata:', error)
    loadError.value = 'Kütüphaneler yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}

const addLibrary = async () => {
  formError.value = ''
  formSuccess.value = ''
  formLoading.value = true

  try {
    await apiFetch('/api/Library', {
      method: 'POST',
      body: {
        name: newLibrary.value.name,
        address: newLibrary.value.address || undefined
      }
    })

    formSuccess.value = 'Kütüphane başarıyla eklendi.'
    newLibrary.value = {
      name: '',
      address: ''
    }

    showAddForm.value = false
    await loadLibraries()
  } catch (error: any) {
    formError.value =
      error?.data?.message ?? 'Kütüphane eklenirken hata oluştu.'
  } finally {
    formLoading.value = false
  }
}

const deleteLibrary = async (library: Library) => {
  const confirmed = window.confirm(
    `"${library.name}" kütüphanesini silmek istediğinize emin misiniz?`
  )

  if (!confirmed) return

  try {
    await apiFetch(`/api/Library/${library.id}`, {
      method: 'DELETE'
    })

    await loadLibraries()
  } catch (error: any) {
    window.alert(
      error?.data?.message ?? 'Kütüphane silinirken hata oluştu.'
    )
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadLibraries()
})
</script>

<style scoped>
@import "../../../styles/admin.css";

.library-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}
</style>
