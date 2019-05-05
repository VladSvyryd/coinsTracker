from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid  # to generate random public id
from werkzeug.security import generate_password_hash, check_password_hash
import jwt  # json web token
import datetime  # to work with date and time
from functools import wraps  # for decorator
from passlib.hash import sha256_crypt
import os

app = Flask(__name__)

# create settings property of DB to use this to code and encode password
app.config['SECRET_KEY'] = 'thisissecret'

# to get right path to our db
basedir = os.path.abspath(os.path.dirname(__file__))

# config that path to get access to db (in the main directory of prokect, database file is in db dictionary)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db\\temp_coins.db')

# connect to db
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(50))
    email = db.Column(db.String(50))
    password = db.Column(db.String(80))
    admin = db.Column(db.Boolean)


class Categories(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(250))
    user_id = db.Column(db.Integer)


class Incomes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer)
    date = db.Column(db.TIMESTAMP)
    user_id = db.Column(db.Integer)


class Spendings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer)
    date = db.Column(db.TIMESTAMP)
    user_id = db.Column(db.Integer)
    category_id = db.Column(db.Integer)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # check the header on token
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'server message' : 'Token is missing'}), 401

        try:
            # token is a coded public_id of a user from database, when we decode a token we get exact user from DB
            # so try to get this public id
            data = jwt.decode(token, app.config['SECRET_KEY'])
            # write query to find this user in db
            current_user = User.query.filter_by(public_id=data['public_id']).first()
        except:
            return jsonify({'server message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


@app.route('/user', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_all_user(current_user):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message' : 'Cannot perform that function!'})

    # create a query to get all users
    users = User.query.all()
    # create array to build with its help an Object to send it as json to FrontEnd
    output = []
    # for each user i find, create a dictionary as column of user looks like
    for user in users:
        user_data = {}
        user_data['public_id'] = user.public_id
        user_data['name'] = user.name
        user_data['password'] = user.password
        user_data['admin'] = user.admin
        # insert created object into output array
        output.append(user_data)
    return jsonify({'users': output})


@app.route('/user/<public_id>', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_one_user(current_user, public_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    # create a query to filter table for this specific user
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'server message': 'No user found'})

    # create a dictionary of all infos in User table under current public_id
    user_data = {'public_id': user.public_id, 'name': user.name, 'password': user.password, 'admin': user.admin}

    return jsonify({'user': user_data})


@app.route('/user', methods=['POST'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def create_user(current_user):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    # get the data as json format
    data = request.get_json()
    # create a password as hash with external library
    hashed_password = generate_password_hash(data['password'], method='sha256')
    # hashed_password = sha256_crypt.encrypt(data['password'])
    # create new User WITH random string as public key,
    new_user = User(public_id=str(uuid.uuid4()), name=data['name'], password=hashed_password, admin=False)
    # insert into table User a New User
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'server message': 'New user created!'})


# promote a user to admin
@app.route('/user/<public_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def promote_user(current_user, public_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    # create a query to filter table for this specific user
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'server message': 'No user found'})

    user.admin = True
    db.session.commit()

    return jsonify({'server message': 'This user is an Admin'})


@app.route('/user/<public_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_user(current_user, public_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    # create a query to filter table for this specific user
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'server message': 'No user found'})

    db.session.delete(user)
    db.session.commit()

    return jsonify({'server message': 'The user has been deleted!'})


@app.route('/login')
def login():
    auth = request.authorization
    print(auth)
    if not auth or not auth.username or not auth.password:
        # send a response with error type and header type of error
        return make_response('Could not verify any data', 401, {'WWW-Authenticate': 'Basic realm="Login required!!!"'})
    user = User.query.filter_by(name=auth.username).first()
    # if there is no such user in db than response error
    if not user:
        return make_response('Could not verify user', 401, {'WWW-Authenticate': 'Basic realm="Login required!!!"'})
    # check password , pass password from database and coming password from the request
    if check_password_hash(user.password, auth.password):
        # create a json web token with public_id from database and expiration date of it, third parameter is a secret
        # word to encode the hash
        token = jwt.encode({'public_id': user.public_id,
                            'exp': datetime.datetime.utcnow() +
                                   datetime.timedelta(days=30)},
                           app.config['SECRET_KEY'])
        return jsonify({'token': token.decode('UTF-8')})

    return make_response('Could not verify password', 401, {'WWW-Authenticate': 'Basic realm="Login required!!!"'})


@app.route('/income', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_all_incomes(current_user):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    incomes = Incomes.query.filter_by(user_id=current_user.public_id).all()
    output = []
    for income in incomes:
        income_list = {}
        income_list['amount'] = income.amount
        income_list['date'] = income.date
        output.append(income_list)
    return jsonify({'incomes': output})

    # user = Incomes.query.filter_by


@app.route('/income/<income_id>', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_one_income(current_user, income_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    income = Incomes.query.filter_by(user_id=current_user.public_id).filter_by(id=income_id).first()
    if not income:
        return jsonify({'server message': 'No such income found'})
    income_output = dict(amount=income.amount, date=income.date)
    return jsonify({'income': income_output})


@app.route('/income', methods=['POST'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def create_income(current_user):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})
    # get data
    data = request.get_json()

    new_income = Incomes(amount=data['amount'], date=datetime.datetime.utcnow(), user_id=current_user.public_id)
    db.session.add(new_income)
    db.session.commit()
    return jsonify({'server message': 'new income is added'})


@app.route('/income', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def upgrade_income(current_user):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})
    data = request.args.to_dict()
    income = Incomes.query.filter_by(user_id=current_user.public_id).filter_by(id=int(data['income_id'])).first()
    if not income:
        return jsonify({'server message': 'No income found'})

    income.amount = data['new_amount']
    income.date = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'server message': 'This income has been changed'})


@app.route('/income/<id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
# @token_required
def delete_income(current_user, income_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    # create a query to filter table for this specific user
    income = Incomes.query.filter_by(id=income_id).first()
    if not income:
        return jsonify({'server message': 'No Income found'})

    db.session.delete(income)
    db.session.commit()

    return jsonify({'server message': 'The income has been deleted!'})



if __name__ == '__main__':
    app.run(debug=True)
