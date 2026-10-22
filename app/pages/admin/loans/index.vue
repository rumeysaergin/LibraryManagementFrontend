
<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <header class="page-header">
        <div>
          <p class="eyebrow">YÖNETİM PANELİ</p>
          <h1>📚 Ödünç İşlemleri</h1>
          <p class="page-description">
            Ödünç kayıtlarını, kullanıcıları ve iade durumlarını görüntüleyin.
          </p>
        </div>

        <button class="refresh-btn" :disabled="loading" @click="loadData">
          {{ loading ? 'Yükleniyor...' : '↻ Yenile' }}
        </button>
      </header>

      <div v-if="loadError" class="message error-message">
        {{ loadError }}
        <button @click="loadData">Tekrar dene</button>
      </div>

      <section class="stats-grid">
        <article class="stat-card">
          <span class="stat-icon">📋</span>
          <div>
            <p>Toplam ödünç</p>
            <strong>{{ loans.length }}</strong>
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-icon">📖</span>
          <div>
            <p>Aktif ödünç</p>
            <strong>{{ activeCount }}</strong>
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-icon">⏰</span>
          <div>
            <p>Gecikmiş</p>
            <strong>{{ overdueCount }}</strong>
          </div>
        </article>

        <article class="stat-card">
          <span class="stat-icon">✓</span>
          <div>
            <p>İade edilmiş</p>
            <strong>{{ returnedCount }}</strong>
          </div>
        </article>
      </section>

      <section class="filter-card">
        <div class="filter-heading">
          <div>
            <h2>Ödünç Kayıtları</h2>
            <p>Bir kaydın ayrıntılarını görmek için satıra tıklayın.</p>
          </div>
          <span class="record-count">{{ filteredLoans.length }} kayıt</span>
        </div>

        <div class="filters">
          <div class="field search-field">
            <label for="loan-search">Arama</label>
            <input
              id="loan-search"
              v-model="searchText"
              type="text"
              placeholder="Kullanıcı adı, e-posta, kitap veya ID ara..."
            />
          </div>

          <div class="field">
            <label for="status-filter">Ödünç durumu</label>
            <select id="status-filter" v-model="statusFilter">
              <option value="all">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="overdue">Gecikmiş</option>
              <option value="returned">İade edildi</option>
            </select>
          </div>

          <div class="field">
            <label for="library-filter">Kütüphane</label>
            <select id="library-filter" v-model="libraryFilter">
              <option value="all">Tüm kütüphaneler</option>
              <option
                v-for="library in libraries"
                :key="library.id"
                :value="library.id"
              >
                {{ library.name }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <section v-if="loading" class="state-card">
        <span class="loading-spinner"></span>
        <p>Ödünç kayıtları yükleniyor...</p>
      </section>

      <section v-else-if="!filteredLoans.length" class="state-card">
        <span class="empty-icon">📭</span>
        <h3>Kayıt bulunamadı</h3>
        <p>Arama kelimesini veya filtreleri değiştirmeyi deneyin.</p>
      </section>

      <section v-else class="table-card">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Kitap</th>
                <th>Kütüphane</th>
                <th>Ödünç tarihi</th>
                <th>Son iade tarihi</th>
                <th>İade tarihi</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="loan in filteredLoans"
                :key="loan.id"
                class="clickable-row"
                tabindex="0"
                @click="goToLoanDetail(loan.id)"
                @keydown.enter="goToLoanDetail(loan.id)"
              >
                <td>
                  <div class="user-cell">
                    <span class="user-avatar">{{ getInitials(loan.userName) }}</span>
                    <div class="cell-stack">
                      <strong>{{ loan.userName || 'Kullanıcı bulunamadı' }}</strong>
                      <small>{{ loan.userEmail || 'E-posta bilgisi yok' }}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="cell-stack">
                    <strong>{{ loan.bookTitle || 'Kitap bulunamadı' }}</strong>
                    <small :title="loan.id">ID: {{ shortId(loan.id) }}</small>
                  </div>
                </td>

                <td>{{ loan.libraryName || '—' }}</td>
                <td>{{ formatDate(loan.borrowDate) }}</td>
                <td :class="{ 'late-date': isOverdue(loan) }">
                  {{ formatDate(loan.dueDate) }}
                </td>
                <td>
                  {{ loan.returnDate ? formatDate(loan.returnDate) : 'Henüz iade edilmedi' }}
                </td>

                <td>
                  <span class="status-badge" :class="statusClass(loan)">
                    {{ statusText(loan) }}
                  </span>
                </td>

                <td @click.stop>
                  <NuxtLink
                    :to="`/admin/loans/${loan.id}`"
                    class="detail-btn"
                  >
                    🔍 Detay
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="table-footer">
          Gösterilen kayıt sayısı: {{ filteredLoans.length }}
        </footer>
      </section>
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
  userName?: string
  userEmail?: string
  bookTitle?: string
  libraryId?: string
  libraryName?: string
}

