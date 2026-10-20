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

      <NuxtLink to="/admin/books" class="nav-item" :class="{ active: route.path.startsWith('/admin/books') }">
        <span class="nav-icon">📚</span>
        <span>Kitaplar</span>
      </NuxtLink>

      <NuxtLink to="/admin/libraries" class="nav-item" :class="{ active: route.path.startsWith('/admin/libraries') }">
        <span class="nav-icon">🏛️</span>
        <span>Kütüphaneler</span>
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

const adminEmail = ref('')

onMounted(() => {
  adminEmail.value = localStorage.getItem('email') ?? 'Admin'
})
</script>


<style scoped>

.admin-sidebar {
  width: 250px;
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


/* =========================
   Logo
========================= */

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
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
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.3px;
}

.logo-badge {
  display: inline-block;
  padding: 2px 7px;
  background: #b96b35;
  color: #fffaf4;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  border-radius: 6px;
  margin-top: 3px;
  width: fit-content;
}


/* =========================
   Nav
========================= */

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 12px;
  text-decoration: none;
  color: #765b48;
  font-size: 14px;
  font-weight: 650;
  transition: all 0.18s ease;
}

.nav-item:hover {
  background: #f4e7d7;
  color: #493122;
}

.nav-item.active {
  background: #b96b35;
  color: #fffaf4;
  box-shadow: 0 4px 10px rgba(185, 107, 53, 0.22);
}

.nav-icon {
  font-size: 16px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.nav-divider {
  height: 1px;
  background: #ebd9c8;
  margin: 10px 4px;
}


/* =========================
   Footer
========================= */

.sidebar-footer {
  padding: 16px 14px;
  border-top: 1px solid #ebd9c8;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fffdfa;
  border: 1px solid #ebd9c8;
  border-radius: 10px;
}

.admin-avatar {
  font-size: 18px;
  flex-shrink: 0;
}

.admin-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-role-tag {
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.admin-email {
  font-size: 12px;
  color: #493122;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #f0d0c8;
  border-radius: 10px;
  background: #fff5f2;
  color: #a84d3d;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.logout-button:hover {
  background: #fde8e3;
  border-color: #e5b3a8;
  color: #8a3427;
}

</style>
