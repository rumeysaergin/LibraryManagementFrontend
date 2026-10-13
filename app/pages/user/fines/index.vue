<template>
  <main class="fines-page">

    <section class="fines-container">

      <!-- Geri Dön -->
      <NuxtLink
        to="/user"
        class="back-link"
      >
        ← Kullanıcı Paneline Dön
      </NuxtLink>


      <!-- Başlık -->
      <div class="page-header">

        <p class="subtitle">
          CEZALARIM
        </p>

        <h1>
          Cezalarım
        </h1>

        <p class="description">
          Gecikmiş kitap iadelerinizden oluşan cezaları ve ödeme
          geçmişinizi buradan takip edebilirsiniz.
        </p>

      </div>


      <!-- Yükleniyor -->
      <div
        v-if="loading"
        class="loading-message"
      >
        Cezalar yükleniyor...
      </div>


      <!-- Hata -->
      <div
        v-else-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
      </div>


      <template v-else>

        <!-- Özet -->
        <section class="summary-grid">

          <div class="summary-card">

            <div class="summary-icon danger">
              ⚠️
            </div>

            <div>
              <p class="summary-label">
                Aktif Cezalar
              </p>

              <p class="summary-value">
                {{ activeFines.length }}
              </p>
            </div>

          </div>


          <div class="summary-card">

            <div class="summary-icon money">
              💰
            </div>

            <div>
              <p class="summary-label">
                Toplam Borç
              </p>

              <p class="summary-value">
                {{ totalDebt }}₺
              </p>
            </div>

          </div>


          <div class="summary-card">

            <div class="summary-icon success">
              ✓
            </div>

            <div>
              <p class="summary-label">
                Ödenen Cezalar
              </p>

              <p class="summary-value">
                {{ paidFines.length }}
              </p>
            </div>

          </div>

        </section>


        <!-- Aktif cezalar -->
        <section class="content-section">

          <div class="section-header">

            <div>
              <p class="section-label">
                ÖDENMEMİŞ CEZALAR
              </p>

              <h2>
                Aktif Cezalarım
              </h2>
            </div>

          </div>


          <div
            v-if="activeFines.length === 0"
            class="empty-message"
          >
            Şu anda ödenmemiş herhangi bir cezanız bulunmuyor.
          </div>


          <div
            v-else
            class="fine-list"
          >

            <article
              v-for="fine in activeFines"
              :key="fine.id"
              class="fine-card"
            >

              <div class="fine-main">

                <div class="book-icon">
                  📖
                </div>

                <div class="fine-info">

                  <h3>
                    {{ fine.bookTitle }}
                  </h3>

                  <p class="author">
                    {{ fine.authorName }}
                  </p>

                  <p class="library">
                    🏛️ {{ fine.libraryName }}
                  </p>

                </div>

              </div>


              <div class="fine-details">

                <div class="detail">

                  <span>
                    Gecikme
                  </span>

                  <strong class="danger-text">
                    {{ fine.lateDays }} gün
                  </strong>

                </div>

                <div class="detail">

                  <span>
                    Son Teslim
                  </span>

                  <strong>
                    {{ formatDate(fine.dueDate) }}
                  </strong>

                </div>

                <div class="detail">

                  <span>
                    Ceza Tarihi
                  </span>

                  <strong>
                    {{ formatDate(fine.fineDate) }}
                  </strong>

                </div>

              </div>


              <div class="fine-payment">

                <div>

                  <span class="amount-label">
                    Ceza Tutarı
                  </span>

                  <strong class="amount">
                    {{ fine.amount }}₺
                  </strong>

                </div>

                <span class="status unpaid">
                  Ödenmedi
                </span>

                <NuxtLink
                  :to="`/user/fines/payment?fineId=${fine.id}`"
                  class="pay-button"
                >
                  💳 {{ fine.amount }}₺ Ödeme Yap
                </NuxtLink>

              </div>

            </article>

          </div>

        </section>


        <!-- Ödeme geçmişi -->
        <section class="content-section">

          <div class="section-header">

            <div>
              <p class="section-label">
                GEÇMİŞ
              </p>

              <h2>
                Ödenen Cezalar
              </h2>
            </div>

          </div>


          <div
            v-if="paidFines.length === 0"
            class="empty-message"
          >
            Henüz ödenmiş bir cezanız bulunmuyor.
          </div>


          <div
            v-else
            class="history-card"
          >

            <div
              v-for="fine in paidFines"
              :key="fine.id"
              class="history-row"
            >

              <div class="history-book">

                <span class="history-icon">
                  📖
                </span>

                <div>

                  <strong>
                    {{ fine.bookTitle }}
                  </strong>

                  <span>
                    Ceza: {{ formatDate(fine.fineDate) }}
                  </span>

                </div>

              </div>


              <div class="history-amount">
                {{ fine.amount }}₺
              </div>


              <div class="history-status">

                <span class="status paid">
                  ✓ Ödendi
                </span>

                <span>
                  {{ fine.paymentDate
                    ? formatDate(fine.paymentDate)
                    : '-' }}
                </span>

              </div>

            </div>

          </div>

        </section>


        <!-- Bilgilendirme -->
        <div class="info-box">

          <div class="info-icon">
            ℹ️
          </div>

          <div>

            <h3>
              Ceza sistemi nasıl çalışır?
            </h3>

            <p>
              Geciken her gün için 10₺ ceza uygulanmaktadır.
              Kitap iade edildiğinde oluşan ceza sistem tarafından
              otomatik olarak hesaplanır.
            </p>

          </div>

        </div>

      </template>

    </section>

  </main>
