from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)

# Configurar CORS para permitir solicitudes desde todos los orígenes
CORS(app)

# Configura la API de OpenAI
api_key = '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'
client = OpenAI(api_key=api_key)
assistant_id = "asst_1UlnQMLsypJztS0GDYUJJApy"

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    
    try:
        thread = client.beta.threads.create()
        response = client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=prompt
        )

        run = client.beta.threads.runs.create_and_poll(
            thread_id=response.thread_id,
            assistant_id=assistant_id
        )

        if run.status == 'completed':
            messages = client.beta.threads.messages.list(
                thread_id=response.thread_id,
            )
            for message in messages.data:
                if message.role == 'assistant':
                    for content_block in message.content:
                        if content_block.type == 'text':
                            return jsonify({'response': content_block.text.value})
        else:
            return jsonify({'error': run.status}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
