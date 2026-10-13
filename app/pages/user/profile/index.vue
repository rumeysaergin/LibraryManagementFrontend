<template>
  <div class="profile-page">

    <div class="profile-container">

      <!-- Geri Dön -->
      <NuxtLink
        to="/user"
        class="back-link"
      >
        ← Kullanıcı Paneline Dön
      </NuxtLink>


      <!-- Sayfa Başlığı -->
      <div class="page-header">

        <div class="header-icon">
          👤
        </div>

        <div>
          <h1>Profil Düzenle</h1>

          <p>
            Kişisel bilgilerinizi buradan güncelleyebilirsiniz.
          </p>
        </div>

      </div>


      <!-- Yükleniyor -->
      <div
        v-if="loading"
        class="message"
      >
        <div class="message-icon">
          👤
        </div>

        <h2>Profil bilgileri yükleniyor...</h2>

        <p>
          Bilgileriniz hazırlanıyor, lütfen bekleyin.
        </p>
      </div>


      <!-- Genel Hata -->
      <div
        v-else-if="errorMessage"
        class="error-message main-error"
      >
        <span class="message-icon">
          ⚠️
        </span>

        <div>
          <strong>Profil bilgileri alınamadı.</strong>

          <p>
            {{ errorMessage }}
          </p>
        </div>
      </div>


      <!-- Profil Formu -->
      <form
        v-else
        class="profile-form"
        @submit.prevent="updateProfile"
      >

        <!-- Form Başlığı -->
        <div class="form-header">

          <div class="form-header-icon">
            ✏️
          </div>

          <div>
            <h2>Kişisel Bilgiler</h2>

            <p>
              Hesabınıza ait bilgileri güncelleyebilirsiniz.
            </p>
          </div>

        </div>


        <!-- Ad -->
        <div class="form-group">

          <label for="firstName">
            Ad
          </label>

          <div class="input-wrapper">

            <span class="input-icon">
              👤
            </span>

            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              placeholder="Adınızı girin"
              required
            />

          </div>

        </div>


        <!-- Soyad -->
        <div class="form-group">

          <label for="lastName">
            Soyad
          </label>

          <div class="input-wrapper">

            <span class="input-icon">
              👤
            </span>

            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              placeholder="Soyadınızı girin"
              required
            />

          </div>

        </div>


        <!-- E-posta -->
        <div class="form-group">

          <label for="email">
            E-posta
          </label>

          <div class="input-wrapper">

            <span class="input-icon">
              ✉️
            </span>

            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="E-posta adresinizi girin"
              required
            />

          </div>

        </div>


        <!-- Bilgilendirme -->
        <div class="info-box">

          <span class="info-box-icon">
            💡
          </span>

          <p>
            E-posta adresinizi değiştirmeniz durumunda hesabınıza
            giriş yaparken yeni e-posta adresinizi kullanmanız gerekir.
          </p>

        </div>


        <!-- Kaydet -->
        <button
          type="submit"
          class="save-button"
          :disabled="saving"
        >

          <span v-if="!saving">
            ✓
          </span>

          <span v-else class="loading-dot">
            ⏳
          </span>

          {{
            saving
              ? 'Kaydediliyor...'
              : 'Değişiklikleri Kaydet'
          }}

        </button>


        <!-- Başarılı -->
        <div
          v-if="successMessage"
          class="success-message"
        >

          <span class="result-icon">
            ✓
          </span>

          <div>
            <strong>
              İşlem başarılı
            </strong>

            <p>
              {{ successMessage }}
            </p>
          </div>

        </div>


        <!-- Güncelleme Hatası -->
        <div
          v-if="updateError"
          class="error-message"
        >

          <span class="result-icon">
            ⚠️
          </span>

          <div>
            <strong>
              Güncelleme başarısız
            </strong>

            <p>
              {{ updateError }}
            </p>
          </div>

        </div>

      </form>

    </div>

  </div>
</template>


<script setup lang="ts">

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

const { apiFetch } = useApi()

const loading = ref(true)
const saving = ref(false)

const errorMessage = ref('')
const successMessage = ref('')
const updateError = ref('')

const form = ref({
  firstName: '',
  lastName: '',
  email: ''
})


