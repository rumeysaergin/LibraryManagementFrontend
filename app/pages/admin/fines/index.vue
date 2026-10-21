<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">
            {{ selectedLibrary ? `SEÇİLİ KÜTÜPHANE: ${selectedLibrary.name}` : 'CEZA VE ÖDEME YÖNETİMİ' }}
          </span>
          <h1>{{ selectedLibrary ? `${selectedLibrary.name} Cezaları` : 'Cezalar' }}</h1>
          <p class="page-desc">
            {{
              selectedLibrary
                ? `Yalnızca ${selectedLibrary.name} bünyesindeki ödünçlerden kaynaklanan cezalar görüntüleniyor.`
                : 'Geciken kitap cezalarını görüntüleyin, satıra basarak ceza detay sayfasına gidin ve ödemeleri onaylayın.'
            }}
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="openAddModal">
            + Yeni Ceza Tanımla
          </button>
          <div class="header-icon" aria-hidden="true">⚠️</div>
        </div>
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
          <span class="pill-icon">⚠️</span>
          <div>
            <span class="pill-label">Ödenmemiş</span>
            <strong>{{ unpaidFines.length }}</strong>
          </div>
        </div>
        <div class="stat-pill">
          <span class="pill-icon">✓</span>
          <div>
            <span class="pill-label">Ödenmiş</span>
            <strong>{{ paidFines.length }}</strong>
          </div>
        </div>
        <div class="stat-pill">
          <span class="pill-icon">💰</span>
          <div>
            <span class="pill-label">Toplam Tutar</span>
            <strong>{{ totalAmount.toFixed(2) }} ₺</strong>
          </div>
        </div>
        <div class="stat-pill unpaid-total">
          <span class="pill-icon">📋</span>
          <div>
            <span class="pill-label">Bekleyen Tutar</span>
            <strong>{{ unpaidAmount.toFixed(2) }} ₺</strong>
          </div>
        </div>
      </div>

      <!-- Filtre -->
      <div class="filters-row">
        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input v-model="searchQuery" type="text" placeholder="Ceza ID veya Ödünç ID ile ara..." />
        </div>
        <select v-model="paymentFilter" class="filter-select">
          <option value="">Tüm Cezalar</option>
          <option value="unpaid">Ödenmemiş</option>
          <option value="paid">Ödenmiş</option>
        </select>
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Cezalar yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">Tekrar Dene</button>
      </div>

      <!-- Tablo -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">{{ filteredFines.length }} ceza kaydı (Detay için satıra veya butona tıklayın)</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Ceza ID</th>
              <th>Ödünç ID</th>
              <th>Tutar</th>
              <th>Ceza Tarihi</th>
              <th>Ödeme Durumu</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredFines.length === 0">
              <td colspan="6" class="empty-row">Ceza kaydı bulunamadı.</td>
            </tr>

            <tr
              v-for="fine in filteredFines"
              :key="fine.id"
              class="clickable-row"
              @click="goToDetail(fine.id)"
            >
              <td>
                <code class="id-code" :title="fine.id">{{ fine.id.slice(0, 8) }}...</code>
              </td>
              <td>
                <code class="id-code" :title="fine.loanId">{{ fine.loanId ? fine.loanId.slice(0, 8) + '...' : '—' }}</code>
              </td>
              <td>
                <strong :class="fine.isPaid ? 'amount-paid' : 'amount-unpaid'">
                  {{ Number(fine.amount).toFixed(2) }} ₺
                </strong>
              </td>
              <td>{{ formatDate(fine.fineDate) }}</td>
              <td>
                <span v-if="fine.isPaid" class="paid-badge">✓ Ödendi</span>
                <span v-else class="unpaid-badge">⚠️ Ödenmedi</span>
              </td>
              <td @click.stop>
                <div class="action-buttons">
                  <NuxtLink :to="`/admin/fines/${fine.id}`" class="edit-btn">
                    🔍 Detay
                  </NuxtLink>
                  <button
                    v-if="!fine.isPaid"
                    class="pay-btn"
                    :disabled="markingPaid === fine.id"
                    @click.stop="openPayModal(fine)"
                  >
                    ✓ Ödendi Yap
                  </button>
                  <button class="delete-btn" @click.stop="openDeleteModal(fine)">
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ==============================================
           MODALLAR
           ============================================== -->
      <!-- 1. Yeni Ceza Modalı -->
      <AdminModal
        v-model="showAddModal"
        title="Yeni Ceza Kaydı Ekle"
        subtitle="Bir ödünç işlemine bağlı ceza kaydı oluşturun."
        icon="⚠️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="createFine">
          <div class="form-group">
            <label>Ödünç Seçin (Loan ID)</label>
            <select v-model="newFine.loanId" required>
              <option value="">Ödünç Seçin</option>
              <option v-for="loan in loans" :key="loan.id" :value="loan.id">
                {{ loan.id.slice(0, 8) }} - {{ loan.bookTitle || 'Kitap' }} ({{ loan.userName || 'Kullanıcı' }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Ceza Tutarı (₺)</label>
            <input
              v-model.number="newFine.amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Örn: 25.00"
              required
            />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Cezayı Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- 2. Ödeme Onay Modalı -->
      <AdminModal
        v-model="showPayModal"
        title="Ödeme Onayı"
        subtitle="Ceza kaydını ödendi durumuna geçirmek üzeresiniz."
        icon="💳"
      >
        <div class="modal-form">
          <p v-if="selectedFine">
            <strong>{{ Number(selectedFine.amount).toFixed(2) }} ₺</strong> tutarındaki cezanın ödendiğini onaylıyor musunuz?
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showPayModal = false">Vazgeç</button>
            <button
              type="button"
              class="submit-btn"
              :disabled="modalLoading"
              @click="confirmMarkAsPaid"
            >
              {{ modalLoading ? 'İşleniyor...' : '✓ Ödendi Olarak Kaydet' }}
            </button>
          </div>
        </div>
      </AdminModal>

      <!-- 3. Ceza Silme Modalı -->
      <AdminModal
        v-model="showDeleteModal"
        title="Cezayı Sil"
        subtitle="Bu ceza kaydını kalıcı olarak silmek istediğinizden emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="selectedFine" style="color: #b93828;">
            ⚠️ <strong>{{ Number(selectedFine.amount).toFixed(2) }} ₺</strong> tutarındaki ceza kaydı silinecektir.
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeleteFine"
            >
              {{ modalLoading ? 'Siliniyor...' : 'Evet, Sil' }}
            </button>
          </div>
        </div>
      </AdminModal>

    </main>

  </div>
</template>

<script setup lang="ts">
interface Fine {
  id: string
  loanId: string
  amount: number
  fineDate: string
  isPaid: boolean
}

interface Loan {
  id: string
  userId: string
  libraryBookId: string
  libraryId?: string
  bookTitle?: string
  userName?: string
}

const router = useRouter()
const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()
const { selectedLibraryId, selectedLibrary, setLibraryId } = useAdminLibrary()

const fines = ref<Fine[]>([])
const loans = ref<Loan[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const paymentFilter = ref('')
const markingPaid = ref<string | null>(null)

// Modal durumları
const showAddModal = ref(false)
const showPayModal = ref(false)
const showDeleteModal = ref(false)
const selectedFine = ref<Fine | null>(null)
const modalLoading = ref(false)
const modalError = ref('')

const newFine = ref({
  loanId: '',
  amount: 0
})

// Sol menüden kütüphane seçilmişse o kütüphaneye ait ödünçlerin ID'leri
const scopedLoanIds = computed(() => {
  if (!selectedLibraryId.value) return null
  const ids = new Set<string>()
  loans.value.forEach(l => {
    if (l.libraryId === selectedLibraryId.value) {
      ids.add(l.id)
    }
  })
  return ids
})

// Sol menüden kütüphane seçilmişse cezaları o kütüphaneye filtrele
const scopedFines = computed(() => {
  if (!scopedLoanIds.value) return fines.value
  return fines.value.filter(f => scopedLoanIds.value!.has(f.loanId))
})

const unpaidFines = computed(() => scopedFines.value.filter(f => !f.isPaid))
const paidFines = computed(() => scopedFines.value.filter(f => f.isPaid))

const totalAmount = computed(() =>
  scopedFines.value.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
)

const unpaidAmount = computed(() =>
  unpaidFines.value.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
)

const filteredFines = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return scopedFines.value
    .filter(f => {
      const matchSearch =
        !q ||
        f.id.toLowerCase().includes(q) ||
        (f.loanId && f.loanId.toLowerCase().includes(q))
      const matchPayment =
        !paymentFilter.value ||
        (paymentFilter.value === 'paid' && f.isPaid) ||
        (paymentFilter.value === 'unpaid' && !f.isPaid)
      return matchSearch && matchPayment
    })
    .sort((a, b) => new Date(b.fineDate).getTime() - new Date(a.fineDate).getTime())
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('tr-TR')
}

// Satıra basınca detay sayfasına yönlendirme (3. İstek)
const goToDetail = (fineId: string) => {
  router.push(`/admin/fines/${fineId}`)
}

const openAddModal = () => {
  newFine.value = { loanId: '', amount: 0 }
  modalError.value = ''
  showAddModal.value = true
}

const openPayModal = (fine: Fine) => {
  selectedFine.value = fine
  modalError.value = ''
  showPayModal.value = true
}

const openDeleteModal = (fine: Fine) => {
  selectedFine.value = fine
  modalError.value = ''
  showDeleteModal.value = true
}

const createFine = async () => {
  if (!newFine.value.loanId || newFine.value.amount <= 0) {
    modalError.value = 'Lütfen geçerli bir ödünç ve tutar seçin.'
    return
  }
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/Fine', {
      method: 'POST',
      body: {
        loanId: newFine.value.loanId,
        amount: newFine.value.amount
      }
    })
    showAddModal.value = false
    await loadData()
  } catch (error: any) {
    console.error('Ceza ekleme hatası:', error)
    modalError.value = error?.data?.message || 'Ceza oluşturulurken bir hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

const confirmMarkAsPaid = async () => {
  if (!selectedFine.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Fine/${selectedFine.value.id}`, {
      method: 'PUT',
      body: {
        loanId: selectedFine.value.loanId,
        amount: selectedFine.value.amount,
        fineDate: selectedFine.value.fineDate,
        isPaid: true
      }
    })
    selectedFine.value.isPaid = true
    showPayModal.value = false
  } catch (error) {
    console.error('Ödeme onaylama hatası:', error)
    modalError.value = 'Ödeme durumu güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

const confirmDeleteFine = async () => {
  if (!selectedFine.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Fine/${selectedFine.value.id}`, {
      method: 'DELETE'
    })
    fines.value = fines.value.filter(f => f.id !== selectedFine.value!.id)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Ceza silme hatası:', error)
    modalError.value = 'Ceza kaydı silinirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [finesRes, loansRes, booksRes, usersRes, lbsRes] = await Promise.allSettled([
      apiFetch<Fine[]>('/api/Fine'),
      apiFetch<Loan[]>('/api/Loan'),
      apiFetch<any[]>('/api/Book'),
      apiFetch<any[]>('/api/User'),
      apiFetch<any[]>('/api/LibraryBook')
    ])

    if (finesRes.status === 'fulfilled' && Array.isArray(finesRes.value)) {
      fines.value = finesRes.value
    }

    if (loansRes.status === 'fulfilled' && Array.isArray(loansRes.value)) {
      const booksMap = new Map((booksRes.status === 'fulfilled' && Array.isArray(booksRes.value)) ? booksRes.value.map(b => [b.id, b.title]) : [])
      const usersMap = new Map((usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) ? usersRes.value.map(u => [u.id, `${u.firstName} ${u.lastName}`]) : [])
      const lbMap = new Map((lbsRes.status === 'fulfilled' && Array.isArray(lbsRes.value)) ? lbsRes.value.map(lb => [lb.id, lb]) : [])

      loans.value = loansRes.value.map(l => {
        const lb = lbMap.get(l.libraryBookId)
        return {
          ...l,
          libraryId: lb?.libraryId,
          bookTitle: lb?.bookId ? booksMap.get(lb.bookId) : 'Kitap',
          userName: usersMap.get(l.userId) || 'Kullanıcı'
        }
      })
    }
  } catch (error) {
    console.error('Cezalar yüklenirken hata:', error)
    loadError.value = 'Ceza verileri yüklenirken bir hata oluştu.'
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #fffdfa;
  border: 1px solid #e7d5c3;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(90, 59, 36, 0.04);
}

.stat-pill.unpaid-total {
  background: #fff9f7;
  border-color: #f0c9bf;
}

.pill-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.pill-label {
  display: block;
  font-size: 12px;
  color: #8c735d;
  font-weight: 700;
  text-transform: uppercase;
}

.stat-pill strong {
  display: block;
  font-size: 20px;
  color: #493122;
  margin-top: 2px;
}

.id-code {
  font-family: monospace;
  font-size: 12px;
  background: #f0e1d2;
  color: #5d3f2a;
  padding: 2px 7px;
  border-radius: 6px;
}

.amount-paid {
  color: #276a2b;
  font-size: 15px;
}

.amount-unpaid {
  color: #a84d3d;
  font-size: 15px;
}

.paid-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background: #eef8ee;
  color: #276a2b;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #c6e6c6;
}

.unpaid-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background: #fff3f0;
  color: #a84d3d;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #f2c7bd;
}

.pay-btn {
  background: #2e7d32;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-btn:hover:not(:disabled) {
  background: #256628;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: #faf2ea !important;
}

@media (max-width: 900px) {
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
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
