from bson import ObjectId
from flask import Flask, render_template, redirect, url_for, request, jsonify, session, flash
from flask_pymongo import pymongo
import requests, json, hashlib, secrets, random, os
from dotenv import load_dotenv
from datetime import datetime
from flask_mail import Mail, Message

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS')
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

app.secret_key = secrets.token_hex(16)

# Set session lifetime to 30 minutes
app.config['PERMANENT_SESSION_LIFETIME'] = 1800

client_for_users = pymongo.MongoClient(os.getenv('client_for_users'))
user_db = client_for_users.webdata

user_points = user_db.pointinfo
user_users = user_db.userdata
user_types = user_db.pointtypes
user_admin = user_db.adminuserdata
user_usettings = user_db.usersettings
user_point_report = user_db.pointreports

client = pymongo.MongoClient(os.getenv('client'))
db = client.webdata

points = db.pointinfo
users = db.userdata
types = db.pointtypes
admin = db.adminuserdata
usettings = db.usersettings
point_report = db.pointreports

mail = Mail(app)

# dictionary to store verification codes
verification_codes = {}

@app.route('/send-code', methods=['GET', 'POST'])
def send_code():
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_details = users.find_one({"_id": ObjectId(user_session_id)})
        if user_session_details['email'] != "":
            return redirect(url_for('home'))
        if request.method == 'POST':
            email = request.form['email']
            # generate random 6-digit code
            code = str(random.randint(100000, 999999))
            verification_codes[email] = code

            # send email with code
            msg = Message('Verification Code', recipients=[email])
            msg.body = f'Your verification code is {code}.'
            mail.send(msg)

            return redirect(url_for('enter_code'))
        return render_template('send_code.html') 
    else:
        return redirect(url_for('home'))

@app.route('/enter-code', methods=['GET', 'POST'])
def enter_code():
    if 'user_session' in session:
        user_session_id = session['user_session']
        if request.method == 'POST':
            email = request.form['email']
            code = request.form['code']
            if email in verification_codes and code == verification_codes[email]:
                # verification successful
                user_users.update_one({'_id': ObjectId(user_session_id)}, {'$set': {
                'email': request.form['email'],
            }})
                del verification_codes[email] # remove code from dictionary
                # return 'Verification successful!'
                return redirect(url_for('usersettings'))
            else:
                # verification failed
                return 'Verification code is incorrect. Please try again.'

        return render_template('enter_code.html')
    else:
        return redirect(url_for('home'))      

