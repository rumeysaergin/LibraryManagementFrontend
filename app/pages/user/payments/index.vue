
<template>
  <main class="payments-page">
    <section class="payments-container">
      <NuxtLink to="/user" class="back-link">
        ← Kullanıcı Paneline Dön
      </NuxtLink>

      <div class="page-header">
        <p class="subtitle">ÖDEME</p>
        <h1>Üyelik ve Ödeme İşlemleri</h1>
        <p class="description">
          Üyelik planınızı seçebilir, ödeme talebinizi oluşturabilir
          ve ödeme geçmişinizi görüntüleyebilirsiniz.
        </p>
      </div>

      <!-- Üyelik planı seçimi -->
      <section class="payment-section">
        <div class="section-header">
          <p class="section-label">ÜYELİK ÖDEMESİ</p>
          <h2>Üyelik planı seç</h2>
          <p class="section-description">
            Plan bilgileri veritabanından alınır. Ödeme tutarı sunucu
            tarafından belirlenir.
          </p>
        </div>

        <div v-if="plansLoading" class="message-card">
          Üyelik planları yükleniyor...
        </div>

        <div v-else-if="plansError" class="message-card error-card">
          <p>{{ plansError }}</p>
          <button
            type="button"
            class="secondary-button"
            @click="loadPageData"
          >
            Tekrar Dene
          </button>
        </div>

        <div v-else-if="plans.length === 0" class="message-card">
          Henüz görüntülenebilecek bir üyelik planı bulunmuyor.
        </div>

        <div v-else class="payment-card">
          <div class="form-group">
            <label for="membership-plan">Üyelik planı</label>

            <select
              id="membership-plan"
              v-model="selectedPlanId"
            >
              <option value="" disabled>
                Bir üyelik planı seçin
              </option>

              <option
                v-for="plan in plans"
                :key="plan.id"
                :value="plan.id"
              >
                {{ plan.name }} — {{ formatPrice(plan.price) }}
              </option>
            </select>
          </div>

          <div v-if="selectedPlan" class="selected-plan">
            <div class="plan-icon">📚</div>

            <div class="selected-plan-info">
              <p class="plan-label">SEÇİLEN PLAN</p>
              <h3>{{ selectedPlan.name }}</h3>
              <p class="plan-description">
                {{ selectedPlan.maxBorrowLimit }} kitap ödünç alma limiti
                · {{ selectedPlan.durationInDays }} gün
              </p>
            </div>
          </div>

          <div v-if="selectedPlan" class="payment-summary">
            <div class="summary-row">
              <span>Üyelik planı</span>
              <strong>{{ selectedPlan.name }}</strong>
            </div>

            <div class="summary-row">
              <span>Ödünç alma limiti</span>
              <strong>{{ selectedPlan.maxBorrowLimit }} kitap</strong>
            </div>

            <div class="summary-row">
              <span>Üyelik süresi</span>
              <strong>{{ selectedPlan.durationInDays }} gün</strong>
            </div>

            <div class="summary-row total">
              <span>Toplam tutar</span>
              <strong>{{ formatPrice(selectedPlan.price) }}</strong>
            </div>
          </div>

          <div class="payment-form">
            <div class="form-group">
              <label for="payment-method">Ödeme yöntemi</label>

              <select
                id="payment-method"
                v-model="paymentMethod"
              >
                <option value="CreditCard">Kredi kartı</option>
                <option value="BankTransfer">Banka havalesi</option>
                <option value="Cash">Nakit ödeme</option>
              </select>
            </div>

            <div class="info-box payment-notice">
              <div class="info-icon">ℹ️</div>
              <div>
                <strong>Önemli bilgi</strong>
                <p>
                  Bu işlem bir ödeme talebi oluşturur; kartınızdan para
                  çekilmez. Talebiniz yönetici onayına gönderilir.
                  Üyeliğiniz, ödeme yönetici tarafından onaylandığında
                  aktif olur. Gerçek para tahsilatı için ayrıca bir
                  ödeme sağlayıcısı entegrasyonu gerekir.
                </p>
              </div>
            </div>

            <p v-if="submitError" class="feedback error-feedback">
              {{ submitError }}
            </p>

            <p v-if="submitSuccess" class="feedback success-feedback">
              {{ submitSuccess }}
            </p>

            <button
              type="button"
              class="payment-button"
              :disabled="submitting || !selectedPlan"
              @click="createPaymentRequest"
            >
              {{
                submitting
                  ? 'Talep oluşturuluyor...'
                  : selectedPlan
                    ? `${formatPrice(selectedPlan.price)} Ödeme Talebi Oluştur`
                    : 'Önce bir plan seçin'
              }}
            </button>
          </div>
        </div>
      </section>

      <!-- Ödeme geçmişi -->
      <section class="history-section">
        <div class="section-header">
          <p class="section-label">GEÇMİŞ ÖDEMELER</p>
          <h2>Ödeme geçmişim</h2>
          <p class="section-description">
            Oluşturduğunuz ödeme taleplerinin durumunu buradan takip edebilirsiniz.
          </p>
        </div>

        <div v-if="historyLoading" class="message-card">
          Ödeme geçmişiniz yükleniyor...
        </div>

        <div v-else-if="historyError" class="message-card error-card">
          <p>{{ historyError }}</p>
          <button
            type="button"
            class="secondary-button"
            @click="loadPaymentHistory"
          >
            Tekrar Dene
          </button>
        </div>

        <div v-else-if="paymentHistory.length === 0" class="message-card">
          Henüz bir ödeme talebiniz bulunmuyor.
        </div>

        <div v-else class="history-card">
          <div class="history-header">
            <span>Üyelik Planı</span>
            <span>Tarih</span>
            <span>Tutar</span>
            <span>Durum</span>
          </div>

          <div
            v-for="payment in paymentHistory"
            :key="payment.id"
            class="history-row"
          >
            <div class="history-plan">
              <span class="mobile-label">Üyelik Planı</span>
              <strong>{{ getPaymentPlanName(payment) }}</strong>
            </div>

            <div>
              <span class="mobile-label">Tarih</span>
              <span>{{ formatDate(payment.paymentDate) }}</span>
            </div>

            <div>
              <span class="mobile-label">Tutar</span>
              <strong>{{ formatPrice(payment.amount) }}</strong>
            </div>

            <div>
              <span class="mobile-label">Durum</span>
              <span
                class="status-badge"
                :class="payment.isPaid ? 'status-success' : 'status-pending'"
              >
                {{ payment.isPaid ? 'Onaylandı' : 'Beklemede' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="info-box bottom-info">
        <div class="info-icon">ℹ️</div>
        <div>
          <strong>Ödeme durumu hakkında</strong>
          <p>
            Bekleyen taleplerde üyelik aktif değildir. Yönetici onayı
            sonrasında üyelik süresi başlar ve üyelik durumunuz güncellenir.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
interface MembershipPlan {
  id: string
  name: string
  maxBorrowLimit: number
  price: number
  durationInDays: number
}

interface UserMembership {
  id: string
  userId: string
  membershipPlanId: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface MembershipPayment {
  id: string
  userMembershipId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  isPaid: boolean
}

const route = useRoute()
const { apiFetch } = useApi()

const plans = ref<MembershipPlan[]>([])
const memberships = ref<UserMembership[]>([])
const paymentHistory = ref<MembershipPayment[]>([])

const selectedPlanId = ref('')
const paymentMethod = ref('CreditCard')

const plansLoading = ref(true)
const historyLoading = ref(true)
const submitting = ref(false)

const plansError = ref('')
const historyError = ref('')
const submitError = ref('')
const submitSuccess = ref('')

const selectedPlan = computed(() =>
  plans.value.find(plan => plan.id === selectedPlanId.value) ?? null
)

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2
  }).format(price)

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const getPaymentPlanName = (payment: MembershipPayment) => {
  const membership = memberships.value.find(
    item => item.id === payment.userMembershipId
  )

  if (!membership) {
    return 'Üyelik planı'
  }

  return plans.value.find(
    plan => plan.id === membership.membershipPlanId
  )?.name ?? 'Üyelik planı'
}

const loadPlans = async () => {
  plansLoading.value = true
  plansError.value = ''

  try {
    const result = await apiFetch<MembershipPlan[]>(
      '/api/MembershipPlan'
    )

    plans.value = result ?? []

    const queryPlanId = route.query.membershipPlanId
    const requestedPlanId = Array.isArray(queryPlanId)
      ? queryPlanId[0]
      : queryPlanId

    if (
      requestedPlanId &&
      plans.value.some(plan => plan.id === requestedPlanId)
    ) {
      selectedPlanId.value = requestedPlanId
    } else if (
      !selectedPlanId.value ||
      !plans.value.some(plan => plan.id === selectedPlanId.value)
    ) {
      selectedPlanId.value = ''
    }
  } catch (error) {
    console.error('Üyelik planları alınamadı:', error)
    plansError.value = 'Üyelik planları sunucudan alınamadı.'
  } finally {
    plansLoading.value = false
  }
}

const loadPaymentHistory = async () => {
  historyLoading.value = true
  historyError.value = ''

  try {
    const userId = import.meta.client
      ? localStorage.getItem('userId')
      : null

    if (!userId) {
      throw new Error(
        'Kullanıcı bilgisi bulunamadı. Lütfen yeniden giriş yapın.'
      )
    }

    const [membershipResult, paymentResult] = await Promise.all([
      apiFetch<UserMembership[]>(
        `/api/UserMembership/user/${encodeURIComponent(userId)}`
      ),
      apiFetch<MembershipPayment[]>(
        '/api/MembershipPayment/my-payments'
      )
    ])

    memberships.value = membershipResult ?? []

    paymentHistory.value = (paymentResult ?? []).slice().sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() -
        new Date(a.paymentDate).getTime()
    )
  } catch (error) {
    console.error('Ödeme geçmişi alınamadı:', error)

    historyError.value =
      error instanceof Error
        ? error.message
        : 'Ödeme geçmişi sunucudan alınamadı.'
  } finally {
    historyLoading.value = false
  }
}

