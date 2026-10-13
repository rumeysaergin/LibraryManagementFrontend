
<template>
  <main class="membership-page">
    <section class="membership-container">
      <NuxtLink to="/user" class="back-link">
        ← Kullanıcı Paneline Dön
      </NuxtLink>

      <div class="page-header">
        <div class="title-group">
          <p class="subtitle">ÜYELİK</p>
          <p class="description">
            Mevcut üyeliğinizi görüntüleyebilir ve size uygun diğer
            üyelik planlarını inceleyebilirsiniz.
          </p>
        </div>
      </div>

      <!-- Mevcut Üyelik -->
      <section class="current-membership">
        <div class="section-header">
          <div class="section-title-group">
            <p class="section-label">MEVCUT ÜYELİĞİM</p>
            <h2>Üyelik durumunuz</h2>
            <span class="section-description">
              Kullanmakta olduğunuz üyelik planının detayları
            </span>
          </div>
        </div>

        <div v-if="membershipLoading" class="current-card message-card">
          Üyelik bilgileriniz yükleniyor...
        </div>

        <div v-else-if="membershipError" class="current-card error-card">
          <strong>Üyelik bilgileri alınamadı.</strong>
          <p>{{ membershipError }}</p>
          <button class="retry-button" @click="loadMembershipData">
            Tekrar Dene
          </button>
        </div>

        <div v-else-if="currentMembership" class="current-card">
          <div class="current-card-top">
            <div>
              <p class="plan-label">
                {{ getPlan(currentMembership.membershipPlanId)?.name ?? 'ÜYELİK' }}
              </p>
              <h3>
                {{ getPlan(currentMembership.membershipPlanId)?.name ?? 'Üyelik Planı' }}
              </h3>
            </div>

            <span
              class="active-badge"
              :class="statusClass(currentMembership)"
            >
              {{ membershipStatus(currentMembership) }}
            </span>
          </div>

          <div class="current-details">
            <div class="detail-item">
              <span class="detail-label">Ödünç Limiti</span>
              <span class="detail-value">
                {{ getPlan(currentMembership.membershipPlanId)?.maxBorrowLimit ?? '—' }}
                kitap
              </span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Başlangıç Tarihi</span>
              <span class="detail-value">
                {{ formatDate(currentMembership.startDate) }}
              </span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Bitiş Tarihi</span>
              <span class="detail-value">
                {{ formatDate(currentMembership.endDate) }}
              </span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Süre</span>
              <span class="detail-value">
                {{ getPlan(currentMembership.membershipPlanId)?.durationInDays ?? '—' }}
                gün
              </span>
            </div>
          </div>
        </div>

        <div v-else class="current-card empty-card">
          <h3>Aktif üyeliğiniz bulunmuyor</h3>
          <p>
            Şu anda geçerli bir üyeliğiniz yok. Aşağıdaki planları inceleyebilirsiniz.
          </p>
        </div>
      </section>

      <!-- Üyelik Planları -->
      <section class="plans-section">
        <div class="section-header">
          <div class="section-title-group">
            <p class="section-label">ÜYELİK PLANLARI</p>
            <h2>Size uygun planı seçin</h2>
            <span class="section-description">
              İhtiyacınıza uygun üyelik planını seçerek kütüphane hizmetlerinden yararlanın
            </span>
          </div>
        </div>

        <div v-if="plansLoading" class="plans-message">
          Üyelik planları yükleniyor...
        </div>

        <div v-else-if="plansError" class="plans-message plans-error">
          <p>{{ plansError }}</p>
          <button class="retry-button" @click="loadMembershipData">
            Tekrar Dene
          </button>
        </div>

        <div v-else-if="plans.length" class="plans-grid">
          <div
            v-for="(plan, index) in plans"
            :key="plan.id"
            class="plan-card"
            :class="{ featured: index === 0 }"
          >
            <div v-if="index === 0" class="popular-badge">
              ÖNE ÇIKAN
            </div>

            <div class="plan-card-header">
              <div>
                <p class="plan-label">{{ plan.name.toUpperCase() }}</p>
                <h3>{{ plan.name }}</h3>
              </div>
            </div>

            <div class="price">
              <span class="price-value">{{ formatPrice(plan.price) }}</span>
              <span class="price-period">/ {{ plan.durationInDays }} gün</span>
            </div>

            <div class="features">
              <div class="feature">
                <span>✓</span>
                <span>{{ plan.maxBorrowLimit }} kitap ödünç alma limiti</span>
              </div>

              <div class="feature">
                <span>✓</span>
                <span>{{ plan.durationInDays }} gün üyelik</span>
              </div>

              <div class="feature">
                <span>✓</span>
                <span>Üyelik planı özellikleri</span>
              </div>
            </div>

            <NuxtLink
              :to="`/user/payments?membershipPlanId=${encodeURIComponent(plan.id)}`"
              class="plan-button"
            >
              Bu Planı Seç
            </NuxtLink>
          </div>
        </div>

        <div v-else class="plans-message">
          Gösterilecek üyelik planı bulunamadı.
        </div>
      </section>

      <!-- Bilgilendirme -->
      <div class="info-box">
        <div class="info-icon">ℹ️</div>
        <div>
          <strong>Üyelik planları hakkında</strong>
          <p>
            Üyelik planınız, ödünç alabileceğiniz kitap sayısını ve
            üyeliğinizin geçerlilik süresini belirler.
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

