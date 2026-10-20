<template>
  <main class="user-page">
    <div class="dashboard-container">

      <!-- Hoş Geldin Başlığı -->
      <header class="page-header">
        <div class="header-content">
          <span class="page-eyebrow">KULLANICI PANELİ</span>

          <h1>Hoş geldin!</h1>

          <p>
            Kütüphane işlemlerinizi buradan kolayca yönetebilir,
            ödünç aldığınız kitapları takip edebilir ve üyelik
            bilgilerinizi görüntüleyebilirsiniz.
          </p>
        </div>

        <div class="header-icon" aria-hidden="true">
          📚
        </div>
      </header>

      <!-- İstatistikler -->
      <section class="stats-section">
        <div class="section-heading">
          <div>
            <h2>Genel Bakış</h2>
            <p>Kütüphane işlemlerinizin güncel durumu.</p>
          </div>
        </div>

        <div class="stats-grid">

          <!-- Kütüphanelerim -->
          <NuxtLink
            to="/user/libraries"
            class="stat-card"
          >
            <div class="stat-icon">
              🏛️
            </div>

            <div class="stat-content">
              <p class="stat-title">Kütüphanelerim</p>
              <p class="stat-value">{{ libraryCount }}</p>
              <span class="stat-description">
                Kayıtlı kütüphaneleriniz
              </span>
            </div>

            <span class="stat-arrow">→</span>
          </NuxtLink>

          <!-- Ödünç Aldıklarım -->
          <NuxtLink
            to="/user/loans"
            class="stat-card"
          >
            <div class="stat-icon">
              📖
            </div>

            <div class="stat-content">
              <p class="stat-title">Ödünç Aldıklarım</p>
              <p class="stat-value">{{ loanCount }}</p>
              <span class="stat-description">
                Henüz iade edilmemiş kitaplar
              </span>
            </div>

            <span class="stat-arrow">→</span>
          </NuxtLink>

          <!-- Aktif Cezalarım -->
          <NuxtLink
            to="/user/fines"
            class="stat-card"
          >
            <div class="stat-icon warning-icon">
              ⚠️
            </div>

            <div class="stat-content">
              <p class="stat-title">Aktif Cezalarım</p>
              <p class="stat-value">{{ fineCount }}</p>
              <span class="stat-description">
                Ödenmemiş ceza kayıtlarınız
              </span>
            </div>

            <span class="stat-arrow">→</span>
          </NuxtLink>

        </div>
      </section>

      <!-- Kütüphane İşlemleri -->
      <section class="quick-section">
        <div class="section-heading">
          <div>
            <h2>Kütüphane İşlemleri</h2>
            <p>
              Kitaplarınızı ve kütüphane işlemlerinizi tek yerden yönetin.
            </p>
          </div>
        </div>

        <div class="actions-grid">

          <!-- Kütüphanelerim -->
          <NuxtLink
            to="/user/libraries"
            class="action-card"
          >
            <div class="action-icon">🏛️</div>

            <div class="action-content">
              <h3>Kütüphanelerim</h3>
              <p>
                Kayıtlı olduğunuz kütüphaneleri ve üyeliklerinizi görüntüleyin.
              </p>
            </div>

            <span class="arrow">→</span>
          </NuxtLink>

          <!-- Kitaplar -->
          <NuxtLink
            to="/user/books"
            class="action-card"
          >
            <div class="action-icon">📚</div>

            <div class="action-content">
              <h3>Kitapları Keşfet</h3>
              <p>
                Üye olduğunuz kütüphanelerdeki kitapları inceleyin ve ödünç alın.
              </p>
            </div>

            <span class="arrow">→</span>
          </NuxtLink>

          <!-- Ödünçler -->
          <NuxtLink
            to="/user/loans"
            class="action-card"
          >
            <div class="action-icon">📖</div>

            <div class="action-content">
              <h3>Ödünç İşlemlerim</h3>
              <p>
                Ödünç aldığınız kitapları ve son teslim tarihlerini takip edin.
              </p>
            </div>

            <span class="arrow">→</span>
          </NuxtLink>

          <!-- Cezalar -->
          <NuxtLink
            to="/user/fines"
            class="action-card"
          >
            <div class="action-icon warning-icon">⚠️</div>

            <div class="action-content">
              <h3>Cezalarım</h3>
              <p>
                Aktif ve geçmiş ceza kayıtlarınızı görüntüleyin.
              </p>
            </div>

            <span class="arrow">→</span>
          </NuxtLink>

        </div>
      </section>

      <!-- Üyelik ve Ödeme -->
      <section class="quick-section membership-section">
        <div class="section-heading">
          <div>
            <h2>Üyelik ve Ödeme</h2>
            <p>
              Üyelik planlarınızı ve ödeme kayıtlarınızı yönetin.
            </p>
          </div>
        </div>

        <div class="actions-grid">

          <!-- Üyeliklerim -->
          <NuxtLink
            to="/user/membership"
            class="action-card"
          >
            <div class="action-icon">👤</div>

            <div class="action-content">
              <h3>Üyeliklerim</h3>
              <p>
                Mevcut üyeliğinizi görüntüleyin ve diğer üyelik planlarını inceleyin.
              </p>
            </div>

            <span class="arrow">→</span>
          </NuxtLink>

          <!-- Ödemelerim -->
          <NuxtLink
            to="/user/payments"
            class="action-card"
          >
            <div class="action-icon">💳</div>

            <div class="action-content">
              <h3>Ödemelerim</h3>
              <p>
                Üyelik ödemelerinizi ve ödeme geçmişinizi görüntüleyin.
              </p>
            </div>

            <span class="arrow">→</span>
          </NuxtLink>

        </div>
      </section>

    </div>
  </main>
