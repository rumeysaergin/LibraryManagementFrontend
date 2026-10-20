<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">CEZA VE ÖDEME YÖNETİMİ</span>
          <h1>Cezalar</h1>
          <p class="page-desc">Geciken kitap cezalarını görüntüleyin, ödeme durumlarını takip edin ve onaylayın.</p>
        </div>
        <div class="header-icon" aria-hidden="true">⚠️</div>
      </header>


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
          <input v-model="searchQuery" type="text" placeholder="Ceza ara..." />
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
          <span class="result-count">{{ filteredFines.length }} ceza kaydı</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Ödünç ID</th>
              <th>Tutar</th>
              <th>Ceza Tarihi</th>
              <th>Ödeme Durumu</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredFines.length === 0">
              <td colspan="5" class="empty-row">Ceza kaydı bulunamadı.</td>
            </tr>

            <tr v-for="fine in filteredFines" :key="fine.id">
              <td>
                <code class="id-code">{{ fine.loanId.slice(0, 8) }}...</code>
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
              <td>
                <div class="action-buttons">
                  <button
                    v-if="!fine.isPaid"
                    class="pay-btn"
                    :disabled="markingPaid === fine.id"
                    @click="markAsPaid(fine)"
                  >
                    {{ markingPaid === fine.id ? 'İşleniyor...' : '✓ Ödendi İşaretle' }}
                  </button>
                  <button class="delete-btn" @click="deleteFine(fine)">
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const fines = ref<Fine[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const paymentFilter = ref('')
const markingPaid = ref<string | null>(null)

const unpaidFines = computed(() => fines.value.filter(f => !f.isPaid))
const paidFines = computed(() => fines.value.filter(f => f.isPaid))
const totalAmount = computed(() => fines.value.reduce((sum, f) => sum + Number(f.amount), 0))
const unpaidAmount = computed(() => unpaidFines.value.reduce((sum, f) => sum + Number(f.amount), 0))

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('tr-TR')
}

const filteredFines = computed(() => {
  return fines.value.filter(fine => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch = !q || fine.loanId.toLowerCase().includes(q)
    let matchPay = true
    if (paymentFilter.value === 'paid') matchPay = fine.isPaid
    if (paymentFilter.value === 'unpaid') matchPay = !fine.isPaid
    return matchSearch && matchPay
  })
})

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await apiFetch<Fine[]>('/api/Fine')
    fines.value = Array.isArray(data) ? data : []
  }
  catch {
    loadError.value = 'Cezalar yüklenirken hata oluştu.'
  }
  finally {
    loading.value = false
  }
}

const markAsPaid = async (fine: Fine) => {
  markingPaid.value = fine.id
  try {
    await apiFetch(`/api/Fine/${fine.id}`, {
      method: 'PUT',
      body: {
        loanId: fine.loanId,
        amount: fine.amount,
        fineDate: fine.fineDate,
        isPaid: true
      }
    })
    await loadData()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Ceza ödeme işlemi sırasında hata oluştu.')
  }
  finally {
    markingPaid.value = null
  }
}

const deleteFine = async (fine: Fine) => {
  const confirmed = window.confirm('Bu ceza kaydını silmek istediğinize emin misiniz?')
  if (!confirmed) return
  try {
    await apiFetch(`/api/Fine/${fine.id}`, { method: 'DELETE' })
    await loadData()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Ceza silinirken hata oluştu.')
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadData()
})

</script>


<style scoped>
@import "../../../styles/admin.css";

.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
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

.unpaid-total {
  border-color: #e5c3b9;
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
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr auto;
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

.id-code {
  font-family: monospace;
  font-size: 12px;
  background: #f5e6d5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #7c4b2c;
}

.amount-paid {
  color: #2e7d32;
}

.amount-unpaid {
  color: #a84d3d;
}

.pay-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
  border-radius: 7px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.pay-btn:hover:not(:disabled) {
  background: #c8e6c9;
}

.pay-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
