# Panduan Menjalankan Backend Flask di PythonAnywhere

## Langkah 1: Pasang Pakej yang Diperlukan

1. Log masuk ke akaun **PythonAnywhere** anda.
2. Pergi ke tab **Consoles** dan buka satu **Bash console**.
3. Jalankan arahan berikut untuk memasang pakej yang diperlukan:

   ```bash
   pip install --user flask flask-cors flask-limiter google-generativeai
   ```

4. Tunggu sehingga proses pemasangan selesai.

## Langkah 2: Muat Naik Fail `app.py`

1. Sediakan fail `app.py` yang mengandungi kod backend Flask multimodal anda pada komputer.
2. Log masuk ke PythonAnywhere dan pergi ke tab **Files**.
3. Buka direktori utama akaun anda:

   ```text
   /home/{username-pythonanywhere-awak}/
   ```

4. Klik butang **Upload a file**.
5. Pilih fail `app.py` daripada komputer anda.
6. Pastikan fail tersebut berjaya dimuat naik ke lokasi berikut:

   ```text
   /home/{username-pythonanywhere-awak}/app.py
   ```

7. Jika fail `app.py` sudah wujud, pastikan anda menggantikannya dengan versi terkini jika diperlukan.

**Nota:** Pastikan fail `app.py` mengandungi kod backend yang diperlukan, termasuk konfigurasi Flask, CORS, rate limiting, pengesahan token dan integrasi Gemini API.

## Langkah 3: Konfigurasi Fail WSGI

PythonAnywhere menggunakan WSGI untuk menjalankan aplikasi Flask. Anda tidak perlu menggunakan `app.run()`.

1. Pergi ke tab **Web**.
2. Di bahagian **Code**, cari pautan **WSGI configuration file**.

   Contoh laluan:

   ```text
   /var/www/{username-pythonanywhere-awak}_pythonanywhere_com_wsgi.py
   ```

3. Buka fail konfigurasi tersebut dan pastikan kandungannya seperti berikut:

   ```python
   import sys
   import os

   # Laluan ke direktori fail app.py
   path = '/home/{username-pythonanywhere-awak}'

   if path not in sys.path:
       sys.path.append(path)

   # Tetapkan Gemini API Key
   os.environ["GEMINI_API_KEY"] = "MASUKKAN_GEMINI_API_KEY_ANDA_DI_SINI"

   # Import aplikasi Flask
   from app import app as application
   ```

4. Gantikan `MASUKKAN_GEMINI_API_KEY_ANDA_DI_SINI` dengan Gemini API Key anda.
5. Klik **Save**.

**Penting:** Jangan kongsikan fail konfigurasi atau API Key anda kepada orang lain. Untuk keselamatan yang lebih baik, gunakan mekanisme penyimpanan rahsia yang sesuai jika tersedia.

## Langkah 4: Reload Aplikasi Web

1. Kembali ke tab **Web**.
2. Klik butang hijau **Reload {username-pythonanywhere-awak}.pythonanywhere.com**.
3. Tunggu sehingga proses reload selesai.

Pastikan tiada ralat konfigurasi sebelum meneruskan ke langkah seterusnya.

## Langkah 5: Uji Endpoint API

Endpoint API backend anda ialah:

```text
https://{username-pythonanywhere-awak}.pythonanywhere.com/chat
```

Anda boleh mengujinya menggunakan frontend React/Vite, Postman atau cURL dengan menghantar permintaan HTTP `POST`.

Contoh menggunakan cURL:

```bash
curl -X POST "https://{username-pythonanywhere-awak}.pythonanywhere.com/chat" \
  -H "Content-Type: application/json" \
  -H "X-Custom-Token: TOKEN_ANDA" \
  -d '{"message":"Hello Abang Tech","role":"Operator"}'
```

Gantikan `TOKEN_ANDA` dengan token yang sepadan dengan nilai `SECRET_TOKEN` dalam fail `app.py`.

Jika konfigurasi dan pengesahan berjaya, API sepatutnya memulangkan respons JSON yang mengandungi jawapan daripada model Gemini.

## Langkah 6: Semak Ralat Jika API Tidak Berfungsi

Jika API memulangkan ralat HTTP 500 atau tidak memberikan respons:

1. Pergi ke tab **Web** di PythonAnywhere.
2. Cari bahagian **Log files**.
3. Buka **Error log** untuk melihat butiran ralat.
4. Semak perkara berikut:
   - Fail `app.py` berada di lokasi yang betul.
   - Semua pakej Python yang diperlukan telah dipasang.
   - Gemini API Key adalah sah.
   - Konfigurasi WSGI mengimport aplikasi dengan betul.
   - Token dalam permintaan sepadan dengan token dalam backend.
   - Akaun PythonAnywhere mempunyai akses rangkaian yang diperlukan untuk menghubungi Gemini API.

Selepas membuat pembetulan, klik **Reload** semula dan uji endpoint API sekali lagi.
