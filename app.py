from bson import ObjectId
from flask import Flask, render_template, redirect, url_for, request, jsonify, session
from flask_pymongo import pymongo
from wtforms import Form, StringField, PasswordField, validators
from werkzeug.security import generate_password_hash, check_password_hash
import requests, json

app = Flask(__name__)
app.secret_key = 'mysecretkey'

#mongodb+srv://user:VqA9R7wCCekChPBd@projektskarte.jjmneth.mongodb.net/?retryWrites=true&w=majority

client = pymongo.MongoClient("mongodb+srv://user:VqA9R7wCCekChPBd@projektskarte.jjmneth.mongodb.net/?retryWrites=true&w=majority")
db = client.webdata

points = db.pointinfo
users = db.userdata

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
    if 'username' in session:
        username = session['username']
        return render_template('home.html', a = a, count = count, username=username)
    else:
        return render_template('home.html', a = a, count = count)

@app.route('/userheadinfo')
def userheadinfo():
    if 'username' in session:
        username = session['username']
        return username

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'username' in session:
        return redirect(url_for('home'))
    if request.method == 'POST':
        name = request.form['name']
        surname = request.form['surname']
        dateofbirth = request.form['dateofbirth']
        username = request.form['username']
        password = request.form['password']
        repeatpassword = request.form['repeatpassword']
        if users.find_one({'username': username}):
            return 'Username already taken'
        if (password != repeatpassword):
            return 'Passwords does not match'
        users.insert_one({'name': name,'surname': surname,'dateofbirth': dateofbirth, 'username': username, 'password': password})
        return 'User registered successfully'
    return render_template('register.html')

@app.route('/about')
def about():
    if 'username' in session:
        username = session['username']
        return render_template('about.html', username = username)
    else:
        return render_template('about.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'username' in session:
        return redirect(url_for('home'))
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = users.find_one({'username': username, 'password': password})
        if user:
            session['username'] = user['username']
            return redirect(url_for('home'))
        else:
            error = 'Invalid name or password. Please try again.'
            return render_template('login.html', error=error)
    else:
        return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

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
            "author": 1
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

@app.route('/add_point', methods=['GET','POST'])
def add_point():
    if 'username' in session:
        username = session['username']
    else:
        return redirect(url_for('home'))
    if request.method == 'POST':
        pointname = request.form['name']
        latitude = float(request.form['latitude'])
        longitude = float(request.form['longitude'])
        description = request.form['description']
        postdate = request.form['postdate']
        removedate = request.form.get('removedate')
        pointtype = request.form['type']
        user = username

        points.insert_one({'latitude': latitude, 'longitude': longitude, 'name': pointname,'description': description,'postdate': postdate,'removedate': removedate,'type': pointtype,'author': user})
        notification = 'Point added sucessfully!'
        return render_template('add_point.html', notification=notification)
    return render_template('add_point.html')

@app.route('/user_points', methods=['GET', 'POST'])
def userspoints():
    if 'username' in session:
        username = session['username']
        render_template('userpoints.html', username = username)
    else:
        return redirect(url_for('home'))
    result = list(points.find({'author': username}))
    return render_template('userpoints.html', result = result, username = username)

@app.route('/delete_point/<point_id>', methods=['POST'])
def delete_point(point_id):
    if 'username' in session:
        points.delete_one({'_id': ObjectId(point_id)})
        return redirect(url_for('home'))
    else:
        return redirect(url_for('home'))

@app.route('/edit_point/<point_id>', methods=['GET', 'POST'])
def edit_point(point_id):
    point = points.find_one({'_id': ObjectId(point_id)})
    if 'username' in session:
        username = session['username']
        render_template('edit_point.html', point=point, username = username)
    if request.method == 'POST':
        points.update_one({'_id': ObjectId(point_id)}, {'$set': {
            'name': request.form['name'],
            'latitude': request.form['latitude'],
            'longitude': request.form['longitude'],
            'postdate': request.form['post_date'],
            'removedate': request.form['remove_date'],
            'type': request.form['type'],
            'author': username
        }})

        return redirect(url_for('home'))
    else:
        return render_template('edit_point.html', point=point)


if __name__ == '__main__':
    app.run()

