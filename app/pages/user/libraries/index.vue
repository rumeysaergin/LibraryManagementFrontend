<template>
  <main class="libraries-page">

    <div class="libraries-container">

      <!-- HEADER -->
      <div class="page-header">

        <NuxtLink to="/user" class="back-button">
          ← Kullanıcı Paneline Dön
        </NuxtLink>

        <div class="header-content">

          <h1>
            Kütüphanelerim
          </h1>

          <p>
            Üyesi olduğunuz kütüphaneleri görüntüleyin ve
            yeni kütüphaneleri keşfedin.
          </p>

        </div>

      </div>


      <!-- STATS -->
      <div
        v-if="!isLoading && !errorMessage"
        class="stats-grid"
      >

        <div class="stat-card">

          <span class="stat-label">
            Üyeliklerim
          </span>

          <strong>
            {{ myLibraries.length }}
          </strong>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Toplam Kütüphane
          </span>

          <strong>
            {{ allLibraries.length }}
          </strong>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Katılabileceğim
          </span>

          <strong>
            {{ availableLibraries.length }}
          </strong>

        </div>

      </div>


      <!-- LOADING -->
      <div
        v-if="isLoading"
        class="state-card"
      >

        <div class="loader"></div>

        <p>
          Kütüphaneler yükleniyor...
        </p>

      </div>


      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="state-card error-state"
      >

        <div class="state-icon">
          !
        </div>

        <p>
          {{ errorMessage }}
        </p>

      </div>


      <template v-else>

        <!-- KÜTÜPHANELERİM -->
        <section class="library-section">

          <div class="section-header">

            <h2>
              Kütüphanelerim
            </h2>

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

                <div class="library-icon">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

                <span class="status-badge">
                  AKTİF
                </span>

              </div>


              <div class="card-content">

                <h3>
                  {{ library.name }}
                </h3>

                <p>
                  {{ library.address }}
                </p>

              </div>


              <div class="library-actions">

                <NuxtLink
                  :to="`/user/libraries/${library.id}`"
                  class="primary-button"
                >

                  <span>
                    Kütüphaneye Git
                  </span>

                  <span class="button-arrow">
                    →
                  </span>

                </NuxtLink>


                <button
                  class="leave-button"
                  :disabled="leavingLibraryId !== null"
                  @click="openLeaveModal(library)"
                >

                  <span>
                    Kütüphaneden Ayrıl
                  </span>

                </button>

              </div>


              <!-- LEAVE MESSAGE -->
              <p
                v-if="leaveMessage[library.id]"
                :class="[
                  'leave-message',
                  leaveMessage[library.id].type
                ]"
              >
                {{ leaveMessage[library.id].text }}
              </p>

            </article>

          </div>


          <!-- EMPTY -->
          <div
            v-else
            class="empty-card"
          >

            <div class="empty-icon">
              +
            </div>

            <h3>
              Henüz bir kütüphaneye üye değilsiniz
            </h3>

            <p>
              Aşağıdaki kütüphanelerden birine katılarak
              kütüphane hizmetlerinden yararlanmaya başlayabilirsiniz.
            </p>

          </div>

        </section>


        <!-- DIVIDER -->
        <div class="section-divider"></div>


        <!-- DİĞER KÜTÜPHANELER -->
        <section class="library-section">

          <div class="section-header">

            <h2>
              Diğer Kütüphaneler
            </h2>

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

              <div class="discover-icon">

                <span></span>
                <span></span>
                <span></span>

              </div>


              <div class="discover-info">

                <h3>
                  {{ library.name }}
                </h3>

                <p>
                  {{ library.address }}
                </p>

              </div>


              <div class="discover-action">

                <span class="open-label">
                  ÜYELİK AÇIK
                </span>

                <button
                  class="join-button"
                  :disabled="joiningLibraryId === library.id"
                  @click="joinLibrary(library)"
                >

                  {{
                    joiningLibraryId === library.id
                      ? 'Katılınıyor...'
                      : 'Katıl'
                  }}

                </button>


                <p
                  v-if="joinMessage[library.id]"
                  :class="[
                    'join-message',
                    joinMessage[library.id].type
                  ]"
                >
                  {{ joinMessage[library.id].text }}
                </p>

              </div>

            </article>

          </div>


          <!-- ALL JOINED -->
          <div
            v-else
            class="empty-card"
          >

            <div class="empty-icon">
              ✓
            </div>

            <h3>
              Tüm kütüphanelere üyesiniz
            </h3>

            <p>
              Şu anda katılabileceğiniz başka bir
              kütüphane bulunmuyor.
            </p>

          </div>

        </section>

      </template>

    </div>


    <!-- =========================
         LEAVE CONFIRM MODAL
    ========================== -->

    <div
      v-if="showLeaveModal"
      class="modal-overlay"
      @click.self="closeLeaveModal"
    >

      <div class="leave-modal">

        <div class="modal-icon">
          !
        </div>


        <h2>
          Kütüphaneden Ayrıl
        </h2>


        <p>
          <strong>
            {{ selectedLibrary?.name }}
          </strong>
          kütüphanesinden ayrılmak istediğinize emin misiniz?
        </p>


        <p class="modal-warning">
          Ayrıldığınızda bu kütüphaneye ait kitaplara
          üyeliğiniz üzerinden erişemezsiniz.
        </p>


        <div class="modal-actions">

          <button
            class="cancel-button"
            :disabled="leavingLibraryId !== null"
            @click="closeLeaveModal"
          >
            Vazgeç
          </button>


          <button
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

      </div>

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


