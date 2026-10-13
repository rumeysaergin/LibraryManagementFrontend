<template>
  <main class="payment-page">

    <section class="payment-container">

      <!-- Geri dön -->
      <NuxtLink
        to="/user/fines"
        class="back-link"
      >
        ← Cezalarıma Dön
      </NuxtLink>


      <!-- Yükleniyor -->
      <div
        v-if="isPageLoading"
        class="state-box"
      >
        Ceza bilgileri yükleniyor...
      </div>


      <!-- Hata -->
      <div
        v-else-if="errorMessage"
        class="state-box error-state"
      >
        {{ errorMessage }}
      </div>


      <!-- Sayfa -->
      <template v-else-if="fine">

        <!-- Başlık -->
        <div class="page-header">

          <p class="subtitle">
            CEZA ÖDEMESİ
          </p>


          <p class="description">
            Ödenmemiş cezanızın ödemesini güvenli bir şekilde
            gerçekleştirebilirsiniz.
          </p>

        </div>


        <div class="payment-layout">

          <!-- Sol taraf: Ceza bilgisi -->
          <section class="fine-summary">

            <div class="card-header">

              <p class="section-label">
                ÖDEME BİLGİLERİ
              </p>

              <h2>
                Ceza Detayı
              </h2>

              <span class="section-description">
                Ödemeniz gereken cezanın ayrıntıları.
              </span>

            </div>


            <!-- Kitap -->
            <div class="book-section">

              <div class="book-icon">
                📖
              </div>

              <div>

                <h3>
                  {{ fine.bookTitle }}
                </h3>

                <p>
                  {{ fine.authorName }}
                </p>

              </div>

            </div>


            <!-- Detaylar -->
            <div class="details-list">

              <div class="detail-row">

                <span>
                  Kütüphane
                </span>

                <strong>
                  {{ fine.libraryName }}
                </strong>

              </div>


              <div class="detail-row">

                <span>
                  Ödünç Tarihi
                </span>

                <strong>
                  {{ formatDate(fine.borrowDate) }}
                </strong>

              </div>


              <div class="detail-row">

                <span>
                  Son Teslim Tarihi
                </span>

                <strong>
                  {{ formatDate(fine.dueDate) }}
                </strong>

              </div>


              <div class="detail-row">

                <span>
                  Gecikme
                </span>

                <strong class="danger-text">
                  {{ fine.lateDays }} gün
                </strong>

              </div>

            </div>


            <!-- Hesaplama -->
            <div class="calculation-box">

              <div>

                <span>
                  {{ fine.lateDays }} gün × 10₺
                </span>

                <strong>
                  {{ fine.amount }}₺
                </strong>

              </div>

              <p>
                Ceza tutarı gecikme süresine göre otomatik olarak
                hesaplanmıştır.
              </p>

            </div>


            <!-- Toplam -->
            <div class="total-row">

              <span>
                Ödenecek Tutar
              </span>

              <strong>
                {{ fine.amount }}₺
              </strong>

            </div>

          </section>


          <!-- Sağ taraf: Ödeme formu -->
          <section class="payment-card">

            <div class="card-header">

              <p class="section-label">
                ÖDEME YÖNTEMİ
              </p>

              <h2>
                Kart Bilgileri
              </h2>

              <span class="section-description">
                Ödemenizi kart bilgileriniz ile tamamlayın.
              </span>

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
                />

              </div>


              <!-- Kart numarası -->
              <div class="form-group">

                <label for="cardNumber">
                  Kart Numarası
                </label>

                <input
                  id="cardNumber"
                  v-model="cardNumber"
                  type="text"
                  inputmode="numeric"
                  maxlength="19"
                  placeholder="0000 0000 0000 0000"
                  required
                  @input="formatCardNumber"
                />

              </div>


              <!-- Son kullanma + CVV -->
              <div class="form-row">

                <div class="form-group">

                  <label for="expiryDate">
                    Son Kullanma
                  </label>

                  <input
                    id="expiryDate"
                    v-model="expiryDate"
                    type="text"
                    inputmode="numeric"
                    maxlength="5"
                    placeholder="AA/YY"
                    required
                    @input="formatExpiryDate"
                  />

                </div>


                <div class="form-group">

                  <label for="cvv">
                    CVV
                  </label>

                  <input
                    id="cvv"
                    v-model="cvv"
                    type="password"
                    inputmode="numeric"
                    maxlength="3"
                    placeholder="•••"
                    required
                  />

                </div>

              </div>


              <!-- Güvenlik -->
              <div class="security-info">

                <span class="security-icon">
                  🔒
                </span>

                <p>
                  Ödeme bilgileriniz güvenli şekilde işlenir.
                  Kart bilgileriniz sistemimizde saklanmaz.
                </p>

              </div>


              <!-- Hata -->
              <div
                v-if="paymentError"
                class="payment-error"
              >
                {{ paymentError }}
              </div>


              <!-- Ödeme butonu -->
              <button
                type="submit"
                class="payment-button"
                :disabled="isLoading"
              >

                <span v-if="!isLoading">
                  💳 {{ fine.amount }}₺ Ödemeyi Tamamla
                </span>

                <span v-else>
                  Ödeme işleniyor...
                </span>

              </button>

            </form>


            <!-- Başarılı ödeme -->
            <div
              v-if="paymentSuccess"
              class="success-box"
            >

              <div class="success-icon">
                ✓
              </div>

              <div>

                <h2>
                  Ödeme Başarılı
                </h2>

                <p>
                  {{ fine.amount }}₺ tutarındaki ceza ödemeniz
                  başarıyla gerçekleştirilmiştir.
                </p>

                <NuxtLink
                  to="/user/fines"
                  class="success-link"
                >
                  Cezalarıma Dön
                </NuxtLink>

              </div>

            </div>

          </section>

        </div>

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

