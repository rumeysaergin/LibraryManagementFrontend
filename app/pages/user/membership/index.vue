
<template>
  <div class="membership-page">
    <div class="container">
      <!-- Geri dön -->
      <NuxtLink to="/user" class="back-link">
        <span class="back-arrow">←</span>
        Kullanıcı Paneline Dön
      </NuxtLink>

      <!-- Sayfa başlığı -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">📚</div>

          <div class="header-text">
            <span class="eyebrow">KÜTÜPHANE ÜYELİĞİ</span>
            <h1>Üyelik Paketlerim</h1>
            <p>
              Üyelik durumunu görüntüle, paketleri karşılaştır ve
              sana uygun üyelik seçeneğini incele.
            </p>
          </div>
        </div>
      </header>

      <!-- Genel yükleniyor -->
      <div v-if="loading" class="message-card loading-card">
        <span class="loading-spinner"></span>
        <span>Üyelik bilgileriniz yükleniyor...</span>
      </div>

      <!-- Üyelik bilgisi yüklenemedi -->
      <div v-else-if="membershipError" class="message-card error-message">
        <div class="message-icon">!</div>
        <div class="message-content">
          <h3>Üyelik bilgileri alınamadı</h3>
          <p>{{ membershipError }}</p>
          <button
            type="button"
            class="secondary-button"
            @click="loadMembershipData"
          >
            Tekrar Dene
          </button>
        </div>
      </div>

      <template v-else>
        <!-- Üyelik durumu -->
        <section class="current-membership">
          <div class="section-heading">
            <div>
              <span class="section-eyebrow">ÜYELİK BİLGİLERİ</span>
              <h2>Mevcut Üyeliğim</h2>
              <p>
                Aktif üyeliğini ve ödeme durumunu buradan takip edebilirsin.
              </p>
            </div>
          </div>

          <!-- Aktif üyelik -->
          <div
            v-if="currentMembership"
            class="status-card active-card"
          >
            <div class="status-icon">✓</div>

            <div class="status-content">
              <span class="status-label">AKTİF ÜYELİK</span>
              <h3>
                {{ getPlanName(currentMembership.membershipPlanId) }}
              </h3>

              <div class="membership-dates">
                <div class="date-item">
                  <span class="date-icon">🗓️</span>
                  <div>
                    <span class="date-label">Başlangıç tarihi</span>
                    <strong>
                      {{ formatDate(currentMembership.startDate) }}
                    </strong>
                  </div>
                </div>

                <div class="date-item">
                  <span class="date-icon">⏳</span>
                  <div>
                    <span class="date-label">Bitiş tarihi</span>
                    <strong>
                      {{ formatDate(currentMembership.endDate) }}
                    </strong>
                  </div>
                </div>

                <div
                  v-if="getPlan(currentMembership.membershipPlanId)"
                  class="date-item"
                >
                  <span class="date-icon">📖</span>
                  <div>
                    <span class="date-label">Ödünç alma limiti</span>
                    <strong>
                      {{
                        getPlan(currentMembership.membershipPlanId)
                          ?.maxBorrowLimit
                      }}
                      kitap
                    </strong>
                  </div>
                </div>
              </div>

              <div class="status-note success-note">
                <span>✓</span>
                Aktif üyeliğiniz devam ediyor. Yeni bir paket satın almak
                için mevcut üyeliğinizin sona ermesini beklemelisiniz.
              </div>
            </div>
          </div>

          <!-- Onay bekleyen ödeme -->
          <div
            v-else-if="hasPendingPayment"
            class="status-card pending-card"
          >
            <div class="status-icon">⌛</div>

            <div class="status-content">
              <span class="status-label">ONAY BEKLENİYOR</span>
              <h3>Ödemeniz yönetici onayı bekliyor</h3>

              <p>
                Ödeme talebiniz henüz sonuçlanmadı. Yeni bir paket satın
                almadan önce mevcut talebinizin sonuçlanmasını bekleyin.
              </p>

              <NuxtLink to="/user/payments" class="secondary-button">
                Ödemelerimi Görüntüle
                <span>→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Aktif üyelik yok -->
          <div v-else class="status-card inactive-card">
            <div class="status-icon">📚</div>

            <div class="status-content">
              <span class="status-label">AKTİF ÜYELİK YOK</span>
              <h3>Henüz aktif bir üyeliğiniz bulunmuyor.</h3>
              <p>
                Aşağıdaki paketleri inceleyerek ihtiyacınıza uygun üyeliği
                seçebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <!-- Ödeme durumu yüklenemedi -->
        <div v-if="paymentsError" class="message-card error-message">
          <div class="message-icon">!</div>
          <div class="message-content">
            <h3>Ödeme durumu doğrulanamadı</h3>
            <p>{{ paymentsError }}</p>
            <p class="error-hint">
              Güvenliğiniz için ödeme bilgileri doğrulanana kadar yeni
              paket satın alma işlemi kapalı tutulur.
            </p>
            <button
              type="button"
              class="secondary-button"
              @click="loadMembershipData"
            >
              Tekrar Dene
            </button>
          </div>
        </div>

        <!-- Üyelik paketleri -->
        <section class="plans-section">
          <div class="section-heading plans-heading">
            <div>
              <span class="section-eyebrow">SANA UYGUN PAKETİ BUL</span>
              <h2>Üyelik Paketleri</h2>
              <p>
                Paketlerin fiyatlarını, sürelerini ve ödünç alma limitlerini
                karşılaştır.
              </p>
            </div>

            <div
              v-if="!plansLoading && !plansError && plans.length > 0"
              class="plan-count"
            >
              {{ plans.length }} paket
            </div>
          </div>

          <!-- Paketler yükleniyor -->
          <div v-if="plansLoading" class="message-card loading-card">
            <span class="loading-spinner"></span>
            <span>Üyelik paketleri yükleniyor...</span>
          </div>

          <!-- Paket yükleme hatası -->
          <div v-else-if="plansError" class="message-card error-message">
            <div class="message-icon">!</div>
            <div class="message-content">
              <h3>Paketler yüklenemedi</h3>
              <p>{{ plansError }}</p>
              <button
                type="button"
                class="secondary-button"
                @click="loadMembershipData"
              >
                Tekrar Dene
              </button>
            </div>
          </div>

          <!-- Paket bulunamadı -->
          <div v-else-if="plans.length === 0" class="message-card empty-card">
            <div class="empty-icon">📦</div>
            <h3>Henüz üyelik paketi bulunmuyor</h3>
            <p>Şu anda görüntülenebilecek bir üyelik paketi yok.</p>
          </div>

          <!-- Paket kartları -->
          <div v-else class="plans-grid">
            <article
              v-for="(plan, index) in plans"
              :key="plan.id"
              class="plan-card"
              :class="{
                'featured-plan': plans.length > 1 && index === 1
              }"
            >
              <div
                v-if="plans.length > 1 && index === 1"
                class="featured-ribbon"
              >
                ÖNE ÇIKAN
              </div>

              <div class="plan-top">
                <div class="plan-icon">📖</div>
                <span class="plan-label">ÜYELİK PAKETİ</span>
                <h3>{{ plan.name }}</h3>
                <p class="plan-description">
                  Kütüphane hizmetlerinden yararlanın ve okuma
                  yolculuğunuza devam edin.
                </p>
              </div>

              <div class="plan-price">
                <span class="currency">₺</span>
                <span class="price">{{ formatPrice(plan.price) }}</span>
              </div>

              <div class="plan-details">
                <div class="detail-row">
                  <span class="detail-label">
                    <span class="detail-icon">◷</span>
                    Üyelik süresi
                  </span>
                  <strong>{{ plan.durationInDays }} gün</strong>
                </div>

                <div class="detail-row">
                  <span class="detail-label">
                    <span class="detail-icon">📚</span>
                    Ödünç alma limiti
                  </span>
                  <strong>{{ plan.maxBorrowLimit }} kitap</strong>
                </div>
              </div>

              <!-- Satın alma bağlantısı -->
              <NuxtLink
                v-if="canPurchaseMembership"
                :to="{
                  path: '/user/payments',
                  query: { membershipPlanId: plan.id }
                }"
                class="purchase-button"
              >
                <span>Paketi Seç</span>
                <span class="button-arrow">→</span>
              </NuxtLink>

              <div
                v-else-if="currentMembership"
                class="plan-disabled-message"
              >
                <span>✓</span>
                Aktif üyeliğiniz bulunduğu için satın alamazsınız.
              </div>

              <div
                v-else-if="hasPendingPayment"
                class="plan-disabled-message"
              >
                <span>⌛</span>
                Ödeme onayı bekleniyor.
              </div>

              <div
                v-else-if="paymentsError || membershipError"
                class="plan-disabled-message"
              >
                <span>!</span>
                Satın alma durumu doğrulanamadı.
              </div>

              <div v-else class="plan-disabled-message">
                <span>ℹ</span>
                Paket şu anda satın alınamıyor.
              </div>
            </article>
          </div>
        </section>

        <!-- Bilgilendirme -->
        <aside class="information-card">
          <div class="information-icon">💡</div>
          <div>
            <h3>Üyelik hakkında</h3>
            <p>
              Üyelik paketinin süresi ve ödünç alma limiti, seçtiğiniz
              pakete göre belirlenir. Ödeme işleminiz yönetici onayına
              tabi olabilir. Satın alma işleminizin güncel durumunu
              <NuxtLink to="/user/payments">Ödemelerim</NuxtLink>
              sayfasından takip edebilirsiniz.
            </p>
          </div>
        </aside>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface MembershipPlan {
  id: string
  name: string
  price: number
  durationInDays: number
  maxBorrowLimit: number
  isDeleted?: boolean
}

