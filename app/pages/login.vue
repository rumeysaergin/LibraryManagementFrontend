<template>
  <main class="login-page">

    <div class="login-card">

      <!-- Başlık -->
      <div class="login-header">

        <div class="icon">
          📚
        </div>

        <h1>
          Kullanıcı Girişi
        </h1>

        <p>
          Hesabınıza giriş yaparak kütüphane işlemlerinizi yönetin.
        </p>

      </div>


      <!-- Hata mesajı -->
      <div
        v-if="errorMessage"
        class="error-message"
      >
        ⚠️ {{ errorMessage }}
      </div>


      <!-- Login formu -->
      <form
        class="login-form"
        @submit.prevent="login"
      >

        <!-- Email -->
        <div class="form-group">

          <label for="email">
            E-posta
          </label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="E-posta adresinizi girin"
            autocomplete="email"
            required
          />

        </div>


        <!-- Şifre -->
        <div class="form-group">

          <label for="password">
            Şifre
          </label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Şifrenizi girin"
            autocomplete="current-password"
            required
          />

        </div>


        <!-- Giriş butonu -->
        <button
          type="submit"
          class="login-submit"
          :disabled="isLoading"
        >

          <span v-if="!isLoading">
            Giriş Yap
          </span>

          <span v-else>
            Giriş yapılıyor...
          </span>

        </button>

      </form>

    </div>

  </main>
</template>


<script setup lang="ts">

const email = ref('')

const password = ref('')

const isLoading = ref(false)

const errorMessage = ref('')


const login = async () => {

  // Önce eski hata mesajını temizle
  errorMessage.value = ''


  // Alan kontrolü
  if (!email.value || !password.value) {

    errorMessage.value =
      'Lütfen e-posta ve şifre alanlarını doldurun.'

    return

  }


  isLoading.value = true


  try {

    console.log('Login isteği gönderiliyor...')


    const response = await $fetch<{
      token: string
      userId: string
      email: string
    }>(
      'https://localhost:7205/api/Auth/login',
      {
        method: 'POST',

        body: {
          email: email.value,
          password: password.value
        }
      }
    )


    console.log('Login başarılı.')
    console.log('User ID:', response.userId)


    // JWT ve kullanıcı bilgilerini kaydet
    localStorage.setItem(
      'token',
      response.token
    )

    localStorage.setItem(
      'userId',
      response.userId
    )

    localStorage.setItem(
      'email',
      response.email
    )


    console.log('Token localStorage içine kaydedildi.')


    // Kullanıcı paneline yönlendir
    await navigateTo('/user')

  }
  catch (error: any) {

    console.error(
      'Login başarısız:',
      error
    )


    // Backend'den gelen hata
    if (
      error?.data?.message
    ) {

      errorMessage.value =
        error.data.message

    }
    else {

      errorMessage.value =
        'Giriş yapılırken bir hata oluştu. E-posta ve şifrenizi kontrol edin.'

    }

  }
  finally {

    isLoading.value = false

  }

}

</script>


<style scoped>

.login-page {
  min-height: 100vh;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 40px 20px;

  box-sizing: border-box;

  background:
    linear-gradient(
      rgba(245, 237, 228, 0.52),
      rgba(245, 237, 228, 0.52)
    ),
    url("https://images.openai.com/static-rsc-4/xmPoryFkHin-rERvYKXFtYqEp51cj5lktGQMde8rwf827nL6z_I1_s116c5p_YutXUa6rLGoNMGvD6qI60fgm80NaihvgqBPXCrZjNv9HKfA_yCiMIMVlH_Tpk0icUCuzYBZ7cGa7_InYzyQw6XEtfHCNhH-3h_U95yftfn5oGClbRZNklaO4kOnKP2GfZSg?purpose=fullsize");

  background-size: cover;

  background-position: center;

  background-attachment: fixed;

  color: #3f2b20;
}


/* =========================
   Card
========================= */

.login-card {
  width: 100%;

  max-width: 430px;

  box-sizing: border-box;

  padding: 36px;

  background: rgba(255, 250, 244, 0.96);

  border: 1px solid #dfc8b2;

  border-radius: 20px;

  box-shadow:
    0 12px 35px rgba(92, 57, 34, 0.13);

  backdrop-filter: blur(3px);
}


/* =========================
   Header
========================= */

.login-header {
  text-align: center;

  margin-bottom: 30px;
}

.icon {
  width: 60px;
  height: 60px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin: 0 auto 18px;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 14px;

  font-size: 28px;

  box-shadow:
    0 3px 10px rgba(92, 57, 34, 0.06);
}

.login-header h1 {
  display: inline-block;

  color: #4b3021;

  font-size: 27px;

  font-weight: 650;

  margin: 0 0 10px;

  padding: 5px 12px;

  background: rgba(255, 250, 244, 0.98);

  border-radius: 7px;

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.06);
}

.login-header p {
  color: #765b48;

  font-size: 13px;

  line-height: 1.6;

  margin: 0;
}


/* =========================
   Error
========================= */

.error-message {
  background: #f8e8e3;

  border: 1px solid #e5c3b9;

  color: #8a3f32;

  border-radius: 8px;

  padding: 11px 13px;

  font-size: 13px;

  line-height: 1.5;

  margin-bottom: 20px;
}


/* =========================
   Form
========================= */

.login-form {
  display: flex;

  flex-direction: column;

  gap: 20px;
}

.form-group {
  display: flex;

  flex-direction: column;

  gap: 7px;
}

.form-group label {
  color: #7c4b2c;

  font-size: 13px;

  font-weight: 600;
}

.form-group input {
  width: 100%;

  box-sizing: border-box;

  background: #fffdf9;

  border: 1px solid #dfc8b2;

  border-radius: 8px;

  padding: 12px 13px;

  font-size: 14px;

  color: #3f2b20;

  outline: none;

  transition: 0.2s;
}

.form-group input::placeholder {
  color: #ad9887;
}

.form-group input:focus {
  border-color: #b96b35;

  box-shadow:
    0 0 0 3px rgba(185, 107, 53, 0.13);
}


/* =========================
   Login Button
========================= */

.login-submit {
  width: 100%;

  border: none;

  border-radius: 9px;

  background: #b96b35;

  color: white;

  padding: 13px;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  margin-top: 5px;

  box-shadow:
    0 5px 14px rgba(139, 78, 37, 0.18);
}

.login-submit:hover:not(:disabled) {
  background: #a95e2c;

  transform: translateY(-1px);

  box-shadow:
    0 7px 17px rgba(139, 78, 37, 0.22);
}

.login-submit:disabled {
  opacity: 0.65;

  cursor: not-allowed;

  transform: none;
}


/* =========================
   Responsive
========================= */

@media (max-width: 500px) {

  .login-page {
    padding: 25px 16px;
  }

  .login-card {
    padding: 30px 22px;

    border-radius: 18px;
  }

  .login-header h1 {
    font-size: 24px;
  }

}

</style>