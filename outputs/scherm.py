import tkinter as tk # importeren library voor GUI

root = tk.Tk() # venster aanmaken
root.title("Schermtest") # titel venster
root.attributes("-fullscreen", True) # venster fullscreen

label = tk.Label(
    root,
    text="SCHERM WERKT",
    font=("Arial", 60),
    bg="black",
    fg="white"
) # tekst aanmaken en kleuren instellen
label.pack(expand=True, fill="both") # tekst tonen

root.bind("<Escape>", lambda e: root.destroy()) # mogelijkheid venster sluiten met ESC

root.mainloop() # programma laten draaien