<template>
  <main class="home">

    <section class="hero">

      <div class="hero-card">

        <p class="subtitle">
          LIBRARY MANAGEMENT SYSTEM
        </p>

        <h1>
          Kütüphanenizi
          <span>kolayca yönetin.</span>
        </h1>

        <p class="description">
          Kitaplarınızı keşfedin, ödünç işlemlerinizi takip edin
          ve kütüphane üyeliğinizi kolayca yönetin.
        </p>

        <NuxtLink
          to="/user-login"
          class="hero-button"
        >
          Sisteme Giriş Yap
        </NuxtLink>

      </div>

    </section>

  </main>
</template>

<style scoped>
.home {
  min-height: 100vh;

  background:
    linear-gradient(
      rgba(245, 237, 228, 0.48),
      rgba(245, 237, 228, 0.48)
    ),
    url("https://images.openai.com/static-rsc-4/xmPoryFkHin-rERvYKXFtYqEp51cj5lktGQMde8rwf827nL6z_I1_s116c5p_YutXUa6rLGoNMGvD6qI60fgm80NaihvgqBPXCrZjNv9HKfA_yCiMIMVlH_Tpk0icUCuzYBZ7cGa7_InYzyQw6XEtfHCNhH-3h_U95yftfn5oGClbRZNklaO4kOnKP2GfZSg?purpose=fullsize");

  background-size: cover;
  background-position: center;
  background-attachment: fixed;

  color: #3f2b20;
}

.hero {
  min-height: calc(100vh - 75px);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 40px 24px;

  box-sizing: border-box;
}

/* Ortadaki ana kart */

.hero-card {
  width: 100%;
  max-width: 760px;

  box-sizing: border-box;

  padding: 48px 55px;

  text-align: center;

  background: rgba(255, 250, 244, 0.94);

  border: 1px solid #dfc8b2;
  border-radius: 22px;

  box-shadow:
    0 12px 35px rgba(92, 57, 34, 0.13);

  backdrop-filter: blur(3px);
}

/* Üst başlık */

.subtitle {
  display: inline-block;

  margin: 0 0 18px;

  padding: 6px 12px;

  color: #7c4b2c;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;
  border-radius: 6px;

  font-size: 12px;
  font-weight: 700;

  letter-spacing: 1px;
}

/* Ana başlık */

h1 {
  margin: 0;

  color: #4b3021;

  font-size: 48px;
  line-height: 1.18;
  font-weight: 650;
}

h1 span {
  display: block;

  margin-top: 4px;

  color: #b96b35;
}

/* Açıklama */

.description {
  max-width: 600px;

  margin: 24px auto 32px;

  color: #765b48;

  font-size: 17px;
  line-height: 1.7;
  font-weight: 500;
}

/* Giriş butonu */

.hero-button {
  display: inline-block;

  padding: 13px 27px;

  color: #ffffff;

  background: #b96b35;

  border: none;
  border-radius: 9px;

  text-decoration: none;

  font-size: 15px;
  font-weight: 600;

  box-shadow:
    0 5px 14px rgba(139, 78, 37, 0.18);

  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-button:hover {
  background: #a95e2c;

  transform: translateY(-2px);

  box-shadow:
    0 7px 17px rgba(139, 78, 37, 0.22);
}

/* Tablet */

@media (max-width: 768px) {
  .hero {
    padding: 30px 20px;
  }

  .hero-card {
    max-width: 680px;
    padding: 40px 35px;
  }

  h1 {
    font-size: 42px;
  }

  .description {
    font-size: 16px;
  }
}

/* Mobil */

@media (max-width: 480px) {
  .hero {
    padding: 24px 16px;
  }

  .hero-card {
    padding: 32px 22px;
    border-radius: 18px;
  }

  .subtitle {
    font-size: 10px;
    letter-spacing: 0.7px;
  }

  h1 {
    font-size: 34px;
  }

  .description {
    font-size: 15px;
    line-height: 1.6;
    margin: 20px auto 27px;
  }

  .hero-button {
    padding: 12px 23px;
  }
}
</style>