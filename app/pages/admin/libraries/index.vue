<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KÜTÜPHANE YÖNETİMİ</span>
          <h1>Kütüphaneler</h1>
          <p class="page-desc">
            Kütüphaneleri, şubeleri, üye kadrosunu ve kitap stoklarını yönetin. Ekleme ve düzenlemeleri modal üzerinden gerçekleştirin.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; z-index: 1;">
          <button class="add-button" @click="openAddModal">
            + Yeni Kütüphane
          </button>
          <div class="header-icon" aria-hidden="true">🏛️</div>
        </div>
      </header>

      <!-- Bildirim mesajları -->
      <div v-if="pageSuccess" class="msg success">✓ {{ pageSuccess }}</div>
      <div v-if="pageError" class="msg error">⚠️ {{ pageError }}</div>

      <!-- Arama -->
      <div class="search-bar">
        <span class="search-icon">⌕</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Kütüphane adına veya adresine göre ara..."
        />
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kütüphaneler yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">Tekrar Dene</button>
      </div>

      <!-- Kütüphane tablosu -->
      <div v-else class="table-wrapper">
        <div class="table-header-row">
          <span class="result-count">
            {{ filteredLibraries.length }} kütüphane
          </span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Kütüphane Adı</th>
              <th>Adres</th>
              <th>Kayıtlı Üye</th>
              <th>Kitap Çeşidi</th>
              <th>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredLibraries.length === 0">
              <td colspan="5" class="empty-row">
                Kütüphane bulunamadı.
              </td>
            </tr>

            <tr
              v-for="library in filteredLibraries"
              :key="library.id"
            >
              <td>
                <div class="library-name-cell">
                  <span class="lib-icon">🏛️</span>
                  <strong>{{ library.name }}</strong>
                </div>
              </td>

              <td>{{ library.address || '—' }}</td>

              <td>
                <button
                  type="button"
                  class="badge-counter-btn"
                  @click="openLibraryMembersModal(library)"
                  title="Üyeleri Görüntüle ve Düzenle"
                >
                  👥 {{ getMemberCount(library.id) }} Üye ➔
                </button>
              </td>

              <td>
                <span class="stock-badge">
                  📚 {{ getBookCount(library.id) }} Kitap Çeşidi
                </span>
              </td>

              <td>
                <div class="action-buttons">
                  <button class="edit-btn" @click="openEditModal(library)">
                    ✏️ Düzenle
                  </button>

                  <NuxtLink
                    :to="`/admin/libraries/${library.id}`"
                    class="detail-manage-btn"
                  >
                    ⚙️ Stok & Üyeler
                  </NuxtLink>

                  <button
                    class="delete-btn"
                    @click="openDeleteModal(library)"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ==============================================
           MODAL 1: YENİ KÜTÜPHANE EKLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showAddModal"
        title="Yeni Kütüphane Ekle"
        subtitle="Sisteme yeni bir kütüphane veya şube tanımlayın."
        icon="🏛️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="addLibrary">
          <div class="form-group">
            <label>Kütüphane Adı</label>
            <input
              v-model="newLibrary.name"
              type="text"
              placeholder="Örn: Merkez Kütüphanesi"
              required
            />
          </div>

          <div class="form-group">
            <label>Adres / Konum</label>
            <input
              v-model="newLibrary.address"
              type="text"
              placeholder="Örn: Kadıköy, İstanbul"
            />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Kütüphaneyi Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- ==============================================
           MODAL 2: KÜTÜPHANE BİLGİSİNİ DÜZENLE (MODAL)
           ============================================== -->
      <AdminModal
        v-model="showEditModal"
        title="Kütüphane Bilgilerini Düzenle"
        subtitle="Kütüphanenin adını ve adres bilgilerini güncelleyin."
        icon="✏️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updateLibrary">
          <div class="form-group">
            <label>Kütüphane Adı</label>
            <input
              v-model="editLibraryForm.name"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label>Adres</label>
            <input
              v-model="editLibraryForm.address"
              type="text"
            />
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
           MODAL 3: KÜTÜPHANE ÜYELERİ MODALI (5. İSTEK DESTEĞİ)
           ============================================== -->
      <AdminModal
        v-model="showMembersModal"
        :title="`${targetLibrary?.name} - Kayıtlı Üyeler`"
        subtitle="Bu kütüphaneye kayıtlı üyeleri görüntüleyin, yeni üye ekleyin veya üyelikten çıkarın."
        icon="👥"
        max-width="720px"
      >
        <div v-if="memberModalSuccess" class="msg success">✓ {{ memberModalSuccess }}</div>
        <div v-if="memberModalError" class="msg error">⚠️ {{ memberModalError }}</div>

        <!-- Yeni Üye Ekleme Satırı -->
        <div class="add-member-strip">
          <label style="font-weight: 700; font-size: 13px; color: #493122; margin-bottom: 6px; display: block;">
            + Bu Kütüphaneye Yeni Üye Ekle
          </label>
          <div style="display: flex; gap: 10px;">
            <select v-model="selectedUserIdToAdd" class="member-select" :disabled="memberActionLoading">
              <option value="">Kullanıcı Seçin...</option>
              <option
                v-for="u in availableUsersForLibrary"
                :key="u.id"
                :value="u.id"
              >
                👤 {{ u.firstName }} {{ u.lastName }} ({{ u.email }})
              </option>
            </select>
            <button
              type="button"
              class="add-member-btn"
              :disabled="!selectedUserIdToAdd || memberActionLoading"
              @click="addMemberToLibrary"
            >
              {{ memberActionLoading ? '...' : '+ Ekle' }}
            </button>
          </div>
        </div>

        <!-- Üyeler Tablosu -->
        <div class="members-table-wrap">
          <table class="modal-data-table">
            <thead>
              <tr>
                <th>Üye Adı Soyadı</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="targetLibraryMembers.length === 0">
                <td colspan="4" class="empty-row">
                  Bu kütüphaneye henüz kayıtlı üye bulunmuyor.
                </td>
              </tr>
              <tr v-for="record in targetLibraryMembers" :key="record.id">
                <td>
                  <strong>{{ getUserFullName(record.userId) }}</strong>
                </td>
                <td>{{ getUserEmail(record.userId) }}</td>
                <td>
                  <span class="mini-badge primary">{{ getUserRole(record.userId) }}</span>
                </td>
                <td>
                  <button
                    type="button"
                    class="detach-btn"
                    :disabled="detachingMemberId === record.id"
                    @click="removeMemberFromLibrary(record)"
                  >
                    {{ detachingMemberId === record.id ? 'Çıkarılıyor...' : '✕ Üyelikten Çıkar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-form-actions" style="margin-top: 18px;">
          <button type="button" class="cancel-btn" @click="showMembersModal = false">Kapat</button>
        </div>
      </AdminModal>

      <!-- ==============================================
           MODAL 4: KÜTÜPHANE SİLME ONAY MODALI
           ============================================== -->
      <AdminModal
        v-model="showDeleteModal"
        title="Kütüphaneyi Sil"
        subtitle="Bu kütüphaneyi sistemden kalıcı olarak silmek istediğinizden emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="targetLibrary" style="color: #b93828;">
            ⚠️ <strong>{{ targetLibrary.name }}</strong> kütüphanesi ve ilişkili kayıtlar silinecektir. Bu işlem geri alınamaz!
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeleteLibrary"
            >
              {{ modalLoading ? 'Siliniyor...' : 'Evet, Kütüphaneyi Sil' }}
            </button>
          </div>
        </div>
      </AdminModal>

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

interface UserLibrary {
  id: string
  userId: string
  libraryId: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
}

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const libraries = ref<Library[]>([])
const users = ref<User[]>([])
const allUserLibraries = ref<UserLibrary[]>([])
const allLibraryBooks = ref<LibraryBook[]>([])

const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')

const pageSuccess = ref('')
const pageError = ref('')

// Modal States
const showAddModal = ref(false)
const showEditModal = ref(false)
const showMembersModal = ref(false)
const showDeleteModal = ref(false)

const modalLoading = ref(false)
const modalError = ref('')
const memberModalSuccess = ref('')
const memberModalError = ref('')
const memberActionLoading = ref(false)
const detachingMemberId = ref<string | null>(null)

const newLibrary = ref({
  name: '',
  address: ''
})

const editLibraryForm = ref({
  id: '',
  name: '',
  address: ''
})

const targetLibrary = ref<Library | null>(null)
const selectedUserIdToAdd = ref('')

const filteredLibraries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return libraries.value
  return libraries.value.filter(
    lib =>
      lib.name.toLowerCase().includes(q) ||
      (lib.address && lib.address.toLowerCase().includes(q))
  )
})

