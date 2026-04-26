import pyttsx3

tts = pyttsx3.init()
for voice in tts.getProperty("voices"):
    print(voice.id)
    print(voice.name)
    print()
