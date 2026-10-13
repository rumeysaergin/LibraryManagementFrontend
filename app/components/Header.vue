<template>
  <header class="site-header">
    <div class="header-container">

      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">Library Management</span>
      </NuxtLink>

      <!-- Sağ Menü -->
      <nav class="nav-menu">

        <!-- Ana Sayfa -->
        <NuxtLink
          to="/"
          class="home-link"
        >
          Ana Sayfa
        </NuxtLink>

        <!-- =====================================================
             GİRİŞ YAPILMAMIŞSA
        ====================================================== -->
        <NuxtLink
          v-if="!isLoggedIn"
          to="/login"
          class="login-button"
        >
          Giriş Yap
        </NuxtLink>


        <!-- =====================================================
             GİRİŞ YAPILMIŞSA
        ====================================================== -->
        <div
          v-else
          class="profile-wrapper"
        >

          <!-- Profil Butonu -->
          <button
            type="button"
            class="profile-button"
            @click="toggleProfileMenu"
          >
            <span class="profile-icon">👤</span>
            <span>Profil</span>
            <span
              class="arrow"
              :class="{ 'arrow-up': profileMenuOpen }"
            >
              ⌄
            </span>
          </button>


          <!-- Profil Menüsü -->
          <div
            v-if="profileMenuOpen"
            class="profile-menu"
          >

            <!-- Profil Bilgilerim -->
            <NuxtLink
              to="/user/profile"
              class="profile-menu-item"
              @click="closeProfileMenu"
            >
              <span>👤</span>
              <span>Profil Bilgilerim</span>
            </NuxtLink>


            <!-- Çıkış Yap -->
            <button
              type="button"
              class="profile-menu-item logout-item"
              @click="logout"
            >
              <span>🚪</span>
              <span>Çıkış Yap</span>
            </button>

          </div>

        </div>

      </nav>

    </div>
  </header>
</template>


<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch
} from 'vue'

import { useRoute } from 'vue-router'


/* =========================================================
   ROUTE
========================================================= */

const route = useRoute()


/* =========================================================
   AUTH DURUMU
========================================================= */

const isLoggedIn = ref(false)


/* =========================================================
   PROFİL MENÜSÜ
========================================================= */

const profileMenuOpen = ref(false)


/* =========================================================
   GİRİŞ DURUMUNU KONTROL ET
========================================================= */

const checkAuth = () => {
  if (typeof window === 'undefined') {
    return
  }

  const token = localStorage.getItem('token')

  /*
   * Token varsa giriş yapılmış,
   * token yoksa giriş yapılmamış kabul ediyoruz.
   */
  isLoggedIn.value = !!token

  /*
   * Giriş durumu değiştiğinde profil menüsünü kapat.
   */
  if (!isLoggedIn.value) {
    profileMenuOpen.value = false
  }
}


/* =========================================================
   PROFİL MENÜSÜNÜ AÇ / KAPAT
========================================================= */

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}


/* =========================================================
   PROFİL MENÜSÜNÜ KAPAT
========================================================= */

const closeProfileMenu = () => {
  profileMenuOpen.value = false
}


/* =========================================================
   DIŞARI TIKLANINCA PROFİL MENÜSÜNÜ KAPAT
========================================================= */

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  if (!target.closest('.profile-wrapper')) {
    profileMenuOpen.value = false
  }
}


/* =========================================================
   AUTH DEĞİŞİKLİĞİ
========================================================= */

const handleAuthChange = () => {
  checkAuth()
}


/* =========================================================
   ÇIKIŞ YAP
========================================================= */

const logout = async () => {

  if (typeof window !== 'undefined') {

    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('email')

  }

  /*
   * Header'ı anında Giriş Yap durumuna getir.
   */
  isLoggedIn.value = false

  /*
   * Profil menüsünü kapat.
   */
  profileMenuOpen.value = false

  /*
   * Ana sayfaya dön.
   */
  await navigateTo('/')
}


/* =========================================================
   SAYFA İLK AÇILDIĞINDA
========================================================= */

onMounted(() => {

  /*
   * İlk açılışta token kontrolü.
   */
  checkAuth()

  /*
   * Başka sekmede localStorage değişirse kontrol et.
   */
  window.addEventListener(
    'storage',
    handleAuthChange
  )

  /*
   * Login sayfasından gönderilecek
   * özel auth event'i dinle.
   */
  window.addEventListener(
    'auth-changed',
    handleAuthChange
  )

  /*
   * Dışarı tıklamaları dinle.
   */
  document.addEventListener(
    'click',
    handleClickOutside
  )
})


/* =========================================================
   ROUTE DEĞİŞTİĞİNDE
========================================================= */

watch(
  () => route.fullPath,
  () => {

    /*
     * Örneğin:
     *
     * /login
     *   ↓
     * /user
     *
     * şeklinde geçiş yapıldığında
     * token durumunu tekrar kontrol ediyoruz.
     */
    checkAuth()

    profileMenuOpen.value = false
  }
)


/* =========================================================
   COMPONENT KAPANIRKEN EVENTLERİ TEMİZLE
========================================================= */

onBeforeUnmount(() => {

  window.removeEventListener(
    'storage',
    handleAuthChange
  )

  window.removeEventListener(
    'auth-changed',
    handleAuthChange
  )

  document.removeEventListener(
    'click',
    handleClickOutside
  )
})
</script>


<style scoped>

/* =========================================================
   HEADER
========================================================= */

.site-header {
  position: sticky;

  top: 0;

  z-index: 1000;

  width: 100%;

  background: rgba(255, 250, 244, 0.97);

  border-bottom: 1px solid #dfc8b2;

  box-shadow:
    0 3px 14px rgba(75, 48, 33, 0.08);

  backdrop-filter: blur(8px);
}


