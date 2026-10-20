
<template>
  <main class="library-detail-page">
    <div class="library-detail-container">

      <NuxtLink to="/user/libraries" class="back-link">
        <span class="back-icon">←</span>
        <span>Kütüphanelerime Dön</span>
      </NuxtLink>

      <!-- Yükleniyor -->
      <div v-if="loading" class="state-card">
        <div class="loading-icon">📚</div>
        <span class="state-eyebrow">KÜTÜPHANE YÖNETİMİ</span>
        <h2>Kütüphane Yükleniyor</h2>
        <p>Kütüphane bilgileri hazırlanıyor...</p>
        <div class="loading-bar"><span></span></div>
      </div>

      <!-- Hata -->
      <div v-else-if="errorMessage" class="state-card error-card">
        <div class="state-icon error-icon">!</div>
        <span class="state-eyebrow">BİLGİLENDİRME</span>
        <h2>Bir Sorun Oluştu</h2>
        <p>{{ errorMessage }}</p>
        <button type="button" class="retry-button" @click="loadLibrary">
          Tekrar Dene
        </button>
      </div>

      <!-- Kütüphane detayları -->
      <section v-else-if="library" class="library-detail-card">

        <div class="library-visual">
          <div class="visual-top-label">
            <span class="visual-label-dot"></span>
            KÜTÜPHANE DETAYI
          </div>

          <div class="visual-orbit orbit-one"></div>
          <div class="visual-orbit orbit-two"></div>
          <div class="visual-orbit orbit-three"></div>

          <div class="library-icon-wrapper">
            <div class="library-icon">📚</div>
          </div>

          <div class="visual-bottom">
            <span class="visual-bottom-line"></span>
            <span>Bilginin ve keşfin adresi</span>
          </div>
        </div>

        <div class="library-content">

          <div class="library-heading">
            <span class="library-label">KÜTÜPHANE BİLGİLERİ</span>
            <h1>{{ library.name }}</h1>
            <p class="heading-description">
              Kütüphane bilgilerinizi ve üyelik durumunuzu buradan
              görüntüleyebilirsiniz.
            </p>
          </div>

          <div class="info-list">

            <div class="info-item">
              <div class="info-item-left">
                <div class="info-icon">⌖</div>
                <div class="info-text">
                  <span class="info-label">Adres</span>
                  <span class="info-value">{{ library.address }}</span>
                </div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-item-left">
                <div class="info-icon">✓</div>
                <div class="info-text">
                  <span class="info-label">Üyelik Durumu</span>
                  <span
                    :class="[
                      'membership-status',
                      isMember ? 'member' : 'not-member'
                    ]"
                  >
                    {{
                      isMember
                        ? 'Bu kütüphaneye üyesiniz'
                        : 'Bu kütüphaneye üye değilsiniz'
                    }}
                  </span>
                </div>
              </div>

              <span
                :class="[
                  'status-badge',
                  isMember ? 'member' : 'not-member'
                ]"
              >
                <span class="badge-dot"></span>
                {{ isMember ? 'ÜYE' : 'ÜYE DEĞİL' }}
              </span>
            </div>

          </div>

          <div class="actions">

            <div v-if="isMember" class="member-box">
              <div class="member-box-icon">✓</div>
              <div class="member-box-content">
                <strong>Kütüphaneye Üyesiniz</strong>
                <span>
                  Bu kütüphanenin kitaplarını keşfedebilirsiniz.
                </span>
              </div>
            </div>

            <button
              v-else
              type="button"
              class="join-button"
              :disabled="joining"
              @click="joinLibrary"
            >
              <span class="join-button-icon">
                {{ joining ? '…' : '+' }}
              </span>
              <span class="join-button-text">
                {{ joining ? 'Üye Olunuyor...' : 'Bu Kütüphaneye Üye Ol' }}
              </span>
              <span v-if="!joining" class="button-arrow">→</span>
            </button>

          </div>

          <div
            v-if="message"
            :class="['action-message', messageType]"
          >
            <span class="message-icon">
              {{ messageType === 'success' ? '✓' : '!' }}
            </span>
            <span>{{ message }}</span>
          </div>

          <div class="content-footer">
            <span class="footer-decoration"></span>
            <span>Kütüphane Yönetim Sistemi</span>
          </div>

        </div>
      </section>

    </div>
  </main>
</template>

<script setup lang="ts">
interface Library {
  id: string
  name: string
  address: string
}

interface UserLibrary {
  id: string
  userId: string
  libraryId: string
}

