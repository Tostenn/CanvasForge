from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_session import Session
from g4f.client import Client
from g4f import models
from prompt import PROMPT
from os.path import exists, join, dirname, abspath
from json import load, dump
from uuid import uuid4

from webview import create_window, start

app = Flask(__name__, template_folder='templates', static_folder='static')
# Configuration de la session
app.secret_key = "supersecretkey"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Fichiers JSON (base de données simulée)
BASE_DIR = dirname(abspath(__file__))
USERS_FILE = join(BASE_DIR, "static", "data", "users.json")
CANVAS_FILE = join(BASE_DIR, "static", "data", "canvas.json")


model = models.gemini_1_5_flash

client = Client()

@app.route('/')
def index():
    if "user_id" in session:
        return render_template('index.html', username=session["username"])
    return redirect(url_for("login"))

# route api for the l'ia
@app.route('/api/canvas/generate', methods=['POST'])
def api():
    
    if "user_id" in session:
        data = request.get_json()
        projet = data['projet']
        if not data: return jsonify({
                'response': data
            })

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content":PROMPT
                },
                {
                    "role": "user",
                    "content":f'Projet à Analyser : {projet}'
                }
            ],
        )
        
        response = response.choices[0].message.content
        
        if 'revenu' in response:
            # Enregistrer le canvas généré
            canvases = read_json(CANVAS_FILE)
            canvas_id = str(uuid4())
            new_canvas = {
                "id": canvas_id,
                "name": projet,
                "canvas": response,
                "user_id": session["user_id"]
            }
            canvases.append(new_canvas)
            write_json(CANVAS_FILE, canvases)
            
        return jsonify({
            'response': response,
            'canvas_id': canvas_id
        })
        
    return jsonify({
            'response': 'Vous devez vous connecter pour accéder à cette ressource'
        })

    
    # Load users from a JSON file


# Fonction pour lire/écrire le fichier JSON
def read_json(filename):
    if not exists(filename):
        with open(filename, "w") as f:
            dump([], f)  # Initialise avec une liste vide
    with open(filename, "r") as f:
        return load(f)

def write_json(filename, data):
    with open(filename, "w") as f:
        dump(data, f, indent=4)


# Route Inscription
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        users = read_json(USERS_FILE)

        # Vérifier si l'utilisateur existe déjà
        if any(user["username"] == username for user in users):
            flash("Nom d'utilisateur déjà pris!", "danger")
            return redirect(url_for("register"))

        # Créer un nouvel utilisateur avec un ID unique
        user_id = str(uuid4())
        users.append({"id": user_id, "username": username, "password": password})
        write_json(USERS_FILE, users)

        flash("Compte créé avec succès! Connectez-vous.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")

# Route Connexion
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        users = read_json(USERS_FILE)

        # Vérifier les identifiants
        user = next((u for u in users if u["username"] == username and u["password"] == password), None)

        if user:
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            flash("Connexion réussie!", "success")
            return redirect('/')
        else:
            flash("Identifiants incorrects.", "danger")

    return render_template("login.html")

# Route Déconnexion
@app.route("/logout")
def logout():
    session.pop("user_id", None)
    session.pop("username", None)
    flash("Vous avez été déconnecté.", "info")
    return redirect(url_for("login"))

# Route API : Création d'un Canvas
@app.route("/api/canvas", methods=["POST"])
def create_canvas():
    if "user_id" not in session:
        return jsonify({"error": "Non autorisé"}), 403

    data = request.get_json()
    if not data or "canvas_name" not in data or "canvas" not in data:
        return jsonify({"error": "Données invalides"}), 400

    canvases = read_json(CANVAS_FILE)
    canvas_id = str(uuid4())

    new_canvas = {
        "id": canvas_id,
        "name": data["canvas_name"],
        "canvas": data["canvas"],
        "user_id": session["user_id"]
    }
    
    canvases.append(new_canvas)
    write_json(CANVAS_FILE, canvases)

    return jsonify({"message": "Canvas créé avec succès!", "canvas": new_canvas}), 201

# Route pour récupérer les canvas d'un utilisateur (API)
@app.route("/api/canvas", methods=["GET"])
def get_canvas():
    if "user_id" not in session:
        return jsonify({"error": "Non autorisé"}), 403

    canvases = read_json(CANVAS_FILE)
    user_canvases = [
        {key: value for key, value in c.items() if not key in ["canvas", 'user_id']}
        for c in canvases if c["user_id"] == session["user_id"]
    ]
    
    # user_canvases.reverse()

    return jsonify(user_canvases)

# Route pour récupérer les canvas d'un utilisateur (API)
@app.route("/api/canvas/<id>", methods=["GET"])
def get_canvas_by_id(id):
    if "user_id" not in session:
        return jsonify({"error": "Non autorisé"}), 403

    canvases = read_json(CANVAS_FILE)
    canvas = next((c for c in canvases if c["id"] == id and c["user_id"] == session["user_id"]), None)

    if canvas is None:
        return jsonify({"error": "Canvas non trouvé"}), 404

    return jsonify({"canvas":canvas['canvas']})

# Route pour supprimer un canvas (API)
@app.route("/api/canvas/<id>", methods=["DELETE"])
def delete_canvas(id):
    if "user_id" not in session:
        return jsonify({"error": "Non autorisé"}), 403

    canvases = read_json(CANVAS_FILE)
    canvas = next((c for c in canvases if c["id"] == id and c["user_id"] == session["user_id"]), None)

    if canvas is None:
        return jsonify({"error": "Canvas non trouvé"}), 404

    canvases = [c for c in canvases if c["id"] != id]
    write_json(CANVAS_FILE, canvases)

    return jsonify({"message": "Canvas supprimé avec succès!"})

if __name__ == "__main__":
    create_window(
        'canva modele',
        app,
        width=1000,
        height=600,
        min_size=(1000, 600),
        confirm_close=True
    )
    
    start()
    
    # app.run(debug=True)