</template>


<script setup lang="ts">

interface Loan {
  id: string
  userId: string
  libraryBookId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: string
}

interface Fine {
  id: string
  loanId: string
  amount: number
  fineDate: string
  isPaid: boolean
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
}

interface Book {
  id: string
  title: string
  authorId: string
}

interface Author {
  id: string
  name?: string
  firstName?: string
  lastName?: string
}

interface Library {
  id: string
  name: string
}

interface FinePayment {
  id: string
  fineId: string
  amount: number
  paymentDate: string
  paymentMethod: string
}

interface DisplayFine {
  id: string
  loanId: string
  amount: number
  fineDate: string
  isPaid: boolean
  dueDate: string
  lateDays: number
  bookTitle: string
  authorName: string
  libraryName: string
  paymentDate: string | null
}


const { apiFetch } = useApi()

const loading = ref(true)

const errorMessage = ref('')

const fines = ref<DisplayFine[]>([])


const activeFines = computed(() => {

  return fines.value.filter(
    fine => !fine.isPaid
  )

})


const paidFines = computed(() => {

  return fines.value.filter(
    fine => fine.isPaid
  )

})


const totalDebt = computed(() => {

  return activeFines.value.reduce(
    (total, fine) => total + fine.amount,
    0
  )

})


const formatDate = (date: string) => {

  if (!date) {
    return '-'
  }

  return new Date(date).toLocaleDateString(
    'tr-TR'
  )

}


const calculateLateDays = (
  dueDate: string,
  fineDate: string
) => {

  const due = new Date(dueDate)

  const fine = new Date(fineDate)

  const difference =
    fine.getTime() - due.getTime()

  const days =
    Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    )

  return Math.max(days, 0)

}


const getAuthorName = (
  author: Author
) => {

  if (author.name) {
    return author.name
  }

  const fullName =
    `${author.firstName || ''} ${author.lastName || ''}`
      .trim()

  return fullName || 'Bilinmeyen Yazar'

}


const loadFines = async () => {

  try {

    loading.value = true

    errorMessage.value = ''

    const userId =
      localStorage.getItem('userId')


    if (!userId) {

      errorMessage.value =
        'Kullanıcı bilgisi bulunamadı.'

      return

    }


    /*
     * Kullanıcının ödünç kayıtlarını getir.
     */
    const loans =
      await apiFetch<Loan[]>(
        `/api/Loan/user/${userId}`
      )


    const displayFines: DisplayFine[] = []


    /*
     * Her loan için cezaları getir.
     */
    for (const loan of loans) {

      const loanFines =
        await apiFetch<Fine[]>(
          `/api/Fine/loan/${loan.id}`
        )


      for (const fine of loanFines) {

        let bookTitle =
          'Bilinmeyen Kitap'

        let authorName =
          'Bilinmeyen Yazar'

        let libraryName =
          'Bilinmeyen Kütüphane'


        try {

          /*
           * LibraryBook
           */
          const libraryBook =
            await apiFetch<LibraryBook>(
              `/api/LibraryBook/${loan.libraryBookId}`
            )


          /*
           * Book
           */
          const book =
            await apiFetch<Book>(
              `/api/Book/${libraryBook.bookId}`
            )

          bookTitle =
            book.title


          /*
           * Author
           */
          const author =
            await apiFetch<Author>(
              `/api/Author/${book.authorId}`
            )

          authorName =
            getAuthorName(author)


          /*
           * Library
           */
          const library =
            await apiFetch<Library>(
              `/api/Library/${libraryBook.libraryId}`
            )

          libraryName =
            library.name

        } catch (error) {

          console.error(
            `Fine ${fine.id} için kitap bilgileri alınamadı:`,
            error
          )

        }


        let paymentDate:
          string | null = null


        /*
         * Ödenmiş ceza ise ödeme bilgisini getir.
         */
        if (fine.isPaid) {

          try {

            const payments =
              await apiFetch<FinePayment[]>(
                `/api/FinePayment/fine/${fine.id}`
              )


            if (payments.length > 0) {

              paymentDate =
                payments[0].paymentDate

            }

          } catch (error) {

            console.error(
              `Fine ${fine.id} için ödeme bilgisi alınamadı:`,
              error
            )

          }

        }


        displayFines.push({

          id: fine.id,

          loanId: fine.loanId,

          amount: fine.amount,

          fineDate: fine.fineDate,

          isPaid: fine.isPaid,

          dueDate: loan.dueDate,

          lateDays:
            calculateLateDays(
              loan.dueDate,
              fine.fineDate
            ),

          bookTitle,

          authorName,

          libraryName,

          paymentDate

        })

      }

    }


    fines.value =
      displayFines


  } catch (error) {

    console.error(
      'Cezeler yüklenirken hata oluştu:',
      error
    )

    errorMessage.value =
      'Cezeler yüklenirken bir hata oluştu.'

  } finally {

    loading.value = false

  }

}


