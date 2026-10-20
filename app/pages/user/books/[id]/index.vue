<template>
  <main class="book-detail-page">

    <section class="book-detail-container">

      <!-- Geri Dön -->
      <NuxtLink
        to="/user/books"
        class="back-link"
      >
        ← Kitaplara Dön
      </NuxtLink>


      <!-- Yükleniyor -->
      <div
        v-if="loading"
        class="state-message"
      >
        <div class="state-icon">
          📚
        </div>

        <h2>Kitap bilgileri yükleniyor...</h2>

        <p>
          Kitap bilgileri hazırlanıyor, lütfen bekleyin.
        </p>
      </div>


      <!-- Hata -->
      <div
        v-else-if="errorMessage"
        class="state-message error"
      >
        <div class="state-icon">
          ⚠️
        </div>

        <h2>Bir sorun oluştu</h2>

        <p>
          {{ errorMessage }}
        </p>

        <NuxtLink
          to="/user/books"
          class="error-back-button"
        >
          Kitaplara Dön
        </NuxtLink>
      </div>


      <!-- Kitap Detayı -->
      <section
        v-else-if="book"
        class="book-detail-card"
      >

        <!-- Kitap Kapağı -->
        <div class="book-cover-wrapper">

          <div class="book-cover">
            <span class="book-icon">
              📖
            </span>

            <span class="book-cover-text">
              KİTAP
            </span>
          </div>

        </div>


        <!-- Kitap Bilgileri -->
        <div class="book-info">

          <!-- Kategori -->
          <span class="category">
            {{ categoryName }}
          </span>


          <!-- Başlık -->
          <h1>
            {{ book.title }}
          </h1>


          <!-- Yazar -->
          <p class="author">
            {{ authorName }}
          </p>


          <!-- Bilgiler -->
          <div class="info-list">

            <div class="info-item">

              <div class="info-label-wrapper">
                <span class="info-icon">
                  🔖
                </span>

                <span class="info-label">
                  ISBN
                </span>
              </div>

              <span class="info-value">
                {{ book.isbn }}
              </span>

            </div>


            <div class="info-item">

              <div class="info-label-wrapper">
                <span class="info-icon">
                  📦
                </span>

                <span class="info-label">
                  Toplam Stok
                </span>
              </div>

              <span
                :class="[
                  'stock-value',
                  totalQuantity > 0
                    ? 'available'
                    : 'unavailable'
                ]"
              >
                {{
                  totalQuantity > 0
                    ? `${totalQuantity} adet mevcut`
                    : 'Stokta yok'
                }}
              </span>

            </div>

          </div>


          <!-- Kütüphaneler -->
          <div class="libraries-section">

            <div class="section-heading">

              <div class="section-heading-icon">
                🏛️
              </div>

              <div>
                <h2>
                  Kütüphanelerdeki Durum
                </h2>

                <p>
                  Kitabın bulunduğu kütüphaneler
                </p>
              </div>

            </div>


            <div
              v-if="bookLibraries.length > 0"
              class="library-list"
            >

              <div
                v-for="libraryBook in bookLibraries"
                :key="libraryBook.id"
                class="library-item"
              >

                <div class="library-icon">
                  🏛️
                </div>


                <div class="library-details">

                  <span class="library-name">
                    {{ getLibraryName(libraryBook.libraryId) }}
                  </span>


                  <span
                    v-if="getLibraryAddress(libraryBook.libraryId)"
                    class="library-address"
                  >
                    📍 {{ getLibraryAddress(libraryBook.libraryId) }}
                  </span>

                </div>


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

            </div>


            <div
              v-else
              class="no-library-message"
            >
              <span class="empty-icon">
                📚
              </span>

              <span>
                Bu kitap herhangi bir kütüphanede bulunmuyor.
              </span>
            </div>

          </div>


          <!-- Alt Buton -->
          <div class="actions">

            <NuxtLink
              to="/user/books"
              class="back-button"
            >
              ← Kitaplara Dön
            </NuxtLink>

          </div>

        </div>

      </section>

    </section>

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
  name?: string
}


interface Library {
  id: string
  name: string
  address?: string
}


interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
}


const route = useRoute()

const { apiFetch } = useApi()


const book = ref<Book | null>(null)

const authorName =
  ref('Bilinmeyen Yazar')

const categoryName =
  ref('Bilinmeyen Kategori')


const libraries =
  ref<Library[]>([])

const libraryBooks =
  ref<LibraryBook[]>([])


const loading =
  ref(true)

const errorMessage =
  ref('')


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
 * Kütüphane adını bulur.
 */