/* =========================
   GENEL SAYFA
========================= */

.payment-page {
  min-height: calc(100vh - 75px);

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


.payment-container {
  max-width: 1100px;

  margin: 0 auto;
}


/* =========================
   GERİ DÖN
========================= */

.back-link {
  display: inline-block;

  margin-bottom: 25px;

  padding: 7px 11px;

  color: #7c4b2c;

  background: rgba(255, 250, 244, 0.92);

  border: 1px solid #dfc8b2;

  border-radius: 7px;

  text-decoration: none;

  font-size: 14px;

  font-weight: 600;

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.06);

  transition: 0.2s;
}


.back-link:hover {
  color: #5f3822;

  background: #fffaf4;

  border-color: #cdb197;

  transform: translateX(-2px);

  box-shadow:
    0 4px 10px rgba(92, 57, 34, 0.10);
}


/* =========================
   BAŞLIK
========================= */

.page-header {
  margin-bottom: 42px;

  padding: 26px 28px;

  background: rgba(255, 250, 244, 0.94);

  border: 1px solid #dfc8b2;

  border-radius: 20px;

  box-shadow:
    0 8px 25px rgba(92, 57, 34, 0.08);
}


.subtitle {
  display: inline-block;

  margin: 0 0 10px;

  padding: 5px 10px;

  color: #7c4b2c;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 6px;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: 0.8px;
}


.page-header h1 {
  display: inline-block;

  margin: 0 0 10px;

  padding: 5px 12px;

  color: #4b3021;

  background: rgba(255, 250, 244, 0.96);

  border-radius: 7px;

  font-size: 36px;

  font-weight: 650;

  letter-spacing: -0.5px;

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.07);
}


.description {
  max-width: 700px;

  margin: 0;

  color: #765b48;

  font-size: 15px;

  line-height: 1.6;
}


/* =========================
   İKİLİ LAYOUT
========================= */

.payment-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);

  gap: 24px;

  align-items: start;
}


/* =========================
   KARTLAR
========================= */

.fine-summary,
.payment-card {
  background: rgba(255, 252, 248, 0.96);

  border: 1px solid #dfc8b2;

  border-radius: 18px;

  padding: 28px;

  box-shadow:
    0 10px 28px rgba(92, 57, 34, 0.09);
}


/* =========================
   KART BAŞLIĞI
========================= */

.card-header {
  margin-bottom: 25px;
}


.section-label {
  display: inline-block;

  margin: 0 0 7px;

  padding: 5px 10px;

  color: #7c4b2c;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 6px;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: 0.8px;
}


.card-header h2 {
  display: inline-block;

  margin: 0 0 6px;

  padding: 5px 12px;

  color: #4b3021;

  background: rgba(255, 250, 244, 0.96);

  border-radius: 7px;

  font-size: 23px;

  font-weight: 650;

  letter-spacing: -0.3px;

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.07);
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


/* =========================
   KİTAP
========================= */

.book-section {
  display: flex;

  align-items: center;

  gap: 15px;

  padding-bottom: 22px;

  border-bottom: 1px solid #ead9c9;
}


.book-icon {
  width: 58px;

  height: 68px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  background:
    linear-gradient(
      135deg,
      #ead7c3,
      #f4e7d8
    );

  border: 1px solid #dfc8b2;

  border-radius: 10px;

  font-size: 27px;
}


.book-section h3 {
  color: #4b3021;

  font-size: 18px;

  margin: 0 0 5px;
}


.book-section p {
  color: #765b48;

  font-size: 14px;

  margin: 0;
}


/* =========================
   DETAYLAR
========================= */

.details-list {
  padding: 20px 0;

  border-bottom: 1px solid #ead9c9;
}


.detail-row {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  margin-bottom: 14px;
}


.detail-row:last-child {
  margin-bottom: 0;
}


.detail-row span {
  color: #a08b79;

  font-size: 13px;
}


.detail-row strong {
  color: #5c4030;

  font-size: 13px;

  text-align: right;
}


.danger-text {
  color: #a84d3d !important;
}


