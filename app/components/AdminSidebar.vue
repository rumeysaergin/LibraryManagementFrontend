<template>
  <aside class="admin-sidebar">

    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">📚</div>
      <div class="logo-text">
        <span class="logo-title">Library</span>
        <span class="logo-badge">Admin Paneli</span>
      </div>
    </div>

    <!-- KÜTÜPHANE SEÇİCİ & PANEL FİLTRESİ (SOL MENÜDE EN YUKARIDA) -->
    <div class="sidebar-library-selector">
      <div class="selector-label-row">
        <span class="selector-label">🏛️ AKTİF KÜTÜPHANE</span>
        <button
          v-if="selectedLibraryId"
          type="button"
          class="sidebar-clear-btn"
          @click="setLibraryId('')"
          title="Tüm Kütüphanelere Dön"
        >
          ✕ Tümü
        </button>
      </div>

      <!-- Kütüphane Arama -->
      <!-- Search input that selects library by name -->
      <div class="sidebar-search-box">
        <input
          v-model="searchQuery"
          @change="onSearchSelect"
          placeholder="Kütüphane ara..."
          class="sidebar-search-input"
          list="library-options"
        />
        <datalist id="library-options">
          <option value="">🌐 Tüm Kütüphaneler</option>
          <option v-for="lib in libraries" :key="lib.id" :value="lib.name">
            🏛️ {{ lib.name }}
          </option>
        </datalist>
      </div>



      <!-- Seçili Kütüphane Bilgi Rozeti -->
      <div v-if="selectedLibrary" class="sidebar-selected-badge">
        <span class="badge-dot"></span>
        <span class="badge-text" :title="selectedLibrary.name">
          {{ selectedLibrary.name }}
        </span>
      </div>
    </div>

    <!-- Navigasyon -->
    <nav class="sidebar-nav">

      <NuxtLink to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
        <span class="nav-icon">📊</span>
        <span>Ana Menü</span>
      </NuxtLink>

      <NuxtLink to="/admin/users" class="nav-item" :class="{ active: route.path.startsWith('/admin/users') }">
        <span class="nav-icon">👥</span>
        <span>Kullanıcılar</span>
      </NuxtLink>

      <NuxtLink to="/admin/loans" class="nav-item" :class="{ active: route.path.startsWith('/admin/loans') }">
        <span class="nav-icon">📖</span>
        <span>Ödünç İşlemleri</span>
      </NuxtLink>

      <NuxtLink to="/admin/fines" class="nav-item" :class="{ active: route.path.startsWith('/admin/fines') }">
        <span class="nav-icon">⚠️</span>
        <span>Cezalar</span>
      </NuxtLink>

      <div class="nav-divider"></div>

      <NuxtLink to="/admin/books" class="nav-item" :class="{ active: route.path.startsWith('/admin/books') }">
        <span class="nav-icon">📚</span>
        <span>Kitaplar</span>
      </NuxtLink>

      <NuxtLink to="/admin/categories" class="nav-item" :class="{ active: route.path.startsWith('/admin/categories') }">
        <span class="nav-icon">🏷️</span>
        <span>Kategoriler</span>
      </NuxtLink>

      <NuxtLink to="/admin/authors" class="nav-item" :class="{ active: route.path.startsWith('/admin/authors') }">
        <span class="nav-icon">✍️</span>
        <span>Yazarlar</span>
      </NuxtLink>

      <NuxtLink to="/admin/membership-plans" class="nav-item" :class="{ active: route.path.startsWith('/admin/membership-plans') }">
        <span class="nav-icon">👤</span>
        <span>Üyelik Planları</span>
      </NuxtLink>

      <!-- YENİ BÖLÜM: EN AŞAĞIDA KÜTÜPHANE YÖNETİMİ -->
      <div class="nav-divider"></div>

      <div class="nav-section-title">GENEL YÖNETİM</div>

      <NuxtLink to="/admin/libraries" class="nav-item" :class="{ active: route.path.startsWith('/admin/libraries') }">
        <span class="nav-icon">🏛️</span>
        <span>Kütüphaneler</span>
      </NuxtLink>

    </nav>

    <!-- Çıkış -->
    <div class="sidebar-footer">
      <div class="admin-info">
        <span class="admin-avatar">🔐</span>
        <div class="admin-meta">
          <span class="admin-role-tag">Yönetici</span>
          <span class="admin-email" :title="adminEmail">{{ adminEmail }}</span>
        </div>
      </div>
      <button type="button" class="logout-button" @click="adminLogout">
        <span>🚪</span>
        <span>Çıkış Yap</span>
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const { adminLogout } = useAdminAuth()
const {
  selectedLibraryId,
  selectedLibrary,
  libraries,
  loadLibraries,
  setLibraryId
} = useAdminLibrary()

