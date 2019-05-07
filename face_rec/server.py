# based on https://github.com/ageitgey/face_recognition/blob/master/examples/web_service_example.py

# prereqs
# pip3 install face_recognition flask
import face_recognition
import json
import numpy as np
from flask import Flask, jsonify, request, redirect, Response
from flask_cors import CORS
import io
import base64

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# load cached file on boot
print("Loading cached images")
try:
    f = open('./encoded_images.json', 'r')
    encoded_images = json.loads(f.read())
    for passport_num in encoded_images:
        np_result = np.asarray(encoded_images[passport_num])
        encoded_images[passport_num] = np_result
    print("encoded images loaded from cache")
    f.close()
except:
    print("no valid json file found, initializing empty encoded images dict")
    encoded_images = {}


def save_images():
    file = open('./encoded_images.json', 'w')
    tmp = {}
    for passport_num in encoded_images:
        tmp[passport_num] = encoded_images[passport_num].tolist()
        # have to convert numpy array to list so we can save as json
        # tmp[passport] = image.tolist()
    file.write(json.dumps(tmp))
    file.close()


@app.route('/register/<passport_num>', methods=['POST'])
def register_image(passport_num):
    # Check if a valid image file was uploaded
    print("request")
    print(request)
    print(request.files)
    if request.method == 'POST':
        if request.data:
            print("request payload received")
            image_str = request.data.decode("utf-8").split(',')[1]
            decoded_image = face_recognition.load_image_file(io.BytesIO(base64.b64decode(image_str)))
            encoded_user_image = face_recognition.face_encodings(decoded_image)[0]
        elif request.files['file'] and allowed_file(file.filename):
            file = request.files['file']
            # The image file seems valid! Detect faces and return the result.
            user_image = face_recognition.load_image_file(file)
            encoded_user_image = face_recognition.face_encodings(user_image)[0]
        print(encoded_images)
        save_images()
        return Response("{\"message\":\"new passport encoded\"}",
                        status=201,
                        mimetype='application/json')
            #
            # return detect_faces_in_image(file)
    # If no valid image file was uploaded, show the file upload form:
    return Response(
        "{\"message\":\"invalid request, please confirm posted image is valid\"}",
        status=400,
        mimetype='application/json')


threshold = 0.5  # the lower the number, the more strict comparison


# https://github.com/ageitgey/face_recognition/blob/master/examples/face_distance.py#L3:#L11
@app.route('/compare/<passport_num>', methods=['POST'])
def compare_image(passport_num):
    # Check if a valid image file was uploaded
    if request.method == 'POST':
        if request.data:
            print("request payload received")
            image_str = request.data.decode("utf-8").split(',')[1]
            decoded_image = face_recognition.load_image_file(io.BytesIO(base64.b64decode(image_str)))
            encoded_user_image = face_recognition.face_encodings(decoded_image)[0]
        elif request.files['file'] and allowed_file(file.filename):
            file = request.files['file']
            # The image file seems valid! Detect faces and return the result.
            user_image = face_recognition.load_image_file(file)
            encoded_user_image = face_recognition.face_encodings(user_image)[0]
        print("comparing faces")
        face_distance = face_recognition.face_distance(
            [encoded_images[passport_num]], encoded_user_image)
        print("face_distance")
        print(face_distance)
        if face_distance < threshold:
            res = Response("{\"message\":\"faces match\"}",
                            status=200,
                            mimetype='application/json')
            res.headers.add('Access-Control-Allow-Origin', '*')
            return res
        else:
            res = Response("{\"message\":\"faces do not match\"}",
                            status=406,
                            mimetype='application/json')
            res.headers.add('Access-Control-Allow-Origin', '*')
            return res
    res = Response(
        "{'message':'invalid request, please confirm posted image is valid'}",
        status=400,
        mimetype='application/json')
    res.headers.add('Access-Control-Allow-Origin', '*')
    return res

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9000) #, debug=True)
