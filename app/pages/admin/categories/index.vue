<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KATEGORİ YÖNETİMİ</span>
          <h1>Kategoriler</h1>
          <p class="page-desc">Kitap kategorilerini düzenleyin, yeni kategoriler tanımlayın. Tüm ekleme ve düzenleme işlemlerini modal üzerinden gerçekleştirin.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="openAddCategoryModal">
            + Yeni Kategori
          </button>
          <div class="header-icon" aria-hidden="true">🏷️</div>
        </div>
      </header>

      <!-- Bildirim mesajları -->
      <div v-if="pageSuccess" class="msg success">✓ {{ pageSuccess }}</div>
      <div v-if="pageError" class="msg error">⚠️ {{ pageError }}</div>

      <!-- Arama -->
      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input v-model="searchQuery" type="text" placeholder="Kategori adı ile ara..." />
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kategoriler yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadCategories">Tekrar Dene</button>
      </div>

      <!-- Tablo -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">{{ filteredCategories.length }} kategori</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Kategori Adı</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredCategories.length === 0">
              <td colspan="2" class="empty-row">Kategori bulunamadı.</td>
            </tr>

            <tr v-for="cat in filteredCategories" :key="cat.id">
              <td>
                <div class="cat-name-cell">
                  <span class="cat-icon">🏷️</span>
                  <strong>{{ cat.name }}</strong>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="edit-btn" @click="openEditCategoryModal(cat)">
                    ✏️ Düzenle
                  </button>
                  <button class="delete-btn" @click="openDeleteCategoryModal(cat)">
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ==============================================
           MODAL 1: YENİ KATEGORİ EKLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showAddModal"
        title="Yeni Kategori Ekle"
        subtitle="Kitaplar için yeni bir kategori başlığı tanımlayın."
        icon="🏷️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="addCategory">
          <div class="form-group">
            <label>Kategori Adı</label>
            <input
              v-model="newCategory.name"
              type="text"
              placeholder="Örn: Bilim Kurgu, Tarih, Felsefe"
              required
            />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Kategori Ekle' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 2: KATEGORİ DÜZENLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showEditModal"
        title="Kategoriyi Düzenle"
        subtitle="Kategori adını güncelleyin."
        icon="✏️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updateCategory">
          <div class="form-group">
            <label>Kategori Adı</label>
            <input
              v-model="editCategoryForm.name"
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
           MODAL 3: KATEGORİ SİLME MODALI
           ============================================== -->
      <AdminModal
        v-model="showDeleteModal"
        title="Kategoriyi Sil"
        subtitle="Bu kategoriyi sistemden silmek istediğinize emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="targetCategory" style="color: #b93828;">
            ⚠️ <strong>{{ targetCategory.name }}</strong> kategorisi silinecektir. Bu kategoriye bağlı kitaplar etkilenebilir.
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeleteCategory"
            >
              {{ modalLoading ? 'Siliniyor...' : 'Evet, Kategoriyi Sil' }}
            </button>
          </div>
        </div>
      </AdminModal>

    </main>

  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const categories = ref<Category[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')

const pageSuccess = ref('')
const pageError = ref('')

// Modal States
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const modalLoading = ref(false)
const modalError = ref('')

const newCategory = ref({ name: '' })
const editCategoryForm = ref({ id: '', name: '' })
const targetCategory = ref<Category | null>(null)

const filteredCategories = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return categories.value
  return categories.value.filter(c => c.name.toLowerCase().includes(q))
})

const openAddCategoryModal = () => {
  newCategory.value = { name: '' }
  modalError.value = ''
  showAddModal.value = true
}

const openEditCategoryModal = (cat: Category) => {
  targetCategory.value = cat
  editCategoryForm.value = {
    id: cat.id,
    name: cat.name
  }
  modalError.value = ''
  showEditModal.value = true
}

const openDeleteCategoryModal = (cat: Category) => {
  targetCategory.value = cat
  modalError.value = ''
  showDeleteModal.value = true
}

// 1. Yeni Kategori Ekle (Modal)
const addCategory = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/Category', {
      method: 'POST',
      body: { name: newCategory.value.name.trim() }
    })
    showAddModal.value = false
    pageSuccess.value = 'Kategori başarıyla eklendi.'
    await loadCategories()
  } catch (error: any) {
    console.error('Kategori eklenemedi:', error)
    modalError.value = error?.data?.message || 'Kategori eklenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 2. Kategori Güncelle (Modal)
const updateCategory = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Category/${editCategoryForm.value.id}`, {
      method: 'PUT',
      body: { name: editCategoryForm.value.name.trim() }
    })
    showEditModal.value = false
    pageSuccess.value = 'Kategori başarıyla güncellendi.'
    await loadCategories()
  } catch (error: any) {
    console.error('Kategori güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Kategori güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 3. Kategori Sil
const confirmDeleteCategory = async () => {
  if (!targetCategory.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Category/${targetCategory.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    pageSuccess.value = 'Kategori başarıyla silindi.'
    await loadCategories()
  } catch (error: any) {
    console.error('Kategori silinemedi:', error)
    modalError.value = error?.data?.message || 'Kategori silinirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

const loadCategories = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await apiFetch<Category[]>('/api/Category')
    categories.value = Array.isArray(data) ? data : []
  } catch {
    loadError.value = 'Kategoriler yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadCategories()
})
</script>

<style scoped>

</style>