const allLibraries =
  ref<Library[]>([])

const myLibraries =
  ref<Library[]>([])

const userLibraries =
  ref<UserLibrary[]>([])


const isLoading =
  ref(true)

const errorMessage =
  ref('')


const joiningLibraryId =
  ref<string | null>(null)

const leavingLibraryId =
  ref<string | null>(null)


const joinMessage =
  ref<Record<string, JoinMessage>>({})

const leaveMessage =
  ref<Record<string, LeaveMessage>>({})


/* =========================
   LEAVE MODAL
========================= */

const showLeaveModal =
  ref(false)

const selectedLibrary =
  ref<Library | null>(null)


/* =========================
   MEMBER CHECK
========================= */

const isMember = (
  libraryId: string
) => {

  return userLibraries.value.some(
    userLibrary =>
      userLibrary.libraryId === libraryId
  )

}


/* =========================
   UPDATE MY LIBRARIES
========================= */

const updateMyLibraries = () => {

  const memberLibraryIds =
    userLibraries.value.map(
      item =>
        item.libraryId
    )


  myLibraries.value =
    allLibraries.value.filter(
      library =>
        memberLibraryIds.includes(
          library.id
        )
    )

}


/* =========================
   AVAILABLE LIBRARIES
========================= */

const availableLibraries =
  computed(() => {

    return allLibraries.value.filter(
      library =>
        !isMember(library.id)
    )

  })


/* =========================
   LOAD LIBRARIES
========================= */

const loadLibraries = async () => {

  try {

    isLoading.value = true

    errorMessage.value = ''


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

      apiFetch<Library[]>(
        '/api/Library'
      ),

      apiFetch<UserLibrary[]>(
        `/api/UserLibrary/user/${userId}`
      )

    ])


    allLibraries.value =
      libraryData


    userLibraries.value =
      userLibraryData


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


/* =========================
   JOIN LIBRARY
========================= */

