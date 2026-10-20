
<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-main">
      <NuxtLink to="/admin/libraries" class="back-link">
        ← Kütüphane Listesine Dön
      </NuxtLink>

      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <p>Kütüphane bilgileri yükleniyor...</p>
      </div>

      <div v-else-if="loadError" class="state-card error-state">
        <p>{{ loadError }}</p>
        <button class="retry-btn" @click="loadData">Tekrar Dene</button>
      </div>

      <div v-else>
        <header class="page-header">
          <div class="header-content">
            <span class="page-eyebrow">KÜTÜPHANE DÜZENLE</span>
            <h1>{{ library.name }}</h1>
            <p class="page-desc">
              Kütüphane bilgilerini ve kütüphaneye ait kitap stoğunu yönetin.
            </p>
          </div>
          <div class="header-icon" aria-hidden="true">🏛️</div>
        </header>

        <div v-if="formError" class="msg error">⚠️ {{ formError }}</div>
        <div v-if="formSuccess" class="msg success">✓ {{ formSuccess }}</div>

        <!-- Kütüphane Bilgileri -->
        <div class="form-card">
          <h2>Kütüphane Bilgilerini Düzenle</h2>

          <form class="form-grid" @submit.prevent="updateLibrary">
            <div class="form-group">
              <label>Kütüphane Adı</label>
              <input v-model="library.name" type="text" required />
            </div>

            <div class="form-group">
              <label>Adres</label>
              <input v-model="library.address" type="text" />
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="submit-btn"
                :disabled="saving"
              >
                {{ saving ? 'Kaydediliyor...' : 'Kütüphaneyi Güncelle' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Kitap Stoğu -->
        <div class="form-card">
          <div class="stock-header">
            <h2>Kitap Stoğu</h2>
            <button
              class="add-button-sm"
              @click="showStockForm = !showStockForm"
            >
              {{ showStockForm ? '✕ İptal' : '+ Kitap Ekle' }}
            </button>
          </div>

          <!-- Stok ekleme formu -->
          <form
            v-if="showStockForm"
            class="form-grid stock-form"
            @submit.prevent="addLibraryBook"
          >
            <div class="form-group">
              <label>Kitap</label>
              <select v-model="newStock.bookId" required>
                <option value="">Kitap Seçin</option>
                <option
                  v-for="book in books"
                  :key="book.id"
                  :value="book.id"
                >
                  {{ book.title }} ({{ book.isbn }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Adet</label>
              <input
                v-model.number="newStock.quantity"
                type="number"
                min="1"
                required
              />
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="submit-btn"
                :disabled="stockLoading"
              >
                {{ stockLoading ? 'Ekleniyor...' : 'Stoka Ekle' }}
              </button>
            </div>
          </form>

          <!-- Stok tablosu -->
          <table class="data-table" style="margin-top: 16px;">
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
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span>📖</span>
                    <strong>{{ getBookTitle(lb.bookId) }}</strong>
                  </div>
                </td>

                <td>
                  <code class="isbn-code">{{ getBookIsbn(lb.bookId) }}</code>
                </td>

                <td>
                  <div
                    class="quantity-cell"
                    v-if="editingStockId !== lb.id"
                  >
                    <span :class="lb.quantity > 0 ? 'qty-good' : 'qty-zero'">
                      {{ lb.quantity }} adet
                    </span>
                    <button
                      class="edit-btn-sm"
                      @click="startEditStock(lb)"
                    >
                      ✏️
                    </button>
                  </div>

                  <div class="quantity-edit" v-else>
                    <input
                      v-model.number="editingQty"
                      type="number"
                      min="0"
                      class="qty-input"
                    />
                    <button
                      class="save-btn"
                      @click="saveStock(lb)"
                      :disabled="stockLoading"
                    >
                      ✓
                    </button>
                    <button
                      class="cancel-qty-btn"
                      @click="editingStockId = null"
                    >
                      ✕
                    </button>
                  </div>
                </td>

                <td>
                  <button
                    class="delete-btn"
                    @click="deleteLibraryBook(lb)"
                  >
                    🗑️ Sil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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

const route = useRoute()
const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

const libraryId = computed(() => route.params.id as string)

const library = ref<Library>({
  id: '',
  name: '',
  address: ''
})

const books = ref<Book[]>([])
const libraryBooks = ref<LibraryBook[]>([])

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const formError = ref('')
const formSuccess = ref('')

const showStockForm = ref(false)
const stockLoading = ref(false)
const newStock = ref({
  bookId: '',
  quantity: 1
})

const editingStockId = ref<string | null>(null)
const editingQty = ref(0)

const getBookTitle = (bookId: string) =>
  books.value.find(book => book.id === bookId)?.title ?? '—'

const getBookIsbn = (bookId: string) =>
  books.value.find(book => book.id === bookId)?.isbn ?? '—'

const startEditStock = (lb: LibraryBook) => {
  editingStockId.value = lb.id
  editingQty.value = lb.quantity
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const [libData, bookData, lbData] = await Promise.all([
      apiFetch<Library>(`/api/Library/${libraryId.value}`),
      apiFetch<Book[]>('/api/Book'),
      apiFetch<LibraryBook[]>('/api/LibraryBook')
    ])

    library.value = {
      id: libData.id,
      name: libData.name,
      address: libData.address ?? ''
    }

    books.value = Array.isArray(bookData) ? bookData : []

    libraryBooks.value = (
      Array.isArray(lbData) ? lbData : []
    ).filter(lb => lb.libraryId === libraryId.value)
  } catch (error) {
    console.error('Kütüphane verileri yüklenirken hata:', error)
    loadError.value = 'Veriler yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}

const updateLibrary = async () => {
  formError.value = ''
  formSuccess.value = ''
  saving.value = true

  try {
    await apiFetch(`/api/Library/${libraryId.value}`, {
      method: 'PUT',
      body: {
        name: library.value.name,
        address: library.value.address
      }
    })

    formSuccess.value = 'Kütüphane başarıyla güncellendi.'
  } catch (error: any) {
    formError.value =
      error?.data?.message ?? 'Güncelleme sırasında hata oluştu.'
  } finally {
    saving.value = false
  }
}

const addLibraryBook = async () => {
  stockLoading.value = true

  try {
    await apiFetch('/api/LibraryBook', {
      method: 'POST',
      body: {
        libraryId: libraryId.value,
        bookId: newStock.value.bookId,
        quantity: newStock.value.quantity
      }
    })

    newStock.value = {
      bookId: '',
      quantity: 1
    }

    showStockForm.value = false
    await loadData()
  } catch (error: any) {
    window.alert(error?.data?.message ?? 'Kitap eklenirken hata oluştu.')
  } finally {
    stockLoading.value = false
  }
}

const saveStock = async (lb: LibraryBook) => {
  stockLoading.value = true

  try {
    await apiFetch(`/api/LibraryBook/${lb.id}`, {
      method: 'PUT',
      body: {
        libraryId: lb.libraryId,
        bookId: lb.bookId,
        quantity: editingQty.value
      }
    })

    editingStockId.value = null
    await loadData()
  } catch (error: any) {
    window.alert(error?.data?.message ?? 'Stok güncellenirken hata oluştu.')
  } finally {
    stockLoading.value = false
  }
}

const deleteLibraryBook = async (lb: LibraryBook) => {
  const confirmed = window.confirm(
    'Bu kitabı kütüphane stoğundan silmek istediğinize emin misiniz?'
  )

  if (!confirmed) return

  try {
    await apiFetch(`/api/LibraryBook/${lb.id}`, {
      method: 'DELETE'
    })

    await loadData()
  } catch (error: any) {
    window.alert(error?.data?.message ?? 'Silme sırasında hata oluştu.')
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadData()
})
</script>

<style scoped>
@import "../../../../styles/admin.css";

.stock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stock-header h2 {
  color: #4b3021;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.add-button-sm {
  padding: 8px 14px;
  background: #b96b35;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button-sm:hover {
  background: #a55c2a;
}

.stock-form {
  padding: 16px;
  background: #fdf8f4;
  border: 1px solid #ead7c3;
  border-radius: 10px;
  margin-bottom: 16px;
}

.quantity-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-good {
  color: #2e7d32;
  font-weight: 700;
}

.qty-zero {
  color: #a84d3d;
  font-weight: 700;
}

.edit-btn-sm {
  padding: 4px 8px;
  background: #f5e6d5;
  border: 1px solid #dfc8b2;
  border-radius: 5px;
  font-size: 11px;
  cursor: pointer;
}

.quantity-edit {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-input {
  width: 70px;
  padding: 6px 8px;
  border: 1px solid #dfc8b2;
  border-radius: 6px;
  font-size: 13px;
  color: #3f2b20;
  outline: none;
}

.cancel-qty-btn {
  padding: 6px 8px;
  background: #f9e7e3;
  color: #a84d3d;
  border: 1px solid #e5c3b9;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.isbn-code {
  font-family: monospace;
  font-size: 12px;
  background: #f5e6d5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #7c4b2c;
}
</style>
