<template>
  <div class="page">
    <div class="container">

      <!-- Geri Dön -->
      <NuxtLink
        to="/user"
        class="back-link"
      >
        ← Kullanıcı Paneline Dön
      </NuxtLink>

      <!-- Başlık -->
      <div class="page-header">
        <div>
          <h1>Ödünç Aldıklarım</h1>
          <p>Ödünç aldığınız kitapları ve geçmiş işlemlerinizi görüntüleyin.</p>
        </div>
      </div>

      <!-- Yükleniyor -->
      <div v-if="loading" class="loading">
        Ödünç kitaplar yükleniyor...
      </div>

      <!-- Hata -->
      <div v-else-if="errorMessage" class="error-box">
        {{ errorMessage }}
      </div>

      <template v-else>

        <!-- Aktif Ödünçler -->
        <section class="section">

          <div class="section-header">

            <div class="section-title-group">
              <h2>Aktif Ödünçler</h2>

              <span class="section-description">
                İade edilmemiş kitaplarınız
              </span>
            </div>

            <span class="count-badge">
              {{ activeLoans.length }} kitap
            </span>

          </div>

          <!-- Aktif kitap yok -->
          <div
            v-if="activeLoans.length === 0"
            class="empty-box"
          >
            <div class="empty-icon">📚</div>

            <h3>Aktif ödünç kitabınız bulunmuyor.</h3>

            <p>
              Şu anda üzerinizde iade edilmemiş kitap bulunmamaktadır.
            </p>
          </div>

          <!-- Aktif kitaplar -->
          <div
            v-else
            class="loan-list"
          >

            <div
              v-for="loan in activeLoans"
              :key="loan.id"
              class="loan-card"
            >

              <div class="book-icon">
                📖
              </div>

              <div class="loan-content">

                <div class="loan-main">

                  <h3>{{ loan.bookTitle }}</h3>

                  <p class="author">
                    {{ loan.authorName }}
                  </p>

                  <div class="library">
                    <span>📍</span>
                    <span>{{ loan.libraryName }}</span>
                  </div>

                </div>

                <div class="loan-details">

                  <div class="date-item">
                    <span class="label">
                      Ödünç Tarihi
                    </span>

                    <strong>
                      {{ formatDate(loan.borrowDate) }}
                    </strong>
                  </div>

                  <div class="date-item">
                    <span class="label">
                      Son İade Tarihi
                    </span>

                    <strong>
                      {{ formatDate(loan.dueDate) }}
                    </strong>
                  </div>

                  <div
                    class="remaining"
                    :class="{
                      'late': loan.daysRemaining < 0,
                      'warning':
                        loan.daysRemaining >= 0 &&
                        loan.daysRemaining <= 3
                    }"
                  >

                    <span v-if="loan.daysRemaining > 0">
                      {{ loan.daysRemaining }} gün kaldı
                    </span>

                    <span v-else-if="loan.daysRemaining === 0">
                      Bugün iade edilmeli
                    </span>

                    <span v-else>
                      {{ Math.abs(loan.daysRemaining) }} gün gecikti
                    </span>

                  </div>

                  <button
                    type="button"
                    class="return-button"
                    :disabled="returningLoanId === loan.id"
                    @click="returnBook(loan)"
                  >
                    {{
                      returningLoanId === loan.id
                        ? 'İade ediliyor...'
                        : 'İade Et'
                    }}
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

        <!-- Ödünç Geçmişi -->
        <section class="section history-section">

          <div class="section-header">

            <div class="section-title-group">
              <h2>Ödünç Geçmişi</h2>

              <span class="section-description">
                Daha önce iade ettiğiniz kitaplar
              </span>
            </div>

          </div>

          <!-- Geçmiş yok -->
          <div
            v-if="returnedLoans.length === 0"
            class="empty-box"
          >
            <div class="empty-icon">📚</div>

            <h3>Ödünç geçmişiniz bulunmuyor.</h3>

            <p>
              Henüz iade edilmiş bir kitabınız bulunmamaktadır.
            </p>
          </div>

          <!-- Geçmiş -->
          <div
            v-else
            class="history-table-wrapper"
          >

            <table class="history-table">

              <thead>
                <tr>
                  <th>Kitap</th>
                  <th>Yazar</th>
                  <th>Kütüphane</th>
                  <th>Ödünç Tarihi</th>
                  <th>İade Tarihi</th>
                </tr>
              </thead>

              <tbody>

                <tr
                  v-for="loan in returnedLoans"
                  :key="loan.id"
                >

                  <td>
                    <strong>
                      {{ loan.bookTitle }}
                    </strong>
                  </td>

                  <td>
                    {{ loan.authorName }}
                  </td>

                  <td>
                    {{ loan.libraryName }}
                  </td>

                  <td>
                    {{ formatDate(loan.borrowDate) }}
                  </td>

                  <td>
                    {{ formatDate(loan.returnDate) }}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>

        <!-- Bilgilendirme -->
        <div class="info-box">

          <div class="info-icon">
            ℹ️
          </div>

          <div>

            <strong>
              Ödünç süresi hakkında
            </strong>

            <p>
              Kitapların ödünç süresi 15 gündür.
              Süresi geçen kitaplar için gecikilen her gün
              <strong>10 TL</strong> ceza uygulanır.
            </p>

          </div>

        </div>

      </template>

    </div>
  </div>
