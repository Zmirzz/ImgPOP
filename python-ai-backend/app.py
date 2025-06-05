from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image
import io
from ai_tools import expand_image

app = Flask(__name__)
CORS(app) # Initialize CORS with default settings (allow all origins)
# For more specific control, you might use:
# CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}) 
# if your Vite server is always on that port during development.

@app.route('/ping', methods=['GET'])
def ping():
    """Health check endpoint."""
    return jsonify({"message": "Pong! AI Backend is alive."}), 200

@app.route('/resize-image', methods=['POST'])
def resize_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    
    try:
        new_width = int(request.form.get('width'))
        new_height = int(request.form.get('height'))
        expand = request.form.get('expand', 'false').lower() == 'true'
    except (TypeError, ValueError) as e:
        return jsonify({"error": "Invalid width or height provided. Must be integers."}), 400

    if new_width <= 0 or new_height <= 0:
        return jsonify({"error": "Width and height must be positive integers."}), 400

    try:
        img = Image.open(file.stream)
        original_format = img.format or 'PNG'

        if expand and (new_width > img.width or new_height > img.height):
            try:
                img = expand_image(img, new_width, new_height)
            except Exception as exp_err:
                return jsonify({"error": str(exp_err)}), 500

        resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        byte_arr = io.BytesIO()
        # Determine save format, default to PNG if original format is problematic (like None for some BMPs)
        save_format = original_format if original_format in ['PNG', 'JPEG', 'WEBP'] else 'PNG'
        if save_format == 'JPEG': # Ensure RGB for JPEG
            resized_img = resized_img.convert('RGB')
        
        resized_img.save(byte_arr, format=save_format)
        byte_arr.seek(0)
        
        mime_type = Image.MIME.get(save_format, 'image/png')

        return send_file(byte_arr, mimetype=mime_type)

    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

if __name__ == '__main__':
    # Note: For development, Flask's built-in server is fine.
    # For production, consider a more robust WSGI server like Gunicorn.
    app.run(host='0.0.0.0', port=5001, debug=True) 
