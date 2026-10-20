<template>
  <main class="payment-page">
    <section class="payment-container">
      <NuxtLink to="/user/fines" class="back-link">
        <span class="back-arrow">←</span>
        Cezalarıma Dön
      </NuxtLink>

      <!-- Yükleniyor -->
      <div v-if="isPageLoading" class="state-box">
        <span class="loading-spinner"></span>
        <p>Ceza bilgileri yükleniyor...</p>
      </div>

      <!-- Hata -->
      <div v-else-if="errorMessage" class="state-box error-state">
        <div class="state-icon">!</div>
        <h2>Bir sorun oluştu</h2>
        <p>{{ errorMessage }}</p>

        <NuxtLink to="/user/fines" class="secondary-button">
          Cezalarıma Dön
        </NuxtLink>
      </div>

      <!-- Sayfa -->
      <template v-else-if="fine">
        <!-- Başlık -->
        <header class="page-header">
          <div class="header-icon">💳</div>

          <div class="header-content">
            <p class="subtitle">GÜVENLİ ÖDEME</p>

            <h1>Ceza Ödemesi</h1>

            <p class="description">
              Ceza detaylarını inceleyebilir ve ödemenizi bu sayfadan
              tamamlayabilirsiniz.
            </p>
          </div>

          <div class="header-badge">
            <span class="badge-dot"></span>
            Ödeme sayfası
          </div>
        </header>

        <div class="payment-layout">
          <!-- Sol taraf: Ceza bilgisi -->
          <section class="fine-summary">
            <div class="card-header">
              <div class="section-heading">
                <div class="section-icon">📚</div>

                <div>
                  <p class="section-label">CEZA BİLGİLERİ</p>
                  <h2>Ceza Detayı</h2>
                </div>
              </div>

              <p class="section-description">
                Ödeme yapılacak cezanın ayrıntıları.
              </p>
            </div>

            <!-- Kitap -->
            <div class="book-section">
              <div class="book-icon">📖</div>

              <div class="book-info">
                <span class="book-label">Ödünç alınan kitap</span>

                <h3>{{ fine.bookTitle }}</h3>

                <p>{{ fine.authorName }}</p>
              </div>
            </div>

            <!-- Detaylar -->
            <div class="details-list">
              <div class="detail-row">
                <span class="detail-label">Kütüphane</span>

                <strong>{{ fine.libraryName }}</strong>
              </div>

              <div class="detail-row">
                <span class="detail-label">Ödünç tarihi</span>

                <strong>{{ formatDate(fine.borrowDate) }}</strong>
              </div>

              <div class="detail-row">
                <span class="detail-label">Son teslim tarihi</span>

                <strong>{{ formatDate(fine.dueDate) }}</strong>
              </div>

              <div class="detail-row">
                <span class="detail-label">Gecikme süresi</span>

                <strong class="danger-text">
                  {{ fine.lateDays }} gün
                </strong>
              </div>
            </div>

            <!-- Hesaplama -->
            <div class="calculation-box">
              <div class="calculation-heading">
                <span class="calculation-icon">🧮</span>

                <span>Ceza hesaplaması</span>
              </div>

              <div class="calculation-row">
                <span>{{ fine.lateDays }} gün × 10 ₺</span>

                <strong>{{ fine.amount }} ₺</strong>
              </div>

              <p>
                Ceza tutarı, gecikme süresine göre hesaplanmıştır.
              </p>
            </div>

            <!-- Toplam -->
            <div class="total-row">
              <div>
                <span class="total-label">Toplam ödenecek tutar</span>
                <p>Ödeme tutarı</p>
              </div>

              <strong class="total-amount">
                {{ fine.amount }} <small>₺</small>
              </strong>
            </div>

            <div class="summary-note">
              <span>ℹ️</span>

              <p>
                Ödeme işlemini tamamlamadan önce ceza bilgilerinizi
                kontrol ediniz.
              </p>
            </div>
          </section>

          <!-- Sağ taraf: Ödeme formu -->
          <section class="payment-card">
            <div class="card-header">
              <div class="section-heading">
                <div class="section-icon">💳</div>

                <div>
                  <p class="section-label">ÖDEME YÖNTEMİ</p>
                  <h2>Kart Bilgileri</h2>
                </div>
              </div>

              <p class="section-description">
                Kart bilgilerinizi girerek devam edin.
              </p>
            </div>

            <div class="accepted-cards">
              <span class="accepted-cards-label">Kart ile ödeme</span>

              <div class="card-visual">
                <span class="card-chip"></span>
                <span class="card-visual-text">BANK CARD</span>
              </div>
            </div>

            <form
              v-if="!paymentSuccess"
              class="payment-form"
              @submit.prevent="completePayment"
            >
              <!-- Kart üzerindeki isim -->
              <div class="form-group">
                <label for="cardName">
                  Kart Üzerindeki Ad Soyad
                </label>

                <input
                  id="cardName"
                  v-model="cardName"
                  type="text"
                  placeholder="Ad Soyad"
                  required
                  autocomplete="cc-name"
                />
              </div>

              <!-- Kart numarası -->
              <div class="form-group">
                <label for="cardNumber">
                  Kart Numarası
                </label>

                <div class="input-with-icon">
                  <input
                    id="cardNumber"
                    v-model="cardNumber"
                    type="text"
                    inputmode="numeric"
                    maxlength="19"
                    placeholder="0000 0000 0000 0000"
                    required
                    autocomplete="cc-number"
                    @input="formatCardNumber"
                  />

                  <span class="input-icon">💳</span>
                </div>
              </div>

              <!-- Son kullanma + CVV -->
              <div class="form-row">
                <div class="form-group">
                  <label for="expiryDate">
                    Son Kullanma Tarihi
                  </label>

                  <input
                    id="expiryDate"
                    v-model="expiryDate"
                    type="text"
                    inputmode="numeric"
                    maxlength="5"
                    placeholder="AA/YY"
                    required
                    autocomplete="cc-exp"
                    @input="formatExpiryDate"
                  />
                </div>

                <div class="form-group">
                  <label for="cvv">
                    Güvenlik Kodu (CVV)
                  </label>

                  <input
                    id="cvv"
                    v-model="cvv"
                    type="password"
                    inputmode="numeric"
                    maxlength="3"
                    placeholder="•••"
                    required
                    autocomplete="cc-csc"
                  />
                </div>
              </div>

              <!-- Güvenlik -->
              <div class="security-info">
                <div class="security-icon">🔒</div>

                <div>
                  <strong>Güvenli ödeme bilgilendirmesi</strong>

                  <p>
                    Kart bilgileri bu uygulamanın ödeme isteğine
                    gönderilmez. Gerçek kart işlemleri için güvenli bir
                    ödeme sağlayıcısı kullanılmalıdır.
                  </p>
                </div>
              </div>

              <!-- Hata -->
              <div
                v-if="paymentError"
                class="payment-error"
                role="alert"
              >
                <span class="error-icon">!</span>
                <p>{{ paymentError }}</p>
              </div>

              <!-- Ödeme butonu -->
              <button
                type="submit"
                class="payment-button"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">
                  <span>🔒</span>
                  {{ fine.amount }} ₺ Ödemeyi Tamamla
                  <span class="button-arrow">→</span>
                </span>

                <span v-else class="loading-content">
                  <span class="button-spinner"></span>
                  Ödeme işleniyor...
                </span>
              </button>

              <p class="form-footnote">
                <span>✓</span>
                Ödeme işlemi tamamlandığında sonuç bu sayfada gösterilir.
              </p>
            </form>

            <!-- Başarılı ödeme -->
            <div v-if="paymentSuccess" class="success-box">
              <div class="success-icon">✓</div>

              <h2>Ödeme Başarılı!</h2>

              <p>
                {{ fine.amount }} ₺ tutarındaki ödeme isteğiniz
                başarıyla tamamlandı.
              </p>

              <div class="success-amount">
                <span>İşlem tutarı</span>
                <strong>{{ fine.amount }} ₺</strong>
              </div>

              <NuxtLink to="/user/fines" class="success-link">
                Cezalarıma Dön
                <span>→</span>
              </NuxtLink>
            </div>
          </section>
        </div>

        <footer class="page-footer">
          <span>📚</span>
          <p>Library Management</p>
          <span class="footer-separator">•</span>
          <p>Kütüphane üyelik ve ceza yönetimi</p>
        </footer>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">

