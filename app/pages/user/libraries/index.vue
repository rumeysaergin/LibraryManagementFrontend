
<template>
  <main class="libraries-page">
    <div class="libraries-container">
     
<!-- HEADER -->
<NuxtLink to="/user" class="back-button">
  <span class="back-arrow">←</span>
  Kullanıcı Paneline Dön
</NuxtLink>

<header class="page-header">
  <div class="header-content">
    <div class="header-text">
      <span class="eyebrow">KÜTÜPHANE YÖNETİMİ</span>
      <h1>Kütüphanelerim</h1>
      <p>
        Üyesi olduğunuz kütüphaneleri görüntüleyin ve
        yeni kütüphaneleri keşfedin.
      </p>
    </div>
  </div>

  <div class="header-icon" aria-hidden="true">📚</div>
</header>


      <!-- STATS -->
      <section
        v-if="!isLoading && !errorMessage"
        class="stats-grid"
      >
        <article class="stat-card">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <span class="stat-label">Üyeliklerim</span>
            <strong>{{ myLibraries.length }}</strong>
            <span class="stat-description">
              Üye olduğunuz kütüphaneler
            </span>
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-icon">▤</div>
          <div class="stat-content">
            <span class="stat-label">Toplam Kütüphane</span>
            <strong>{{ allLibraries.length }}</strong>
            <span class="stat-description">
              Sistemdeki kütüphaneler
            </span>
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-icon">＋</div>
          <div class="stat-content">
            <span class="stat-label">Katılabileceğim</span>
            <strong>{{ availableLibraries.length }}</strong>
            <span class="stat-description">
              Keşfedilmeyi bekleyenler
            </span>
          </div>
        </article>
      </section>

      <!-- LOADING -->
      <div v-if="isLoading" class="state-card">
        <div class="loader"></div>
        <h3>Kütüphaneler yükleniyor</h3>
        <p>
          Kütüphane bilgileriniz hazırlanıyor, lütfen bekleyin.
        </p>
      </div>

      <!-- ERROR -->
      <div v-else-if="errorMessage" class="state-card error-state">
        <div class="state-icon">!</div>
        <h3>Bir sorun oluştu</h3>
        <p>{{ errorMessage }}</p>
        <button
          type="button"
          class="retry-button"
          @click="loadLibraries"
        >
          Tekrar Dene
        </button>
      </div>

      <template v-else>
        <!-- KÜTÜPHANELERİM -->
        <section class="library-section">
          <div class="section-heading">
            <div>
              <span class="section-eyebrow">KİŞİSEL ALANINIZ</span>
              <h2>Kütüphanelerim</h2>
              <p>
                Üyeliğiniz bulunan kütüphanelere buradan ulaşabilirsiniz.
              </p>
            </div>

            <span class="section-count">
              {{ myLibraries.length }} kütüphane
            </span>
          </div>

          <div
            v-if="myLibraries.length > 0"
            class="library-grid"
          >
            <article
              v-for="library in myLibraries"
              :key="library.id"
              class="library-card"
            >
              <div class="card-top">
                <div class="library-icon" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <span class="status-badge">
                  <span class="status-dot"></span>
                  AKTİF ÜYELİK
                </span>
              </div>

              <div class="card-content">
                <span class="card-overline">KÜTÜPHANE</span>
                <h3>{{ library.name }}</h3>

                <p class="library-address">
                  <span class="address-icon">⌖</span>
                  {{ library.address || 'Adres bilgisi bulunmuyor.' }}
                </p>
              </div>

              <div class="card-divider"></div>

              <div class="library-actions">
                <NuxtLink
                  :to="`/user/libraries/${library.id}`"
                  class="primary-button"
                >
                  <span>Kütüphaneye Git</span>
                  <span class="button-arrow">→</span>
                </NuxtLink>

                <button
                  type="button"
                  class="leave-button"
                  :disabled="leavingLibraryId !== null"
                  @click="openLeaveModal(library)"
                >
                  Kütüphaneden Ayrıl
                </button>
              </div>

              <p
                v-if="leaveMessage[library.id]"
                :class="[
                  'feedback-message',
                  leaveMessage[library.id].type
                ]"
                role="status"
              >
                <span>
                  {{
                    leaveMessage[library.id].type === 'success'
                      ? '✓'
                      : '!'
                  }}
                </span>
                {{ leaveMessage[library.id].text }}
              </p>
            </article>
          </div>

          <div v-else class="empty-card">
            <div class="empty-icon">📚</div>
            <h3>Henüz bir kütüphaneye üye değilsiniz</h3>
            <p>
              Aşağıdaki kütüphanelerden birine katılarak
              kütüphane hizmetlerinden yararlanmaya başlayabilirsiniz.
            </p>
            <a href="#discover-libraries" class="empty-action">
              Kütüphaneleri Keşfet <span>↓</span>
            </a>
          </div>
        </section>

        <div class="section-divider" aria-hidden="true">
          <span></span>
          <span class="divider-icon">✦</span>
          <span></span>
        </div>

        <!-- DİĞER KÜTÜPHANELER -->
        <section id="discover-libraries" class="library-section">
          <div class="section-heading">
            <div>
              <span class="section-eyebrow">YENİ YERLER KEŞFEDİN</span>
              <h2>Diğer Kütüphaneler</h2>
              <p>
                Üye olmadığınız kütüphaneleri inceleyip katılabilirsiniz.
              </p>
            </div>

            <span class="section-count">
              {{ availableLibraries.length }} kütüphane
            </span>
          </div>

          <div
            v-if="availableLibraries.length > 0"
            class="discover-list"
          >
            <article
              v-for="library in availableLibraries"
              :key="library.id"
              class="discover-card"
            >
              <div class="discover-icon" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div class="discover-info">
                <span class="card-overline">KÜTÜPHANE</span>
                <h3>{{ library.name }}</h3>
                <p>
                  <span class="address-icon">⌖</span>
                  {{ library.address || 'Adres bilgisi bulunmuyor.' }}
                </p>
              </div>

              <div class="discover-action">
                <span class="open-label">
                  <span class="status-dot"></span>
                  ÜYELİK AÇIK
                </span>

                <button
                  type="button"
                  class="join-button"
                  :disabled="joiningLibraryId === library.id"
                  @click="joinLibrary(library)"
                >
                  {{
                    joiningLibraryId === library.id
                      ? 'Katılınıyor...'
                      : '＋ Katıl'
                  }}
                </button>

                <p
                  v-if="joinMessage[library.id]"
                  :class="[
                    'feedback-message',
                    joinMessage[library.id].type
                  ]"
                  role="status"
                >
                  <span>
                    {{
                      joinMessage[library.id].type === 'success'
                        ? '✓'
                        : '!'
                    }}
                  </span>
                  {{ joinMessage[library.id].text }}
                </p>
              </div>
            </article>
          </div>

          <div v-else class="empty-card all-joined-card">
            <div class="empty-icon success-empty-icon">✓</div>
            <h3>Tüm kütüphanelere üyesiniz</h3>
            <p>
              Harika! Şu anda katılabileceğiniz başka bir
              kütüphane bulunmuyor.
            </p>
          </div>
        </section>
      </template>
    </div>

    <!-- LEAVE CONFIRM MODAL -->
    <div
      v-if="showLeaveModal"
      class="modal-overlay"
      @click.self="closeLeaveModal"
    >
      <section
        class="leave-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-modal-title"
      >
        <button
          type="button"
          class="modal-close"
          aria-label="Pencereyi kapat"
          :disabled="leavingLibraryId !== null"
          @click="closeLeaveModal"
        >
          ×
        </button>

        <div class="modal-icon">!</div>

        <span class="modal-eyebrow">ÜYELİK İŞLEMİ</span>

        <h2 id="leave-modal-title">Kütüphaneden Ayrıl</h2>

        <p class="modal-description">
          <strong>{{ selectedLibrary?.name }}</strong>
          kütüphanesinden ayrılmak istediğinize emin misiniz?
        </p>

        <div class="modal-warning">
          <span class="warning-icon">ⓘ</span>
          <p>
            Ayrıldığınızda bu kütüphaneye ait kitaplara
            üyeliğiniz üzerinden erişemezsiniz.
          </p>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="cancel-button"
            :disabled="leavingLibraryId !== null"
            @click="closeLeaveModal"
          >
            Vazgeç
          </button>

          <button
            type="button"
            class="confirm-leave-button"
            :disabled="leavingLibraryId !== null"
            @click="leaveLibrary"
          >
            {{
              leavingLibraryId !== null
                ? 'Ayrılınıyor...'
                : 'Evet, Ayrıl'
            }}
          </button>
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

