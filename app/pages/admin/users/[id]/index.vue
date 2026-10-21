<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <!-- Geri dön -->
      <NuxtLink to="/admin/users" class="back-link">
        ← Kullanıcı Listesine Dön
      </NuxtLink>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kullanıcı bilgileri yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadUserData">Tekrar Dene</button>
      </div>

      <!-- Kullanıcı Detay ve Yönetim -->
      <div v-else>
        <header class="page-header">
          <div class="header-content">
            <span class="page-eyebrow">KULLANICI DÜZENLE</span>
            <h1>{{ user.firstName }} {{ user.lastName }}</h1>
            <p class="page-desc">
              Kullanıcı profil bilgilerini ve kütüphane üyeliklerini yönetin.
            </p>
          </div>
          <div class="header-icon" aria-hidden="true">👤</div>
        </header>

        <div v-if="formError" class="msg error">⚠️ {{ formError }}</div>
        <div v-if="formSuccess" class="msg success">✓ {{ formSuccess }}</div>

        <!-- Profil Bilgileri -->
        <div class="form-card">
          <h2>Profil Bilgilerini Düzenle</h2>

          <form class="form-grid" @submit.prevent="updateUser">
            <div class="form-group">
              <label>Ad</label>
              <input v-model="user.firstName" type="text" placeholder="Ad" required />
            </div>

            <div class="form-group">
              <label>Soyad</label>
              <input v-model="user.lastName" type="text" placeholder="Soyad" required />
            </div>

            <div class="form-group">
              <label>E-posta</label>
              <input v-model="user.email" type="email" placeholder="E-posta" required />
            </div>

            <div class="form-group">
              <label>Rol</label>
              <select v-model="user.role">
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn" :disabled="saving">
                {{ saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Kütüphane Üyelikleri Yönetimi (4. İstek) -->
        <div class="form-card" style="margin-top: 24px;">
          <div class="card-head-row">
            <div>
              <h2>🏛️ Kütüphane Üyelikleri ({{ userLibraryRecords.length }})</h2>
              <p class="section-subtext">
                Bu kullanıcının yetkili veya üye olduğu kütüphaneleri yönetin.
              </p>
            </div>
            <button
              type="button"
              class="add-button"
              @click="showAddLibModal = true"
            >
              + Yeni Kütüphaneye Ekle
            </button>
          </div>

          <!-- Üyelikler Tablosu -->
          <div class="table-wrapper" style="margin-top: 16px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kütüphane Adı</th>
                  <th>Adres</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="userLibraryRecords.length === 0">
                  <td colspan="3" class="empty-row">
                    Bu kullanıcı henüz herhangi bir kütüphaneye kayıtlı değil.
                  </td>
                </tr>

                <tr v-for="rec in userLibraryRecords" :key="rec.id">
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span>🏛️</span>
                      <strong>{{ getLibraryName(rec.libraryId) }}</strong>
                    </div>
                  </td>
                  <td>{{ getLibraryAddress(rec.libraryId) }}</td>
                  <td>
                    <button
                      type="button"
                      class="delete-btn"
                      :disabled="detachingId === rec.id"
                      @click="detachLibrary(rec)"
                    >
                      {{ detachingId === rec.id ? '...' : '✕ İlişiği Kes' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Yeni Kütüphaneye Ekle Modalı -->
        <AdminModal
          v-model="showAddLibModal"
          title="Kütüphaneye Üye Ekle"
          :subtitle="`${user.firstName} ${user.lastName} adlı kullanıcıyı bir kütüphaneye kaydedin.`"
          icon="🏛️"
        >
          <div class="modal-form">
            <div class="form-group">
              <label>Kütüphane Seçin</label>
              <select v-model="selectedLibraryIdToAdd" required>
                <option value="">Kütüphane Seçin...</option>
                <option
                  v-for="lib in availableLibraries"
                  :key="lib.id"
                  :value="lib.id"
                >
                  🏛️ {{ lib.name }} {{ lib.address ? `(${lib.address})` : '' }}
                </option>
              </select>
            </div>

            <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>

            <div class="modal-form-actions">
              <button type="button" class="cancel-btn" @click="showAddLibModal = false">İptal</button>
              <button
                type="button"
                class="submit-btn"
                :disabled="!selectedLibraryIdToAdd || addingLibLoading"
                @click="confirmAddLibrary"
              >
                {{ addingLibLoading ? 'Ekleniyor...' : '+ Üye Yap' }}
              </button>
            </div>
          </div>
        </AdminModal>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

interface Library {
  id: string
  name: string
  address?: string
}

interface UserLibrary {
  id: string
  userId: string
  libraryId: string
}

const route = useRoute()
const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const userId = computed(() => route.params.id as string)

const user = ref<User>({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'User'
})

const libraries = ref<Library[]>([])
const allUserLibraries = ref<UserLibrary[]>([])

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const formError = ref('')
const formSuccess = ref('')

const showAddLibModal = ref(false)
const selectedLibraryIdToAdd = ref('')
const addingLibLoading = ref(false)
const detachingId = ref<string | null>(null)
const modalError = ref('')

const userLibraryRecords = computed(() => {
  return allUserLibraries.value.filter(ul => ul.userId === userId.value)
})

const availableLibraries = computed(() => {
  const currentLibIds = new Set(userLibraryRecords.value.map(ul => ul.libraryId))
  return libraries.value.filter(lib => !currentLibIds.has(lib.id))
})

const getLibraryName = (libId: string) => {
  const lib = libraries.value.find(l => l.id === libId)
  return lib ? lib.name : 'Bilinmeyen Kütüphane'
}

const getLibraryAddress = (libId: string) => {
  const lib = libraries.value.find(l => l.id === libId)
  return lib?.address || '—'
}

const loadUserData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [userData, libData, userLibData] = await Promise.all([
      apiFetch<User>(`/api/User/${userId.value}`),
      apiFetch<Library[]>('/api/Library'),
      apiFetch<UserLibrary[]>('/api/UserLibrary')
    ])

    user.value = {
      ...userData,
      role: userData.role || 'User'
    }
    libraries.value = Array.isArray(libData) ? libData : []
    allUserLibraries.value = Array.isArray(userLibData) ? userLibData : []
  } catch (error) {
    console.error('Kullanıcı bilgileri yüklenemedi:', error)
    loadError.value = 'Kullanıcı bilgileri yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}

const updateUser = async () => {
  formError.value = ''
  formSuccess.value = ''
  saving.value = true
  try {
    await apiFetch(`/api/User/${userId.value}`, {
      method: 'PUT',
      body: {
        firstName: user.value.firstName,
        lastName: user.value.lastName,
        email: user.value.email,
        role: user.value.role
      }
    })
    formSuccess.value = 'Kullanıcı bilgileri başarıyla güncellendi.'
  } catch (error: any) {
    console.error('Kullanıcı güncellenemedi:', error)
    formError.value = error?.data?.message || 'Kullanıcı güncellenirken hata oluştu.'
  } finally {
    saving.value = false
  }
}

const confirmAddLibrary = async () => {
  if (!selectedLibraryIdToAdd.value) return
  addingLibLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/UserLibrary', {
      method: 'POST',
      body: {
        userId: userId.value,
        libraryId: selectedLibraryIdToAdd.value
      }
    })
    formSuccess.value = 'Kütüphane üyeliği başarıyla eklendi.'
    showAddLibModal.value = false
    selectedLibraryIdToAdd.value = ''
    const updated = await apiFetch<UserLibrary[]>('/api/UserLibrary')
    if (Array.isArray(updated)) {
      allUserLibraries.value = updated
    }
  } catch (error: any) {
    console.error('Kütüphane üyeliği eklenemedi:', error)
    modalError.value = error?.data?.message || 'Kütüphaneye eklenirken hata oluştu.'
  } finally {
    addingLibLoading.value = false
  }
}

const detachLibrary = async (rec: UserLibrary) => {
  detachingId.value = rec.id
  formError.value = ''
  formSuccess.value = ''
  try {
    await apiFetch(`/api/UserLibrary/${rec.id}`, {
      method: 'DELETE'
    })
    formSuccess.value = 'Kullanıcının kütüphane ilişiği kesildi.'
    allUserLibraries.value = allUserLibraries.value.filter(ul => ul.id !== rec.id)
  } catch (error: any) {
    console.error('İlişik kesilemedi:', error)
    formError.value = error?.data?.message || 'İlişik kesilirken hata oluştu.'
  } finally {
    detachingId.value = null
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadUserData()
})
</script>

<style scoped>


.card-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-subtext {
  margin: 4px 0 0;
  color: #8c735d;
  font-size: 13px;
}
</style>