</template>

<script setup lang="ts">
interface UserLibrary {
  id: string
  userId: string
  libraryId: string
}

interface Loan {
  id: string
  userId: string
  libraryBookId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: string
}

interface Fine {
  id: string
  loanId: string
  amount: number
  fineDate: string
  isPaid: boolean
}

const { apiFetch } = useApi()

const libraryCount = ref(0)
const loanCount = ref(0)
const fineCount = ref(0)

const loadDashboardData = async () => {
  try {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      console.error('Kullanıcı ID bulunamadı.')
      return
    }

    // Kullanıcının kayıtlı olduğu kütüphaneler
    const userLibraries = await apiFetch<UserLibrary[]>(
      `/api/UserLibrary/user/${encodeURIComponent(userId)}`
    )

    libraryCount.value = Array.isArray(userLibraries)
      ? userLibraries.length
      : 0

    // Kullanıcının ödünç kayıtları
    const userLoans = await apiFetch<Loan[]>(
      `/api/Loan/user/${encodeURIComponent(userId)}`
    )

    const safeLoans = Array.isArray(userLoans)
      ? userLoans
      : []

    // Yalnızca iade edilmemiş kitaplar
    const activeLoans = safeLoans.filter(
      loan => loan.returnDate == null
    )

    loanCount.value = activeLoans.length

    // Her ödünç kaydının cezalarını getir
    const fineRequests = safeLoans.map(async (loan) => {
      try {
        const fines = await apiFetch<Fine[]>(
          `/api/Fine/loan/${encodeURIComponent(loan.id)}`
        )

        return Array.isArray(fines) ? fines : []
      } catch (error) {
        console.error(
          `Loan ${loan.id} için ceza alınırken hata oluştu:`,
          error
        )

        return []
      }
    })

    const fineResults = await Promise.all(fineRequests)
    const allFines = fineResults.flat()

    // Yalnızca ödenmemiş cezalar
    const activeFines = allFines.filter(
      fine => !fine.isPaid
    )

    fineCount.value = activeFines.length

    console.log('Kullanıcı paneli verileri:', {
      libraryCount: libraryCount.value,
      loanCount: loanCount.value,
      fineCount: fineCount.value
    })
  } catch (error) {
    console.error(
      'Dashboard verileri alınırken hata oluştu:',
      error
    )
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 32px 20px 60px;
  background: #f6f0e7;
  color: #46372d;
}

.dashboard-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

/* Sayfa başlığı */
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
  padding: 30px 34px;
  overflow: hidden;
  background: linear-gradient(
    120deg,
    #fffdf9 0%,
    #fcf5ed 48%,
    #f9eee2 100%
  );
  border: 1px solid #e7d5c3;
  border-radius: 18px;
  box-shadow: 0 7px 22px rgba(90, 59, 36, 0.055);
}