@app.route('/')
def home():
    today = datetime.utcnow()
    today = today.strftime("%Y-%m-%d")
    query = {"removedate": {"$lt": today}}
    documents_to_delete = points.find(query)
    for doc in documents_to_delete:
        user_points.delete_one({"_id": doc["_id"]})
    allTypes = types.find()
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
    'api-key': "EiN5yepFd4DIUfNDc3R6aU6OKia70VZ7FxrPv2ZQAWiA4B4ybVMA5t1pNmMMpz46", 
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    all_posts = json.loads(response.text)
    current_date = datetime.now().date()
    filtered_markers = [marker for marker in all_posts['documents'] if marker["postdate"] <= str(current_date)]
    upcoming_markers = [marker for marker in all_posts['documents'] if marker["postdate"] > str(current_date)]
    count = 0
    for obj in all_posts['documents']:
        if '_id' in obj:
            count += 1
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        return render_template('home.html', count = count, username = user_session_username['username'], upcoming = upcoming_markers,result=filtered_markers, active_page='home.html', allTypes=allTypes)
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        return render_template('home.html', count = count, admin = admin_session_username['username'], upcoming = upcoming_markers ,  result=filtered_markers, active_page='home.html', allTypes=allTypes)
    else:
        return render_template('home.html', count = count, upcoming = upcoming_markers, result=filtered_markers, active_page='home.html', allTypes=allTypes)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
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
        # Input field Validation
        # Checks if name isn't empty or bigger than 30 characters
        if (name == "" or len(name) > 30):
            notification = "Name can't be empty or bigger than 30 characters"
            return render_template('register.html', notification=notification)
        
        # Checks if surname ins't empty or bigger than 30 characters
        if (surname == "" or len(surname) > 30):
            notification = "Surname can't be empty or bigger than 30 characters"
            return render_template('register.html', notification=notification)

        # Checks if date isn't empty or after today
        today = datetime.utcnow()
        today = today.strftime("%Y-%m-%d")
        print("Today:"+today+ "date of birth:"+ dateofbirth)
        if (dateofbirth == "" or dateofbirth > today):
            notification = "Date of birth can't be empty or be after "+today+""
            return render_template('register.html', notification=notification)
        
        # Checks if username isn't empty or bigger than 30 characters
        if (username == "" or len(username) < 3 or len(username) > 30):
            notification = "Username can't be empty or less than 3 characters"
            return render_template('register.html', notification=notification)

        # User Validation
        # Duplicate user cehck
        if users.find_one({'username': username}) or admin.find_one({'username': username}):
            notification = 'Username already taken'
            return render_template('register.html', notification=notification)
        
        # Password Validation
        # Check if passwords match
        if (password != repeatpassword):
            notification = 'Passwords does not match'
            return render_template('register.html', notification=notification)
        
        #Checks password length
        if len(password) < 8 or len(password) > 50:
            notification = 'Password must be at least 8 characters long or longer than 50 characters' 
            return render_template('register.html', notification=notification)
        
        # Check for uppercase letter
        if not any(char.isupper() for char in password):
            notification = 'Password must contain at least one uppercase letter'
            return render_template('register.html', notification=notification)
        
        # Check for lowercase letter
        if not any(char.islower() for char in password):
            notification = 'Password must contain at least one lowercase letter'
            return render_template('register.html', notification=notification)
        
        # Check for number
        if not any(char.isdigit() for char in password):
            notification = 'Password must contain at least one number'
            return render_template('register.html', notification=notification)
        
        # Check for special character
        if not any(char in '!@#$%^&*()_+}{:;\'?/>,.<>[]-\\|' for char in password):
            notification = 'Password must contain at least one special character'
            return render_template('register.html', notification=notification)
        
        user_users.insert_one({'name': name,'surname': surname,'dateofbirth': dateofbirth, 'username': username, 'password': hash_hex, 'email': ''})
        user_usettings.insert_one({'username': username, 'settings': {'posts': []}})
        return render_template('redirect.html')
    return render_template('register.html')

@app.route('/about')
def about():
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = user_users.find_one({"_id": ObjectId(user_session_id)})
        return render_template('about.html', username = user_session_username['username'])
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = user_admin.find_one({"_id": ObjectId(admin_session_id)})
        return render_template('about.html', admin = admin_session_username['username'])
    else:
        return render_template('about.html')

