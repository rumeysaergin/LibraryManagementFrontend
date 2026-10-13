<template>
  <main class="library-detail-page">
    <div class="library-detail-container">

      <!-- Geri Dön -->
      <NuxtLink
        to="/user/libraries"
        class="back-link"
      >
        <span class="back-icon">←</span>
        <span>Kütüphanelerime Dön</span>
      </NuxtLink>

      <!-- Loading -->
      <div
        v-if="loading"
        class="state-card"
      >
        <div class="loading-icon">
          📚
        </div>

        <h2>Kütüphane Yükleniyor</h2>

        <p>
          Kütüphane bilgileri hazırlanıyor...
        </p>

        <div class="loading-bar">
          <span></span>
        </div>
      </div>

      <!-- Hata -->
      <div
        v-else-if="errorMessage"
        class="state-card error-card"
      >
        <div class="state-icon error-icon">
          !
        </div>

        <h2>Bir Sorun Oluştu</h2>

        <p>
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="retry-button"
          @click="loadLibrary"
        >
          Tekrar Dene
        </button>
      </div>

      <!-- Kütüphane -->
      <section
        v-else-if="library"
        class="library-detail-card"
      >

        <!-- Sol görsel alanı -->
        <div class="library-visual">

          <div class="library-icon-wrapper">
            <div class="library-icon">
              📚
            </div>
          </div>

          <div class="visual-decoration decoration-one"></div>
          <div class="visual-decoration decoration-two"></div>

          <div class="visual-label">
            <span class="visual-label-dot"></span>
            Kütüphane
          </div>

        </div>

        <!-- Sağ bilgi alanı -->
        <div class="library-content">

          <div class="library-heading">

            <span class="library-label">
              KÜTÜPHANE
            </span>

            <h1>
              {{ library.name }}
            </h1>

            

          </div>

          <!-- Bilgiler -->
          <div class="info-list">

            <!-- Adres -->
            <div class="info-item">

              <div class="info-item-left">
                <div class="info-icon">
                  📍
                </div>

                <div>
                  <span class="info-label">
                    Adres
                  </span>

                  <span class="info-value">
                    {{ library.address }}
                  </span>
                </div>
              </div>

            </div>

            <!-- Üyelik -->
            <div class="info-item">

              <div class="info-item-left">
                <div class="info-icon">
                  ✓
                </div>

                <div>
                  <span class="info-label">
                    Üyelik Durumu
                  </span>

                  <span
                    :class="[
                      'membership-status',
                      isMember
                        ? 'member'
                        : 'not-member'
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
                  isMember
                    ? 'member'
                    : 'not-member'
                ]"
              >
                {{
                  isMember
                    ? 'ÜYE'
                    : 'ÜYE DEĞİL'
                }}
              </span>

            </div>

          </div>

          <!-- İşlemler -->
          <div class="actions">

            <!-- Üye -->
            <div
              v-if="isMember"
              class="member-box"
            >
              <div class="member-box-icon">
                ✓
              </div>

              <div>
                <strong>
                  Kütüphaneye Üyesiniz
                </strong>

                <span>
                  Bu kütüphanenin kitaplarını
                  keşfedebilirsiniz.
                </span>
              </div>
            </div>

            <!-- Üye değil -->
            <button
              v-else
              type="button"
              class="join-button"
              :disabled="joining"
              @click="joinLibrary"
            >
              <span class="join-button-icon">
                {{ joining ? '...' : '+' }}
              </span>

              <span>
                {{
                  joining
                    ? 'Üye Olunuyor...'
                    : 'Bu Kütüphaneye Üye Ol'
                }}
              </span>

              <span
                v-if="!joining"
                class="button-arrow"
              >
                →
              </span>
            </button>

          </div>

          <!-- İşlem mesajı -->
          <div
            v-if="message"
            :class="[
              'action-message',
              messageType
            ]"
          >
            <span class="message-icon">
              {{
                messageType === 'success'
                  ? '✓'
                  : '!'
              }}
            </span>

            <span>
              {{ message }}
            </span>
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

const library =
  ref<Library | null>(null)

const userLibraries =
  ref<UserLibrary[]>([])

const loading =
  ref(true)

const errorMessage =
  ref('')

const joining =
  ref(false)

const message =
  ref('')

const messageType =
  ref<'success' | 'error'>('success')

