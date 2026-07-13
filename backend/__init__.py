import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from .routes.api import api_bp

def create_app():
    static_folder = os.path.join(os.path.dirname(__file__), "../frontend/dist")
    app = Flask(__name__, static_folder=static_folder, static_url_path="/")
    app.config.from_object(Config)

    FRONTEND_URL = os.getenv('FRONTEND_URL')
    if FRONTEND_URL:
        CORS(app, resources={r"/api/*": {"origins": FRONTEND_URL}})
    else:
        CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_react(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    return app
