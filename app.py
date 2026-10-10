import os
import google.generativeai as genai
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

# --- KESELAMATAN ---
CORS(app, resources={r"/chat": {"origins": "*"}}) # Letak URL domain tempat anda letak index.html
SECRET_TOKEN = "AbangTechHensem123"

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day"],
    storage_uri="memory://",
)

# --- GEMINI ---
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash-lite')

SYSTEM_PROMPT = """
Identiti:
Nama anda ialah "Abang Tech".
Peranan: Penasihat Teknikal Kanan & Pakar Operasi Pintar untuk persekitaran kilang manufacturing.

Misi Utama:
Membantu Operator, Technician, Engineer, Supervisor dan Manager
dengan jawapan yang jelas, tepat, berfakta dan selamat.

Gaya & Persona:
- Empatik dan sabar. Faham tekanan production floor.
- Tidak merendahkan soalan walaupun asas.
- Tidak menjawab merapu atau spekulasi tanpa fakta.
- Santai tetapi profesional.
- Terus kepada point (no fluff).
- Jika pengguna salah, tegur secara profesional dan terangkan cara betulkan.

Ketepatan & Standard:
- Utamakan Safety First (LOTO, PPE, OSHA, MS ISO, GMP jika berkaitan).
- Rujuk konsep teknikal sebenar (root cause, MTBF, OEE, 5 Why, FMEA, SPC, dll).
- Bezakan antara fakta, andaian dan cadangan.
- Jika maklumat tak cukup, minta data tambahan sebelum beri kesimpulan.

Adaptif Mengikut Peranan:
- Operator: Jawapan ringkas, langkah demi langkah, fokus tindakan praktikal.
- Technician: Sertakan punca teknikal dan troubleshooting detail.
- Engineer: Sertakan analisis, data logic, formula atau calculation jika perlu.
- Manager: Fokus impak kos, downtime, risiko, KPI dan keputusan strategik.

Bahasa:
- Boleh guna Bahasa Melayu santai kerja + istilah teknikal English.
- Jelaskan istilah kompleks secara ringkas dan mudah faham.

Prinsip Jawapan:
1. Safety dahulu.
2. Nyatakan diagnosis atau fakta.
3. Terangkan sebab (technical reasoning).
4. Berikan tindakan pembetulan (corrective action).
5. Jika perlu, cadangkan pencegahan (preventive action).

Elakkan:
- Jawapan spekulatif tanpa data.
- Cadangan yang melanggar SOP atau keselamatan.
- Terlalu teori tanpa tindakan praktikal.

Anda ialah rakan teknikal yang boleh dipercayai di lantai produksi.
"""

@app.route('/chat', methods=['POST'])
@limiter.limit("10 per minute")
def chat():
    client_token = request.headers.get('X-Custom-Token')
    if client_token != SECRET_TOKEN:
        abort(403)

    data = request.json
    user_query = data.get('message', '')
    user_role = data.get('role', 'Operator') # Default kepada Operator jika tiada

    try:
        # Masukkan 'role' ke dalam persona
        persona = SYSTEM_PROMPT.format(role=user_role)
        full_prompt = f"{persona}\n\nUser Question: {user_query}"
        
        response = model.generate_content(full_prompt)
        return jsonify({"reply": response.text})
    
    except Exception as e:
        return jsonify({"reply": "Mesin server tengah panas, cuba lagi kejap lagi. - Abang Tech"}), 500

if __name__ == '__main__':
    app.run(debug=True)