const route = useRoute()
const { apiFetch } = useApi()

const library = ref<Library | null>(null)
const userLibraries = ref<UserLibrary[]>([])
const loading = ref(true)
const errorMessage = ref('')
const joining = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const isMember = computed(() => {
  if (!library.value) {
    return false
  }

  return userLibraries.value.some(
    item => item.libraryId === library.value?.id
  )
})

/*
 * Kütüphane ve kullanıcının üyelik bilgilerini getirir.
 */
const loadLibrary = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    message.value = ''

    const libraryId = String(route.params.id)

    if (!libraryId) {
      throw new Error('Kütüphane ID bulunamadı.')
    }

    const userId = localStorage.getItem('userId')

    if (!userId) {
      errorMessage.value =
        'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.'
      return
    }

    const [libraryData, userLibraryData] = await Promise.all([
      apiFetch<Library>(`/api/Library/${libraryId}`),
      apiFetch<UserLibrary[]>(`/api/UserLibrary/user/${userId}`)
    ])

    library.value = libraryData
    userLibraries.value = userLibraryData
  } catch (error) {
    console.error(
      'Kütüphane bilgileri alınırken hata oluştu:',
      error
    )

    errorMessage.value = 'Kütüphane bilgileri alınamadı.'
  } finally {
    loading.value = false
  }
}

/*
 * Kütüphaneye üye ol.
 * POST sonrasında üyelikler API'den tekrar alınır.
 */
const joinLibrary = async () => {
  try {
    if (!library.value) {
      return
    }

    const userId = localStorage.getItem('userId')

    if (!userId) {
      messageType.value = 'error'
      message.value = 'Üye olmak için giriş yapmalısınız.'
      return
    }

    if (isMember.value) {
      messageType.value = 'error'
      message.value = 'Bu kütüphaneye zaten üyesiniz.'
      return
    }

    joining.value = true
    message.value = ''

    await apiFetch('/api/UserLibrary', {
      method: 'POST',
      body: {
        userId,
        libraryId: library.value.id
      }
    })

    const updatedUserLibraries = await apiFetch<UserLibrary[]>(
      `/api/UserLibrary/user/${userId}`
    )

    userLibraries.value = updatedUserLibraries

    messageType.value = 'success'
    message.value =
      `${library.value.name} kütüphanesine başarıyla üye oldunuz.`
  } catch (error) {
    console.error(
      'Kütüphane üyeliği oluşturulurken hata oluştu:',
      error
    )

    messageType.value = 'error'
    message.value =
      'Kütüphane üyeliği oluşturulurken bir hata oluştu.'
  } finally {
    joining.value = false
  }
}

onMounted(() => {
  loadLibrary()
})
</script>

<style scoped>
.library-detail-page {
  min-height: calc(100vh - 75px);
  padding: 42px 24px 75px;
  color: #493326;
  background:
    radial-gradient(ellipse at 10% 0%, rgba(225, 190, 157, 0.22), transparent 38%),
    linear-gradient(145deg, #f7f0e8 0%, #eee1d3 52%, #f8f2eb 100%);
}

.library-detail-container {
  max-width: 1080px;
  margin: 0 auto;
}

/* Geri dön */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  color: #765640;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-link:hover {
  color: #9d5b32;
  transform: translateX(-3px);
}

.back-icon {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  background: #fffaf5;
  border: 1px solid #e5d2bf;
  border-radius: 11px;
  font-size: 18px;
  transition: background 0.2s ease;
}

.back-link:hover .back-icon {
  background: #f0dfce;
}

/* Ana kart */
.library-detail-card {
  display: grid;
  grid-template-columns: minmax(290px, 0.85fr) minmax(0, 1.15fr);
  min-height: 520px;
  overflow: hidden;
  background: rgba(255, 251, 246, 0.97);
  border: 1px solid #e5d2bf;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(77, 49, 29, 0.09);
}

/* Sol görsel */
.library-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 520px;
  overflow: hidden;
  isolation: isolate;
  background:
    linear-gradient(145deg, #f0dfce 0%, #e6cbb1 55%, #dfbea0 100%);
}

.visual-top-label {
  position: absolute;
  top: 26px;
  left: 26px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  color: #77553d;
  background: rgba(255, 250, 244, 0.77);
  border: 1px solid rgba(169, 112, 71, 0.18);
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
}

.visual-label-dot {
  width: 7px;
  height: 7px;
  background: #a45d31;
  border-radius: 50%;
}