const joinLibrary = async (
  library: Library
) => {

  try {

    const userId =
      localStorage.getItem('userId')


    if (!userId) {

      joinMessage.value[library.id] = {

        type: 'error',

        text:
          'Üye olmak için giriş yapmalısınız.'

      }

      return

    }


    if (isMember(library.id)) {

      joinMessage.value[library.id] = {

        type: 'error',

        text:
          'Bu kütüphaneye zaten üyesiniz.'

      }

      return

    }


    joiningLibraryId.value =
      library.id


    /*
     * Önce üyelik oluşturuluyor.
     */
    await apiFetch(
      '/api/UserLibrary',
      {

        method: 'POST',

        body: {

          userId,

          libraryId:
            library.id

        }

      }
    )


    /*
     * POST işleminden sonra
     * backend'den güncel üyelikleri tekrar alıyoruz.
     *
     * Böylece sayfayı yenilemeye gerek kalmadan
     * Kütüphanelerim listesi güncelleniyor.
     */
    const updatedUserLibraries =
      await apiFetch<UserLibrary[]>(
        `/api/UserLibrary/user/${userId}`
      )


    userLibraries.value =
      updatedUserLibraries


    /*
     * Kütüphanelerim listesini güncelle.
     */
    updateMyLibraries()


    /*
     * Başarı mesajı.
     */
    joinMessage.value[library.id] = {

      type: 'success',

      text:
        `${library.name} kütüphanesine başarıyla üye oldunuz.`

    }

  } catch (error) {

    console.error(
      'Kütüphane üyeliği oluşturulurken hata oluştu:',
      error
    )


    joinMessage.value[library.id] = {

      type: 'error',

      text:
        'Kütüphane üyeliği oluşturulurken bir hata oluştu.'

    }

  } finally {

    joiningLibraryId.value =
      null

  }

}


/* =========================
   OPEN LEAVE MODAL
========================= */

const openLeaveModal = (
  library: Library
) => {

  selectedLibrary.value =
    library

  showLeaveModal.value =
    true

}


/* =========================
   CLOSE LEAVE MODAL
========================= */

const closeLeaveModal = () => {

  if (
    leavingLibraryId.value !== null
  ) {

    return

  }


  showLeaveModal.value =
    false

  selectedLibrary.value =
    null

}


/* =========================
   LEAVE LIBRARY
========================= */

const leaveLibrary = async () => {

  if (!selectedLibrary.value) {

    return

  }


  const library =
    selectedLibrary.value


  /*
   * Önce kullanıcının bu kütüphaneye
   * ait UserLibrary kaydını buluyoruz.
   */
  const userLibrary =
    userLibraries.value.find(
      item =>
        item.libraryId === library.id
    )


  if (!userLibrary) {

    leaveMessage.value[library.id] = {

      type: 'error',

      text:
        'Kütüphane üyelik kaydı bulunamadı.'

    }


    closeLeaveModal()

    return

  }


  try {

    leavingLibraryId.value =
      library.id


    /*
     * UserLibrary kaydını sil.
     */
    await apiFetch(
      `/api/UserLibrary/${userLibrary.id}`,
      {

        method: 'DELETE'

      }
    )


    /*
     * Frontend'deki üyelik listesinden
     * silinen kaydı kaldır.
     */
    userLibraries.value =
      userLibraries.value.filter(
        item =>
          item.id !== userLibrary.id
      )


    /*
     * Kütüphanelerim listesini güncelle.
     */
    updateMyLibraries()


    /*
     * Başarı mesajı.
     */
    leaveMessage.value[library.id] = {

      type: 'success',

      text:
        `${library.name} kütüphanesinden ayrıldınız.`

    }


    /*
     * Modalı kapat.
     */
    showLeaveModal.value =
      false

    selectedLibrary.value =
      null

  } catch (error) {

    console.error(
      'Kütüphane üyeliği silinirken hata oluştu:',
      error
    )


    leaveMessage.value[library.id] = {

      type: 'error',

      text:
        'Kütüphane üyeliği sonlandırılırken bir hata oluştu.'

    }

  } finally {

    leavingLibraryId.value =
      null

  }

}


/* =========================
   ON MOUNTED
========================= */

onMounted(() => {

  loadLibraries()

})

</script>


<style scoped>

/* =========================
   PAGE
========================= */

