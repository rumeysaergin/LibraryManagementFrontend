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

/* =========================================================
   ANA SAYFA
========================================================= */

.book-detail-page {
  min-height: calc(100vh - 75px);

  padding: 40px 20px 70px;

  background:
    linear-gradient(
      rgba(245, 237, 228, 0.95),
      rgba(245, 237, 228, 0.98)
    );

  color: #4b3021;
}


.book-detail-container {
  max-width: 1100px;

  margin: 0 auto;
}


/* =========================================================
   GERİ DÖN
========================================================= */

.back-link {
  display: inline-flex;

  align-items: center;

  margin-bottom: 24px;

  color: #765b48;

  text-decoration: none;

  font-size: 15px;

  font-weight: 600;

  transition: 0.2s ease;
}


.back-link:hover {
  color: #b96b35;

  transform: translateX(-3px);
}


/* =========================================================
   KİTAP KARTI
========================================================= */

.book-detail-card {
  display: grid;

  grid-template-columns: 260px 1fr;

  gap: 45px;

  padding: 40px;

  background: #fffaf4;

  border: 1px solid #dfc8b2;

  border-radius: 20px;

  box-shadow:
    0 8px 25px rgba(91, 58, 38, 0.10);
}


/* =========================================================
   KİTAP KAPAĞI
========================================================= */

.book-cover-wrapper {
  display: flex;

  justify-content: center;

  align-items: flex-start;
}


.book-cover {
  width: 250px;

  height: 340px;

  position: relative;

  overflow: hidden;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 15px;

  background:
    linear-gradient(
      145deg,
      #ead7c3,
      #d5b99d
    );

  border: 1px solid #c9a989;

  border-radius: 16px;

  box-shadow:
    0 10px 25px rgba(91, 58, 38, 0.18);
}


.book-cover::before {
  content: "";

  position: absolute;

  left: 0;

  top: 0;

  width: 13px;

  height: 100%;

  background: rgba(75, 48, 33, 0.15);
}


.book-cover::after {
  content: "";

  position: absolute;

  inset: 14px;

  border: 1px solid rgba(75, 48, 33, 0.14);

  border-radius: 10px;

  pointer-events: none;
}


.book-icon {
  position: relative;

  z-index: 1;

  font-size: 85px;

  filter:
    drop-shadow(
      0 7px 7px rgba(75, 48, 33, 0.16)
    );
}


.book-cover-text {
  position: relative;

  z-index: 1;

  color: #765039;

  font-size: 14px;

  font-weight: 800;

  letter-spacing: 2px;
}


/* =========================================================
   KİTAP BİLGİLERİ
========================================================= */

.book-info {
  padding-top: 5px;
}


.category {
  display: inline-flex;

  align-items: center;

  width: fit-content;

  padding: 6px 13px;

  background: #ead7c3;

  border-radius: 20px;

  color: #765039;

  font-size: 12px;

  font-weight: 700;

  letter-spacing: 0.8px;

  text-transform: uppercase;
}


.book-info h1 {
  margin: 13px 0 8px;

  color: #4b3021;

  font-size: 40px;

  line-height: 1.2;
}


.author {
  margin: 0 0 30px;

  color: #765b48;

  font-size: 18px;

  font-weight: 500;
}


/* =========================================================
   BİLGİ LİSTESİ
========================================================= */

.info-list {
  border-top: 1px solid #dfc8b2;
}


.info-item {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding: 15px 5px;

  border-bottom: 1px solid #dfc8b2;
}


.info-label-wrapper {
  display: flex;

  align-items: center;

  gap: 10px;
}


.info-icon {
  width: 32px;

  height: 32px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #f4e7d8;

  border-radius: 8px;

  font-size: 15px;
}


.info-label {
  color: #765b48;

  font-size: 14px;

  font-weight: 600;
}


.info-value {
  color: #4b3021;

  font-size: 14px;

  font-weight: 600;

  text-align: right;
}


.stock-value {
  font-size: 14px;

  font-weight: 700;
}


.available {
  color: #4f7a45;
}


.unavailable {
  color: #a84d3d;
}


/* =========================================================
   KÜTÜPHANELER
========================================================= */

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
  width: 43px;

  height: 43px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #ead7c3;

  border-radius: 11px;

  font-size: 21px;
}


.section-heading h2 {
  margin: 0 0 3px;

  color: #4b3021;

  font-size: 19px;
}


.section-heading p {
  margin: 0;

  color: #8a6b55;

  font-size: 13px;
}


/* =========================================================
   KÜTÜPHANE LİSTESİ
========================================================= */

