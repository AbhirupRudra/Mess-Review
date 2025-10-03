from flask import Flask, request, jsonify, send_from_directory
from functools import wraps
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os, json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static")
ADMIN_PASSWORD = os.getenv("ADMIN_PASS")

# ---------- Firebase Setup ----------
# The service account key is expected to be in a file named "serviceAccountKey.json"
# mounted into the container.
if not firebase_admin._apps:
    cred_dict = json.loads(os.getenv("FIREBASE_KEY"))
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------- Admin Auth ----------
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if not auth or auth != f"Bearer " + ADMIN_PASSWORD:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

# ---------- Routes ----------
@app.route("/")
def serve_student():
    return send_from_directory("static", "index.html")

@app.route("/admin")
def serve_admin():
    return send_from_directory("static", "admin.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

# Submit review (student)
@app.route("/submit_review", methods=["POST"])
def submit_review():
    data = request.json
    required = ["day", "meal", "overallRating", "items"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    today_str = datetime.now().strftime("%Y-%m-%d")

    # Save as structured JSON (no str())
    db.collection("reviews").add({
        "date": today_str,
        "day": data["day"],
        "meal": data["meal"],
        "overall_rating": data["overallRating"],
        "overall_feedback": data.get("overallFeedback", ""),
        "items": data["items"]
    })

    return jsonify({"message": "Review submitted successfully!"})

# Get reviews for specific day
@app.route("/get_reviews", methods=["GET"])
@admin_required
def get_reviews():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "Missing date parameter"}), 400

    docs = db.collection("reviews").where("date", "==", date).stream()
    reviews = []
    for doc in docs:
        r = doc.to_dict()
        r["id"] = doc.id
        reviews.append(r)
    return jsonify(reviews)

# ---------- Run ----------
if __name__ == "__main__":
    # This is for local development.
    # In production, use a proper WSGI server like gunicorn.
    # Example: gunicorn --bind 0.0.0.0:8000 backend:app
    app.run(debug=True, host="0.0.0.0", port=5000)