const { apiFetch } = useApi()

const membershipLoading = ref(true)
const plansLoading = ref(true)
const membershipError = ref('')
const plansError = ref('')

const memberships = ref<UserMembership[]>([])
const plans = ref<MembershipPlan[]>([])

const getPlan = (planId: string) =>
  plans.value.find(plan => plan.id === planId)

const isMembershipCurrentlyValid = (membership: UserMembership) => {
  const now = new Date()
  const start = new Date(membership.startDate)
  const end = new Date(membership.endDate)

  return membership.isActive
    && !Number.isNaN(start.getTime())
    && !Number.isNaN(end.getTime())
    && start <= now
    && end >= now
}

const currentMembership = computed(() => {
  return memberships.value
    .filter(isMembershipCurrentlyValid)
    .sort(
      (a, b) =>
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )[0] ?? null
})

const membershipStatus = (membership: UserMembership) => {
  const now = new Date()
  const start = new Date(membership.startDate)
  const end = new Date(membership.endDate)

  if (!membership.isActive) return 'Pasif'
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Tarih Bilinmiyor'
  }
  if (start > now) return 'Henüz Başlamadı'
  if (end < now) return 'Süresi Doldu'

  return 'Aktif'
}

const statusClass = (membership: UserMembership) => {
  const status = membershipStatus(membership)

  if (status === 'Aktif') return 'status-active'
  if (status === 'Süresi Doldu') return 'status-expired'

  return 'status-inactive'
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2
  }).format(price)

const loadMembershipData = async () => {
  membershipLoading.value = true
  plansLoading.value = true
  membershipError.value = ''
  plansError.value = ''

  const userId = import.meta.client
    ? localStorage.getItem('userId')
    : null

  if (!userId) {
    membershipError.value =
      'Kullanıcı bilgisi bulunamadı. Lütfen yeniden giriş yapın.'
    membershipLoading.value = false
    plansLoading.value = false
    return
  }

  const membershipRequest = apiFetch<UserMembership[]>(
    `/api/UserMembership/user/${userId}`
  )
    .then((result) => {
      memberships.value = result ?? []
    })
    .catch((error) => {
      console.error('Üyelikler alınamadı:', error)
      membershipError.value =
        'Üyelik bilgileri sunucudan alınamadı.'
    })
    .finally(() => {
      membershipLoading.value = false
    })

  const plansRequest = apiFetch<MembershipPlan[]>('/api/MembershipPlan')
    .then((result) => {
      plans.value = result ?? []
    })
    .catch((error) => {
      console.error('Üyelik planları alınamadı:', error)
      plansError.value =
        'Üyelik planları sunucudan alınamadı.'
    })
    .finally(() => {
      plansLoading.value = false
    })

  await Promise.all([membershipRequest, plansRequest])
}

onMounted(() => {
  loadMembershipData()
})
</script>

