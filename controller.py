from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
import uuid  # to generate random public id
from werkzeug.security import generate_password_hash, check_password_hash
import jwt  # json web token (you need to install PyJWT if ou get an error while trying to get a token)
import datetime  # to work with date and time
from functools import wraps  # for decorator
from flask_cors import CORS

import os
from models import db

app = Flask(__name__)
CORS(app)
db.init_app(app)

# create settings property of DB to use this to code and encode password
app.config['SECRET_KEY'] = 'thisissecret'
# to get right path to our db
basedir = os.path.abspath(os.path.dirname(__file__))

# config that path to get access to db (in the main directory of project, database file is in db dictionary)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db\\temp_coins.db')

# connect to db
from models import User, Incomes, Accounts, Categories, Spendings


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # check the header on token
        if 'Authorization' in request.headers:
            token = request.headers['Authorization']

        if not token:
            return jsonify({'server_message' : 'Token is missing'}), 401

        try:
            # token is a coded public_id of a user from database, when we decode a token we get exact user from DB
            # so try to get this public id
            data = jwt.decode(token, app.config['SECRET_KEY'])
            # write query to find this user in db
            current_user = User.query.filter_by(public_id=data['public_id']).first()
        except:
            return jsonify({'server_message': 'Token is invalid'}), 401
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
        return jsonify({'server_message': 'No user found'})

    # create a dictionary of all infos in User table under current public_id
    user_data = {'public_id': user.public_id, 'name': user.name, 'password': user.password, 'admin': user.admin}

    return jsonify({'user': user_data})


@app.route('/user_signUp', methods=['POST'])
def create_user():
    auth = request.headers
    if not auth['password']:
        # send a response with error type and header type of error
        return make_response('Could not verify any data', 401, {"WWW-Authenticate': 'No password'"})

    # get the data as json format
    data = request.get_json()

    is_already_user = User.query.filter_by(email=data['email']).first()

    if is_already_user:
        return jsonify({'server_message': 'There is already a user with such email. Try to Log In'})

    # create a password as hash with external library
    hashed_password = generate_password_hash(auth['password'], method='sha256')
    # hashed_password = sha256_crypt.encrypt(data['password'])
    # create new User WITH random string as public key,
    new_user = User(public_id=str(uuid.uuid4()), name=data.get("name", "Mew"), email=data.get("email"), password=hashed_password, admin=False)
    # insert into table User a New User
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'server_message': 'New user created!', "new_user_created": "true"})


# promote a user to admin
@app.route('/user/<public_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def promote_user(current_user, public_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server_message': 'Cannot perform that function!'})

    # create a query to filter table for this specific user
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'server_message': 'No user found'})

    user.admin = True
    db.session.commit()

    return jsonify({'server_message': 'This user is an Admin'})


@app.route('/user/<public_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_user(current_user, public_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server_message': 'Cannot perform that function!'})

    # create a query to filter table for this specific user
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'server_message': 'No user found'})

    db.session.delete(user)
    db.session.commit()

    return jsonify({'server_message': 'The user has been deleted!'})


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

    incomes = Incomes.query.filter_by(user_id=current_user.public_id).all()
    output = []
    summ = Incomes.query.with_entities(func.sum(Incomes.amount)).filter_by(
        user_id=current_user.public_id
    ).first()
    for income in incomes:
        income_list = {}
        income_list['name'] = income.name
        income_list['id'] = income.id
        income_list['amount'] = income.amount
        income_list['date'] = income.date
        output.append(income_list)
    return jsonify(output)

@app.route('/income_sum', methods=['GET'])
@token_required
def get_incomes_sum(current_user):
    sum = Incomes.query.with_entities(func.sum(Incomes.amount)).filter_by(
        user_id=current_user.public_id
    ).first()
    print(sum)
    return jsonify(sum)


