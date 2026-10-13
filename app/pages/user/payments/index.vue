<template>
  <main class="payments-page">

    <section class="payments-container">

      <!-- Geri Dön -->
      <NuxtLink
        to="/user"
        class="back-link"
      >
        ← Kullanıcı Paneline Dön
      </NuxtLink>


      <!-- Sayfa Başlığı -->
      <div class="page-header">

        <p class="subtitle">
          ÖDEME
        </p>

     

        <p class="description">
          Üyelik planı ödemelerinizi gerçekleştirebilir ve geçmiş ödemelerinizi görüntüleyebilirsiniz.
        </p>

      </div>


      <!-- Ödeme Yap -->
      <section class="payment-section">

        <div class="section-header">

          <div class="section-title-group">

            <p class="section-label">
              ÜYELİK ÖDEMESİ
            </p>

            <h2>
              Üyelik planı satın al
            </h2>

            <span class="section-description">
              Seçtiğiniz üyelik planının ödemesini güvenli şekilde gerçekleştirin.
            </span>

          </div>

        </div>


        <div class="payment-card">

          <!-- Seçilen Plan -->
          <div class="selected-plan">

            <div class="plan-icon">
              👤
            </div>

            <div class="selected-plan-info">

              <p class="plan-label">
                SEÇİLEN PLAN
              </p>

              <h3>
                Premium Üyelik
              </h3>

              <p class="plan-description">
                10 kitap ödünç alma hakkı · 30 gün
              </p>

            </div>

          </div>


          <!-- Ödeme Özeti -->
          <div class="payment-summary">

            <div class="summary-row">

              <span>
                Üyelik Ücreti
              </span>

              <strong>
                100₺
              </strong>

            </div>

            <div class="summary-row">

              <span>
                Süre
              </span>

              <strong>
                30 gün
              </strong>

            </div>

            <div class="summary-row total">

              <span>
                Toplam
              </span>

              <strong>
                100₺
              </strong>

            </div>

          </div>


          <!-- Kart Formu -->
          <div class="payment-form">

            <div class="form-group">

              <label for="card-number">
                Kart Numarası
              </label>

              <input
                id="card-number"
                type="text"
                placeholder="0000 0000 0000 0000"
              />

            </div>


            <div class="form-row">

              <div class="form-group">

                <label for="card-name">
                  Kart Üzerindeki İsim
                </label>

                <input
                  id="card-name"
                  type="text"
                  placeholder="Ad Soyad"
                />

              </div>


              <div class="form-group">

                <label for="expiry">
                  Son Kullanma
                </label>

                <input
                  id="expiry"
                  type="text"
                  placeholder="AA/YY"
                />

              </div>


              <div class="form-group">

                <label for="cvv">
                  CVV
                </label>

                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                />

              </div>

            </div>


            <button
              type="button"
              class="payment-button"
            >
              💳 100₺ Ödeme Yap
            </button>

          </div>

        </div>

      </section>


      <!-- Ödeme Geçmişi -->
      <section class="history-section">

        <div class="section-header">

          <div class="section-title-group">

            <p class="section-label">
              GEÇMİŞ ÖDEMELER
            </p>

            <h2>
              Ödeme geçmişim
            </h2>

            <span class="section-description">
              Daha önce gerçekleştirdiğiniz üyelik ödemeleri.
            </span>

          </div>

        </div>


        <div class="history-card">

          <!-- Tablo Başlığı -->
          <div class="history-header">

            <span>
              Üyelik Planı
            </span>

            <span>
              Tarih
            </span>

            <span>
              Tutar
            </span>

            <span>
              Durum
            </span>

          </div>


          <!-- Ödeme -->
          <div class="history-row">

            <div class="mobile-label">

              <span>
                Üyelik Planı
              </span>

              <strong>
                Premium
              </strong>

            </div>

            <strong>
              Premium
            </strong>

            <span>
              15.09.2026
            </span>

            <strong>
              100₺
            </strong>

            <span class="status-success">
              Başarılı
            </span>

          </div>


          <!-- Ödeme -->
          <div class="history-row">

            <div class="mobile-label">

              <span>
                Üyelik Planı
              </span>

              <strong>
                Basic
              </strong>

            </div>

            <strong>
              Basic
            </strong>

            <span>
              10.08.2026
            </span>

            <strong>
              50₺
            </strong>

            <span class="status-success">
              Başarılı
            </span>

          </div>

        </div>

      </section>


      <!-- Bilgilendirme -->
      <div class="info-box">

        <div class="info-icon">
          ℹ️
        </div>

        <div>

          <strong>
            Ödeme hakkında
          </strong>

          <p>
            Üyelik ödemeniz tamamlandığında seçtiğiniz plan hesabınız için aktif hale gelir.
          </p>

        </div>

      </div>

    </section>

  </main>
</template>


<style scoped>

/* =========================
   Genel Sayfa
========================= */

