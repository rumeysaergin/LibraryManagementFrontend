
<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <NuxtLink to="/admin/loans" class="back-link">
        ← Ödünç listesine dön
      </NuxtLink>

      <section v-if="loading" class="state-card">
        <span class="spinner"></span>
        <p>Ödünç detayları yükleniyor...</p>
      </section>

      <section v-else-if="loadError || !loan" class="state-card error-state">
        <h2>Ödünç kaydı yüklenemedi</h2>
        <p>{{ loadError || 'Bu ID ile eşleşen bir ödünç kaydı bulunamadı.' }}</p>
        <button class="primary-btn" @click="loadDetails">Tekrar dene</button>
      </section>

      <template v-else>
        <header class="detail-header">
          <div>
            <p class="eyebrow">ÖDÜNÇ İŞLEMİ / DETAY</p>
            <h1>📖 Ödünç Detayı</h1>
            <p class="subtitle">
              Bu işlemle ilişkili kullanıcı, kitap ve iade bilgileri.
            </p>
          </div>

          <span class="status-badge" :class="statusClass">
            {{ statusText }}
          </span>
        </header>

        <section class="summary-grid">
          <article class="summary-card">
            <span class="summary-icon">👤</span>
            <div>
              <p>Ödünç alan kullanıcı</p>
              <strong>{{ fullName }}</strong>
              <small>{{ user?.email || 'E-posta bilgisi yok' }}</small>
            </div>
          </article>

          <article class="summary-card">
            <span class="summary-icon">📚</span>
            <div>
              <p>Kitap</p>
              <strong>{{ book?.title || 'Kitap bulunamadı' }}</strong>
              <small>ISBN: {{ book?.isbn || '—' }}</small>
            </div>
          </article>

          <article class="summary-card">
            <span class="summary-icon">🏛️</span>
            <div>
              <p>Kütüphane</p>
              <strong>{{ library?.name || 'Kütüphane bulunamadı' }}</strong>
              <small>{{ library?.address || 'Adres bilgisi yok' }}</small>
            </div>
          </article>
        </section>

        <section class="details-grid">
          <article class="detail-card">
            <div class="card-heading">
              <span>📋</span>
              <div>
                <h2>Ödünç İşlemi Bilgileri</h2>
                <p>Kaydın temel bilgileri ve tarihleri</p>
              </div>
            </div>

            <div class="info-list">
              <div class="info-row">
                <span>Ödünç ID</span>
                <code>{{ loan.id }}</code>
              </div>

              <div class="info-row">
                <span>Kullanıcı ID</span>
                <code>{{ loan.userId }}</code>
              </div>

              <div class="info-row">
                <span>Kitap-kütüphane kaydı ID</span>
                <code>{{ loan.libraryBookId }}</code>
              </div>

              <div class="info-row">
                <span>Ödünç alma tarihi</span>
                <strong>{{ formatDate(loan.borrowDate) }}</strong>
              </div>

              <div class="info-row">
                <span>Son iade tarihi</span>
                <strong :class="{ 'late-date': isOverdue }">
                  {{ formatDate(loan.dueDate) }}
                </strong>
              </div>

              <div class="info-row">
                <span>Gerçekleşen iade tarihi</span>
                <strong>
                  {{ loan.returnDate ? formatDate(loan.returnDate) : 'Henüz iade edilmedi' }}
                </strong>
              </div>

              <div class="info-row">
                <span>Ödünç durumu</span>
                <span class="status-badge" :class="statusClass">
                  {{ statusText }}
                </span>
              </div>
            </div>
          </article>

          <article class="detail-card">
            <div class="card-heading">
              <span>👤</span>
              <div>
                <h2>Kullanıcı Bilgileri</h2>
                <p>Bu ödünç kaydını oluşturan üye</p>
              </div>
            </div>

            <div v-if="user" class="info-list">
              <div class="info-row">
                <span>Ad soyad</span>
                <strong>{{ fullName }}</strong>
              </div>

              <div class="info-row">
                <span>E-posta</span>
                <strong>{{ user.email || '—' }}</strong>
              </div>

              <div class="info-row">
                <span>Rol</span>
                <strong>{{ user.role || 'User' }}</strong>
              </div>

              <div class="info-row">
                <span>Kullanıcı ID</span>
                <code>{{ user.id }}</code>
              </div>
            </div>

            <p v-else class="empty-message">
              Kullanıcı bilgileri alınamadı. Ödünç kaydı mevcut olabilir ancak
              kullanıcı bilgisi API'den getirilemedi.
            </p>

            <div class="card-divider"></div>

            <div class="card-heading">
              <span>📚</span>
              <div>
                <h2>Kitap ve Kütüphane</h2>
                <p>Ödünç verilen kitabın bulunduğu yer</p>
              </div>
            </div>

            <div class="info-list">
              <div class="info-row">
                <span>Kitap adı</span>
                <strong>{{ book?.title || '—' }}</strong>
              </div>

              <div class="info-row">
                <span>ISBN</span>
                <strong>{{ book?.isbn || '—' }}</strong>
              </div>

              <div class="info-row">
                <span>Kütüphane adı</span>
                <strong>{{ library?.name || '—' }}</strong>
              </div>

              <div class="info-row">
                <span>Kütüphane adresi</span>
                <strong>{{ library?.address || '—' }}</strong>
              </div>
            </div>
          </article>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Loan {
  id: string
  userId: string
  libraryBookId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status?: string
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
}