const loadPageData = async () => {
  await Promise.all([
    loadPlans(),
    loadPaymentHistory()
  ])
}

const createPaymentRequest = async () => {
  submitError.value = ''
  submitSuccess.value = ''

  if (!selectedPlan.value) {
    submitError.value = 'Lütfen bir üyelik planı seçin.'
    return
  }

  if (!paymentMethod.value) {
    submitError.value = 'Lütfen bir ödeme yöntemi seçin.'
    return
  }

  submitting.value = true

  try {
    await apiFetch('/api/MembershipPayment', {
      method: 'POST',
      body: {
        membershipPlanId: selectedPlan.value.id,
        paymentMethod: paymentMethod.value
      }
    })

    submitSuccess.value =
      'Ödeme talebiniz oluşturuldu. Yönetici onayından sonra üyeliğiniz aktif olacaktır.'

    await loadPaymentHistory()
  } catch (error) {
    console.error('Ödeme talebi oluşturulamadı:', error)

    submitError.value =
      'Ödeme talebi oluşturulamadı. Oturumunuzu ve sunucu bağlantısını kontrol edip tekrar deneyin.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadPageData()
})
</script>

<style scoped>

.payments-page {
  min-height: calc(100vh - 75px);
  background:
    radial-gradient(
      ellipse at 0% 0%,
      rgba(255, 250, 242, 0.95) 0%,
      transparent 48%
    ),
    radial-gradient(
      ellipse at 100% 45%,
      rgba(222, 194, 165, 0.42) 0%,
      transparent 48%
    ),
    linear-gradient(
      135deg,
      #faf5ed 0%,
      #f1e4d5 35%,
      #e9d7c4 65%,
      #f7eee4 100%
    );
  background-attachment: fixed;
  color: #3f2b20;
  padding: 40px 24px 70px;
}


