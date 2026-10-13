vue
<template>
  <main class="books-page">
    <div class="books-container">
      <!-- Geri Dön -->
      <NuxtLink to="/user" class="back-link">
        ← Kullanıcı Paneline Dön
      </NuxtLink>

      <!-- Sayfa Başlığı -->
      <div class="page-header">
        <div>
          <h1>Kitaplar</h1>
          <p>
            Üye olduğunuz kütüphanelerde bulunan kitapları
            inceleyebilir ve ödünç alabilirsiniz.
          </p>
        </div>
      </div>

      <!-- Kütüphane üyeliği yoksa -->
      <div
        v-if="!loading && !errorMessage && memberLibraries.length === 0"
        class="state-message"
      >
        Üye olduğunuz bir kütüphane bulunmuyor.
      </div>

      <!-- Arama ve Filtreler -->
      <div v-else class="filters">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kitap adı, ISBN veya yazar ara..."
          />
        </div>

        <select v-model="selectedLibrary">
          <option value="">Tüm Kütüphaneler</option>
          <option
            v-for="library in memberLibraries"
            :key="library.id"
            :value="library.id"
          >
            {{ library.name }}
          </option>
        </select>

        <select v-model="selectedCategory">
          <option value="">Tüm Kategoriler</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>

        <select v-model="selectedAuthor">
          <option value="">Tüm Yazarlar</option>
          <option
            v-for="author in authors"
            :key="author.id"
            :value="author.id"
          >
            {{ getAuthorName(author) }}
          </option>
        </select>

        <select v-model="selectedStock">
          <option value="">Tüm Kitaplar</option>
          <option value="available">Stokta Olanlar</option>
          <option value="unavailable">Stokta Olmayanlar</option>
        </select>
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-message">
        Kitaplar yükleniyor...
      </div>

      <!-- Hata -->
      <div v-else-if="errorMessage" class="state-message error">
        {{ errorMessage }}
      </div>

      <!-- Kitaplar -->
      <div
        v-else-if="filteredBooks.length > 0"
        class="books-grid"
      >
        <div
          v-for="book in filteredBooks"
          :key="book.id"
          class="book-card"
        >
          <!-- Kitap bilgileri -->
          <NuxtLink
            :to="`/user/books/${book.id}`"
            class="book-content"
          >
            <div class="book-cover">
              📖
            </div>

            <div class="book-info">
              <span class="category-name">
                {{ getCategoryName(book.categoryId) }}
              </span>

              <h2>{{ book.title }}</h2>

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
                <span>
                  {{
                    getTotalQuantity(book.id) > 0
                      ? `${getTotalQuantity(book.id)} adet mevcut`
                      : 'Stokta yok'
                  }}
                </span>
              </div>
            </div>
          </NuxtLink>

          <!-- Kütüphaneler -->
          <div class="libraries-section">
            <div class="libraries-title">
              Üye Olduğunuz Kütüphanelerdeki Durum
            </div>

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
                    📍 {{ getLibraryName(libraryBook.libraryId) }}
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

          <!-- Ödünç alma sonucu -->
          <div
            v-if="borrowMessage[book.id]"
            :class="[
              'borrow-message',
              borrowMessage[book.id].type
            ]"
          >
            {{ borrowMessage[book.id].text }}
          </div>
        </div>
      </div>

      <!-- Kitap bulunamadı -->
      <div
        v-else-if="!loading && !errorMessage"
        class="empty-message"
      >
        Arama kriterlerinize uygun kitap bulunamadı.
      </div>
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

/*
 * Yazar adını oluşturur.
 */
