<template>
  <main class="loans-page">
    <div class="loans-container">
      <!-- GERİ DÖN: BAŞLIK KARTININ DIŞINDA -->
      <NuxtLink to="/user" class="back-button">
        <span class="back-arrow">←</span>
        Kullanıcı Paneline Dön
      </NuxtLink>

      <!-- HEADER CARD -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">📚</div>

          <div class="header-text">
            <span class="eyebrow">KİTAP VE ÖDÜNÇ YÖNETİMİ</span>
            <h1>Ödünç Aldıklarım</h1>
            <p>
              Ödünç aldığınız kitapları, iade tarihlerini ve
              geçmiş işlemlerinizi buradan takip edebilirsiniz.
            </p>
          </div>
        </div>
      </header>

      <!-- İSTATİSTİKLER -->
      <section
        v-if="!loading && !errorMessage"
        class="stats-grid"
      >
        <article class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-content">
            <span class="stat-label">Aktif Ödünçler</span>
            <strong>{{ activeLoans.length }}</strong>
            <span class="stat-description">
              Henüz iade edilmemiş kitaplar
            </span>
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <span class="stat-label">İade Edilenler</span>
            <strong>{{ returnedLoans.length }}</strong>
            <span class="stat-description">
              Tamamlanan ödünç işlemleri
            </span>
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-icon">!</div>
          <div class="stat-content">
            <span class="stat-label">Geciken Kitaplar</span>
            <strong>{{ overdueLoans.length }}</strong>
            <span class="stat-description">
              İade tarihi geçmiş kitaplar
            </span>
          </div>
        </article>
      </section>

      <!-- YÜKLENİYOR -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <h3>Ödünç kitaplar yükleniyor</h3>
        <p>
          Kitap ve ödünç bilgileriniz hazırlanıyor, lütfen bekleyin.
        </p>
      </div>

      <!-- HATA -->
      <div v-else-if="errorMessage" class="state-card error-state">
        <div class="state-icon">!</div>
        <h3>Bir sorun oluştu</h3>
        <p>{{ errorMessage }}</p>
        <button
          type="button"
          class="retry-button"
          @click="loadLoans"
        >
          Tekrar Dene
        </button>
      </div>

      <template v-else>
        <!-- AKTİF ÖDÜNÇLER -->
        <section class="loan-section">
          <div class="section-heading">
            <div>
              <span class="section-eyebrow">KİTAPLARINIZ</span>
              <h2>Aktif Ödünçler</h2>
              <p>
                İade etmeniz gereken kitapları ve kalan sürelerini takip edin.
              </p>
            </div>

            <span class="section-count">
              {{ activeLoans.length }} kitap
            </span>
          </div>

          <div v-if="activeLoans.length > 0" class="loan-list">
            <article
              v-for="loan in activeLoans"
              :key="loan.id"
              class="loan-card"
            >
              <div class="book-icon">📖</div>

              <div class="loan-content">
                <div class="loan-main">
                  <span class="card-overline">ÖDÜNÇ ALINAN KİTAP</span>
                  <h3>{{ loan.bookTitle }}</h3>

                  <p class="author">
                    {{ loan.authorName }}
                  </p>

                  <p class="library-name">
                    <span class="address-icon">⌖</span>
                    {{ loan.libraryName }}
                  </p>
                </div>

                <div class="loan-details">
                  <div class="date-item">
                    <span class="detail-label">ÖDÜNÇ TARİHİ</span>
                    <strong>{{ formatDate(loan.borrowDate) }}</strong>
                  </div>

                  <div class="date-item">
                    <span class="detail-label">SON İADE TARİHİ</span>
                    <strong>{{ formatDate(loan.dueDate) }}</strong>
                  </div>

                  <div
                    class="remaining"
                    :class="{
                      late: loan.daysRemaining < 0,
                      warning:
                        loan.daysRemaining >= 0 &&
                        loan.daysRemaining <= 3
                    }"
                  >
                    <span class="remaining-dot"></span>

                    <span v-if="loan.daysRemaining > 0">
                      {{ loan.daysRemaining }} gün kaldı
                    </span>

                    <span v-else-if="loan.daysRemaining === 0">
                      Bugün iade edilmeli
                    </span>

                    <span v-else>
                      {{ Math.abs(loan.daysRemaining) }} gün gecikti
                    </span>
                  </div>

                  <button
                    type="button"
                    class="return-button"
                    :disabled="returningLoanId === loan.id"
                    @click="returnBook(loan)"
                  >
                    {{
                      returningLoanId === loan.id
                        ? 'İade ediliyor...'
                        : 'Kitabı İade Et'
                    }}
                    <span v-if="returningLoanId !== loan.id">→</span>
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="empty-card">
            <div class="empty-icon">📚</div>
            <h3>Aktif ödünç kitabınız bulunmuyor</h3>
            <p>
              Şu anda üzerinizde iade edilmemiş bir kitap bulunmuyor.
              Yeni kitaplar keşfetmek için kullanıcı panelini ziyaret edebilirsiniz.
            </p>
            <NuxtLink to="/user" class="empty-action">
              Kullanıcı Paneline Dön <span>→</span>
            </NuxtLink>
          </div>
        </section>

        <!-- BÖLÜM AYIRICI -->
        <div class="section-divider">
          <span></span>
          <span class="divider-icon">✦</span>
          <span></span>
        </div>

        <!-- ÖDÜNÇ GEÇMİŞİ -->
        <section class="loan-section">
          <div class="section-heading">
            <div>
              <span class="section-eyebrow">TAMAMLANAN İŞLEMLER</span>
              <h2>Ödünç Geçmişi</h2>
              <p>
                Daha önce ödünç aldığınız ve iade ettiğiniz kitaplar.
              </p>
            </div>

            <span class="section-count">
              {{ returnedLoans.length }} kitap
            </span>
          </div>

          <div
            v-if="returnedLoans.length > 0"
            class="history-wrapper"
          >
            <table class="history-table">
              <thead>
                <tr>
                  <th>Kitap</th>
                  <th>Yazar</th>
                  <th>Kütüphane</th>
                  <th>Ödünç Tarihi</th>
                  <th>İade Tarihi</th>
                  <th>Durum</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="loan in returnedLoans"
                  :key="loan.id"
                >
                  <td>
                    <div class="history-book">
                      <span class="history-book-icon">📕</span>
                      <strong>{{ loan.bookTitle }}</strong>
                    </div>
                  </td>

                  <td>{{ loan.authorName }}</td>
                  <td>{{ loan.libraryName }}</td>
                  <td>{{ formatDate(loan.borrowDate) }}</td>
                  <td>{{ formatDate(loan.returnDate) }}</td>

                  <td>
                    <span class="returned-badge">
                      <span class="status-dot"></span>
                      İade edildi
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-card">
            <div class="empty-icon">🗂️</div>
            <h3>Ödünç geçmişiniz henüz boş</h3>
            <p>
              İade ettiğiniz kitaplar bu bölümde listelenecektir.
            </p>
          </div>
        </section>

        <!-- BİLGİLENDİRME -->
        <aside class="info-card">
          <div class="info-icon">ⓘ</div>

          <div class="info-content">
            <span class="section-eyebrow">BİLMENİZ GEREKENLER</span>
            <h3>Ödünç süresi ve gecikme ücreti</h3>
            <p>
              Kitapların ödünç süresi <strong>15 gündür.</strong>
              İade tarihi geçen kitaplar için gecikilen her gün
              <strong>10 TL</strong> ceza uygulanır.
              Gecikme yaşamamak için iade tarihlerinizi takip etmeyi unutmayın.
            </p>
          </div>
        </aside>
      </template>
    </div>
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

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
}