.payments-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Arka plansız geri dönüş bağlantısı */
.back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 8px 0;
  color: #684a35;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-link:hover {
  color: #a85d2d;
  background: transparent;
  transform: translateX(-2px);
}

/* Üst başlık kartı */
.page-header,
.payment-card,
.history-card,
.message-card {
  background: rgba(255, 252, 248, 0.97);
  border: 1px solid #dfc8b2;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(92, 57, 34, 0.08);
}

.page-header {
  margin-bottom: 42px;
  padding: 28px;
}

.page-header h1 {
  margin: 0 0 12px;
  color: #4b3021;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
}

.subtitle,
.section-label {
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

.description {
  max-width: 700px;
  margin: 0;
  color: #765b48;
  font-size: 15px;
  line-height: 1.7;
}

/* Bölüm başlıkları */
.payment-section,
.history-section {
  margin-bottom: 48px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0 0 8px;
  color: #4b3021;
  font-size: 24px;
  font-weight: 650;
}

.section-description {
  margin: 0;
  color: #765b48;
  font-size: 13px;
  line-height: 1.6;
}

/* Ödeme kartı ve form alanları */
.payment-card {
  padding: 28px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #5d4232;
  font-size: 13px;
  font-weight: 600;
}

.form-group select {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 13px;
  color: #4b3021;
  background: #fffdf9;
  border: 1px solid #d9c3ae;
  border-radius: 9px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group select:focus {
  border-color: #b96b35;
  box-shadow: 0 0 0 3px rgba(185, 107, 53, 0.12);
}

/* Seçilen plan */
.selected-plan {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 25px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ead9c9;
}

.plan-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: #f5e6d5;
  border: 1px solid #dfc8b2;
  border-radius: 13px;
  font-size: 24px;
}

.selected-plan-info {
  min-width: 0;
}

.plan-label {
  margin: 0 0 5px;
  color: #8a5835;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}

.selected-plan h3 {
  margin: 0 0 5px;
  color: #4b3021;
  font-size: 21px;
}

.plan-description {
  margin: 0;
  color: #765b48;
  font-size: 13px;
  line-height: 1.6;
}

/* Ödeme özeti */
.payment-summary {
  padding: 22px 0;
  border-bottom: 1px solid #ead9c9;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 13px;
  color: #765b48;
  font-size: 14px;
}

.summary-row strong {
  color: #4b3021;
  text-align: right;
}

.summary-row.total {
  margin: 18px 0 0;
  padding-top: 18px;
  border-top: 1px solid #ead9c9;
  color: #4b3021;
  font-size: 17px;
}

.summary-row.total strong {
  color: #a65f32;
  font-size: 22px;
}

/* Ödeme yöntemi ve bilgilendirme */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 24px;
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 16px 18px;
  color: #765b48;
  background: rgba(255, 250, 244, 0.96);
  border: 1px solid #dfc8b2;
  border-radius: 12px;
}

.payment-notice {
  margin: 0;
}

.info-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #f5e6d5;
  border-radius: 8px;
}