<style scoped>
.membership-page {
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

.membership-container {
  max-width: 1200px;
  margin: 0 auto;
}

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

.page-header {
  margin-bottom: 42px;
  background: rgba(255, 250, 244, 0.98);
  border: 1px solid #dfc8b2;
  border-radius: 20px;
  padding: 34px 40px;
  box-shadow: 0 12px 35px rgba(92, 57, 34, 0.12);
}

.subtitle {
  display: inline-block;
  margin: 0 0 10px;
  padding: 5px 10px;
  color: #7c4b2c;
  background: #dfc8b2;
  border: 1px solid #dfc8b2;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.description {
  margin: 0;
  max-width: 750px;
  color: #765b48;
  font-size: 15px;
  line-height: 1.7;
}

.section-header {
  margin-bottom: 18px;
}

.section-title-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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

.current-membership {
  margin-bottom: 48px;
}

.current-card {
  background: rgba(255, 250, 244, 0.98);
  border: 1px solid #dfc8b2;
  border-radius: 16px;
  padding: 26px;
  box-shadow: 0 8px 24px rgba(92, 57, 34, 0.10);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.current-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(92, 57, 34, 0.14);
}

.current-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
}

.current-card h3 {
  margin: 0;
  color: #4b3021;
  font-size: 23px;
  font-weight: 650;
}

.active-badge {
  padding: 7px 13px;
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.status-active {
  background: #e5f0df;
  color: #4f7a45;
  border-color: #cbdcc3;
}

.status-expired {
  background: #f9e9e6;
  color: #8a4035;
  border-color: #e3c2bc;
}

.status-inactive {
  background: #f5e6d5;
  color: #7c4b2c;
  border-color: #dfc8b2;
}

.current-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  border-top: 1px solid #ead9c8;
  padding-top: 22px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  color: #9a806c;
  font-size: 12px;
}

.detail-value {
  color: #5c4030;
  font-size: 15px;
  font-weight: 650;
}

.empty-card h3 {
  margin: 0 0 8px;
}

.empty-card p,
.error-card p {
  color: #765b48;
  line-height: 1.6;
}

.message-card,
.empty-card,
.error-card {
  color: #5c4030;
  line-height: 1.6;
}

.error-card {
  border-color: #e3c2bc;
}

.retry-button {
  padding: 9px 14px;
  border: none;
  border-radius: 8px;
  background: #b96b35;
  color: white;
  cursor: pointer;
  font: inherit;
}

.retry-button:hover {
  background: #a95e2c;
}

.plans-section {
  margin-bottom: 42px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 250, 244, 0.98);
  border: 1px solid #dfc8b2;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 24px rgba(92, 57, 34, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.plan-card:hover {
  transform: translateY(-3px);
  border-color: #c9a98e;
  box-shadow: 0 12px 28px rgba(92, 57, 34, 0.13);
}

.plan-card.featured {
  border: 2px solid #b96b35;
  box-shadow: 0 10px 28px rgba(92, 57, 34, 0.12);
}

.plan-card-header {
  margin-bottom: 2px;
}

.plan-card h3 {
  margin: 0;
  color: #4b3021;
  font-size: 22px;
  font-weight: 650;
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  padding: 5px 11px;
  background: #b96b35;
  color: white;
  border-radius: 15px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.price {
  margin: 23px 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 5px;
}

.price-value {
  color: #4b3021;
  font-size: 32px;
  font-weight: 700;
}

.price-period {
  color: #806b5b;
  font-size: 13px;
}

.features {
  border-top: 1px solid #ead9c8;
  padding-top: 19px;
  margin-bottom: 24px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #765b48;
  font-size: 13px;
  margin-bottom: 13px;
}

.feature:last-child {
  margin-bottom: 0;
}

.feature span:first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  background: #e5f0df;
  color: #4f7a45;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}

.plan-button {
  display: block;
  width: 100%;
  margin-top: auto;
  box-sizing: border-box;
  padding: 11px 14px;
  background: #b96b35;
  color: white;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.plan-button:hover {
  background: #a95e2c;
  transform: translateY(-1px);
}

.plans-message {
  padding: 20px;
  background: rgba(255, 250, 244, 0.98);
  border: 1px solid #dfc8b2;
  border-radius: 12px;
  color: #765b48;
}

.plans-error {
  border-color: #e3c2bc;
}

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

@media (max-width: 900px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .current-details {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .page-header {
    padding: 28px 24px;
  }

  .current-card {
    padding: 21px;
  }

  .plans-grid {
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .membership-page {
    padding: 30px 16px 50px;
  }

  .page-header {
    padding: 25px 20px;
  }

  .description {
    font-size: 14px;
  }

  .section-header h2 {
    font-size: 22px;
  }

  .current-details {
    grid-template-columns: 1fr;
  }

  .current-card-top {
    align-items: flex-start;
    gap: 15px;
  }

  .current-card h3 {
    font-size: 20px;
  }

  .plan-card {
    padding: 22px;
  }
}
</style>