interface User {
  id: string
  firstName?: string
  lastName?: string
  email?: string
}

interface Book {
  id: string
  title?: string
}

interface Library {
  id: string
  name?: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const loans = ref<Loan[]>([])
const libraries = ref<Library[]>([])
const loading = ref(true)
const loadError = ref('')
const searchText = ref('')
const statusFilter = ref('all')
const libraryFilter = ref('all')

const activeCount = computed(
  () => loans.value.filter(loan => !loan.returnDate && !isOverdue(loan)).length
)

const overdueCount = computed(
  () => loans.value.filter(loan => isOverdue(loan)).length
)

const returnedCount = computed(
  () => loans.value.filter(loan => !!loan.returnDate).length
)

const filteredLoans = computed(() => {
  const query = searchText.value.trim().toLocaleLowerCase('tr-TR')

  return loans.value.filter(loan => {
    const matchesSearch =
      !query ||
      loan.userName?.toLocaleLowerCase('tr-TR').includes(query) ||
      loan.userEmail?.toLocaleLowerCase('tr-TR').includes(query) ||
      loan.bookTitle?.toLocaleLowerCase('tr-TR').includes(query) ||
      loan.libraryName?.toLocaleLowerCase('tr-TR').includes(query) ||
      loan.id.toLocaleLowerCase('tr-TR').includes(query) ||
      loan.userId.toLocaleLowerCase('tr-TR').includes(query)

    const matchesLibrary =
      libraryFilter.value === 'all' ||
      loan.libraryId === libraryFilter.value

    let matchesStatus = true

    if (statusFilter.value === 'active') {
      matchesStatus = !loan.returnDate && !isOverdue(loan)
    } else if (statusFilter.value === 'overdue') {
      matchesStatus = isOverdue(loan)
    } else if (statusFilter.value === 'returned') {
      matchesStatus = !!loan.returnDate
    }

    return matchesSearch && matchesLibrary && matchesStatus
  })
})

function isOverdue(loan: Loan): boolean {
  if (loan.returnDate) return false

  const dueDate = new Date(loan.dueDate)
  return !Number.isNaN(dueDate.getTime()) && dueDate < new Date()
}

function statusText(loan: Loan): string {
  if (loan.returnDate) return 'İade edildi'
  if (isOverdue(loan)) return 'Gecikmiş'
  return 'Aktif'
}

function statusClass(loan: Loan): string {
  if (loan.returnDate) return 'status-returned'
  if (isOverdue(loan)) return 'status-overdue'
  return 'status-active'
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function shortId(id: string): string {
  return id ? `${id.slice(0, 8)}...` : '—'
}

function getInitials(name?: string): string {
  if (!name || name === 'Kullanıcı bulunamadı') return '?'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toLocaleUpperCase('tr-TR') || '')
    .join('')
}

function goToLoanDetail(loanId: string): void {
  navigateTo(`/admin/loans/${loanId}`)
}

async function loadData(): Promise<void> {
  loading.value = true
  loadError.value = ''

  try {
    const [loanResult, userResult, libraryBookResult, bookResult, libraryResult] =
      await Promise.allSettled([
        apiFetch<Loan[]>('/api/Loan'),
        apiFetch<User[]>('/api/User'),
        apiFetch<LibraryBook[]>('/api/LibraryBook'),
        apiFetch<Book[]>('/api/Book'),
        apiFetch<Library[]>('/api/Library')
      ])

    if (loanResult.status !== 'fulfilled' || !Array.isArray(loanResult.value)) {
      throw new Error('Ödünç kayıtları alınamadı.')
    }

    const userList =
      userResult.status === 'fulfilled' && Array.isArray(userResult.value)
        ? userResult.value
        : []

    const libraryBookList =
      libraryBookResult.status === 'fulfilled' && Array.isArray(libraryBookResult.value)
        ? libraryBookResult.value
        : []

    const bookList =
      bookResult.status === 'fulfilled' && Array.isArray(bookResult.value)
        ? bookResult.value
        : []

    const libraryList =
      libraryResult.status === 'fulfilled' && Array.isArray(libraryResult.value)
        ? libraryResult.value
        : []

    libraries.value = libraryList

    const usersMap = new Map(userList.map(user => [user.id, user]))
    const libraryBooksMap = new Map(
      libraryBookList.map(libraryBook => [libraryBook.id, libraryBook])
    )
    const booksMap = new Map(bookList.map(book => [book.id, book]))
    const librariesMap = new Map(libraryList.map(library => [library.id, library]))

    loans.value = loanResult.value.map(loan => {
      const user = usersMap.get(loan.userId)
      const libraryBook = libraryBooksMap.get(loan.libraryBookId)
      const book = libraryBook ? booksMap.get(libraryBook.bookId) : undefined
      const library = libraryBook
        ? librariesMap.get(libraryBook.libraryId)
        : undefined

      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

      return {
        ...loan,
        userName: fullName || 'Kullanıcı bulunamadı',
        userEmail: user?.email || '',
        bookTitle: book?.title || 'Kitap bulunamadı',
        libraryId: libraryBook?.libraryId || '',
        libraryName: library?.name || 'Kütüphane bulunamadı'
      }
    })
  } catch (error) {
    console.error('Ödünç kayıtları yüklenirken hata:', error)
    loadError.value = 'Ödünç kayıtları yüklenemedi. API bağlantısını kontrol edip tekrar deneyin.'
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


.admin-main {
  min-width: 0;
  padding: 28px;
  color: #493122;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 7px;
  color: #a16b45;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 0;
  color: #493122;
  font-size: clamp(23px, 3vw, 30px);
}

.page-description {
  margin: 8px 0 0;
  color: #8a7563;
  font-size: 14px;
}

.refresh-btn,
.detail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dec8b3;
  border-radius: 9px;
  background: #fffdf9;
  color: #744b30;
  padding: 10px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.refresh-btn:hover,
.detail-btn:hover {
  background: #f5e9dc;
}

.refresh-btn:disabled {
  cursor: wait;
  opacity: 0.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 22px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 20px;
  background: #fffdf9;
  border: 1px solid #e8d9ca;
  border-radius: 15px;
  box-shadow: 0 4px 14px rgba(82, 54, 34, 0.04);
}

.stat-icon {
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border-radius: 12px;
  background: #f4e7d9;
  font-size: 21px;
}

.stat-card p {
  margin: 0 0 5px;
  color: #8a7563;
  font-size: 12px;
}

.stat-card strong {
  color: #493122;
  font-size: 24px;
}

.filter-card,
.table-card,
.state-card {
  border: 1px solid #e8d9ca;
  border-radius: 15px;
  background: #fffdf9;
  box-shadow: 0 4px 14px rgba(82, 54, 34, 0.04);
}

.filter-card {
  padding: 22px;
  margin-bottom: 20px;
}

.filter-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-heading h2 {
  margin: 0;
  font-size: 18px;
}

.filter-heading p {
  margin: 6px 0 0;
  color: #8a7563;
  font-size: 13px;
}

.record-count {
  border-radius: 20px;
  padding: 7px 11px;
  background: #f4e7d9;
  color: #744b30;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.filters {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) minmax(160px, 1fr) minmax(180px, 1fr);
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  color: #745a46;
  font-size: 12px;
  font-weight: 700;
}

.field input,
.field select {
  width: 100%;
  min-height: 42px;
  box-sizing: border-box;
  border: 1px solid #dfcdbb;
  border-radius: 9px;
  background: #fff;
  color: #493122;
  padding: 10px 12px;
  font: inherit;
  font-size: 13px;
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: #b77a4b;
  box-shadow: 0 0 0 3px rgba(183, 122, 75, 0.12);
}

.table-card {
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.data-table th {
  padding: 14px 15px;
  background: #f5eadf;
  color: #75563e;
  font-size: 11px;
  font-weight: 800;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.35px;
}

.data-table td {
  padding: 15px;
  border-top: 1px solid #f0e5da;
  color: #5b4635;
  font-size: 13px;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.clickable-row:hover {
  background: #fcf5ed;
}

.clickable-row:focus-visible {
  outline: 2px solid #b77a4b;
  outline-offset: -2px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  display: grid;
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  place-items: center;
  border-radius: 50%;
  background: #ead5c1;
  color: #744b30;
  font-size: 12px;
  font-weight: 800;
}

.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cell-stack strong {
  color: #493122;
  font-size: 13px;
}

.cell-stack small {
  color: #9a8573;
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  padding: 6px 9px;
  font-size: 11px;
  font-weight: 800;
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
  font-weight: 800;
}

.table-footer {
  padding: 13px 16px;
  border-top: 1px solid #f0e5da;
  color: #8a7563;
  font-size: 12px;
}

.state-card {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.state-card h3 {
  margin: 10px 0 5px;
}

.state-card p {
  color: #8a7563;
  font-size: 13px;
}

.empty-icon {
  font-size: 30px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #ead8c7;
  border-top-color: #a16b45;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  border-radius: 10px;
  padding: 13px 15px;
  font-size: 13px;
}

.error-message {
  border: 1px solid #efc5bc;
  background: #fff0ed;
  color: #963b2e;
}

.error-message button {
  border: 1px solid #e6b0a5;
  border-radius: 7px;
  background: white;
  color: inherit;
  padding: 7px 10px;
  cursor: pointer;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .search-field {
    grid-column: 1 / -1;
  }
}

@media (max-width: 650px) {
  .admin-main {
    padding: 18px 12px;
  }

  .page-header {
    align-items: flex-start;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 13px;
  }

  .stat-icon {
    width: 35px;
    height: 35px;
    font-size: 17px;
  }

  .stat-card strong {
    font-size: 20px;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .search-field {
    grid-column: auto;
  }

  .filter-card {
    padding: 15px;
  }
}
</style>