interface Fine {
  id: string
  loanId: string
  amount: number
  fineDate: string
  isPaid: boolean
}

interface Loan {
  id: string
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

interface FineViewModel {
  id: string
  loanId: string
  amount: number
  isPaid: boolean
  borrowDate: string
  dueDate: string
  returnDate: string | null
  lateDays: number
  bookTitle: string
  authorName: string
  libraryName: string
}


const route = useRoute()

const { apiFetch } = useApi()


const fine = ref<FineViewModel | null>(null)

const isPageLoading = ref(true)
const isLoading = ref(false)

const errorMessage = ref('')
const paymentError = ref('')

const paymentSuccess = ref(false)


const cardName = ref('')
const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')


const formatDate = (date: string | null) => {

  if (!date) {
    return '-'
  }

  return new Date(date).toLocaleDateString('tr-TR')

}


const calculateLateDays = (
  dueDate: string,
  returnDate: string | null
) => {

  if (!returnDate) {
    return 0
  }

  const due = new Date(dueDate)

  const returned = new Date(returnDate)

  const difference =
    returned.getTime() - due.getTime()

  const days =
    Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    )

  return Math.max(days, 0)

}


const formatCardNumber = () => {

  let value = cardNumber.value

  value = value
    .replace(/\D/g, '')
    .slice(0, 16)

  value =
    value
      .replace(/(.{4})/g, '$1 ')
      .trim()

  cardNumber.value = value

}


