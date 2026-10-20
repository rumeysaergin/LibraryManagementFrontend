
<template>
  <main class="books-page">
    <div class="books-container">
      <NuxtLink to="/user" class="back-link">
        ← Kullanıcı Paneline Dön
      </NuxtLink>

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KİTAP KOLEKSİYONU</span>
          <h1>Kitaplar</h1>
          <p>
            Üye olduğunuz kütüphanelerde bulunan kitapları
            inceleyebilir ve ödünç alabilirsiniz.
          </p>
        </div>
        <div class="header-icon" aria-hidden="true">📚</div>
      </header>

      <div
        v-if="!loading && !errorMessage && memberLibraries.length === 0"
        class="message-card"
      >
        <div class="empty-icon">📚</div>
        <h3>Henüz bir kütüphaneye üye değilsiniz.</h3>
        <p>
          Kitapları görüntüleyebilmek ve ödünç alabilmek için
          bir kütüphaneye üye olmanız gerekiyor.
        </p>
      </div>

      <template v-else>
        <section class="filters-section">
          <div class="section-heading">
            <div>
              <h2>Kitap Keşfet</h2>
              <p>Aradığınız kitapları filtreleyerek kolayca bulun.</p>
            </div>
          </div>

          <div class="filters">
            <div class="search-box">
              <span class="search-icon">⌕</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Kitap adı, ISBN veya yazar ara..."
              />
            </div>

            <select v-model="selectedLibrary" aria-label="Kütüphane filtresi">
              <option value="">Tüm Kütüphaneler</option>
              <option
                v-for="library in memberLibraries"
                :key="library.id"
                :value="library.id"
              >
                {{ library.name }}
              </option>
            </select>

            <select v-model="selectedCategory" aria-label="Kategori filtresi">
              <option value="">Tüm Kategoriler</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>

            <select v-model="selectedAuthor" aria-label="Yazar filtresi">
              <option value="">Tüm Yazarlar</option>
              <option
                v-for="author in authors"
                :key="author.id"
                :value="author.id"
              >
                {{ getAuthorName(author) }}
              </option>
            </select>

            <select v-model="selectedStock" aria-label="Stok filtresi">
              <option value="">Tüm Kitaplar</option>
              <option value="available">Stokta Olanlar</option>
              <option value="unavailable">Stokta Olmayanlar</option>
            </select>
          </div>
        </section>

        <div v-if="loading" class="message-card">
          <div class="loading-icon">📖</div>
          Kitaplar yükleniyor...
        </div>

        <div v-else-if="errorMessage" class="message-card error-message">
          <p>{{ errorMessage }}</p>
          <button class="secondary-button" @click="loadBooks">
            Tekrar Dene
          </button>
        </div>

        <section v-else class="books-section">
          <div class="section-heading results-heading">
            <div>
              <h2>Kitap Koleksiyonu</h2>
              <p>Üye olduğunuz kütüphanelerdeki kitaplar.</p>
            </div>

            <span class="result-count">
              {{ filteredBooks.length }} kitap
            </span>
          </div>

          <div v-if="filteredBooks.length > 0" class="books-grid">
            <article
              v-for="book in filteredBooks"
              :key="book.id"
              class="book-card"
            >
              <NuxtLink
                :to="`/user/books/${book.id}`"
                class="book-content"
              >
                <div class="book-cover">
                  <div class="book-cover-icon">📖</div>
                  <span class="cover-caption">KİTAP KOLEKSİYONU</span>
                </div>

                <div class="book-info">
                  <span class="category-name">
                    {{ getCategoryName(book.categoryId) }}
                  </span>

                  <h3>{{ book.title }}</h3>

                  <p class="author-name">
                    {{ getAuthorNameById(book.authorId) }}
                  </p>

                  <p class="isbn">
                    ISBN: {{ book.isbn }}
                  </p>

                  <div
                    :class="[
                      'stock-info',
                      getTotalQuantity(book.id) > 0
                        ? 'available'
                        : 'unavailable'
                    ]"
                  >
                    <span class="stock-dot"></span>
                    {{
                      getTotalQuantity(book.id) > 0
                        ? `${getTotalQuantity(book.id)} adet mevcut`
                        : 'Stokta yok'
                    }}
                  </div>
                </div>
              </NuxtLink>

              <div class="libraries-section">
                <div class="libraries-title">Kütüphane Stokları</div>

                <div
                  v-if="getLibraryBooks(book.id).length > 0"
                  class="library-list"
                >
                  <div
                    v-for="libraryBook in getLibraryBooks(book.id)"
                    :key="libraryBook.id"
                    class="library-item"
                  >
                    <div class="library-info">
                      <span class="library-name">
                        <span class="location-icon">⌖</span>
                        {{ getLibraryName(libraryBook.libraryId) }}
                      </span>

                      <span
                        :class="[
                          'library-stock',
                          libraryBook.quantity > 0
                            ? 'available'
                            : 'unavailable'
                        ]"
                      >
                        {{
                          libraryBook.quantity > 0
                            ? `${libraryBook.quantity} adet mevcut`
                            : 'Stokta yok'
                        }}
                      </span>
                    </div>

                    <button
                      v-if="libraryBook.quantity > 0"
                      type="button"
                      class="borrow-button"
                      :disabled="borrowingLibraryBookId === libraryBook.id"
                      @click.stop="borrowBook(book, libraryBook)"
                    >
                      {{
                        borrowingLibraryBookId === libraryBook.id
                          ? 'Ödünç Alınıyor...'
                          : 'Ödünç Al'
                      }}
                    </button>

                    <button
                      v-else
                      type="button"
                      class="borrow-button disabled"
                      disabled
                    >
                      Stokta Yok
                    </button>
                  </div>
                </div>

                <div v-else class="no-library-message">
                  Bu kitap üye olduğunuz kütüphanelerde bulunmuyor.
                </div>
              </div>

              <div
                v-if="borrowMessage[book.id]"
                :class="[
                  'borrow-message',
                  borrowMessage[book.id].type
                ]"
              >
                {{ borrowMessage[book.id].text }}
              </div>
            </article>
          </div>

          <div v-else class="message-card empty-message">
            <div class="empty-icon">🔎</div>
            <h3>Aradığınız kitap bulunamadı.</h3>
            <p>
              Farklı bir arama terimi deneyebilir veya filtreleri
              değiştirebilirsiniz.
            </p>
            <button
              type="button"
              class="secondary-button"
              @click="
                searchQuery = '';
                selectedLibrary = '';
                selectedCategory = '';
                selectedAuthor = '';
                selectedStock = ''
              "
            >
              Filtreleri Temizle
            </button>
          </div>
        </section>
      </template>
    </div>
  </main>
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