@app.route('/release')
def release():
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = user_users.find_one({"_id": ObjectId(user_session_id)})
        return render_template('release.html', username = user_session_username['username'])
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = user_admin.find_one({"_id": ObjectId(admin_session_id)})
        return render_template('release.html', admin = admin_session_username['username'])
    else:
        return render_template('release.html')    

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hash_object = hashlib.sha256(password.encode('utf-8'))
        hash_hex = hash_object.hexdigest()
        user = user_users.find_one({'username': username})
        administrator = user_admin.find_one({'username': username})
        if user:
            if hash_hex == user['password']:
                session['user_session'] = str(user['_id'])
                return redirect(url_for('home'))
            else:
                error = 'Invalid name or password. Please try again.'
                return render_template('login.html', error=error)
        error = 'Invalid name or password. Please try again.'
        if administrator:
            if password == administrator['password']:
                session['admin_session'] = str(administrator['_id'])
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
    if 'user_session' in session:
        session.pop('user_session', None)
        return redirect(url_for('home'))
    if 'admin_session' in session:
        session.pop('admin_session', None)
        return redirect(url_for('home'))
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
    'api-key': "EiN5yepFd4DIUfNDc3R6aU6OKia70VZ7FxrPv2ZQAWiA4B4ybVMA5t1pNmMMpz46", 
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    data = json.loads(response.text)
    current_date = datetime.now().date()
    filtered_markers = [marker for marker in data['documents'] if marker["postdate"] <= str(current_date)]
    data = filtered_markers
    count = 0
    for obj in data:
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
    'api-key': "EiN5yepFd4DIUfNDc3R6aU6OKia70VZ7FxrPv2ZQAWiA4B4ybVMA5t1pNmMMpz46", 
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    data = json.loads(response.text)
    current_date = datetime.now().date()
    filtered_markers = [marker for marker in data['documents'] if marker["postdate"] <= str(current_date)]
    data = filtered_markers
    return jsonify(data)

@app.route('/add_point', methods=['GET','POST'])
def add_point():
    today = datetime.utcnow()
    today = today.strftime("%Y-%m-%d")
    allTypes = types.find()
    all_points = points.find()
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        postsByUser = user_points.count_documents({"author": user_session_username['username']})
        if postsByUser >= 10:
            return render_template('add_point_limit.html', username = user_session_username['username'])
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
        user = user_session_username['username']
        coordinates_check = points.find_one({'latitude': latitude, 'longitude': longitude})
        if len(pointname) > 50:
            notification = "Post name can't be more than 50 characters!"
            return render_template('add_point.html', notification=notification, types = allTypes, username = user_session_username['username'])
        if len(description) > 250:
            notification = "Description can't be more than 250 characters!"
            return render_template('add_point.html', notification=notification, types = allTypes, username = user_session_username['username'])
        if coordinates_check:
            notification = "Can't create post with same latitude and longitude!"
            return render_template('add_point.html', notification=notification, types = allTypes, username = user_session_username['username'])
        if today > removedate:
            notification = "Remove date can't be before today"
            return render_template('add_point.html', notification=notification, types = allTypes, username = user_session_username['username'])
        if str(latitude) == '' or str(longitude) == '':
            notification = 'Put a point in the map!'
            return render_template('add_point.html', notification=notification, types = allTypes, username = user_session_username['username'])
        else:
            latitude = float(request.form['latitude'])
            longitude = float(request.form['longitude'])
            user_points.insert_one({'latitude': latitude, 'longitude': longitude, 'name': pointname,'description': description,'postdate': postdate,'removedate': removedate,'type': pointtype,'author': user})
            notification = 'Point added sucessfully!'
            return render_template('add_point.html', notification=notification, types = allTypes, username = user_session_username['username'])
    return render_template('add_point.html', types = allTypes, username = user_session_username['username'])

@app.route('/user_points', methods=['GET', 'POST'])
def userspoints():
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        render_template('userpoints.html', username = user_session_username['username'])
    else:
        return redirect(url_for('home'))
    result = list(points.find({'author': user_session_username['username']}))
    return render_template('userpoints.html', result = result, username = user_session_username['username'])

