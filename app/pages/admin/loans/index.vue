<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <!-- Sayfa başlığı -->
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">
            {{ selectedLibrary ? `SEÇİLİ KÜTÜPHANE: ${selectedLibrary.name}` : 'ÖDÜNÇ YÖNETİMİ' }}
          </span>
          <h1>{{ selectedLibrary ? `${selectedLibrary.name} Ödünçleri` : 'Ödünç İşlemleri' }}</h1>
          <p class="page-desc">
            {{
              selectedLibrary
                ? `Yalnızca ${selectedLibrary.name} bünyesindeki kitaplara ait ödünç kayıtları görüntüleniyor.`
                : 'Tüm kütüphanelerdeki ödünç kayıtlarını, iade sürelerini ve gecikmeleri takip edin.'
            }}
          </p>
        </div>

        <div class="header-icon" aria-hidden="true">📖</div>
      </header>

      <!-- Seçili Kütüphane Bilgi Şeridi -->
      <div v-if="selectedLibrary" class="active-lib-filter-pill">
        <span>🏛️ Sol menüden seçilen kütüphaneye filtrelendi: <strong>{{ selectedLibrary.name }}</strong></span>
        <button type="button" class="clear-filter-mini-btn" @click="setLibraryId('')">
          ✕ Filtreyi Kaldır (Tüm Kütüphaneler)
        </button>
      </div>

      <!-- İstatistikler -->
      <div v-if="!loading && !loadError" class="stats-row">
        <div class="stat-pill">
          <span class="pill-icon">📖</span>
          <div>
            <span class="pill-label">Aktif Ödünç</span>
            <strong>{{ activeLoans.length }}</strong>
          </div>
        </div>

        <div class="stat-pill">
          <span class="pill-icon">✓</span>
          <div>
            <span class="pill-label">İade Edilmiş</span>
            <strong>{{ returnedLoans.length }}</strong>
          </div>
        </div>

        <div class="stat-pill overdue-pill">
          <span class="pill-icon">⚠️</span>
          <div>
            <span class="pill-label">Geciken</span>
            <strong>{{ overdueLoans.length }}</strong>
          </div>
        </div>
      </div>

      <!-- Filtreler -->
      <div class="filters-row">
        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kullanıcı ID veya kitap adı ile ara..."
          />
        </div>

        <select v-model="statusFilter" class="filter-select">
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="returned">İade Edildi</option>
          <option value="overdue">Geciken</option>
        </select>
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Ödünç kayıtları yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">
          Tekrar Dene
        </button>
      </div>

      <!-- Ödünç kayıtları tablosu -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">
            {{ filteredLoans.length }} kayıt
          </span>

          <span class="sort-info">
            ↓ Ödünç tarihine göre yeniden eskiye
          </span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Kullanıcı ID</th>
              <th>Kitap</th>
              <th>Kütüphane</th>
              <th>Ödünç Tarihi</th>
              <th>Son İade</th>
              <th>İade Tarihi</th>
              <th>Durum</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredLoans.length === 0">
              <td colspan="7" class="empty-row">
                Kayıt bulunamadı.
              </td>
            </tr>

            <tr
              v-for="loan in filteredLoans"
              :key="loan.id"
            >
              <!-- Kullanıcı ID -->
              <td>
                <span
                  class="user-id-cell"
                  :title="loan.userId"
                >
                  {{ loan.userId || '—' }}
                </span>
              </td>

              <!-- Kitap -->
              <td>
                <div class="loan-book-cell">
                  <span>📖</span>
                  <strong>{{ loan.bookTitle }}</strong>
                </div>
              </td>

              <!-- Kütüphane -->
              <td>{{ loan.libraryName }}</td>

              <!-- Ödünç tarihi -->
              <td>{{ formatDate(loan.borrowDate) }}</td>

              <!-- Son iade tarihi -->
              <td :class="{ 'overdue-date': isOverdue(loan) }">
                {{ formatDate(loan.dueDate) }}
              </td>

              <!-- İade tarihi -->
              <td>
                {{ loan.returnDate ? formatDate(loan.returnDate) : '—' }}
              </td>

              <!-- Durum -->
              <td>
                <span v-if="loan.returnDate" class="returned-badge">
                  ✓ İade Edildi
                </span>

                <span v-else-if="isOverdue(loan)" class="overdue-badge">
                  ⚠️ Gecikiyor
                </span>

                <span v-else class="active-badge">
                  📖 Aktif
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
  status: string
  libraryId?: string
  bookTitle?: string
  libraryName?: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
}

interface Book {
  id: string
  title: string
}

