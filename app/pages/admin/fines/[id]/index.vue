<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <!-- Geri Dön Linki -->
      <NuxtLink to="/admin/fines" class="back-link">
        ← Ceza Listesine Dön
      </NuxtLink>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Ceza ve ilişkili ödünç detayları yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadFineDetails">Tekrar Dene</button>
      </div>

      <!-- Detay İçeriği -->
      <div v-else-if="fine">
        <!-- Başlık -->
        <header class="page-header">
          <div class="header-content">
            <span class="page-eyebrow">CEZA DETAYI</span>
            <h1>Ceza Tutarı: {{ Number(fine.amount).toFixed(2) }} ₺</h1>
            <p class="page-desc">
              Kayıt ID: <code>{{ fine.id }}</code> • Düzenlenme: {{ formatDate(fine.fineDate) }}
            </p>
          </div>
          <div class="header-right-actions">
            <span :class="fine.isPaid ? 'paid-badge-lg' : 'unpaid-badge-lg'">
              {{ fine.isPaid ? '✓ Ödendi' : '⚠️ Ödenmedi' }}
            </span>
            <div class="header-icon" aria-hidden="true">⚠️</div>
          </div>
        </header>

        <div v-if="actionSuccess" class="msg success">✓ {{ actionSuccess }}</div>
        <div v-if="actionError" class="msg error">⚠️ {{ actionError }}</div>

        <!-- Ceza Özeti & Hızlı İşlemler Kartı -->
        <div class="fine-overview-grid">
          <div class="overview-box">
            <span class="box-label">Ceza Durumu</span>
            <div class="box-value-row">
              <strong :class="fine.isPaid ? 'text-success' : 'text-danger'">
                {{ fine.isPaid ? 'Tahsil Edildi' : 'Bekleyen Borç' }}
              </strong>
            </div>
          </div>

          <div class="overview-box">
            <span class="box-label">Toplam Tutar</span>
            <div class="box-value-row">
              <strong class="large-amount">{{ Number(fine.amount).toFixed(2) }} ₺</strong>
            </div>
          </div>

          <div class="overview-box">
            <span class="box-label">Ceza Kesilme Tarihi</span>
            <div class="box-value-row">
              <span>{{ formatDate(fine.fineDate) }}</span>
            </div>
          </div>

          <div class="overview-box actions-box">
            <span class="box-label">İşlemler (Modal Destekli)</span>
            <div class="box-btns">
              <button
                v-if="!fine.isPaid"
                class="pay-btn"
                @click="openPayModal"
              >
                ✓ Ödeme Al / Onayla
              </button>
              <button
                class="edit-btn"
                @click="openEditAmountModal"
              >
                ✏️ Tutarı Güncelle
              </button>
              <button
                class="delete-btn"
                @click="openDeleteModal"
              >
                🗑️ Cezayı Sil
              </button>
            </div>
          </div>
        </div>

        <!-- İki Sütunlu Detay Paneli: Sol: Ödünç & Kitap & Kütüphane, Sağ: Kullanıcı & Ödeme -->
        <div class="detail-columns-grid">
          <!-- Sol Sütun: Ödünç ve Kitap Bilgileri -->
          <div class="detail-card">
            <div class="card-head">
              <h3>📖 İlişkili Ödünç & Kitap Bilgileri</h3>
              <span class="tag-badge">Ödünç Kaydı</span>
            </div>

            <div v-if="loan" class="info-list">
              <div class="info-item">
                <span class="item-label">Kitap Adı:</span>
                <span class="item-value">
                  <strong>{{ book ? book.title : 'Bilinmeyen Kitap' }}</strong>
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">ISBN:</span>
                <span class="item-value">
                  <code class="isbn-code">{{ book?.isbn || '—' }}</code>
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">Kütüphane:</span>
                <span class="item-value">
                  🏛️ <strong>{{ library ? library.name : 'Bilinmeyen Kütüphane' }}</strong>
                  <span v-if="library?.address" class="address-sub">({{ library.address }})</span>
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">Ödünç Alma Tarihi:</span>
                <span class="item-value">{{ formatDate(loan.borrowDate) }}</span>
              </div>

              <div class="info-item">
                <span class="item-label">Son İade Tarihi (Son Gün):</span>
                <span class="item-value" :class="{ 'text-danger': !loan.returnDate && isOverdue(loan) }">
                  {{ formatDate(loan.dueDate) }}
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">Gerçekleşen İade Tarihi:</span>
                <span class="item-value">
                  {{ loan.returnDate ? formatDate(loan.returnDate) : 'Henüz İade Edilmedi' }}
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">Ödünç Durumu:</span>
                <span class="item-value">
                  <span v-if="loan.returnDate" class="mini-badge success">İade Edildi</span>
                  <span v-else-if="isOverdue(loan)" class="mini-badge danger">Gecikmede</span>
                  <span v-else class="mini-badge primary">Aktif</span>
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">Ödünç ID:</span>
                <span class="item-value">
                  <code>{{ loan.id }}</code>
                </span>
              </div>
            </div>
            <div v-else class="empty-text">
              Bu cezaya ait ödünç kaydı bulunamadı (Ödünç ID: {{ fine.loanId }}).
            </div>
          </div>

          <!-- Sağ Sütun: Kullanıcı & Ödeme Kaydı -->
          <div class="detail-card">
            <div class="card-head">
              <h3>👤 Kullanıcı & Ödeme Geçmişi</h3>
              <span class="tag-badge">Üye Bilgisi</span>
            </div>

            <!-- Kullanıcı Bilgisi -->
            <div v-if="user" class="info-list">
              <div class="info-item">
                <span class="item-label">Ad Soyad:</span>
                <span class="item-value">
                  <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">E-posta:</span>
                <span class="item-value">{{ user.email }}</span>
              </div>

              <div class="info-item">
                <span class="item-label">Rol:</span>
                <span class="item-value">
                  <span class="role-badge" :class="user.role === 'Admin' ? 'admin-badge' : 'user-badge'">
                    {{ user.role || 'User' }}
                  </span>
                </span>
              </div>

              <div class="info-item">
                <span class="item-label">Kullanıcı ID:</span>
                <span class="item-value">
                  <code>{{ user.id }}</code>
                </span>
              </div>
            </div>
            <div v-else class="empty-text">
              Kullanıcı bilgisi yüklenemedi.
            </div>

            <!-- Ödeme Kayıtları -->
            <div class="sub-section-title">
              💳 Ödeme Kayıtları
            </div>

            <div v-if="payments.length > 0" class="payments-list">
              <div v-for="p in payments" :key="p.id" class="payment-item">
                <div>
                  <strong>{{ Number(p.amount).toFixed(2) }} ₺</strong>
                  <span class="payment-date">({{ formatDate(p.paymentDate) }})</span>
                </div>
                <span class="mini-badge success">Tahsil Edildi</span>
              </div>
            </div>
            <div v-else class="empty-text">
              {{ fine.isPaid ? 'Doğrudan ödendi olarak işaretlenmiş.' : 'Henüz ödeme yapılmamış.' }}
            </div>
          </div>
        </div>
      </div>

      <!-- ==============================================
           MODALLAR
           ============================================== -->
      <!-- 1. Ödeme Onay Modalı -->
      <AdminModal
        v-model="showPayModal"
        title="Ceza Ödemesini Onayla"
        subtitle="Bu ceza kaydını ödendi durumuna geçirmek üzeresiniz."
        icon="💳"
      >
        <div class="modal-form">
          <p>
            <strong>{{ Number(fine?.amount).toFixed(2) }} ₺</strong> tutarındaki cezanın ödendiğini onaylıyor musunuz?
          </p>
          <div v-if="actionError" class="msg error">⚠️ {{ actionError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showPayModal = false">Vazgeç</button>
            <button
              type="button"
              class="submit-btn"
              :disabled="actionLoading"
              @click="confirmMarkAsPaid"
            >
              {{ actionLoading ? 'İşleniyor...' : '✓ Ödendi Olarak Kaydet' }}
            </button>
          </div>
        </div>
      </AdminModal>

      <!-- 2. Ceza Tutarı Güncelleme Modalı -->
      <AdminModal
        v-model="showEditModal"
        title="Ceza Tutarını Düzenle"
        subtitle="Cezanın tutarını ve ödeme durumunu güncelleyin."
        icon="✏️"
      >
        <form class="modal-form" @submit.prevent="confirmUpdateAmount">
          <div class="form-group">
            <label>Yeni Ceza Tutarı (₺)</label>
            <input
              v-model.number="editAmount"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label>Ödeme Durumu</label>
            <select v-model="editIsPaid">
              <option :value="false">⚠️ Ödenmedi</option>
              <option :value="true">✓ Ödendi</option>
            </select>
          </div>

          <div v-if="actionError" class="msg error">⚠️ {{ actionError }}</div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showEditModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="actionLoading">
              {{ actionLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- 3. Ceza Silme Modalı -->
      <AdminModal
        v-model="showDeleteModal"
        title="Cezayı Sil"
        subtitle="Bu ceza kaydını kalıcı olarak silmek istediğinizden emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p style="color: #b93828;">
            ⚠️ Bu işlem geri alınamaz! <strong>{{ Number(fine?.amount).toFixed(2) }} ₺</strong> tutarındaki ceza kaydı sistemden silinecektir.
          </p>
          <div v-if="actionError" class="msg error">⚠️ {{ actionError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="actionLoading"
              @click="confirmDeleteFine"
            >
              {{ actionLoading ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil' }}
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
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status?: string
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

interface Library {
  id: string
  name: string
  address?: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
}

const route = useRoute()
const router = useRouter()
const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const fineId = computed(() => route.params.id as string)

const fine = ref<Fine | null>(null)
const loan = ref<Loan | null>(null)
const user = ref<User | null>(null)
const book = ref<Book | null>(null)
const library = ref<Library | null>(null)
const payments = ref<any[]>([])

const loading = ref(true)
const loadError = ref('')
const actionLoading = ref(false)
const actionError = ref('')
const actionSuccess = ref('')

// Modal durumları
const showPayModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const editAmount = ref(0)
const editIsPaid = ref(false)

const isOverdue = (l: Loan) => {
  if (l.returnDate) return false
  const due = new Date(l.dueDate)
  return !isNaN(due.getTime()) && due < new Date()
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Ceza ve tüm ilişkili verileri yükle
const loadFineDetails = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const fineData = await apiFetch<Fine>(`/api/Fine/${fineId.value}`)
    fine.value = fineData
    editAmount.value = fineData.amount
    editIsPaid.value = fineData.isPaid

    if (fineData.loanId) {
      try {
        const loanData = await apiFetch<Loan>(`/api/Loan/${fineData.loanId}`)
        loan.value = loanData

        // Kullanıcı bilgisi
        if (loanData.userId) {
          try {
            user.value = await apiFetch<User>(`/api/User/${loanData.userId}`)
          } catch (e) {
            console.error('Kullanıcı yüklenemedi:', e)
          }
        }

        // LibraryBook bilgisi
        if (loanData.libraryBookId) {
          try {
            const lb = await apiFetch<LibraryBook>(`/api/LibraryBook/${loanData.libraryBookId}`)
            if (lb.bookId) {
              book.value = await apiFetch<Book>(`/api/Book/${lb.bookId}`)
            }
            if (lb.libraryId) {
              library.value = await apiFetch<Library>(`/api/Library/${lb.libraryId}`)
            }
          } catch (e) {
            console.error('Kitap veya Kütüphane yüklenemedi:', e)
          }
        }
      } catch (e) {
        console.error('Ödünç kaydı yüklenemedi:', e)
      }
    }

    // Ödemeler
    try {
      const allPayments = await apiFetch<any[]>('/api/FinePayment')
      if (Array.isArray(allPayments)) {
        payments.value = allPayments.filter(p => p.fineId === fineId.value)
      }
    } catch {
      // Ödeme tablosu boş olabilir
    }
  } catch (error) {
    console.error('Ceza detayları yüklenemedi:', error)
    loadError.value = 'Ceza detay bilgileri yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

// Modalları Açma
const openPayModal = () => {
  actionError.value = ''
  actionSuccess.value = ''
  showPayModal.value = true
}

const openEditAmountModal = () => {
  if (!fine.value) return
  actionError.value = ''
  actionSuccess.value = ''
  editAmount.value = fine.value.amount
  editIsPaid.value = fine.value.isPaid
  showEditModal.value = true
}

const openDeleteModal = () => {
  actionError.value = ''
  actionSuccess.value = ''
  showDeleteModal.value = true
}

// 1. Ödeme Onayla
const confirmMarkAsPaid = async () => {
  if (!fine.value) return
  actionLoading.value = true
  actionError.value = ''
  try {
    await apiFetch(`/api/Fine/${fine.value.id}`, {
      method: 'PUT',
      body: {
        loanId: fine.value.loanId,
        amount: fine.value.amount,
        fineDate: fine.value.fineDate,
        isPaid: true
      }
    })
    fine.value.isPaid = true
    showPayModal.value = false
    actionSuccess.value = 'Ceza başarıyla ödendi olarak güncellendi.'
  } catch (error) {
    console.error('Ödeme onaylama hatası:', error)
    actionError.value = 'Ödeme durumu güncellenirken hata oluştu.'
  } finally {
    actionLoading.value = false
  }
}

// 2. Tutar ve Durum Güncelle
const confirmUpdateAmount = async () => {
  if (!fine.value) return
  actionLoading.value = true
  actionError.value = ''
  try {
    await apiFetch(`/api/Fine/${fine.value.id}`, {
      method: 'PUT',
      body: {
        loanId: fine.value.loanId,
        amount: editAmount.value,
        fineDate: fine.value.fineDate,
        isPaid: editIsPaid.value
      }
    })
    fine.value.amount = editAmount.value
    fine.value.isPaid = editIsPaid.value
    showEditModal.value = false
    actionSuccess.value = 'Ceza bilgileri başarıyla güncellendi.'
  } catch (error) {
    console.error('Ceza güncelleme hatası:', error)
    actionError.value = 'Ceza bilgileri güncellenirken hata oluştu.'
  } finally {
    actionLoading.value = false
  }
}

// 3. Cezayı Sil
const confirmDeleteFine = async () => {
  if (!fine.value) return
  actionLoading.value = true
  actionError.value = ''
  try {
    await apiFetch(`/api/Fine/${fine.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    router.push('/admin/fines')
  } catch (error) {
    console.error('Ceza silme hatası:', error)
    actionError.value = 'Ceza kaydı silinirken hata oluştu.'
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadFineDetails()
})
</script>

<style scoped>


.header-right-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
}

.paid-badge-lg {
  background: #eef8ee;
  color: #276a2b;
  border: 1px solid #c6e6c6;
  font-weight: 750;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
}

.unpaid-badge-lg {
  background: #fff3f0;
  color: #a84d3d;
  border: 1px solid #f2c7bd;
  font-weight: 750;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
}

/* Ceza Özeti */
.fine-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.overview-box {
  background: #fffdfa;
  border: 1px solid #e7d5c3;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 4px 14px rgba(90, 59, 36, 0.04);
}

.overview-box.actions-box {
  grid-column: span 1;
}

.box-label {
  display: block;
  font-size: 12px;
  color: #8c735d;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.large-amount {
  font-size: 24px;
  color: #493122;
}

.text-success {
  color: #276a2b;
  font-size: 16px;
}

.text-danger {
  color: #b93828;
  font-size: 16px;
}

.box-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Detay Sütunları */
.detail-columns-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}

.detail-card {
  background: #fffdfa;
  border: 1px solid #e7d5c3;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(90, 59, 36, 0.04);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebd9c8;
  margin-bottom: 20px;
}

.card-head h3 {
  margin: 0;
  font-size: 17px;
  color: #493122;
  font-weight: 750;
}

.tag-badge {
  background: #efe0d0;
  color: #5d3f2a;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 10px;
  border-bottom: 1px dashed #f0e3d6;
  font-size: 14px;
}

.info-item:last-child {
  border-bottom: none;
}

.item-label {
  color: #8c735d;
  font-weight: 600;
  width: 150px;
  flex-shrink: 0;
}

.item-value {
  color: #493122;
  text-align: right;
  flex: 1;
}

.address-sub {
  display: block;
  font-size: 12px;
  color: #8c735d;
}

.sub-section-title {
  margin: 24px 0 12px;
  font-weight: 750;
  font-size: 14px;
  color: #493122;
  border-top: 1px solid #ebd9c8;
  padding-top: 16px;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fbf5ee;
  border: 1px solid #eadecf;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
}

.payment-date {
  color: #8c735d;
  font-size: 12px;
  margin-left: 6px;
}

.empty-text {
  color: #9f836e;
  font-size: 13px;
  padding: 16px 0;
}

.mini-badge {
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

.mini-badge.primary {
  background: #f1f0fd;
  color: #4a45a3;
}

@media (max-width: 900px) {
  .fine-overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .detail-columns-grid {
    grid-template-columns: 1fr;
  }
}
</style>