/* =========================================================
   HEADER CONTAINER
========================================================= */

.header-container {
  width: 100%;

  max-width: 1200px;

  margin: 0 auto;

  padding: 15px 24px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 30px;
}


/* =========================================================
   LOGO
========================================================= */

.logo {
  display: flex;

  align-items: center;

  gap: 10px;

  text-decoration: none;

  color: #4b3021;

  font-size: 20px;

  font-weight: 700;

  white-space: nowrap;

  transition: color 0.2s ease;
}

.logo:hover {
  color: #b96b35;
}


.logo-icon {
  width: 38px;

  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 10px;

  background: #ead7c3;

  font-size: 20px;
}


.logo-text {
  letter-spacing: -0.2px;
}


/* =========================================================
   NAVIGATION
========================================================= */

.nav-menu {
  display: flex;

  align-items: center;

  gap: 12px;
}


/* =========================================================
   ANA SAYFA
========================================================= */

.home-link {
  position: relative;

  padding: 9px 12px;

  color: #765b48;

  text-decoration: none;

  font-size: 15px;

  font-weight: 600;

  transition: color 0.2s ease;
}


.home-link::after {
  content: '';

  position: absolute;

  left: 12px;

  right: 12px;

  bottom: 3px;

  height: 2px;

  background: #b96b35;

  transform: scaleX(0);

  transform-origin: center;

  transition: transform 0.2s ease;
}


.home-link:hover {
  color: #b96b35;
}


.home-link:hover::after {
  transform: scaleX(1);
}


/* =========================================================
   GİRİŞ YAP
========================================================= */

.login-button {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding: 10px 20px;

  border-radius: 10px;

  background: #b96b35;

  color: #fffaf4;

  text-decoration: none;

  font-size: 14px;

  font-weight: 700;

  border: 1px solid #b96b35;

  box-shadow:
    0 3px 8px rgba(185, 107, 53, 0.18);

  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.login-button:hover {
  background: #a95e2c;

  transform: translateY(-1px);

  box-shadow:
    0 5px 12px rgba(169, 94, 44, 0.22);
}


/* =========================================================
   PROFİL WRAPPER
========================================================= */

.profile-wrapper {
  position: relative;

  display: flex;

  align-items: center;
}


/* =========================================================
   PROFİL BUTONU
========================================================= */

.profile-button {
  display: flex;

  align-items: center;

  gap: 7px;

  padding: 9px 14px;

  border-radius: 10px;

  background: #f4e7d8;

  color: #5c4030;

  border: 1px solid #d8bda3;

  font-family: inherit;

  font-size: 14px;

  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}


.profile-button:hover {
  background: #ead7c3;

  border-color: #c9a98b;

  color: #4b3021;
}


.profile-icon {
  font-size: 16px;
}


.arrow {
  margin-left: 2px;

  font-size: 15px;

  line-height: 1;

  transition: transform 0.2s ease;
}


.arrow-up {
  transform: rotate(180deg);
}


/* =========================================================
   PROFİL MENÜSÜ
========================================================= */

.profile-menu {
  position: absolute;

  top: calc(100% + 6px);

  right: 0;

  min-width: 205px;

  padding: 7px;

  background: #fffaf4;

  border: 1px solid #dfc8b2;

  border-radius: 12px;

  box-shadow:
    0 10px 25px rgba(75, 48, 33, 0.13);

  z-index: 2000;
}


/* =========================================================
   DROPDOWN ELEMANLARI
========================================================= */

.profile-menu-item {
  width: 100%;

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 10px 12px;

  border: none;

  border-radius: 8px;

  background: transparent;

  color: #5c4030;

  text-decoration: none;

  font-family: inherit;

  font-size: 14px;

  font-weight: 600;

  cursor: pointer;

  box-sizing: border-box;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}


.profile-menu-item:hover {
  background: #f4e7d8;

  color: #4b3021;
}


.profile-menu-item span:first-child {
  width: 22px;

  display: flex;

  justify-content: center;

  font-size: 16px;
}


/* =========================================================
   ÇIKIŞ
========================================================= */

.logout-item {
  margin-top: 4px;

  border-top: 1px solid #ead7c3;

  border-radius: 0 0 8px 8px;

  padding-top: 12px;

  color: #a84d3d;
}


.logout-item:hover {
  background: #f9e7e3;

  color: #963f32;
}


/* =========================================================
   MOBİL
========================================================= */

@media (max-width: 700px) {

  .header-container {
    padding: 12px 16px;

    gap: 15px;
  }


  .logo-text {
    font-size: 17px;
  }


  .logo-icon {
    width: 34px;

    height: 34px;

    font-size: 18px;
  }


  .nav-menu {
    gap: 6px;
  }


  .home-link {
    padding: 8px 7px;

    font-size: 14px;
  }


  .home-link::after {
    left: 7px;

    right: 7px;
  }


  .login-button {
    padding: 9px 13px;

    font-size: 13px;
  }


  .profile-button {
    padding: 8px 10px;

    font-size: 13px;
  }


  .profile-menu {
    min-width: 190px;
  }
}


@media (max-width: 480px) {

  .header-container {
    padding: 10px 12px;
  }


  .logo-text {
    display: none;
  }


  .logo-icon {
    width: 36px;

    height: 36px;
  }


  .home-link {
    font-size: 13px;
  }


  .login-button {
    padding: 8px 11px;
  }


  .profile-button {
    padding: 8px 10px;
  }


  .profile-button span:not(.profile-icon):not(.arrow) {
    display: none;
  }

}

</style>