const getLibraryName = (libraryId: string) => {

  const library =
    libraries.value.find(
      item => item.id === libraryId
    )

  return library?.name ?? 'Bilinmeyen Kütüphane'
}


/*
 * Kütüphane adresini bulur.
 */
const getLibraryAddress = (libraryId: string) => {

  const library =
    libraries.value.find(
      item => item.id === libraryId
    )

  return library?.address ?? ''
}


/*
 * Bu kitaba ait bütün LibraryBook kayıtları.
 */
const bookLibraries = computed(() => {

  if (!book.value) {
    return []
  }

  return libraryBooks.value.filter(
    item => item.bookId === book.value?.id
  )

})


/*
 * Kitabın bütün kütüphanelerdeki
 * toplam stok miktarı.
 */
const totalQuantity = computed(() => {

  return bookLibraries.value.reduce(
    (total, libraryBook) =>
      total + libraryBook.quantity,
    0
  )

})


/*
 * Kitap detayını yükler.
 */
const loadBook = async () => {

  try {

    loading.value = true

    errorMessage.value = ''


    const bookId =
      String(route.params.id)


    if (!bookId) {

      throw new Error(
        'Kitap ID bulunamadı.'
      )

    }


    /*
     * Kitap
     */
    const bookData =
      await apiFetch<Book>(
        `/api/Book/${bookId}`
      )

    book.value = bookData


    /*
     * Yazar
     */
    try {

      const author =
        await apiFetch<Author>(
          `/api/Author/${bookData.authorId}`
        )

      authorName.value =
        getAuthorName(author)

    } catch (error) {

      console.error(
        'Yazar bilgisi alınamadı:',
        error
      )

    }


    /*
     * Kategori
     */
    try {

      const category =
        await apiFetch<Category>(
          `/api/Category/${bookData.categoryId}`
        )

      categoryName.value =
        category.name ??
        'Bilinmeyen Kategori'

    } catch (error) {

      console.error(
        'Kategori bilgisi alınamadı:',
        error
      )

    }


    /*
     * Kütüphaneler
     */
    try {

      libraries.value =
        await apiFetch<Library[]>(
          '/api/Library'
        )

    } catch (error) {

      console.error(
        'Kütüphane bilgileri alınamadı:',
        error
      )

    }


    /*
     * LibraryBook kayıtları
     */
    try {

      libraryBooks.value =
        await apiFetch<LibraryBook[]>(
          '/api/LibraryBook'
        )

    } catch (error) {

      console.error(
        'Stok bilgisi alınamadı:',
        error
      )

    }

  } catch (error) {

    console.error(
      'Kitap detayı alınırken hata oluştu:',
      error
    )

    errorMessage.value =
      'Kitap bilgileri alınamadı.'

  } finally {

    loading.value = false

  }

}


onMounted(() => {

  loadBook()

})

</script>


<style scoped>
/* Ana sayfa */
.book-detail-page {
  min-height: 100vh;
  padding: 32px 20px 60px;
  background: #f6f0e7;
  color: #46372d;
}

.book-detail-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

/* Geri dön */
.back-link {
  display: inline-block;
  margin-bottom: 24px;
  color: #785b46;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #4c3527;
}

/* Kitap detay kartı */
.book-detail-card {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  align-items: start;
  gap: 38px;
  padding: 32px;
  border: 1px solid #e6d8c9;
  border-radius: 18px;
  background: #fffdf9;
  box-shadow: 0 6px 20px rgb(75 52 35 / 5%);
}

/* Kitap kapağı */
.book-cover-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.book-cover {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  max-width: 250px;
  height: 330px;
  overflow: hidden;
  border: 1px solid #e5d7c8;
  border-radius: 14px;
  background: linear-gradient(135deg, #f2e6d8, #e5d0ba);
  box-shadow: 0 8px 22px rgb(75 52 35 / 9%);
}

.book-cover::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 12px;
  background: rgb(91 64 44 / 12%);
  content: "";
}

.book-cover::after {
  position: absolute;
  inset: 13px;
  border: 1px solid rgb(91 64 44 / 15%);
  border-radius: 9px;
  content: "";
  pointer-events: none;
}

.book-icon {
  position: relative;
  z-index: 1;
  font-size: 76px;
  filter: drop-shadow(0 5px 5px rgb(75 52 35 / 12%));
}

