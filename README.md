# Panduan Deployment ke PythonAnywhere

## 1. Cara Ringkas Host di PythonAnywhere

### Langkah 1: Daftar dan Login

1. Pergi ke [PythonAnywhere](https://www.pythonanywhere.com/).
2. Daftar akaun baharu atau log masuk ke akaun sedia ada.

### Langkah 2: Upload Fail

1. Pergi ke tab **Files**.
2. Upload fail `app.py` anda.
3. Pastikan kod Python anda mempunyai konfigurasi CORS menggunakan `flask-cors`, contohnya:

   ```python
   from flask_cors import CORS

   CORS(app)
   ```

### Langkah 3: Pasang Dependencies

1. Buka **Bash Console**.
2. Jalankan arahan berikut untuk memasang library yang diperlukan:

   ```bash
   pip3 install --user flask-cors google-generativeai flask-limiter
   ```

### Langkah 4: Setup Web App

1. Pergi ke tab **Web**.
2. Klik **Add a new web app**.
3. Pilih **Flask**.
4. Pilih versi Python yang sesuai dengan kod anda, contohnya Python 3.10 atau versi yang disokong.
5. Tetapkan laluan fail aplikasi Python anda, iaitu `app.py`, jika diperlukan.

### Langkah 5: Konfigurasi WSGI (Penting)

1. Dalam tab **Web**, cari bahagian **WSGI configuration file**.
2. Klik pautan fail tersebut untuk mengedit konfigurasi.
3. Pastikan fail WSGI mengimport aplikasi Flask daripada fail `app.py` anda dengan betul.

   Contoh konfigurasi:

   ```python
   import sys

   path = '/home/USERNAME/mysite'
   if path not in sys.path:
       sys.path.insert(0, path)

   from app import app as application
   ```

   **Nota:** Gantikan `USERNAME` dengan nama pengguna PythonAnywhere anda dan sesuaikan laluan direktori jika perlu. Contoh ini menganggap objek Flask dalam `app.py` dinamakan `app`.

### Langkah 6: Reload Web App

1. Simpan semua perubahan.
2. Kembali ke tab **Web**.
3. Klik butang hijau **Reload**.
4. Aplikasi anda boleh diakses melalui URL PythonAnywhere, contohnya:

   `https://USERNAME.pythonanywhere.com/chat`

   Gantikan `USERNAME` dengan nama pengguna akaun anda.

---

## 2. Perkara Penting Sebelum Deploy

### API Key Gemini

Gantikan placeholder berikut dalam kod Python:

```python
ISI_API_KEY_GEMINI_ANDA_DI_SINI
```

Gunakan API key sebenar yang diperoleh daripada [Google AI Studio](https://aistudio.google.com/).

**Keselamatan:** Jangan dedahkan API key dalam `index.html`, kod JavaScript bahagian frontend, repositori awam atau mana-mana fail yang boleh diakses oleh pengguna. Sebaiknya simpan API key sebagai environment variable dan baca nilainya daripada backend Python.

### URL API

Dalam fail `index.html`, cari URL API yang menggunakan alamat contoh:

```text
https://username.pythonanywhere.com/chat
```

Gantikan `username` dengan nama pengguna PythonAnywhere anda.

Pastikan URL tersebut sepadan dengan alamat sebenar backend yang telah di-deploy.

### SECRET_TOKEN dan TOKEN

Jika anda menggunakan `SECRET_TOKEN` dalam Python dan `TOKEN` dalam JavaScript:

- Pastikan kedua-dua nilai sepadan jika backend anda memerlukan token yang sama.
- Jangan anggap token yang diletakkan dalam JavaScript sebagai rahsia kerana pengguna boleh melihatnya melalui browser.
- Untuk perlindungan API yang lebih kukuh, gunakan pengesahan di bahagian backend, hadkan penggunaan melalui rate limiting dan simpan rahsia pada server.

### Konfigurasi CORS

Pastikan konfigurasi `CORS(app, ...)` hanya membenarkan origin frontend yang dibenarkan.

Contoh:

```python
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "https://domain-frontend-anda.com"
            ]
        }
    }
)
```

Gantikan `https://domain-frontend-anda.com` dengan domain sebenar tempat anda menghoskan `index.html`.

Jika frontend menggunakan domain tersuai, masukkan domain tersebut dengan protokol yang betul (`https://`). Elakkan menggunakan `origins="*"` untuk API yang memerlukan kawalan akses.

---

## 3. Checklist Sebelum Menguji

- [ ] Fail `app.py` telah dimuat naik.
- [ ] Dependencies yang diperlukan telah dipasang.
- [ ] API key Gemini telah dikonfigurasi dengan betul.
- [ ] Fail WSGI mengimport aplikasi Flask dengan betul.
- [ ] URL API dalam `index.html` telah dikemas kini.
- [ ] Konfigurasi CORS membenarkan domain frontend.
- [ ] Konfigurasi token sepadan dengan keperluan backend.
- [ ] Web app telah di-reload.
- [ ] Endpoint `/chat` telah diuji dari frontend.

**Selesai!** Selepas semua langkah di atas selesai, uji aplikasi anda dan semak log ralat pada tab **Web** jika berlaku masalah semasa deployment.
