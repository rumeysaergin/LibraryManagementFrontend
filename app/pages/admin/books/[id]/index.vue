<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <NuxtLink to="/admin/books" class="back-link">
        ← Kitap Listesine Dön
      </NuxtLink>


      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kitap bilgileri yükleniyor...</p>
      </div>

      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadBook">Tekrar Dene</button>
      </div>

      <div v-else>

        <header class="page-header">
          <div class="header-content">
            <span class="page-eyebrow">KİTAP DÜZENLE</span>
            <h1>{{ book.title }}</h1>
            <p class="page-desc">Kitap bilgilerini, yazar ve kategori eşleştirmelerini güncelleyin.</p>
          </div>
          <div class="header-icon" aria-hidden="true">📖</div>
        </header>

        <div v-if="formError" class="msg error">⚠️ {{ formError }}</div>
        <div v-if="formSuccess" class="msg success">✓ {{ formSuccess }}</div>

        <div class="form-card">
          <h2>Kitap Bilgilerini Düzenle</h2>

          <form class="form-grid" @submit.prevent="updateBook">

            <div class="form-group">
              <label>Kitap Adı</label>
              <input v-model="book.title" type="text" required />
            </div>

            <div class="form-group">
              <label>ISBN</label>
              <input v-model="book.isbn" type="text" required />
            </div>

            <div class="form-group">
              <label>Yazar</label>
              <select v-model="book.authorId" required>
                <option value="">Yazar Seçin</option>
                <option v-for="author in authors" :key="author.id" :value="author.id">
                  {{ getAuthorName(author) }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Kategori</label>
              <select v-model="book.categoryId" required>
                <option value="">Kategori Seçin</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-actions">
              <NuxtLink to="/admin/books" class="cancel-btn">
                İptal
              </NuxtLink>
              <button type="submit" class="submit-btn" :disabled="saving">
                {{ saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
              </button>
            </div>

          </form>
        </div>

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

const route = useRoute()
const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const bookId = computed(() => route.params.id as string)

const book = ref<Book>({ id: '', title: '', isbn: '', authorId: '', categoryId: '' })
const authors = ref<Author[]>([])
const categories = ref<Category[]>([])

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const formError = ref('')
const formSuccess = ref('')

const getAuthorName = (author: Author) => {
  if (author.name) return author.name
  return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Bilinmeyen Yazar'
}

const loadBook = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [bookData, authorData, categoryData] = await Promise.all([
      apiFetch<Book>(`/api/Book/${bookId.value}`),
      apiFetch<Author[]>('/api/Author'),
      apiFetch<Category[]>('/api/Category')
    ])
    book.value = { ...bookData }
    authors.value = Array.isArray(authorData) ? authorData : []
    categories.value = Array.isArray(categoryData) ? categoryData : []
  }
  catch {
    loadError.value = 'Kitap bilgileri yüklenirken hata oluştu.'
  }
  finally {
    loading.value = false
  }
}

const updateBook = async () => {
  formError.value = ''
  formSuccess.value = ''
  saving.value = true
  try {
    await apiFetch(`/api/Book/${bookId.value}`, {
      method: 'PUT',
      body: {
        title: book.value.title,
        isbn: book.value.isbn,
        authorId: book.value.authorId,
        categoryId: book.value.categoryId
      }
    })
    formSuccess.value = 'Kitap başarıyla güncellendi.'
  }
  catch (error: any) {
    formError.value = error?.data?.message ?? 'Güncelleme sırasında hata oluştu.'
  }
  finally {
    saving.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadBook()
})

</script>


<style scoped>

</style>
