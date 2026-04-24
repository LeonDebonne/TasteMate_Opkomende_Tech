import speech_recognition as sr, pyttsx3
from google import genai

from Config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)
r = sr.Recognizer()
tts = pyttsx3.init()

# Engelse stem instellen
for voice in tts.getProperty("voices"):
    if "english" in voice.name.lower() or "en_" in voice.id.lower():
        tts.setProperty("voice", voice.id)
        break

with sr.Microphone() as mic:
    r.adjust_for_ambient_noise(mic, duration=1)
    print("Speak...")
    try:
        spoken = r.recognize_google(r.listen(mic))
    except sr.UnknownValueError:
        print("Kon je stem niet verstaan, probeer opnieuw.")
        exit()
    except sr.RequestError:
        print("Geen verbinding met Google Speech API.")
        exit()

resp = client.models.generate_content(model="gemini-2.5-flash", contents=spoken)
reply = resp.text.strip()
print("Assistant : ", reply)
tts.say(reply)
tts.runAndWait()