const formatExpiryDate = () => {

  let value = expiryDate.value

  value = value
    .replace(/\D/g, '')
    .slice(0, 4)

  if (value.length >= 3) {

    value =
      value.slice(0, 2) +
      '/' +
      value.slice(2)

  }

  expiryDate.value = value

}


/*
|--------------------------------------------------------------------------
| Ceza bilgilerini yükle
|--------------------------------------------------------------------------
*/

const loadFine = async () => {

  try {

    isPageLoading.value = true

    errorMessage.value = ''

    if (!import.meta.client) {
      return
    }

    const fineId =
      route.query.fineId?.toString()

    if (!fineId) {

      throw new Error(
        'Ödeme yapılacak ceza bilgisi bulunamadı.'
      )

    }


    // Fine bilgisi
    const fineData =
      await apiFetch<Fine>(
        `/api/Fine/${fineId}`
      )


    if (fineData.isPaid) {

      throw new Error(
        'Bu ceza daha önce ödenmiş.'
      )

    }


    // Loan bilgisi
    const loan =
      await apiFetch<Loan>(
        `/api/Loan/${fineData.loanId}`
      )


    // LibraryBook bilgisi
    const libraryBook =
      await apiFetch<LibraryBook>(
        `/api/LibraryBook/${loan.libraryBookId}`
      )


    // Book bilgisi
    const book =
      await apiFetch<Book>(
        `/api/Book/${libraryBook.bookId}`
      )


    // Author bilgisi
    const author =
      await apiFetch<Author>(
        `/api/Author/${book.authorId}`
      )


    // Library bilgisi
    const library =
      await apiFetch<Library>(
        `/api/Library/${libraryBook.libraryId}`
      )


    fine.value = {

      id: fineData.id,

      loanId: fineData.loanId,

      amount: fineData.amount,

      isPaid: fineData.isPaid,

      borrowDate: loan.borrowDate,

      dueDate: loan.dueDate,

      returnDate: loan.returnDate,

      lateDays:
        calculateLateDays(
          loan.dueDate,
          loan.returnDate
        ),

      bookTitle: book.title,

      authorName: author.name,

      libraryName: library.name

    }

  }
  catch (error: any) {

    console.error(
      'Fine loading error:',
      error
    )

    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Ceza bilgileri yüklenirken bir hata oluştu.'

  }
  finally {

    isPageLoading.value = false

  }

}


/*
|--------------------------------------------------------------------------
| Ödeme işlemi
|--------------------------------------------------------------------------
*/

const completePayment = async () => {

  if (!fine.value) {
    return
  }

  try {

    isLoading.value = true

    paymentError.value = ''


    /*
     * Kart bilgileri backend'e gönderilmiyor.
     *
     * Backend yalnızca ödeme kaydının
     * gerekli bilgilerini alıyor.
     */

    await apiFetch(
      '/api/FinePayment',
      {
        method: 'POST',

        body: {

          fineId: fine.value.id,

          amount: fine.value.amount,

          paymentDate:
            new Date().toISOString(),

          paymentMethod:
            'CreditCard'

        }

      }
    )


    paymentSuccess.value = true

  }
  catch (error: any) {

    console.error(
      'Payment error:',
      error
    )

    paymentError.value =
      error?.data?.message ||
      error?.message ||
      'Ödeme sırasında bir hata oluştu.'

  }
  finally {

    isLoading.value = false

  }

}


