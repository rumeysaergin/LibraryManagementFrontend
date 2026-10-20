<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">ÜYELİK YÖNETİMİ</span>
          <h1>Üyelik Planları</h1>
          <p class="page-desc">Kütüphane üyelik planlarını, ödünç alma limitlerini ve ücretlendirmeleri yönetin.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="toggleForm">
            {{ showForm ? '✕ İptal' : '+ Yeni Plan Ekle' }}
          </button>
          <div class="header-icon" aria-hidden="true">👤</div>
        </div>
      </header>


      <!-- Ekle / Düzenle Formu -->
      <div v-if="showForm" class="form-card">
        <h2>{{ editingPlanId ? 'Planı Düzenle' : 'Yeni Üyelik Planı Ekle' }}</h2>

        <div v-if="formError" class="msg error">⚠️ {{ formError }}</div>
        <div v-if="formSuccess" class="msg success">✓ {{ formSuccess }}</div>

        <form class="form-grid" @submit.prevent="savePlan">

          <div class="form-group">
            <label>Plan Adı</label>
            <input v-model="formData.name" type="text" placeholder="Örn: Standart Plan, Premium Plan" required />
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

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="resetForm">İptal</button>
            <button type="submit" class="submit-btn" :disabled="formLoading">
              {{ formLoading ? 'Kaydediliyor...' : (editingPlanId ? 'Güncelle' : 'Plan Ekle') }}
            </button>
          </div>

        </form>
      </div>


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
                  <button class="edit-btn" @click="startEdit(plan)">✏️ Düzenle</button>
                  <button class="delete-btn" @click="deletePlan(plan)">🗑️ Sil</button>
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

const showForm = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')
const editingPlanId = ref<string | null>(null)

const formData = ref({
  name: '',
  maxBorrowLimit: 3,
  price: 0,
  durationInDays: 30
})

const filteredPlans = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return plans.value
  return plans.value.filter(p => p.name.toLowerCase().includes(q))
})

const toggleForm = () => {
  if (showForm.value) {
    resetForm()
  } else {
    showForm.value = true
  }
}

const resetForm = () => {
  showForm.value = false
  editingPlanId.value = null
  formError.value = ''
  formSuccess.value = ''
  formData.value = {
    name: '',
    maxBorrowLimit: 3,
    price: 0,
    durationInDays: 30
  }
}

const startEdit = (plan: MembershipPlan) => {
  editingPlanId.value = plan.id
  formData.value = {
    name: plan.name,
    maxBorrowLimit: plan.maxBorrowLimit,
    price: plan.price,
    durationInDays: plan.durationInDays
  }
  formError.value = ''
  formSuccess.value = ''
  showForm.value = true
}

const loadPlans = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const data = await apiFetch<MembershipPlan[]>('/api/MembershipPlan')
    plans.value = Array.isArray(data) ? data : []
  }
  catch {
    loadError.value = 'Üyelik planları yüklenirken hata oluştu.'
  }
  finally {
    loading.value = false
  }
}

const savePlan = async () => {
  formError.value = ''
  formSuccess.value = ''
  formLoading.value = true

  try {
    if (editingPlanId.value) {
      await apiFetch(`/api/MembershipPlan/${editingPlanId.value}`, {
        method: 'PUT',
        body: {
          name: formData.value.name,
          maxBorrowLimit: formData.value.maxBorrowLimit,
          price: formData.value.price,
          durationInDays: formData.value.durationInDays
        }
      })
      formSuccess.value = 'Üyelik planı başarıyla güncellendi.'
    } else {
      await apiFetch('/api/MembershipPlan', {
        method: 'POST',
        body: {
          name: formData.value.name,
          maxBorrowLimit: formData.value.maxBorrowLimit,
          price: formData.value.price,
          durationInDays: formData.value.durationInDays
        }
      })
      formSuccess.value = 'Üyelik planı başarıyla eklendi.'
    }

    setTimeout(() => {
      resetForm()
    }, 1200)

    await loadPlans()
  }
  catch (error: any) {
    formError.value = error?.data?.message ?? 'İşlem sırasında bir hata oluştu.'
  }
  finally {
    formLoading.value = false
  }
}

const deletePlan = async (plan: MembershipPlan) => {
  const confirmed = window.confirm(`"${plan.name}" planını silmek istediğinize emin misiniz?`)
  if (!confirmed) return
  try {
    await apiFetch(`/api/MembershipPlan/${plan.id}`, { method: 'DELETE' })
    await loadPlans()
  }
  catch (error: any) {
    window.alert(error?.data?.message ?? 'Plan silinirken hata oluştu.')
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadPlans()
})

</script>


<style scoped>
@import "../../../styles/admin.css";

.plan-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-icon {
  font-size: 16px;
}

.limit-badge {
  display: inline-block;
  padding: 3px 9px;
  background: #f5e6d5;
  color: #7c4b2c;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.price-text {
  color: #2e7d32;
  font-size: 15px;
}
</style>
