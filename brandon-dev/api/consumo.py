from flask import Flask, request, jsonify
import mysql.connector
import json
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)

# Configurar CORS para permitir solicitudes desde todos los orígenes
CORS(app)

# Configura la API de OpenAI
api_key = "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"
client = OpenAI(api_key=api_key)
assistant_id = "asst_1UlnQMLsypJztS0GDYUJJApy"
vector_id = "vs_g9WtM7lphZybWpoKhWsBWVPU"


def get_car_info():
    # Conectar a la base de datos MySQL
    conn = mysql.connector.connect(
        host="localhost", user="root", password="", database="prueba_cic"
    )
    cursor = conn.cursor()

    # Ejecutar la consulta para obtener todos los autos
    query = "SELECT id, modelo, precio FROM autos"
    cursor.execute(query)
    autos = cursor.fetchall()

    cursor.close()
    conn.close()

    # Convertir los datos a un formato serializable
    autos_data = [
        {"id": auto[0], "modelo": auto[1], "precio": auto[2]} for auto in autos
    ]

    # Retornar los datos de la tabla
    return json.dumps(autos_data)  # Convertir el arreglo en una cadena JSON


@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    prompt = data.get("prompt")
    thread_id = data.get("thread_id")

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        keywords_csv = ["csv", "archivo", "code_interpreter"]
        keywords_file_search = ["documentos", "file_search"]
        keywords_function_calling = ["funcion"]

        attach_file = any(keyword in prompt.lower() for keyword in keywords_csv)
        attach_vector = any(
            keyword in prompt.lower() for keyword in keywords_file_search
        )
        attach_function = any(
            keyword in prompt.lower() for keyword in keywords_function_calling
        )

        if attach_file:
            file = client.files.create(
                file=open("documentos/Organization_v3.csv", "rb"), purpose="assistants"
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
                        ],
                    }
                ]
            )
        elif attach_vector:
            prompt += f"\n[Usar file_search con vector_id {vector_id}"
            response = client.beta.threads.create(
                messages=[{"role": "user", "content": prompt}]
            )
        elif attach_function:
            prompt += f"\n[Llamar la función get_car_info]"
            response = client.beta.threads.create(
                messages=[{"role": "user","content": prompt,}]
            )
        else:
            prompt += "\n[Consulta normal, no utilices los documentos del file_search]"
            response = client.beta.threads.create(
                messages=[{"role": "user", "content": prompt}]
            )

        thread_id = response.id
        run = client.beta.threads.runs.create_and_poll(
            thread_id=thread_id, assistant_id=assistant_id
        )

        # Verificar si se necesita ejecutar la función
        if attach_function:
            tool_outputs = []

            for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                if tool_call.function.name == "get_car_info":
                    car_info = get_car_info()

                    tool_outputs.append(
                        {"tool_call_id": tool_call.id, "output": car_info}
                    )

            if tool_outputs:
                try:
                    run = client.beta.threads.runs.submit_tool_outputs_and_poll(
                        thread_id=thread_id, run_id=run.id, tool_outputs=tool_outputs
                    )
                    print("Tool outputs submitted successfully.")
                except Exception as e:
                    print("Failed to submit tool outputs:", e)
            else:
                print("No tool outputs to submit.")

        if run.status == "completed":
            messages = client.beta.threads.messages.list(thread_id=thread_id)
            for message in messages.data:
                if message.role == "assistant":
                    for content_block in message.content:
                        if content_block.type == "text":
                            return jsonify(
                                {
                                    "response": content_block.text.value,
                                    "thread_id": thread_id,
                                    "file_id": (
                                        file.id if attach_file else None
                                    )
                                }
                            )
        else:
            return jsonify({"error": run.status}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000)