onMounted(() => {

  loadFine()

})

</script>


<style scoped>
/* GENEL SAYFA */
.payment-page {
  min-height: calc(100vh - 75px);
  box-sizing: border-box;
  padding: 38px 24px 55px;
  color: #433126;
  background:
    radial-gradient(
      circle at 10% 5%,
      rgba(223, 196, 168, 0.24),
      transparent 32%
    ),
    radial-gradient(
      circle at 95% 85%,
      rgba(192, 148, 111, 0.15),
      transparent 30%
    ),
    #f6f0e9;
}

.payment-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

/* GERİ DÖN */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 24px;
  padding: 10px 14px;
  color: #79553b;
  background: rgba(255, 252, 248, 0.9);
  border: 1px solid #e5d5c5;
  border-radius: 9px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 650;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.back-link:hover {
  background: #fff;
  border-color: #c6a486;
  transform: translateX(-3px);
}

.back-arrow {
  font-size: 17px;
}

/* BAŞLIK */
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 27px;
  padding: 27px 30px;
  overflow: hidden;
  background: linear-gradient(120deg, #fffdf9, #f9eee2);
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

.header-icon {
  display: flex;
  flex: 0 0 62px;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  border-radius: 15px;
  font-size: 27px;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.subtitle {
  margin: 0 0 6px;
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 0 0 8px;
  color: #493122;
  font-size: 30px;
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: -0.7px;
}

.description {
  max-width: 570px;
  margin: 0;
  color: #816b58;
  font-size: 13px;
  line-height: 1.7;
}

.header-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  color: #7b674e;
  background: #f5eadc;
  border: 1px solid #e7d6c2;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 650;
}

.badge-dot {
  width: 7px;
  height: 7px;
  background: #b47b49;
  border-radius: 50%;
}

/* İKİLİ LAYOUT */
.payment-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 22px;
}

/* ANA KARTLAR */
.fine-summary,
.payment-card {
  min-width: 0;
  padding: 25px;
  background: #fffdf9;
  border: 1px solid #e8d9c9;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(83, 54, 33, 0.055);
}

.card-header {
  margin-bottom: 22px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.section-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  background: #f4e7d9;
  border: 1px solid #ead8c4;
  border-radius: 11px;
  font-size: 19px;
}

.section-label {
  margin: 0 0 5px;
  color: #a16c41;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.card-header h2 {
  margin: 0;
  color: #4b3324;
  font-size: 21px;
  font-weight: 750;
  letter-spacing: -0.4px;
}

.section-description {
  display: block;
  margin: 0;
  color: #907b68;
  font-size: 12px;
  line-height: 1.6;
}

/* KİTAP BİLGİSİ */
.book-section {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 17px;
  background: #faf3eb;
  border: 1px solid #eee0d0;
  border-radius: 12px;
}

.book-icon {
  display: flex;
  flex: 0 0 56px;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 65px;
  background: linear-gradient(145deg, #ead6c1, #f6eadd);
  border: 1px solid #e1c7ad;
  border-radius: 8px;
  font-size: 25px;
}

.book-info {
  min-width: 0;
}

.book-label {
  display: block;
  margin-bottom: 5px;
  color: #a1856b;
  font-size: 10px;
  font-weight: 650;
}

.book-section h3 {
  margin: 0 0 5px;
  color: #4a3224;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.book-section p {
  margin: 0;
  color: #88715c;
  font-size: 12px;
}

/* CEZA DETAYLARI */
.details-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 11px 0;
  border-bottom: 1px solid #eee2d5;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
}

.detail-label {
  color: #917d6b;
  font-size: 12px;
}

.detail-row strong {
  max-width: 60%;
  color: #543c2c;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
  overflow-wrap: anywhere;
}

.detail-row .danger-text {
  color: #b54e3f;
}

/* CEZA HESAPLAMASI */
.calculation-box {
  margin-top: 17px;
  padding: 15px;
  background: #fbf4ec;
  border: 1px solid #ecddcc;
  border-radius: 11px;
}

.calculation-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: #77553b;
  font-size: 12px;
  font-weight: 700;
}

.calculation-icon {
  font-size: 15px;
}

.calculation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.calculation-row span {
  color: #816b57;
  font-size: 13px;
}

.calculation-row strong {
  color: #ad593d;
  font-size: 19px;
  font-weight: 800;
}

