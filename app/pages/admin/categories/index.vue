<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KATEGORİ YÖNETİMİ</span>
          <h1>Kategoriler</h1>
          <p class="page-desc">Kitap kategorilerini düzenleyin, yeni kategoriler tanımlayın.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="showAddForm = !showAddForm">
            {{ showAddForm ? '✕ İptal' : '+ Yeni Kategori' }}
          </button>
          <div class="header-icon" aria-hidden="true">🏷️</div>
        </div>
      </header>


      <!-- Ekle formu -->
      <div v-if="showAddForm" class="form-card">
        <h2>Yeni Kategori Ekle</h2>

        <div v-if="formError" class="msg error">⚠️ {{ formError }}</div>
        <div v-if="formSuccess" class="msg success">✓ {{ formSuccess }}</div>

        <form class="form-grid" @submit.prevent="addCategory">
          <div class="form-group">
            <label>Kategori Adı</label>
            <input v-model="newCategory.name" type="text" placeholder="Kategori adını girin" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="formLoading">
              {{ formLoading ? 'Ekleniyor...' : 'Kategori Ekle' }}
            </button>
          </div>
        </form>
      </div>


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
                <div v-if="editingId !== cat.id" class="cat-name-cell">
                  <span class="cat-icon">🏷️</span>
                  {{ cat.name }}
                </div>
                <div v-else class="inline-edit">
                  <input v-model="editingName" type="text" class="inline-input" />
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <template v-if="editingId !== cat.id">
                    <button class="edit-btn" @click="startEdit(cat)">✏️ Düzenle</button>
                    <button class="delete-btn" @click="deleteCategory(cat)">🗑️ Sil</button>
                  </template>
                  <template v-else>
                    <button class="save-btn" :disabled="saving" @click="saveCategory(cat)">
                      {{ saving ? '...' : '✓ Kaydet' }}
                    </button>
                    <button class="cancel-btn" @click="editingId = null">✕ İptal</button>
                  </template>
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

const showAddForm = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')
const newCategory = ref({ name: '' })

const editingId = ref<string | null>(null)
const editingName = ref('')
const saving = ref(false)

const filteredCategories = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return categories.value
  return categories.value.filter(c => c.name.toLowerCase().includes(q))
})

const startEdit = (cat: Category) => {
  editingId.value = cat.id
  editingName.value = cat.name
}

const loadCategories = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await apiFetch<Category[]>('/api/Category')
    categories.value = Array.isArray(data) ? data : []
  }
  catch {
    loadError.value = 'Kategoriler yüklenirken hata oluştu.'
  }
  finally {
    loading.value = false
  }
}

const addCategory = async () => {
  formError.value = ''
  formSuccess.value = ''
  formLoading.value = true
  try {
    await apiFetch('/api/Category', {
      method: 'POST',
      body: { name: newCategory.value.name }
    })
    formSuccess.value = 'Kategori başarıyla eklendi.'
    newCategory.value = { name: '' }
    showAddForm.value = false
    await loadCategories()
  }
  catch (error: any) {
    formError.value = error?.data?.message ?? 'Kategori eklenirken hata oluştu.'
  }
  finally {
    formLoading.value = false
  }
}

const saveCategory = async (cat: Category) => {
  saving.value = true
  try {
    await apiFetch(`/api/Category/${cat.id}`, {
      method: 'PUT',
      body: { name: editingName.value }
    })
    editingId.value = null
    await loadCategories()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Kategori güncellenirken hata oluştu.')
  }
  finally {
    saving.value = false
  }
}

const deleteCategory = async (cat: Category) => {
  const confirmed = window.confirm(`"${cat.name}" kategorisini silmek istediğinize emin misiniz?`)
  if (!confirmed) return
  try {
    await apiFetch(`/api/Category/${cat.id}`, { method: 'DELETE' })
    await loadCategories()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Kategori silinirken hata oluştu.')
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadCategories()
})

</script>


<style scoped>
@import "../../../styles/admin.css";

.cat-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-icon {
  font-size: 16px;
}

.inline-edit {
  display: flex;
  align-items: center;
}

.inline-input {
  padding: 7px 10px;
  border: 1px solid #b96b35;
  border-radius: 7px;
  font-family: inherit;
  font-size: 14px;
  color: #3f2b20;
  outline: none;
  width: 240px;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  color: #765b48;
  border: 1px solid #dfc8b2;
  border-radius: 7px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #f5e6d5;
}
</style>
