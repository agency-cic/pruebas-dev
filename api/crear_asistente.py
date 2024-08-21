import openai
from openai import OpenAI

api_key= openai.api_key = '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'

client = OpenAI(api_key=api_key)

assistant = client.beta.assistants.create(
  name="Brandon",
  instructions="Eres un experto en autos.",
  tools=[{"type": "code_interpreter"}],
  model="gpt-4o",
)

assistant_id = assistant.id

print ("El ID: " + assistant_id)