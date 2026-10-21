<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <!-- Sayfa Başlığı -->
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">
            {{ selectedLibrary ? 'SEÇİLİ KÜTÜPHANE PANELİ' : 'YÖNETİM PANELİ' }}
          </span>
          <h1>{{ selectedLibrary ? selectedLibrary.name : 'Ana Menü' }}</h1>
          <p>
            {{
              selectedLibrary
                ? `${selectedLibrary.name} için kütüphaneye özel istatistikler, stok, ödünç ve ceza takibi.`
                : 'Kütüphane sistemine genel bakış, istatistikler ve hızlı yönetim işlemleri. Sol menüden belirli bir kütüphane seçerek sadece o kütüphanenin paneline geçiş yapabilirsiniz.'
            }}
          </p>
        </div>
        <div class="header-icon" aria-hidden="true">
          {{ selectedLibrary ? '🏛️' : '📊' }}
        </div>
      </header>

      <!-- SEÇİLİ KÜTÜPHANE BİLGİ VE HIZLI YÖNETİM ŞERİDİ (SOL MENÜDEN BİR KÜTÜPHANE SEÇİLDİĞİNDE) -->
      <div v-if="selectedLibrary" class="active-lib-banner">
        <div class="active-lib-meta">
          <span class="active-badge">🏛️ AKTİF PANEL</span>
          <div>
            <strong class="active-name">{{ selectedLibrary.name }}</strong>
            <span v-if="selectedLibrary.address" class="active-address">
              📍 {{ selectedLibrary.address }}
            </span>
          </div>
        </div>
        <div class="active-actions">
          <NuxtLink :to="`/admin/libraries/${selectedLibrary.id}`" class="active-btn">
            ⚙️ Bu Kütüphanenin Stoğunu ve Üyelerini Yönet ➔
          </NuxtLink>
        </div>
      </div>

      <!-- YÜKLENİYOR / HATA DURUMU -->
      <div v-if="loading" class="state-card" style="margin-bottom: 24px;">
        <div class="loader"></div>
        <p>Panel verileri hesaplanıyor ve yükleniyor...</p>
      </div>

      <div v-else-if="loadError" class="state-card error-state" style="margin-bottom: 24px;">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">Tekrar Dene</button>
      </div>

      <template v-else>
        <!-- ==============================================
             DURUM 1: SOL MENÜDEN BİR KÜTÜPHANE SEÇİLDİYSE
             (Sadece o kütüphaneye ait işlemler & veriler)
             ============================================== -->
        <div v-if="selectedLibrary" class="library-specific-panel">
          <!-- Kütüphaneye Özel İstatistik Kartları -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div>
                <p class="stat-title">Kütüphane Üyesi</p>
                <p class="stat-value">{{ currentLibMembers.length }}</p>
                <small class="stat-sub">Kayıtlı üye kullanıcı</small>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div>
                <p class="stat-title">Kitap Çeşidi</p>
                <p class="stat-value">{{ currentLibBooks.length }}</p>
                <small class="stat-sub">{{ currentLibTotalStock }} toplam stok</small>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div>
                <p class="stat-title">Aktif Ödünç</p>
                <p class="stat-value">{{ currentLibActiveLoans.length }}</p>
                <small class="stat-sub">{{ currentLibLoans.length }} toplam ödünç</small>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">⚠️</div>
              <div>
                <p class="stat-title">Ödenmemiş Ceza</p>
                <p class="stat-value">{{ currentLibUnpaidFines.length }}</p>
                <small class="stat-sub">{{ currentLibUnpaidAmount.toFixed(2) }} ₺ bekleyen</small>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">✓</div>
              <div>
                <p class="stat-title">İade Edilen Kitap</p>
                <p class="stat-value">{{ currentLibReturnedLoans.length }}</p>
                <small class="stat-sub">Başarıyla teslim</small>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div>
                <p class="stat-title">Toplam Ceza</p>
                <p class="stat-value">{{ currentLibTotalFineAmount.toFixed(2) }} ₺</p>
                <small class="stat-sub">{{ currentLibFines.length }} ceza kaydı</small>
              </div>
            </div>
          </div>

          <!-- Kütüphaneye Özel Ödünç ve Ceza Tabloları -->
          <div class="tables-split-grid">
            <!-- Bu Kütüphaneye Ait Son Ödünçler -->
            <div class="split-card">
              <div class="split-header">
                <div>
                  <h3 class="split-title">📖 Bu Kütüphaneye Ait Son Ödünçler</h3>
                  <span class="split-subtitle">Toplam {{ currentLibLoans.length }} ödünç kaydı</span>
                </div>
                <NuxtLink to="/admin/loans" class="view-all-link">Tümü →</NuxtLink>
              </div>

              <div class="split-body">
                <table v-if="currentLibLoans.length > 0" class="mini-data-table">
                  <thead>
                    <tr>
                      <th>Kitap</th>
                      <th>Ödünç Alan</th>
                      <th>Son İade</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="loan in currentLibLoans.slice(0, 5)" :key="loan.id">
                      <td>
                        <strong>{{ getBookTitleByLbId(loan.libraryBookId) }}</strong>
                      </td>
                      <td>{{ getUserName(loan.userId) }}</td>
                      <td>{{ formatDate(loan.dueDate) }}</td>
                      <td>
                        <span v-if="loan.returnDate" class="mini-badge success">İade Edildi</span>
                        <span v-else-if="isLoanOverdue(loan)" class="mini-badge danger">Gecikiyor</span>
                        <span v-else class="mini-badge primary">Aktif</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="empty-panel-text">
                  Bu kütüphaneye ait henüz ödünç kaydı bulunmuyor.
                </div>
              </div>
            </div>

            <!-- Bu Kütüphaneye Ait Cezalar -->
            <div class="split-card">
              <div class="split-header">
                <div>
                  <h3 class="split-title">⚠️ Bu Kütüphaneye Ait Cezalar</h3>
                  <span class="split-subtitle">Toplam {{ currentLibFines.length }} ceza</span>
                </div>
                <NuxtLink to="/admin/fines" class="view-all-link">Tümü →</NuxtLink>
              </div>

              <div class="split-body">
                <table v-if="currentLibFines.length > 0" class="mini-data-table">
                  <thead>
                    <tr>
                      <th>Tutar</th>
                      <th>Tarih</th>
                      <th>Durum</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="fine in currentLibFines.slice(0, 5)" :key="fine.id">
                      <td><strong>{{ Number(fine.amount).toFixed(2) }} ₺</strong></td>
                      <td>{{ formatDate(fine.fineDate) }}</td>
                      <td>
                        <span v-if="fine.isPaid" class="mini-badge success">Ödendi</span>
                        <span v-else class="mini-badge warning">Ödenmedi</span>
                      </td>
                      <td>
                        <NuxtLink :to="`/admin/fines/${fine.id}`" class="mini-link-btn">
                          Detay
                        </NuxtLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="empty-panel-text">
                  Bu kütüphanede ceza kaydı bulunmuyor.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==============================================
             DURUM 2: TÜM KÜTÜPHANELER (GENEL SİSTEM)
             ============================================== -->
        <div v-else class="all-libraries-panel">
          <!-- Genel İstatistik Kartları -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div>
                <p class="stat-title">Toplam Kullanıcı</p>
                <p class="stat-value">{{ allUsers.length }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏛️</div>
              <div>
                <p class="stat-title">Kütüphane Sayısı</p>
                <p class="stat-value">{{ allLibraries.length }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div>
                <p class="stat-title">Aktif Ödünç</p>
                <p class="stat-value">{{ globalActiveLoansCount }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">⚠️</div>
              <div>
                <p class="stat-title">Ödenmemiş Ceza</p>
                <p class="stat-value">{{ globalUnpaidFinesCount }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div>
                <p class="stat-title">Toplam Kitap</p>
                <p class="stat-value">{{ allBooks.length }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">✍️</div>
              <div>
                <p class="stat-title">Yazar Sayısı</p>
                <p class="stat-value">{{ allAuthors.length }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- HIZLI ERİŞİM VE YÖNETİM MODÜLLERİ -->
        <section class="quick-section" style="margin-top: 36px;">
          <div class="table-header-row" style="border-radius: 14px; margin-bottom: 18px; border: 1px solid #e7d5c3;">
            <h2 style="color: #493122; font-size: 20px; font-weight: 750; margin: 0;">
              Hızlı Erişim & Yönetim Modülleri
            </h2>
            <span class="result-count">8 Modül</span>
          </div>

          <!-- Üst Temel Modüller: Kullanıcılar, Kütüphaneler, Ödünçler, Cezalar -->
          <div class="actions-grid">
            <NuxtLink to="/admin/users" class="action-card">
              <div class="action-icon">👥</div>
              <div>
                <h3>Kullanıcı Yönetimi</h3>
                <p>Kullanıcıları görüntüleyin, ekleyin ve kütüphane üyeliklerini yönetin.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/admin/libraries" class="action-card">
              <div class="action-icon">🏛️</div>
              <div>
                <h3>Kütüphane Yönetimi</h3>
                <p>Kütüphaneleri, şubeleri, üye listelerini ve kitap stoklarını yönetin.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/admin/loans" class="action-card">
              <div class="action-icon">📖</div>
              <div>
                <h3>Ödünç İşlemleri</h3>
                <p>Tüm ödünç kayıtlarını, iade sürelerini ve gecikmeleri takip edin.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/admin/fines" class="action-card">
              <div class="action-icon">⚠️</div>
              <div>
                <h3>Ceza Yönetimi</h3>
                <p>Ceza kayıtlarını görüntüleyin, detaylarını inceleyin ve ödeme onaylayın.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>
          </div>

          <!-- Alt Bölüm: Kitaplar ve Katalog (Kitaplar, Kategoriler, Yazarlar, Üyelik Planları) -->
          <div class="catalog-section-divider">
            <span>📚 Katalog & Kütüphane İçeriği</span>
          </div>

          <div class="actions-grid">
            <NuxtLink to="/admin/books" class="action-card highlight-card">
              <div class="action-icon">📚</div>
              <div>
                <h3>Kitap Yönetimi</h3>
                <p>Kitap kataloğunu yönetin, ISBN, yazar ve kategori eşleştirmelerini düzenleyin.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/admin/categories" class="action-card">
              <div class="action-icon">🏷️</div>
              <div>
                <h3>Kategoriler</h3>
                <p>Kitap kategorilerini düzenleyin, yeni kategoriler tanımlayın.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/admin/authors" class="action-card">
              <div class="action-icon">✍️</div>
              <div>
                <h3>Yazarlar</h3>
                <p>Kitap yazarlarını görüntüleyin, düzenleyin ve yeni yazarlar kaydedin.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/admin/membership-plans" class="action-card">
              <div class="action-icon">👤</div>
              <div>
                <h3>Üyelik Planları</h3>
                <p>Üyelik plan limitlerini, geçerlilik sürelerini ve fiyatlarını düzenleyin.</p>
              </div>
              <span class="arrow">→</span>
            </NuxtLink>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Library {
  id: string
  name: string
  address?: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

interface Book {
  id: string
  title: string
  isbn: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
}

interface Loan {
  id: string
  userId: string
  libraryBookId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status?: string
}

interface Fine {
  id: string
  loanId: string
  amount: number
  fineDate: string
  isPaid: boolean
}

interface UserLibrary {
  id: string
  userId: string
  libraryId: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

// Sol menüden (AdminSidebar) seçilen kütüphaneyi dinleyen composable
const {
  selectedLibraryId,
  selectedLibrary,
  libraries: composableLibraries,
  loadLibraries
} = useAdminLibrary()

const loading = ref(true)
const loadError = ref('')

// Veri listeleri
const allLibraries = ref<Library[]>([])
const allUsers = ref<User[]>([])
const allBooks = ref<Book[]>([])
const allAuthors = ref<any[]>([])
const allLibraryBooks = ref<LibraryBook[]>([])
const allLoans = ref<Loan[]>([])
const allFines = ref<Fine[]>([])
const allUserLibraries = ref<UserLibrary[]>([])

// Seçili Kütüphanenin LibraryBook ID'leri
const currentLibBooks = computed(() => {
  if (!selectedLibraryId.value) return []
  return allLibraryBooks.value.filter(lb => lb.libraryId === selectedLibraryId.value)
})

const currentLibLbIds = computed(() => {
  return new Set(currentLibBooks.value.map(lb => lb.id))
})

const currentLibTotalStock = computed(() => {
  return currentLibBooks.value.reduce((sum, lb) => sum + (lb.quantity || 0), 0)
})

// Seçili Kütüphanenin Üyeleri
const currentLibMembers = computed(() => {
  if (!selectedLibraryId.value) return []
  return allUserLibraries.value.filter(ul => ul.libraryId === selectedLibraryId.value)
})

// Seçili Kütüphanenin Ödünç Kayıtları
const currentLibLoans = computed(() => {
  if (!selectedLibraryId.value) return []
  return allLoans.value.filter(l => currentLibLbIds.value.has(l.libraryBookId))
})

const currentLibLoanIds = computed(() => {
  return new Set(currentLibLoans.value.map(l => l.id))
})

const currentLibActiveLoans = computed(() => {
  return currentLibLoans.value.filter(l => !l.returnDate)
})

const currentLibReturnedLoans = computed(() => {
  return currentLibLoans.value.filter(l => !!l.returnDate)
})

// Seçili Kütüphanenin Cezaları
const currentLibFines = computed(() => {
  if (!selectedLibraryId.value) return []
  return allFines.value.filter(f => currentLibLoanIds.value.has(f.loanId))
})

const currentLibUnpaidFines = computed(() => {
  return currentLibFines.value.filter(f => !f.isPaid)
})

const currentLibUnpaidAmount = computed(() => {
  return currentLibUnpaidFines.value.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
})

const currentLibTotalFineAmount = computed(() => {
  return currentLibFines.value.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
})

// Genel Sistem İstatistikleri
const globalActiveLoansCount = computed(() => {
  return allLoans.value.filter(l => !l.returnDate).length
})

const globalUnpaidFinesCount = computed(() => {
  return allFines.value.filter(f => !f.isPaid).length
})

// Yardımcı Fonksiyonlar
const getBookTitleByLbId = (lbId: string) => {
  const lb = allLibraryBooks.value.find(item => item.id === lbId)
  if (!lb) return 'Bilinmeyen Kitap'
  const book = allBooks.value.find(b => b.id === lb.bookId)
  return book ? book.title : 'Bilinmeyen Kitap'
}

const getUserName = (userId: string) => {
  const user = allUsers.value.find(u => u.id === userId)
  if (!user) return 'Kullanıcı'
  return `${user.firstName} ${user.lastName}`
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('tr-TR')
}

const isLoanOverdue = (loan: Loan) => {
  if (loan.returnDate) return false
  const due = new Date(loan.dueDate)
  return !isNaN(due.getTime()) && due < new Date()
}

// Veri Yükleme
const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [
      usersRes,
      librariesRes,
      booksRes,
      authorsRes,
      lbRes,
      loansRes,
      finesRes,
      userLibRes
    ] = await Promise.allSettled([
      apiFetch<User[]>('/api/User'),
      apiFetch<Library[]>('/api/Library'),
      apiFetch<Book[]>('/api/Book'),
      apiFetch<any[]>('/api/Author'),
      apiFetch<LibraryBook[]>('/api/LibraryBook'),
      apiFetch<Loan[]>('/api/Loan'),
      apiFetch<Fine[]>('/api/Fine'),
      apiFetch<UserLibrary[]>('/api/UserLibrary')
    ])

    if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
      allUsers.value = usersRes.value
    }
    if (librariesRes.status === 'fulfilled' && Array.isArray(librariesRes.value)) {
      allLibraries.value = librariesRes.value
    }
    if (booksRes.status === 'fulfilled' && Array.isArray(booksRes.value)) {
      allBooks.value = booksRes.value
    }
    if (authorsRes.status === 'fulfilled' && Array.isArray(authorsRes.value)) {
      allAuthors.value = authorsRes.value
    }
    if (lbRes.status === 'fulfilled' && Array.isArray(lbRes.value)) {
      allLibraryBooks.value = lbRes.value
    }
    if (loansRes.status === 'fulfilled' && Array.isArray(loansRes.value)) {
      allLoans.value = loansRes.value
    }
    if (finesRes.status === 'fulfilled' && Array.isArray(finesRes.value)) {
      allFines.value = finesRes.value
    }
    if (userLibRes.status === 'fulfilled' && Array.isArray(userLibRes.value)) {
      allUserLibraries.value = userLibRes.value
    }
  } catch (error) {
    console.error('Dashboard yükleme hatası:', error)
    loadError.value = 'Panel verileri yüklenirken bir sorun oluştu.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadLibraries()
  await loadData()
})
</script>

<style scoped>
/* Aktif Kütüphane Bilgi Şeridi */
.active-lib-banner {
  background: linear-gradient(135deg, #fffdfa 0%, #fbf3e9 100%);
  border: 1px solid #e7d5c3;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 4px 14px rgba(90, 59, 36, 0.04);
  flex-wrap: wrap;
}

.active-lib-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.active-badge {
  background: #efe0d0;
  color: #5d3f2a;
  border: 1px solid #dfc7b0;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.5px;
}

.active-name {
  color: #493122;
  font-size: 16px;
  font-weight: 750;
  display: block;
}

.active-address {
  color: #8c735d;
  font-size: 13px;
  display: block;
  margin-top: 2px;
}

.active-btn {
  background: #b96b35;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 750;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s;
  display: inline-block;
}

.active-btn:hover {
  background: #9d5624;
  transform: translateY(-1px);
}

.stat-sub {
  display: block;
  font-size: 11px;
  color: #9f836e;
  margin-top: 3px;
}

/* İkiye Bölünmüş Tablolar (Ödünç ve Ceza) */
.tables-split-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  margin-top: 24px;
}

.split-card {
  background: #fffdfa;
  border: 1px solid #e7d5c3;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(90, 59, 36, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.split-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebd9c8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #faf4ed;
}

.split-title {
  margin: 0;
  font-size: 15px;
  color: #493122;
  font-weight: 750;
}

.split-subtitle {
  font-size: 12px;
  color: #8c735d;
}

.view-all-link {
  color: #b96b35;
  text-decoration: none;
  font-size: 13px;
  font-weight: 750;
}

.split-body {
  padding: 12px 16px;
  overflow-x: auto;
  flex: 1;
}

.mini-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.mini-data-table th {
  text-align: left;
  padding: 10px 8px;
  color: #8c735d;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  border-bottom: 1px solid #ebd9c8;
}

.mini-data-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f3e8dd;
  color: #493122;
}

.mini-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 750;
}

.mini-badge.success {
  background: #eef8ee;
  color: #276a2b;
}

.mini-badge.danger {
  background: #fff0ee;
  color: #b93828;
}

.mini-badge.warning {
  background: #fff8e8;
  color: #a8721c;
}

.mini-badge.primary {
  background: #f1f0fd;
  color: #4a45a3;
}

.mini-link-btn {
  background: #efe0d0;
  color: #5d3f2a;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.empty-panel-text {
  padding: 32px 16px;
  text-align: center;
  color: #9f836e;
  font-size: 13px;
}

/* Katalog Bölümü Ayracı */
.catalog-section-divider {
  margin: 28px 0 16px;
  display: flex;
  align-items: center;
}

.catalog-section-divider span {
  background: #efe0d0;
  color: #5d3f2a;
  font-weight: 750;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 12px;
  border: 1px solid #e0c8b0;
}

.highlight-card {
  border-color: #dcbfa5;
  background: linear-gradient(135deg, #fffdfa 0%, #faefe4 100%);
}

@media (max-width: 900px) {
  .tables-split-grid {
    grid-template-columns: 1fr;
  }
}
</style>
