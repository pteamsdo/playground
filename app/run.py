from flask import Flask
from api.routes import main_bp

def create_app():
    # Explicitly set template folder to the templates directory
    app = Flask(__name__, template_folder='templates')
    
    # Register the main blueprint (Routes)
    app.register_blueprint(main_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)