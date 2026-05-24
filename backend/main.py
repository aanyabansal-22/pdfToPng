from app import create_app
from blueprints.merge_pdf import merge_pdf_bp
import os

app = create_app()

app.register_blueprint(merge_pdf_bp)  # ← moved AFTER app is created

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)