interface Book {
  id: string
  title: string
  isbn: string
  authorId: string
  categoryId: string
}

interface Author {
  id: string
  name: string
}

interface Library {
  id: string
  name: string
  address: string
}

interface LoanViewModel {
  id: string
  userId: string
  libraryBookId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: string
  bookTitle: string
  authorName: string
  libraryName: string
  daysRemaining: number
}

const { apiFetch } = useApi()

const loading = ref(true)
const errorMessage = ref('')
const loans = ref<LoanViewModel[]>([])
const returningLoanId = ref<string | null>(null)

const activeLoans = computed(() =>
  loans.value.filter(loan => loan.returnDate === null)
)

const returnedLoans = computed(() =>
  loans.value.filter(loan => loan.returnDate !== null)
)

const overdueLoans = computed(() =>
  activeLoans.value.filter(loan => loan.daysRemaining < 0)
)

const formatDate = (date: string | null) => {
  if (!date) {
    return '-'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('tr-TR')
}

const calculateDaysRemaining = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)

  if (Number.isNaN(due.getTime())) {
    return 0
  }

  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const dueUtc = Date.UTC(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  )

  return Math.round(
    (dueUtc - todayUtc) / (1000 * 60 * 60 * 24)
  )
}

const loadLoans = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    if (!import.meta.client) {
      return
    }

    const userId = localStorage.getItem('userId')

    if (!userId) {
      errorMessage.value = 'Kullanıcı bilgisi bulunamadı.'
      return
    }

    const userLoans = await apiFetch<Loan[]>(
      `/api/Loan/user/${encodeURIComponent(userId)}`
    )

    const loanRequests = userLoans.map(async loan => {
      const libraryBook = await apiFetch<LibraryBook>(
        `/api/LibraryBook/${encodeURIComponent(loan.libraryBookId)}`
      )

      const book = await apiFetch<Book>(
        `/api/Book/${encodeURIComponent(libraryBook.bookId)}`
      )

      const author = await apiFetch<Author>(
        `/api/Author/${encodeURIComponent(book.authorId)}`
      )

      const library = await apiFetch<Library>(
        `/api/Library/${encodeURIComponent(libraryBook.libraryId)}`
      )

      return {
        id: loan.id,
        userId: loan.userId,
        libraryBookId: loan.libraryBookId,
        borrowDate: loan.borrowDate,
        dueDate: loan.dueDate,
        returnDate: loan.returnDate,
        status: loan.status,
        bookTitle: book.title,
        authorName: author.name,
        libraryName: library.name,
        daysRemaining: calculateDaysRemaining(loan.dueDate)
      }
    })

    loans.value = await Promise.all(loanRequests)
  } catch (error) {
    console.error('Ödünç kitaplar yüklenirken hata oluştu:', error)
    errorMessage.value =
      'Ödünç kitaplar yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

const returnBook = async (loan: LoanViewModel) => {
  if (returningLoanId.value) {
    return
  }

  const confirmed = window.confirm(
    `"${loan.bookTitle}" kitabını iade etmek istediğinize emin misiniz?`
  )

  if (!confirmed) {
    return
  }

  returningLoanId.value = loan.id

  try {
    await apiFetch(`/api/Loan/${encodeURIComponent(loan.id)}`, {
      method: 'PUT',
      body: {
        dueDate: loan.dueDate,
        returnDate: new Date().toISOString(),
        status: 'Returned'
      }
    })

    await loadLoans()
  } catch (error) {
    console.error('Kitap iade edilirken hata oluştu:', error)
    window.alert('Kitap iade edilirken bir hata oluştu.')
  } finally {
    returningLoanId.value = null
  }
}

onMounted(() => {
  loadLoans()
})
</script>

<style scoped>
/* SAYFA */
.loans-page {
  min-height: 100vh;
  padding: 32px 24px 76px;
  color: #443024;
  background:
    radial-gradient(
      ellipse at top left,
      rgba(226, 192, 158, 0.2),
      transparent 45%
    ),
    linear-gradient(
      145deg,
      #f5eee5 0%,
      #eee1d2 48%,
      #f8f2eb 100%
    );
}

.loans-container {
  width: min(1100px, 100%);
  margin: 0 auto;
}

/* GERİ DÖN — KARTIN DIŞINDA */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 18px 2px;
  padding: 8px 0;
  color: #76513a;
  background: transparent;
  border: none;
  text-decoration: none;
  font-size: 13px;
  font-weight: 650;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-button:hover {
  color: #a85d2d;
  transform: translateX(-3px);
}

.back-arrow {
  font-size: 17px;
}

/* BAŞLIK KARTI */
.page-header {
  position: relative;
  margin-bottom: 30px;
  padding: 28px;
  overflow: hidden;
  background: linear-gradient(
    120deg,
    #fffdf9 0%,
    #fcf5ed 48%,
    #f9eee2 100%
  );
  border: 1px solid #e7d5c3;
  border-radius: 20px;
  box-shadow: 0 7px 22px rgba(90, 59, 36, 0.055);
}

.page-header::after {
  position: absolute;
  top: -75px;
  right: -45px;
  width: 210px;
  height: 210px;
  content: "";
  border: 1px solid rgba(169, 115, 72, 0.14);
  border-radius: 50%;
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-icon {
  width: 74px;
  height: 74px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #f2dfcb, #ead0b5);
  border: 1px solid #e2c6aa;
  border-radius: 18px;
  font-size: 32px;
}

.header-text {
  min-width: 0;
}

.eyebrow,
.section-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.header-content h1 {
  margin: 0;
  color: #493122;
  font-size: clamp(30px, 4vw, 40px);
  font-weight: 750;
  letter-spacing: -1.2px;
  line-height: 1.2;
}

.header-content p {
  max-width: 620px;
  margin: 11px 0 0;
  color: #816b58;
  font-size: 14px;
  line-height: 1.8;
}

/* İSTATİSTİKLER */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 24px 0 48px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 22px;
  background: rgba(255, 251, 246, 0.93);
  border: 1px solid #e7d6c4;
  border-radius: 17px;
  box-shadow: 0 7px 22px rgba(86, 57, 35, 0.045);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgba(86, 57, 35, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #a55f30;
  background: #f4e5d5;
  border: 1px solid #ead4be;
  border-radius: 14px;
  font-size: 21px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  color: #806b5a;
  font-size: 12px;
  font-weight: 600;
}

.stat-card strong {
  margin: 3px 0;
  color: #493122;
  font-size: 29px;
  font-weight: 750;
  line-height: 1.2;
}

.stat-description {
  color: #a08c7b;
  font-size: 10px;
  line-height: 1.5;
}

/* BÖLÜMLER */
.loan-section {
  margin-bottom: 42px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 0;
  color: #493122;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.65px;
}

.section-heading p {
  margin: 8px 0 0;
  color: #8b7665;
  font-size: 13px;
  line-height: 1.6;
}

.section-count {
  flex-shrink: 0;
  padding: 8px 12px;
  color: #87542f;
  background: #f7e9da;
  border: 1px solid #ead4be;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
}

/* AKTİF ÖDÜNÇ KARTLARI */
.loan-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.loan-card {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  min-width: 0;
  padding: 25px;
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid #e6d4c1;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(86, 57, 35, 0.045);
  transition: transform 0.22s ease, box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.loan-card:hover {
  transform: translateY(-3px);
  border-color: #d5b18e;
  box-shadow: 0 15px 32px rgba(86, 57, 35, 0.09);
}

.book-icon {
  width: 60px;
  height: 68px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #f2e1d0, #ead0b5);
  border: 1px solid #e2c6aa;
  border-radius: 15px;
  font-size: 28px;
}

.loan-content {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  flex: 1;
  min-width: 0;
}

.loan-main {
  flex: 1;
  min-width: 0;
}

.card-overline {
  display: block;
  margin-bottom: 7px;
  color: #b08c6e;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.loan-main h3 {
  margin: 0 0 8px;
  color: #493122;
  font-size: 20px;
  font-weight: 750;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.author {
  margin: 0 0 12px;
  color: #806b5a;
  font-size: 13px;
}

.library-name {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  color: #907b69;
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.address-icon {
  flex-shrink: 0;
  color: #b4784c;
  font-size: 17px;
  line-height: 1.3;
}

/* TARİHLER VE DURUM */
.loan-details {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 17px;
  max-width: 530px;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 110px;
}

.detail-label {
  color: #a08a78;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.7px;
}

.date-item strong {
  color: #5c4030;
  font-size: 12px;
  font-weight: 750;
  white-space: nowrap;
}

.remaining {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 11px;
  color: #52734b;
  background: #edf3e9;
  border: 1px solid #d7e5d0;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}

.remaining-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  background: #6b965d;
  border-radius: 50%;
}

.remaining.warning {
  color: #95661f;
  background: #fbf0dc;
  border-color: #f0dfbc;
}

.remaining.warning .remaining-dot {
  background: #c18b32;
}

.remaining.late {
  color: #a44739;
  background: #f9e9e5;
  border-color: #eed0c8;
}

.remaining.late .remaining-dot {
  background: #bf5d4d;
}

/* İADE BUTONU */
.return-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px 15px;
  color: #fffaf5;
  background: #98603b;
  border: 1px solid #98603b;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.2s ease;
}

.return-button:hover:not(:disabled) {
  background: #7f4d2e;
  transform: translateY(-1px);
}

.return-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* BÖLÜM AYIRICI */
.section-divider {
  display: flex;
  align-items: center;
  gap: 17px;
  margin: 45px 0;
}

.section-divider > span:first-child,
.section-divider > span:last-child {
  height: 1px;
  flex: 1;
  background: #ddc8b4;
}

.divider-icon {
  color: #b78359;
  font-size: 17px;
}

/* ÖDÜNÇ GEÇMİŞİ TABLOSU */
.history-wrapper {
  overflow-x: auto;
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid #e6d4c1;
  border-radius: 17px;
  box-shadow: 0 8px 24px rgba(86, 57, 35, 0.045);
}

.history-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
}

.history-table th {
  padding: 16px 18px;
  color: #76513a;
  background: #f3e6d9;
  border-bottom: 1px solid #e6d4c1;
  text-align: left;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.history-table td {
  padding: 16px 18px;
  color: #806b5b;
  border-bottom: 1px solid #eee1d3;
  font-size: 12px;
  vertical-align: middle;
}

.history-table tbody tr {
  transition: background 0.18s ease;
}

.history-table tbody tr:hover {
  background: #fcf2e8;
}

.history-table tbody tr:last-child td {
  border-bottom: none;
}

.history-table td strong {
  color: #493122;
  font-weight: 700;
}

.history-book {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 150px;
}

.history-book-icon {
  width: 32px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: #f3e2d0;
  border: 1px solid #ead4be;
  border-radius: 8px;
  font-size: 16px;
}

.returned-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  color: #52734b;
  background: #edf3e9;
  border: 1px solid #d7e5d0;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 750;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  background: #6b965d;
  border-radius: 50%;
}

/* BİLGİ KARTI */
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 17px;
  padding: 25px;
  background: rgba(255, 251, 246, 0.84);
  border: 1px solid #e6d4c1;
  border-radius: 17px;
  box-shadow: 0 7px 22px rgba(86, 57, 35, 0.035);
}

.info-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #a66a3e;
  background: #f3e2d0;
  border: 1px solid #e8d1ba;
  border-radius: 13px;
  font-size: 22px;
}

.info-content {
  min-width: 0;
}

.info-content .section-eyebrow {
  margin-bottom: 7px;
}

.info-content h3 {
  margin: 0 0 8px;
  color: #493122;
  font-size: 16px;
  font-weight: 750;
}

.info-content p {
  margin: 0;
  color: #806b5a;
  font-size: 12px;
  line-height: 1.9;
}

.info-content p strong {
  color: #6e462c;
}

/* BOŞ DURUM */
.empty-card {
  padding: 42px 28px;
  text-align: center;
  background: rgba(255, 251, 246, 0.83);
  border: 1px dashed #d9bea4;
  border-radius: 18px;
}

.empty-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin: 0 auto 17px;
  color: #a66a3e;
  background: #f3e2d0;
  border: 1px solid #e8d1ba;
  border-radius: 17px;
  font-size: 23px;
}

