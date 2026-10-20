<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">YAZAR YÖNETİMİ</span>
          <h1>Yazarlar</h1>
          <p class="page-desc">Kitap yazarlarını görüntüleyin, düzenleyin ve yeni yazarlar kaydedin.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="showAddForm = !showAddForm">
            {{ showAddForm ? '✕ İptal' : '+ Yeni Yazar' }}
          </button>
          <div class="header-icon" aria-hidden="true">✍️</div>
        </div>
      </header>


      <!-- Ekle formu -->
      <div v-if="showAddForm" class="form-card">
        <h2>Yeni Yazar Ekle</h2>

        <div v-if="formError" class="msg error">⚠️ {{ formError }}</div>
        <div v-if="formSuccess" class="msg success">✓ {{ formSuccess }}</div>

        <form class="form-grid" @submit.prevent="addAuthor">
          <div class="form-group">
            <label>Yazar Adı / Soyadı</label>
            <input v-model="newAuthor.name" type="text" placeholder="Yazar adını girin" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="formLoading">
              {{ formLoading ? 'Ekleniyor...' : 'Yazar Ekle' }}
            </button>
          </div>
        </form>
      </div>


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
                <div v-if="editingId !== author.id" class="author-name-cell">
                  <span class="author-icon">✍️</span>
                  <strong>{{ getAuthorName(author) }}</strong>
                </div>
                <div v-else class="inline-edit">
                  <input v-model="editingName" type="text" class="inline-input" />
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <template v-if="editingId !== author.id">
                    <button class="edit-btn" @click="startEdit(author)">✏️ Düzenle</button>
                    <button class="delete-btn" @click="deleteAuthor(author)">🗑️ Sil</button>
                  </template>
                  <template v-else>
                    <button class="save-btn" :disabled="saving" @click="saveAuthor(author)">
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

const showAddForm = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')
const newAuthor = ref({ name: '' })

const editingId = ref<string | null>(null)
const editingName = ref('')
const saving = ref(false)

const getAuthorName = (author: Author) => {
  if (author.name) return author.name
  return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'İsimsiz Yazar'
}

const filteredAuthors = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return authors.value
  return authors.value.filter(a => getAuthorName(a).toLowerCase().includes(q))
})

const startEdit = (author: Author) => {
  editingId.value = author.id
  editingName.value = getAuthorName(author)
}

const loadAuthors = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await apiFetch<Author[]>('/api/Author')
    authors.value = Array.isArray(data) ? data : []
  }
  catch {
    loadError.value = 'Yazarlar yüklenirken hata oluştu.'
  }
  finally {
    loading.value = false
  }
}

const addAuthor = async () => {
  formError.value = ''
  formSuccess.value = ''
  formLoading.value = true
  try {
    await apiFetch('/api/Author', {
      method: 'POST',
      body: { name: newAuthor.value.name }
    })
    formSuccess.value = 'Yazar başarıyla eklendi.'
    newAuthor.value = { name: '' }
    showAddForm.value = false
    await loadAuthors()
  }
  catch (error: any) {
    formError.value = error?.data?.message ?? 'Yazar eklenirken hata oluştu.'
  }
  finally {
    formLoading.value = false
  }
}

const saveAuthor = async (author: Author) => {
  saving.value = true
  try {
    await apiFetch(`/api/Author/${author.id}`, {
      method: 'PUT',
      body: { name: editingName.value }
    })
    editingId.value = null
    await loadAuthors()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Yazar güncellenirken hata oluştu.')
  }
  finally {
    saving.value = false
  }
}

const deleteAuthor = async (author: Author) => {
  const name = getAuthorName(author)
  const confirmed = window.confirm(`"${name}" yazarını silmek istediğinize emin misiniz?`)
  if (!confirmed) return
  try {
    await apiFetch(`/api/Author/${author.id}`, { method: 'DELETE' })
    await loadAuthors()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Yazar silinirken hata oluştu.')
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadAuthors()
})

</script>


<style scoped>
@import "../../../styles/admin.css";

.author-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-icon {
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
