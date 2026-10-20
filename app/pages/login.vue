
<template>
  <main class="login-page">
    <div class="login-card">

      <div class="role-selector">
        <button
          type="button"
          class="role-tab"
          :class="{ active: selectedRole === 'user' }"
          @click="selectRole('user')"
        >
          👤 Kullanıcı Girişi
        </button>

        <button
          type="button"
          class="role-tab"
          :class="{ active: selectedRole === 'admin' }"
          @click="selectRole('admin')"
        >
          🔐 Yönetici Girişi
        </button>
      </div>

      <header class="login-header">
        <div class="icon">
          {{ selectedRole === 'admin' ? '🔐' : '📚' }}
        </div>

        <span class="header-badge">
          {{ selectedRole === 'admin' ? 'YÖNETİM SİSTEMİ' : 'KÜTÜPHANE PORTALI' }}
        </span>

        <h1>
          {{ selectedRole === 'admin' ? 'Yönetici Girişi' : 'Kullanıcı Girişi' }}
        </h1>

        <p>
          {{
            selectedRole === 'admin'
              ? 'Yönetim paneline erişmek için yönetici hesabınızla giriş yapın.'
              : 'Kütüphane ve ödünç alma işlemlerinizi yönetmek için giriş yapın.'
          }}
        </p>
      </header>

      <div v-if="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>

      <form class="login-form" @submit.prevent="login">
        <div class="form-group">
          <label for="email">E-posta adresi</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            placeholder="E-posta adresinizi girin"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Şifre</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Şifrenizi girin"
            autocomplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          class="login-submit"
          :class="{ 'admin-submit': selectedRole === 'admin' }"
          :disabled="isLoading"
        >
          {{
            isLoading
              ? 'Giriş yapılıyor...'
              : selectedRole === 'admin'
                ? 'Yönetici Olarak Giriş Yap'
                : 'Giriş Yap'
          }}
        </button>
      </form>

      <footer class="login-footer">
        <span>
          {{
            selectedRole === 'admin'
              ? 'Normal üye misiniz? '
              : 'Kütüphane yöneticisi misiniz? '
          }}
        </span>

        <button
          type="button"
          class="switch-btn"
          @click="selectRole(selectedRole === 'admin' ? 'user' : 'admin')"
        >
          {{
            selectedRole === 'admin'
              ? 'Kullanıcı girişine geçin'
              : 'Yönetici girişine geçin'
          }}
        </button>
      </footer>

    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { apiFetch } = useApi()

type LoginRole = 'user' | 'admin'

interface LoginResponse {
  token: string
  userId: string
  email: string
  role?: string
}

const selectedRole = ref<LoginRole>('user')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const isAdminLogin = computed(() => selectedRole.value === 'admin')

function selectRole(role: LoginRole) {
  selectedRole.value = role
  errorMessage.value = ''

  // Adres çubuğundaki rol parametresini de güncelle.
  navigateTo(
    {
      path: '/login',
      query: { role }
    },
    {
      replace: true
    }
  )
}

onMounted(() => {
  selectedRole.value = route.query.role === 'admin' ? 'admin' : 'user'
})