.calculation-box p {
  margin: 10px 0 0;
  color: #a08a76;
  font-size: 11px;
  line-height: 1.6;
}

/* TOPLAM TUTAR */
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 20px;
  padding: 17px;
  background: #f3e5d5;
  border: 1px solid #e7d1b9;
  border-radius: 11px;
}

.total-label {
  display: block;
  color: #65462f;
  font-size: 13px;
  font-weight: 750;
}

.total-row p {
  margin: 5px 0 0;
  color: #98785c;
  font-size: 11px;
}

.total-amount {
  color: #9d592f;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
  white-space: nowrap;
}

.total-amount small {
  font-size: 19px;
}

/* BİLGİ NOTU */
.summary-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 16px;
  padding: 12px;
  background: #faf7f1;
  border-radius: 9px;
}

.summary-note > span {
  font-size: 14px;
}

.summary-note p {
  margin: 0;
  color: #8e7b68;
  font-size: 11px;
  line-height: 1.6;
}

/* KART GÖRSELİ */
.accepted-cards {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
  padding: 15px;
  background: #faf3eb;
  border: 1px solid #eee0d0;
  border-radius: 12px;
}

.accepted-cards-label {
  color: #856d57;
  font-size: 12px;
  font-weight: 650;
}

.card-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 98px;
  height: 57px;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, #79513a, #b47d50);
  border-radius: 8px;
  box-shadow: 0 4px 9px rgba(91, 56, 34, 0.14);
}

.card-visual::after {
  position: absolute;
  right: -12px;
  bottom: -23px;
  width: 65px;
  height: 65px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  content: "";
}

.card-chip {
  width: 17px;
  height: 13px;
  background: #e7cba4;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 3px;
}

.card-visual-text {
  align-self: flex-end;
  color: rgba(255, 255, 255, 0.85);
  font-size: 6px;
  font-weight: 800;
  letter-spacing: 0.7px;
}

/* FORM */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-group label {
  color: #604631;
  font-size: 12px;
  font-weight: 700;
}

.form-group input {
  display: block;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 12px 13px;
  color: #493326;
  background: #fffefa;
  border: 1px solid #e1d1bf;
  border-radius: 9px;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.form-group input::placeholder {
  color: #b5a28f;
}

.form-group input:hover {
  border-color: #cdb398;
}

.form-group input:focus {
  background: #fff;
  border-color: #b47a4d;
  box-shadow: 0 0 0 3px rgba(180, 122, 77, 0.12);
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-right: 43px;
}

.input-icon {
  position: absolute;
  top: 50%;
  right: 13px;
  color: #a58567;
  font-size: 17px;
  pointer-events: none;
  transform: translateY(-50%);
}

.form-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

/* GÜVENLİK BİLGİSİ */
.security-info {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px;
  background: #f4f0e7;
  border: 1px solid #e7dfce;
  border-radius: 10px;
}

.security-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  background: #e7e1d0;
  border-radius: 8px;
  font-size: 15px;
}

.security-info strong {
  display: block;
  margin-bottom: 5px;
  color: #65533c;
  font-size: 11px;
}

.security-info p {
  margin: 0;
  color: #8a7964;
  font-size: 11px;
  line-height: 1.7;
}

/* ÖDEME HATASI */
.payment-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  color: #91483d;
  background: #fbefeb;
  border: 1px solid #edcfc7;
  border-radius: 9px;
}

.error-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #fff;
  background: #b85b4c;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
}

.payment-error p {
  margin: 1px 0 0;
  font-size: 12px;
  line-height: 1.6;
}

/* ÖDEME BUTONU */
.payment-button {
  width: 100%;
  min-height: 49px;
  padding: 13px 16px;
  color: #fffaf5;
  background: linear-gradient(135deg, #9c633c, #b77b4c);
  border: 1px solid #a66c42;
  border-radius: 10px;
  box-shadow: 0 5px 12px rgba(132, 80, 43, 0.15);
  font-family: inherit;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.payment-button > span:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.payment-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #875331, #a86b3e);
  box-shadow: 0 7px 16px rgba(132, 80, 43, 0.2);
  transform: translateY(-1px);
}

.payment-button:focus-visible,
.back-link:focus-visible,
.success-link:focus-visible,
.secondary-button:focus-visible {
  outline: 3px solid rgba(180, 122, 77, 0.35);
  outline-offset: 3px;
}

.payment-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.button-arrow {
  margin-left: auto;
  font-size: 17px;
}

.loading-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.button-spinner,
.loading-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-footnote {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 7px;
  margin: -4px 0 0;
  color: #98836e;
  font-size: 10px;
  line-height: 1.6;
  text-align: center;
}

.form-footnote span {
  color: #72885a;
  font-weight: 800;
}

/* YÜKLENİYOR / HATA DURUMU */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 200px;
  padding: 30px;
  color: #806b57;
  background: #fffdf9;
  border: 1px solid #e8d9c9;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(83, 54, 33, 0.05);
  text-align: center;
}

