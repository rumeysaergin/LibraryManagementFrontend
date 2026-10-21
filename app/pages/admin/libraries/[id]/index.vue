<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <NuxtLink to="/admin/libraries" class="back-link">
        ← Kütüphane Listesine Dön
      </NuxtLink>

      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kütüphane bilgileri, stok ve üyeler yükleniyor...</p>
      </div>

      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">Tekrar Dene</button>
      </div>

      <div v-else>
        <!-- Sayfa Başlığı -->
        <header class="page-header">
          <div class="header-content">
            <span class="page-eyebrow">KÜTÜPHANE YÖNETİMİ</span>
            <h1>{{ library.name }}</h1>
            <p class="page-desc">
              Kütüphane bilgilerini, kitap stoğunu ve kütüphaneye kayıtlı üyeleri yönetin.
            </p>
          </div>
          <div class="header-icon" aria-hidden="true">🏛️</div>
        </header>

        <div v-if="pageError" class="msg error">⚠️ {{ pageError }}</div>
        <div v-if="pageSuccess" class="msg success">✓ {{ pageSuccess }}</div>

        <!-- 1. KÜTÜPHANE BİLGİLERİ KARTI -->
        <div class="form-card">
          <div class="section-header-row">
            <div>
              <h2>🏛️ Kütüphane Bilgileri</h2>
              <p class="sub-text">Adres: {{ library.address || 'Belirtilmemiş' }}</p>
            </div>
            <button class="edit-btn" @click="openEditLibModal">
              ✏️ Bilgileri Düzenle
            </button>
          </div>
        </div>

        <!-- 2. KİTAP STOĞU YÖNETİMİ (MODAL DESTEKLİ) -->
        <div class="form-card" style="margin-top: 24px;">
          <div class="section-header-row">
            <div>
              <h2>📚 Kitap Stoğu ({{ libraryBooks.length }} Çeşit, {{ totalStockCount }} Adet)</h2>
              <p class="sub-text">Bu kütüphanede mevcut olan kitapların envanterini yönetin.</p>
            </div>
            <button class="add-button" @click="openAddStockModal">
              + Yeni Kitap Stoğu Ekle
            </button>
          </div>

          <!-- Stok tablosu -->
          <div class="table-wrapper" style="margin-top: 16px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kitap</th>
                  <th>ISBN</th>
                  <th>Mevcut Adet</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="libraryBooks.length === 0">
                  <td colspan="4" class="empty-row">
                    Bu kütüphanede henüz kitap bulunmuyor.
                  </td>
                </tr>

                <tr v-for="lb in libraryBooks" :key="lb.id">
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span>📖</span>
                      <strong>{{ getBookTitle(lb.bookId) }}</strong>
                    </div>
                  </td>

                  <td>
                    <code class="isbn-code">{{ getBookIsbn(lb.bookId) }}</code>
                  </td>

                  <td>
                    <span :class="lb.quantity > 0 ? 'qty-good' : 'qty-zero'">
                      {{ lb.quantity }} adet
                    </span>
                  </td>

                  <td>
                    <div class="action-buttons">
                      <button class="edit-btn" @click="openEditStockModal(lb)">
                        ✏️ Adet Düzenle
                      </button>
                      <button class="delete-btn" @click="openDeleteStockModal(lb)">
                        🗑️ Stoktan Çıkar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. KÜTÜPHANENİN SAHİP OLDUĞU ÜYELER (5. İSTEK) -->
        <div class="form-card" style="margin-top: 24px;">
          <div class="section-header-row">
            <div>
              <h2>👥 Kütüphane Üyeleri ({{ libraryMembers.length }} Kayıtlı Üye)</h2>
              <p class="sub-text">
                Bu kütüphaneye kayıtlı üyeleri görüntüleyin, yeni üye ekleyin veya ilişiğini kesin.
              </p>
            </div>
            <button class="add-button" @click="openAddMemberModal">
              + Yeni Üye Kaydet
            </button>
          </div>

          <!-- Üyeler Tablosu -->
          <div class="table-wrapper" style="margin-top: 16px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Üye Adı Soyadı</th>
                  <th>E-posta</th>
                  <th>Yetki / Rol</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="libraryMembers.length === 0">
                  <td colspan="4" class="empty-row">
                    Bu kütüphaneye henüz kayıtlı bir üye bulunmuyor.
                  </td>
                </tr>

                <tr v-for="memberRecord in libraryMembers" :key="memberRecord.id">
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span>👤</span>
                      <strong>{{ getUserFullName(memberRecord.userId) }}</strong>
                    </div>
                  </td>

                  <td>{{ getUserEmail(memberRecord.userId) }}</td>

                  <td>
                    <span
                      class="role-badge"
                      :class="getUserRole(memberRecord.userId) === 'Admin' ? 'admin-badge' : 'user-badge'"
                    >
                      {{ getUserRole(memberRecord.userId) }}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      class="delete-btn"
                      :disabled="detachingId === memberRecord.id"
                      @click="removeMember(memberRecord)"
                    >
                      {{ detachingId === memberRecord.id ? 'İlişik Kesiliyor...' : '✕ Üyelikten Çıkar (İlişik Kes)' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ==============================================
           MODALLAR
           ============================================== -->
      <!-- 1. Kütüphane Bilgilerini Düzenleme Modalı -->
      <AdminModal
        v-model="showEditLibModal"
        title="Kütüphane Bilgilerini Düzenle"
        subtitle="Kütüphane adı ve adresini güncelleyin."
        icon="🏛️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updateLibraryInfo">
          <div class="form-group">
            <label>Kütüphane Adı</label>
            <input v-model="editLibForm.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Adres</label>
            <input v-model="editLibForm.address" type="text" />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showEditLibModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- 2. Kitap Stoğu Ekleme Modalı -->
      <AdminModal
        v-model="showAddStockModal"
        title="Kitap Stoğu Ekle"
        subtitle="Bu kütüphaneye yeni bir kitap ve başlangıç stok adedi ekleyin."
        icon="📚"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="addLibraryBook">
          <div class="form-group">
            <label>Kitap Seçin</label>
            <select v-model="newStock.bookId" required>
              <option value="">Kitap Seçin...</option>
              <option
                v-for="book in availableBooksForStock"
                :key="book.id"
                :value="book.id"
              >
                {{ book.title }} (ISBN: {{ book.isbn }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Stok Adedi</label>
            <input
              v-model.number="newStock.quantity"
              type="number"
              min="1"
              required
            />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddStockModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Ekleniyor...' : 'Stoka Ekle' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- 3. Kitap Stok Adedi Düzenleme Modalı -->
      <AdminModal
        v-model="showEditStockModal"
        title="Stok Adedini Güncelle"
        :subtitle="targetStockBook ? `${getBookTitle(targetStockBook.bookId)} için yeni stok adedi belirleyin.` : ''"
        icon="✏️"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="updateStockQuantity">
          <div class="form-group">
            <label>Stok Adedi</label>
            <input
              v-model.number="editStockQuantityValue"
              type="number"
              min="0"
              required
            />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showEditStockModal = false">İptal</button>
            <button type="submit" class="submit-btn" :disabled="modalLoading">
              {{ modalLoading ? 'Kaydediliyor...' : 'Adedi Güncelle' }}
            </button>
          </div>
        </form>
      </AdminModal>

      <!-- 4. Kitap Stok Silme Modalı -->
      <AdminModal
        v-model="showDeleteStockModal"
        title="Kitabı Stoktan Kaldır"
        subtitle="Bu kitabı bu kütüphanenin stoğundan tamamen kaldırmak istediğinize emin misiniz?"
        icon="🗑️"
      >
        <div class="modal-form">
          <p v-if="targetStockBook" style="color: #b93828;">
            ⚠️ <strong>{{ getBookTitle(targetStockBook.bookId) }}</strong> kitabı bu kütüphaneden kaldırılacaktır.
          </p>
          <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showDeleteStockModal = false">İptal</button>
            <button
              type="button"
              class="delete-btn"
              :disabled="modalLoading"
              @click="confirmDeleteStock"
            >
              {{ modalLoading ? 'Kaldırılıyor...' : 'Evet, Kaldır' }}
            </button>
          </div>
        </div>
      </AdminModal>

      <!-- 5. Kütüphaneye Yeni Üye Ekleme Modalı (5. İSTEK) -->
      <AdminModal
        v-model="showAddMemberModal"
        title="Kütüphaneye Yeni Üye Ekle"
        :subtitle="`${library.name} kadrosuna sistemden bir kullanıcı kaydedin.`"
        icon="👥"
      >
        <div v-if="modalError" class="msg error">⚠️ {{ modalError }}</div>
        <form class="modal-form" @submit.prevent="confirmAddMember">
          <div class="form-group">
            <label>Üye Olarak Eklenecek Kullanıcı</label>
            <select v-model="selectedUserIdToAdd" required>
              <option value="">Kullanıcı Seçin...</option>
              <option
                v-for="u in availableUsersForLibrary"
                :key="u.id"
                :value="u.id"
              >
                👤 {{ u.firstName }} {{ u.lastName }} ({{ u.email }})
              </option>
            </select>
          </div>

          <div class="modal-form-actions">
            <button type="button" class="cancel-btn" @click="showAddMemberModal = false">İptal</button>
            <button
              type="submit"
              class="submit-btn"
              :disabled="!selectedUserIdToAdd || modalLoading"
            >
              {{ modalLoading ? 'Ekleniyor...' : '+ Üyeyi Kütüphaneye Ekle' }}
            </button>
          </div>
        </form>
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

interface Book {
  id: string
  title: string
  isbn: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
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

const route = useRoute()
const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const libraryId = computed(() => route.params.id as string)

const library = ref<Library>({ id: '', name: '', address: '' })
const books = ref<Book[]>([])
const users = ref<User[]>([])
const libraryBooks = ref<LibraryBook[]>([])
const libraryMembers = ref<UserLibrary[]>([])

const loading = ref(true)
const loadError = ref('')
const pageSuccess = ref('')
const pageError = ref('')
const modalLoading = ref(false)
const modalError = ref('')
const detachingId = ref<string | null>(null)

// Modal Durumları
const showEditLibModal = ref(false)
const showAddStockModal = ref(false)
const showEditStockModal = ref(false)
const showDeleteStockModal = ref(false)
const showAddMemberModal = ref(false)

const editLibForm = ref({ name: '', address: '' })
const newStock = ref({ bookId: '', quantity: 1 })
const targetStockBook = ref<LibraryBook | null>(null)
const editStockQuantityValue = ref(0)
const selectedUserIdToAdd = ref('')

const totalStockCount = computed(() => {
  return libraryBooks.value.reduce((sum, lb) => sum + (lb.quantity || 0), 0)
})

// Henüz bu kütüphanede stoku olmayan kitaplar
const availableBooksForStock = computed(() => {
  const existingBookIds = new Set(libraryBooks.value.map(lb => lb.bookId))
  return books.value.filter(b => !existingBookIds.has(b.id))
})

// Henüz bu kütüphaneye üye olmayan kullanıcılar
const availableUsersForLibrary = computed(() => {
  const existingMemberUserIds = new Set(libraryMembers.value.map(m => m.userId))
  return users.value.filter(u => !existingMemberUserIds.has(u.id))
})

const getBookTitle = (bookId: string) => {
  const book = books.value.find(b => b.id === bookId)
  return book ? book.title : 'Bilinmeyen Kitap'
}

const getBookIsbn = (bookId: string) => {
  const book = books.value.find(b => b.id === bookId)
  return book?.isbn || '—'
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

// =======================
// MODAL AÇICILAR
// =======================
const openEditLibModal = () => {
  editLibForm.value = {
    name: library.value.name,
    address: library.value.address || ''
  }
  modalError.value = ''
  showEditLibModal.value = true
}

const openAddStockModal = () => {
  newStock.value = { bookId: '', quantity: 1 }
  modalError.value = ''
  showAddStockModal.value = true
}

const openEditStockModal = (lb: LibraryBook) => {
  targetStockBook.value = lb
  editStockQuantityValue.value = lb.quantity
  modalError.value = ''
  showEditStockModal.value = true
}

const openDeleteStockModal = (lb: LibraryBook) => {
  targetStockBook.value = lb
  modalError.value = ''
  showDeleteStockModal.value = true
}

const openAddMemberModal = () => {
  selectedUserIdToAdd.value = ''
  modalError.value = ''
  showAddMemberModal.value = true
}

// =======================
// API FONKSİYONLARI
// =======================
// 1. Kütüphane Bilgisi Güncelle (Modal)
const updateLibraryInfo = async () => {
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/Library/${libraryId.value}`, {
      method: 'PUT',
      body: {
        name: editLibForm.value.name,
        address: editLibForm.value.address
      }
    })
    library.value.name = editLibForm.value.name
    library.value.address = editLibForm.value.address
    showEditLibModal.value = false
    pageSuccess.value = 'Kütüphane bilgileri güncellendi.'
  } catch (error: any) {
    console.error('Kütüphane güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Kütüphane güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 2. Kitap Stoğu Ekle (Modal)
const addLibraryBook = async () => {
  if (!newStock.value.bookId || newStock.value.quantity < 1) {
    modalError.value = 'Lütfen geçerli bir kitap ve adet girin.'
    return
  }
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/LibraryBook', {
      method: 'POST',
      body: {
        libraryId: libraryId.value,
        bookId: newStock.value.bookId,
        quantity: newStock.value.quantity
      }
    })
    showAddStockModal.value = false
    pageSuccess.value = 'Kitap stoğa başarıyla eklendi.'
    await reloadLibraryBooks()
  } catch (error: any) {
    console.error('Stok eklenemedi:', error)
    modalError.value = error?.data?.message || 'Stok eklenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 3. Stok Adedi Güncelle (Modal)
const updateStockQuantity = async () => {
  if (!targetStockBook.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/LibraryBook/${targetStockBook.value.id}`, {
      method: 'PUT',
      body: {
        quantity: editStockQuantityValue.value
      }
    })
    targetStockBook.value.quantity = editStockQuantityValue.value
    showEditStockModal.value = false
    pageSuccess.value = 'Stok adedi başarıyla güncellendi.'
  } catch (error: any) {
    console.error('Stok güncellenemedi:', error)
    modalError.value = error?.data?.message || 'Stok güncellenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 4. Kitap Stoktan Kaldır
const confirmDeleteStock = async () => {
  if (!targetStockBook.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch(`/api/LibraryBook/${targetStockBook.value.id}`, {
      method: 'DELETE'
    })
    libraryBooks.value = libraryBooks.value.filter(lb => lb.id !== targetStockBook.value!.id)
    showDeleteStockModal.value = false
    pageSuccess.value = 'Kitap stoktan kaldırıldı.'
  } catch (error: any) {
    console.error('Stok silinemedi:', error)
    modalError.value = error?.data?.message || 'Stok kaldırılırken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 5. Kütüphaneye Üye Ekle (5. İstek)
const confirmAddMember = async () => {
  if (!selectedUserIdToAdd.value) return
  modalLoading.value = true
  modalError.value = ''
  try {
    await apiFetch('/api/UserLibrary', {
      method: 'POST',
      body: {
        userId: selectedUserIdToAdd.value,
        libraryId: libraryId.value
      }
    })
    showAddMemberModal.value = false
    pageSuccess.value = 'Üye kütüphaneye başarıyla kaydedildi.'
    await reloadMembers()
  } catch (error: any) {
    console.error('Üye eklenemedi:', error)
    modalError.value = error?.data?.message || 'Üye eklenirken hata oluştu.'
  } finally {
    modalLoading.value = false
  }
}

// 6. Üyeyi Kütüphaneden Çıkar (5. İstek)
const removeMember = async (record: UserLibrary) => {
  detachingId.value = record.id
  pageError.value = ''
  pageSuccess.value = ''
  try {
    await apiFetch(`/api/UserLibrary/${record.id}`, {
      method: 'DELETE'
    })
    pageSuccess.value = 'Üyenin kütüphane ilişiği kesildi.'
    libraryMembers.value = libraryMembers.value.filter(m => m.id !== record.id)
  } catch (error: any) {
    console.error('Üyelikten çıkarılamadı:', error)
    pageError.value = error?.data?.message || 'Üye çıkarılırken hata oluştu.'
  } finally {
    detachingId.value = null
  }
}

const reloadLibraryBooks = async () => {
  try {
    const data = await apiFetch<LibraryBook[]>(`/api/LibraryBook/library/${libraryId.value}`)
    libraryBooks.value = Array.isArray(data) ? data : []
  } catch {
    //
  }
}

const reloadMembers = async () => {
  try {
    const data = await apiFetch<UserLibrary[]>(`/api/UserLibrary/library/${libraryId.value}`)
    libraryMembers.value = Array.isArray(data) ? data : []
  } catch {
    //
  }
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [libData, bookData, userData, lbData, memberData] = await Promise.all([
      apiFetch<Library>(`/api/Library/${libraryId.value}`),
      apiFetch<Book[]>('/api/Book'),
      apiFetch<User[]>('/api/User'),
      apiFetch<LibraryBook[]>(`/api/LibraryBook/library/${libraryId.value}`).catch(() => []),
      apiFetch<UserLibrary[]>(`/api/UserLibrary/library/${libraryId.value}`).catch(() => [])
    ])

    library.value = libData
    books.value = Array.isArray(bookData) ? bookData : []
    users.value = Array.isArray(userData) ? userData : []
    libraryBooks.value = Array.isArray(lbData) ? lbData : []
    libraryMembers.value = Array.isArray(memberData) ? memberData : []
  } catch (error) {
    console.error('Veriler yüklenemedi:', error)
    loadError.value = 'Kütüphane bilgileri yüklenirken bir hata oluştu.'
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


.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.sub-text {
  margin: 4px 0 0;
  color: #8c735d;
  font-size: 13px;
}

.qty-good {
  background: #eef8ee;
  color: #276a2b;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #c6e6c6;
  font-size: 13px;
}

.qty-zero {
  background: #fff3f0;
  color: #a84d3d;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #f2c7bd;
  font-size: 13px;
}
</style>