.empty-card h3 {
  margin: 0 0 9px;
  color: #493122;
  font-size: 17px;
  font-weight: 750;
}

.empty-card p {
  max-width: 510px;
  margin: 0 auto;
  color: #8a7665;
  font-size: 13px;
  line-height: 1.8;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 19px;
  padding: 10px 15px;
  color: #8b552f;
  background: #f6e6d6;
  border: 1px solid #e6cdb4;
  border-radius: 9px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s ease;
}

.empty-action:hover {
  background: #eed7c0;
}

/* YÜKLENİYOR VE HATA */
.state-card {
  padding: 48px 25px;
  text-align: center;
  background: rgba(255, 251, 246, 0.95);
  border: 1px solid #e6d4c1;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(86, 57, 35, 0.05);
}

.state-card h3 {
  margin: 0 0 8px;
  color: #493122;
  font-size: 18px;
}

.state-card p {
  max-width: 500px;
  margin: 0 auto;
  color: #8a7665;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.loader {
  width: 35px;
  height: 35px;
  margin: 0 auto 18px;
  border: 3px solid #ead8c6;
  border-top-color: #98603b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-state {
  background: rgba(255, 247, 244, 0.97);
  border-color: #ead0c9;
}

.error-state h3 {
  color: #98483e;
}

