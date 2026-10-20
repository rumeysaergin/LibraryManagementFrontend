
<template>
  <main class="fines-page">
    <section class="fines-container">
      <!-- Geri Dön -->
      <NuxtLink to="/user" class="back-link">
        ← Kullanıcı Paneline Dön
      </NuxtLink>

      <!-- Başlık -->
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">HESABIM / CEZALARIM</span>
          <h1>Cezalarım</h1>
          <p class="description">
            Gecikmiş kitap iadelerinizden oluşan cezaları ve ödeme
            geçmişinizi buradan takip edebilirsiniz.
          </p>
        </div>

        <div class="header-icon" aria-hidden="true">
          📚
        </div>
      </header>

      <!-- Yükleniyor -->
      <div v-if="loading" class="loading-message">
        <span class="state-icon">📚</span>
        <h3>Cezalar yükleniyor...</h3>
        <p>Lütfen bilgileriniz hazırlanırken bekleyin.</p>
      </div>

      <!-- Hata -->
      <div v-else-if="errorMessage" class="error-message">
        <span class="state-icon">⚠️</span>
        <h3>Bir sorun oluştu</h3>
        <p>{{ errorMessage }}</p>
      </div>

      <template v-else>
        <!-- Özet -->
        <section class="summary-grid">
          <article class="summary-card">
            <div class="summary-icon danger">⚠️</div>
            <div class="summary-content">
              <p class="summary-label">Aktif Cezalar</p>
              <p class="summary-value">
                {{ activeFines.length }}
              </p>
              <span class="summary-caption">
                Ödeme bekleyen kayıtlar
              </span>
            </div>
          </article>

          <article class="summary-card">
            <div class="summary-icon money">₺</div>
            <div class="summary-content">
              <p class="summary-label">Toplam Borç</p>
              <p class="summary-value">
                {{ totalDebt.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }} ₺
              </p>
              <span class="summary-caption">
                Ödenmemiş ceza tutarı
              </span>
            </div>
          </article>

          <article class="summary-card">
            <div class="summary-icon success">✓</div>
            <div class="summary-content">
              <p class="summary-label">Ödenen Cezalar</p>
              <p class="summary-value">
                {{ paidFines.length }}
              </p>
              <span class="summary-caption">
                Tamamlanan ödemeler
              </span>
            </div>
          </article>
        </section>

        <!-- Aktif cezalar -->
        <section class="content-section">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">ÖDEME BEKLİYOR</span>
              <h2>Aktif Cezalarım</h2>
              <p>Henüz ödenmemiş ceza kayıtlarınız.</p>
            </div>

            <span class="section-count">
              {{ activeFines.length }} kayıt
            </span>
          </div>

          <div v-if="activeFines.length === 0" class="empty-message">
            <div class="empty-icon">✓</div>
            <h3>Her şey yolunda!</h3>
            <p>
              Şu anda ödenmemiş herhangi bir cezanız bulunmuyor.
            </p>
          </div>

          <div v-else class="fine-list">
            <article
              v-for="fine in activeFines"
              :key="fine.id"
              class="fine-card"
            >
              <div class="fine-main">
                <div class="book-icon">📖</div>

                <div class="fine-info">
                  <span class="fine-type">GECİKME CEZASI</span>
                  <h3>{{ fine.bookTitle }}</h3>
                  <p class="author">{{ fine.authorName }}</p>
                  <p class="library">
                    <span>⌖</span>
                    {{ fine.libraryName }}
                  </p>
                </div>
              </div>

              <div class="fine-details">
                <div class="detail">
                  <span>Gecikme süresi</span>
                  <strong class="danger-text">
                    {{ fine.lateDays }} gün
                  </strong>
                </div>

                <div class="detail">
                  <span>Son teslim tarihi</span>
                  <strong>{{ formatDate(fine.dueDate) }}</strong>
                </div>

                <div class="detail">
                  <span>Ceza tarihi</span>
                  <strong>{{ formatDate(fine.fineDate) }}</strong>
                </div>
              </div>

              <div class="fine-payment">
                <div class="payment-amount">
                  <span class="amount-label">Ceza tutarı</span>
                  <strong class="amount">
                    {{ fine.amount.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) }} ₺
                  </strong>
                  <span class="status unpaid">Ödenmedi</span>
                </div>

                <NuxtLink
                  :to="`/user/fines/payment?fineId=${fine.id}`"
                  class="pay-button"
                >
                  <span>💳</span>
                  Ödeme Yap
                  <span class="button-arrow">→</span>
                </NuxtLink>
              </div>
            </article>
          </div>
        </section>

        <!-- Ödeme geçmişi -->
        <section class="content-section history-section">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">TAMAMLANAN İŞLEMLER</span>
              <h2>Ödenen Cezalar</h2>
              <p>Geçmiş ödeme kayıtlarınız.</p>
            </div>

            <span class="section-count">
              {{ paidFines.length }} kayıt
            </span>
          </div>

          <div v-if="paidFines.length === 0" class="empty-message">
            <div class="empty-icon">📋</div>
            <h3>Henüz ödeme kaydı yok</h3>
            <p>Ödenmiş bir cezanız bulunmuyor.</p>
          </div>

          <div v-else class="history-card">
            <div class="history-heading">
              <span>Kitap bilgisi</span>
              <span>Tutar</span>
              <span>Ödeme durumu</span>
            </div>

            <div
              v-for="fine in paidFines"
              :key="fine.id"
              class="history-row"
            >
              <div class="history-book">
                <span class="history-icon">📖</span>

                <div class="history-book-info">
                  <strong>{{ fine.bookTitle }}</strong>
                  <span>
                    Ceza tarihi: {{ formatDate(fine.fineDate) }}
                  </span>
                </div>
              </div>

              <div class="history-amount">
                {{ fine.amount.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) }} ₺
              </div>

              <div class="history-status">
                <span class="status paid">✓ Ödendi</span>
                <span class="payment-date">
                  {{ fine.paymentDate
                    ? formatDate(fine.paymentDate)
                    : '-' }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Bilgilendirme -->
        <aside class="info-box">
          <div class="info-icon">ℹ️</div>
          <div class="info-content">
            <h3>Ceza sistemi nasıl çalışır?</h3>
            <p>
              Geciken her gün için 10₺ ceza uygulanmaktadır.
              Kitap iade edildiğinde oluşan ceza sistem tarafından
              otomatik olarak hesaplanır.
            </p>
          </div>
        </aside>
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
  return fines.value.filter(fine => !fine.isPaid)
})

