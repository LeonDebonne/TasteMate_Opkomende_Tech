import asyncio
import edge_tts
import os

text = "Welkom bij uw slimme koelkast!"


async def main():
    voice = "nl-NL-FennaNeural"  # Nederlandse vrouwelijke stem (zeer natuurlijk)
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save("output.mp3")


asyncio.run(main())

os.startfile("output.mp3")  # speelt bestand af.