interface Library {
  id: string
  name: string
  address: string
}

interface JoinMessage {
  type: 'success' | 'error'
  text: string
}

interface LeaveMessage {
  type: 'success' | 'error'
  text: string
}

const { apiFetch } = useApi()

const allLibraries = ref<Library[]>([])
const myLibraries = ref<Library[]>([])
const userLibraries = ref<UserLibrary[]>([])

const isLoading = ref(true)
const errorMessage = ref('')

const joiningLibraryId = ref<string | null>(null)
const leavingLibraryId = ref<string | null>(null)

const joinMessage = ref<Record<string, JoinMessage>>({})
const leaveMessage = ref<Record<string, LeaveMessage>>({})

/* AYRILMA ONAY PENCERESİ */
const showLeaveModal = ref(false)
const selectedLibrary = ref<Library | null>(null)

/* ÜYELİK KONTROLÜ */
const isMember = (libraryId: string) => {
  return userLibraries.value.some(
    userLibrary => userLibrary.libraryId === libraryId
  )
}

/* KÜTÜPHANELERİM LİSTESİNİ GÜNCELLE */
const updateMyLibraries = () => {
  const memberLibraryIds = userLibraries.value.map(
    item => item.libraryId
  )

  myLibraries.value = allLibraries.value.filter(
    library => memberLibraryIds.includes(library.id)
  )
}