.state-box > p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
}

.loading-spinner {
  width: 27px;
  height: 27px;
  border-color: #ead9c7;
  border-top-color: #a46d43;
}

.state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #fff;
  background: #b85b4c;
  border-radius: 50%;
  font-size: 23px;
  font-weight: 800;
}

.error-state {
  color: #93493c;
  background: #fffaf7;
  border-color: #edcfc7;
}

.error-state h2 {
  margin: 0;
  color: #81483d;
  font-size: 20px;
}

.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 5px;
  padding: 10px 15px;
  color: #fff;
  background: #9c633c;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

/* BAŞARILI ÖDEME */
.success-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  background: #f5f8f0;
  border: 1px solid #dbe6d0;
  border-radius: 13px;
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-bottom: 17px;
  color: #fff;
  background: #68885a;
  border-radius: 50%;
  box-shadow: 0 5px 14px rgba(82, 119, 67, 0.18);
  font-size: 29px;
  font-weight: 800;
}

.success-box h2 {
  margin: 0 0 9px;
  color: #45643a;
  font-size: 22px;
  font-weight: 800;
}

.success-box > p {
  max-width: 310px;
  margin: 0;
  color: #718167;
  font-size: 12px;
  line-height: 1.7;
}

.success-amount {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
  gap: 12px;
  margin-top: 22px;
  padding: 15px;
  background: #eaf1e3;
  border: 1px solid #d7e3cd;
  border-radius: 9px;
}

.success-amount span {
  color: #65785b;
  font-size: 12px;
}

.success-amount strong {
  color: #456b39;
  font-size: 20px;
  font-weight: 800;
}

.success-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
  padding: 11px 16px;
  color: #fff;
  background: #668654;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}

.success-link:hover {
  background: #527341;
  transform: translateY(-1px);
}

/* ALT BİLGİ */
.page-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 24px;
  color: #a08b77;
  font-size: 11px;
}

.page-footer p {
  margin: 0;
}

.footer-separator {
  color: #c7b39f;
}

/* ANİMASYON */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* TABLET */
@media (max-width: 850px) {
  .payment-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  .fine-summary,
  .payment-card {
    padding: 24px;
  }

  .header-badge {
    display: none;
  }
}

/* MOBİL */
@media (max-width: 520px) {
  .payment-page {
    padding: 24px 13px 35px;
  }

  .back-link {
    margin-bottom: 18px;
  }

  .page-header {
    align-items: flex-start;
    gap: 13px;
    margin-bottom: 18px;
    padding: 21px 17px;
    border-radius: 14px;
  }

  .header-icon {
    flex-basis: 45px;
    width: 45px;
    height: 45px;
    border-radius: 11px;
    font-size: 21px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .description {
    font-size: 12px;
  }

  .fine-summary,
  .payment-card {
    padding: 19px 16px;
    border-radius: 13px;
  }

  .card-header h2 {
    font-size: 19px;
  }

  .book-section {
    align-items: flex-start;
    gap: 12px;
    padding: 13px;
  }

  .book-icon {
    flex-basis: 45px;
    width: 45px;
    height: 55px;
    font-size: 21px;
  }

  .book-section h3 {
    font-size: 14px;
  }

  .detail-row {
    gap: 12px;
  }

  .detail-row strong {
    max-width: 58%;
    font-size: 11px;
  }

  .detail-label {
    font-size: 11px;
  }

  .total-row {
    padding: 14px 12px;
  }

  .total-label {
    font-size: 12px;
  }

  .total-amount {
    font-size: 25px;
  }

  .form-row {
    gap: 11px;
  }

  .form-group label {
    font-size: 11px;
  }

  .form-group input {
    padding: 11px 10px;
    font-size: 12px;
  }

  .accepted-cards {
    padding: 12px;
  }

  .security-info {
    padding: 11px;
  }

  .page-footer {
    gap: 6px;
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>