@app.route('/user_settings', methods=['GET', 'POST'])
def usersettings():
    allTypes = types.find()
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        profile_setting = users.find_one({'username': user_session_username["username"]})
        user_session_details = users.find_one({"_id": ObjectId(user_session_id)})
        settings = usettings.find_one({"username": user_session_username["username"]})
        if settings == None:
            user_usettings.insert_one({'username': user_session_username["username"], 'settings': {'posts': []}})

        if request.method == 'POST':
            # Checks if date isn't empty or after today
            today = datetime.utcnow()
            today = today.strftime("%Y-%m-%d")
            dateofbirth = request.form['dob']
            # Checks if username isn't empty or bigger than 30 characters
            if (request.form['name'] == "" or len(request.form['name']) < 3 or len(request.form['name']) > 30):
                notification = "Username can't be empty or less than 3 characters or more than 30 characters"
                return render_template('user_settings.html', notification=notification,  username = user_session_username["username"], settings=settings, allTypes=allTypes, profile=profile_setting, verification_email = user_session_details['email'])
            if (request.form['surname'] == "" or len(request.form['surname']) < 3 or len(request.form['surname']) > 30):
                notification = "Username can't be empty or less than 3 characters or more than 30 characters"
                return render_template('user_settings.html', notification=notification,  username = user_session_username["username"], settings=settings, allTypes=allTypes, profile=profile_setting, verification_email = user_session_details['email'])
            if (dateofbirth == "" or dateofbirth > today):
                notification = "Date of birth can't be empty or be after "+today+""
                return render_template('user_settings.html', notification=notification,  username = user_session_username["username"], settings=settings, allTypes=allTypes, profile=profile_setting, verification_email = user_session_details['email'])
            if (dateofbirth == "111111-11-11"):
                notification = "Date of birth can't be empty or be after "+today+""
                return render_template('user_settings.html', notification=notification,  username = user_session_username["username"], settings=settings, allTypes=allTypes, profile=profile_setting, verification_email = user_session_details['email'])
            posts = request.form.getlist('post')
            user_users.update_one({'username': user_session_username["username"]}, {'$set': {
                'name': request.form['name'],
                'surname': request.form['surname'],
                'dateofbirth': request.form['dob'],
            }})
            user_usettings.update_one({'username': user_session_username["username"]}, {'$set': {'settings.posts': posts}})
            return redirect(url_for('usersettings'))
        return render_template('user_settings.html',  username = user_session_username["username"], settings=settings, allTypes=allTypes, profile=profile_setting, verification_email = user_session_details['email'])
    else:
        return redirect(url_for('home'))

@app.route('/user_settings_data')
def user_settings_data():
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        data = usettings.find_one({"username": user_session_username["username"]})
        return list(data["settings"]["posts"])
    else:
        return jsonify({"error": "No user settings"})

@app.route('/delete_point/<point_id>', methods=['GET','POST'])
def delete_point(point_id):
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        point_to_delete = points.find_one({'_id': ObjectId(point_id)})
        if user_session_username['username'] != point_to_delete['author']:
            # Other user trying to delete other point
            return "Not your point to delete"
        user_points.delete_one({'_id': ObjectId(point_id)})
        return redirect(url_for('home'))
    else:
        return redirect(url_for('home'))

@app.route('/edit_point/<point_id>', methods=['GET', 'POST'])
def edit_point(point_id):
    if 'admin_session' in session:
        return redirect(url_for('home'))
    today = datetime.utcnow()
    today = today.strftime("%Y-%m-%d")
    allTypes = types.find()
    point = points.find_one({'_id': ObjectId(point_id)})
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        if user_session_username['username'] != point['author']:
            # Other user trying to access other point
            return redirect(url_for('home'))
        if request.method == 'POST':
            if today > request.form['remove_date']:
                notification = "Remove date can't be before today"
                return render_template('edit_point.html', notification=notification, point=point, username = user_session_username['username'], types = allTypes)
            if len(request.form['name']) > 50:
                notification = "Post name can't have more than 50 characters"
                return render_template('edit_point.html', notification=notification, point=point, username = user_session_username['username'], types = allTypes)
            if len(request.form['description']) > 250:
                notification = "Description can't have more than 250 characters"
                return render_template('edit_point.html', notification=notification, point=point, username = user_session_username['username'], types = allTypes)
            else:
                user_points.update_one({'_id': ObjectId(point_id)}, {'$set': {
                'name': request.form['name'],
                'description': request.form['description'],
                'latitude': request.form['latitude'],
                'longitude': request.form['longitude'],
                'postdate': request.form['post_date'],
                'removedate': request.form['remove_date'],
                'type': request.form['type'],
                'author': user_session_username['username']
            }})
            return redirect(url_for('home'))
        else:
            return render_template('edit_point.html', point=point, username = user_session_username['username'], types = allTypes)
    else:
        return redirect(url_for('home'))

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
    'api-key': "EiN5yepFd4DIUfNDc3R6aU6OKia70VZ7FxrPv2ZQAWiA4B4ybVMA5t1pNmMMpz46", 
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    data = json.loads(response.text)
    return jsonify(data)

