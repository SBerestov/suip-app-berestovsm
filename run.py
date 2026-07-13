from backend import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() in ('1', 'true')
    app.run(host='localhost', port=port, debug=debug)