/* KATILINABİLECEK KÜTÜPHANELER */
const availableLibraries = computed(() => {
  return allLibraries.value.filter(
    library => !isMember(library.id)
  )
})

/* KÜTÜPHANELERİ YÜKLE */
const loadLibraries = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const userId = localStorage.getItem('userId')

    if (!userId) {
      errorMessage.value =
        'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.'
      return
    }

    const [libraryData, userLibraryData] = await Promise.all([
      apiFetch<Library[]>('/api/Library'),
      apiFetch<UserLibrary[]>(
        `/api/UserLibrary/user/${encodeURIComponent(userId)}`
      )
    ])

    allLibraries.value = Array.isArray(libraryData)
      ? libraryData
      : []

    userLibraries.value = Array.isArray(userLibraryData)
      ? userLibraryData
      : []

    updateMyLibraries()
  } catch (error) {
    console.error(
      'Kütüphaneler yüklenirken hata oluştu:',
      error
    )

    errorMessage.value =
      'Kütüphane bilgileri alınırken bir hata oluştu.'
  } finally {
    isLoading.value = false
  }
}

/* KÜTÜPHANEYE KATIL */
const joinLibrary = async (library: Library) => {
  try {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      joinMessage.value[library.id] = {
        type: 'error',
        text: 'Üye olmak için giriş yapmalısınız.'
      }
      return
    }

    if (isMember(library.id)) {
      joinMessage.value[library.id] = {
        type: 'error',
        text: 'Bu kütüphaneye zaten üyesiniz.'
      }
      return
    }

    joiningLibraryId.value = library.id
    delete joinMessage.value[library.id]

    await apiFetch('/api/UserLibrary', {
      method: 'POST',
      body: {
        userId,
        libraryId: library.id
      }
    })

    const updatedUserLibraries = await apiFetch<UserLibrary[]>(
      `/api/UserLibrary/user/${encodeURIComponent(userId)}`
    )

    userLibraries.value = Array.isArray(updatedUserLibraries)
      ? updatedUserLibraries
      : []

    updateMyLibraries()

    joinMessage.value[library.id] = {
      type: 'success',
      text: `${library.name} kütüphanesine başarıyla üye oldunuz.`
    }
  } catch (error) {
    console.error(
      'Kütüphane üyeliği oluşturulurken hata oluştu:',
      error
    )

    joinMessage.value[library.id] = {
      type: 'error',
      text: 'Kütüphane üyeliği oluşturulurken bir hata oluştu.'
    }
  } finally {
    joiningLibraryId.value = null
  }
}