.library-list {
  display: flex;

  flex-direction: column;

  gap: 12px;
}


.library-item {
  display: flex;

  align-items: center;

  gap: 14px;

  padding: 15px;

  background: #f8eee4;

  border: 1px solid #dfc8b2;

  border-radius: 13px;

  transition: 0.2s ease;
}


.library-item:hover {
  border-color: #c9a989;

  transform: translateY(-2px);

  box-shadow:
    0 5px 15px rgba(91, 58, 38, 0.08);
}


.library-icon {
  width: 43px;

  height: 43px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #ead7c3;

  border-radius: 10px;

  font-size: 20px;
}


.library-details {
  flex: 1;

  min-width: 0;
}


.library-name {
  display: block;

  margin-bottom: 5px;

  color: #4b3021;

  font-size: 14px;

  font-weight: 700;
}


.library-address {
  display: block;

  color: #765b48;

  font-size: 12px;
}


.library-stock {
  flex-shrink: 0;

  padding: 6px 10px;

  border-radius: 8px;

  font-size: 12px;

  font-weight: 700;
}


.library-stock.available {
  background: #e7f0e4;

  color: #4f7a45;
}


.library-stock.unavailable {
  background: #f5e2df;

  color: #a84d3d;
}


/* =========================================================
   KÜTÜPHANE YOK
========================================================= */

.no-library-message {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 10px;

  padding: 18px;

  background: #f8eee4;

  border: 1px solid #dfc8b2;

  border-radius: 12px;

  color: #765b48;

  font-size: 13px;

  text-align: center;
}


.empty-icon {
  font-size: 20px;
}


/* =========================================================
   ALT BUTON
========================================================= */

.actions {
  margin-top: 30px;

  padding-top: 22px;

  border-top: 1px solid #dfc8b2;
}


.back-button {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding: 11px 20px;

  background: #b96b35;

  color: white;

  border-radius: 9px;

  text-decoration: none;

  font-size: 14px;

  font-weight: 700;

  transition: 0.2s ease;

  box-shadow:
    0 5px 12px rgba(185, 107, 53, 0.18);
}


.back-button:hover {
  background: #a95e2c;

  transform: translateY(-2px);

  box-shadow:
    0 7px 16px rgba(169, 94, 44, 0.22);
}


/* =========================================================
   DURUM MESAJLARI
========================================================= */

.state-message {
  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  min-height: 300px;

  padding: 35px;

  background: #fffaf4;

  border: 1px solid #dfc8b2;

  border-radius: 18px;

  box-shadow:
    0 6px 20px rgba(91, 58, 38, 0.08);

  text-align: center;
}


.state-icon {
  margin-bottom: 12px;

  font-size: 42px;
}


.state-message h2 {
  margin: 0 0 8px;

  color: #4b3021;

  font-size: 20px;
}


.state-message p {
  margin: 0;

  color: #765b48;

  font-size: 14px;
}


.state-message.error {
  border-color: #dfc1ba;

  background: #fff8f6;
}


.state-message.error h2 {
  color: #7f3c31;
}


.error-back-button {
  margin-top: 20px;

  padding: 10px 18px;

  background: #b96b35;

  color: white;

  border-radius: 9px;

  text-decoration: none;

  font-size: 14px;

  font-weight: 700;
}


.error-back-button:hover {
  background: #a95e2c;
}


/* =========================================================
   MOBİL
========================================================= */

@media (max-width: 800px) {

  .book-detail-page {
    padding: 30px 15px 50px;
  }


  .book-detail-card {
    grid-template-columns: 1fr;

    gap: 30px;

    padding: 25px;
  }


  .book-cover-wrapper {
    align-items: center;
  }


  .book-cover {
    width: 190px;

    height: 260px;
  }


  .book-icon {
    font-size: 65px;
  }


  .book-info {
    padding-top: 0;
  }


  .book-info h1 {
    font-size: 31px;
  }


  .author {
    font-size: 16px;
  }

}


@media (max-width: 600px) {

  .book-detail-card {
    padding: 20px;
  }


  .book-cover {
    width: 170px;

    height: 230px;
  }


  .book-info h1 {
    font-size: 27px;
  }


  .info-item {
    align-items: flex-start;

    flex-direction: column;

    gap: 7px;
  }


  .info-value {
    text-align: left;
  }


  .library-item {
    align-items: flex-start;

    flex-wrap: wrap;
  }


  .library-details {
    min-width: calc(100% - 60px);
  }


  .library-stock {
    margin-left: 57px;
  }


  .no-library-message {
    flex-direction: column;
  }

}

</style>