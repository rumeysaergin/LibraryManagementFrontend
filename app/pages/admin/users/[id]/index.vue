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
        <button class="retry-btn" @click="loadUser">
          Tekrar Dene
        </button>
      </div>

      <!-- Form -->
      <div v-else>
        <header class="page-header">
          <div class="header-content">
            <span class="page-eyebrow">KULLANICI DÜZENLE</span>
            <h1>{{ user.firstName }} {{ user.lastName }}</h1>
            <p class="page-desc">
              Kullanıcı profil ve yetki bilgilerini güncelleyin.
            </p>
          </div>

          <div class="header-icon" aria-hidden="true">👤</div>
        </header>

        <div v-if="formError" class="msg error">
          ⚠️ {{ formError }}
        </div>

        <div v-if="formSuccess" class="msg success">
          ✓ {{ formSuccess }}
        </div>

        <div class="form-card">
          <h2>Bilgileri Düzenle</h2>

          <form class="form-grid" @submit.prevent="updateUser">
            <div class="form-group">
              <label>Ad</label>
              <input
                v-model="user.firstName"
                type="text"
                placeholder="Ad"
                required
              />
            </div>

            <div class="form-group">
              <label>Soyad</label>
              <input
                v-model="user.lastName"
                type="text"
                placeholder="Soyad"
                required
              />
            </div>

            <div class="form-group">
              <label>E-posta</label>
              <input
                v-model="user.email"
                type="email"
                placeholder="E-posta"
                required
              />
            </div>

            <div class="form-group">
              <label>Rol</label>
              <select v-model="user.role">
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div class="form-actions">
              <NuxtLink to="/admin/users" class="cancel-btn">
                İptal
              </NuxtLink>

              <button
                type="submit"
                class="submit-btn"
                :disabled="saving"
              >
                {{ saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
              </button>
            </div>
          </form>
        </div>
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

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const formError = ref('')
const formSuccess = ref('')

const loadUser = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const data = await apiFetch<User>(`/api/User/${userId.value}`)

    user.value = {
      ...data,
      role: data.role || 'User'
    }
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

    formSuccess.value = 'Kullanıcı başarıyla güncellendi.'

    // Kaydedilen güncel bilgileri tekrar yükle.
    await loadUser()
  } catch (error: any) {
    formError.value =
      error?.data?.message ??
      'Güncelleme sırasında hata oluştu.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadUser()
})
</script>

<style scoped>
@import "../../../../styles/admin.css";
</style>