interface Book {
  id: string
  title?: string
  isbn?: string
}

interface Library {
  id: string
  name?: string
  address?: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
}

const route = useRoute()
const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const loan = ref<Loan | null>(null)
const user = ref<User | null>(null)
const book = ref<Book | null>(null)
const library = ref<Library | null>(null)

const loading = ref(true)
const loadError = ref('')

const loanId = computed(() => String(route.params.id || ''))

const fullName = computed(() => {
  const name = `${user.value?.firstName || ''} ${user.value?.lastName || ''}`.trim()
  return name || 'Kullanıcı bulunamadı'
})

const isOverdue = computed(() => {
  if (!loan.value || loan.value.returnDate || !loan.value.dueDate) return false

  const dueDate = new Date(loan.value.dueDate)
  return !Number.isNaN(dueDate.getTime()) && dueDate < new Date()
})

const statusText = computed(() => {
  if (!loan.value) return 'Bilinmiyor'
  if (loan.value.returnDate) return 'İade edildi'
  if (isOverdue.value) return 'Gecikmiş'
  return 'Aktif'
})

const statusClass = computed(() => {
  if (!loan.value) return ''
  if (loan.value.returnDate) return 'status-returned'
  if (isOverdue.value) return 'status-overdue'
  return 'status-active'
})

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

async function loadDetails(): Promise<void> {
  loading.value = true
  loadError.value = ''

  loan.value = null
  user.value = null
  book.value = null
  library.value = null

  try {
    if (!loanId.value) {
      throw new Error('Ödünç kayıt ID bilgisi bulunamadı.')
    }

    const loanData = await apiFetch<Loan>(`/api/Loan/${loanId.value}`)
    loan.value = loanData

    // Kullanıcı bilgisini yükle.
    try {
      user.value = await apiFetch<User>(`/api/User/${loanData.userId}`)
    } catch (error) {
      console.error('Kullanıcı bilgisi yüklenemedi:', error)
    }

    // Ödünç kaydındaki kitap-kütüphane ilişkisini yükle.
    try {
      const libraryBook = await apiFetch<LibraryBook>(
        `/api/LibraryBook/${loanData.libraryBookId}`
      )

      // Kitap ve kütüphane bilgileri birbirinden bağımsız yüklenir.
      const [bookResult, libraryResult] = await Promise.allSettled([
        apiFetch<Book>(`/api/Book/${libraryBook.bookId}`),
        apiFetch<Library>(`/api/Library/${libraryBook.libraryId}`)
      ])

      if (bookResult.status === 'fulfilled') {
        book.value = bookResult.value
      } else {
        console.error('Kitap bilgisi yüklenemedi:', bookResult.reason)
      }

      if (libraryResult.status === 'fulfilled') {
        library.value = libraryResult.value
      } else {
        console.error('Kütüphane bilgisi yüklenemedi:', libraryResult.reason)
      }
    } catch (error) {
      console.error('Kitap-kütüphane ilişkisi yüklenemedi:', error)
    }
  } catch (error: any) {
    console.error('Ödünç detayı yüklenirken hata:', error)
    loadError.value =
      error?.data?.message ||
      error?.message ||
      'Ödünç detayı yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadDetails()
})
</script>