.page-header::after {
  position: absolute;
  top: -65px;
  right: -35px;
  width: 200px;
  height: 200px;
  border: 1px solid rgba(169, 115, 72, 0.12);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.page-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #a06a3e;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.page-header h1 {
  margin: 0 0 10px;
  color: #493122;
  font-size: 32px;
  font-weight: 750;
  letter-spacing: -0.7px;
}

.page-header p {
  max-width: 680px;
  margin: 0;
  color: #816b58;
  font-size: 15px;
  line-height: 1.7;
}

.header-icon {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  border-radius: 15px;
  font-size: 35px;
}

/* Bölüm başlıkları */
.stats-section,
.quick-section {
  margin-bottom: 36px;
}

.membership-section {
  margin-bottom: 0;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 8px;
  color: #493629;
  font-size: 23px;
  font-weight: 750;
}

.section-heading p {
  margin: 0;
  color: #816b58;
  font-size: 14px;
  line-height: 1.7;
}

/* İstatistik kartları */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 22px;
  border: 1px solid #e6d8c9;
  border-radius: 16px;
  background: #fffdf9;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 6px 20px rgb(75 52 35 / 5%);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: #d8c3ae;
  box-shadow: 0 10px 25px rgb(75 52 35 / 9%);
}

.stat-icon,
.action-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
}

.stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 13px;
  font-size: 25px;
}

.warning-icon {
  background: #f7e8db;
  border-color: #ead1bd;
}

.stat-content {
  min-width: 0;
}

.stat-title {
  margin: 0 0 5px;
  color: #816b58;
  font-size: 13px;
  font-weight: 600;
}

.stat-value {
  margin: 0 0 5px;
  color: #493629;
  font-size: 29px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-description {
  display: block;
  color: #998575;
  font-size: 11px;
  line-height: 1.5;
}

.stat-arrow {
  margin-left: auto;
  color: #a06a3e;
  font-size: 21px;
  transition: transform 0.2s ease;
}

.stat-card:hover .stat-arrow {
  transform: translateX(3px);
}

/* İşlem kartları */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.action-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 17px;
  min-width: 0;
  padding: 22px;
  border: 1px solid #e6d8c9;
  border-radius: 16px;
  background: #fffdf9;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 6px 20px rgb(75 52 35 / 5%);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.action-card:hover {
  transform: translateY(-3px);
  border-color: #d8c3ae;
  box-shadow: 0 10px 25px rgb(75 52 35 / 9%);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  font-size: 23px;
}

.action-content {
  min-width: 0;
  padding-right: 18px;
}

.action-content h3 {
  margin: 0 0 7px;
  color: #493629;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.4;
}

.action-content p {
  margin: 0;
  color: #816b58;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.arrow {
  position: absolute;
  top: 50%;
  right: 19px;
  transform: translateY(-50%);
  color: #a06a3e;
  font-size: 21px;
  transition: transform 0.2s ease;
}

.action-card:hover .arrow {
  transform: translate(3px, -50%);
}

/* Klavye ile erişilebilirlik */
.stat-card:focus-visible,
.action-card:focus-visible {
  outline: 3px solid #b68a66;
  outline-offset: 3px;
}

/* Tablet */
@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 19px 21px;
  }

  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Mobil */
@media (max-width: 650px) {
  .user-page {
    padding: 24px 14px 40px;
  }

  .page-header {
    gap: 14px;
    padding: 24px 20px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .page-header p {
    font-size: 14px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    font-size: 27px;
  }

  .section-heading h2 {
    font-size: 21px;
  }

  .section-heading p {
    font-size: 13px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .action-card {
    padding: 18px;
    gap: 14px;
  }

  .action-content h3 {
    font-size: 15px;
  }

  .action-content p {
    font-size: 12px;
  }
}

@media (max-width: 380px) {
  .page-header {
    padding: 20px 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .header-icon {
    width: 46px;
    height: 46px;
    font-size: 23px;
  }

  .stat-card {
    gap: 12px;
    padding: 16px;
  }

  .stat-icon {
    width: 45px;
    height: 45px;
    font-size: 21px;
  }

  .stat-value {
    font-size: 25px;
  }

  .action-icon {
    width: 43px;
    height: 43px;
    font-size: 20px;
  }
}
</style>