// Seçili kütüphanenin üyeleri
const targetLibraryMembers = computed(() => {
  if (!targetLibrary.value) return []
  return allUserLibraries.value.filter(ul => ul.libraryId === targetLibrary.value!.id)
})

// Bu kütüphanede henüz olmayan kullanıcılar
const availableUsersForLibrary = computed(() => {
  const currentMemberUserIds = new Set(targetLibraryMembers.value.map(m => m.userId))
  return users.value.filter(u => !currentMemberUserIds.has(u.id))
})

const getMemberCount = (libId: string) => {
  return allUserLibraries.value.filter(ul => ul.libraryId === libId).length
}

const getBookCount = (libId: string) => {
  return allLibraryBooks.value.filter(lb => lb.libraryId === libId).length
}

const getUserFullName = (userId: string) => {
  const u = users.value.find(user => user.id === userId)
  return u ? `${u.firstName} ${u.lastName}` : 'Kullanıcı'
}

const getUserEmail = (userId: string) => {
  const u = users.value.find(user => user.id === userId)
  return u?.email || '—'
}

const getUserRole = (userId: string) => {
  const u = users.value.find(user => user.id === userId)
  return u?.role || 'User'
}

// Modal Açıcılar
const openAddModal = () => {
  newLibrary.value = { name: '', address: '' }
  modalError.value = ''
  showAddModal.value = true
}

