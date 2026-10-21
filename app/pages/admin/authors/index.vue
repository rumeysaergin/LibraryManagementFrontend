<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">YAZAR YÖNETİMİ</span>
          <h1>Yazarlar</h1>
          <p class="page-desc">Kitap yazarlarını görüntüleyin, düzenleyin ve yeni yazarlar kaydedin. Tüm işlemler modal pencereleriyle yapılır.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="openAddAuthorModal">
            + Yeni Yazar
          </button>
          <div class="header-icon" aria-hidden="true">✍️</div>
        </div>
      </header>

      <!-- Bildirim mesajları -->
      <div v-if="pageSuccess" class="msg success">✓ {{ pageSuccess }}</div>
      <div v-if="pageError" class="msg error">⚠️ {{ pageError }}</div>

      <!-- Arama -->
      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input v-model="searchQuery" type="text" placeholder="Yazar adı ile ara..." />
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Yazarlar yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadAuthors">Tekrar Dene</button>
      </div>

      <!-- Tablo -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">{{ filteredAuthors.length }} yazar</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Yazar Adı</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredAuthors.length === 0">
              <td colspan="2" class="empty-row">Yazar bulunamadı.</td>
            </tr>

            <tr v-for="author in filteredAuthors" :key="author.id">
              <td>
                <div class="author-name-cell">
                  <span class="author-icon">✍️</span>
                  <strong>{{ getAuthorName(author) }}</strong>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="edit-btn" @click="openEditAuthorModal(author)">
                    ✏️ Düzenle
                  </button>
                  <button class="delete-btn" @click="openDeleteAuthorModal(author)">
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ==============================================
           MODAL 1: YENİ YAZAR EKLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showAddModal"
        title="Yeni Yazar Ekle"
        subtitle="Sisteme yeni bir yazar tanımlayın."
        icon="✍️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="addAuthor">
          <div class="form-group">
            <label>Yazar Adı / Soyadı</label>
            <input
              v-model="newAuthor.name"
              type="text"
              placeholder="Örn: Fyodor Dostoyevski"
              required
            />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Yazarı Ekle' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 2: YAZAR DÜZENLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showEditModal"
        title="Yazar Bilgilerini Düzenle"
        subtitle="Yazar adını güncelleyin."
        icon="✏️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updateAuthor">
          <div class="form-group">
            <label>Yazar Adı / Soyadı</label>
            <input
              v-model="editAuthorForm.name"
              type="text"
              required
            />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showEditModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 3: YAZAR SİLME MODALI
           ============================================== -->
      <AdminModal
        v-model="showDeleteModal"
        title="Yazarı Sil"
        subtitle="Bu yazarı sistemden silmek istediğinize emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="targetAuthor" style="color: #b93828;">
            ⚠️ <strong>{{ getAuthorName(targetAuthor) }}</strong> adlı yazar silinecektir.
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeleteAuthor"
            >
              {{ modalLoading ? 'Siliniyor...' : 'Evet, Yazarı Sil' }}
            </button>
          </div>
        </div>
      </AdminModal>

    </main>

  </div>
</template>

<script setup lang="ts">
interface Author {
  id: string
  name?: string
  firstName?: string
  lastName?: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const authors = ref<Author[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')

const pageSuccess = ref('')
const pageError = ref('')

// Modal durumları
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const modalLoading = ref(false)
const modalError = ref('')

const newAuthor = ref({ name: '' })
const editAuthorForm = ref({ id: '', name: '' })
const targetAuthor = ref<Author | null>(null)

const getAuthorName = (author: Author) => {
  if (author.name) return author.name
  return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Bilinmeyen Yazar'
}

const filteredAuthors = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return authors.value
  return authors.value.filter(a => getAuthorName(a).toLowerCase().includes(q))
})

// Modal Açıcılar
const openAddAuthorModal = () => {
  newAuthor.value = { name: '' }
  modalError.value = ''
  showAddModal.value = true
}

const openEditAuthorModal = (author: Author) => {
  targetAuthor.value = author
  editAuthorForm.value = {
    id: author.id,
    name: getAuthorName(author)
  }
  modalError.value = ''
  showEditModal.value = true
}

const openDeleteAuthorModal = (author: Author) => {
  targetAuthor.value = author
  modalError.value = ''
  showDeleteModal.value = true
}

// 1. Yeni Yazar Ekle (Modal)
const addAuthor = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/Author', {
      method: 'POST',
      body: { name: newAuthor.value.name.trim() }
    })
    showAddModal.value = false
    pageSuccess.value = 'Yazar başarıyla eklendi.'
    await loadAuthors()
  } catch (error: any) {
    console.error('Yazar eklenemedi:', error)
    modalError.value = error?.data?.message || 'Yazar eklenirken bir hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 2. Yazar Bilgisini Güncelle (Modal)
const updateAuthor = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Author/${editAuthorForm.value.id}`, {
      method: 'PUT',
      body: { name: editAuthorForm.value.name.trim() }
    })
    showEditModal.value = false
    pageSuccess.value = 'Yazar başarıyla güncellendi.'
    await loadAuthors()
  } catch (error: any) {
    console.error('Yazar güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Yazar güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 3. Yazar Sil
const confirmDeleteAuthor = async () => {
  if (!targetAuthor.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Author/${targetAuthor.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    pageSuccess.value = 'Yazar başarıyla silindi.'
    await loadAuthors()
  } catch (error: any) {
    console.error('Yazar silinemedi:', error)
    modalError.value = error?.data?.message || 'Yazar silinirken bir hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

const loadAuthors = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await apiFetch<Author[]>('/api/Author')
    authors.value = Array.isArray(data) ? data : []
  } catch {
    loadError.value = 'Yazarlar yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadAuthors()
})
</script>

<style scoped>

</style>