</template>

<script setup lang="ts">

interface Loan {
  id: string
  userId: string
  libraryBookId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: string
}

interface LibraryBook {
  id: string
  libraryId: string
  bookId: string
  quantity: number
}

interface Book {
  id: string
  title: string
  isbn: string
  authorId: string
  categoryId: string
}

interface Author {
  id: string
  name: string
}

interface Library {
  id: string
  name: string
  address: string
}

interface LoanViewModel {
  id: string
  userId: string
  libraryBookId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: string
  bookTitle: string
  authorName: string
  libraryName: string
  daysRemaining: number
}

const { apiFetch } = useApi()

const loading = ref(true)
const errorMessage = ref('')

const loans = ref<LoanViewModel[]>([])

const returningLoanId = ref<string | null>(null)

const activeLoans = computed(() => {
  return loans.value.filter(
    loan => loan.returnDate === null
  )
})

const returnedLoans = computed(() => {
  return loans.value.filter(
    loan => loan.returnDate !== null
  )
})

const formatDate = (date: string | null) => {
  if (!date) {
    return '-'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('tr-TR')
}

const calculateDaysRemaining = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)

  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const difference =
    due.getTime() - today.getTime()

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  )
}

const loadLoans = async () => {
  loading.value = true
  errorMessage.value = ''

  try {

    if (!import.meta.client) {
      return
    }

    const userId =
      localStorage.getItem('userId')

    if (!userId) {
      errorMessage.value =
        'Kullanıcı bilgisi bulunamadı.'

      return
    }

    const userLoans =
      await apiFetch<Loan[]>(
        `/api/Loan/user/${userId}`
      )

    const loanRequests =
      userLoans.map(async (loan) => {

        const libraryBook =
          await apiFetch<LibraryBook>(
            `/api/LibraryBook/${loan.libraryBookId}`
          )

        const book =
          await apiFetch<Book>(
            `/api/Book/${libraryBook.bookId}`
          )

        const author =
          await apiFetch<Author>(
            `/api/Author/${book.authorId}`
          )

        const library =
          await apiFetch<Library>(
            `/api/Library/${libraryBook.libraryId}`
          )

        return {
          id: loan.id,
          userId: loan.userId,
          libraryBookId: loan.libraryBookId,
          borrowDate: loan.borrowDate,
          dueDate: loan.dueDate,
          returnDate: loan.returnDate,
          status: loan.status,

          bookTitle: book.title,
          authorName: author.name,
          libraryName: library.name,

          daysRemaining:
            calculateDaysRemaining(
              loan.dueDate
            )
        }
      })

    loans.value =
      await Promise.all(loanRequests)

  } catch (error) {

    console.error(
      'Ödünç kitaplar yüklenirken hata oluştu:',
      error
    )

    errorMessage.value =
      'Ödünç kitaplar yüklenirken bir hata oluştu.'

  } finally {

    loading.value = false

  }
}