.payments-page {
  min-height: calc(100vh - 75px);

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


.payments-container {
  max-width: 1000px;

  margin: 0 auto;
}


/* =========================
   Geri Dön
========================= */

.back-link {
  display: inline-block;

  margin-bottom: 25px;

  padding: 7px 11px;

  color: #7c4b2c;

  background: rgba(255, 250, 244, 0.92);

  border: 1px solid #dfc8b2;

  border-radius: 7px;

  text-decoration: none;

  font-size: 14px;

  font-weight: 600;

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.06);

  transition: 0.2s;
}


.back-link:hover {
  color: #5f3822;

  background: #fffaf4;

  border-color: #cdb197;

  transform: translateX(-2px);

  box-shadow:
    0 4px 10px rgba(92, 57, 34, 0.10);
}


/* =========================
   Sayfa Başlığı
========================= */

.page-header {
  margin-bottom: 45px;

  padding: 26px 28px;

  background: rgba(255, 250, 244, 0.94);

  border: 1px solid #dfc8b2;

  border-radius: 20px;

  box-shadow:
    0 8px 25px rgba(92, 57, 34, 0.08);
}


.subtitle {
  display: inline-block;

  margin: 0 0 10px;

  padding: 5px 10px;

  color: #7c4b2c;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 6px;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: 1px;
}




.description {
  color: #765b48;

  font-size: 15px;

  line-height: 1.6;

  max-width: 700px;

  margin: 0;
}


/* =========================
   Bölümler
========================= */

.payment-section {
  margin-bottom: 55px;
}


.history-section {
  margin-bottom: 30px;
}


.section-header {
  margin-bottom: 20px;
}


.section-title-group {
  display: flex;

  flex-direction: column;

  align-items: flex-start;
}


.section-label {
  display: inline-block;

  margin: 0 0 7px;

  padding: 5px 10px;

  color: #7c4b2c;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 6px;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: 0.8px;
}


.section-header h2 {
  display: inline-block;

  margin: 0 0 6px;

  padding: 5px 12px;

  color: #4b3021;

  background: rgba(255, 250, 244, 0.96);

  border-radius: 7px;

  font-size: 24px;

  font-weight: 650;

  letter-spacing: -0.4px;

  box-shadow:
    0 2px 8px rgba(92, 57, 34, 0.07);
}


.section-description {
  display: block;

  margin-left: 12px;

  color: #765b48;

  background: rgba(255, 250, 244, 0.90);

  padding: 4px 9px;

  border-radius: 5px;

  font-size: 13px;

  font-weight: 500;

  line-height: 1.4;
}


/* =========================
   Ödeme Kartı
========================= */

.payment-card {
  background: rgba(255, 252, 248, 0.96);

  border: 1px solid #dfc8b2;

  border-radius: 18px;

  padding: 28px;

  box-shadow:
    0 10px 28px rgba(92, 57, 34, 0.09);
}


/* =========================
   Seçilen Plan
========================= */

.selected-plan {
  display: flex;

  align-items: center;

  gap: 16px;

  padding-bottom: 24px;

  border-bottom: 1px solid #ead9c9;
}


.plan-icon {
  width: 52px;

  height: 52px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  background: #f5e6d5;

  border: 1px solid #dfc8b2;

  border-radius: 13px;

  font-size: 24px;
}


.plan-label {
  color: #8a5835;

  font-size: 11px;

  font-weight: 700;

  letter-spacing: 1px;

  margin: 0 0 5px;
}


.selected-plan h3 {
  color: #4b3021;

  font-size: 21px;

  margin: 0 0 5px;
}


.plan-description {
  color: #765b48;

  font-size: 13px;

  margin: 0;
}


/* =========================
   Ödeme Özeti
========================= */

.payment-summary {
  padding: 22px 0;

  border-bottom: 1px solid #ead9c9;
}


.summary-row {
  display: flex;

  align-items: center;

  justify-content: space-between;

  color: #765b48;

  font-size: 14px;

  margin-bottom: 13px;
}


.summary-row strong {
  color: #4b3021;
}


.summary-row.total {
  margin-top: 18px;

  padding-top: 18px;

  border-top: 1px solid #ead9c9;

  color: #4b3021;

  font-size: 17px;

  margin-bottom: 0;
}


.summary-row.total strong {
  color: #a65f32;

  font-size: 22px;
}


/* =========================
   Form
========================= */

.payment-form {
  padding-top: 24px;
}


.form-group {
  display: flex;

  flex-direction: column;

  gap: 7px;

  flex: 1;
}


.form-group label {
  color: #5d4232;

  font-size: 13px;

  font-weight: 600;
}


.form-group input {
  width: 100%;

  box-sizing: border-box;

  padding: 12px 13px;

  color: #4b3021;

  background: #fffdf9;

  border: 1px solid #d9c3ae;

  border-radius: 9px;

  font-size: 14px;

  outline: none;

  transition: 0.2s;
}