const loadProfile = async () => {

  try {

    const userId = localStorage.getItem('userId')

    if (!userId) {
      throw new Error('Kullanıcı bilgisi bulunamadı.')
    }

    const user =
      await apiFetch<User>(
        `/api/User/${userId}`
      )

    form.value.firstName = user.firstName
    form.value.lastName = user.lastName
    form.value.email = user.email

  } catch (error) {

    console.error(
      'Profil bilgileri alınırken hata oluştu:',
      error
    )

    errorMessage.value =
      'Profil bilgileri alınamadı.'

  } finally {

    loading.value = false

  }

}


const updateProfile = async () => {

  saving.value = true

  successMessage.value = ''
  updateError.value = ''

  try {

    const userId = localStorage.getItem('userId')

    if (!userId) {
      throw new Error('Kullanıcı bilgisi bulunamadı.')
    }

    await apiFetch(
      `/api/User/${userId}`,
      {
        method: 'PUT',
        body: {
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          email: form.value.email
        }
      }
    )

    localStorage.setItem(
      'email',
      form.value.email
    )

    successMessage.value =
      'Profil bilgileriniz başarıyla güncellendi.'

  } catch (error) {

    console.error(
      'Profil güncellenirken hata oluştu:',
      error
    )

    updateError.value =
      'Profil güncellenirken bir hata oluştu.'

  } finally {

    saving.value = false

  }

}


onMounted(() => {
  loadProfile()
})

</script>


<style scoped>

/* =========================================================
   ANA SAYFA
========================================================= */

.profile-page {
  min-height: calc(100vh - 75px);

  padding: 40px 20px 70px;

  background:
    linear-gradient(
      rgba(245, 237, 228, 0.95),
      rgba(245, 237, 228, 0.98)
    );

  color: #4b3021;
}


.profile-container {
  max-width: 700px;

  margin: 0 auto;
}


/* =========================================================
   GERİ DÖN
========================================================= */

.back-link {
  display: inline-flex;

  align-items: center;

  margin-bottom: 25px;

  color: #765b48;

  text-decoration: none;

  font-size: 15px;

  font-weight: 600;

  transition: 0.2s ease;
}


.back-link:hover {
  color: #b96b35;

  transform: translateX(-3px);
}


/* =========================================================
   SAYFA BAŞLIĞI
========================================================= */

.page-header {
  display: flex;

  align-items: center;

  gap: 15px;

  margin-bottom: 25px;
}


.header-icon {
  width: 55px;

  height: 55px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #ead7c3;

  border: 1px solid #d9bea1;

  border-radius: 14px;

  font-size: 27px;
}


.page-header h1 {
  margin: 0 0 5px;

  color: #4b3021;

  font-size: 30px;

  line-height: 1.2;
}


.page-header p {
  margin: 0;

  color: #765b48;

  font-size: 14px;
}


/* =========================================================
   FORM
========================================================= */

.profile-form {
  padding: 32px;

  background: #fffaf4;

  border: 1px solid #dfc8b2;

  border-radius: 18px;

  box-shadow:
    0 8px 25px rgba(91, 58, 38, 0.10);
}


/* =========================================================
   FORM BAŞLIĞI
========================================================= */

.form-header {
  display: flex;

  align-items: center;

  gap: 13px;

  margin-bottom: 28px;

  padding-bottom: 22px;

  border-bottom: 1px solid #dfc8b2;
}


.form-header-icon {
  width: 43px;

  height: 43px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #ead7c3;

  border-radius: 11px;

  font-size: 20px;
}


.form-header h2 {
  margin: 0 0 3px;

  color: #4b3021;

  font-size: 19px;
}


.form-header p {
  margin: 0;

  color: #8a6b55;

  font-size: 13px;
}


/* =========================================================
   FORM ALANLARI
========================================================= */

.form-group {
  margin-bottom: 20px;
}


.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #5d4030;

  font-size: 14px;

  font-weight: 700;
}


.input-wrapper {
  position: relative;

  display: flex;

  align-items: center;
}


.input-icon {
  position: absolute;

  left: 13px;

  z-index: 1;

  font-size: 16px;
}


.form-group input {
  width: 100%;

  box-sizing: border-box;

  padding: 13px 14px 13px 43px;

  background: #fffdf9;

  border: 1px solid #d9c2aa;

  border-radius: 10px;

  color: #4b3021;

  font-family: inherit;

  font-size: 15px;

  outline: none;

  transition: 0.2s ease;
}