.state-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  margin: 0 auto 15px;
  color: #a84d3d;
  background: #f9e9e5;
  border: 1px solid #eed0c8;
  border-radius: 50%;
  font-size: 20px;
  font-weight: 800;
}

.retry-button {
  margin-top: 18px;
  padding: 10px 16px;
  color: #fffaf5;
  background: #98603b;
  border: none;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.retry-button:hover {
  background: #7f4d2e;
}

/* ODAK GÖRÜNÜMÜ */
button:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(169, 106, 61, 0.42);
  outline-offset: 3px;
}

/* TABLET */
@media (max-width: 950px) {
  .loan-card {
    gap: 17px;
  }

  .loan-content {
    flex-direction: column;
    gap: 20px;
  }

  .loan-details {
    max-width: none;
    padding-top: 18px;
    border-top: 1px solid #eee1d3;
  }
}

@media (max-width: 800px) {
  .loans-page {
    padding: 28px 18px 55px;
  }

  .page-header {
    padding: 24px;
  }

  .stats-grid {
    gap: 12px;
  }

  .stat-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
  }

  .stat-description {
    display: none;
  }
}

/* MOBİL */
@media (max-width: 520px) {
  .loans-page {
    padding: 22px 13px 42px;
  }

  .back-button {
    margin-bottom: 15px;
    font-size: 12px;
  }

  .page-header {
    padding: 20px 17px;
    border-radius: 17px;
  }

  .header-content {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .header-icon {
    width: 53px;
    height: 53px;
    border-radius: 14px;
    font-size: 25px;
  }

  .header-content h1 {
    font-size: 31px;
  }

  .header-content p {
    font-size: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    margin-bottom: 38px;
  }

  .stat-card {
    align-items: center;
    flex-direction: row;
    padding: 16px;
  }

  .stat-description {
    display: block;
  }

  .stat-card strong {
    font-size: 25px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .section-heading h2 {
    font-size: 23px;
  }

  .section-heading p {
    font-size: 12px;
  }

  .loan-card {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .book-icon {
    width: 50px;
    height: 56px;
    border-radius: 13px;
    font-size: 24px;
  }

  .loan-content {
    width: 100%;
  }

  .loan-details {
    align-items: stretch;
    flex-direction: column;
    gap: 15px;
  }

  .date-item {
    min-width: 0;
    gap: 6px;
  }

  .date-item strong {
    white-space: normal;
  }

  .remaining {
    align-self: flex-start;
  }

  .return-button {
    width: 100%;
    padding: 12px;
  }

  .empty-card {
    padding: 32px 18px;
  }

  .info-card {
    gap: 12px;
    padding: 18px;
  }

  .info-icon {
    width: 38px;
    height: 38px;
    font-size: 19px;
  }
}

/* ANİMASYON */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>