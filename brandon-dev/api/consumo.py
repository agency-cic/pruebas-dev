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
vector_id = "vs_g9WtM7lphZybWpoKhWsBWVPU"

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    prompt = data.get('prompt')
    thread_id = data.get('thread_id')  # Espera el ID de un hilo existente

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    try:
        # Identificar si el prompt hace referencia a un archivo o vector
        keywords_csv = ['csv', 'archivo', 'code_interpreter']
        keywords_file_search = ['documentos', 'file_search']

        attach_file = any(keyword in prompt.lower() for keyword in keywords_csv)
        attach_vector = any(keyword in prompt.lower() for keyword in keywords_file_search)

        if attach_file:
            # Modificar el prompt para indicar que debe usar code_interpreter
            file = client.files.create(
                file=open("documentos/Organization_v3.csv", "rb"),
                purpose='assistants'
            )
            response = client.beta.threads.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                        "attachments": [
                            {
                                "file_id": file.id,
                                "tools": [{"type": "code_interpreter"}],
                            }
                        ]
                    }
                ]
            )
        elif attach_vector:
            # Modificar el prompt para indicar que debe usar file_search
            prompt += f"\n[Usar file_search con vector_id {vector_id}]"
            response = client.beta.threads.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
        else:
            # Modificar el prompt para indicar que es una consulta normal
            prompt += "\n[Consulta normal, no utilices los documentos del file_search]"
            response = client.beta.threads.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

        thread_id = response.id

        run = client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=assistant_id
        )

        if run.status == 'completed':
            messages = client.beta.threads.messages.list(
                thread_id=thread_id,
            )
            for message in messages.data:
                if message.role == 'assistant':
                    for content_block in message.content:
                        if content_block.type == 'text':
                            return jsonify({
                                'response': content_block.text.value, 
                                'thread_id': thread_id,
                                'file_id': file.id if attach_file else None  # Incluir el file.id en la respuesta si fue adjuntado
                            })
        else:
            return jsonify({'error': run.status}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
