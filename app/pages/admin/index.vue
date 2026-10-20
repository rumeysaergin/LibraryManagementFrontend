<template>
  <div class="admin-layout">

    <AdminSidebar />

    <main class="admin-main">

      <!-- books/index.vue ile aynı page-header yapısı -->
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">YÖNETİM PANELİ</span>
          <h1>Ana Menü</h1>
          <p>
            Kütüphane sistemine genel bakış, istatistikler ve hızlı yönetim işlemleri.
          </p>
        </div>
        <div class="header-icon" aria-hidden="true">📊</div>
      </header>


      <!-- İstatistik Kartları -->
      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div>
            <p class="stat-title">Toplam Kullanıcı</p>
            <p class="stat-value">{{ stats.users }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div>
            <p class="stat-title">Toplam Kitap</p>
            <p class="stat-value">{{ stats.books }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🏛️</div>
          <div>
            <p class="stat-title">Kütüphane Sayısı</p>
            <p class="stat-value">{{ stats.libraries }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div>
            <p class="stat-title">Aktif Ödünç</p>
            <p class="stat-value">{{ stats.activeLoans }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚠️</div>
          <div>
            <p class="stat-title">Ödenmemiş Ceza</p>
            <p class="stat-value">{{ stats.unpaidFines }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✍️</div>
          <div>
            <p class="stat-title">Yazar Sayısı</p>
            <p class="stat-value">{{ stats.authors }}</p>
          </div>
        </div>

      </div>


      <!-- Hızlı Erişim -->
      <section class="quick-section">

        <div class="table-header-row" style="border-radius: 14px; margin-bottom: 18px; border: 1px solid #e7d5c3;">
          <h2 style="color: #493122; font-size: 20px; font-weight: 750; margin: 0;">Hızlı Erişim & Yönetim</h2>
          <span class="result-count">6 Modül</span>
        </div>

        <div class="actions-grid">

          <NuxtLink to="/admin/users" class="action-card">
            <div class="action-icon">👥</div>
            <div>
              <h3>Kullanıcı Yönetimi</h3>
              <p>Kullanıcıları görüntüleyin, ekleyin ve düzenleyin.</p>
            </div>
            <span class="arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/books" class="action-card">
            <div class="action-icon">📚</div>
            <div>
              <h3>Kitap Yönetimi</h3>
              <p>Kitap kataloğunu yönetin, ISBN ve yazar ekleyin.</p>
            </div>
            <span class="arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/libraries" class="action-card">
            <div class="action-icon">🏛️</div>
            <div>
              <h3>Kütüphane Yönetimi</h3>
              <p>Kütüphaneleri ve kitap stoklarını yönetin.</p>
            </div>
            <span class="arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/loans" class="action-card">
            <div class="action-icon">📖</div>
            <div>
              <h3>Ödünç İşlemleri</h3>
              <p>Tüm ödünç kayıtlarını ve gecikmeleri takip edin.</p>
            </div>
            <span class="arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/fines" class="action-card">
            <div class="action-icon">⚠️</div>
            <div>
              <h3>Ceza Yönetimi</h3>
              <p>Ceza kayıtlarını görüntüleyin ve ödeme onaylayın.</p>
            </div>
            <span class="arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/membership-plans" class="action-card">
            <div class="action-icon">👤</div>
            <div>
              <h3>Üyelik Planları</h3>
              <p>Üyelik plan limit ve fiyatlarını düzenleyin.</p>
            </div>
            <span class="arrow">→</span>
          </NuxtLink>

        </div>

      </section>

    </main>

  </div>
</template>


<script setup lang="ts">

const { checkAdminAuth } = useAdminAuth()
const { apiFetch } = useApi()

interface Stats {
  users: number
  books: number
  libraries: number
  activeLoans: number
  unpaidFines: number
  authors: number
}

const stats = ref<Stats>({
  users: 0,
  books: 0,
  libraries: 0,
  activeLoans: 0,
  unpaidFines: 0,
  authors: 0
})

const loadStats = async () => {
  try {
    const [users, books, libraries, loans, fines, authors] = await Promise.allSettled([
      apiFetch<any[]>('/api/User'),
      apiFetch<any[]>('/api/Book'),
      apiFetch<any[]>('/api/Library'),
      apiFetch<any[]>('/api/Loan'),
      apiFetch<any[]>('/api/Fine'),
      apiFetch<any[]>('/api/Author')
    ])

    if (users.status === 'fulfilled') {
      stats.value.users = Array.isArray(users.value) ? users.value.length : 0
    }

    if (books.status === 'fulfilled') {
      stats.value.books = Array.isArray(books.value) ? books.value.length : 0
    }

    if (libraries.status === 'fulfilled') {
      stats.value.libraries = Array.isArray(libraries.value) ? libraries.value.length : 0
    }

    if (loans.status === 'fulfilled' && Array.isArray(loans.value)) {
      stats.value.activeLoans = loans.value.filter(
        (l: any) => l.returnDate === null || l.returnDate === undefined
      ).length
    }

    if (fines.status === 'fulfilled' && Array.isArray(fines.value)) {
      stats.value.unpaidFines = fines.value.filter(
        (f: any) => !f.isPaid
      ).length
    }

    if (authors.status === 'fulfilled') {
      stats.value.authors = Array.isArray(authors.value) ? authors.value.length : 0
    }
  }
  catch (error) {
    console.error('Dashboard verileri yüklenirken hata:', error)
  }
}

onMounted(async () => {
  await checkAdminAuth()
  await loadStats()
})

</script>


<style scoped>
@import url('./../../styles/admin.css');
</style>
