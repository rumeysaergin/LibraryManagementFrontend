<template>
  <main class="user-page">

    <section class="dashboard">

      <!-- Hoş Geldin -->
      <div class="welcome-section">

        <div class="welcome-content">

          <p class="subtitle">
            KULLANICI PANELİ
          </p>

          <h1>
            Hoş geldin! 
          </h1>

          <p class="description">
            Kütüphane işlemlerinizi buradan kolayca yönetebilirsiniz.
          </p>

        </div>

      </div>


      <!-- İstatistikler -->
      <div class="stats-grid">

        <!-- Kütüphanelerim -->
        <div class="stat-card">

          <div class="stat-icon">
            📚
          </div>

          <div>
            <p class="stat-title">
              Kütüphanelerim
            </p>

            <p class="stat-value">
              {{ libraryCount }}
            </p>
          </div>

        </div>


        <!-- Ödünçler -->
        <div class="stat-card">

          <div class="stat-icon">
            📖
          </div>

          <div>
            <p class="stat-title">
              Ödünç Aldıklarım
            </p>

            <p class="stat-value">
              {{ loanCount }}
            </p>
          </div>

        </div>


        <!-- Cezalar -->
        <div class="stat-card">

          <div class="stat-icon">
            ⚠️
          </div>

          <div>
            <p class="stat-title">
              Aktif Cezalarım
            </p>

            <p class="stat-value">
              {{ fineCount }}
            </p>
          </div>

        </div>

      </div>


      <!-- Kütüphane İşlemleri -->
      <section class="quick-section">

        <div class="section-header">

          <h2>
            Kütüphane İşlemleri
          </h2>

        </div>


        <div class="actions-grid">

          <!-- Kütüphanelerim -->
          <NuxtLink
            to="/user/libraries"
            class="action-card"
          >

            <div class="action-icon">
              🏛️
            </div>

            <div>
              <h3>
                Kütüphanelerim
              </h3>

              <p>
                Kayıtlı olduğunuz kütüphaneleri görüntüleyin.
              </p>
            </div>

            <span class="arrow">
              →
            </span>

          </NuxtLink>


          <!-- Kitaplar -->
          <NuxtLink
            to="/user/books"
            class="action-card"
          >

            <div class="action-icon">
              📚
            </div>

            <div>
              <h3>
                Kitapları Keşfet
              </h3>

              <p>
                Kütüphanelerde bulunan kitapları inceleyin.
              </p>
            </div>

            <span class="arrow">
              →
            </span>

          </NuxtLink>


          <!-- Ödünçler -->
          <NuxtLink
            to="/user/loans"
            class="action-card"
          >

            <div class="action-icon">
              📖
            </div>

            <div>
              <h3>
                Ödünç İşlemlerim
              </h3>

              <p>
                Ödünç aldığınız kitapları ve teslim tarihlerini takip edin.
              </p>
            </div>

            <span class="arrow">
              →
            </span>

          </NuxtLink>


          <!-- Cezalar -->
          <NuxtLink
            to="/user/fines"
            class="action-card"
          >

            <div class="action-icon">
              ⚠️
            </div>

            <div>
              <h3>
                Cezalarım
              </h3>

              <p>
                Aktif ve geçmiş cezalarınızı görüntüleyin.
              </p>
            </div>

            <span class="arrow">
              →
            </span>

          </NuxtLink>

        </div>

      </section>


      <!-- Üyelik ve Ödeme -->
      <section class="quick-section membership-section">

        <div class="section-header">

          <h2>
            Üyelik ve Ödeme
          </h2>

        </div>


        <div class="actions-grid">

          <!-- Üyeliklerim -->
          <NuxtLink
            to="/user/membership"
            class="action-card"
          >

            <div class="action-icon">
              👤
            </div>

            <div>
              <h3>
                Üyeliklerim
              </h3>

              <p>
                Mevcut üyeliğinizi görüntüleyin ve diğer üyelik planlarını inceleyin.
              </p>
            </div>

            <span class="arrow">
              →
            </span>

          </NuxtLink>


          <!-- Ödemelerim -->
          <NuxtLink
            to="/user/payments"
            class="action-card"
          >

            <div class="action-icon">
              💳
            </div>

            <div>
              <h3>
                Ödemelerim
              </h3>

              <p>
                Üyelik planı ödemelerinizi gerçekleştirin ve ödeme geçmişinizi görüntüleyin.
              </p>
            </div>

            <span class="arrow">
              →
            </span>

          </NuxtLink>

        </div>

      </section>

    </section>

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

      console.error(
        'Kullanıcı ID bulunamadı.'
      )

      return
    }


    // =========================
    // Kütüphanelerim
    // =========================

    const userLibraries =
      await apiFetch<UserLibrary[]>(
        `/api/UserLibrary/user/${userId}`
      )


    libraryCount.value =
      userLibraries.length


    console.log(
      'Kullanıcının kütüphaneleri:',
      userLibraries
    )


    console.log(
      'Kütüphane sayısı:',
      libraryCount.value
    )


    // =========================
    // Ödünçler
    // =========================

    const userLoans =
      await apiFetch<Loan[]>(
        `/api/Loan/user/${userId}`
      )


    // Sadece henüz iade edilmemiş kitaplar
    const activeLoans =
      userLoans.filter(
        loan => loan.returnDate === null
      )


    loanCount.value =
      activeLoans.length


    console.log(
      'Kullanıcının tüm ödünç kayıtları:',
      userLoans
    )


    console.log(
      'Aktif ödünç kayıtları:',
      activeLoans
    )


    console.log(
      'Aktif ödünç sayısı:',
      loanCount.value
    )


    // =========================
    // Cezalar
    // =========================

    const fineRequests =
      userLoans.map(async (loan) => {

        try {

          const fines =
            await apiFetch<Fine[]>(
              `/api/Fine/loan/${loan.id}`
            )

          return fines

        }
        catch (error) {

          console.error(
            `Loan ${loan.id} için ceza alınırken hata oluştu:`,
            error
          )

          return []

        }

      })


    const fineResults =
      await Promise.all(fineRequests)


    const allFines =
      fineResults.flat()


    // Sadece ödenmemiş cezalar
    const activeFines =
      allFines.filter(
        fine => !fine.isPaid
      )


    fineCount.value =
      activeFines.length


    console.log(
      'Kullanıcının tüm cezaları:',
      allFines
    )


    console.log(
      'Aktif cezalar:',
      activeFines
    )


    console.log(
      'Aktif ceza sayısı:',
      fineCount.value
    )

  }
  catch (error) {

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

  padding: 45px 24px 70px;

  box-sizing: border-box;

  background:
    linear-gradient(
      rgba(245, 237, 228, 0.54),
      rgba(245, 237, 228, 0.54)
    ),
    url("https://images.openai.com/static-rsc-4/xmPoryFkHin-rERvYKXFtYqEp51cj5lktGQMde8rwf827nL6z_I1_s116c5p_YutXUa6rLGoNMGvD6qI60fgm80NaihvgqBPXCrZjNv9HKfA_yCiMIMVlH_Tpk0icUCuzYBZ7cGa7_InYzyQw6XEtfHCNhH-3h_U95yftfn5oGClbRZNklaO4kOnKP2GfZSg?purpose=fullsize");

  background-size: cover;

  background-position: center;

  background-attachment: fixed;

  color: #3f2b20;
}


