<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">
            {{ selectedLibrary ? `SEÇİLİ KÜTÜPHANE: ${selectedLibrary.name}` : 'KULLANICI YÖNETİMİ' }}
          </span>
          <h1>{{ selectedLibrary ? `${selectedLibrary.name} Üyeleri` : 'Kullanıcılar' }}</h1>
          <p class="page-desc">
            {{
              selectedLibrary
                ? `Yalnızca ${selectedLibrary.name} kütüphanesine kayıtlı olan üyeler listelenmektedir. İlişik kesme ve yeni üye ekleme işlemlerini buradan yapabilirsiniz.`
                : 'Sistemdeki tüm kullanıcıları görüntüleyin, kütüphane üyeliklerini yönetin (ekleme / ilişik kesme), modal ile ekleme ve düzenleme yapın.'
            }}
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="openAddUserModal">
            {{ selectedLibrary ? `+ ${selectedLibrary.name}'ne Üye Ekle` : '+ Yeni Kullanıcı' }}
          </button>
          <div class="header-icon" aria-hidden="true">👥</div>
        </div>
      </header>

      <!-- Seçili Kütüphane Bilgi Şeridi -->
      <div v-if="selectedLibrary" class="active-lib-filter-pill">
        <span>🏛️ Sol menüden seçilen kütüphaneye filtrelendi: <strong>{{ selectedLibrary.name }}</strong> ({{ scopedUsers.length }} Kayıtlı Üye)</span>
        <button type="button" class="clear-filter-mini-btn" @click="setLibraryId('')">
          ✕ Filtreyi Kaldır (Tüm Kullanıcılar)
        </button>
      </div>

      <!-- Bildirim mesajları -->
      <div v-if="pageSuccess" class="msg success">✓ {{ pageSuccess }}</div>
      <div v-if="pageError" class="msg error">⚠️ {{ pageError }}</div>

      <!-- Arama ve Filtre -->
      <div class="filters-row">
        <div class="search-bar">
          <span class="search-icon">⌕</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Ad, soyad veya e-posta ile ara..."
          />
        </div>
        <select v-model="roleFilter" class="filter-select">
          <option value="">Tüm Roller</option>
          <option value="User">User (Normal Üye)</option>
          <option value="Admin">Admin (Yönetici)</option>
        </select>
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kullanıcılar yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">Tekrar Dene</button>
      </div>

      <!-- Kullanıcı tablosu -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">
            {{ filteredUsers.length }} kullanıcı (Kütüphane üyeliklerini görmek/düzenlemek için satıra veya butona tıklayın)
          </span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Rol</th>
              <th>Üye Olduğu Kütüphaneler</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="empty-row">Kullanıcı bulunamadı.</td>
            </tr>

            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="clickable-row"
              @click="openUserLibrariesModal(user)"
            >
              <td>
                <div class="user-name">
                  <span class="avatar">👤</span>
                  <strong>{{ user.firstName }} {{ user.lastName }}</strong>
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

              <!-- Kütüphane Üyelikleri Özeti -->
              <td>
                <div class="user-libs-cell">
                  <span class="libs-count-badge">
                    🏛️ {{ getUserLibraryCount(user.id) }} Kütüphane
                  </span>
                  <button
                    type="button"
                    class="manage-libs-pill-btn"
                    @click.stop="openUserLibrariesModal(user)"
                  >
                    Üyelikleri Yönet ➔
                  </button>
                </div>
              </td>

              <td @click.stop>
                <div class="action-buttons">
                  <button class="edit-btn" @click.stop="openEditUserModal(user)">
                    ✏️ Düzenle
                  </button>
                  <button class="delete-btn" @click.stop="openDeleteUserModal(user)">
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ==============================================
           MODAL 1: YENİ KULLANICI EKLEME
           ============================================== -->
      <AdminModal
        v-model="showAddModal"
        title="Yeni Kullanıcı Ekle"
        subtitle="Sisteme yeni bir kullanıcı veya yönetici tanımlayın."
        icon="👤"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="addUser">
          <div class="form-group">
            <label>Ad</label>
            <input v-model="newUser.firstName" type="text" placeholder="Ad" required />
          </div>

          <div class="form-group">
            <label>Soyad</label>
            <input v-model="newUser.lastName" type="text" placeholder="Soyad" required />
          </div>

          <div class="form-group">
            <label>E-posta</label>
            <input v-model="newUser.email" type="email" placeholder="E-posta adresi" required />
          </div>

          <div class="form-group">
            <label>Şifre</label>
            <input v-model="newUser.password" type="password" placeholder="Şifre" required />
          </div>

          <div class="form-group">
            <label>Rol</label>
            <select v-model="newUser.role">
              <option value="User">User (Normal Üye)</option>
              <option value="Admin">Admin (Yönetici)</option>
            </select>
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Kullanıcıyı Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 2: KULLANICI DÜZENLEME (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showEditModal"
        title="Kullanıcıyı Düzenle"
        subtitle="Kullanıcı ad, soyad, e-posta ve rol bilgilerini güncelleyin."
        icon="✏️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updateUser">
          <div class="form-group">
            <label>Ad</label>
            <input v-model="editUserForm.firstName" type="text" required />
          </div>

          <div class="form-group">
            <label>Soyad</label>
            <input v-model="editUserForm.lastName" type="text" required />
          </div>

          <div class="form-group">
            <label>E-posta</label>
            <input v-model="editUserForm.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Rol</label>
            <select v-model="editUserForm.role">
              <option value="User">User (Normal Üye)</option>
              <option value="Admin">Admin (Yönetici)</option>
            </select>
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
           MODAL 3: KULLANICININ KÜTÜPHANE ÜYELİKLERİ YÖNETİMİ (4. İSTEK)
           ============================================== -->
      <AdminModal
        v-model="showLibrariesModal"
        :title="`${targetUser?.firstName} ${targetUser?.lastName} - Kütüphane Üyelikleri`"
        subtitle="Kullanıcının üye olduğu kütüphaneleri görüntüleyin, yeni kütüphaneye üye yapın veya ilişiğini kesin."
        icon="🏛️"
        max-width="720px"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <div v-if="modalSuccess" class="msg success">✓ {{ modalSuccess }}</div>

        <!-- Kullanıcı Temel Bilgi Şeridi -->
        <div class="user-modal-banner">
          <div>
            <strong>{{ targetUser?.firstName }} {{ targetUser?.lastName }}</strong>
            <span class="sub-email">({{ targetUser?.email }})</span>
          </div>
          <span class="role-badge" :class="targetUser?.role === 'Admin' ? 'admin-badge' : 'user-badge'">
            {{ targetUser?.role || 'User' }}
          </span>
        </div>

        <!-- Yeni Kütüphaneye Üye Yapma Formu -->
        <div class="add-membership-box">
          <h4 class="box-subheading">+ Yeni Kütüphaneye Üye Ekle</h4>
          <div class="add-membership-row">
            <select v-model="selectedLibraryToAdd" class="lib-select" :disabled="memberActionLoading">
              <option value="">Kütüphane Seçin...</option>
              <option
                v-for="lib in availableLibrariesForUser"
                :key="lib.id"
                :value="lib.id"
              >
                🏛️ {{ lib.name }} {{ lib.address ? `- ${lib.address}` : '' }}
              </option>
            </select>

            <button
              type="button"
              class="add-lib-btn"
              :disabled="!selectedLibraryToAdd || memberActionLoading"
              @click="addLibraryMembership"
            >
              {{ memberActionLoading ? 'Ekleniyor...' : '+ Kütüphaneye Ekle' }}
            </button>
          </div>
        </div>

        <!-- Üye Olduğu Kütüphaneler Listesi -->
        <div class="memberships-list-wrapper">
          <h4 class="box-subheading">
            Mevcut Üyelikler ({{ userLibraryRecords.length }} Kütüphane)
          </h4>

          <div v-if="userLibraryRecords.length === 0" class="empty-libs-state">
            <span class="empty-icon">📂</span>
            <p>Bu kullanıcı henüz hiçbir kütüphaneye üye değil.</p>
            <small>Yukarıdaki bölümden bir kütüphane seçip üye yapabilirsiniz.</small>
          </div>

          <table v-else class="modal-data-table">
            <thead>
              <tr>
                <th>Kütüphane</th>
                <th>Adres</th>
                <th>İlişik / Üyelik İşlemi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in userLibraryRecords" :key="record.id">
                <td>
                  <div class="lib-title-wrap">
                    <span>🏛️</span>
                    <strong>{{ getLibraryName(record.libraryId) }}</strong>
                  </div>
                </td>
                <td>{{ getLibraryAddress(record.libraryId) }}</td>
                <td>
                  <button
                    type="button"
                    class="detach-btn"
                    :disabled="detachingId === record.id"
                    @click="detachLibraryMembership(record)"
                  >
                    {{ detachingId === record.id ? 'İlişik Kesiliyor...' : '✕ İlişiği Kes (Çıkar)' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-form-actions" style="margin-top: 20px;">
          <button type="button" class="cancel-btn" @click="showLibrariesModal = false">
            Kapat
          </button>
        </div>
      </AdminModal>

      <!-- ==============================================
           MODAL 4: KULLANICI SİLME ONAY MODALI
           ============================================== -->
      <AdminModal
        v-model="showDeleteModal"
        title="Kullanıcıyı Sil"
        subtitle="Bu kullanıcıyı sistemden silmek istediğinizden emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="targetUser" style="color: #b93828;">
            ⚠️ <strong>{{ targetUser.firstName }} {{ targetUser.lastName }}</strong> ({{ targetUser.email }}) adlı kullanıcıyı silmek üzeresiniz. Bu işlem geri alınamaz!
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeleteUser"
            >
              {{ modalLoading ? 'Siliniyor...' : 'Evet, Kullanıcıyı Sil' }}
            </button>
          </div>
        </div>
      </AdminModal>

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

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()
const { selectedLibraryId, selectedLibrary, setLibraryId } = useAdminLibrary()

const users = ref<User[]>([])
const libraries = ref<Library[]>([])
const allUserLibraries = ref<UserLibrary[]>([])

const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const roleFilter = ref('')

const pageSuccess = ref('')
const pageError = ref('')

// Modal States
const showAddModal = ref(false)
const showEditModal = ref(false)
const showLibrariesModal = ref(false)
const showDeleteModal = ref(false)

const modalLoading = ref(false)
const modalError = ref('')
const modalSuccess = ref('')
const memberActionLoading = ref(false)
const detachingId = ref<string | null>(null)

// Ekleme / Düzenleme formları
const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'User'
})

const editUserForm = ref({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'User'
})

const targetUser = ref<User | null>(null)
const selectedLibraryToAdd = ref('')

// Sol menüde kütüphane seçiliyse sadece o kütüphaneye üye olan kullanıcıları filtrele
const scopedUsers = computed(() => {
  if (!selectedLibraryId.value) return users.value
  const memberUserIds = new Set(
    allUserLibraries.value
      .filter(ul => ul.libraryId === selectedLibraryId.value)
      .map(ul => ul.userId)
  )
  return users.value.filter(u => memberUserIds.has(u.id))
})

// Kullanıcının mevcut kütüphane üyelik kayıtları
const userLibraryRecords = computed(() => {
  if (!targetUser.value) return []
  return allUserLibraries.value.filter(ul => ul.userId === targetUser.value!.id)
})

// Kullanıcının henüz üye olmadığı kütüphaneler
const availableLibrariesForUser = computed(() => {
  const currentLibIds = new Set(userLibraryRecords.value.map(ul => ul.libraryId))
  return libraries.value.filter(lib => !currentLibIds.has(lib.id))
})

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return scopedUsers.value.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const email = (user.email || '').toLowerCase()
    const matchSearch = !q || fullName.includes(q) || email.includes(q)
    const matchRole = !roleFilter.value || (user.role || 'User') === roleFilter.value
    return matchSearch && matchRole
  })
})

