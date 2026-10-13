<template>
  <div class="book-detail-page">
    <div class="container">

      <!-- Geri Dön -->
      <NuxtLink
        to="/user/books"
        class="back-link"
      >
        ← Kitaplara Dön
      </NuxtLink>

      <!-- Kitap Üst Bilgi -->
      <section class="book-hero">

        <!-- Kitap Görseli -->
        <div class="book-cover">
          <span class="book-icon">📕</span>
        </div>

        <!-- Kitap Bilgileri -->
        <div class="book-info">

          <div class="category">
            ROMAN
          </div>

          <h1>Suç ve Ceza</h1>

          <p class="author">
            Fyodor Dostoyevski
          </p>

          <div class="book-meta">
            <div class="meta-item">
              <span class="meta-label">ISBN</span>
              <span class="meta-value">
                978-975-07-1234-5
              </span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Toplam Stok</span>
              <span class="meta-value">
                8 adet
              </span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Durum</span>
              <span class="status available">
                Mevcut
              </span>
            </div>
          </div>

          <!-- Ödünç Al -->
          <button class="borrow-btn">
            📖 Ödünç Al
          </button>

        </div>
      </section>

      <!-- Açıklama -->
      <section class="content-card">

        <div class="section-title">
          <span class="title-icon">📚</span>

          <div>
            <h2>Kitap Hakkında</h2>
            <p>Kitap hakkında detaylı bilgiler</p>
          </div>
        </div>

        <p class="description">
          Suç ve Ceza, Fyodor Dostoyevski'nin en önemli eserlerinden biridir.
          Roman, yoksul bir eski öğrenci olan Rodion Raskolnikov'un işlediği
          cinayet sonrasında yaşadığı psikolojik ve ahlaki çatışmaları konu alır.
          İnsan psikolojisi, suç, vicdan, adalet ve kefaret gibi önemli temaları
          ele alan eser, dünya edebiyatının başyapıtlarından biri olarak kabul edilir.
        </p>

      </section>

      <!-- Kütüphaneler -->
      <section class="content-card">

        <div class="section-title">
          <span class="title-icon">🏛️</span>

          <div>
            <h2>Bulunduğu Kütüphaneler</h2>
            <p>Bu kitabın bulunduğu kütüphaneler</p>
          </div>
        </div>

        <div class="library-list">

          <!-- Kütüphane 1 -->
          <div class="library-card">

            <div class="library-icon">
              🏛️
            </div>

            <div class="library-info">
              <h3>Bursa Merkez Kütüphanesi</h3>

              <p>
                📍 Osmangazi, Bursa
              </p>

              <span class="stock">
                8 adet mevcut
              </span>
            </div>

            <button class="library-borrow-btn">
              Ödünç Al
            </button>

          </div>

          <!-- Kütüphane 2 -->
          <div class="library-card">

            <div class="library-icon">
              🏛️
            </div>

            <div class="library-info">
              <h3>Nilüfer Kütüphanesi</h3>

              <p>
                📍 Nilüfer, Bursa
              </p>

              <span class="stock">
                3 adet mevcut
              </span>
            </div>

            <button class="library-borrow-btn">
              Ödünç Al
            </button>

          </div>

        </div>

      </section>

    </div>
  </div>
</template>

<style scoped>