interface UserMembership {
  id: string
  userId: string
  membershipPlanId: string
  startDate: string
  endDate: string
  isActive: boolean
  isDeleted?: boolean
}

interface MembershipPayment {
  id: string
  userMembershipId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  isPaid: boolean
  isDeleted?: boolean
}

const { apiFetch } = useApi()

const plans = ref<MembershipPlan[]>([])
const memberships = ref<UserMembership[]>([])
const payments = ref<MembershipPayment[]>([])

const loading = ref(true)
const plansLoading = ref(true)

const membershipError = ref('')
const paymentsError = ref('')
const plansError = ref('')

const membershipLoaded = ref(false)
const paymentsLoaded = ref(false)

const now = ref(Date.now())

const currentMembership = computed<UserMembership | null>(() => {
  const currentTime = now.value

  return (
    memberships.value
      .filter((membership) => {
        const start = new Date(membership.startDate).getTime()
        const end = new Date(membership.endDate).getTime()

        return (
          membership.isActive &&
          !membership.isDeleted &&
          Number.isFinite(start) &&
          Number.isFinite(end) &&
          start <= currentTime &&
          end > currentTime
        )
      })
      .sort(
        (a, b) =>
          new Date(b.endDate).getTime() -
          new Date(a.endDate).getTime()
      )[0] ?? null
  )
})