.libraries-page {

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


.libraries-container {

  width: min(1100px, 100%);

  margin: 0 auto;

  position: relative;

  z-index: 1;

}


/* =========================
   HEADER
========================= */

.page-header {

  margin-bottom: 36px;

}


.back-button {

  display: inline-flex;

  align-items: center;

  gap: 8px;

  color: #4b3021;

  text-decoration: none;

  font-size: 14px;

  font-weight: 600;

  margin-bottom: 28px;

  padding: 7px 12px;

  background: rgba(255, 250, 244, 0.92);

  border-radius: 7px;

  box-shadow:
    0 2px 8px
    rgba(92, 57, 34, 0.08);

  transition: 0.2s ease;

}


.back-button:hover {

  color: #a95725;

  transform: translateX(-3px);

  background:
    rgba(255, 250, 244, 0.98);

}


.header-content {

  background:
    rgba(255, 250, 244, 0.98);

  border: 1px solid #dfc8b2;

  border-radius: 20px;

  padding: 38px 42px;

  box-shadow:
    0 12px 35px
    rgba(92, 57, 34, 0.12);

}


.header-content h1 {

  margin: 0;

  color: #3b261b;

  font-size:
    clamp(30px, 4vw, 42px);

  font-weight: 700;

  letter-spacing: -1px;

}


.header-content p {

  margin: 12px 0 0;

  color: #6f594b;

  font-size: 15px;

  line-height: 1.7;

}


/* =========================
   STATS
========================= */

.stats-grid {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 16px;

  margin-bottom: 45px;

}


.stat-card {

  background:
    rgba(255, 250, 244, 0.98);

  border: 1px solid #e1ccb9;

  border-radius: 16px;

  padding: 22px 24px;

  box-shadow:
    0 8px 24px
    rgba(92, 57, 34, 0.07);

  transition: 0.2s ease;

}


.stat-card:hover {

  transform: translateY(-2px);

  border-color: #cfa47e;

  box-shadow:
    0 12px 28px
    rgba(174, 91, 38, 0.12);

}


.stat-label {

  display: block;

  color: #8e7869;

  font-size: 12px;

  margin-bottom: 8px;

}


.stat-card strong {

  color: #b7652a;

  font-size: 28px;

  font-weight: 700;

}


/* =========================
   SECTION
========================= */

.library-section {

  margin-bottom: 42px;

}


.section-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  margin-bottom: 20px;

}


.section-header h2 {

  display: inline-block;

  margin: 0;

  padding: 5px 12px;

  color: #4b3021;

  background:
    rgba(255, 250, 244, 0.94);

  border-radius: 7px;

  font-size: 24px;

  font-weight: 650;

  letter-spacing: -0.4px;

  box-shadow:
    0 2px 8px
    rgba(92, 57, 34, 0.07);

}


.section-count {

  color: #6f594b;

  background:
    rgba(255, 250, 244, 0.90);

  padding: 4px 8px;

  border-radius: 6px;

  font-size: 13px;

}


/* =========================
   MY LIBRARIES
========================= */

.library-grid {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 18px;

}


.library-card {

  background:
    rgba(255, 250, 244, 0.98);

  border: 1px solid #e0c8b2;

  border-radius: 18px;

  padding: 25px;

  box-shadow:
    0 8px 25px
    rgba(92, 57, 34, 0.07);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

}


.library-card:hover {

  transform: translateY(-3px);

  border-color: #cfa47e;

  box-shadow:
    0 14px 32px
    rgba(174, 91, 38, 0.12);

}


.card-top {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 25px;

}


.library-icon,
.discover-icon {

  width: 48px;

  height: 48px;

  border-radius: 13px;

  background: #f2dfce;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 3px;

}


.library-icon span,
.discover-icon span {

  display: block;

  width: 4px;

  height: 20px;

  border-radius: 4px;

  background: #a95725;

}


.library-icon span:nth-child(2),
.discover-icon span:nth-child(2) {

  height: 27px;

  background: #c87535;

}


.library-icon span:nth-child(3),
.discover-icon span:nth-child(3) {

  height: 17px;

  background: #d99a68;

}


.status-badge {

  padding: 6px 10px;

  border-radius: 20px;

  background: #f5eadf;

  color: #a95725;

  font-size: 10px;

  font-weight: 700;

  letter-spacing: 0.6px;

}


.card-content {

  margin-bottom: 20px;

}


.card-content h3,
.discover-info h3 {

  margin: 0 0 8px;

  color: #4b3021;

  font-size: 19px;

  font-weight: 650;

}


.card-content p,
.discover-info p {

  margin: 0;

  color: #8e7869;

  font-size: 13px;

  line-height: 1.6;

}