.library-icon-wrapper {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 245px;
  height: 245px;
  background: rgba(255, 250, 244, 0.34);
  border: 1px solid rgba(255, 250, 244, 0.65);
  border-radius: 50%;
  box-shadow: 0 15px 45px rgba(103, 62, 35, 0.07);
}

.library-icon {
  display: grid;
  place-items: center;
  width: 175px;
  height: 175px;
  background: #fffaf4;
  border: 1px solid #f0dfce;
  border-radius: 43px;
  box-shadow: 0 16px 36px rgba(91, 55, 31, 0.13);
  font-size: 78px;
  animation: bookFloat 4s ease-in-out infinite;
}

.visual-orbit {
  position: absolute;
  z-index: 0;
  border: 1px solid rgba(159, 101, 58, 0.16);
  border-radius: 50%;
  pointer-events: none;
}

.orbit-one {
  width: 360px;
  height: 360px;
}

.orbit-two {
  width: 460px;
  height: 460px;
}

.orbit-three {
  width: 560px;
  height: 560px;
  border-color: rgba(159, 101, 58, 0.1);
}

.visual-bottom {
  position: absolute;
  right: 25px;
  bottom: 25px;
  left: 25px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #806149;
  font-size: 12px;
  font-weight: 650;
}

.visual-bottom-line {
  width: 24px;
  height: 2px;
  background: #b67b4d;
  border-radius: 99px;
}

/* Sağ içerik */
.library-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 48px 44px 30px;
}

.library-heading {
  margin-bottom: 29px;
}

.library-label {
  display: inline-block;
  margin-bottom: 12px;
  color: #a36339;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.library-heading h1 {
  margin: 0;
  color: #493326;
  font-size: clamp(27px, 3vw, 37px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.9px;
  overflow-wrap: anywhere;
}

.heading-description {
  margin: 13px 0 0;
  color: #8a7462;
  font-size: 13px;
  line-height: 1.8;
}

/* Bilgi alanları */
.info-list {
  border-top: 1px solid #ecded0;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 19px 0;
  border-bottom: 1px solid #ecded0;
}

.info-item-left {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.info-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  color: #9b6038;
  background: #f5e7d8;
  border: 1px solid #ead6c2;
  border-radius: 13px;
  font-size: 19px;
}

.info-text {
  min-width: 0;
}

.info-label {
  display: block;
  margin-bottom: 5px;
  color: #a08875;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.info-value {
  display: block;
  color: #4e3728;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.membership-status {
  display: block;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.6;
}

.membership-status.member {
  color: #5b8051;
}

.membership-status.not-member {
  color: #a36d49;
}

/* Üyelik rozeti */
.status-badge {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.6px;
}

.status-badge.member {
  color: #52794a;
  background: #edf4e9;
  border: 1px solid #d5e4cd;
}

.status-badge.not-member {
  color: #946747;
  background: #f7eadc;
  border: 1px solid #ead5c0;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}

/* İşlemler */
.actions {
  margin-top: 26px;
}

.join-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  color: #fffaf5;
  background: #98603b;
  border: 1px solid #98603b;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 750;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.join-button:hover:not(:disabled) {
  background: #7f4d2e;
  border-color: #7f4d2e;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(127, 77, 46, 0.18);
}

.join-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.join-button-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 29px;
  height: 29px;
  color: #fffaf5;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 20px;
}

.join-button-text {
  flex: 1;
}

.button-arrow {
  margin-left: auto;
  font-size: 20px;
  transition: transform 0.2s ease;
}

.join-button:hover:not(:disabled) .button-arrow {
  transform: translateX(3px);
}

/* Üyelik başarılı */
.member-box {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px;
  background: #eef4e9;
  border: 1px solid #d3e3ca;
  border-radius: 12px;
}

.member-box-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  color: #557b4d;
  background: #dcebd5;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 800;
}

.member-box-content strong {
  display: block;
  margin-bottom: 5px;
  color: #55774d;
  font-size: 13px;
}

.member-box-content span {
  display: block;
  color: #71856a;
  font-size: 11px;
  line-height: 1.7;
}

/* İşlem mesajları */
.action-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 15px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.message-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
}

.action-message.success {
  color: #55794e;
  background: #edf4e9;
  border: 1px solid #d3e3ca;
}

.action-message.success .message-icon {
  background: #dcebd5;
}

.action-message.error {
  color: #a34f42;
  background: #fbede8;
  border: 1px solid #efd2c9;
}