onMounted(() => {

  loadFines()

})

</script>


<style scoped>

.fines-page {
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


.fines-container {
  max-width: 1100px;
  margin: 0 auto;
}


/* =========================
   GERİ DÖN
========================= */

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

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.08);

  transition: 0.2s ease;
}

.back-link:hover {
  background: #fffaf4;

  transform: translateY(-1px);

  box-shadow:
    0 5px 12px rgba(92, 57, 34, 0.12);
}


/* =========================
   BAŞLIK
========================= */

.page-header {
  margin-bottom: 30px;

  background: rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;
  border-radius: 20px;

  padding: 34px 40px;

  box-shadow:
    0 12px 35px rgba(92, 57, 34, 0.12);
}


/* CEZALARIM etiketini kaldırıyoruz */

.subtitle {
  display: none;
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

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.07);
}


.description {
  max-width: 700px;

  margin: 0;

  color: #765b48;

  font-size: 15px;
  line-height: 1.7;
}


/* =========================
   ÖZET KARTLARI
========================= */

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 18px;

  margin-bottom: 42px;
}


.summary-card {
  display: flex;

  align-items: center;

  gap: 15px;

  padding: 20px;

  background: rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;
  border-radius: 16px;

  box-shadow:
    0 8px 24px rgba(92, 57, 34, 0.10);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 12px 28px rgba(92, 57, 34, 0.14);
}


.summary-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;

  font-size: 21px;
}


.summary-icon.danger {
  background: #f8e9e3;
}


.summary-icon.money {
  background: #f5e6d5;
}


.summary-icon.success {
  background: #e8f0e3;

  color: #4f7a45;
}


.summary-label {
  margin: 0 0 4px;

  color: #806b5b;

  font-size: 13px;
}


.summary-value {
  margin: 0;

  color: #4b3021;

  font-size: 24px;
  font-weight: 700;
}


/* =========================
   BÖLÜMLER
========================= */

.content-section {
  margin-bottom: 42px;
}


.section-header {
  margin-bottom: 18px;
}


.section-label {
  display: none;
}


.section-header h2 {
  display: inline-block;

  margin: 0;

  padding: 5px 12px;

  color: #4b3021;

  background: rgba(255, 250, 244, 0.94);

  border-radius: 7px;

  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.4px;

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.07);
}


/* =========================
   AKTİF CEZA KARTLARI
========================= */

.fine-list {
  display: flex;
  flex-direction: column;

  gap: 16px;
}


.fine-card {
  display: grid;

  grid-template-columns:
    1.4fr 1fr 1fr;

  align-items: center;

  gap: 22px;

  padding: 22px;

  background: rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;
  border-radius: 16px;

  box-shadow:
    0 8px 24px rgba(92, 57, 34, 0.10);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.fine-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 12px 28px rgba(92, 57, 34, 0.14);
}


/* =========================
   KİTAP BİLGİSİ
========================= */

.fine-main {
  display: flex;

  align-items: center;

  gap: 15px;
}


.book-icon {
  width: 52px;
  height: 62px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background:
    linear-gradient(
      135deg,
      #ead7c3,
      #f4e7d8
    );

  border: 1px solid #dfc8b2;
  border-radius: 9px;

  font-size: 24px;
}


.fine-info h3 {
  margin: 0 0 4px;

  color: #4b3021;

  font-size: 17px;
}


.author {
  margin: 0 0 7px;

  color: #765b48;

  font-size: 13px;
}


.library {
  margin: 0;

  color: #806b5b;

  font-size: 12px;
}


/* =========================
   CEZA DETAYLARI
========================= */

.fine-details {
  display: flex;
  flex-direction: column;

  gap: 8px;
}


.detail {
  display: flex;

  justify-content: space-between;

  gap: 10px;
}