const hasPendingPayment = computed(() => {
  const userMembershipIds = new Set(
    memberships.value
      .filter((membership) => !membership.isDeleted)
      .map((membership) => membership.id.toLowerCase())
  )

  return payments.value.some((payment) => {
    return (
      !payment.isPaid &&
      !payment.isDeleted &&
      userMembershipIds.has(
        payment.userMembershipId.toLowerCase()
      )
    )
  })
})

const canPurchaseMembership = computed(() => {
  return (
    membershipLoaded.value &&
    paymentsLoaded.value &&
    !membershipError.value &&
    !paymentsError.value &&
    !currentMembership.value &&
    !hasPendingPayment.value
  )
})

async function loadMemberships() {
  membershipError.value = ''
  membershipLoaded.value = false

  try {
    const userId = import.meta.client
      ? localStorage.getItem('userId')
      : null

    if (!userId) {
      throw new Error(
        'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.'
      )
    }

    const result = await apiFetch<UserMembership[]>(
      `/api/UserMembership/user/${encodeURIComponent(userId)}`
    )

    memberships.value = Array.isArray(result) ? result : []
    membershipLoaded.value = true
  } catch (error: any) {
    memberships.value = []

    membershipError.value =
      error?.data?.message ||
      error?.message ||
      'Üyelik bilgileri yüklenemedi.'
  }
}

async function loadPayments() {
  paymentsError.value = ''
  paymentsLoaded.value = false

  try {
    const result = await apiFetch<MembershipPayment[]>(
      '/api/MembershipPayment/my-payments'
    )

    payments.value = Array.isArray(result) ? result : []
    paymentsLoaded.value = true
  } catch (error: any) {
    payments.value = []

    paymentsError.value =
      error?.data?.message ||
      error?.message ||
      'Ödeme bilgileri yüklenemedi.'
  }
}

