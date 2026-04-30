from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATA_FILE = "inventory.json"


def load_inventory():
    if not os.path.exists(DATA_FILE):
        return {
            "categories": [],
            "products": []
        }

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_inventory(data):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


@app.route("/inventory", methods=["GET"])
def get_inventory():
    return jsonify(load_inventory())


@app.route("/products", methods=["POST"])
def add_product():
    data = load_inventory()
    product = request.json

    new_product = {
        "id": str(datetime.now().timestamp()),
        "name": product["name"],
        "quantity": product["quantity"],
        "categoryId": product.get("categoryId", ""),
        "expiryDate": product["expiryDate"],
        "addedAt": datetime.now().strftime("%Y-%m-%d")
    }

    data["products"].append(new_product)
    save_inventory(data)

    return jsonify(new_product)

@app.route("/categories", methods=["POST"])
def add_category():
    data = load_inventory()
    category = request.json

    new_category = {
        "id": category["id"],
        "name": category["name"]
    }

    data["categories"].append(new_category)
    save_inventory(data)

    return jsonify(new_category)


@app.route("/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    data = load_inventory()

    data["products"] = [
        product for product in data["products"]
        if product["id"] != product_id
    ]

    save_inventory(data)

    return jsonify({"message": "Product verwijderd"})

def empty_inventory():
    return {
        "categories": [],
        "products": [],
        "fridgeZones": {
            "vriezer": [None, None, None],
            "koelvakBoven": [None, None, None],
            "koelvakOnder": [None, None, None],
            "groentelade": [None, None, None],
            "deur": [None, None, None, None]
        },
        "zoneOrder": ["vriezer", "koelvakBoven", "koelvakOnder", "groentelade", "deur"],
        "zoneTypes": {
            "vriezer": "kast",
            "koelvakBoven": "kast",
            "koelvakOnder": "kast",
            "groentelade": "kast",
            "deur": "deur"
        },
        "zoneNames": {
            "vriezer": "Vriezer",
            "koelvakBoven": "Koelvak Boven",
            "koelvakOnder": "Koelvak Onder",
            "groentelade": "Groentelade",
            "deur": "Deur"
        }
    }

@app.route("/layout", methods=["PUT"])
def update_layout():
    data = load_inventory()
    body = request.json

    data["fridgeZones"] = body.get("fridgeZones", data.get("fridgeZones", {}))
    data["zoneOrder"] = body.get("zoneOrder", data.get("zoneOrder", []))
    data["zoneTypes"] = body.get("zoneTypes", data.get("zoneTypes", {}))
    data["zoneNames"] = body.get("zoneNames", data.get("zoneNames", {}))

    save_inventory(data)

    return jsonify({
        "message": "Layout opgeslagen"
    })

@app.route("/reset", methods=["POST"])
def reset_inventory():
    data = {
        "products": [],
        "categories": [],
        "fridgeZones": {},
        "zoneOrder": [],
        "zoneTypes": {},
        "zoneNames": {}
    }

    with open("inventory.json", "w") as f:
        json.dump(data, f, indent=2)

    return {"status": "reset"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)