const paidFines = computed(() => {
  return fines.value.filter(fine => fine.isPaid)
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

  return new Date(date).toLocaleDateString('tr-TR')
}

const calculateLateDays = (
  dueDate: string,
  fineDate: string
) => {
  const due = new Date(dueDate)
  const fine = new Date(fineDate)

  const difference = fine.getTime() - due.getTime()

  const days = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  )

  return Math.max(days, 0)
}

const getAuthorName = (author: Author) => {
  if (author.name) {
    return author.name
  }

  const fullName =
    `${author.firstName || ''} ${author.lastName || ''}`.trim()

  return fullName || 'Bilinmeyen Yazar'
}

const loadFines = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const userId = localStorage.getItem('userId')

    if (!userId) {
      errorMessage.value = 'Kullanıcı bilgisi bulunamadı.'
      return
    }

    /*
     * Kullanıcının ödünç kayıtlarını getir.
     */
    const loans = await apiFetch<Loan[]>(
      `/api/Loan/user/${userId}`
    )

    const displayFines: DisplayFine[] = []

    /*
     * Her ödünç kaydı için cezaları getir.
     */
    for (const loan of loans) {
      const loanFines = await apiFetch<Fine[]>(
        `/api/Fine/loan/${loan.id}`
      )

      for (const fine of loanFines) {
        let bookTitle = 'Bilinmeyen Kitap'
        let authorName = 'Bilinmeyen Yazar'
        let libraryName = 'Bilinmeyen Kütüphane'

        try {
          const libraryBook = await apiFetch<LibraryBook>(
            `/api/LibraryBook/${loan.libraryBookId}`
          )

          const book = await apiFetch<Book>(
            `/api/Book/${libraryBook.bookId}`
          )

          bookTitle = book.title

          const author = await apiFetch<Author>(
            `/api/Author/${book.authorId}`
          )

          authorName = getAuthorName(author)

          const library = await apiFetch<Library>(
            `/api/Library/${libraryBook.libraryId}`
          )

          libraryName = library.name
        } catch (error) {
          console.error(
            `Fine ${fine.id} için kitap bilgileri alınamadı:`,
            error
          )
        }

        let paymentDate: string | null = null

        /*
         * Ödenmiş ceza ise ödeme bilgisini getir.
         */
        if (fine.isPaid) {
          try {
            const payments = await apiFetch<FinePayment[]>(
              `/api/FinePayment/fine/${fine.id}`
            )

            if (payments.length > 0) {
              paymentDate = payments[0].paymentDate
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
          lateDays: calculateLateDays(
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

    fines.value = displayFines
  } catch (error) {
    console.error('Cezeler yüklenirken hata oluştu:', error)

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
  padding: 32px 20px 60px;
  background: #f6f0e7;
  color: #46372d;
}

.fines-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #785b46;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-link:hover {
  color: #a85d2d;
  background: transparent;
  transform: translateX(-3px);
}

/* Başlık — Ceza Ödemesi sayfasıyla uyumlu gradient */
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
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

.page-eyebrow,
.section-eyebrow {
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

.description {
  max-width: 680px;
  margin: 0;
  color: #816b58;
  font-size: 15px;
  line-height: 1.7;
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

/* Özet kartları */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 42px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 22px;
  border: 1px solid #e5d7c8;
  border-radius: 16px;
  background: #fffdf9;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 23px rgb(75 52 35 / 9%);
}

.summary-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 49px;
  height: 49px;
  border-radius: 13px;
  font-size: 21px;
  font-weight: 800;
}

.summary-icon.danger {
  background: #f8e9e3;
  color: #a84d3d;
}

.summary-icon.money {
  background: #f5e6d5;
  color: #8b603b;
}

.summary-icon.success {
  background: #e8f0e3;
  color: #4f7a45;
}

.summary-content {
  min-width: 0;
}

.summary-label {
  margin: 0 0 5px;
  color: #877567;
  font-size: 13px;
}

.summary-value {
  margin: 0;
  color: #493629;
  font-size: 27px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.summary-caption {
  display: block;
  margin-top: 5px;
  color: #a08b79;
  font-size: 11px;
  line-height: 1.5;
}

/* İçerik bölümleri */
.content-section {
  margin-bottom: 42px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-header h2 {
  margin: 0 0 7px;
  color: #493629;
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -0.4px;
}

.section-header p {
  margin: 0;
  color: #877567;
  font-size: 14px;
  line-height: 1.6;
}

.section-count {
  flex-shrink: 0;
  padding: 7px 12px;
  border: 1px solid #e5d7c8;
  border-radius: 20px;
  background: #fffdf9;
  color: #785b46;
  font-size: 12px;
  font-weight: 700;
}

/* Aktif ceza kartları */
.fine-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fine-card {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(190px, 0.9fr) minmax(170px, 0.7fr);
  align-items: center;
  gap: 24px;
  padding: 24px;
  border: 1px solid #e5d7c8;
  border-radius: 17px;
  background: #fffdf9;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fine-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 23px rgb(75 52 35 / 9%);
}

.fine-main {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.book-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 68px;
  border: 1px solid #e5d7c8;
  border-radius: 11px;
  background: linear-gradient(135deg, #ead7c3, #f4e7d8);
  font-size: 27px;
}

.fine-info {
  min-width: 0;
}

.fine-type {
  display: block;
  margin-bottom: 6px;
  color: #a16e49;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.fine-info h3 {
  margin: 0 0 6px;
  color: #493629;
  font-size: 17px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.author {
  margin: 0 0 8px;
  color: #877567;
  font-size: 13px;
}

.library {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: #8c7766;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

/* Ceza detayları */
.fine-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.detail {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.detail span {
  color: #968170;
  font-size: 12px;
  line-height: 1.5;
}

.detail strong {
  color: #594333;
  font-size: 12px;
  text-align: right;
  line-height: 1.5;
}

.detail .danger-text {
  color: #a84d3d;
}

/* Ceza tutarı ve ödeme */
.fine-payment {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  padding-left: 22px;
  border-left: 1px solid #eee3d8;
}

.payment-amount {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.amount-label {
  flex-basis: 100%;
  color: #968170;
  font-size: 12px;
}

.amount {
  color: #9e493b;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.5px;
  overflow-wrap: anywhere;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.status.unpaid {
  border: 1px solid #f0d4cc;
  background: #fbefec;
  color: #a84d3d;
}

.status.paid {
  border: 1px solid #d4e2cc;
  background: #edf4e9;
  color: #4f7a45;
}

.pay-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  background: #78583f;
  color: #fffaf4;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.pay-button:hover {
  transform: translateY(-2px);
  background: #5d422f;
}

.button-arrow {
  margin-left: auto;
}

/* Ödeme geçmişi */
.history-card {
  overflow: hidden;
  border: 1px solid #e5d7c8;
  border-radius: 16px;
  background: #fffdf9;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
}

.history-heading,
.history-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px 160px;
  align-items: center;
  gap: 20px;
  padding: 16px 22px;
}

.history-heading {
  background: #f8f0e7;
  border-bottom: 1px solid #e5d7c8;
  color: #8b7562;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.history-row {
  min-height: 68px;
  border-bottom: 1px solid #eee3d8;
  transition: background 0.2s ease;
}

.history-row:hover {
  background: #fffbf6;
}

.history-row:last-child {
  border-bottom: none;
}

.history-book {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.history-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 46px;
  border: 1px solid #e5d7c8;
  border-radius: 9px;
  background: #f4e8da;
  font-size: 19px;
}

.history-book-info {
  min-width: 0;
}

.history-book-info strong {
  display: block;
  margin-bottom: 5px;
  color: #594333;
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.history-book-info span {
  display: block;
  color: #9a806c;
  font-size: 11px;
}

.history-amount {
  color: #594333;
  font-size: 15px;
  font-weight: 800;
}

.history-status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.payment-date {
  color: #9a806c;
  font-size: 11px;
}

/* Bilgilendirme kutusu */
.info-box {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 22px;
  border: 1px solid #e5d7c8;
  border-radius: 15px;
  background: #f3e8dc;
}

.info-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #e8d5c1;
  font-size: 19px;
}

.info-content h3 {
  margin: 1px 0 7px;
  color: #604530;
  font-size: 15px;
}

.info-content p {
  margin: 0;
  color: #806b5b;
  font-size: 13px;
  line-height: 1.8;
}

/* Boş, yükleniyor ve hata durumları */
.loading-message,
.error-message,
.empty-message {
  padding: 30px 24px;
  border: 1px solid #e5d7c8;
  border-radius: 16px;
  background: #fffdf9;
  color: #806b5b;
  text-align: center;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
}

.loading-message,
.error-message {
  margin-bottom: 28px;
}

.state-icon {
  display: block;
  margin-bottom: 10px;
  font-size: 32px;
}

.loading-message h3,
.error-message h3,
.empty-message h3 {
  margin: 0 0 8px;
  color: #493629;
  font-size: 17px;
}

.loading-message p,
.error-message p,
.empty-message p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
}

.error-message {
  border-color: #dfb9ad;
  background: #fff7f4;
  color: #994d3b;
}

.error-message h3 {
  color: #994d3b;
}

.empty-message {
  padding: 38px 24px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 13px;
  border-radius: 50%;
  background: #f1e7db;
  color: #785b46;
  font-size: 24px;
}

/* Tablet */
@media (max-width: 1000px) {
  .fine-card {
    grid-template-columns: minmax(0, 1fr) minmax(190px, 0.8fr);
    gap: 20px;
  }

  .fine-payment {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 18px 0 0;
    border-left: none;
    border-top: 1px solid #eee3d8;
  }

  .payment-amount {
    flex-basis: auto;
    align-items: center;
  }

  .amount-label {
    flex-basis: 100%;
  }

  .pay-button {
    width: auto;
    min-width: 175px;
  }
}

/* Küçük tablet */
@media (max-width: 750px) {
  .fines-page {
    padding: 26px 16px 45px;
  }

  .page-header {
    padding: 25px;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 34px;
  }

  .summary-card {
    padding: 18px;
  }

  .summary-value {
    font-size: 24px;
  }

  .fine-card {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .fine-payment {
    grid-column: auto;
  }

  .history-heading {
    display: none;
  }

  .history-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    padding: 18px;
  }

  .history-book {
    grid-column: 1 / -1;
  }

  .history-status {
    align-items: flex-end;
  }

  .history-amount {
    align-self: center;
  }
}

/* Mobil */
@media (max-width: 500px) {
  .fines-page {
    padding: 22px 13px 36px;
  }

  .back-link {
    margin-bottom: 18px;
    font-size: 13px;
  }

  .page-header {
    gap: 12px;
    padding: 21px 18px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .page-eyebrow {
    font-size: 10px;
  }

  .description {
    font-size: 13px;
  }

  .header-icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    font-size: 22px;
  }

  .section-header {
    align-items: flex-start;
  }

  .section-header h2 {
    font-size: 21px;
  }

  .section-header p {
    font-size: 12px;
  }

  .section-count {
    padding: 6px 8px;
    font-size: 10px;
  }

  .fine-card {
    padding: 17px;
  }

  .fine-main {
    align-items: flex-start;
    gap: 12px;
  }

  .book-icon {
    width: 47px;
    height: 56px;
    font-size: 23px;
  }

  .fine-info h3 {
    font-size: 15px;
  }

  .fine-details {
    padding: 14px 0;
    border-top: 1px solid #eee3d8;
    border-bottom: 1px solid #eee3d8;
  }

  .fine-payment {
    flex-direction: column;
    align-items: stretch;
    gap: 13px;
  }

  .amount {
    font-size: 25px;
  }

  .pay-button {
    width: 100%;
  }

  .history-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .history-book {
    grid-column: auto;
  }

  .history-amount {
    padding-left: 55px;
  }

  .history-status {
    align-items: flex-start;
    padding-left: 55px;
  }

  .info-box {
    padding: 17px;
  }
}
</style>
