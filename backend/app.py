from flask import Flask, jsonify, url_for
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

VIDEO_DATA = {
    "id": "video001",
    "title": "My awesome samply video",
    "description": "a video",
    "price": 9.99,
    "filename": "241A7552.MP4",
    "purchased": False
}

@app.route('/api/message')
def get_message():
    return jsonify(message="Hello from Backend API!")

@app.route('/api/video_info')
def get_video_info():
    video_info_response = VIDEO_DATA.copy()

    try:
        video_info_response["video_url"] = url_for('static', filename=f'video/{VIDEO_DATA["filename"]}', _external=True)

    except Exception as e:
        print(f"Error generating URL for static file: {e}")
        video_info_response["video_url"] = None # Or some error indicator

    return jsonify(video_info_response)



if __name__ == '__main__':
    app.run(debug=True)