const adminEmail = ref('')
const searchQuery = ref('')

const filteredLibraries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return libraries.value
  return libraries.value.filter(
    l =>
      l.name.toLowerCase().includes(q) ||
      (l.address && l.address.toLowerCase().includes(q))
  )
})

// Handler for search input that selects library by name
const onSearchSelect = () => {
  const name = searchQuery.value.trim()
  if (!name) {
    // No selection means all libraries
    setLibraryId('')
    return
  }
  const lib = libraries.value.find(l => l.name === name)
  setLibraryId(lib ? lib.id : '')
}

onMounted(async () => {
  adminEmail.value = localStorage.getItem('email') ?? 'Admin'
  await loadLibraries()
})
</script>

<style scoped>
.admin-sidebar {
  width: 260px;
  min-height: 100vh;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  background: linear-gradient(
    180deg,
    #fffdfa 0%,
    #fcf6ee 60%,
    #f7ece0 100%
  );
  border-right: 1px solid #e7d5c3;
  box-shadow: 4px 0 20px rgba(90, 59, 36, 0.04);
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 18px;
  border-bottom: 1px solid #ebd9c8;
}

.logo-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  border-radius: 12px;
  font-size: 22px;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  color: #493122;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.1;
}

.logo-badge {
  color: #a06a3e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* =========================================================
   Kütüphane Seçici (Sol Menü En Üst)
   ========================================================= */
.sidebar-library-selector {
  padding: 16px 16px 14px;
  background: #fbf3e9;
  border-bottom: 1px solid #ebd9c8;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selector-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #8c684c;
  text-transform: uppercase;
}

.sidebar-clear-btn {
  background: none;
  border: none;
  color: #b96b35;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.sidebar-clear-btn:hover {
  background: #ebd9c8;
}

.sidebar-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.sidebar-search-icon {
  position: absolute;
  left: 9px;
  color: #a4846c;
  font-size: 14px;
  pointer-events: none;
}

.sidebar-search-input {
  width: 100%;
  padding: 6px 10px 6px 28px;
  background: #fff;
  border: 1px solid #dcc2a7;
  border-radius: 8px;
  font-size: 12px;
  color: #46372d;
  box-sizing: border-box;
}

.sidebar-dropdown-box {
  width: 100%;
}

.sidebar-select {
  width: 100%;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #dcc2a7;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #493122;
  box-sizing: border-box;
  cursor: pointer;
}

.sidebar-selected-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #efe0d0;
  border: 1px solid #dfc7b0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #493122;
  font-weight: 700;
  overflow: hidden;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2e7d32;
  flex-shrink: 0;
}

.badge-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================================================
   Navigasyon
   ========================================================= */
.sidebar-nav {
  flex: 1;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  color: #6a5241;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #f4e8dc;
  color: #493122;
}

.nav-item.active {
  background: #493122;
  color: #fffdf9;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(73, 49, 34, 0.2);
}

.nav-icon {
  font-size: 18px;
}

.nav-divider {
  height: 1px;
  background: #ebd9c8;
  margin: 10px 4px;
}

.nav-section-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  color: #a06a3e;
  padding: 4px 14px 2px;
  text-transform: uppercase;
}

/* =========================================================
   Footer / Çıkış
   ========================================================= */
.sidebar-footer {
  padding: 16px 14px 20px;
  border-top: 1px solid #ebd9c8;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.admin-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-role-tag {
  font-size: 10px;
  font-weight: 800;
  color: #a06a3e;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.admin-email {
  font-size: 12px;
  color: #6a5241;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border: 1px solid #e2c9b1;
  border-radius: 10px;
  background: #fffdfa;
  color: #8c4334;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: #fff0ee;
  border-color: #f2c7bd;
  color: #b93828;
}
</style>
