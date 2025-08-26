import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat_handler():
    try:
        API_KEY = os.environ.get('GEMINI_API_KEY')
        if not API_KEY:
            raise ValueError("API Key de Gemini no configurada")
            
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')

        with open('prompt.txt', 'r', encoding='utf-8') as f:
            SYSTEM_PROMPT = f.read()

        data = request.json
        conversation_history = data.get('history', [])
        
        full_history = [
            {'role': 'user', 'parts': [{'text': SYSTEM_PROMPT}]},
            {'role': 'model', 'parts': [{'text': "Entendido. Estoy listo para actuar como IMA Planner e iniciar la conversación."}]}
        ] + conversation_history
        
        response = model.generate_content(full_history)

        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Ocurrió un error: {e}")
        return jsonify({"error": "Hubo un problema al procesar tu solicitud."}), 500