@app.route('/profile/<username>', methods=['GET', 'POST'])
def profile(username):
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        profile = users.find_one({'username': username})
        if user_session_username['username'] != profile['username']:
            return "Not your profile"
        return render_template('profile.html', profile=profile, username=user_session_username["username"])
    else:
        return redirect(url_for('home'))

@app.route('/delete-user/<username>', methods=['DELETE','GET', 'POST'])
def delete_user(username):
    if 'admin_session' in session:
        return redirect(url_for('home'))
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        if user_session_username['username'] != username:
            return "not your account to delete"
        # Delete user from users collection
        result = users.delete_one({'username': user_session_username["username"]})
        if result.deleted_count == 0:
            return {'message': 'User not found'}, 404

        # Delete all points with user's username from points collection
        user_points.delete_many({'author': user_session_username["username"]})
        user_usettings.delete_one({'username': user_session_username["username"]})
        user_point_report.delete_many({'reporter': user_session_username["username"]})
        session.pop('user_session', None)
        return redirect(url_for('home'))
        
    else:
        return redirect(url_for('home'))

@app.route('/admin_ui')
def admin_ui():
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        if admin_session_username:
            return render_template('admin_ui.html', admin = admin_session_username["username"], active_page='admin_ui.html')
        else:
            return redirect(url_for('home'))
    return redirect(url_for('home'))

@app.route('/admin_ui/markers')
def admin_markers():
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        if admin_session_username:
            allPoints = list(points.find())
            return render_template('admin_markers.html', admin = admin_session_username["username"], points = allPoints)
        else:
            return redirect(url_for('home'))
    return redirect(url_for('home'))

@app.route('/admin_ui/users')
def admin_users():
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        if admin_session_username:
            allUsers = list(users.find())
            return render_template('admin_users.html', admin = admin_session_username["username"], users = allUsers)
        else:
            return redirect(url_for('home'))
    return redirect(url_for('home'))

@app.route('/admin_ui/users/delete_user/<user_id>', methods=['DELETE','GET','POST'])
def admin_user_delete(user_id):
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        author = users.find_one({'_id': ObjectId(user_id)})
        user_users.delete_one({'_id': ObjectId(user_id)})
        user_points.delete_many({'author': author['username']})
        return redirect(url_for('home'))
    else:
        return redirect(url_for('home'))


@app.route('/admin_ui/spec_users/markers', methods=['GET','POST'])
def admin_spec_user_markers():
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        if request.method == 'POST':
            username = request.form['username']
            checkusername = users.find_one({'username': username})
            if checkusername:
                allUserPoints = list(points.find({'author': checkusername['username']}))
                return render_template('admin_spec_user_markers.html', admin = admin_session_username["username"], allUserPoints = allUserPoints)
        return render_template('admin_spec_user_markers.html', admin = admin_session_username["username"])
    else:
        return redirect(url_for('home'))


@app.route('/admin_ui/markers/delete_point/<point_id>', methods=['DELETE','GET','POST'])
def admin_delete_point(point_id):
    if 'admin_session' in session:
        all_reports = point_report.find({"marker": point_id})
        user_points.delete_one({'_id': ObjectId(point_id)})
        if(all_reports):
            print("DELETE ALL")
            user_point_report.delete_many({"marker": point_id})
        return redirect(url_for('home'))
    if 'user_session' in session:
        return redirect(url_for('home'))
    else:
        return redirect(url_for('home'))

