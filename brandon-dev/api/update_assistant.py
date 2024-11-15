# Crear un vector de archivos para el asistente
"""
# Crear un vector store llamado "Archivos de Brandon IA"
vector_store = client.beta.vector_stores.create(name="Archivos de Brandon IA")

# Imprimir el ID del vector store para guardarlo
print(f"El ID del vector store es: {vector_store.id}")

# Preparar los archivos para subir a OpenAI
file_paths = ["documentos/M3 Competition.pdf", "documentos/Mercedes A200 AMG LIne.pdf", "documentos/Porsche 911.docx", "documentos/Toyota Supra.docx"]
file_streams = [open(path, "rb") for path in file_paths]

# Usar la función de subir y hacer polling de los archivos, agregarlos al vector store
file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
  vector_store_id=vector_store.id, files=file_streams
)

# Imprimir el estado y la cantidad de archivos en el batch
print(file_batch.status)
print(file_batch.file_counts) """

from openai import OpenAI

# Configura la API de OpenAI
api_key = "*****************************"
client = OpenAI(api_key=api_key)

# ID del asistente que quieres modificar
assistant_id = "asst_1UlnQMLsypJztS0GDYUJJApy"

# ID del vector con los archivos
vector_id = "vs_g9WtM7lphZybWpoKhWsBWVPU"

# Actualizar las herramientas del asistente
try:
    updated_assistant = client.beta.assistants.update(
        assistant_id=assistant_id,
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "get_car_info",
                    "description": "Consulta y muestra la información de todos los autos, define cuál es el auto más caro, cual es el más barato y la media de todos los precios",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "conexion": {
                                "type": "object",
                                "description": "conexion a la base de datos mysql",
                            },
                        },
                        "required": ["conexion"],
                    },
                },
            },
            {"type": "code_interpreter"},
            {"type": "file_search"}
        ],
    )

    print(
        f"Las herramientas del asistente se han actualizado correctamente. Nuevo estado: {updated_assistant}"
    )
except Exception as e:
    print(f"Error al actualizar las herramientas del asistente: {e}")
