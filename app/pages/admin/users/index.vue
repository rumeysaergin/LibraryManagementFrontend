<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KULLANICI YÖNETİMİ</span>
          <h1>Kullanıcılar</h1>
          <p class="page-desc">
            Sistemdeki tüm kullanıcıları görüntüleyin, ekleyin ve düzenleyin.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="showAddForm = !showAddForm">
            {{ showAddForm ? '✕ İptal' : '+ Yeni Kullanıcı' }}
          </button>

          <div class="header-icon" aria-hidden="true">👥</div>
        </div>
      </header>

      <!-- Yeni kullanıcı formu -->
      <div v-if="showAddForm" class="form-card">
        <h2>Yeni Kullanıcı Ekle</h2>

        <div v-if="formError" class="msg error">
          ⚠️ {{ formError }}
        </div>

        <div v-if="formSuccess" class="msg success">
          ✓ {{ formSuccess }}
        </div>

        <form class="form-grid" @submit.prevent="addUser">
          <div class="form-group">
            <label>Ad</label>
            <input
              v-model="newUser.firstName"
              type="text"
              placeholder="Ad"
              required
            />
          </div>

          <div class="form-group">
            <label>Soyad</label>
            <input
              v-model="newUser.lastName"
              type="text"
              placeholder="Soyad"
              required
            />
          </div>

          <div class="form-group">
            <label>E-posta</label>
            <input
              v-model="newUser.email"
              type="email"
              placeholder="E-posta"
              required
            />
          </div>

          <div class="form-group">
            <label>Şifre</label>
            <input
              v-model="newUser.password"
              type="password"
              placeholder="Şifre"
              required
            />
          </div>

          <div class="form-group">
            <label>Rol</label>
            <select v-model="newUser.role">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="submit-btn"
              :disabled="formLoading"
            >
              {{ formLoading ? 'Ekleniyor...' : 'Kullanıcı Ekle' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Arama -->
      <div class="search-bar">
        <span class="search-icon">⌕</span>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ad, soyad veya e-posta ile ara..."
        />
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kullanıcılar yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadUsers">
          Tekrar Dene
        </button>
      </div>

      <!-- Kullanıcı tablosu -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">
            {{ filteredUsers.length }} kullanıcı
          </span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Rol</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="empty-row">
                Kullanıcı bulunamadı.
              </td>
            </tr>

            <tr
              v-for="user in filteredUsers"
              :key="user.id"
            >
              <td>
                <div class="user-name">
                  <span class="avatar">👤</span>
                  {{ user.firstName }} {{ user.lastName }}
                </div>
              </td>

              <td>{{ user.email }}</td>

              <td>
                <span
                  :class="[
                    'role-badge',
                    user.role === 'Admin' ? 'admin-badge' : 'user-badge'
                  ]"
                >
                  {{ user.role || 'User' }}
                </span>
              </td>

              <td>
                <div class="action-buttons">
                  <NuxtLink
                    :to="`/admin/users/${user.id}`"
                    class="edit-btn"
                  >
                    ✏️ Düzenle
                  </NuxtLink>

                  <button
                    class="delete-btn"
                    @click="deleteUser(user)"
                  >
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
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

interface NewUser {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const users = ref<User[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')

const showAddForm = ref(false)
const formLoading = ref(false)
const formError = ref('')
const formSuccess = ref('')

const newUser = ref<NewUser>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'User'
})

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  if (!q) {
    return users.value
  }

  return users.value.filter(user =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(q) ||
    user.email.toLowerCase().includes(q)
  )
})

const loadUsers = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const data = await apiFetch<User[]>('/api/User')
    users.value = Array.isArray(data) ? data : []
  } catch (error) {
    loadError.value = 'Kullanıcılar yüklenirken hata oluştu.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

const addUser = async () => {
  formError.value = ''
  formSuccess.value = ''
  formLoading.value = true

  try {
    await apiFetch('/api/User', {
      method: 'POST',
      body: {
        firstName: newUser.value.firstName,
        lastName: newUser.value.lastName,
        email: newUser.value.email,
        password: newUser.value.password,
        role: newUser.value.role
      }
    })

    formSuccess.value = 'Kullanıcı başarıyla eklendi.'

    newUser.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'User'
    }

    showAddForm.value = false

    await loadUsers()
  } catch (error: any) {
    formError.value =
      error?.data?.message ??
      'Kullanıcı eklenirken hata oluştu.'
  } finally {
    formLoading.value = false
  }
}

const deleteUser = async (user: User) => {
  const confirmed = window.confirm(
    `"${user.firstName} ${user.lastName}" kullanıcısını silmek istediğinize emin misiniz?`
  )

  if (!confirmed) {
    return
  }

  try {
    await apiFetch(`/api/User/${user.id}`, {
      method: 'DELETE'
    })

    await loadUsers()
  } catch (error: any) {
    window.alert(
      error?.data?.message ??
      'Kullanıcı silinirken hata oluştu.'
    )
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadUsers()
})
</script>

<style scoped>
@import "../../../styles/admin.css";
</style>