/* AYRILMA PENCERESİNİ AÇ */
const openLeaveModal = (library: Library) => {
  selectedLibrary.value = library
  showLeaveModal.value = true
}

/* AYRILMA PENCERESİNİ KAPAT */
const closeLeaveModal = () => {
  if (leavingLibraryId.value !== null) {
    return
  }

  showLeaveModal.value = false
  selectedLibrary.value = null
}

/* KÜTÜPHANEDEN AYRIL */
const leaveLibrary = async () => {
  if (!selectedLibrary.value) {
    return
  }

  const library = selectedLibrary.value

  const userLibrary = userLibraries.value.find(
    item => item.libraryId === library.id
  )

  if (!userLibrary) {
    leaveMessage.value[library.id] = {
      type: 'error',
      text: 'Kütüphane üyelik kaydı bulunamadı.'
    }

    closeLeaveModal()
    return
  }

  try {
    leavingLibraryId.value = library.id
    delete leaveMessage.value[library.id]

    await apiFetch(`/api/UserLibrary/${userLibrary.id}`, {
      method: 'DELETE'
    })

    userLibraries.value = userLibraries.value.filter(
      item => item.id !== userLibrary.id
    )

    updateMyLibraries()

    leaveMessage.value[library.id] = {
      type: 'success',
      text: `${library.name} kütüphanesinden ayrıldınız.`
    }

    showLeaveModal.value = false
    selectedLibrary.value = null
  } catch (error) {
    console.error(
      'Kütüphane üyeliği silinirken hata oluştu:',
      error
    )

    leaveMessage.value[library.id] = {
      type: 'error',
      text: 'Kütüphane üyeliği sonlandırılırken bir hata oluştu.'
    }
  } finally {
    leavingLibraryId.value = null
  }
}

/* SAYFA AÇILDIĞINDA */
onMounted(() => {
  loadLibraries()
})
</script>

<style scoped>

/* SAYFA */
.libraries-page {
  min-height: 100vh;
  padding: 32px 20px 60px;
  background: #f6f0e7;
  color: #46372d;
}

.libraries-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

/* BAŞLIK KARTI — CEZALARIM SAYFASIYLA AYNI DÜZEN */
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
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


/* GERİ DÖNÜŞ BAĞLANTISI */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #785b46;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-button:hover {
  color: #a85d2d;
  background: transparent;
  transform: translateX(-3px);
}

.back-arrow {
  font-size: 17px;
}

/* ÖNCEKİ SAYFALARLA UYUMLU KREM DEGRADE BAŞLIK */
/* Kartın içindeki metin alanı */
.header-content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.header-text {
  min-width: 0;
}

.eyebrow,
.section-eyebrow {
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
  line-height: 1.25;
}

.page-header p {
  max-width: 680px;
  margin: 0;
  color: #816b58;
  font-size: 15px;
  line-height: 1.7;
}

/* Kitap ikonu */
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


/* İSTATİSTİKLER */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 0 0 48px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 22px;
  background: #fffdf9;
  border: 1px solid #e5d7c8;
  border-radius: 16px;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgb(75 52 35 / 9%);
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  color: #a06a3e;
  background: #f4e5d5;
  border: 1px solid #ead4be;
  border-radius: 13px;
  font-size: 23px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  color: #806b5a;
  font-size: 12px;
  font-weight: 600;
}

.stat-card strong {
  margin: 3px 0;
  color: #493122;
  font-size: 29px;
  font-weight: 750;
  line-height: 1.2;
}

