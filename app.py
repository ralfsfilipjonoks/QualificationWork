from flask import Flask, render_template, redirect, url_for, request, jsonify, session
from flask_pymongo import pymongo
from wtforms import Form, StringField, PasswordField, validators
from werkzeug.security import generate_password_hash, check_password_hash
import requests, json

app = Flask(__name__)

#mongodb+srv://user:VqA9R7wCCekChPBd@projektskarte.jjmneth.mongodb.net/?retryWrites=true&w=majority

client = pymongo.MongoClient("mongodb+srv://user:VqA9R7wCCekChPBd@projektskarte.jjmneth.mongodb.net/?retryWrites=true&w=majority")
db = client.webdata

points = db.pointinfo
users = db.userdata

# WORKS (Insert point into db)
# point = {"latitude": 30.5343, 
# "longitude": 56.2314, 
# "name": "Random point", 
# "description":"New post made from VS code!", 
# "postdate": '2023-02-17T00:00:00.000+00:00', 
# "removedate":'2023-03-17T00:00:00.000+00:00', 
# "type": "Warning"}
# points.insert_one(point)

@app.route('/')
def home():
    url = "https://eu-central-1.aws.data.mongodb-api.com/app/data-ywrin/endpoint/data/v1/action/find"
    payload = json.dumps({
        "collection": "pointinfo",
        "database": "webdata",
        "dataSource": "ProjektsKarte",
        "projection": {
            "_id": 1,
            "latitude": 1,
            "longitude": 1,
            "name": 1,
            "description": 1,
            "postdate": 1,
            "removedate": 1,
        }
    })
    headers = {
    'Content-Type': 'application/ejson',
    'Access-Control-Request-Headers': '*',
    'api-key': "6des2LGmUnOVhxGKcYBySSZhA43c2s58ThSQbe8DQYYtR3t9UHMii9d1Oftvj0Z1", 
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    a = json.loads(response.text)
    count = 0
    for obj in a['documents']:
        if '_id' in obj:
            count += 1
    return render_template('home.html', a = a, count = count)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        password = request.form['password']
        repeatpassword = request.form['repeatpassword']
        if users.find_one({'name': name}):
            return 'Name already taken'
        if (password != repeatpassword):
            return 'Password does not match'
        users.insert_one({'name': name, 'password': password})
        return 'User registered successfully'
    return render_template('register.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/get_data')
def get_data():
    url = "https://eu-central-1.aws.data.mongodb-api.com/app/data-ywrin/endpoint/data/v1/action/find"
    payload = json.dumps({
        "collection": "pointinfo",
        "database": "webdata",
        "dataSource": "ProjektsKarte",
        "projection": {
            "_id": 1,
            "latitude": 1,
            "longitude": 1,
            "name": 1,
            "description": 1,
            "postdate": 1,
            "removedate": 1,
            "type": 1,
        }
    })
    headers = {
    'Content-Type': 'application/ejson',
    'Access-Control-Request-Headers': '*',
    'api-key': "6des2LGmUnOVhxGKcYBySSZhA43c2s58ThSQbe8DQYYtR3t9UHMii9d1Oftvj0Z1", 
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    data = json.loads(response.text)
    return jsonify(data)

if __name__ == '__main__':
    app.run()

