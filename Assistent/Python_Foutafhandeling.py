import speech_recognition as sr, pyttsx3
from google import genai

# Verbinding maken met Gemini API
client = genai.Client(api_key="AIzaSyBXM8GQFgTIlQDrlVzZoCFf991oQRoH4Q8")
# Spraakherkenner aanmaken
r = sr.Recognizer()
# Text-to-speech engine opstarten
tts = pyttsx3.init()

# Setup voor de stem in het Engels.
tts.setProperty(
    "voice",
    "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Speech\\Voices\\Tokens\\TTS_MS_EN-US_ZIRA_11.0",
)

# Microfoon openen
with sr.Microphone() as mic:
    # Kalibreer op achtergrondgeluid gedurende 1 seconde
    r.adjust_for_ambient_noise(mic, duration=1)
    print("Speak...")
    try:
        # Neem audio op en stuur naar Google voor herkenning
        spoken = r.recognize_google(r.listen(mic))
    except sr.UnknownValueError:
        # Google kon de spraak niet begrijpen
        print("Kon je stem niet verstaan, probeer opnieuw.")
        exit()
    except sr.RequestError:
        # Geen internetverbinding met Google
        print("Geen verbinding met Google Speech API.")
        exit()

# Stuur de herkende tekst naar Gemini en ontvang een antwoord
resp = client.models.generate_content(model="gemini-2.5-flash", contents=spoken)
# Haal de tekst uit het antwoord en verwijder onnodige spaties
reply = resp.text.strip()
print("Assistant : ", reply)
# Zet het antwoord klaar en spreek het uit
tts.say(reply)
tts.runAndWait()