async function loadPlans() {
  plansError.value = ''
  plansLoading.value = true

  try {
    const result = await apiFetch<MembershipPlan[]>(
      '/api/MembershipPlan'
    )

    plans.value = Array.isArray(result)
      ? result.filter((plan) => !plan.isDeleted)
      : []
  } catch (error: any) {
    plans.value = []

    plansError.value =
      error?.data?.message ||
      error?.message ||
      'Üyelik paketleri yüklenemedi.'
  } finally {
    plansLoading.value = false
  }
}

async function loadMembershipData() {
  loading.value = true

  await Promise.all([
    loadMemberships(),
    loadPayments(),
    loadPlans()
  ])

  now.value = Date.now()
  loading.value = false
}

function getPlan(planId: string): MembershipPlan | undefined {
  return plans.value.find(
    (plan) => plan.id.toLowerCase() === planId.toLowerCase()
  )
}

function getPlanName(planId: string): string {
  return getPlan(planId)?.name ?? 'Üyelik Paketi'
}

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

onMounted(() => {
  loadMembershipData()
})
</script>

<style scoped>
/* SAYFA */
.membership-page {
  min-height: 100vh;
  padding: 32px 24px 76px;
  color: #443024;
  background:
    radial-gradient(
      ellipse at top left,
      rgba(226, 192, 158, 0.2),
      transparent 45%
    ),
    linear-gradient(
      145deg,
      #f5eee5 0%,
      #eee1d2 48%,
      #f8f2eb 100%
    );
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
}

/* GERİ DÖN */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 25px;
  padding: 11px 15px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: #684a35;
  background: transparent;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  box-shadow: none;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-arrow {
  font-size: 17px;
  line-height: 1;
}

.back-link:hover {
  color: #785237;
  background: transparent;
  border-color: transparent;
  transform: translateX(-2px);
}

/* BAŞLIK KARTI — LOANS SAYFASIYLA UYUMLU */
.page-header {
  position: relative;
  margin-bottom: 30px;
  padding: 28px;
  overflow: hidden;
  background: linear-gradient(
    120deg,
    #fffaf4 0%,
    #f5e7d8 40%,
    #ead3bb 75%,
    #f8eee3 100%
  );
  border: 1px solid #e7d5c3;
  border-radius: 20px;
  box-shadow: 0 7px 22px rgba(90, 59, 36, 0.055);
}

.page-header::after {
  position: absolute;
  top: -75px;
  right: -45px;
  width: 210px;
  height: 210px;
  content: "";
  border: 1px solid rgba(169, 115, 72, 0.14);
  border-radius: 50%;
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-icon {
  width: 74px;
  height: 74px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #f2dfcb, #ead0b5);
  border: 1px solid #e2c6aa;
  border-radius: 18px;
  font-size: 32px;
}

.header-text {
  min-width: 0;
}

.eyebrow,
.section-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.page-header h1 {
  margin: 0;
  color: #493122;
  font-size: clamp(30px, 4vw, 40px);
  font-weight: 750;
  letter-spacing: -1.2px;
  line-height: 1.2;
}

.page-header p {
  max-width: 620px;
  margin: 11px 0 0;
  color: #816b58;
  font-size: 14px;
  line-height: 1.8;
}

/* BÖLÜMLER */
.current-membership {
  margin-bottom: 42px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 0;
  color: #493122;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.65px;
}

.section-heading p {
  margin: 8px 0 0;
  color: #8b7665;
  font-size: 13px;
  line-height: 1.6;
}

/* MEVCUT ÜYELİK KARTI */
.status-card {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  min-width: 0;
  padding: 25px;
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid #e6d4c1;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(86, 57, 35, 0.045);
}

.active-card {
  border-left: 5px solid #73856a;
}

.pending-card {
  border-left: 5px solid #c3974e;
}

.inactive-card {
  border-left: 5px solid #b59a80;
}

.status-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #785338;
  background: #f1e3d3;
  border: 1px solid #e2cfba;
  border-radius: 14px;
  font-size: 24px;
  font-weight: 800;
}

.active-card .status-icon {
  color: #52704a;
  background: #eaf0e5;
  border-color: #d5e1cd;
}