/* =========================
   LIBRARY ACTIONS
========================= */

.library-actions {

  display: flex;

  flex-direction: column;

  gap: 9px;

}


.primary-button {

  display: flex;

  align-items: center;

  justify-content: space-between;

  text-decoration: none;

  background: #a95725;

  color: #ffffff;

  border-radius: 11px;

  padding: 12px 15px;

  font-size: 13px;

  font-weight: 600;

  transition: 0.2s ease;

}


.primary-button:hover {

  background: #8e451e;

  transform: translateY(-1px);

}


.button-arrow {

  font-size: 17px;

}


.leave-button {

  width: 100%;

  border: 1px solid #dfc4ad;

  background: #fff7f1;

  color: #a84d3d;

  border-radius: 11px;

  padding: 10px 15px;

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

}


.leave-button:hover:not(:disabled) {

  background: #fbe9e4;

  border-color: #c98b7c;

  color: #943f31;

}


.leave-button:disabled {

  opacity: 0.55;

  cursor: not-allowed;

}


.leave-message {

  margin: 9px 0 0;

  font-size: 11px;

  line-height: 1.4;

}


.leave-message.success {

  color: #5c8b58;

}


.leave-message.error {

  color: #c45c4d;

}


/* =========================
   DIVIDER
========================= */

.section-divider {

  width: 100%;

  height: 1px;

  background: #dcc7b3;

  margin: 48px 0;

}


/* =========================
   DISCOVER
========================= */

.discover-list {

  display: flex;

  flex-direction: column;

  gap: 12px;

}


.discover-card {

  display: flex;

  align-items: center;

  gap: 18px;

  background:
    rgba(255, 250, 244, 0.98);

  border: 1px solid #e0c8b2;

  border-radius: 16px;

  padding: 18px 20px;

  box-shadow:
    0 6px 20px
    rgba(92, 57, 34, 0.06);

  transition: 0.2s ease;

}


.discover-card:hover {

  border-color: #cfa47e;

  box-shadow:
    0 10px 25px
    rgba(174, 91, 38, 0.10);

}


.discover-icon {

  width: 44px;

  height: 44px;

  flex-shrink: 0;

}


.discover-icon span {

  height: 17px;

}


.discover-icon span:nth-child(2) {

  height: 23px;

}


.discover-info {

  flex: 1;

  min-width: 0;

}


.discover-info h3 {

  font-size: 16px;

  margin-bottom: 4px;

}


.discover-info p {

  font-size: 12px;

}


.discover-action {

  position: relative;

  display: flex;

  align-items: center;

  gap: 14px;

  flex-shrink: 0;

}


.open-label {

  color: #8e7869;

  font-size: 10px;

  font-weight: 600;

  letter-spacing: 0.5px;

}


.join-button {

  border: 1px solid #d6b291;

  background: #fbf1e7;

  color: #a95725;

  border-radius: 9px;

  padding: 9px 17px;

  font-size: 12px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

}


.join-button:hover:not(:disabled) {

  background: #a95725;

  color: #ffffff;

  border-color: #a95725;

}


.join-button:disabled {

  opacity: 0.6;

  cursor: not-allowed;

}


.join-message {

  position: absolute;

  right: 0;

  top: calc(100% + 7px);

  width: 230px;

  margin: 0;

  font-size: 11px;

  line-height: 1.4;

  text-align: right;

}


.join-message.success {

  color: #5c8b58;

}


.join-message.error {

  color: #c45c4d;

}


/* =========================
   EMPTY
========================= */

.empty-card {

  background:
    rgba(255, 250, 244, 0.98);

  border: 1px dashed #d4b99e;

  border-radius: 18px;

  padding: 42px 30px;

  text-align: center;

}


.empty-icon {

  width: 44px;

  height: 44px;

  margin: 0 auto 15px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #f2dfce;

  color: #a95725;

  font-size: 21px;

}


.empty-card h3 {

  margin: 0 0 8px;

  color: #4b3021;

  font-size: 17px;

}


.empty-card p {

  max-width: 500px;

  margin: 0 auto;

  color: #8e7869;

  font-size: 13px;

  line-height: 1.7;

}


