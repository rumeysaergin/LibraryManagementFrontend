<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">
            {{ selectedLibrary ? `SEÇİLİ KÜTÜPHANE: ${selectedLibrary.name}` : 'KİTAP YÖNETİMİ' }}
          </span>
          <h1>{{ selectedLibrary ? `${selectedLibrary.name} Kitap Kataloğu` : 'Kitaplar' }}</h1>
          <p class="page-desc">
            {{
              selectedLibrary
                ? `Yalnızca ${selectedLibrary.name} kütüphanesinde mevcut olan kitaplar ve stok adetleri listelenmektedir.`
                : 'Kitap kataloğunu yönetin. Kitap ekleme ve düzenleme işlemlerini modal üzerinden anında gerçekleştirin.'
            }}
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="openAddBookModal">
            {{ selectedLibrary ? `+ ${selectedLibrary.name}'ne Kitap Ekle` : '+ Yeni Kitap' }}
          </button>
          <div class="header-icon" aria-hidden="true">📚</div>
        </div>
      </header>

      <!-- Seçili Kütüphane Bilgi Şeridi -->
      <div v-if="selectedLibrary" class="active-lib-filter-pill">
        <span>🏛️ Sol menüden seçilen kütüphaneye filtrelendi: <strong>{{ selectedLibrary.name }}</strong> ({{ scopedBooks.length }} Çeşit Kitap)</span>
        <button type="button" class="clear-filter-mini-btn" @click="setLibraryId('')">
          ✕ Filtreyi Kaldır (Tüm Kitaplar)
        </button>
      </div>

      <!-- Bildirim mesajları -->
      <div v-if="pageSuccess" class="msg success">✓ {{ pageSuccess }}</div>
      <div v-if="pageError" class="msg error">⚠️ {{ pageError }}</div>

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
              <th v-if="selectedLibrary">Bu Kütüphanedeki Stok</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredBooks.length === 0">
              <td :colspan="selectedLibrary ? 6 : 5" class="empty-row">Kitap bulunamadı.</td>
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
              <td>
                <span class="category-tag">
                  {{ getCategoryName(book.categoryId) }}
                </span>
              </td>
              <td v-if="selectedLibrary">
                <span class="qty-pill">
                  📦 {{ getStockQuantity(book.id) }} Adet
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="edit-btn" @click="openEditBookModal(book)">
                    ✏️ Düzenle
                  </button>
                  <button class="delete-btn" @click="openDeleteBookModal(book)">
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ==============================================
           MODAL 1: YENİ KİTAP EKLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showAddModal"
        title="Yeni Kitap Ekle"
        subtitle="Kütüphane kataloğuna yeni bir kitap kaydedin."
        icon="📚"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="addBook">
          <div class="form-group">
            <label>Kitap Adı</label>
            <input v-model="newBook.title" type="text" placeholder="Kitap adını girin" required />
          </div>

          <div class="form-group">
            <label>ISBN Numarası</label>
            <input v-model="newBook.isbn" type="text" placeholder="Örn: 978-0-123456-47-2" required />
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

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Kitabı Ekle' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 2: KİTAP DÜZENLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showEditModal"
        title="Kitap Bilgilerini Düzenle"
        subtitle="Kitap adı, ISBN, yazar ve kategori bilgilerini modal üzerinden güncelleyin."
        icon="✏️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updateBook">
          <div class="form-group">
            <label>Kitap Adı</label>
            <input v-model="editBookForm.title" type="text" required />
          </div>

          <div class="form-group">
            <label>ISBN Numarası</label>
            <input v-model="editBookForm.isbn" type="text" required />
          </div>

          <div class="form-group">
            <label>Yazar</label>
            <select v-model="editBookForm.authorId" required>
              <option value="">Yazar Seçin</option>
              <option v-for="author in authors" :key="author.id" :value="author.id">
                {{ getAuthorName(author) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Kategori</label>
            <select v-model="editBookForm.categoryId" required>
              <option value="">Kategori Seçin</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
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
           MODAL 3: KİTAP SİLME ONAY MODALI
           ============================================== -->
      <AdminModal
        v-model="showDeleteModal"
        title="Kitabı Sil"
        subtitle="Bu kitabı katalogdan kaldırmak istediğinizden emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="targetBook" style="color: #b93828;">
            ⚠️ <strong>{{ targetBook.title }}</strong> adlı kitap silinecektir. Bu işlem geri alınamaz!
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeleteBook"
            >
              {{ modalLoading ? 'Siliniyor...' : 'Evet, Kitabı Sil' }}
            </button>
          </div>
        </div>
      </AdminModal>

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

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()
const { selectedLibraryId, selectedLibrary, setLibraryId } = useAdminLibrary()

const books = ref<Book[]>([])
const authors = ref<Author[]>([])
const categories = ref<Category[]>([])
const libraryBooks = ref<LibraryBook[]>([])

const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedAuthor = ref('')

const pageSuccess = ref('')
const pageError = ref('')

// Modal durumları
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const modalLoading = ref(false)
const modalError = ref('')

const newBook = ref({
  title: '',
  isbn: '',
  authorId: '',
  categoryId: '',
  initialQuantity: 1
})

const editBookForm = ref({
  id: '',
  title: '',
  isbn: '',
  authorId: '',
  categoryId: ''
})

const targetBook = ref<Book | null>(null)

// Sol menüde kütüphane seçiliyse sadece o kütüphanede stoku olan kitaplar
const scopedBooks = computed(() => {
  if (!selectedLibraryId.value) return books.value
  const existingBookIds = new Set(
    libraryBooks.value
      .filter(lb => lb.libraryId === selectedLibraryId.value)
      .map(lb => lb.bookId)
  )
  return books.value.filter(b => existingBookIds.has(b.id))
})

const getStockQuantity = (bookId: string) => {
  if (!selectedLibraryId.value) return 0
  const lb = libraryBooks.value.find(
    item => item.libraryId === selectedLibraryId.value && item.bookId === bookId
  )
  return lb ? lb.quantity : 0
}

const getAuthorName = (author: Author) => {
  if (author.name) return author.name
  return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Bilinmeyen Yazar'
}

const getAuthorNameById = (authorId: string) => {
  const author = authors.value.find(a => a.id === authorId)
  if (!author) return 'Bilinmeyen Yazar'
  return getAuthorName(author)
}

const getCategoryName = (categoryId: string) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? cat.name : 'Kategorisiz'
}

const filteredBooks = computed(() => {
  return scopedBooks.value.filter(book => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      book.isbn.toLowerCase().includes(q)
    const matchCat =
      !selectedCategory.value || book.categoryId === selectedCategory.value
    const matchAuthor =
      !selectedAuthor.value || book.authorId === selectedAuthor.value
    return matchSearch && matchCat && matchAuthor
  })
})

