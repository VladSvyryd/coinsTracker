from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid  # to generate random public id
from werkzeug.security import generate_password_hash, check_password_hash
import jwt  # json web token
import datetime  # to work with date and time
from functools import wraps  # for decorator
from flask_cors import CORS

import os

app = Flask(__name__)
CORS(app)

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


class Accounts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(250))
    user_id = db.Column(db.Integer)
    amount = db.Column(db.Integer)
    date = db.Column(db.TIMESTAMP)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # check the header on token
        if 'Authorization' in request.headers:
            token = request.headers['Authorization']

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
def get_all_users(current_user):


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


    # create a query to filter table for this specific user
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'server message': 'No user found'})

    # create a dictionary of all infos in User table under current public_id
    user_data = {'public_id': user.public_id, 'name': user.name, 'password': user.password, 'admin': user.admin}

    return jsonify({'user': user_data})


@app.route('/user_signUp', methods=['POST'])
def create_user():
    print("executed")
    print(request.headers)
    print(request.get_json())
    auth = request.headers
    if not auth['password']:
        # send a response with error type and header type of error
        return make_response('Could not verify any data', 401, {"WWW-Authenticate': 'No password'"})

    # get the data as json format
    data = request.get_json()

    is_already_user = User.query.filter_by(email=data['email']).first()

    if is_already_user:
        return jsonify({'server message': 'There is already a user with such email. Try to Log In'})

    # create a password as hash with external library
    hashed_password = generate_password_hash(auth['password'], method='sha256')
    # hashed_password = sha256_crypt.encrypt(data['password'])
    # create new User WITH random string as public key,
    new_user = User(public_id=str(uuid.uuid4()), name=data.get("name", "Mew"), email=data.get("email"), password=hashed_password, admin=False)
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
    auth = request.headers
    if not auth or not auth['email'] or not auth['password']:
        # send a response with error type and header type of error
        return make_response('Could not verify any data', 401, {'WWW-Authenticate': 'Basic realm="Login required!!!"'})
    user = User.query.filter_by(email=auth['email']).first()
    # if there is no such user in db than response error
    if not user:
        return make_response('Could not verify user', 401, {'WWW-Authenticate': 'Basic realm="Login required!!!"'})
    # check password , pass password from database and coming password from the request
    if check_password_hash(user.password, auth['password']):
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


@app.route('/income/<income_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def upgrade_income(current_user, income_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})
    data = request.get_json()
    income = Incomes.query.filter_by(user_id=current_user.public_id).filter_by(id=income_id).first()
    if not income:
        return jsonify({'server message': 'No income found'})

    income.amount = data['amount']
    income.date = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'server message': 'This income has been changed'})


@app.route('/income/<income_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
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

# ****** Accounts ******
@app.route('/account', methods=['POST'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def create_account(current_user):

    # get data
    data = request.get_json()
    print(data)
    new_account = Accounts(name=data['name'], user_id=current_user.public_id, amount=(int)(data['amount']), date=datetime.datetime.utcnow())
    db.session.add(new_account)
    db.session.commit()
    return jsonify({'server message': 'new account is added'})


@app.route('/account', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_all_accounts(current_user):

    accounts = Accounts.query.filter_by(user_id=current_user.public_id).all()
    print(accounts)
    output = []
    for account in accounts:
        account_list = {}
        account_list['id'] = account.id
        account_list['name'] = account.name
        account_list['description'] = account.description
        account_list['amount'] = account.amount
        account_list['date'] = account.date
        output.append(account_list)
    return jsonify(output)


@app.route('/account/<account_id>', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_one_account(current_user, account_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server message': 'Cannot perform that function!'})

    account = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=account_id).first()
    if not account:
        return jsonify({'server message': 'No such income found'})
    account_output = dict(amount=account.amount, date=account.date)
    return jsonify({'account': account_output})


@app.route('/account/<account_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def update_account(current_user, account_id):

    data = request.get_json()
    account = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=account_id).first()
    if not account:
        return jsonify({'server message': 'No income found'})

    account.name = data['name']
# account.description = data['description'] or account.description
# account.amount = data['amount']
# account.date = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'server message': 'This acount has been changed'})


@app.route('/account/<account_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_account(current_user, account_id):
    # create a query to filter table for this specific user
    account = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=account_id).first()
    if not account:
        return jsonify({'server message': 'No Account found'})

    db.session.delete(account)
    db.session.commit()

    return jsonify({'server message': 'The account has been deleted!'})


if __name__ == '__main__':
    app.run(debug=True)