const isMember =
  computed(() => {

    if (!library.value) {
      return false
    }

    return userLibraries.value.some(
      item =>
        item.libraryId ===
        library.value?.id
    )
  })

/*
 * Kütüphane ve kullanıcının
 * üyelik bilgilerini getirir.
 */
const loadLibrary = async () => {

  try {

    loading.value = true
    errorMessage.value = ''
    message.value = ''

    const libraryId =
      String(route.params.id)

    if (!libraryId) {
      throw new Error(
        'Kütüphane ID bulunamadı.'
      )
    }

    const userId =
      localStorage.getItem('userId')

    if (!userId) {

      errorMessage.value =
        'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.'

      return
    }

    const [
      libraryData,
      userLibraryData
    ] = await Promise.all([

      apiFetch<Library>(
        `/api/Library/${libraryId}`
      ),

      apiFetch<UserLibrary[]>(
        `/api/UserLibrary/user/${userId}`
      )

    ])

    library.value =
      libraryData

    userLibraries.value =
      userLibraryData

  }
  catch (error) {

    console.error(
      'Kütüphane bilgileri alınırken hata oluştu:',
      error
    )

    errorMessage.value =
      'Kütüphane bilgileri alınamadı.'

  }
  finally {

    loading.value = false

  }

}

/*
 * Kütüphaneye üye ol.
 *
 * POST işlemi sonrasında backend
 * UserLibrary nesnesi döndürmediği için
 * üyelikler tekrar API'den alınır.
 */
const joinLibrary = async () => {

  try {

    if (!library.value) {
      return
    }

    const userId =
      localStorage.getItem('userId')

    if (!userId) {

      messageType.value =
        'error'

      message.value =
        'Üye olmak için giriş yapmalısınız.'

      return
    }

    if (isMember.value) {

      messageType.value =
        'error'

      message.value =
        'Bu kütüphaneye zaten üyesiniz.'

      return
    }

    joining.value = true
    message.value = ''

    await apiFetch(
      '/api/UserLibrary',
      {
        method: 'POST',

        body: {
          userId,
          libraryId:
            library.value.id
        }
      }
    )

    /*
     * Yeni üyelik bilgisini API'den
     * tekrar getiriyoruz.
     */
    const updatedUserLibraries =
      await apiFetch<UserLibrary[]>(
        `/api/UserLibrary/user/${userId}`
      )

    userLibraries.value =
      updatedUserLibraries

    messageType.value =
      'success'

    message.value =
      `${library.value.name} kütüphanesine başarıyla üye oldunuz.`

  }
  catch (error) {

    console.error(
      'Kütüphane üyeliği oluşturulurken hata oluştu:',
      error
    )

    messageType.value =
      'error'

    message.value =
      'Kütüphane üyeliği oluşturulurken bir hata oluştu.'

  }
  finally {

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
  background-color: #f5ede4;
  padding: 42px 24px 70px;
  color: #4b3021;
}

.library-detail-container {
  max-width: 1050px;
  margin: 0 auto;
}

/* =========================
   GERİ DÖN
========================= */

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 26px;

  color: #765b48;
  text-decoration: none;

  font-size: 14px;
  font-weight: 700;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.back-link:hover {
  color: #a95725;
  transform: translateX(-3px);
}

.back-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;

  background-color: #fffaf4;
  border: 1px solid #dfc8b2;
  border-radius: 9px;

  font-size: 17px;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.back-link:hover .back-icon {
  background-color: #f2dfce;
  border-color: #cfae91;
}

/* =========================
   ANA KART
========================= */

.library-detail-card {
  display: grid;
  grid-template-columns: 390px 1fr;

  min-height: 500px;

  overflow: hidden;

  background-color: #fffaf4;

  border: 1px solid #dfc8b2;
  border-radius: 24px;

  box-shadow:
    0 16px 45px rgba(91, 55, 31, 0.08);
}

/* =========================
   SOL GÖRSEL
========================= */

.library-visual {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  min-height: 500px;

  background:
    linear-gradient(
      145deg,
      #ead6c2 0%,
      #f2dfce 48%,
      #e5cdb6 100%
    );
}

.library-icon-wrapper {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 235px;
  height: 235px;

  background-color: rgba(255, 250, 244, 0.72);

  border: 1px solid
    rgba(169, 87, 37, 0.16);

  border-radius: 50%;

  box-shadow:
    0 18px 45px rgba(103, 62, 35, 0.12);
}

.library-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 175px;
  height: 175px;

  background-color: #fffaf4;

  border-radius: 42px;

  font-size: 82px;

  box-shadow:
    0 10px 28px rgba(91, 55, 31, 0.1);
}