.dashboard {
  max-width: 1200px;

  margin: 0 auto;
}


/* =========================
   Hoş Geldin
========================= */

.welcome-section {
  width: 100%;

  margin-bottom: 38px;
}

.welcome-content {
  width: 100%;

  box-sizing: border-box;

  padding: 20px 24px;

  background: rgba(255, 250, 244, 0.95);

  border: 1px solid #dfc8b2;

  border-radius: 14px;

  box-shadow:
    0 6px 18px rgba(92, 57, 34, 0.08);
}

.subtitle {
  color: #7c4b2c;

  font-size: 12px;

  font-weight: 700;

  letter-spacing: 1px;

  margin: 0 0 7px;
}

.welcome-section h1 {
  color: #4b3021;

  font-size: 36px;

  font-weight: 650;

  margin: 0 0 8px;
}

.description {
  color: #765b48;

  font-size: 15px;

  line-height: 1.5;

  margin: 0;
}


/* =========================
   İstatistikler
========================= */

.stats-grid {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 18px;

  margin-bottom: 48px;
}

.stat-card {
  display: flex;

  align-items: center;

  gap: 17px;

  padding: 22px;

  background: rgba(255, 250, 244, 0.96);

  border: 1px solid #dfc8b2;

  border-radius: 16px;

  box-shadow:
    0 8px 22px rgba(92, 57, 34, 0.08);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 11px 26px rgba(92, 57, 34, 0.11);
}