.pending-card .status-icon {
  color: #9b6a20;
  background: #f8edd8;
  border-color: #ecd8b3;
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-label {
  display: block;
  margin-bottom: 8px;
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.active-card .status-label {
  color: #63805a;
}

.pending-card .status-label {
  color: #a5772e;
}

.status-content h3 {
  margin: 0 0 12px;
  color: #493122;
  font-size: 21px;
  font-weight: 750;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.status-content > p {
  margin: 8px 0;
  color: #806b5a;
  font-size: 13px;
  line-height: 1.8;
}

/* ÜYELİK TARİHLERİ */
.membership-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 180px;
  padding: 13px 15px;
  background: #fff8f0;
  border: 1px solid #eee0d1;
  border-radius: 11px;
}

.date-icon {
  font-size: 21px;
}

.date-item > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-label {
  color: #927a66;
  font-size: 11px;
}

.date-item strong {
  color: #5c4030;
  font-size: 12px;
  font-weight: 750;
}

.status-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 19px;
  padding: 13px 15px;
  border-radius: 9px;
  font-size: 12px;
  line-height: 1.8;
}

.success-note {
  color: #52734b;
  background: #edf3e9;
  border: 1px solid #d7e5d0;
}

.success-note > span {
  font-weight: 900;
}

/* İKİNCİL BUTONLAR */
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 13px;
  padding: 11px 16px;
  color: #fffaf5;
  background: #98603b;
  border: 1px solid #98603b;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.secondary-button:hover {
  color: #fffaf4;
  background: #7f4d2e;
  border-color: #7f4d2e;
  transform: translateY(-1px);
}

/* ÜYELİK PAKETLERİ */
.plans-section {
  margin-top: 43px;
}

.plans-heading {
  margin-bottom: 24px;
}

.plan-count {
  flex-shrink: 0;
  padding: 8px 12px;
  color: #87542f;
  background: #f7e9da;
  border: 1px solid #ead4be;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 25px;
  overflow: hidden;
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid #e6d4c1;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(86, 57, 35, 0.045);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.plan-card:hover {
  transform: translateY(-3px);
  border-color: #d5b18e;
  box-shadow: 0 15px 32px rgba(86, 57, 35, 0.09);
}

.featured-plan {
  border-color: #c9a887;
  box-shadow: 0 9px 27px rgba(91, 62, 41, 0.1);
}

.featured-ribbon {
  position: absolute;
  top: 17px;
  right: -32px;
  width: 125px;
  padding: 7px 0;
  transform: rotate(35deg);
  color: #fffaf4;
  background: #785237;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 1px;
  text-align: center;
}

.plan-top {
  flex: 1;
}

.plan-icon {
  width: 47px;
  height: 47px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  background: linear-gradient(145deg, #f2e1d0, #ead0b5);
  border: 1px solid #e2c6aa;
  border-radius: 13px;
  font-size: 24px;
}

.plan-label {
  display: inline-block;
  margin-bottom: 11px;
  padding: 6px 9px;
  color: #956b49;
  background: #f1e3d3;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 1.2px;
}

.plan-top h3 {
  margin: 0 0 10px;
  color: #493122;
  font-size: 23px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.plan-description {
  min-height: 44px;
  margin: 0;
  color: #897463;
  font-size: 13px;
  line-height: 1.8;
}

/* FİYAT */
.plan-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 27px 0 22px;
  padding-bottom: 22px;
  color: #704a30;
  border-bottom: 1px solid #eadbcb;
}

.currency {
  font-size: 21px;
  font-weight: 800;
}

.price {
  font-size: 35px;
  font-weight: 850;
  letter-spacing: -1px;
  overflow-wrap: anywhere;
}

/* PAKET DETAYLARI */
.plan-details {
  margin-bottom: 25px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #eee2d6;
  font-size: 12px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  color: #8c7663;
  line-height: 1.7;
}

.detail-icon {
  flex-shrink: 0;
  color: #a17653;
}

.detail-row strong {
  color: #5c4030;
  font-size: 12px;
  font-weight: 750;
  text-align: right;
  white-space: nowrap;
}

/* PAKET SEÇ */
.purchase-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
  padding: 12px 16px;
  color: #fffaf5;
  background: #98603b;
  border: 1px solid #98603b;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.purchase-button:hover {
  background: #7f4d2e;
  border-color: #7f4d2e;
  box-shadow: 0 5px 12px rgba(91, 62, 41, 0.15);
  transform: translateY(-1px);
}

