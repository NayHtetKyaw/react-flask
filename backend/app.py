from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("config/firebase-key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
todos_ref = db.collection('todos')

# Routes


@app.route("/")
def home():
    return jsonify({"message": "HOME"})


@app.route("/api/todos", methods=["GET"])
def get_todos():
    todos = []
    for doc in todos_ref.stream():
        todo = doc.to_dict()
        todo['id'] = doc.id
        todos.append(todo)
    return jsonify(todos)


@app.route("/api/todos", methods=["POST"])
def add_todo():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    new_todo = request.get_json()

    if not new_todo or not isinstance(new_todo, dict):
        return jsonify({"error": "Invalid todo data"}), 400

    doc_ref = todos_ref.document()  # Auto-generate ID

    doc_ref.set(new_todo)

    new_todo["id"] = doc_ref.id

    return jsonify(new_todo), 201


@app.route("/api/todos/<todo_id>", methods=["PATCH"])
def update_todo(todo_id):
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    update_data = request.get_json()

    if not update_data or not isinstance(update_data, dict):
        return jsonify({"error": "Invalid update data"}), 400

    doc_ref = todos_ref.document(todo_id)

    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({"error": "Todo not found"}), 404

    doc_ref.update(update_data)

    updated_doc = doc_ref.get()
    updated_todo = updated_doc.to_dict()
    updated_todo["id"] = updated_doc.id

    return jsonify(updated_todo)


@app.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    doc_ref = todos_ref.document(todo_id)

    # Check if document exists
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({"error": "Todo not found"}), 404

    doc_ref.delete()

    return jsonify({"message": "Todo deleted successfully", "id": todo_id})


if __name__ == "__main__":
    app.run(debug=True)