.stat-icon {
  width: 52px;

  height: 52px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 12px;

  font-size: 24px;
}

.stat-title {
  color: #765b48;

  font-size: 13px;

  margin: 0 0 5px;
}

.stat-value {
  color: #4b3021;

  font-size: 28px;

  font-weight: 700;

  margin: 0;
}


/* =========================
   Bölümler
========================= */

.quick-section {
  width: 100%;

  margin-top: 10px;

  margin-bottom: 52px;
}

.membership-section {
  margin-bottom: 10px;
}

.section-header {
  width: 100%;

  box-sizing: border-box;

  margin-bottom: 20px;

  padding: 16px 20px;

  background: rgba(255, 250, 244, 0.95);

  border: 1px solid #dfc8b2;

  border-radius: 14px;

  box-shadow:
    0 6px 18px rgba(92, 57, 34, 0.08);
}

.section-header h2 {
  color: #4b3021;

  font-size: 25px;

  font-weight: 650;

  margin: 0;
}


/* =========================
   İşlem Kartları
========================= */

.actions-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 18px;
}

.action-card {
  position: relative;

  display: flex;

  align-items: center;

  gap: 18px;

  min-width: 0;

  padding: 22px;

  background: rgba(255, 250, 244, 0.96);

  border: 1px solid #dfc8b2;

  border-radius: 16px;

  text-decoration: none;

  box-shadow:
    0 8px 22px rgba(92, 57, 34, 0.07);

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.action-card:hover {
  border-color: #cdb197;

  transform: translateY(-2px);

  box-shadow:
    0 11px 26px rgba(92, 57, 34, 0.12);
}

.action-icon {
  width: 48px;

  height: 48px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 11px;

  font-size: 22px;
}

.action-card h3 {
  color: #4b3021;

  font-size: 16px;

  font-weight: 650;

  margin: 0 0 5px;
}

.action-card p {
  color: #765b48;

  font-size: 13px;

  line-height: 1.5;

  margin: 0;

  padding-right: 25px;
}

.arrow {
  position: absolute;

  right: 20px;

  color: #b96b35;

  font-size: 20px;

  transition:
    transform 0.2s ease;
}

.action-card:hover .arrow {
  transform: translateX(3px);
}


/* =========================
   Mobil
========================= */

@media (max-width: 768px) {

  .user-page {
    padding: 35px 18px 55px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .welcome-content {
    width: 100%;
  }

  .welcome-section h1 {
    font-size: 30px;
  }

  .section-header {
    padding: 14px 17px;
  }

  .section-header h2 {
    font-size: 22px;
  }

}


@media (max-width: 480px) {

  .user-page {
    padding: 28px 14px 45px;
  }

  .welcome-section h1 {
    font-size: 26px;
  }

  .description {
    font-size: 14px;
  }

  .stat-card {
    padding: 18px;
  }

  .action-card {
    padding: 18px;

    gap: 14px;
  }

  .action-card p {
    font-size: 12px;
  }

}

</style>