.visual-decoration {
  position: absolute;

  border-radius: 50%;

  background-color: rgba(
    255,
    250,
    244,
    0.25
  );
}

.decoration-one {
  width: 180px;
  height: 180px;

  top: -70px;
  left: -60px;
}

.decoration-two {
  width: 220px;
  height: 220px;

  right: -100px;
  bottom: -100px;
}

.visual-label {
  position: absolute;
  z-index: 3;

  left: 28px;
  bottom: 26px;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 9px 13px;

  background-color: rgba(
    255,
    250,
    244,
    0.86
  );

  border: 1px solid
    rgba(169, 87, 37, 0.12);

  border-radius: 999px;

  color: #765b48;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 0.5px;
}

.visual-label-dot {
  width: 7px;
  height: 7px;

  background-color: #a95725;

  border-radius: 50%;
}

/* =========================
   SAĞ İÇERİK
========================= */

.library-content {
  display: flex;
  flex-direction: column;

  padding: 52px 48px;
}

.library-heading {
  margin-bottom: 30px;
}

.library-label {
  display: inline-block;

  margin-bottom: 10px;

  color: #a95725;

  font-size: 11px;
  font-weight: 800;

  letter-spacing: 1.8px;
}

.library-info h1 {
  margin: 0;

  color: #4b3021;

  font-size: 36px;
  line-height: 1.15;

  font-weight: 800;

  word-break: break-word;
}

.library-description {
  max-width: 500px;

  margin: 14px 0 0;

  color: #765b48;

  font-size: 14px;
  line-height: 1.7;
}

/* =========================
   BİLGİLER
========================= */

.info-list {
  border-top: 1px solid #ead8c6;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 18px 0;

  border-bottom: 1px solid #ead8c6;
}

.info-item-left {
  display: flex;
  align-items: center;

  gap: 13px;

  min-width: 0;
}

.info-icon {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 39px;
  height: 39px;

  background-color: #f2dfce;

  border-radius: 11px;

  font-size: 17px;
}

.info-label {
  display: block;

  margin-bottom: 4px;

  color: #927663;

  font-size: 11px;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.info-value {
  display: block;

  color: #4b3021;

  font-size: 14px;
  font-weight: 600;

  line-height: 1.5;

  word-break: break-word;
}

.membership-status {
  display: block;

  font-size: 14px;
  font-weight: 600;
}

.membership-status.member {
  color: #5c8b58;
}

.membership-status.not-member {
  color: #927663;
}

/* =========================
   DURUM BADGE
========================= */

.status-badge {
  flex-shrink: 0;

  padding: 7px 10px;

  border-radius: 999px;

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 0.7px;
}

.status-badge.member {
  background-color: #e8f1e5;
  border: 1px solid #c7ddc1;
  color: #5c8b58;
}

.status-badge.not-member {
  background-color: #f2dfce;
  border: 1px solid #dfc8b2;
  color: #8a6249;
}

/* =========================
   İŞLEMLER
========================= */

.actions {
  margin-top: 30px;
}

.join-button {
  width: 100%;

  display: flex;
  align-items: center;

  gap: 12px;

  padding: 14px 17px;

  background-color: #a95725;

  border: 1px solid #a95725;
  border-radius: 12px;

  color: #fffaf4;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.join-button:hover:not(:disabled) {
  background-color: #8e451e;

  transform: translateY(-1px);

  box-shadow:
    0 7px 18px rgba(142, 69, 30, 0.2);
}

.join-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.join-button-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 27px;
  height: 27px;

  background-color: rgba(
    255,
    250,
    244,
    0.16
  );

  border-radius: 7px;

  font-size: 18px;
}

.button-arrow {
  margin-left: auto;

  font-size: 18px;
}

/* =========================
   ÜYE DURUMU
========================= */

.member-box {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 14px 16px;

  background-color: #edf4ea;

  border: 1px solid #cbdcc6;
  border-radius: 12px;

  color: #5c8b58;
}

.member-box-icon {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;

  background-color: #dcebd8;

  border-radius: 8px;

  font-weight: 800;
}

.member-box strong {
  display: block;

  margin-bottom: 3px;

  font-size: 13px;
}

.member-box span {
  display: block;

  color: #6e856a;

  font-size: 12px;
}

