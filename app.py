from bson import ObjectId
from flask import Flask, render_template, redirect, url_for, request, jsonify, session
from flask_pymongo import pymongo
import requests, json
import hashlib

app = Flask(__name__)
app.secret_key = 'mysecretkey'

#mongodb+srv://user:VqA9R7wCCekChPBd@projektskarte.jjmneth.mongodb.net/?retryWrites=true&w=majority

client = pymongo.MongoClient("mongodb+srv://user:VqA9R7wCCekChPBd@projektskarte.jjmneth.mongodb.net/?retryWrites=true&w=majority")
db = client.webdata

points = db.pointinfo
users = db.userdata
types = db.pointtypes

@app.route('/')
def home():
    result = list(points.find().sort('postdate', +1))
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
    a = json.loads(response.text)
    count = 0
    for obj in a['documents']:
        if '_id' in obj:
            count += 1
    if 'username' in session:
        username = session['username']
        return render_template('home.html', a = a, count = count, username=username, result=result, active_page='home.html')
    else:
        return render_template('home.html', a = a, count = count, result=result, active_page='home.html')

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
        hash_object = hashlib.sha256(password.encode('utf-8'))
        hash_hex = hash_object.hexdigest()
        print(hash_hex)
        if users.find_one({'username': username}):
            return 'Username already taken'
        if (password != repeatpassword):
            return 'Passwords does not match'
        users.insert_one({'name': name,'surname': surname,'dateofbirth': dateofbirth, 'username': username, 'password': hash_hex})
        return 'User registered successfully <a href="/">Homepage</a> <a href="/login">Login</a>'
    return render_template('register.html')

@app.route('/about')
def about():
    if 'username' in session:
        username = session['username']
        return render_template('about.html', username = username)
    else:
        return render_template('about.html')

@app.route('/release')
def release():
    if 'username' in session:
        username = session['username']
        return render_template('release.html', username = username)
    else:
        return render_template('release.html')    

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'username' in session:
        return redirect(url_for('home'))
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hash_object = hashlib.sha256(password.encode('utf-8'))
        hash_hex = hash_object.hexdigest()
        user = users.find_one({'username': username})
        if user:
            if hash_hex == user['password']:
                session['username'] = user['username']
                return redirect(url_for('home'))
            else:
                error = 'Invalid name or password. Please try again.'
                return render_template('login.html', error=error)
        error = 'Invalid name or password. Please try again.'
        return render_template('login.html', error=error)
    else:
        return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

@app.route('/get_data_count')
def get_data_count():
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
    count = 0
    for obj in data['documents']:
        if '_id' in obj:
            count += 1
    return jsonify(count=count)

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
    allTypes = types.find()
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
        return render_template('add_point.html', notification=notification, types = allTypes, username = username)
    return render_template('add_point.html', types = allTypes, username = username)

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
    allTypes = types.find()
    point = points.find_one({'_id': ObjectId(point_id)})
    if 'username' in session:
        username = session['username']
        render_template('edit_point.html', point=point, username = username, types = allTypes)
    if request.method == 'POST':
        points.update_one({'_id': ObjectId(point_id)}, {'$set': {
            'name': request.form['name'],
            'description': request.form['description'],
            'latitude': request.form['latitude'],
            'longitude': request.form['longitude'],
            'postdate': request.form['post_date'],
            'removedate': request.form['remove_date'],
            'type': request.form['type'],
            'author': username
        }})

        return redirect(url_for('home'))
    else:
        return render_template('edit_point.html', point=point, types = allTypes, username = username,)

@app.route('/get_point_types',  methods=['GET', 'POST'])
def get_type():
    url = "https://eu-central-1.aws.data.mongodb-api.com/app/data-ywrin/endpoint/data/v1/action/find"
    payload = json.dumps({
        "collection": "pointtypes",
        "database": "webdata",
        "dataSource": "ProjektsKarte",
        "projection": {
            "_id": 1,
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

@app.route('/profile/<username>', methods=['GET', 'POST'])
def profile(username):
    if 'username' in session:
        username = session['username']
        profile = users.find_one({'username': username})
        return render_template('profile.html', profile=profile, username=username)
    else:
        return redirect(url_for('home'))

@app.route('/delete-user/<username>', methods=['DELETE','GET', 'POST'])
def delete_user(username):
    if 'username' in session:
        # Delete user from users collection
        result = users.delete_one({'username': username})
        if result.deleted_count == 0:
            return {'message': 'User not found'}, 404

        # Delete all points with user's username from points collection
        points.delete_many({'author': username})
        session.pop('username', None)
        return redirect(url_for('home'))
        
    else:
        return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(port=8080)