<style scoped>


.admin-main {
  min-width: 0;
  padding: 28px;
  color: #493122;
}

.back-link {
  display: inline-block;
  margin-bottom: 22px;
  color: #8b5a38;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 7px;
  color: #a16b45;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.detail-header h1 {
  margin: 0;
  color: #493122;
  font-size: clamp(24px, 3vw, 31px);
}

.subtitle {
  margin: 8px 0 0;
  color: #8a7563;
  font-size: 14px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  min-width: 0;
  padding: 19px;
  border: 1px solid #e8d9ca;
  border-radius: 14px;
  background: #fffdf9;
  box-shadow: 0 4px 14px rgba(82, 54, 34, 0.04);
}

.summary-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 12px;
  background: #f4e7d9;
  font-size: 20px;
}

.summary-card > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.summary-card p {
  margin: 0;
  color: #8a7563;
  font-size: 12px;
}

.summary-card strong {
  overflow-wrap: anywhere;
  color: #493122;
  font-size: 15px;
}

.summary-card small {
  overflow-wrap: anywhere;
  color: #9a8573;
  font-size: 11px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 20px;
}

.detail-card,
.state-card {
  border: 1px solid #e8d9ca;
  border-radius: 15px;
  background: #fffdf9;
  box-shadow: 0 4px 14px rgba(82, 54, 34, 0.04);
}

.detail-card {
  min-width: 0;
  padding: 22px;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-heading > span {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 11px;
  background: #f4e7d9;
  font-size: 19px;
}

.card-heading h2 {
  margin: 0;
  color: #493122;
  font-size: 16px;
}

.card-heading p {
  margin: 5px 0 0;
  color: #8a7563;
  font-size: 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding: 13px 0;
  border-bottom: 1px solid #f0e5da;
  font-size: 13px;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row > span:first-child {
  flex: 0 0 43%;
  color: #8a7563;
}

.info-row strong,
.info-row code {
  max-width: 57%;
  overflow-wrap: anywhere;
  color: #493122;
  text-align: right;
}

.info-row code {
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  padding: 7px 11px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.status-active {
  background: #e4f2e5;
  color: #286b3b;
}

.status-overdue {
  background: #fbe7e2;
  color: #a63b2e;
}

.status-returned {
  background: #e9e9ef;
  color: #55536e;
}

.late-date {
  color: #a63b2e !important;
}

.card-divider {
  height: 1px;
  margin: 22px 0;
  background: #eadccf;
}

.state-card {
  display: flex;
  min-height: 200px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25px;
  text-align: center;
}

.state-card p {
  color: #8a7563;
  font-size: 13px;
}

.error-state {
  color: #963b2e;
}

.primary-btn {
  border: 0;
  border-radius: 9px;
  background: #8b5a38;
  color: white;
  padding: 10px 15px;
  font-weight: 700;
  cursor: pointer;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #ead8c7;
  border-top-color: #a16b45;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-message {
  color: #8a7563;
  font-size: 13px;
  line-height: 1.6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .admin-main {
    padding: 18px 12px;
  }

  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-card {
    padding: 16px;
  }

  .info-row {
    gap: 10px;
  }
}
</style>
