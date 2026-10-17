import os
import base64
import google.generativeai as genai
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

CORS(app, resources={r"/chat": {"origins": "*"}})
SECRET_TOKEN = "{LETAK_APA_saja_DISINI}"

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["300 per day"],
    storage_uri="memory://",
)

# Guna os.environ.get untuk elak NameError crash
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Tetapan supaya jawapan pantas, tepat dan tidak meleret
generation_config = {
    "temperature": 0.2,
    "max_output_tokens": 500,
}
model = genai.GenerativeModel('gemini-2.5-flash-lite', generation_config=generation_config)

SYSTEM_PROMPT = """
Identiti:
Nama: "Abang Tech" - Penasihat Teknikal Pintar Lantai Kilang.

Prinsip Utama (Operasi Pantas Lantai Produksi):
1. TERUS KE POINT (NO FLUFF): Jangan guna mukadimah meleret (cth: jangan sebut "Sebagai Abang Tech...", "Terima kasih bertanya..."). Terus bagi jawapan/tindakan.
2. RINGKAS & PADAT: Formatkan dalam beberapa poin atau langkah bernombor pendek. Mudah dibaca sepintas lalu di production floor.
3. KESELAMATAN: Nyatakan amaran LOTO / PPE / henti mesin jika berkaitan dalam 1 baris pendek.

Panduan Pantas Mengikut Peranan:
- Operator: Langkah praktikal segera & SOP mesin.
- Technician: Punca teknikal utama (root cause) & semakan komponen/wiring/setting.
- Engineer: Analisis punca teknikal, semakan parameter/logik, & tindakan pembetulan.
- Manager: Poin padat: status downtime, impak risiko/kos, & keputusan pantas.
"""

@app.route('/chat', methods=['POST'])
@limiter.limit("15 per minute")
def chat():
    client_token = request.headers.get('X-Custom-Token')
    if client_token != SECRET_TOKEN:
        abort(403)

    data = request.json or {}
    user_query = data.get('message', '').strip()
    user_role = data.get('role', 'Operator')
    image_base64 = data.get('image', None)
    mime_type = data.get('mime_type', 'image/jpeg')

    if not user_query and not image_base64:
        return jsonify({"error": "Sila masukkan soalan atau gambar."}), 400

    try:
        contents = []

        if image_base64:
            if "," in image_base64:
                header, encoded = image_base64.split(",", 1)
                image_bytes = base64.b64decode(encoded)
                if "image/" in header:
                    mime_type = header.split(";")[0].split(":")[1]
            else:
                image_bytes = base64.b64decode(image_base64)

            contents.append({
                "mime_type": mime_type,
                "data": image_bytes
            })

        # ARAHAN KHAS KELAJUAN OPERASI MENGIKUT ROLE
        role_instruction = (
            f"\n\n[PENGGUNA: {user_role.upper()}]\n"
            f"ARAHAN KELAJUAN: Jawab terus untuk {user_role}. SANGAT RINGKAS, PADAT, dan TERUS KE TINDAKAN."
            f"Dilarang buat mukadimah. Terus berikan diagnosis/langkah."
        )

        prompt_text = user_query if user_query else "Tolong analisa kerosakan komponen/peralatan dalam gambar ini secara ringkas."
        contents.append(f"{SYSTEM_PROMPT}{role_instruction}\n\nSoalan ({user_role}): {prompt_text}")

        response = model.generate_content(contents)
        
        # Ekstrak jawapan secara selamat sekiranya finish_reason terpotong
        reply_text = ""
        try:
            reply_text = response.text
        except Exception:
            if response.candidates and response.candidates[0].content.parts:
                reply_text = "".join([part.text for part in response.candidates[0].content.parts if hasattr(part, 'text')])
            else:
                reply_text = "Maaf, jawapan tidak dapat dijana sepenuhnya. Sila cuba lagi."

        return jsonify({"reply": reply_text})

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Chat Error: {e}")
        return jsonify({
            "reply": "Mesin server tengah panas, cuba lagi kejap lagi. - Abang Tech",
            "error_detail": str(e)
        }), 500