.form-group input::placeholder {
  color: #b29b88;
}


.form-group input:focus {
  border-color: #b96b35;

  box-shadow:
    0 0 0 3px rgba(185, 107, 53, 0.12);

  background: #fffaf4;
}


.form-row {
  display: grid;

  grid-template-columns: 2fr 1fr 1fr;

  gap: 15px;

  margin-top: 18px;
}


/* =========================
   Ödeme Butonu
========================= */

.payment-button {
  width: 100%;

  margin-top: 25px;

  padding: 13px;

  background: #b96b35;

  color: white;

  border: none;

  border-radius: 9px;

  font-size: 14px;

  font-weight: 650;

  cursor: pointer;

  box-shadow:
    0 5px 14px rgba(139, 78, 37, 0.18);

  transition: 0.2s;
}


.payment-button:hover {
  background: #a85d2d;

  transform: translateY(-1px);

  box-shadow:
    0 7px 17px rgba(139, 78, 37, 0.22);
}


/* =========================
   Ödeme Geçmişi
========================= */

.history-card {
  background: rgba(255, 252, 248, 0.96);

  border: 1px solid #dfc8b2;

  border-radius: 18px;

  overflow: hidden;

  box-shadow:
    0 10px 28px rgba(92, 57, 34, 0.08);
}


.history-header,
.history-row {
  display: grid;

  grid-template-columns: 1.5fr 1fr 1fr 1fr;

  align-items: center;

  gap: 20px;

  padding: 18px 22px;
}


.history-header {
  background: #f7ede2;

  color: #765b48;

  font-size: 12px;

  font-weight: 700;

  border-bottom: 1px solid #dfc8b2;
}


.history-row {
  color: #765b48;

  font-size: 14px;

  border-bottom: 1px solid #eee1d5;

  transition: background 0.2s;
}


.history-row:hover {
  background: rgba(247, 237, 226, 0.45);
}


.history-row:last-child {
  border-bottom: none;
}


.history-row strong {
  color: #4b3021;
}


.status-success {
  display: inline-block;

  width: fit-content;

  background: #e4f2e5;

  color: #397044;

  padding: 5px 10px;

  border: 1px solid #c8dfca;

  border-radius: 15px;

  font-size: 12px;

  font-weight: 600;
}


.mobile-label {
  display: none;
}


/* =========================
   Bilgilendirme
========================= */

.info-box {
  display: flex;

  align-items: flex-start;

  gap: 13px;

  margin-top: 28px;

  padding: 16px 18px;

  background: rgba(255, 250, 244, 0.94);

  border: 1px solid #dfc8b2;

  border-radius: 12px;

  color: #765b48;
}


.info-icon {
  display: flex;

  align-items: center;

  justify-content: center;

  width: 30px;

  height: 30px;

  flex-shrink: 0;

  background: #f5e6d5;

  border-radius: 8px;

  font-size: 15px;
}


.info-box strong {
  display: block;

  margin-bottom: 4px;

  color: #5a3927;

  font-size: 14px;
}


.info-box p {
  margin: 0;

  font-size: 13px;

  line-height: 1.5;
}


/* =========================
   Tablet
========================= */

@media (max-width: 900px) {

  .payments-container {
    max-width: 850px;
  }

}


/* =========================
   Mobil
========================= */

@media (max-width: 700px) {

  .payments-page {
    padding: 35px 18px 55px;
  }


  .page-header {
    padding: 22px;

    margin-bottom: 35px;
  }


  .page-header h1 {
    font-size: 30px;
  }


  .description {
    font-size: 14px;
  }


  .payment-card {
    padding: 21px;
  }


  .selected-plan {
    align-items: flex-start;
  }


  .form-row {
    grid-template-columns: 1fr;

    gap: 15px;
  }


  .history-header {
    display: none;
  }


  .history-row {
    display: flex;

    flex-direction: column;

    align-items: flex-start;

    gap: 8px;

    padding: 20px;
  }


  .history-row > strong {
    display: none;
  }


  .mobile-label {
    display: flex;

    flex-direction: column;

    gap: 3px;
  }


  .mobile-label span {
    color: #8b7463;

    font-size: 11px;
  }


  .status-success {
    margin-top: 3px;
  }


  .section-header h2 {
    font-size: 21px;
  }


  .section-description {
    margin-left: 8px;

    font-size: 12px;
  }


  .info-box {
    padding: 14px;
  }

}


/* =========================
   Küçük Telefon
========================= */

@media (max-width: 450px) {

  .payments-page {
    padding-left: 14px;

    padding-right: 14px;
  }


  .page-header h1 {
    font-size: 27px;
  }


  .payment-card {
    padding: 18px;
  }


  .selected-plan h3 {
    font-size: 19px;
  }


  .summary-row.total {
    font-size: 16px;
  }


  .summary-row.total strong {
    font-size: 20px;
  }

}

</style>