.info-box strong {
  display: block;
  margin-bottom: 5px;
  color: #5a3927;
  font-size: 14px;
}

.info-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
}

/* Butonlar */
.payment-button,
.secondary-button {
  padding: 13px 16px;
  color: #fff;
  background: #b96b35;
  border: 1px solid #b96b35;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.payment-button {
  width: 100%;
}

.payment-button:hover:not(:disabled),
.secondary-button:hover {
  background: #a85d2d;
  border-color: #a85d2d;
  transform: translateY(-1px);
}

.payment-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.payment-button:focus-visible,
.secondary-button:focus-visible,
.back-link:focus-visible {
  outline: 3px solid rgba(185, 107, 53, 0.35);
  outline-offset: 3px;
}

/* Yükleniyor, boş durum ve hata kartları */
.message-card {
  padding: 20px;
  color: #765b48;
  line-height: 1.6;
}

.error-card {
  border-color: #e3c2bc;
}

.error-card p {
  margin: 0 0 12px;
}

/* Başarı ve hata bildirimleri */
.feedback {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.error-feedback {
  color: #8a4035;
  background: #f9e9e6;
  border: 1px solid #e3c2bc;
}

.success-feedback {
  color: #397044;
  background: #e4f2e5;
  border: 1px solid #c8dfca;
}

/* Ödeme geçmişi tablosu */
.history-card {
  overflow: hidden;
}

.history-header,
.history-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  align-items: center;
  gap: 20px;
  padding: 18px 22px;
}

.history-header {
  color: #765b48;
  background: #f7ede2;
  border-bottom: 1px solid #dfc8b2;
  font-size: 12px;
  font-weight: 700;
}

.history-row {
  color: #765b48;
  border-bottom: 1px solid #eee1d5;
  font-size: 14px;
}

.history-row:last-child {
  border-bottom: none;
}

.history-row strong {
  color: #4b3021;
}

.history-plan {
  overflow-wrap: anywhere;
}

.status-badge {
  display: inline-block;
  width: fit-content;
  padding: 5px 10px;
  border: 1px solid transparent;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.status-success {
  color: #397044;
  background: #e4f2e5;
  border-color: #c8dfca;
}

.status-pending {
  color: #8a5835;
  background: #fff0d9;
  border-color: #e9cfaa;
}

.mobile-label {
  display: none;
}

.bottom-info {
  margin-top: 25px;
}

/* Tablet ve mobil */
@media (max-width: 700px) {
  .payments-page {
    padding: 30px 16px 50px;
  }

  .page-header {
    margin-bottom: 32px;
    padding: 22px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .payment-card {
    padding: 20px;
  }

  .section-header h2 {
    font-size: 21px;
  }

  .history-header {
    display: none;
  }

  .history-row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 20px;
  }

  .history-row > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .mobile-label {
    display: block;
    color: #8b7463;
    font-size: 11px;
  }

  .summary-row {
    font-size: 13px;
  }

  .info-box {
    padding: 14px;
  }
}

@media (max-width: 380px) {
  .payments-page {
    padding-right: 12px;
    padding-left: 12px;
  }

  .page-header {
    padding: 18px;
  }

  .payment-card {
    padding: 16px;
  }

  .summary-row {
    gap: 10px;
  }

  .summary-row.total strong {
    font-size: 19px;
  }

  .selected-plan {
    align-items: flex-start;
    gap: 12px;
  }

  .plan-icon {
    width: 44px;
    height: 44px;
    font-size: 21px;
  }
}
</style>