interface Library {
  id: string
  name: string
  address?: string
}

interface UserLibrary {
  id: string
  userId: string
  libraryId: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
}

interface BorrowMessage {
  type: 'success' | 'error'
  text: string
}

const { apiFetch } = useApi()

const books = ref<Book[]>([])
const authors = ref<Author[]>([])
const categories = ref<Category[]>([])
const libraries = ref<Library[]>([])
const memberLibraries = ref<Library[]>([])
const userLibraries = ref<UserLibrary[]>([])
const libraryBooks = ref<LibraryBook[]>([])

const loading = ref(true)
const errorMessage = ref('')

const searchQuery = ref('')
const selectedLibrary = ref('')
const selectedCategory = ref('')
const selectedAuthor = ref('')
const selectedStock = ref('')

const borrowingLibraryBookId = ref<string | null>(null)
const borrowMessage = ref<Record<string, BorrowMessage>>({})

const getAuthorName = (author: Author) => {
  if (author.name) {
    return author.name
  }

  const fullName =
    `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim()

  return fullName || 'Bilinmeyen Yazar'
}

const getAuthorNameById = (authorId: string) => {
  const author = authors.value.find(
    item => item.id === authorId
  )

  return author ? getAuthorName(author) : 'Bilinmeyen Yazar'
}

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(
    item => item.id === categoryId
  )

  return category?.name ?? 'Bilinmeyen Kategori'
}

const getLibraryName = (libraryId: string) => {
  const library = memberLibraries.value.find(
    item => item.id === libraryId
  )

  return library?.name ?? 'Bilinmeyen Kütüphane'
}

const getMemberLibraryIds = () => {
  return userLibraries.value.map(item => item.libraryId)
}

const getLibraryBooks = (bookId: string) => {
  const memberLibraryIds = getMemberLibraryIds()

  return libraryBooks.value.filter(item => {
    const isMemberLibrary =
      memberLibraryIds.includes(item.libraryId)

    const isSelectedLibrary =
      !selectedLibrary.value ||
      item.libraryId === selectedLibrary.value

    return (
      item.bookId === bookId &&
      isMemberLibrary &&
      isSelectedLibrary
    )
  })
}

const getTotalQuantity = (bookId: string) => {
  return getLibraryBooks(bookId).reduce(
    (total, libraryBook) => total + libraryBook.quantity,
    0
  )
}

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    const memberLibraryBookExists =
      getLibraryBooks(book.id).length > 0

    if (!memberLibraryBookExists) {
      return false
    }

    const author = getAuthorNameById(book.authorId)
    const search = searchQuery.value.toLowerCase().trim()

    const matchesSearch =
      !search ||
      book.title.toLowerCase().includes(search) ||
      book.isbn.toLowerCase().includes(search) ||
      author.toLowerCase().includes(search)

    const matchesCategory =
      !selectedCategory.value ||
      book.categoryId === selectedCategory.value

    const matchesAuthor =
      !selectedAuthor.value ||
      book.authorId === selectedAuthor.value

    const quantity = getTotalQuantity(book.id)

    const matchesStock =
      !selectedStock.value ||
      (
        selectedStock.value === 'available'
          ? quantity > 0
          : quantity === 0
      )

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAuthor &&
      matchesStock
    )
  })
})

const loadBooks = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const userId = localStorage.getItem('userId')

    if (!userId) {
      errorMessage.value =
        'Kitapları görüntülemek için giriş yapmalısınız.'
      return
    }

    const userLibraryData = await apiFetch<UserLibrary[]>(
      `/api/UserLibrary/user/${encodeURIComponent(userId)}`
    )

    userLibraries.value = Array.isArray(userLibraryData)
      ? userLibraryData
      : []

    const memberLibraryIds = userLibraries.value.map(
      item => item.libraryId
    )

    const [
      bookData,
      authorData,
      categoryData,
      libraryData,
      libraryBookData
    ] = await Promise.all([
      apiFetch<Book[]>('/api/Book'),
      apiFetch<Author[]>('/api/Author'),
      apiFetch<Category[]>('/api/Category'),
      apiFetch<Library[]>('/api/Library'),
      apiFetch<LibraryBook[]>('/api/LibraryBook')
    ])

    libraries.value = Array.isArray(libraryData)
      ? libraryData
      : []

    memberLibraries.value = libraries.value.filter(
      library => memberLibraryIds.includes(library.id)
    )

    libraryBooks.value = (
      Array.isArray(libraryBookData) ? libraryBookData : []
    ).filter(
      libraryBook =>
        memberLibraryIds.includes(libraryBook.libraryId)
    )

    books.value = Array.isArray(bookData) ? bookData : []
    authors.value = Array.isArray(authorData) ? authorData : []
    categories.value = Array.isArray(categoryData)
      ? categoryData
      : []
  } catch (error) {
    console.error('Kitaplar yüklenirken hata oluştu:', error)

    errorMessage.value =
      'Kitaplar yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}

const borrowBook = async (
  book: Book,
  libraryBook: LibraryBook
) => {
  try {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      borrowMessage.value[book.id] = {
        type: 'error',
        text: 'Ödünç almak için giriş yapmalısınız.'
      }
      return
    }

    if (libraryBook.quantity <= 0) {
      borrowMessage.value[book.id] = {
        type: 'error',
        text: 'Bu kütüphanede kitap stokta bulunmuyor.'
      }
      return
    }

    borrowingLibraryBookId.value = libraryBook.id
    delete borrowMessage.value[book.id]

    await apiFetch('/api/Loan', {
      method: 'POST',
      body: {
        userId,
        libraryBookId: libraryBook.id
      }
    })

    borrowMessage.value[book.id] = {
      type: 'success',
      text: `${getLibraryName(libraryBook.libraryId)} kütüphanesinden kitap başarıyla ödünç alındı.`
    }

    await loadBooks()
  } catch (error: any) {
    console.error('Kitap ödünç alınırken hata oluştu:', error)

    const apiMessage =
      error?.data?.message ??
      error?.data?.title ??
      error?.message

    borrowMessage.value[book.id] = {
      type: 'error',
      text:
        typeof apiMessage === 'string' && apiMessage.trim()
          ? apiMessage
          : 'Kitap ödünç alınırken hata oluştu.'
    }
  } finally {
    borrowingLibraryBookId.value = null
  }
}

onMounted(() => {
  loadBooks()
})
</script>

<style scoped>
.books-page {
  min-height: 100vh;
  background: #f6f0e7;
  padding: 32px 20px 60px;
  color: #46372d;
}

.books-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

/* Geri dönüş bağlantısı */
.back-link {
  display: inline-block;
  margin-bottom: 24px;
  color: #785b46;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #4c3527;
}

/* Ceza Ödemesi sayfasıyla uyumlu sayfa başlığı */
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
  padding: 30px 34px;
  overflow: hidden;
  background: linear-gradient(
    120deg,
    #fffdf9 0%,
    #fcf5ed 48%,
    #f9eee2 100%
  );
  border: 1px solid #e7d5c3;
  border-radius: 18px;
  box-shadow: 0 7px 22px rgba(90, 59, 36, 0.055);
}

.page-header::after {
  position: absolute;
  top: -65px;
  right: -35px;
  width: 200px;
  height: 200px;
  border: 1px solid rgba(169, 115, 72, 0.12);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.page-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #a06a3e;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.page-header h1 {
  margin: 0 0 10px;
  color: #493122;
  font-size: 32px;
  font-weight: 750;
  letter-spacing: -0.7px;
}

.page-header p,
.section-heading p {
  margin: 0;
  color: #816b58;
  line-height: 1.7;
}

.page-header p {
  max-width: 680px;
  font-size: 15px;
}

.header-icon {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  border-radius: 15px;
  font-size: 35px;
}

/* Bölüm başlıkları */
.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 8px;
  color: #493629;
  font-size: 23px;
}

.filters-section {
  margin-bottom: 36px;
}

.filters {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 20px;
  border: 1px solid #e5d7c8;
  border-radius: 18px;
  background: #fffdf9;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
}

.search-box {
  position: relative;
  min-width: 0;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 13px;
  transform: translateY(-52%);
  color: #8b6b52;
  font-size: 23px;
  pointer-events: none;
}

.search-box input,
.filters select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 12px 13px;
  border: 1px solid #e5d7c8;
  border-radius: 10px;
  background: #fffdf9;
  color: #594333;
  font: inherit;
  font-size: 13px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-box input {
  padding-left: 40px;
}

.search-box input::placeholder {
  color: #a08d7d;
}

.search-box input:focus,
.filters select:focus {
  border-color: #a4876d;
  box-shadow: 0 0 0 3px rgb(120 88 63 / 10%);
}

/* Sonuç sayısı */
.results-heading {
  margin-bottom: 20px;
}

.result-count {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid #e5d7c8;
  border-radius: 10px;
  background: #fffdf9;
  color: #78583f;
  font-size: 13px;
  font-weight: 700;
}

/* Kitap kartları */
.books-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  align-items: stretch;
}

.book-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e6d8c9;
  border-radius: 18px;
  background: #fffdf9;
  box-shadow: 0 6px 20px rgb(75 52 35 / 5%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgb(75 52 35 / 9%);
}

.book-content {
  display: block;
  padding: 20px 20px 18px;
  color: inherit;
  text-decoration: none;
}

.book-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 160px;
  margin-bottom: 20px;
  border: 1px solid #e5d7c8;
  border-radius: 12px;
  background: linear-gradient(135deg, #f2e6d8, #e8d6c3);
}

.book-cover-icon {
  font-size: 48px;
  transition: transform 0.2s ease;
}

.book-card:hover .book-cover-icon {
  transform: scale(1.06);
}

.cover-caption {
  color: #92755c;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.category-name {
  display: inline-block;
  margin-bottom: 8px;
  color: #8b6b52;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.book-info h3 {
  margin: 0 0 8px;
  color: #493629;
  font-size: 21px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.author-name {
  margin: 0 0 10px;
  color: #766557;
  font-size: 14px;
}

.isbn {
  margin: 0 0 15px;
  color: #998575;
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* Stok durumu */
.stock-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
}

.stock-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.stock-info.available,
.library-stock.available {
  color: #617c58;
}

.stock-info.unavailable,
.library-stock.unavailable {
  color: #a85e4d;
}

/* Kütüphane alanı */
.libraries-section {
  margin-top: auto;
  padding: 18px 20px 20px;
  border-top: 1px solid #eee3d8;
}

.libraries-title {
  margin-bottom: 13px;
  color: #594333;
  font-size: 13px;
  font-weight: 800;
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.library-item {
  padding: 12px;
  border: 1px solid #e9ddd0;
  border-radius: 10px;
  background: #faf5ee;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.library-item:hover {
  border-color: #d8c3ae;
  background: #f6eee4;
}

.library-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 11px;
}

.library-name {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #594333;
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.location-icon {
  flex-shrink: 0;
  color: #8b6b52;
  font-size: 17px;
  line-height: 1;
}

.library-stock {
  font-size: 12px;
  font-weight: 700;
}

.no-library-message {
  padding: 12px;
  border: 1px solid #e5d7c8;
  border-radius: 10px;
  background: #f8f1e8;
  color: #826b58;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

/* Butonlar */
.borrow-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: #78583f;
  color: #fffaf4;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.borrow-button {
  width: 100%;
  box-sizing: border-box;
}

.borrow-button:hover:not(:disabled),
.secondary-button:hover {
  background: #5d422f;
}

.borrow-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.borrow-button.disabled {
  background: #b9aa9b;
  color: #fffdf9;
}

.secondary-button {
  margin-top: 12px;
}

/* Ödünç alma mesajları */
.borrow-message {
  margin: 0 20px 20px;
  padding: 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.borrow-message.success {
  border: 1px solid #d2dfc9;
  background: #f1f6ed;
  color: #4e6945;
}

.borrow-message.error {
  border: 1px solid #e5c5bb;
  background: #fff5f1;
  color: #994d3b;
}

/* Genel durum kartları */
.message-card {
  margin: 18px 0;
  padding: 28px;
  border: 1px solid #e5d7c8;
  border-radius: 18px;
  background: #fffdf9;
  color: #705844;
  line-height: 1.7;
  text-align: center;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
}

.message-card h3 {
  margin: 10px 0;
  color: #493629;
  font-size: 20px;
}

.message-card p {
  margin: 8px 0;
}

.empty-icon,
.loading-icon {
  font-size: 35px;
}

.error-message {
  border-color: #dfb9ad;
  background: #fff7f4;
  color: #994d3b;
  overflow-wrap: anywhere;
}

.error-message p {
  margin-top: 0;
}

.empty-message {
  padding: 38px 24px;
}

/* Tablet */
@media (max-width: 1100px) {
  .filters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .search-box {
    grid-column: span 2;
  }

  .books-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Mobil */
@media (max-width: 650px) {
  .books-page {
    padding: 24px 14px 40px;
  }

  .page-header {
    gap: 14px;
    padding: 24px 20px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .page-header p {
    font-size: 14px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    font-size: 27px;
  }

  .section-heading h2 {
    font-size: 21px;
  }

  .filters {
    grid-template-columns: 1fr;
    padding: 15px;
  }

  .search-box {
    grid-column: auto;
  }

  .books-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .book-content {
    padding: 17px;
  }

  .book-cover {
    min-height: 140px;
  }

  .libraries-section {
    padding: 16px 17px 18px;
  }

  .results-heading {
    align-items: flex-start;
  }

  .result-count {
    font-size: 12px;
  }

  .message-card {
    padding: 22px 17px;
  }
}
</style>