/* =========================
   LOADING / ERROR
========================= */

.state-card {

  background:
    rgba(255, 250, 244, 0.98);

  border: 1px solid #e0c8b2;

  border-radius: 18px;

  padding: 45px;

  text-align: center;

  color: #8e7869;

}


.loader {

  width: 30px;

  height: 30px;

  margin: 0 auto 15px;

  border: 3px solid #ead8c6;

  border-top-color: #a95725;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;

}


.state-card p {

  margin: 0;

  font-size: 14px;

}


.error-state {

  color: #c45c4d;

}


.state-icon {

  width: 38px;

  height: 38px;

  margin: 0 auto 12px;

  border-radius: 50%;

  background: #fbeceb;

  display: flex;

  align-items: center;

  justify-content: center;

  font-weight: 700;

}


/* =========================
   MODAL
========================= */

.modal-overlay {

  position: fixed;

  inset: 0;

  z-index: 1000;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background: rgba(55, 35, 23, 0.48);

  backdrop-filter: blur(4px);

}


.leave-modal {

  width: min(450px, 100%);

  background: #fffaf4;

  border: 1px solid #dfc8b2;

  border-radius: 20px;

  padding: 32px;

  text-align: center;

  box-shadow:
    0 25px 70px
    rgba(60, 37, 22, 0.25);

  animation: modalAppear 0.2s ease;

}


.modal-icon {

  width: 50px;

  height: 50px;

  margin: 0 auto 17px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #fbe9e4;

  color: #a84d3d;

  font-size: 21px;

  font-weight: 700;

}


.leave-modal h2 {

  margin: 0 0 12px;

  color: #4b3021;

  font-size: 22px;

}


.leave-modal > p {

  margin: 0 auto;

  color: #765b48;

  font-size: 14px;

  line-height: 1.7;

}


.leave-modal > p strong {

  color: #4b3021;

}


.modal-warning {

  margin-top: 12px !important;

  padding: 11px 13px;

  border-radius: 9px;

  background: #f8eee5;

  color: #8e6d58 !important;

  font-size: 12px !important;

}


.modal-actions {

  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 10px;

  margin-top: 24px;

}


.cancel-button,
.confirm-leave-button {

  border-radius: 10px;

  padding: 11px 15px;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;

}


.cancel-button {

  border: 1px solid #d6bda7;

  background: #fffaf4;

  color: #6f594b;

}


.cancel-button:hover:not(:disabled) {

  background: #f4e9df;

}


.confirm-leave-button {

  border: 1px solid #a84d3d;

  background: #a84d3d;

  color: #ffffff;

}


.confirm-leave-button:hover:not(:disabled) {

  background: #913e31;

  border-color: #913e31;

}


.cancel-button:disabled,
.confirm-leave-button:disabled {

  opacity: 0.55;

  cursor: not-allowed;

}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 768px) {

  .libraries-page {

    padding: 25px 16px 50px;

    background-attachment: scroll;

  }


  .header-content {

    padding: 28px 24px;

  }


  .stats-grid {

    grid-template-columns: 1fr;

  }


  .library-grid {

    grid-template-columns: 1fr;

  }


  .section-header {

    align-items: flex-start;

    flex-direction: column;

    gap: 8px;

  }


  .discover-card {

    align-items: flex-start;

    flex-wrap: wrap;

  }


  .discover-info {

    width: calc(100% - 65px);

  }


  .discover-action {

    width: 100%;

    justify-content: flex-end;

    margin-top: 5px;

  }

}


@media (max-width: 480px) {

  .header-content h1 {

    font-size: 30px;

  }


  .discover-action {

    flex-wrap: wrap;

  }


  .open-label {

    display: none;

  }


  .join-message {

    position: static;

    width: 100%;

    text-align: right;

  }


  .leave-modal {

    padding: 26px 20px;

  }


  .modal-actions {

    grid-template-columns: 1fr;

  }


  .cancel-button {

    order: 2;

  }


  .confirm-leave-button {

    order: 1;

  }

}


/* =========================
   ANIMATION
========================= */

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

</style>