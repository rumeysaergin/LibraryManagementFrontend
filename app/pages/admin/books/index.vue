<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KİTAP YÖNETİMİ</span>
          <h1>Kitaplar</h1>
          <p class="page-desc">Kitap kataloğunu yönetin, yeni kitaplar ve kategoriler ekleyin.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="showAddForm = !showAddForm">
            {{ showAddForm ? '✕ İptal' : '+ Yeni Kitap' }}
          </button>
          <div class="header-icon" aria-hidden="true">📚</div>
        </div>
      </header>


      <!-- Yeni kitap formu -->
      <div v-if="showAddForm" class="form-card">
        <h2>Yeni Kitap Ekle</h2>

        <div v-if="formError" class="msg error">⚠️ {{ formError }}</div>
        <div v-if="formSuccess" class="msg success">✓ {{ formSuccess }}</div>

        <form class="form-grid" @submit.prevent="addBook">

          <div class="form-group">
            <label>Kitap Adı</label>
            <input v-model="newBook.title" type="text" placeholder="Kitap adını girin" required />
          </div>

          <div class="form-group">
            <label>ISBN</label>
            <input v-model="newBook.isbn" type="text" placeholder="ISBN numarası" required />
          </div>

          <div class="form-group">
            <label>Yazar</label>
            <select v-model="newBook.authorId" required>
              <option value="">Yazar Seçin</option>
              <option v-for="author in authors" :key="author.id" :value="author.id">
                {{ getAuthorName(author) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Kategori</label>
            <select v-model="newBook.categoryId" required>
              <option value="">Kategori Seçin</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="formLoading">
              {{ formLoading ? 'Ekleniyor...' : 'Kitap Ekle' }}
            </button>
          </div>

        </form>
      </div>


      <!-- Filtreler -->
      <div class="filters-row">
        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kitap adı veya ISBN ile ara..."
          />
        </div>

        <select v-model="selectedCategory" class="filter-select">
          <option value="">Tüm Kategoriler</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <select v-model="selectedAuthor" class="filter-select">
          <option value="">Tüm Yazarlar</option>
          <option v-for="author in authors" :key="author.id" :value="author.id">
            {{ getAuthorName(author) }}
          </option>
        </select>
      </div>


      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kitaplar yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">Tekrar Dene</button>
      </div>

      <!-- Tablo -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">{{ filteredBooks.length }} kitap</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Kitap Adı</th>
              <th>ISBN</th>
              <th>Yazar</th>
              <th>Kategori</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredBooks.length === 0">
              <td colspan="5" class="empty-row">Kitap bulunamadı.</td>
            </tr>

            <tr v-for="book in filteredBooks" :key="book.id">
              <td>
                <div class="book-title-cell">
                  <span class="book-icon">📖</span>
                  <strong>{{ book.title }}</strong>
                </div>
              </td>
              <td><code class="isbn-code">{{ book.isbn }}</code></td>
              <td>{{ getAuthorNameById(book.authorId) }}</td>
              <td>{{ getCategoryName(book.categoryId) }}</td>
              <td>
                <div class="action-buttons">
                  <NuxtLink :to="`/admin/books/${book.id}`" class="edit-btn">
                    ✏️ Düzenle
                  </NuxtLink>
                  <button class="delete-btn" @click="deleteBook(book)">
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

interface Book {
  id: string
  title: string
  isbn: string
  authorId: string
  categoryId: string
}

interface Author {
  id: string
  name?: string
  firstName?: string
  lastName?: string
}

interface Category {
  id: string
  name: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const books = ref<Book[]>([])
const authors = ref<Author[]>([])
const categories = ref<Category[]>([])

const loading = ref(true)
const loadError = ref('')

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedAuthor = ref('')

const showAddForm = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')

const newBook = ref({
  title: '',
  isbn: '',
  authorId: '',
  categoryId: ''
})

const getAuthorName = (author: Author) => {
  if (author.name) return author.name
  return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Bilinmeyen Yazar'
}

const getAuthorNameById = (authorId: string) => {
  const author = authors.value.find(a => a.id === authorId)
  return author ? getAuthorName(author) : '—'
}

const getCategoryName = (categoryId: string) => {
  return categories.value.find(c => c.id === categoryId)?.name ?? '—'
}

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch = !q ||
      book.title.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q)
    const matchCat = !selectedCategory.value || book.categoryId === selectedCategory.value
    const matchAuthor = !selectedAuthor.value || book.authorId === selectedAuthor.value
    return matchSearch && matchCat && matchAuthor
  })
})

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [bookData, authorData, categoryData] = await Promise.all([
      apiFetch<Book[]>('/api/Book'),
      apiFetch<Author[]>('/api/Author'),
      apiFetch<Category[]>('/api/Category')
    ])
    books.value = Array.isArray(bookData) ? bookData : []
    authors.value = Array.isArray(authorData) ? authorData : []
    categories.value = Array.isArray(categoryData) ? categoryData : []
  }
  catch {
    loadError.value = 'Veriler yüklenirken hata oluştu.'
  }
  finally {
    loading.value = false
  }
}

const addBook = async () => {
  formError.value = ''
  formSuccess.value = ''
  formLoading.value = true
  try {
    await apiFetch('/api/Book', {
      method: 'POST',
      body: {
        title: newBook.value.title,
        isbn: newBook.value.isbn,
        authorId: newBook.value.authorId,
        categoryId: newBook.value.categoryId
      }
    })
    formSuccess.value = 'Kitap başarıyla eklendi.'
    newBook.value = { title: '', isbn: '', authorId: '', categoryId: '' }
    showAddForm.value = false
    await loadData()
  }
  catch (error: any) {
    formError.value = error?.data?.message ?? 'Kitap eklenirken hata oluştu.'
  }
  finally {
    formLoading.value = false
  }
}

const deleteBook = async (book: Book) => {
  const confirmed = window.confirm(
    `"${book.title}" kitabını silmek istediğinize emin misiniz?`
  )
  if (!confirmed) return
  try {
    await apiFetch(`/api/Book/${book.id}`, { method: 'DELETE' })
    await loadData()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Kitap silinirken hata oluştu.')
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadData()
})

</script>


<style scoped>
@import "../../../styles/admin.css";

.filters-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-select {
  padding: 12px 14px;
  background: rgba(255, 250, 244, 0.96);
  border: 1px solid #dfc8b2;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  color: #3f2b20;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #b96b35;
}

.book-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.book-icon {
  font-size: 18px;
}

.isbn-code {
  font-family: monospace;
  font-size: 12px;
  background: #f5e6d5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #7c4b2c;
}
</style>