// Modal Açıcılar
const openAddBookModal = () => {
  newBook.value = {
    title: '',
    isbn: '',
    authorId: '',
    categoryId: ''
  }
  modalError.value = ''
  showAddModal.value = true
}

const openEditBookModal = (book: Book) => {
  targetBook.value = book
  editBookForm.value = {
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    authorId: book.authorId,
    categoryId: book.categoryId
  }
  modalError.value = ''
  showEditModal.value = true
}

const openDeleteBookModal = (book: Book) => {
  targetBook.value = book
  modalError.value = ''
  showDeleteModal.value = true
}

// 1. Yeni Kitap Ekle (Modal)
const addBook = async () => {
  modalLoading.value = true
  modalError.value = ''
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

    // Eğer sol menüde bir kütüphane seçiliyse, bu kitabı doğrudan o kütüphanenin stoğuna da ekle
    if (selectedLibraryId.value) {
      try {
        const freshBooks = await apiFetch<Book[]>('/api/Book')
        const createdBook = freshBooks.find(b => b.isbn.trim() === newBook.value.isbn.trim())
        if (createdBook) {
          await apiFetch('/api/LibraryBook', {
            method: 'POST',
            body: {
              libraryId: selectedLibraryId.value,
              bookId: createdBook.id,
              quantity: newBook.value.initialQuantity || 1
            }
          })
        }
      } catch (e) {
        console.error('Kitap kütüphane stoğuna otomatik eklenemedi:', e)
      }
    }

    showAddModal.value = false
    pageSuccess.value = selectedLibrary.value
      ? `Kitap başarıyla eklendi ve ${selectedLibrary.value.name} stoğuna kaydedildi.`
      : 'Kitap başarıyla eklendi.'
    await loadData()
  } catch (error: any) {
    console.error('Kitap eklenemedi:', error)
    modalError.value = error?.data?.message || 'Kitap eklenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 2. Kitap Düzenle (Modal)
const updateBook = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Book/${editBookForm.value.id}`, {
      method: 'PUT',
      body: {
        title: editBookForm.value.title,
        isbn: editBookForm.value.isbn,
        authorId: editBookForm.value.authorId,
        categoryId: editBookForm.value.categoryId
      }
    })
    showEditModal.value = false
    pageSuccess.value = 'Kitap bilgileri başarıyla güncellendi.'
    await loadData()
  } catch (error: any) {
    console.error('Kitap güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Kitap güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 3. Kitap Sil
const confirmDeleteBook = async () => {
  if (!targetBook.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Book/${targetBook.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    pageSuccess.value = 'Kitap başarıyla silindi.'
    await loadData()
  } catch (error: any) {
    console.error('Kitap silinemedi:', error)
    modalError.value = error?.data?.message || 'Kitap silinirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [bookData, authorData, categoryData, lbData] = await Promise.all([
      apiFetch<Book[]>('/api/Book'),
      apiFetch<Author[]>('/api/Author'),
      apiFetch<Category[]>('/api/Category'),
      apiFetch<LibraryBook[]>('/api/LibraryBook').catch(() => [])
    ])
    books.value = Array.isArray(bookData) ? bookData : []
    authors.value = Array.isArray(authorData) ? authorData : []
    categories.value = Array.isArray(categoryData) ? categoryData : []
    libraryBooks.value = Array.isArray(lbData) ? lbData : []
  } catch {
    loadError.value = 'Veriler yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadData()
})
</script>

<style scoped>


.active-lib-filter-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fbf3e9;
  border: 1px solid #e7d5c3;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  color: #493122;
  margin-bottom: 20px;
}

.clear-filter-mini-btn {
  background: #fff;
  border: 1px solid #dcc2a7;
  color: #8c5734;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-mini-btn:hover {
  background: #8c5734;
  color: #fff;
}

.qty-pill {
  background: #eef8ee;
  border: 1px solid #c6e6c6;
  color: #276a2b;
  font-size: 12px;
  font-weight: 750;
  padding: 4px 10px;
  border-radius: 10px;
}

.category-tag {
  background: #fbf2e7;
  border: 1px solid #e7d5c3;
  color: #6a4a33;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}
</style>