interface Library {
  id: string
  name: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()
const { selectedLibraryId, selectedLibrary, setLibraryId } = useAdminLibrary()

const loans = ref<Loan[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const statusFilter = ref('')

// Sol menüden kütüphane seçildiyse kütüphaneye göre filtreli liste
const scopedLoans = computed(() => {
  if (!selectedLibraryId.value) return loans.value
  return loans.value.filter(loan => loan.libraryId === selectedLibraryId.value)
})

// Aktif ödünç istatistiği
const activeLoans = computed(() =>
  scopedLoans.value.filter(
    loan => !loan.returnDate && !isOverdue(loan)
  )
)

// İade edilmiş ödünç istatistiği
const returnedLoans = computed(() =>
  scopedLoans.value.filter(loan => !!loan.returnDate)
)

// Geciken ödünç istatistiği
const overdueLoans = computed(() =>
  scopedLoans.value.filter(loan => isOverdue(loan))
)

// Ödünç süresinin geçip geçmediğini kontrol et
const isOverdue = (loan: Loan) => {
  if (loan.returnDate) {
    return false
  }

  const dueDate = new Date(loan.dueDate)

  if (Number.isNaN(dueDate.getTime())) {
    return false
  }

  return dueDate < new Date()
}

// Tarih biçimlendirme
const formatDate = (date: string | null) => {
  if (!date) {
    return '—'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '—'
  }

  return parsedDate.toLocaleDateString('tr-TR')
}

// Arama, durum filtreleri ve yeniden eskiye sıralama
const filteredLoans = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  return scopedLoans.value
    .filter(loan => {
      const matchSearch =
        !q ||
        (loan.bookTitle ?? '').toLowerCase().includes(q) ||
        (loan.userId ?? '').toLowerCase().includes(q)

      let matchStatus = true

      if (statusFilter.value === 'active') {
        matchStatus = !loan.returnDate && !isOverdue(loan)
      }

      if (statusFilter.value === 'returned') {
        matchStatus = !!loan.returnDate
      }

      if (statusFilter.value === 'overdue') {
        matchStatus = isOverdue(loan)
      }

      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const dateA = new Date(a.borrowDate).getTime()
      const dateB = new Date(b.borrowDate).getTime()

      // Yeni tarih üstte, eski tarih altta
      // Geçersiz tarihler listenin sonuna gider
      if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
        return 0
      }

      if (Number.isNaN(dateA)) {
        return 1
      }

      if (Number.isNaN(dateB)) {
        return -1
      }

      return dateB - dateA
    })
})

// Ödünç kayıtlarını ve ilgili kitap/kütüphane bilgilerini yükle
const loadData = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const [
      loanData,
      lbData,
      bookData,
      libraryData
    ] = await Promise.all([
      apiFetch<Loan[]>('/api/Loan'),
      apiFetch<LibraryBook[]>('/api/LibraryBook'),
      apiFetch<Book[]>('/api/Book'),
      apiFetch<Library[]>('/api/Library')
    ])

    const loanList = Array.isArray(loanData)
      ? loanData
      : []

    const lbList = Array.isArray(lbData)
      ? lbData
      : []

    const bookList = Array.isArray(bookData)
      ? bookData
      : []

    const libraryList = Array.isArray(libraryData)
      ? libraryData
      : []

    loans.value = loanList.map(loan => {
      const libraryBook = lbList.find(
        item => item.id === loan.libraryBookId
      )

      const book = libraryBook
        ? bookList.find(
            item => item.id === libraryBook.bookId
          )
        : undefined

      const library = libraryBook
        ? libraryList.find(
            item => item.id === libraryBook.libraryId
          )
        : undefined

      return {
        ...loan,
        libraryId: libraryBook?.libraryId,
        bookTitle: book?.title ?? '—',
        libraryName: library?.name ?? '—'
      }
    })
  } catch (error) {
    console.error(
      'Ödünç kayıtları yüklenemedi:',
      error
    )

    loadError.value =
      'Ödünç kayıtları yüklenirken hata oluştu.'
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


.active-lib-filter-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fbf3e9;
  border: 1px solid #e7d5c3;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  color: #493122;
  margin-bottom: 20px;
}

.clear-filter-mini-btn {
  background: #fff;
  border: 1px solid #dcc2a7;
  color: #8c5734;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-mini-btn:hover {
  background: #8c5734;
  color: #fff;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(255, 250, 244, 0.96);
  border: 1px solid #dfc8b2;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(92, 57, 34, 0.07);
}

.overdue-pill {
  border-color: #e5c3b9;
  background: #fdf8f6;
}

.pill-icon {
  font-size: 22px;
}

.stat-pill > div {
  display: flex;
  flex-direction: column;
}

.pill-label {
  color: #765b48;
  font-size: 12px;
  font-weight: 600;
}

.stat-pill strong {
  color: #4b3021;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-select {
  padding: 12px 14px;
  background: rgba(255, 250, 244, 0.96);
  border: 1px solid #dfc8b2;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  color: #3f2b20;
  outline: none;
}

.filter-select:focus {
  border-color: #a4876d;
  box-shadow: 0 0 0 3px rgb(120 88 63 / 10%);
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.sort-info {
  color: #816b58;
  font-size: 12px;
}

.loan-book-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-id-cell {
  display: inline-block;
  max-width: 180px;
  overflow-wrap: anywhere;
  color: #76513a;
  font-size: 12px;
  font-weight: 600;
}

.overdue-date {
  color: #a84d3d;
  font-weight: 700;
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .data-table {
    min-width: 900px;
  }

  .sort-info {
    margin-top: 4px;
  }
}
</style>