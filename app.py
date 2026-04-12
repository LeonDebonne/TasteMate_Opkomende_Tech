from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Mijn eerste Flask server werkt! 🎉"

if __name__ == "__main__":
    app.run(debug=True)