.detail span {
  color: #a08b79;

  font-size: 12px;
}


.detail strong {
  color: #5c4030;

  font-size: 12px;
}


.danger-text {
  color: #a84d3d !important;
}


/* =========================
   ÖDEME
========================= */

.fine-payment {
  display: flex;
  flex-direction: column;

  align-items: flex-end;

  gap: 8px;
}


.amount-label {
  display: block;

  color: #a08b79;

  font-size: 11px;

  text-align: right;
}


.amount {
  display: block;

  color: #a84d3d;

  font-size: 22px;

  text-align: right;
}


.status {
  display: inline-block;

  padding: 5px 10px;

  border-radius: 20px;

  font-size: 11px;
  font-weight: 600;
}


.status.unpaid {
  background: #f8e9e3;

  color: #a84d3d;
}


.status.paid {
  background: #e8f0e3;

  color: #4f7a45;
}


/* =========================
   ÖDEME BUTONU
========================= */

.pay-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 10px 15px;

  background: #b96b35;

  color: white;

  border: none;
  border-radius: 8px;

  font-size: 12px;
  font-weight: 600;

  text-decoration: none;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}


.pay-button:hover {
  background: #a95e2c;

  transform: translateY(-1px);
}


/* =========================
   ÖDEME GEÇMİŞİ
========================= */

.history-card {
  overflow: hidden;

  background: rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;
  border-radius: 16px;

  box-shadow:
    0 8px 24px rgba(92, 57, 34, 0.10);
}


.history-row {
  display: grid;

  grid-template-columns:
    1fr auto 180px;

  align-items: center;

  gap: 20px;

  padding: 18px 22px;

  border-bottom: 1px solid #ead9c8;
}


.history-row:last-child {
  border-bottom: none;
}


.history-book {
  display: flex;

  align-items: center;

  gap: 12px;
}


.history-icon {
  width: 38px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background: #f1e5d9;

  border: 1px solid #dfc8b2;
  border-radius: 7px;
}


.history-book strong {
  display: block;

  margin-bottom: 3px;

  color: #5c4030;

  font-size: 14px;
}


.history-book span:last-child {
  color: #9a806c;

  font-size: 11px;
}


.history-amount {
  color: #5c4030;

  font-size: 14px;
  font-weight: 600;
}


.history-status {
  display: flex;
  flex-direction: column;

  align-items: flex-end;

  gap: 3px;
}


.history-status > span:last-child {
  color: #9a806c;

  font-size: 11px;
}


/* =========================
   BİLGİ KUTUSU
========================= */

.info-box {
  display: flex;

  align-items: flex-start;

  gap: 13px;

  padding: 18px;

  background: #f5eadf;

  border: 1px solid #dfc8b2;
  border-radius: 12px;

  box-shadow:
    0 5px 15px rgba(92, 57, 34, 0.07);
}


.info-icon {
  font-size: 20px;
}


.info-box h3 {
  margin: 0 0 5px;

  color: #6b422b;

  font-size: 14px;
}


.info-box p {
  margin: 0;

  color: #806b5b;

  font-size: 13px;
  line-height: 1.6;
}


/* =========================
   LOADING / ERROR / EMPTY
========================= */

.loading-message,
.error-message,
.empty-message {
  padding: 30px;

  margin-bottom: 30px;

  background: rgba(255, 250, 244, 0.97);

  border: 1px solid #dfc8b2;
  border-radius: 14px;

  color: #806b5b;

  text-align: center;

  box-shadow:
    0 8px 22px rgba(92, 57, 34, 0.08);
}


.error-message {
  color: #93493c;

  background: #fbefec;

  border-color: #e5c4bc;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {

  .fine-card {
    grid-template-columns:
      1fr 1fr;
  }

  .fine-payment {
    grid-column: 1 / -1;

    flex-direction: row;

    align-items: center;

    justify-content: space-between;

    padding-top: 15px;

    border-top: 1px solid #ead9c8;
  }

  .amount-label,
  .amount {
    text-align: left;
  }

}


@media (max-width: 700px) {

  .summary-grid {
    grid-template-columns: 1fr;
  }


  .page-header {
    padding: 28px 24px;
  }


  .fine-card {
    grid-template-columns: 1fr;
  }


  .fine-payment {
    grid-column: auto;

    flex-direction: column;

    align-items: flex-start;

    justify-content: initial;
  }


  .history-row {
    grid-template-columns: 1fr;

    gap: 10px;
  }


  .history-status {
    align-items: flex-start;
  }

}


@media (max-width: 500px) {

  .fines-page {
    padding: 30px 16px 50px;
  }


  .page-header h1 {
    font-size: 28px;
  }


  .summary-card {
    padding: 17px;
  }


  .fine-card {
    padding: 18px;
  }

}

</style>