.stat-description {
  color: #998574;
  font-size: 10px;
  line-height: 1.5;
}

/* BÖLÜM BAŞLIKLARI */
.library-section {
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
  color: #816b58;
  font-size: 13px;
  line-height: 1.7;
}

.section-count {
  flex-shrink: 0;
  padding: 8px 12px;
  color: #78583f;
  background: #fffdf9;
  border: 1px solid #e5d7c8;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

/* ÜYE OLUNAN KÜTÜPHANELER */
.library-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.library-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 25px;
  background: #fffdf9;
  border: 1px solid #e6d8c9;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgb(75 52 35 / 5%);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.library-card:hover {
  transform: translateY(-3px);
  border-color: #d8c3ae;
  box-shadow: 0 10px 25px rgb(75 52 35 / 9%);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 25px;
}

.library-icon,
.discover-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  background: #f2e1d0;
  border: 1px solid #ead3bd;
  border-radius: 14px;
}

.library-icon span,
.discover-icon span {
  display: block;
  width: 4px;
  height: 21px;
  background: #a45b2d;
  border-radius: 5px;
}

.library-icon span:nth-child(2),
.discover-icon span:nth-child(2) {
  height: 29px;
  background: #c27a45;
}

.library-icon span:nth-child(3),
.discover-icon span:nth-child(3) {
  height: 16px;
  background: #d7a078;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  color: #52734b;
  background: #edf3e9;
  border: 1px solid #d7e5d0;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.45px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  background: #6b965d;
  border-radius: 50%;
}

.card-content {
  flex: 1;
  min-width: 0;
  margin-bottom: 21px;
}