.button-arrow {
  font-size: 17px;
}

.plan-disabled-message {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  padding: 12px 13px;
  color: #866d58;
  background: #f5ece2;
  border: 1px solid #e6d7c7;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.7;
  text-align: center;
}

/* YÜKLENİYOR VE HATA MESAJLARI */
.message-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin: 18px 0;
  padding: 22px 24px;
  color: #765b46;
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid #e6d4c1;
  border-radius: 17px;
  box-shadow: 0 8px 24px rgba(86, 57, 35, 0.045);
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.loading-card {
  align-items: center;
}

.loading-spinner {
  display: inline-block;
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  border: 2px solid #ead8c6;
  border-top-color: #98603b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-message {
  color: #934b3e;
  background: rgba(255, 247, 244, 0.97);
  border-color: #ead0c9;
}

.message-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #a84d3d;
  background: #f9e9e5;
  border: 1px solid #eed0c8;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 850;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-content h3 {
  margin: 0 0 6px;
  color: #794337;
  font-size: 15px;
  font-weight: 800;
}

.message-content p {
  margin: 0;
  line-height: 1.8;
}

.message-content .error-hint {
  margin-top: 8px;
  font-size: 12px;
}

/* BOŞ DURUM */
.empty-card {
  flex-direction: column;
  align-items: center;
  padding: 38px 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 12px;
  font-size: 35px;
}

.empty-card h3 {
  margin: 0 0 8px;
  color: #493122;
  font-size: 18px;
}

.empty-card p {
  margin: 0;
  color: #8a7665;
  font-size: 13px;
  line-height: 1.8;
}

/* BİLGİLENDİRME */
.information-card {
  display: flex;
  align-items: flex-start;
  gap: 17px;
  margin-top: 35px;
  padding: 25px;
  background: rgba(255, 251, 246, 0.84);
  border: 1px solid #e6d4c1;
  border-radius: 17px;
  box-shadow: 0 7px 22px rgba(86, 57, 35, 0.035);
}

.information-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: #a66a3e;
  background: #f3e2d0;
  border: 1px solid #e8d1ba;
  border-radius: 13px;
  font-size: 22px;
}

.information-card h3 {
  margin: 0 0 8px;
  color: #493122;
  font-size: 16px;
  font-weight: 750;
}

.information-card p {
  margin: 0;
  color: #806b5a;
  font-size: 12px;
  line-height: 1.9;
}

.information-card a {
  color: #785237;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.information-card a:hover {
  color: #503725;
}

/* ODAK GÖRÜNÜMÜ */
button:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(169, 106, 61, 0.42);
  outline-offset: 3px;
}

/* TABLET */
@media (max-width: 950px) {
  .plans-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* MOBİL */
@media (max-width: 620px) {
  .membership-page {
    padding: 28px 18px 55px;
  }

  .page-header {
    padding: 24px;
  }

  .header-content {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .header-icon {
    width: 53px;
    height: 53px;
    border-radius: 14px;
    font-size: 25px;
  }

  .page-header h1 {
    font-size: 31px;
  }

  .page-header p {
    font-size: 12px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .section-heading h2 {
    font-size: 23px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
    gap: 17px;
  }

  .plan-card {
    padding: 24px;
  }

  .status-card {
    gap: 14px;
    padding: 21px 17px;
  }

  .status-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    font-size: 20px;
  }

  .status-content h3 {
    font-size: 18px;
  }

  .status-content > p {
    font-size: 12px;
  }

  .membership-dates {
    flex-direction: column;
  }

  .date-item {
    min-width: 0;
  }

  .plan-count {
    font-size: 11px;
  }

  .message-card {
    padding: 18px;
  }

  .information-card {
    gap: 12px;
    padding: 18px;
  }

  .information-icon {
    width: 38px;
    height: 38px;
    font-size: 19px;
  }
}

/* KÜÇÜK MOBİL */
@media (max-width: 380px) {
  .membership-page {
    padding: 22px 13px 42px;
  }

  .back-link {
    font-size: 12px;
  }

  .page-header {
    padding: 20px 17px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .status-card {
    flex-direction: column;
  }

  .price {
    font-size: 31px;
  }

  .detail-row {
    gap: 7px;
  }
}

/* ANİMASYON */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