const openEditModal = (lib: Library) => {
  targetLibrary.value = lib
  editLibraryForm.value = {
    id: lib.id,
    name: lib.name,
    address: lib.address || ''
  }
  modalError.value = ''
  showEditModal.value = true
}

const openLibraryMembersModal = (lib: Library) => {
  targetLibrary.value = lib
  selectedUserIdToAdd.value = ''
  memberModalError.value = ''
  memberModalSuccess.value = ''
  showMembersModal.value = true
}

const openDeleteModal = (lib: Library) => {
  targetLibrary.value = lib
  modalError.value = ''
  showDeleteModal.value = true
}

// 1. Yeni Kütüphane Ekle (Modal)
const addLibrary = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/Library', {
      method: 'POST',
      body: {
        name: newLibrary.value.name,
        address: newLibrary.value.address
      }
    })
    showAddModal.value = false
    pageSuccess.value = 'Kütüphane başarıyla eklendi.'
    await loadData()
  } catch (error: any) {
    console.error('Kütüphane eklenemedi:', error)
    modalError.value = error?.data?.message || 'Kütüphane eklenirken bir hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 2. Kütüphane Bilgilerini Güncelle (Modal)
const updateLibrary = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Library/${editLibraryForm.value.id}`, {
      method: 'PUT',
      body: {
        name: editLibraryForm.value.name,
        address: editLibraryForm.value.address
      }
    })
    showEditModal.value = false
    pageSuccess.value = 'Kütüphane bilgileri güncellendi.'
    await loadData()
  } catch (error: any) {
    console.error('Kütüphane güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Kütüphane güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 3. Kütüphaneyi Sil
const confirmDeleteLibrary = async () => {
  if (!targetLibrary.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Library/${targetLibrary.value.id}`, {
      method: 'DELETE'
    })
    showDeleteModal.value = false
    pageSuccess.value = 'Kütüphane başarıyla silindi.'
    await loadData()
  } catch (error: any) {
    console.error('Kütüphane silinemedi:', error)
    modalError.value = error?.data?.message || 'Kütüphane silinirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 4. Kütüphaneye Üye Ekle (5. İstek)
const addMemberToLibrary = async () => {
  if (!targetLibrary.value || !selectedUserIdToAdd.value) return
  memberActionLoading.value = true
  memberModalError.value = ''
  memberModalSuccess.value = ''
  try {
    await apiFetch('/api/UserLibrary', {
      method: 'POST',
      body: {
        userId: selectedUserIdToAdd.value,
        libraryId: targetLibrary.value.id
      }
    })
    memberModalSuccess.value = 'Üye kütüphaneye başarıyla kaydedildi.'
    selectedUserIdToAdd.value = ''
    const updated = await apiFetch<UserLibrary[]>('/api/UserLibrary')
    if (Array.isArray(updated)) {
      allUserLibraries.value = updated
    }
  } catch (error: any) {
    console.error('Üye eklenemedi:', error)
    memberModalError.value = error?.data?.message || 'Üye eklenirken hata oluştu.'
  } finally {
    memberActionLoading.value = false
  }
}

// 5. Kütüphaneden Üyeyi Çıkar / İlişik Kes (5. İstek)
const removeMemberFromLibrary = async (record: UserLibrary) => {
  detachingMemberId.value = record.id
  memberModalError.value = ''
  memberModalSuccess.value = ''
  try {
    await apiFetch(`/api/UserLibrary/${record.id}`, {
      method: 'DELETE'
    })
    memberModalSuccess.value = 'Üyenin bu kütüphaneden ilişiği kesildi.'
    allUserLibraries.value = allUserLibraries.value.filter(ul => ul.id !== record.id)
  } catch (error: any) {
    console.error('Üyelikten çıkarılamadı:', error)
    memberModalError.value = error?.data?.message || 'Üye çıkarılırken hata oluştu.'
  } finally {
    detachingMemberId.value = null
  }
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [libRes, userRes, userLibRes, lbRes] = await Promise.allSettled([
      apiFetch<Library[]>('/api/Library'),
      apiFetch<User[]>('/api/User'),
      apiFetch<UserLibrary[]>('/api/UserLibrary'),
      apiFetch<LibraryBook[]>('/api/LibraryBook')
    ])

    if (libRes.status === 'fulfilled' && Array.isArray(libRes.value)) {
      libraries.value = libRes.value
    }
    if (userRes.status === 'fulfilled' && Array.isArray(userRes.value)) {
      users.value = userRes.value
    }
    if (userLibRes.status === 'fulfilled' && Array.isArray(userLibRes.value)) {
      allUserLibraries.value = userLibRes.value
    }
    if (lbRes.status === 'fulfilled' && Array.isArray(lbRes.value)) {
      allLibraryBooks.value = lbRes.value
    }
  } catch (error) {
    console.error('Kütüphaneler yüklenemedi:', error)
    loadError.value = 'Kütüphane bilgileri yüklenirken hata oluştu.'
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


.library-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lib-icon {
  font-size: 20px;
}

.badge-counter-btn {
  background: #fbf2e7;
  border: 1px solid #ebd9c8;
  color: #6a4a33;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.2s;
}

.badge-counter-btn:hover {
  background: #b96b35;
  color: #fff;
  border-color: #b96b35;
}

.stock-badge {
  background: #f4ecdf;
  border: 1px solid #e2d2c1;
  color: #553e2e;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.detail-manage-btn {
  background: #e9decb;
  color: #4f3929;
  text-decoration: none;
  font-size: 12px;
  font-weight: 750;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.detail-manage-btn:hover {
  background: #d8c6b0;
}

/* Modal Stilleri */
.add-member-strip {
  background: #fbf5ee;
  border: 1px solid #ebd9c8;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
}

.member-select {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #dcc2a7;
  border-radius: 10px;
  font-size: 13px;
  color: #46372d;
}

.add-member-btn {
  background: #2e7d32;
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.add-member-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.members-table-wrap {
  background: #fff;
  border: 1px solid #ebd9c8;
  border-radius: 12px;
  padding: 12px 16px;
}

.modal-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.modal-data-table th {
  text-align: left;
  padding: 10px 8px;
  color: #8c735d;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  border-bottom: 1px solid #ebd9c8;
}

.modal-data-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f3e8dd;
  color: #493122;
}

.detach-btn {
  background: #fff0ee;
  border: 1px solid #f2c7bd;
  color: #b93828;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.detach-btn:hover:not(:disabled) {
  background: #b93828;
  color: #fff;
}

.mini-badge.primary {
  background: #f1f0fd;
  color: #4a45a3;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}
</style>
