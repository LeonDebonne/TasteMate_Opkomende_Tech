import pyttsx3

tts = pyttsx3.init()
voices = tts.getProperty("voices")
for voice in voices:
    print(voice.id)
    print(voice.name)