@app.route('/report_marker/<marker_id>', methods=['GET','POST'])
def report_marker(marker_id):
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        report_duplicate = point_report.find_one({"marker": marker_id, "reporter": user_session_username["username"]})
        if report_duplicate:
            return render_template('report_marker_exists.html', marker_id = marker_id, username = user_session_username["username"])
        if request.method == 'POST':
            report_reason = request.form['report_reason']
            report_description = request.form['report_description']
            if report_reason == "other":
                report_reason_from_user = request.form['other-reason']
                user_point_report.insert_one({"reporter": user_session_username["username"], "marker": marker_id, "report_reason": report_reason_from_user, "report_description": report_description})
                return render_template('report_marker_exists.html', username = user_session_username["username"])
            else:
                user_point_report.insert_one({"reporter": user_session_username["username"], "marker": marker_id, "report_reason": report_reason, "report_description": report_description})
                return redirect(url_for('home'))
        return render_template('report_marker.html', marker_id = marker_id, username = user_session_username["username"])
    else:
        # Option for simple unregistered user to report marker
        return redirect(url_for('home'))

@app.route('/admin_ui/report_markers/delete_report/<report_id>', methods=['GET','POST'])
def admin_report_delete_markers(report_id):
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        user_point_report.find_one_and_delete({"_id": ObjectId(report_id)})
        reports = list(point_report.find())
        return render_template('admin_report_markers.html', admin = admin_session_username["username"], reports = reports)
    else:
        return redirect(url_for('home'))

@app.route('/admin_ui/report_markers', methods=['GET','POST'])
def admin_report_markers():
    if 'user_session' in session:
        return redirect(url_for('home'))
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        reports = list(point_report.find())
        return render_template('admin_report_markers.html', admin = admin_session_username["username"], reports = reports)
    else:
        return redirect(url_for('home'))


@app.route('/delete-reported-user/<marker_id>', methods=['DELETE','GET', 'POST'])
def delete_user_by_marker(marker_id):
    if 'user_session' in session:
        return redirect(url_for('home'))     
    if 'admin_session' in session:
        # Delete user from users collection
        reported_user = points.find_one({"_id": ObjectId(marker_id)})
        # print(reported_user['author'])
        result = user_users.delete_one({'username': reported_user['author']})
        if result.deleted_count == 0:
            return {'message': 'User not found'}, 404

        # Delete all points with user's username from points collection
        user_points.delete_many({'author': reported_user['author']})
        user_usettings.delete_one({'username': reported_user['author']})
        user_point_report.delete_many({'reporter': reported_user['author']})
        session.pop('username', None)
        return redirect(url_for('home'))
    
@app.route('/login_map')
def login_map():
    # Check if a user session token exists
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        # If a session token exists, return a response with the token
        return {'token': user_session_username['username']}
    else:
        # If no session token exists, return a response indicating the user is not logged in
        return {'message': 'User is not logged in'}
    
@app.route('/get_session_info')
def get_session_info():
    if 'user_session' in session:
        user_session_id = session['user_session']
        user_session_username = users.find_one({"_id": ObjectId(user_session_id)})
        return jsonify({
            'logged_in': 'user_session' in session,
            'session_id': session.get("user_session", ""),
            'username': user_session_username["username"],
            'type': "user"
        })
    if 'admin_session' in session:
        admin_session_id = session['admin_session']
        admin_session_username = admin.find_one({"_id": ObjectId(admin_session_id)})
        return jsonify({
            'logged_in': 'admin_session' in session,
            'session_id': session.get("admin_session", ""),
            'username': admin_session_username["username"],
            'type': "admin"
        })
    else:
        return jsonify({
            'logged_in': 'user_session' in session,
            'session_id': session.get("user_session", ""),
            'type': "visitor"
        }) 
if __name__ == '__main__':
    app.run(port=8080)
