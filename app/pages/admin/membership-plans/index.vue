<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">ÜYELİK YÖNETİMİ</span>
          <h1>Üyelik Planları</h1>
          <p class="page-desc">Kütüphane üyelik planlarını, ödünç alma limitlerini ve ücretlendirmeleri yönetin. Tüm ekleme ve düzenleme işlemlerini modal üzerinden gerçekleştirin.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="openAddPlanModal">
            + Yeni Plan Ekle
          </button>
          <div class="header-icon" aria-hidden="true">👤</div>
        </div>
      </header>

      <!-- Bildirim mesajları -->
      <div v-if="pageSuccess" class="msg success">✓ {{ pageSuccess }}</div>
      <div v-if="pageError" class="msg error">⚠️ {{ pageError }}</div>

      <!-- Arama -->
      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input v-model="searchQuery" type="text" placeholder="Plan adı ile ara..." />
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Üyelik planları yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadPlans">Tekrar Dene</button>
      </div>

      <!-- Tablo -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">{{ filteredPlans.length }} plan</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Plan Adı</th>
              <th>Ödünç Limiti</th>
              <th>Ücret</th>
              <th>Geçerlilik Süresi</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredPlans.length === 0">
              <td colspan="5" class="empty-row">Üyelik planı bulunamadı.</td>
            </tr>

            <tr v-for="plan in filteredPlans" :key="plan.id">
              <td>
                <div class="plan-name-cell">
                  <span class="plan-icon">👤</span>
                  <strong>{{ plan.name }}</strong>
                </div>
              </td>
              <td>
                <span class="limit-badge">{{ plan.maxBorrowLimit }} Kitap</span>
              </td>
              <td>
                <strong class="price-text">{{ Number(plan.price).toFixed(2) }} ₺</strong>
              </td>
              <td>{{ plan.durationInDays }} Gün</td>
              <td>
                <div class="action-buttons">
                  <button class="edit-btn" @click="openEditPlanModal(plan)">
                    ✏️ Düzenle
                  </button>
                  <button class="delete-btn" @click="openDeletePlanModal(plan)">
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ==============================================
           MODAL 1: YENİ PLAN EKLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showAddModal"
        title="Yeni Üyelik Planı Ekle"
        subtitle="Kütüphane kullanıcıları için yeni bir abonelik/üyelik planı oluşturun."
        icon="👤"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="addPlan">
          <div class="form-group">
            <label>Plan Adı</label>
            <input v-model="formData.name" type="text" placeholder="Örn: Standart Plan, Öğrenci Planı" required />
          </div>

          <div class="form-group">
            <label>Maksimum Ödünç Limiti (Kitap Sayısı)</label>
            <input v-model.number="formData.maxBorrowLimit" type="number" min="1" required />
          </div>

          <div class="form-group">
            <label>Ücret (₺)</label>
            <input v-model.number="formData.price" type="number" min="0" step="0.01" required />
          </div>

          <div class="form-group">
            <label>Geçerlilik Süresi (Gün)</label>
            <input v-model.number="formData.durationInDays" type="number" min="1" required />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Planı Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 2: PLAN DÜZENLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showEditModal"
        title="Üyelik Planını Düzenle"
        subtitle="Plan limitlerini, fiyatını ve geçerlilik süresini güncelleyin."
        icon="✏️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updatePlan">
          <div class="form-group">
            <label>Plan Adı</label>
            <input v-model="editFormData.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Maksimum Ödünç Limiti (Kitap Sayısı)</label>
            <input v-model.number="editFormData.maxBorrowLimit" type="number" min="1" required />
          </div>

          <div class="form-group">
            <label>Ücret (₺)</label>
            <input v-model.number="editFormData.price" type="number" min="0" step="0.01" required />
          </div>

          <div class="form-group">
            <label>Geçerlilik Süresi (Gün)</label>
            <input v-model.number="editFormData.durationInDays" type="number" min="1" required />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showEditModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 3: PLAN SİLME MODALI
           ============================================== -->
      <AdminModal
        v-model="showDeleteModal"
        title="Üyelik Planını Sil"
        subtitle="Bu üyelik planını sistemden silmek istediğinize emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="targetPlan" style="color: #b93828;">
            ⚠️ <strong>{{ targetPlan.name }}</strong> adlı plan silinecektir.
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeletePlan"
            >
              {{ modalLoading ? 'Siliniyor...' : 'Evet, Planı Sil' }}
            </button>
          </div>
        </div>
      </AdminModal>

    </main>

  </div>
