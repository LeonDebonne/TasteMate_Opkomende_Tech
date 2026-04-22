import speech_recognition as sr, pyttsx3
from google import genai

client = genai.Client(api_key="AIzaSyAQlkIaqmegZwoiOLFf-JUYOm8cNyA2IHc")
r = sr.Recognizer()
tts = pyttsx3.init()

with sr.Microphone() as mic:
    print("Speak...")
    spoken = r.recognize_google(r.listen(mic))
resp = client.models.generate_content(model="gemini-2.5-flash", contents=spoken)
reply = resp.text.strip()
print("Assistant : ", reply)
tts.say(reply)
tts.runAndWait()