async function login() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Lütfen e-posta ve şifre alanlarını doldurun.'
    return
  }

  isLoading.value = true

  try {
    const response = await apiFetch<LoginResponse>('/api/Auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (!response?.token || !response?.userId) {
      throw new Error('API yanıtında token veya kullanıcı bilgisi bulunamadı.')
    }

    let actualRole = response.role

    // API giriş yanıtında rol yoksa kullanıcı detayından öğren.
    if (!actualRole) {
      const userDetail = await apiFetch<{ id: string; role?: string }>(
        `/api/User/${response.userId}`
      )

      actualRole = userDetail.role
    }

    const normalizedRole = actualRole?.trim().toLowerCase()

    // Yönetici girişi seçilmişse gerçek rol Admin olmalı.
    if (isAdminLogin.value && normalizedRole !== 'admin') {
      errorMessage.value =
        'Bu hesabın yönetici yetkisi bulunmuyor. Lütfen kullanıcı girişini seçin.'
      return
    }

    // Yönetici olmayan bir hesabın kullanıcı rolüyle oturum açmasını sağla.
    if (!isAdminLogin.value && normalizedRole === 'admin') {
      errorMessage.value =
        'Bu hesap yönetici hesabıdır. Lütfen yönetici girişini seçin.'
      return
    }

    // Rol doğrulandıktan sonra oturum bilgilerini kaydet.
    localStorage.setItem('token', response.token)
    localStorage.setItem('userId', response.userId)
    localStorage.setItem('email', response.email)
    localStorage.setItem(
      'role',
      normalizedRole === 'admin' ? 'Admin' : 'User'
    )

    window.dispatchEvent(new Event('auth-changed'))

    await navigateTo(normalizedRole === 'admin' ? '/admin' : '/user')
  } catch (error: any) {
    console.error('Giriş hatası:', error)

    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Giriş yapılamadı. E-posta ve şifrenizi kontrol edin.'
  } finally {
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
    radial-gradient(
      ellipse at top left,
      rgba(226, 192, 158, 0.28),
      transparent 55%
    ),
    linear-gradient(145deg, #f6f0e7 0%, #eee4d6 50%, #f8f2eb 100%);
  color: #493122;
}

.login-card {
  width: 100%;
  max-width: 450px;
  box-sizing: border-box;
  padding: 32px 34px;
  background: #fffdf9;
  border: 1px solid #e6d8c9;
  border-radius: 20px;
  box-shadow: 0 10px 32px rgba(86, 57, 35, 0.08);
}

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 5px;
  background: #f4e8dc;
  border: 1px solid #e7d5c3;
  border-radius: 14px;
  margin-bottom: 26px;
}

.role-tab {
  padding: 10px 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #785b46;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-tab:hover:not(.active) {
  color: #493122;
  background: rgba(255, 253, 249, 0.5);
}

.role-tab.active {
  background: #fffdf9;
  color: #b96b35;
  box-shadow: 0 3px 10px rgba(90, 59, 36, 0.09);
}

.login-header {
  text-align: center;
  margin-bottom: 26px;
}

.icon {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  background: #efe0d0;
  border: 1px solid #e2c9b1;
  border-radius: 16px;
  font-size: 30px;
}

.header-badge {
  display: inline-block;
  color: #a06a3e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  margin-bottom: 6px;
}

.login-header h1 {
  color: #493122;
  font-size: 26px;
  font-weight: 750;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.login-header p {
  color: #816b58;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.error-message {
  background: #fff3f0;
  border: 1px solid #f2c7bd;
  color: #a84d3d;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 600;
  margin-bottom: 20px;
}

.login-form {
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
  color: #7c4b2c;
  font-size: 13px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  background: #fffdf9;
  border: 1px solid #e5d7c8;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  color: #493122;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input::placeholder {
  color: #a08d7d;
}

.form-group input:focus {
  border-color: #a4876d;
  box-shadow: 0 0 0 3px rgb(120 88 63 / 10%);
}

.login-submit {
  width: 100%;
  border: 1px solid #b96b35;
  border-radius: 10px;
  background: #b96b35;
  color: #fffaf4;
  padding: 13px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  margin-top: 6px;
  box-shadow: 0 4px 12px rgba(185, 107, 53, 0.2);
}

.login-submit:hover:not(:disabled) {
  background: #a95e2c;
  transform: translateY(-1px);
}

.login-submit.admin-submit {
  background: #493122;
  border-color: #493122;
  box-shadow: 0 4px 12px rgba(73, 49, 34, 0.25);
}

.login-submit.admin-submit:hover:not(:disabled) {
  background: #3a2215;
}

.login-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #f2e7db;
  font-size: 13px;
  color: #816b58;
}

.switch-btn {
  background: none;
  border: none;
  color: #b96b35;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.switch-btn:hover {
  color: #8a481c;
}

@media (max-width: 480px) {
  .login-card {
    padding: 26px 20px;
    border-radius: 16px;
  }

  .role-tab {
    font-size: 12px;
    padding: 8px 6px;
  }
}
</style>
