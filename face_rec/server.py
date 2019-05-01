# based on https://github.com/ageitgey/face_recognition/blob/master/examples/web_service_example.py

# prereqs
# pip3 install face_recognition flask
import face_recognition
import json
import numpy as np
from flask import Flask, jsonify, request, redirect, Response
from flask_cors import CORS

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# encoded_images = {
#     # "$passport_num": "encoded image"
# }

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
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file and allowed_file(file.filename):
            # The image file seems valid! Detect faces and return the result.
            user_image = face_recognition.load_image_file(file)
            encoded_images[passport_num] = face_recognition.face_encodings(
                user_image)[0]
            print(encoded_images)
            save_images()
            return Response("{'message':'new face encoded for passport" +
                            passport_num + "'}",
                            status=201,
                            mimetype='application/json')
            #
            # return detect_faces_in_image(file)

    # If no valid image file was uploaded, show the file upload form:
    return Response(
        "{'message':'invalid request, please confirm posted image is valid'}",
        status=400,
        mimetype='application/json')


threshold = 0.6  # the lower the number, the more strict comparison


# https://github.com/ageitgey/face_recognition/blob/master/examples/face_distance.py#L3:#L11
@app.route('/compare/<passport_num>', methods=['POST'])
def compare_image(passport_num):
    # Check if a valid image file was uploaded
    if request.method == 'POST':
        # if 'file' not in request.files:
        #     return redirect(request.url)
        print(dir(request))
        print(request.data)
        file = request.files['file']
        # if file.filename == '':
        #     return redirect(request.url)
        if file and allowed_file(file.filename):
            print("comparing faces")
            # The image file seems valid! Detect faces and return the result.
            user_image = face_recognition.load_image_file(file)
            encoded_user_image = face_recognition.face_encodings(user_image)[0]
            face_distance = face_recognition.face_distance(
                [encoded_images[passport_num]], encoded_user_image)
            print("face_distance")
            print(face_distance)
            if face_distance < threshold:
                res = Response("{'message':'faces match'}",
                                status=200,
                                mimetype='application/json')
                res.headers.add('Access-Control-Allow-Origin', '*')
                return res
            else:
                res = Response("{'message':'faces do not match'}",
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
    # If no valid image file was uploaded, show the file upload form:
    # return '''
    # <!doctype html>
    # <title>Is this a picture of Obama?</title>
    # <h1>Upload a picture and see if it's a picture of Obama!</h1>
    # <form method="POST" enctype="multipart/form-data">
    #   <input type="file" name="file">
    #   <input type="submit" value="Upload">
    # </form>
    # '''

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9000) #, debug=True)