@app.route('/income/<income_id>', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_one_income(current_user, income_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server_message': 'Cannot perform that function!'})

    income = Incomes.query.filter_by(user_id=current_user.public_id).filter_by(id=income_id).first()
    if not income:
        return jsonify({'server_message': 'No such income found'})
    income_output = dict(amount=income.amount, date=income.date)
    return jsonify({'income': income_output})


@app.route('/income', methods=['POST'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def create_income(current_user):

    # get data
    data = request.get_json()

    new_income = Incomes(name=data['name'], amount=data['amount'], date=datetime.datetime.utcnow(), user_id=current_user.public_id)
    db.session.add(new_income)
    db.session.commit()
    # on clientside we need id of newly created element / this will get last element id
    addedItem_id = db.session.query(Incomes).order_by(Incomes.id.desc()).first().id
    return jsonify({'last_added_id': addedItem_id})


@app.route('/income/<income_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def upgrade_income(current_user, income_id):

    data = request.get_json()
    income = Incomes.query.filter_by(user_id=current_user.public_id).filter_by(id=income_id).first()
    if not income:
        return jsonify({'server_message': 'No income found'})

    income.amount = data['amount']
    income.name = data['name']
    income.date = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'server_message': 'This income has been changed'})


@app.route('/income/<income_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_income(current_user, income_id):

    # create a query to filter table for this specific user
    income = Incomes.query.filter_by(user_id=current_user.public_id).filter_by(id=income_id).first()
    if not income:
        return jsonify({'server_message': 'No Income found'})

    db.session.delete(income)
    db.session.commit()

    return jsonify({'server_message': 'The income has been deleted!'})

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
    # on clientside we need id of newly created element / this will get last element id
    addedItem_id = db.session.query(Accounts).order_by(Accounts.id.desc()).first().id
    return jsonify({'last_added_id': addedItem_id})


@app.route('/account', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_all_accounts(current_user):

    accounts = Accounts.query.filter_by(user_id=current_user.public_id).all()
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

@app.route('/account_sum', methods=['GET'])
@token_required
def get_accounts_sum(current_user):
    sum = Accounts.query.with_entities(func.sum(Accounts.amount)).filter_by(
        user_id=current_user.public_id
    ).first()
    return jsonify(sum)


@app.route('/account/<account_id>', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_one_account(current_user, account_id):
    # check if the user that asks a request is as Admin: true  in DB
    if not current_user.admin:
        return jsonify({'server_message': 'Cannot perform that function!'})

    account = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=account_id).first()
    if not account:
        return jsonify({'server_message': 'No such income found'})
    account_output = dict(amount=account.amount, date=account.date)
    return jsonify({'account': account_output})


@app.route('/account/<account_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def upgrade_account(current_user, account_id):

    data = request.get_json()
    account = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=account_id).first()
    if not account:
        return jsonify({'server_message': 'No income found'})

    account.name = data['name']
    account.description = data['description'] or account.description
    account.amount = data['amount']
    account.date = datetime.datetime.utcnow()
    db.session.commit()
    return jsonify({'server_message': 'This acount has been changed'})


@app.route('/account/<account_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_account(current_user, account_id):
    # create a query to filter table for this specific user
    account = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=account_id).first()
    if not account:
        return jsonify({'server_message': 'No Account found'})

    db.session.delete(account)
    db.session.commit()

    return jsonify({'server_message': 'The account has been deleted!'})

@app.route('/spending', methods=['GET'])
@token_required
def get_all_spendings(current_user):
    spendings = Spendings.query.filter_by(user_id=current_user.public_id).all()
    print(spendings)
    output = []
    for spending in spendings:
        spending_list = {}
        spending_list['id'] = spending.id
        spending_list['date'] = spending.date
        spending_list['amount'] = spending.amount
        spending_list['category'] = spending.category_id
        output.append(spending_list)
    return jsonify(output)

@app.route('/spending', methods=['POST'])
@token_required
def create_spending(current_user):

    # get data
    data = request.get_json()
    new_spending = Spendings(amount=data['amount'], date=datetime.datetime.utcnow(), user_id=current_user.public_id,
                             category_id=data['category_id'], account_id=data['account_id'])
    db.session.add(new_spending)
    db.session.commit()
    make_transaction(data['account_id'], data['amount'], data['category_id'])
    # on clientside we need id of newly created element / this will get last element id
    addedItem_id = db.session.query(Spendings).order_by(Spendings.id.desc()).first().id
    return jsonify({'last_added_id': addedItem_id})

@app.route('/spending/<spending_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_spending(current_user, spending_id):
    # create a query to filter table for this specific user
    spending = Spendings.query.filter_by(user_id=current_user.public_id).filter_by(id=spending_id).first()
    if not spending:
        return jsonify({'server_message': 'No such spending found'})

    db.session.delete(spending)
    db.session.commit()

    #we should also roll back all values in the account and the categorie this spending was referring to
    return jsonify({'server_message': 'The spending has been deleted!'})

@app.route('/spending/<spending_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def upgrade_spending(current_user, spending_id):

    data = request.get_json()
    spending = Spendings.query.filter_by(user_id=current_user.public_id).filter_by(id=spending_id).first()
    if not spending:
        return jsonify({'server_message': 'No spending found'})

    spending.amount = data['amount']
    db.session.commit()
    return jsonify({'server_message': 'This spending has been changed'})

@app.route('/category', methods=['GET'])
@token_required
def get_all_categories(current_user):
    categories = Categories.query.filter_by(user_id=current_user.public_id).all()
    print(categories)
    output = []
    for category in categories:
        category_list = {}
        category_list['id'] = category.id
        category_list['name'] = category.name
        category_list['wanted_limit'] = category.wanted_limit
        category_list['spent_amount'] = category.spent_amount
        output.append(category_list)
    return jsonify(output)

@app.route('/category', methods=['POST'])
@token_required
def create_category(current_user):

    # get data
    data = request.get_json()

    new_category = Categories(name=data['name'],
                              user_id=current_user.public_id, wanted_limit=data['wanted_limit'])
    db.session.add(new_category)
    db.session.commit()
    # on clientside we need id of newly created element / this will get last element id
    addedItem_id = db.session.query(Categories).order_by(Categories.id.desc()).first().id
    return jsonify({'last_added_id': addedItem_id})

@app.route('/category/<category_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_category(current_user, category_id):
    # create a query to filter table for this specific user
    category = Categories.query.filter_by(user_id=current_user.public_id).filter_by(id=category_id).first()
    if not category:
        return jsonify({'server_message': 'No such category found'})

    db.session.delete(category)
    db.session.commit()

    #we should also roll back all values in the account and the spendings this category was referring to
    return jsonify({'server_message': 'The spending has been deleted!'})

@app.route('/category/<category_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def upgrade_category(current_user, category_id):

    data = request.get_json()
    category = Categories.query.filter_by(user_id=current_user.public_id).filter_by(id=category_id).first()
    if not category:
        return jsonify({'server_message': 'No such category found'})

    category.name = data['name']
    category.wanted_limit = data['wanted_limit']
    db.session.commit()
    return jsonify({'server_message': 'This category has been changed'})


def make_transaction(account_id, amount, category_id):
    category = Categories.query.filter_by(id=category_id).first()
    category.spent_amount += amount
    account = Accounts.query.filter_by(id=account_id).first()
    account.amount -= amount
    db.session.commit()


if __name__ == '__main__':
    app.run(debug=True)
