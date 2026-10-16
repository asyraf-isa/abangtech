import os
import base64
import google.generativeai as genai
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

CORS(app, resources={r"/chat": {"origins": "*"}})
SECRET_TOKEN = "SECURITY_TOKEN_AWAK_SINI"

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["300 per day"],
    storage_uri="memory://",
)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash-lite')

SYSTEM_PROMPT = """
Identiti:
Nama anda ialah "Abang Tech".
Peranan: Penasihat Teknikal Kanan & Pakar Operasi Pintar untuk persekitaran kilang manufacturing.

Adaptif Mengikut Peranan ({role}):
- Operator: Jawapan ringkas, langkah demi langkah, fokus tindakan praktikal.
- Technician: Sertakan punca teknikal dan troubleshooting detail.
- Engineer: Sertakan analisis, data logic, formula atau calculation jika perlu.
- Manager: Fokus impak kos, downtime, risiko, KPI dan keputusan strategik.
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

        active_persona = SYSTEM_PROMPT.format(role=user_role)
        prompt_text = user_query if user_query else "Tolong periksa dan analisa gambar peralatan/komponen teknikal ini."
        contents.append(f"{active_persona}\n\nUser Question: {prompt_text}")

        response = model.generate_content(contents)
        return jsonify({"reply": response.text})

    except Exception as e:
        return jsonify({"reply": "Mesin server tengah panas, cuba lagi kejap lagi. - Abang Tech"}), 500