.card-overline {
  display: block;
  margin-bottom: 7px;
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.card-content h3,
.discover-info h3 {
  margin: 0 0 10px;
  color: #493122;
  font-size: 20px;
  font-weight: 750;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.library-address,
.discover-info p {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 0;
  color: #816b58;
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.address-icon {
  flex-shrink: 0;
  color: #a06a3e;
  font-size: 16px;
  line-height: 1.3;
}

.card-divider {
  height: 1px;
  margin: 20px 0;
  background: #eee3d8;
}

/* KÜTÜPHANE İŞLEMLERİ */
.library-actions {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.primary-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px;
  color: #fffaf4;
  background: #78583f;
  border: 1px solid #78583f;
  border-radius: 10px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.2s ease, transform 0.2s ease;
}

.primary-button:hover {
  background: #5d422f;
  transform: translateY(-1px);
}

.button-arrow {
  font-size: 19px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.primary-button:hover .button-arrow {
  transform: translateX(3px);
}

.leave-button {
  width: 100%;
  padding: 11px 14px;
  color: #a25749;
  background: #fffaf6;
  border: 1px solid #ead6ca;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.leave-button:hover:not(:disabled) {
  background: #fff1ec;
  border-color: #dcb7a9;
}

.leave-button:disabled,
.join-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* İŞLEM MESAJLARI */
.feedback-message {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 12px 0 0;
  font-size: 11px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.feedback-message.success {
  color: #527b4b;
}

.feedback-message.error {
  color: #b94f43;
}

/* BÖLÜM AYIRICI */
.section-divider {
  display: flex;
  align-items: center;
  gap: 17px;
  margin: 45px 0;
}

.section-divider > span:first-child,
.section-divider > span:last-child {
  flex: 1;
  height: 1px;
  background: #ddc8b4;
}

.divider-icon {
  color: #b78359;
  font-size: 17px;
}

/* DİĞER KÜTÜPHANELER */
.discover-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.discover-card {
  display: flex;
  align-items: center;
  gap: 19px;
  min-width: 0;
  padding: 20px 22px;
  background: #fffdf9;
  border: 1px solid #e6d8c9;
  border-radius: 16px;
  box-shadow: 0 5px 18px rgb(75 52 35 / 4%);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.discover-card:hover {
  border-color: #d8c3ae;
  box-shadow: 0 9px 24px rgb(75 52 35 / 7%);
}

.discover-icon {
  width: 46px;
  height: 46px;
}

.discover-icon span {
  height: 17px;
}

.discover-icon span:nth-child(2) {
  height: 24px;
}

.discover-icon span:nth-child(3) {
  height: 14px;
}

.discover-info {
  flex: 1;
  min-width: 0;
}

.discover-info h3 {
  margin-bottom: 5px;
  font-size: 16px;
}

.discover-info .card-overline {
  margin-bottom: 5px;
}

.discover-info p {
  font-size: 12px;
}

.discover-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 13px;
  flex-shrink: 0;
  flex-wrap: wrap;
  max-width: 230px;
}

.open-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #66805c;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.join-button {
  padding: 10px 17px;
  color: #78583f;
  background: #f7e9da;
  border: 1px solid #ead4be;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.join-button:hover:not(:disabled) {
  color: #fffaf4;
  background: #78583f;
  border-color: #78583f;
}

.discover-action .feedback-message {
  flex-basis: 100%;
  justify-content: flex-end;
  margin-top: 0;
  text-align: right;
}

/* BOŞ DURUMLAR */
.empty-card {
  padding: 42px 28px;
  text-align: center;
  background: #fffdf9;
  border: 1px dashed #d9bea4;
  border-radius: 18px;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 17px;
  color: #a06a3e;
  background: #f3e2d0;
  border: 1px solid #e8d1ba;
  border-radius: 17px;
  font-size: 23px;
}

.empty-card h3 {
  margin: 0 0 9px;
  color: #493122;
  font-size: 17px;
  font-weight: 750;
}

.empty-card p {
  max-width: 510px;
  margin: 0 auto;
  color: #816b58;
  font-size: 13px;
  line-height: 1.8;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 19px;
  padding: 10px 15px;
  color: #78583f;
  background: #f7e9da;
  border: 1px solid #ead4be;
  border-radius: 9px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

.empty-action:hover {
  background: #eed7c0;
}

.success-empty-icon {
  color: #55774c;
  background: #eaf1e5;
  border-color: #d5e2ce;
}

/* YÜKLENİYOR / HATA */
.state-card {
  padding: 48px 25px;
  text-align: center;
  background: #fffdf9;
  border: 1px solid #e5d7c8;
  border-radius: 18px;
  box-shadow: 0 5px 18px rgb(75 52 35 / 5%);
}

.state-card h3 {
  margin: 0 0 8px;
  color: #493122;
  font-size: 18px;
}

.state-card p {
  max-width: 500px;
  margin: 0 auto;
  color: #816b58;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.loader {
  width: 35px;
  height: 35px;
  margin: 0 auto 18px;
  border: 3px solid #ead8c6;
  border-top-color: #78583f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-state {
  background: #fff7f4;
  border-color: #dfb9ad;
}

.error-state h3 {
  color: #98483e;
}

.state-icon {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  margin: 0 auto 15px;
  color: #a84d3d;
  background: #f9e9e5;
  border: 1px solid #eed0c8;
  border-radius: 50%;
  font-size: 20px;
  font-weight: 800;
}

.retry-button {
  margin-top: 18px;
  padding: 10px 16px;
  color: #fffaf4;
  background: #78583f;
  border: none;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.retry-button:hover {
  background: #5d422f;
}

/* AYRILMA ONAY PENCERESİ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(47, 31, 22, 0.52);
  backdrop-filter: blur(6px);
}

.leave-modal {
  position: relative;
  width: min(440px, 100%);
  padding: 34px;
  text-align: center;
  background: #fffaf4;
  border: 1px solid #e7d4c0;
  border-radius: 22px;
  box-shadow: 0 25px 75px rgba(42, 27, 18, 0.25);
  animation: modalAppear 0.22s ease;
}

.modal-close {
  position: absolute;
  top: 13px;
  right: 15px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #8a7665;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 25px;
  cursor: pointer;
}

.modal-close:hover:not(:disabled) {
  color: #493122;
  background: #f3e7db;
}

.modal-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 17px;
  color: #a34f41;
  background: #f9e9e4;
  border: 1px solid #efd0c7;
  border-radius: 17px;
  font-size: 24px;
  font-weight: 800;
}

.modal-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.leave-modal h2 {
  margin: 0 0 13px;
  color: #493122;
  font-size: 23px;
  font-weight: 750;
}

.modal-description {
  margin: 0;
  color: #816b58;
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.modal-description strong {
  color: #493122;
}

.modal-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 18px;
  padding: 13px;
  text-align: left;
  background: #f8eee4;
  border: 1px solid #efddca;
  border-radius: 11px;
}

.warning-icon {
  flex-shrink: 0;
  color: #a06a3e;
  font-size: 17px;
}

.modal-warning p {
  margin: 0;
  color: #816b58;
  font-size: 11px;
  line-height: 1.7;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
  margin-top: 24px;
}

.cancel-button,
.confirm-leave-button {
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.cancel-button {
  color: #765b48;
  background: #fffaf4;
  border: 1px solid #dfcbb8;
}

.cancel-button:hover:not(:disabled) {
  background: #f4e8dc;
}

.confirm-leave-button {
  color: #fff;
  background: #a45143;
  border: 1px solid #a45143;
}

.confirm-leave-button:hover:not(:disabled) {
  background: #8e4034;
  border-color: #8e4034;
}

.cancel-button:disabled,
.confirm-leave-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* KLAVYE ERİŞİLEBİLİRLİĞİ */
button:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(169, 106, 61, 0.42);
  outline-offset: 3px;
}

/* TABLET */
@media (max-width: 800px) {
  .libraries-page {
    padding: 28px 18px 55px;
  }

  .header-content {
    padding: 26px;
  }

  .stats-grid {
    gap: 12px;
  }

  .stat-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
  }

  .stat-description {
    display: none;
  }

  .library-grid {
    grid-template-columns: 1fr;
  }

  .discover-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .discover-info {
    width: calc(100% - 70px);
    flex: 1 1 calc(100% - 70px);
  }

  .discover-action {
    width: 100%;
    max-width: none;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid #eee1d3;
  }

  .discover-action .feedback-message {
    justify-content: flex-start;
    text-align: left;
  }
}

/* MOBİL */
@media (max-width: 520px) {
  .libraries-page {
    padding: 22px 13px 42px;
  }

  .back-button {
    margin-bottom: 17px;
    font-size: 12px;
  }

  .header-content {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
    padding: 23px 20px;
    border-radius: 17px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    font-size: 27px;
  }

  .header-content h1 {
    font-size: 27px;
  }

  .header-content p {
    font-size: 14px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    margin-bottom: 38px;
  }

  .stat-card {
    align-items: center;
    flex-direction: row;
    padding: 16px;
  }

  .stat-description {
    display: block;
  }

  .stat-card strong {
    font-size: 25px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .section-heading h2 {
    font-size: 23px;
  }

  .section-heading p {
    font-size: 12px;
  }

  .library-card {
    padding: 20px;
  }

  .card-top {
    align-items: flex-start;
  }

  .card-content h3 {
    font-size: 18px;
  }

  .discover-card {
    gap: 13px;
    padding: 16px;
  }

  .discover-action {
    align-items: stretch;
    flex-direction: column;
  }

  .open-label {
    display: none;
  }

  .join-button {
    width: 100%;
  }

  .discover-action .feedback-message {
    text-align: left;
  }

  .empty-card {
    padding: 32px 18px;
  }

  .leave-modal {
    padding: 30px 20px 22px;
  }

  .leave-modal h2 {
    font-size: 21px;
  }

  .modal-actions {
    grid-template-columns: 1fr;
  }
}

/* ANİMASYONLAR */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
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



@media (max-width: 600px) {
  .libraries-page {
    padding: 24px 14px 40px;
  }

  .page-header {
    align-items: flex-start;
    gap: 16px;
    padding: 23px 20px;
    border-radius: 17px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    font-size: 27px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .page-header p {
    font-size: 14px;
  }
}


}
</style>