.action-message.error .message-icon {
  background: #f3dcd4;
}

/* Alt bilgi */
.content-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: auto;
  padding-top: 28px;
  color: #b09a87;
  font-size: 10px;
  font-weight: 600;
}

.footer-decoration {
  width: 20px;
  height: 1px;
  background: #c7a384;
}

/* Yüklenme ve hata ekranları */
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 390px;
  padding: 40px 24px;
  text-align: center;
  background: rgba(255, 251, 246, 0.96);
  border: 1px solid #e5d2bf;
  border-radius: 22px;
  box-shadow: 0 14px 40px rgba(77, 49, 29, 0.07);
}

.loading-icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin-bottom: 22px;
  background: #f3e3d2;
  border: 1px solid #ead3bd;
  border-radius: 21px;
  font-size: 32px;
  animation: bookFloat 2s ease-in-out infinite;
}

.state-eyebrow {
  margin-bottom: 9px;
  color: #a36339;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.state-card h2 {
  margin: 0 0 10px;
  color: #493326;
  font-size: 22px;
  font-weight: 800;
}

.state-card p {
  max-width: 480px;
  margin: 0;
  color: #8a7462;
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.loading-bar {
  width: 180px;
  height: 4px;
  margin-top: 24px;
  overflow: hidden;
  background: #ead8c6;
  border-radius: 99px;
}

.loading-bar span {
  display: block;
  width: 45%;
  height: 100%;
  background: #98603b;
  border-radius: inherit;
  animation: loadingMove 1.4s ease-in-out infinite;
}

.error-card {
  background: #fff9f6;
  border-color: #edd2c9;
}

.error-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin-bottom: 18px;
  color: #a34f42;
  background: #f9e9e4;
  border: 1px solid #efd2c9;
  border-radius: 18px;
  font-size: 25px;
  font-weight: 800;
}

.retry-button {
  margin-top: 22px;
  padding: 11px 18px;
  color: #fffaf5;
  background: #98603b;
  border: 1px solid #98603b;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #7f4d2e;
}

/* Klavye erişilebilirliği */
.back-link:focus-visible,
button:focus-visible {
  outline: 3px solid rgba(169, 106, 61, 0.45);
  outline-offset: 3px;
}

/* Animasyonlar */
@keyframes bookFloat {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes loadingMove {
  0% {
    transform: translateX(-110%);
  }

  100% {
    transform: translateX(250%);
  }
}

/* Tablet */
@media (max-width: 850px) {
  .library-detail-card {
    grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1.2fr);
  }

  .library-content {
    padding: 38px 30px 26px;
  }

  .library-icon-wrapper {
    width: 205px;
    height: 205px;
  }

  .library-icon {
    width: 150px;
    height: 150px;
    font-size: 67px;
  }
}

/* Mobil */
@media (max-width: 680px) {
  .library-detail-page {
    padding: 28px 16px 50px;
  }

  .library-detail-card {
    grid-template-columns: 1fr;
    border-radius: 20px;
  }

  .library-visual {
    min-height: 285px;
  }

  .library-icon-wrapper {
    width: 165px;
    height: 165px;
  }

  .library-icon {
    width: 120px;
    height: 120px;
    border-radius: 30px;
    font-size: 55px;
  }

  .orbit-one {
    width: 260px;
    height: 260px;
  }

  .orbit-two {
    width: 350px;
    height: 350px;
  }

  .orbit-three {
    width: 430px;
    height: 430px;
  }

  .visual-top-label {
    top: 18px;
    left: 18px;
  }

  .visual-bottom {
    bottom: 17px;
  }

  .library-content {
    padding: 30px 24px 24px;
  }

  .library-heading {
    margin-bottom: 23px;
  }

  .library-heading h1 {
    font-size: 29px;
  }

  .content-footer {
    padding-top: 24px;
  }
}

/* Küçük ekranlar */
@media (max-width: 420px) {
  .library-detail-page {
    padding-right: 12px;
    padding-left: 12px;
  }

  .library-visual {
    min-height: 255px;
  }

  .library-content {
    padding: 25px 18px 20px;
  }

  .library-heading h1 {
    font-size: 25px;
  }

  .heading-description {
    font-size: 12px;
  }

  .info-item {
    align-items: flex-start;
    gap: 10px;
  }

  .status-badge {
    margin-top: 2px;
  }

  .info-item-left {
    gap: 10px;
  }

  .info-icon {
    width: 36px;
    height: 36px;
  }
}

/* Hareket hassasiyeti */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