const returnBook =
  async (loan: LoanViewModel) => {

    const confirmed =
      window.confirm(
        `"${loan.bookTitle}" kitabını iade etmek istediğinize emin misiniz?`
      )

    if (!confirmed) {
      return
    }

    returningLoanId.value = loan.id

    try {

      await apiFetch(
        `/api/Loan/${loan.id}`,
        {
          method: 'PUT',

          body: {
            dueDate: loan.dueDate,
            returnDate:
              new Date().toISOString(),
            status: 'Returned'
          }
        }
      )

      await loadLoans()

    } catch (error) {

      console.error(
        'Kitap iade edilirken hata oluştu:',
        error
      )

      window.alert(
        'Kitap iade edilirken bir hata oluştu.'
      )

    } finally {

      returningLoanId.value = null

    }
  }

onMounted(() => {
  loadLoans()
})

</script>

<style scoped>

.page {
  min-height: 100vh;
  position: relative;

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
  padding: 40px 24px 70px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* GERİ DÖN */

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 28px;
  padding: 7px 12px;

  color: #4b3021;
  background: rgba(255, 250, 244, 0.92);

  border-radius: 7px;
  text-decoration: none;

  font-size: 14px;
  font-weight: 600;

  box-shadow: 0 2px 8px rgba(92, 57, 34, 0.08);

  transition: 0.2s ease;
}

.back-link:hover {
  background: #fffaf4;
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(92, 57, 34, 0.12);
}


/* BAŞLIK */

.page-header {
  margin-bottom: 35px;

  background: rgba(255, 250, 244, 0.98);
  border: 1px solid #dfc8b2;
  border-radius: 20px;

  padding: 34px 40px;

  box-shadow: 0 12px 35px rgba(92, 57, 34, 0.12);
}

.page-header h1 {
  display: inline-block;

  margin: 0 0 12px;
  padding: 5px 12px;

  color: #4b3021;
  background: rgba(255, 250, 244, 0.94);

  border-radius: 7px;

  font-size: 32px;
  font-weight: 650;
  letter-spacing: -0.5px;

  box-shadow: 0 2px 8px rgba(92, 57, 34, 0.07);
}

.page-header p {
  margin: 0;

  color: #765b48;
  font-size: 15px;
  line-height: 1.7;
}


/* BÖLÜMLER */

.section {
  margin-bottom: 42px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin-bottom: 18px;
}

.section-title-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.section-header h2 {
  display: inline-block;

  margin: 0 0 6px;
  padding: 5px 12px;

  color: #4b3021;
  background: rgba(255, 250, 244, 0.96);

  border-radius: 7px;

  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.4px;

  box-shadow: 0 2px 8px rgba(92, 57, 34, 0.07);
}

.section-description {
  display: block;

  margin-left: 12px;

  color: #765b48;
  background: rgba(255, 250, 244, 0.90);

  padding: 4px 9px;

  border-radius: 5px;

  font-size: 13px;
  font-weight: 500;

  line-height: 1.4;
}


/* KİTAP SAYISI */

.count-badge {
  padding: 7px 12px;

  background: #f5e6d5;
  color: #7c4b2c;

  border: 1px solid #dfc8b2;
  border-radius: 20px;

  font-size: 13px;
  font-weight: 600;
}


/* AKTİF ÖDÜNÇLER */

.loan-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loan-card {
  display: flex;
  gap: 20px;

  padding: 22px;

  background: rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;
  border-radius: 16px;

  box-shadow: 0 8px 24px rgba(92, 57, 34, 0.10);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.loan-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 12px 28px rgba(92, 57, 34, 0.14);
}


/* KİTAP İKONU */

.book-icon {
  width: 55px;
  height: 70px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    135deg,
    #ead7c3,
    #f4e7d8
  );

  border: 1px solid #dfc8b2;
  border-radius: 9px;

  font-size: 25px;
}


/* KİTAP İÇERİĞİ */

.loan-content {
  width: 100%;

  display: flex;
  justify-content: space-between;

  gap: 30px;
}

.loan-main {
  min-width: 180px;
}

.loan-main h3 {
  margin: 0 0 6px;

  color: #4b3021;
  font-size: 17px;
  font-weight: 650;
}

.author {
  margin: 0 0 12px;

  color: #765b48;
  font-size: 14px;
}

.library {
  display: flex;
  align-items: center;

  gap: 6px;

  color: #806b5b;
  font-size: 13px;
}


/* ÖDÜNÇ DETAYLARI */

.loan-details {
  display: flex;
  align-items: center;

  gap: 25px;
}

.date-item {
  display: flex;
  flex-direction: column;

  gap: 5px;

  min-width: 110px;
}