</template>

<script setup lang="ts">
interface MembershipPlan {
  id: string
  name: string
  maxBorrowLimit: number
  price: number
  durationInDays: number
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const plans = ref<MembershipPlan[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')

const pageSuccess = ref('')
const pageError = ref('')

// Modal States
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const modalLoading = ref(false)
const modalError = ref('')

const formData = ref({
  name: '',
  maxBorrowLimit: 3,
  price: 0,
  durationInDays: 30
})

const editFormData = ref({
  id: '',
  name: '',
  maxBorrowLimit: 3,
  price: 0,
  durationInDays: 30
})

const targetPlan = ref<MembershipPlan | null>(null)

const filteredPlans = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return plans.value
  return plans.value.filter(p => p.name.toLowerCase().includes(q))
})

// Modal Açıcılar
const openAddPlanModal = () => {
  formData.value = {
    name: '',
    maxBorrowLimit: 3,
    price: 0,
    durationInDays: 30
  }
  modalError.value = ''
  showAddModal.value = true
}

const openEditPlanModal = (plan: MembershipPlan) => {
  targetPlan.value = plan
  editFormData.value = {
    id: plan.id,
    name: plan.name,
    maxBorrowLimit: plan.maxBorrowLimit,
    price: plan.price,
    durationInDays: plan.durationInDays
  }
  modalError.value = ''
  showEditModal.value = true
}

const openDeletePlanModal = (plan: MembershipPlan) => {
  targetPlan.value = plan
  modalError.value = ''
  showDeleteModal.value = true
}

// 1. Yeni Plan Ekle (Modal)
const addPlan = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/MembershipPlan', {
      method: 'POST',
      body: {
        name: formData.value.name,
        maxBorrowLimit: formData.value.maxBorrowLimit,
        price: formData.value.price,
        durationInDays: formData.value.durationInDays
      }
    })
    showAddModal.value = false
    pageSuccess.value = 'Üyelik planı başarıyla eklendi.'
    await loadPlans()
  } catch (error: any) {
    console.error('Plan eklenemedi:', error)
    modalError.value = error?.data?.message || 'Plan eklenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 2. Plan Güncelle (Modal)
const updatePlan = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/MembershipPlan/${editFormData.value.id}`, {
      method: 'PUT',
      body: {
        name: editFormData.value.name,
        maxBorrowLimit: editFormData.value.maxBorrowLimit,
        price: editFormData.value.price,
        durationInDays: editFormData.value.durationInDays
      }
    })
    showEditModal.value = false
    pageSuccess.value = 'Üyelik planı başarıyla güncellendi.'
    await loadPlans()
  } catch (error: any) {
    console.error('Plan güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Plan güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 3. Plan Sil
const confirmDeletePlan = async () => {
  if (!targetPlan.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/MembershipPlan/${targetPlan.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    pageSuccess.value = 'Üyelik planı başarıyla silindi.'
    await loadPlans()
  } catch (error: any) {
    console.error('Plan silinemedi:', error)
    modalError.value = error?.data?.message || 'Plan silinirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

const loadPlans = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await apiFetch<MembershipPlan[]>('/api/MembershipPlan')
    plans.value = Array.isArray(data) ? data : []
  } catch {
    loadError.value = 'Planlar yüklenirken bir hata oluştu.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadPlans()
})
</script>

<style scoped>


.plan-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.plan-icon {
  font-size: 18px;
}

.limit-badge {
  background: #efe0d0;
  color: #493122;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
}

.price-text {
  color: #276a2b;
  font-size: 15px;
}
</style>
