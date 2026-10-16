import sys
import os

# Laluan ke direktori fail app.py anda
path = '/home/marginfull'
if path not in sys.path:
    sys.path.append(path)

# Tetapkan API Key Gemini anda terus di sini jika belum ada dalam environment variable
os.environ["GEMINI_API_KEY"] = "MASUKKAN_GEMINI_API_KEY_ANDA_DI_SINI"

# Import pembolehubah 'app' dari app.py
from app import app as application