.label {
  color: #a08b79;
  font-size: 11px;
}

.date-item strong {
  color: #5c4030;
  font-size: 13px;
}


/* KALAN SÜRE */

.remaining {
  white-space: nowrap;

  color: #4f7a45;

  font-size: 13px;
  font-weight: 600;
}

.remaining.warning {
  color: #b27627;
}

.remaining.late {
  color: #a84d3d;
}


/* İADE BUTONU */

.return-button {
  padding: 10px 15px;

  border: none;
  border-radius: 8px;

  background: #b96b35;
  color: white;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
  white-space: nowrap;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.return-button:hover {
  background: #a95e2c;
  transform: translateY(-1px);
}

.return-button:disabled {
  background: #d8b59b;
  cursor: not-allowed;
  transform: none;
}


/* GEÇMİŞ */

.history-section {
  margin-top: 50px;
}

.history-table-wrapper {
  overflow-x: auto;

  background: rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;
  border-radius: 16px;

  box-shadow: 0 8px 24px rgba(92, 57, 34, 0.10);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  padding: 15px 18px;

  background: #f5eadf;

  border-bottom: 1px solid #dfc8b2;

  color: #806b5b;

  font-size: 12px;
  font-weight: 600;

  text-align: left;
}

.history-table td {
  padding: 16px 18px;

  border-bottom: 1px solid #ead9c8;

  color: #765b48;

  font-size: 13px;
}

.history-table tr:last-child td {
  border-bottom: none;
}

.history-table td strong {
  color: #4b3021;
  font-weight: 650;
}


/* BİLGİ KUTUSU */

.info-box {
  display: flex;
  align-items: flex-start;

  gap: 13px;

  padding: 18px;

  background: #f5eadf;

  border: 1px solid #dfc8b2;
  border-radius: 12px;

  box-shadow: 0 5px 15px rgba(92, 57, 34, 0.07);
}

.info-icon {
  font-size: 20px;
}

.info-box strong {
  color: #6b422b;
  font-size: 14px;
}

.info-box p {
  margin: 5px 0 0;

  color: #806b5b;

  font-size: 13px;
  line-height: 1.6;
}


/* LOADING */

.loading {
  padding: 50px;

  text-align: center;

  color: #806b5b;

  background: rgba(255, 250, 244, 0.97);

  border: 1px solid #dfc8b2;
  border-radius: 14px;

  box-shadow: 0 8px 22px rgba(92, 57, 34, 0.08);
}


/* HATA */

.error-box {
  padding: 18px;

  border: 1px solid #e5c4bc;
  border-radius: 12px;

  background: #fbefec;

  color: #93493c;

  font-size: 14px;

  box-shadow: 0 5px 15px rgba(92, 57, 34, 0.06);
}


/* BOŞ DURUM */

.empty-box {
  padding: 45px 20px;

  text-align: center;

  background: rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;
  border-radius: 16px;

  box-shadow: 0 8px 24px rgba(92, 57, 34, 0.10);
}

.empty-icon {
  margin-bottom: 12px;

  font-size: 35px;
}

.empty-box h3 {
  margin: 0 0 6px;

  color: #5c4030;

  font-size: 16px;
  font-weight: 650;
}

.empty-box p {
  margin: 0;

  color: #9a806c;

  font-size: 13px;
}


/* RESPONSIVE */

@media (max-width: 900px) {

  .loan-content {
    flex-direction: column;
  }

  .loan-details {
    flex-wrap: wrap;
  }

  .return-button {
    margin-top: 5px;
  }

}

@media (max-width: 700px) {

  .page-header {
    padding: 28px 24px;
  }

  .section-header {
    align-items: flex-start;
    gap: 15px;
  }

  .loan-card {
    padding: 19px;
  }

  .loan-details {
    align-items: flex-start;
  }

}

@media (max-width: 600px) {

  .page {
    padding: 30px 16px 50px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .section-header {
    flex-direction: column;
  }

  .loan-card {
    flex-direction: column;
    padding: 18px;
  }

  .book-icon {
    width: 50px;
    height: 62px;
  }

  .loan-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 13px;
  }

  .date-item {
    min-width: auto;
  }

  .return-button {
    width: 100%;
  }

  .history-table th,
  .history-table td {
    padding: 13px 14px;
  }

}
</style>