/* =========================
   HESAPLAMA
========================= */

.calculation-box {
  background: #f7ede2;

  border: 1px solid #ead9c9;

  border-radius: 10px;

  padding: 16px;

  margin-top: 20px;
}


.calculation-box div {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;
}


.calculation-box span {
  color: #765b48;

  font-size: 14px;
}


.calculation-box strong {
  color: #a84d3d;

  font-size: 18px;
}


.calculation-box p {
  color: #9a806c;

  font-size: 12px;

  line-height: 1.5;

  margin: 8px 0 0;
}


/* =========================
   TOPLAM
========================= */

.total-row {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  margin-top: 22px;
}


.total-row span {
  color: #5c4030;

  font-size: 15px;

  font-weight: 600;
}


.total-row strong {
  color: #a65f32;

  font-size: 28px;
}


/* =========================
   FORM
========================= */

.payment-form {
  display: flex;

  flex-direction: column;

  gap: 18px;
}


.form-group {
  display: flex;

  flex-direction: column;

  gap: 7px;
}


.form-group label {
  color: #5d4232;

  font-size: 13px;

  font-weight: 600;
}


.form-group input {
  width: 100%;

  box-sizing: border-box;

  color: #4b3021;

  background: #fffdf9;

  border: 1px solid #d9c3ae;

  border-radius: 9px;

  padding: 12px 13px;

  font-size: 14px;

  outline: none;

  transition: 0.2s;
}


.form-group input::placeholder {
  color: #b29b88;
}


.form-group input:focus {
  border-color: #b96b35;

  background: #fffaf4;

  box-shadow:
    0 0 0 3px rgba(185, 107, 53, 0.12);
}


.form-row {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 15px;
}


/* =========================
   GÜVENLİK
========================= */

.security-info {
  display: flex;

  align-items: flex-start;

  gap: 10px;

  background: #f5eadf;

  border: 1px solid #dfc8b2;

  border-radius: 9px;

  padding: 13px;
}


.security-icon {
  font-size: 16px;
}


.security-info p {
  color: #765b48;

  font-size: 12px;

  line-height: 1.5;

  margin: 0;
}


/* =========================
   ÖDEME BUTONU
========================= */

.payment-button {
  width: 100%;

  border: none;

  border-radius: 9px;

  background: #b96b35;

  color: white;

  padding: 14px;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  box-shadow:
    0 5px 14px rgba(139, 78, 37, 0.18);

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.payment-button:hover:not(:disabled) {
  background: #a95e2c;

  transform: translateY(-1px);

  box-shadow:
    0 7px 17px rgba(139, 78, 37, 0.22);
}


.payment-button:disabled {
  opacity: 0.65;

  cursor: not-allowed;

  transform: none;
}


/* =========================
   ÖDEME HATASI
========================= */

.payment-error {
  background: #fbefec;

  border: 1px solid #e5c4bc;

  color: #93493c;

  border-radius: 9px;

  padding: 12px;

  font-size: 13px;

  line-height: 1.5;
}


/* =========================
   STATE
========================= */

.state-box {
  background: rgba(255, 250, 244, 0.97);

  border: 1px solid #dfc8b2;

  border-radius: 14px;

  padding: 30px;

  text-align: center;

  color: #765b48;

  box-shadow:
    0 8px 22px rgba(92, 57, 34, 0.08);
}


.error-state {
  color: #93493c;

  background: #fbefec;

  border-color: #e5c4bc;
}


/* =========================
   BAŞARILI ÖDEME
========================= */

.success-box {
  display: flex;

  align-items: center;

  gap: 18px;

  background: #edf5e9;

  border: 1px solid #cbdcc5;

  border-radius: 14px;

  padding: 22px;

  margin-top: 24px;
}


.success-icon {
  width: 48px;

  height: 48px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  background: #5f8b55;

  color: white;

  border-radius: 50%;

  font-size: 24px;

  font-weight: 700;
}


.success-box h2 {
  color: #47703f;

  font-size: 18px;

  margin: 0 0 5px;
}


.success-box p {
  color: #66745f;

  font-size: 13px;

  margin: 0 0 10px;
}


.success-link {
  color: #47703f;

  font-size: 13px;

  font-weight: 600;

  text-decoration: none;
}


.success-link:hover {
  text-decoration: underline;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 800px) {

  .payment-layout {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 500px) {

  .payment-page {
    padding: 35px 16px 50px;
  }


  .page-header {
    padding: 22px;
  }


  .page-header h1 {
    font-size: 30px;
  }


  .fine-summary,
  .payment-card {
    padding: 22px;
  }


  .form-row {
    grid-template-columns: 1fr;
  }


  .detail-row {
    align-items: flex-start;

    flex-direction: column;

    gap: 4px;
  }


  .detail-row strong {
    text-align: left;
  }


  .section-description {
    margin-left: 8px;

    font-size: 12px;
  }


  .success-box {
    align-items: flex-start;

    padding: 18px;
  }

}

</style>