import os
import boto3
import urllib.parse 
import socket
from datetime import timedelta

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask import Flask, request, jsonify
from flask_cors import CORS

from botocore.exceptions import ClientError
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

username = urllib.parse.quote_plus(os.getenv("DB_USERNAME", ""))
dbpassword = urllib.parse.quote_plus(os.getenv("DB_PASSWORD", ""))
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT", 3306)
database = os.getenv("DB_NAME")
db_type = os.getenv("DB_TYPE")

app.config['SQLALCHEMY_DATABASE_URI'] = f"{db_type}://{username}:{dbpassword}@{host}:{port}/{database}"
app.config['SECRET_KEY'] = 'supersecret'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('todos', lazy=True))

with app.app_context():
    db.create_all()

@app.route('/ping')
def ping():
    def get_private_ip():
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
        except Exception as e:
            ip = f"Erreur: {str(e)}"
        finally:
            s.close()
        return ip

    private_ip = get_private_ip()

    return jsonify({
        "message": "pong",
        "private_ip": private_ip
    })

@app.route("/register", methods=["POST"])
def register():
    print("hello I am in register")
    data = request.json
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"msg": "Username et mot de passe requis"}), 400
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"msg": "Utilisateur déjà existant"}), 400
    hashed_pw = generate_password_hash(data["password"])
    user = User(username=data["username"], password=hashed_pw)
    db.session.add(user)
    db.session.commit()
    access_token = create_access_token(identity=str(user.id))
    return jsonify(access_token=access_token)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"msg": "Username et mot de passe requis"}), 400
    user = User.query.filter_by(username=data["username"]).first()
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"msg": "Identifiants invalides"}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify(access_token=access_token)

@app.route("/todos", methods=["GET"])
@jwt_required()
def get_todos():
    user_id = get_jwt_identity()
    todos = Todo.query.filter_by(user_id=user_id).all()
    return jsonify([{"id": t.id, "title": t.title, "completed": t.completed} for t in todos])


# Créer un todo
@app.route("/todos", methods=["POST"])
@jwt_required()
def create_todo():
    user_id = get_jwt_identity()
    data = request.json
    if not data or not data.get("title"):
        return jsonify({"msg": "Le champ title est requis"}), 400
    todo = Todo(title=data["title"], user_id=user_id, completed=False)
    db.session.add(todo)
    db.session.commit()
    return jsonify({"id": todo.id, "title": todo.title, "completed": todo.completed}), 201

# Mettre à jour un todo
@app.route("/todos/<int:todo_id>", methods=["PUT"])
@jwt_required()
def update_todo(todo_id):
    user_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
    if not todo:
        return jsonify({"msg": "Todo non trouvé"}), 404
    data = request.json
    if "title" in data:
        todo.title = data["title"]
    if "completed" in data:
        todo.completed = data["completed"]
    db.session.commit()
    return jsonify({"id": todo.id, "title": todo.title, "completed": todo.completed})

# Supprimer un todo
@app.route("/todos/<int:todo_id>", methods=["DELETE"])
@jwt_required()
def delete_todo(todo_id):
    user_id = get_jwt_identity()
    todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
    if not todo:
        return jsonify({"msg": "Todo non trouvé"}), 404
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"msg": "Todo supprimé"}), 200

if __name__ == "__main__":
    # créer la DB si elle n'existe pas
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