const getUserLibraryCount = (userId: string) => {
  return allUserLibraries.value.filter(ul => ul.userId === userId).length
}

const getLibraryName = (libId: string) => {
  const lib = libraries.value.find(l => l.id === libId)
  return lib ? lib.name : 'Bilinmeyen Kütüphane'
}

const getLibraryAddress = (libId: string) => {
  const lib = libraries.value.find(l => l.id === libId)
  return lib?.address || '—'
}

// =======================
// MODAL AÇMA FONKSİYONLARI
// =======================
const openAddUserModal = () => {
  newUser.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'User'
  }
  modalError.value = ''
  showAddModal.value = true
}

const openEditUserModal = (u: User) => {
  targetUser.value = u
  editUserForm.value = {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role || 'User'
  }
  modalError.value = ''
  showEditModal.value = true
}

const openUserLibrariesModal = (u: User) => {
  targetUser.value = u
  selectedLibraryToAdd.value = ''
  modalError.value = ''
  modalSuccess.value = ''
  showLibrariesModal.value = true
}

const openDeleteUserModal = (u: User) => {
  targetUser.value = u
  modalError.value = ''
  showDeleteModal.value = true
}

// =======================
// API İŞLEMLERİ
// =======================
// 1. Yeni Kullanıcı Ekle
const addUser = async () => {
  modalLoading.value = true
  modalError.value = ''
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
    
    // Eğer bir kütüphane seçiliyse, yeni kullanıcıyı otomatik olarak bu kütüphaneye de üye yap
    if (selectedLibraryId.value) {
      try {
        const freshUsers = await apiFetch<User[]>('/api/User')
        const createdUser = freshUsers.find(u => u.email.toLowerCase() === newUser.value.email.toLowerCase())
        if (createdUser) {
          await apiFetch('/api/UserLibrary', {
            method: 'POST',
            body: {
              userId: createdUser.id,
              libraryId: selectedLibraryId.value
            }
          })
        }
      } catch (e) {
        console.error('Kullanıcı kütüphaneye otomatik bağlanamadı:', e)
      }
    }

    showAddModal.value = false
    pageSuccess.value = selectedLibrary.value
      ? `Kullanıcı başarıyla eklendi ve ${selectedLibrary.value.name} kütüphanesine üye yapıldı.`
      : 'Kullanıcı başarıyla eklendi.'
    await loadData()
  } catch (error: any) {
    console.error('Kullanıcı eklenemedi:', error)
    modalError.value = error?.data?.message || 'Kullanıcı eklenirken bir hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 2. Kullanıcı Bilgilerini Güncelle (Modal)
const updateUser = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/User/${editUserForm.value.id}`, {
      method: 'PUT',
      body: {
        firstName: editUserForm.value.firstName,
        lastName: editUserForm.value.lastName,
        email: editUserForm.value.email,
        role: editUserForm.value.role
      }
    })
    showEditModal.value = false
    pageSuccess.value = 'Kullanıcı bilgileri başarıyla güncellendi.'
    await loadData()
  } catch (error: any) {
    console.error('Kullanıcı güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Kullanıcı güncellenirken bir hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 3. Kullanıcıyı Sil
const confirmDeleteUser = async () => {
  if (!targetUser.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/User/${targetUser.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    pageSuccess.value = 'Kullanıcı başarıyla silindi.'
    await loadData()
  } catch (error: any) {
    console.error('Kullanıcı silinemedi:', error)
    modalError.value = error?.data?.message || 'Kullanıcı silinirken bir hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 4. Kullanıcıyı Kütüphaneye Üye Olarak Ekle (4. İstek)
const addLibraryMembership = async () => {
  if (!targetUser.value || !selectedLibraryToAdd.value) return
  memberActionLoading.value = true
  modalError.value = ''
  modalSuccess.value = ''
  try {
    await apiFetch('/api/UserLibrary', {
      method: 'POST',
      body: {
        userId: targetUser.value.id,
        libraryId: selectedLibraryToAdd.value
      }
    })
    modalSuccess.value = 'Kullanıcı kütüphaneye başarıyla üye yapıldı.'
    selectedLibraryToAdd.value = ''
    // Üyelik listesini tazele
    const refreshed = await apiFetch<UserLibrary[]>('/api/UserLibrary')
    if (Array.isArray(refreshed)) {
      allUserLibraries.value = refreshed
    }
  } catch (error: any) {
    console.error('Kütüphane üyeliği eklenemedi:', error)
    modalError.value = error?.data?.message || 'Kütüphaneye üye yapılırken hata oluştu.'
  } finally {
    memberActionLoading.value = false
  }
}

// 5. Kullanıcının Kütüphane İlişiğini Kes (4. İstek)
const detachLibraryMembership = async (record: UserLibrary) => {
  detachingId.value = record.id
  modalError.value = ''
  modalSuccess.value = ''
  try {
    await apiFetch(`/api/UserLibrary/${record.id}`, {
      method: 'DELETE'
    })
    modalSuccess.value = 'Kullanıcının kütüphane ilişiği başarıyla kesildi.'
    // Üyelik listesini tazele
    allUserLibraries.value = allUserLibraries.value.filter(ul => ul.id !== record.id)
  } catch (error: any) {
    console.error('İlişik kesilemedi:', error)
    modalError.value = error?.data?.message || 'İlişik kesilirken hata oluştu.'
  } finally {
    detachingId.value = null
  }
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [usersRes, libsRes, userLibsRes] = await Promise.allSettled([
      apiFetch<User[]>('/api/User'),
      apiFetch<Library[]>('/api/Library'),
      apiFetch<UserLibrary[]>('/api/UserLibrary')
    ])

    if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
      users.value = usersRes.value
    }
    if (libsRes.status === 'fulfilled' && Array.isArray(libsRes.value)) {
      libraries.value = libsRes.value
    }
    if (userLibsRes.status === 'fulfilled' && Array.isArray(userLibsRes.value)) {
      allUserLibraries.value = userLibsRes.value
    }
  } catch (error) {
    console.error('Kullanıcılar yüklenemedi:', error)
    loadError.value = 'Kullanıcı verileri yüklenirken hata oluştu.'
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

.user-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #efe0d0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-libs-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.libs-count-badge {
  background: #f4e9df;
  border: 1px solid #e5d1bf;
  color: #5b3e2a;
  font-weight: 700;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
}

.manage-libs-pill-btn {
  background: #b96b35;
  color: #fff;
  border: none;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.manage-libs-pill-btn:hover {
  background: #9d5624;
}

/* Modal İçi Kullanıcı & Üyelik Stilleri */
.user-modal-banner {
  background: #fbf5ee;
  border: 1px solid #ebd9c8;
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.sub-email {
  color: #8c735d;
  font-size: 13px;
  margin-left: 6px;
}

.box-subheading {
  margin: 0 0 10px;
  font-size: 14px;
  color: #493122;
  font-weight: 750;
}

.add-membership-box {
  background: #fff;
  border: 1px solid #ebd9c8;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 20px;
}

.add-membership-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.lib-select {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #dcc2a7;
  border-radius: 10px;
  font-size: 14px;
  color: #46372d;
}

.add-lib-btn {
  background: #2e7d32;
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-lib-btn:hover:not(:disabled) {
  background: #236527;
}

.add-lib-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.memberships-list-wrapper {
  background: #fff;
  border: 1px solid #ebd9c8;
  border-radius: 12px;
  padding: 16px 18px;
}

.empty-libs-state {
  text-align: center;
  padding: 24px 16px;
  color: #8c735d;
}

.empty-libs-state .empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 6px;
}

.empty-libs-state p {
  margin: 0 0 4px;
  font-weight: 700;
  color: #493122;
}

.modal-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 10px;
}

.modal-data-table th {
  text-align: left;
  padding: 10px;
  color: #8c735d;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  border-bottom: 1px solid #ebd9c8;
}

.modal-data-table td {
  padding: 10px;
  border-bottom: 1px solid #f3e8dd;
  color: #493122;
}

.lib-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detach-btn {
  background: #fff0ee;
  border: 1px solid #f2c7bd;
  color: #b93828;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.detach-btn:hover:not(:disabled) {
  background: #b93828;
  color: #fff;
}
</style>
