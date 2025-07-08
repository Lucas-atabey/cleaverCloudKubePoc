from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/ping')
def ping():
    return jsonify({"message": "pong"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