.book-detail-page {
  min-height: calc(100vh - 80px);
  padding: 40px 20px 70px;

  background:
    linear-gradient(
      rgba(245, 237, 228, 0.94),
      rgba(245, 237, 228, 0.97)
    );

  color: #4b3021;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* =========================
   GERİ DÖN
========================= */

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

/* =========================
   KİTAP ÜST ALANI
========================= */

.book-hero {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 45px;

  padding: 40px;

  background: #fffaf4;

  border: 1px solid #dfc8b2;
  border-radius: 20px;

  box-shadow:
    0 8px 25px rgba(91, 58, 38, 0.10);
}

/* =========================
   KİTAP KAPAĞI
========================= */

.book-cover {
  width: 260px;
  height: 350px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;

  background:
    linear-gradient(
      145deg,
      #ead7c3,
      #d5b99d
    );

  border: 1px solid #c9a989;

  box-shadow:
    0 10px 25px rgba(91, 58, 38, 0.18);

  position: relative;
  overflow: hidden;
}

.book-cover::before {
  content: "";

  position: absolute;
  top: 0;
  left: 0;

  width: 12px;
  height: 100%;

  background: rgba(75, 48, 33, 0.16);
}

.book-icon {
  font-size: 100px;

  filter:
    drop-shadow(
      0 8px 8px rgba(75, 48, 33, 0.18)
    );
}

/* =========================
   KİTAP BİLGİLERİ
========================= */

.book-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category {
  display: inline-flex;
  align-items: center;

  width: fit-content;

  padding: 6px 13px;

  margin-bottom: 14px;

  background: #ead7c3;

  border-radius: 20px;

  color: #765039;

  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.8px;
}

.book-info h1 {
  margin: 0;

  color: #4b3021;

  font-size: 42px;
  line-height: 1.15;
}

.author {
  margin: 12px 0 30px;

  color: #765b48;

  font-size: 19px;
  font-weight: 500;
}

/* =========================
   META BİLGİLER
========================= */

.book-meta {
  display: flex;
  flex-wrap: wrap;

  gap: 15px;

  margin-bottom: 30px;
}

.meta-item {
  min-width: 145px;

  padding: 14px 16px;

  background: #f8eee4;

  border: 1px solid #e3cfbb;

  border-radius: 12px;
}

.meta-label {
  display: block;

  margin-bottom: 5px;

  color: #8a6b55;

  font-size: 12px;
  font-weight: 600;
}

.meta-value {
  color: #4b3021;

  font-size: 14px;
  font-weight: 700;
}

.status {
  display: inline-block;

  font-size: 14px;
  font-weight: 700;
}

.status.available {
  color: #4f7a45;
}

/* =========================
   ANA ÖDÜNÇ BUTONU
========================= */

.borrow-btn {
  width: fit-content;

  padding: 13px 24px;

  border: none;
  border-radius: 10px;

  background: #b96b35;
  color: white;

  font-size: 15px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;

  box-shadow:
    0 5px 12px rgba(185, 107, 53, 0.20);
}

.borrow-btn:hover {
  background: #a95e2c;

  transform: translateY(-2px);

  box-shadow:
    0 7px 16px rgba(169, 94, 44, 0.25);
}

/* =========================
   İÇERİK KARTLARI
========================= */

.content-card {
  margin-top: 25px;

  padding: 30px;

  background: #fffaf4;

  border: 1px solid #dfc8b2;
  border-radius: 18px;

  box-shadow:
    0 6px 20px rgba(91, 58, 38, 0.08);
}

/* =========================
   BAŞLIK
========================= */

.section-title {
  display: flex;
  align-items: center;

  gap: 14px;

  margin-bottom: 22px;
}

.title-icon {
  width: 45px;
  height: 45px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #ead7c3;

  border-radius: 12px;

  font-size: 22px;
}

.section-title h2 {
  margin: 0 0 3px;

  color: #4b3021;

  font-size: 21px;
}

.section-title p {
  margin: 0;

  color: #8a6b55;

  font-size: 13px;
}

/* =========================
   AÇIKLAMA
========================= */

.description {
  margin: 0;

  color: #654a39;

  font-size: 15px;

  line-height: 1.8;
}

/* =========================
   KÜTÜPHANELER
========================= */

.library-list {
  display: flex;
  flex-direction: column;

  gap: 15px;
}

.library-card {
  display: flex;
  align-items: center;

  gap: 18px;

  padding: 18px;

  background: #f8eee4;

  border: 1px solid #dfc8b2;

  border-radius: 14px;

  transition: 0.2s ease;
}

.library-card:hover {
  border-color: #c9a989;

  transform: translateY(-2px);

  box-shadow:
    0 5px 15px rgba(91, 58, 38, 0.08);
}

.library-icon {
  width: 52px;
  height: 52px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #ead7c3;

  border-radius: 12px;

  font-size: 25px;
}

.library-info {
  flex: 1;
}

.library-info h3 {
  margin: 0 0 6px;

  color: #4b3021;

  font-size: 16px;
}

.library-info p {
  margin: 0 0 7px;

  color: #765b48;

  font-size: 13px;
}

.stock {
  display: inline-block;

  color: #4f7a45;

  font-size: 13px;
  font-weight: 700;
}

/* =========================
   KÜTÜPHANE ÖDÜNÇ BUTONU
========================= */

.library-borrow-btn {
  padding: 10px 18px;

  border: 1px solid #c9976d;
  border-radius: 9px;

  background: #fffaf4;
  color: #9c572d;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s ease;
}

.library-borrow-btn:hover {
  background: #b96b35;
  border-color: #b96b35;

  color: white;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 800px) {

  .book-hero {
    grid-template-columns: 1fr;

    gap: 30px;

    padding: 25px;
  }

  .book-cover {
    width: 200px;
    height: 270px;

    margin: 0 auto;
  }

  .book-icon {
    font-size: 75px;
  }

  .book-info h1 {
    font-size: 32px;
  }

  .book-info {
    align-items: center;

    text-align: center;
  }

  .category {
    margin-left: auto;
    margin-right: auto;
  }

  .book-meta {
    justify-content: center;
  }

  .borrow-btn {
    width: 100%;
  }
}

@media (max-width: 600px) {

  .book-detail-page {
    padding: 25px 15px 50px;
  }

  .content-card {
    padding: 22px;
  }

  .book-hero {
    padding: 20px;
  }

  .book-cover {
    width: 170px;
    height: 230px;
  }

  .book-icon {
    font-size: 60px;
  }

  .book-info h1 {
    font-size: 28px;
  }

  .author {
    font-size: 16px;
  }

  .book-meta {
    flex-direction: column;

    width: 100%;
  }

  .meta-item {
    width: 100%;
    box-sizing: border-box;
  }

  .library-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .library-info {
    min-width: calc(100% - 75px);
  }

  .library-borrow-btn {
    width: 100%;
  }
}

</style>