.form-group input::placeholder {
  color: #a38a76;
}


.form-group input:hover {
  border-color: #c9a989;
}


.form-group input:focus {
  background: #fffaf4;

  border-color: #b96b35;

  box-shadow:
    0 0 0 3px rgba(185, 107, 53, 0.10);
}


/* =========================================================
   BİLGİ KUTUSU
========================================================= */

.info-box {
  display: flex;

  align-items: flex-start;

  gap: 10px;

  margin: 25px 0;

  padding: 13px 15px;

  background: #f8eee4;

  border: 1px solid #dfc8b2;

  border-radius: 10px;
}


.info-box-icon {
  flex-shrink: 0;

  font-size: 17px;
}


.info-box p {
  margin: 0;

  color: #765b48;

  font-size: 12px;

  line-height: 1.6;
}


/* =========================================================
   KAYDET BUTONU
========================================================= */

.save-button {
  width: 100%;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  padding: 13px 20px;

  border: none;

  border-radius: 10px;

  background: #b96b35;

  color: white;

  font-family: inherit;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;

  box-shadow:
    0 5px 12px rgba(185, 107, 53, 0.18);
}


.save-button:hover:not(:disabled) {
  background: #a95e2c;

  transform: translateY(-2px);

  box-shadow:
    0 7px 16px rgba(169, 94, 44, 0.22);
}


.save-button:active:not(:disabled) {
  transform: translateY(0);
}


.save-button:disabled {
  background: #caa88d;

  cursor: not-allowed;

  box-shadow: none;
}


/* =========================================================
   YÜKLENİYOR
========================================================= */

.message {
  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  min-height: 250px;

  padding: 30px;

  background: #fffaf4;

  border: 1px solid #dfc8b2;

  border-radius: 18px;

  box-shadow:
    0 6px 20px rgba(91, 58, 38, 0.08);

  text-align: center;
}


.message-icon {
  margin-bottom: 10px;

  font-size: 36px;
}


.message h2 {
  margin: 0 0 7px;

  color: #4b3021;

  font-size: 19px;
}


.message p {
  margin: 0;

  color: #765b48;

  font-size: 14px;
}


/* =========================================================
   BAŞARILI MESAJ
========================================================= */

.success-message {
  display: flex;

  align-items: flex-start;

  gap: 12px;

  margin-top: 20px;

  padding: 14px 15px;

  background: #edf4ea;

  border: 1px solid #cbdcc5;

  border-radius: 10px;

  color: #4f7a45;
}


.result-icon {
  flex-shrink: 0;

  font-size: 19px;

  font-weight: 700;
}


.success-message strong {
  display: block;

  margin-bottom: 3px;

  font-size: 13px;
}


.success-message p {
  margin: 0;

  font-size: 12px;

  line-height: 1.5;
}


/* =========================================================
   HATA MESAJI
========================================================= */

.error-message {
  display: flex;

  align-items: flex-start;

  gap: 12px;

  padding: 14px 15px;

  background: #f9e9e6;

  border: 1px solid #e3c2bc;

  border-radius: 10px;

  color: #8a4035;
}


.error-message strong {
  display: block;

  margin-bottom: 3px;

  font-size: 13px;
}


.error-message p {
  margin: 0;

  font-size: 12px;

  line-height: 1.5;
}


.main-error {
  box-shadow:
    0 6px 20px rgba(91, 58, 38, 0.06);
}


/* =========================================================
   MOBİL
========================================================= */

@media (max-width: 600px) {

  .profile-page {
    padding: 30px 15px 50px;
  }


  .page-header {
    align-items: flex-start;
  }


  .header-icon {
    width: 48px;

    height: 48px;

    font-size: 23px;
  }


  .page-header h1 {
    font-size: 25px;
  }


  .page-header p {
    font-size: 13px;

    line-height: 1.5;
  }


  .profile-form {
    padding: 22px;
  }


  .form-header {
    align-items: flex-start;
  }


  .form-header h2 {
    font-size: 17px;
  }


  .form-header p {
    line-height: 1.5;
  }


  .form-group input {
    padding-top: 12px;

    padding-bottom: 12px;
  }

}

</style>