const getAuthorName = (author: Author) => {
  if (author.name) {
    return author.name
  }

  const fullName =
    `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim()

  return fullName || 'Bilinmeyen Yazar'
}

/*
 * ID üzerinden yazar bulur.
 */
const getAuthorNameById = (authorId: string) => {
  const author = authors.value.find(
    item => item.id === authorId
  )

  if (!author) {
    return 'Bilinmeyen Yazar'
  }

  return getAuthorName(author)
}

/*
 * ID üzerinden kategori bulur.
 */
const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(
    item => item.id === categoryId
  )

  return category?.name ?? 'Bilinmeyen Kategori'
}

/*
 * ID üzerinden kütüphane bulur.
 */
const getLibraryName = (libraryId: string) => {
  const library = memberLibraries.value.find(
    item => item.id === libraryId
  )

  return library?.name ?? 'Bilinmeyen Kütüphane'
}

/*
 * Kullanıcının üye olduğu kütüphanelerin ID'lerini getirir.
 */
const getMemberLibraryIds = () => {
  return userLibraries.value.map(
    item => item.libraryId
  )
}

/*
 * Kitabın kullanıcının erişebildiği kütüphanelerdeki
 * kayıtlarını getirir. Seçili kütüphane filtresini de uygular.
 */
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

/*
 * Kitabın erişilebilir kütüphanelerdeki toplam stokunu hesaplar.
 */
const getTotalQuantity = (bookId: string) => {
  return getLibraryBooks(bookId).reduce(
    (total, libraryBook) => total + libraryBook.quantity,
    0
  )
}

/*
 * Filtrelenmiş kitaplar.
 */
const filteredBooks = computed(() => {
  return books.value.filter(book => {
    // Kitap üye olunan kütüphanelerde bulunmalı.
    const memberLibraryBookExists =
      getLibraryBooks(book.id).length > 0

    if (!memberLibraryBookExists) {
      return false
    }

    // Arama
    const author = getAuthorNameById(book.authorId)
    const search = searchQuery.value.toLowerCase().trim()

    const matchesSearch =
      !search ||
      book.title.toLowerCase().includes(search) ||
      book.isbn.toLowerCase().includes(search) ||
      author.toLowerCase().includes(search)

    // Kategori
    const matchesCategory =
      !selectedCategory.value ||
      book.categoryId === selectedCategory.value

    // Yazar
    const matchesAuthor =
      !selectedAuthor.value ||
      book.authorId === selectedAuthor.value

    // Stok
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

/*
 * Kitapları ve ilişkili verileri yükler.
 */
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

    // Kullanıcının kütüphane üyelikleri
    const userLibraryData = await apiFetch<UserLibrary[]>(
      `/api/UserLibrary/user/${userId}`
    )

    userLibraries.value = userLibraryData

    const memberLibraryIds = userLibraryData.map(
      item => item.libraryId
    )

    // İlişkili verileri yükle
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

    // Yalnızca üye olunan kütüphaneleri göster
    libraries.value = libraryData

    memberLibraries.value = libraryData.filter(
      library => memberLibraryIds.includes(library.id)
    )

    // LibraryBook kayıtlarını üyeliklerle sınırla
    libraryBooks.value = libraryBookData.filter(
      libraryBook =>
        memberLibraryIds.includes(libraryBook.libraryId)
    )

    books.value = bookData
    authors.value = authorData
    categories.value = categoryData
  } catch (error) {
    console.error('Kitaplar yüklenirken hata oluştu:', error)

    errorMessage.value =
      'Kitaplar yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}

/*
 * Kitap ödünç alma işlemi.
 *
 * Frontend tarih hesaplamaz.
 * Backend BorrowDate ve DueDate değerlerini belirler.
 */
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

    // Önceki sonucu temizle
    delete borrowMessage.value[book.id]

    // Yalnızca gerekli iki alanı gönder.
    // BorrowDate ve DueDate backend tarafından hesaplanır.
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

    // İşlem sonrası stokları güncelle
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
  position: relative;
  background:
    linear-gradient(
      rgba(245, 237, 228, 0.54),
      rgba(245, 237, 228, 0.54)
    ),
    url("https://images.openai.com/static-rsc-4/xmPoryFkHin-rERvYKXFtYqEp51cj5lktGQMde8rwf827nL6z_I1_s116c5p_YutXUa6rLGoNMGvD6qI60fgm80NaihvgqBPXCrZjNv9HKfA_yCiMIMVlH_Tpk0icUCuzYBZ7cGa7_InYzyQw6XEtfHCNhH-3h_U95yftfn5oGClbRZNklaO4kOnKP2GfZSg?purpose=fullsize");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: #3f2b20;
  padding: 40px 24px 70px;
}

.books-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* GERİ DÖN */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  padding: 7px 12px;
  color: #4b3021;
  background: rgba(255, 250, 244, 0.92);
  border-radius: 7px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(92, 57, 34, 0.08);
  transition: 0.2s ease;
}

.back-link:hover {
  background: #fffaf4;
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(92, 57, 34, 0.12);
}

/* SAYFA BAŞLIĞI */
.page-header {
  margin-bottom: 26px;
  background: rgba(255, 250, 244, 0.97);
  border: 1px solid #dfc8b2;
  border-radius: 20px;
  padding: 32px 38px;
  box-shadow: 0 12px 35px rgba(92, 57, 34, 0.12);
}

.page-header h1 {
  display: inline-block;
  margin: 0 0 12px;
  padding: 5px 12px;
  color: #4b3021;
  background: rgba(255, 250, 244, 0.94);
  border-radius: 7px;
  font-size: 32px;
  font-weight: 650;
  letter-spacing: -0.5px;
  box-shadow: 0 2px 8px rgba(92, 57, 34, 0.07);
}

.page-header p {
  max-width: 700px;
  margin: 0;
  color: #765b48;
  font-size: 15px;
  line-height: 1.7;
}

/* FİLTRELER */
.filters {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(4, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
  padding: 18px;
  background: rgba(255, 250, 244, 0.96);
  border: 1px solid #dfc8b2;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(92, 57, 34, 0.10);
}

.search-box input,
.filters select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #d8c0a8;
  border-radius: 9px;
  background: #fffaf4;
  color: #4b3021;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.search-box input::placeholder {
  color: #9a806c;
}

.search-box input:focus,
.filters select:focus {
  border-color: #c9783f;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(201, 120, 63, 0.12);
}

/* KİTAPLAR */
.books-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.book-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 250, 244, 0.98);
  border: 1px solid #dfc8b2;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(92, 57, 34, 0.10);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px rgba(92, 57, 34, 0.16);
}

/* KİTAP İÇERİĞİ */
.book-content {
  display: block;
  flex: 1;
  padding: 20px;
  color: inherit;
  text-decoration: none;
}

.book-cover {
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  background: linear-gradient(135deg, #ead7c3, #f4e7d8);
  border: 1px solid #dfc8b2;
  border-radius: 12px;
  font-size: 55px;
  box-shadow: inset 0 0 25px rgba(92, 57, 34, 0.05);
}

/* KİTAP BİLGİLERİ */
.category-name {
  color: #a85d2d;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.book-info h2 {
  margin: 8px 0 6px;
  color: #4b3021;
  font-size: 21px;
  line-height: 1.3;
}

.author-name {
  margin: 0 0 10px;
  color: #765b48;
  font-size: 14px;
}

.isbn {
  margin: 0 0 14px;
  color: #9a806c;
  font-size: 12px;
}

/* STOK */
.stock-info {
  font-size: 13px;
  font-weight: 600;
}

.stock-info.available,
.library-stock.available {
  color: #4f7a45;
}

.stock-info.unavailable,
.library-stock.unavailable {
  color: #a84d3d;
}

/* KÜTÜPHANELER */
.libraries-section {
  padding: 0 20px 20px;
}

.libraries-title {
  margin-bottom: 10px;
  color: #5c4030;
  font-size: 13px;
  font-weight: 700;
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.library-item {
  padding: 12px;
  background: #fbf3ea;
  border: 1px solid #e3ccb7;
  border-radius: 10px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.library-item:hover {
  background: #f8ecdf;
  border-color: #d5b495;
}

.library-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 9px;
}

.library-name {
  color: #5c4030;
  font-size: 13px;
  font-weight: 600;
}

.library-stock {
  font-size: 12px;
  font-weight: 600;
}

.no-library-message {
  padding: 10px;
  background: #f8eee4;
  border: 1px solid #e5d1be;
  border-radius: 8px;
  color: #806b5b;
  font-size: 12px;
  text-align: center;
}

/* ÖDÜNÇ BUTONU */
.borrow-button {
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #b96b35;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.borrow-button:hover:not(:disabled) {
  background: #a95e2c;
  transform: translateY(-1px);
}

.borrow-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.borrow-button.disabled {
  background: #a99b90;
}

/* ÖDÜNÇ MESAJI */
.borrow-message {
  margin: 0 20px 20px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.borrow-message.success {
  background: #f0f6ec;
  border: 1px solid #cbdcc4;
  color: #46663e;
}

.borrow-message.error {
  background: #fbefec;
  border: 1px solid #e5c4bc;
  color: #93493c;
}

/* DURUM MESAJLARI */
.state-message,
.empty-message {
  padding: 35px;
  background: rgba(255, 250, 244, 0.97);
  border: 1px solid #dfc8b2;
  border-radius: 16px;
  color: #806b5b;
  text-align: center;
  box-shadow: 0 8px 25px rgba(92, 57, 34, 0.09);
}

.state-message.error {
  background: #fbefec;
  border-color: #e5c4bc;
  color: #93493c;
}

/* TABLET */
@media (max-width: 1100px) {
  .filters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* TABLET / KÜÇÜK EKRAN */
@media (max-width: 950px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .books-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* MOBİL */
@media (max-width: 600px) {
  .books-page {
    padding: 30px 18px 50px;
  }

  .page-header {
    padding: 26px 24px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .filters {
    grid-template-columns: 1fr;
    padding: 15px;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }

  .book-cover {
    height: 150px;
  }
}
</style>