/* =========================
   MESAJ
========================= */

.action-message {
  display: flex;
  align-items: center;

  gap: 9px;

  margin-top: 15px;

  padding: 12px 14px;

  border-radius: 10px;

  font-size: 13px;
  line-height: 1.5;
}

.message-icon {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  border-radius: 50%;

  font-size: 12px;
  font-weight: 800;
}

.action-message.success {
  background-color: #edf4ea;

  border: 1px solid #cbdcc6;

  color: #5c8b58;
}

.action-message.success .message-icon {
  background-color: #dcebd8;
}

.action-message.error {
  background-color: #fae9e5;

  border: 1px solid #e7c2b9;

  color: #a84d3d;
}

.action-message.error .message-icon {
  background-color: #f1d4ce;
}

/* =========================
   LOADING / ERROR
========================= */

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 390px;

  padding: 40px;

  background-color: #fffaf4;

  border: 1px solid #dfc8b2;
  border-radius: 22px;

  text-align: center;

  box-shadow:
    0 12px 35px rgba(91, 55, 31, 0.06);
}

.loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 72px;
  height: 72px;

  margin-bottom: 20px;

  background-color: #f2dfce;

  border-radius: 20px;

  font-size: 32px;

  animation: gentleFloat 1.8s ease-in-out infinite;
}

.state-card h2 {
  margin: 0 0 8px;

  color: #4b3021;

  font-size: 20px;
}

.state-card p {
  margin: 0;

  color: #765b48;

  font-size: 14px;
}

.loading-bar {
  width: 180px;
  height: 4px;

  margin-top: 22px;

  overflow: hidden;

  background-color: #ead8c6;

  border-radius: 99px;
}

.loading-bar span {
  display: block;

  width: 60%;
  height: 100%;

  background-color: #a95725;

  border-radius: inherit;

  animation: loadingMove 1.2s ease-in-out infinite;
}

.error-card {
  background-color: #fff8f6;

  border-color: #e7c2b9;
}

.state-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 60px;
  height: 60px;

  margin-bottom: 18px;

  border-radius: 18px;

  font-size: 25px;
  font-weight: 800;
}

.error-icon {
  background-color: #fae9e5;

  color: #a84d3d;
}

.retry-button {
  margin-top: 22px;

  padding: 10px 17px;

  background-color: #a95725;

  border: none;
  border-radius: 9px;

  color: #fffaf4;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #8e451e;
}

/* =========================
   ANİMASYONLAR
========================= */

@keyframes gentleFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }

}

@keyframes loadingMove {

  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(70%);
  }

  100% {
    transform: translateX(220%);
  }

}

/* =========================
   TABLET
========================= */

@media (max-width: 850px) {

  .library-detail-card {
    grid-template-columns: 320px 1fr;
  }

  .library-content {
    padding: 40px 32px;
  }

  .library-icon-wrapper {
    width: 190px;
    height: 190px;
  }

  .library-icon {
    width: 140px;
    height: 140px;

    font-size: 65px;
  }

  .library-info h1 {
    font-size: 30px;
  }

}

/* =========================
   MOBİL
========================= */

@media (max-width: 700px) {

  .library-detail-page {
    padding: 30px 16px 50px;
  }

  .back-link {
    margin-bottom: 20px;
  }

  .library-detail-card {
    grid-template-columns: 1fr;

    border-radius: 20px;
  }

  .library-visual {
    min-height: 300px;
  }

  .library-icon-wrapper {
    width: 170px;
    height: 170px;
  }

  .library-icon {
    width: 125px;
    height: 125px;

    border-radius: 32px;

    font-size: 58px;
  }

  .visual-label {
    left: 20px;
    bottom: 20px;
  }

  .library-content {
    padding: 32px 24px 30px;
  }

  .library-heading {
    margin-bottom: 25px;
  }

  .library-info h1 {
    font-size: 28px;
  }

  .info-item {
    align-items: flex-start;
  }

}

/* =========================
   KÜÇÜK MOBİL
========================= */

@media (max-width: 480px) {

  .library-detail-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .library-visual {
    min-height: 270px;
  }

  .library-content {
    padding: 27px 19px;
  }

  .library-info h1 {
    font-size: 25px;
  }

  .library-description {
    font-size: 13px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;

    gap: 10px;
  }

  .status-badge {
    align-self: flex-start;
  }

  .member-box {
    align-items: flex-start;
  }

}

</style>