.book-cover-text {
  position: relative;
  z-index: 1;
  color: #78583f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

/* Kitap bilgileri */
.book-info {
  min-width: 0;
  padding-top: 4px;
}

.category {
  display: inline-block;
  max-width: 100%;
  padding: 6px 11px;
  border: 1px solid #e5d7c8;
  border-radius: 20px;
  background: #f4ece2;
  color: #78583f;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  overflow-wrap: anywhere;
  text-transform: uppercase;
}

.book-info h1 {
  margin: 14px 0 9px;
  color: #493629;
  font-size: 32px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.author {
  margin: 0 0 26px;
  color: #877567;
  font-size: 16px;
  line-height: 1.6;
}

/* ISBN ve toplam stok */
.info-list {
  border-top: 1px solid #eee3d8;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 4px;
  border-bottom: 1px solid #eee3d8;
}

.info-label-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #f4ece2;
  font-size: 15px;
}

.info-label {
  color: #877567;
  font-size: 13px;
  font-weight: 600;
}

.info-value {
  color: #594333;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
  overflow-wrap: anywhere;
}

.stock-value {
  font-size: 13px;
  font-weight: 700;
  text-align: right;
}

.available {
  color: #617c58;
}

.unavailable {
  color: #a85e4d;
}

/* Kütüphaneler bölümü */
.libraries-section {
  margin-top: 30px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 18px;
}

.section-heading-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid #e5d7c8;
  border-radius: 11px;
  background: #f4ece2;
  font-size: 20px;
}

.section-heading h2 {
  margin: 0 0 5px;
  color: #493629;
  font-size: 20px;
}

.section-heading p {
  margin: 0;
  color: #877567;
  font-size: 13px;
  line-height: 1.6;
}

/* Kütüphane listesi */
.library-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.library-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px;
  border: 1px solid #e9ddd0;
  border-radius: 12px;
  background: #faf5ee;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.library-item:hover {
  border-color: #d8c3ae;
  background: #f6eee4;
}

.library-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #efe3d5;
  font-size: 19px;
}

.library-details {
  flex: 1;
  min-width: 0;
}

.library-name {
  display: block;
  margin-bottom: 5px;
  color: #594333;
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.library-address {
  display: block;
  color: #877567;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.library-stock {
  flex-shrink: 0;
  padding: 7px 10px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.library-stock.available {
  background: #edf3e9;
  color: #617c58;
}

.library-stock.unavailable {
  background: #f8eae6;
  color: #a85e4d;
}

/* Kütüphane bulunamadı */
.no-library-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  border: 1px solid #e5d7c8;
  border-radius: 12px;
  background: #faf5ee;
  color: #877567;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}

.empty-icon {
  font-size: 22px;
}

/* Alt buton */
.actions {
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid #eee3d8;
}

.back-button,
.error-back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  background: #78583f;
  color: #fffaf4;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.back-button:hover,
.error-back-button:hover {
  background: #5d422f;
}

/* Yükleniyor ve hata durumları */
.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: 28px;
  border: 1px solid #e5d7c8;
  border-radius: 18px;
  background: #fffdf9;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
  text-align: center;
}

.state-icon {
  margin-bottom: 12px;
  font-size: 38px;
}

.state-message h2 {
  margin: 0 0 10px;
  color: #493629;
  font-size: 21px;
}

.state-message p {
  margin: 0;
  color: #877567;
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.state-message.error {
  border-color: #dfb9ad;
  background: #fff7f4;
}

.state-message.error h2 {
  color: #994d3b;
}

.error-back-button {
  margin-top: 20px;
}

/* Tablet */
@media (max-width: 850px) {
  .book-detail-card {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 26px;
    padding: 25px;
  }

  .book-cover {
    height: 290px;
  }

  .book-info h1 {
    font-size: 28px;
  }

  .library-item {
    flex-wrap: wrap;
  }

  .library-stock {
    margin-left: 55px;
  }
}

/* Mobil */
@media (max-width: 600px) {
  .book-detail-page {
    padding: 24px 14px 40px;
  }

  .book-detail-card {
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
    padding: 20px;
  }

  .book-cover {
    width: 190px;
    height: 250px;
  }

  .book-icon {
    font-size: 65px;
  }

  .book-info h1 {
    font-size: 26px;
  }

  .author {
    margin-bottom: 22px;
    font-size: 15px;
  }

  .info-item {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .info-value,
  .stock-value {
    padding-left: 44px;
    text-align: left;
  }

  .section-heading h2 {
    font-size: 18px;
  }

  .library-item {
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }

  .library-details {
    flex-basis: calc(100% - 55px);
  }

  .library-stock {
    margin-left: 52px;
  }

  .no-library-message {
    flex-direction: column;
  }

  .state-message {
    min-height: 240px;
    padding: 22px 16px;
  }
}
</style>