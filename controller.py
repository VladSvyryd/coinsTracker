from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
import uuid  # to generate random public id
from werkzeug.security import generate_password_hash, check_password_hash
import jwt  # json web token (you need to install PyJWT if ou get an error while trying to get a token)
import datetime  # to work with date and time
from functools import wraps  # for decorator
from flask_cors import CORS
from operator import itemgetter
from sqlalchemy import extract

import os
from models import db
# connect to db
from models import User, Incomes, Accounts, Expenses, Spendings, AccountTrack, IncomeTrack

app = Flask(__name__)
CORS(app)
db.init_app(app)

# create settings property of DB to use this to code and encode password
app.config['SECRET_KEY'] = 'thisissecret'
# to get right path to our db
basedir = os.path.abspath(os.path.dirname(__file__))

# config that path to get access to db (in the main directory of project, database file is in db dictionary)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db\\temp_coins.db')


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
        check_refresh_financial_period()
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
        income_list['icon'] = income.icon
        output.append(income_list)
        print(output)
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
    income_output = dict(amount=income.amount, date=income.date, icon=income.icon)
    return jsonify({'income': income_output})


@app.route('/income', methods=['POST'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def create_income(current_user):

    # get data
    data = request.get_json()

    new_income = Incomes(name=data['name'], amount=data['amount'], date=datetime.datetime.utcnow(), user_id=current_user.public_id, icon=data['icon'])
    db.session.add(new_income)
    db.session.commit()
    # on client side we need id of newly created element / this will get last element id
    addedItem_id = db.session.query(Incomes).order_by(Incomes.id.desc()).first().id

    new_income_track = IncomeTrack(user_id=current_user.public_id, income_id=addedItem_id, amount=data["amount"],
                                   date=datetime.datetime.utcnow())
    db.session.add(new_income_track)
    db.session.commit()
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
    income.icon = data['icon']
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
    new_account = Accounts(name=data['name'], user_id=current_user.public_id, amount=(int)(data['amount']),
                           date=datetime.datetime.utcnow(), icon=data['icon'])
    db.session.add(new_account)
    db.session.commit()
    # on client side we need id of newly created element / this will get last element id
    addedItem_id = db.session.query(Accounts).order_by(Accounts.id.desc()).first().id
    return jsonify({'last_added_id': addedItem_id})


@app.route('/account', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_all_accounts(current_user):

    accounts = Accounts.query.filter_by(user_id=current_user.public_id).all()
    output = []
    for account in accounts:
        account_list = dict(id=account.id, name=account.name, description=account.description,
                            amount=account.amount, date=account.date, icon=account.icon)
        output.append(account_list)
    print(output)
    return jsonify(output)


@app.route('/account_sum', methods=['GET'])
@token_required
def get_accounts_sum(current_user):
    sum = Accounts.query.with_entities(func.sum(Accounts.amount)).filter_by(
        user_id=current_user.public_id
    ).first()
    return jsonify(sum)


@app.route('/account_balance', methods=['GET'])
@token_required
def get_account_balance_history(current_user):

    #expense_history = Spendings.query.filter_by(user_id=current_user.public_id).all()
    expense_history = Spendings.query.join(Expenses, Spendings.expense_id == Expenses.id)\
        .add_columns(Spendings.id, Spendings.amount, Spendings.date, Spendings.account_balance, Expenses.name)\
        .filter_by(user_id=current_user.public_id)
    output = []
    print("expense_history", expense_history)
    for expense in expense_history:
        expense_list = dict(id=expense.id, amount=expense.amount, date=expense.date, type="outgoing",
                            account_balance=expense.account_balance, name=expense.name)

        output.append(expense_list)

    #incoming_history = AccountTrack.query.filter_by(user_id=current_user.public_id).all()
    incoming_history = AccountTrack.query.join(Incomes, AccountTrack.income_id == Incomes.id)\
        .add_columns(AccountTrack.id, AccountTrack.amount, AccountTrack.date, AccountTrack.account_balance,
                     Incomes.name)\
        .filter_by(user_id=current_user.public_id)
    for incoming in incoming_history:
        incoming_list = dict(id=incoming.id, amount=incoming.amount, date=incoming.date, type="incoming",
                             account_balance=incoming.account_balance, name=incoming.name)
        output.append(incoming_list)
    output = sorted(output, key=itemgetter('date'), reverse=False)
    return jsonify(output)


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
    account_output = dict(amount=account.amount, date=account.date, icon=account.icon)
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
    account.icon = data['icon']
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

    output = []
    for spending in spendings:
        spending_list = dict(id=spending.id, date=spending.date, amount=spending.amount, expense=spending.expense_id)
        output.append(spending_list)
    return jsonify(output)


@app.route('/spending/<expense_id>', methods=['GET'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def get_spending_by_expense_id(current_user, expense_id):
    # check if the user that asks a request is as Admin: true  in DB
    spendings = Spendings.query.filter_by(user_id=current_user.public_id).filter_by(expense_id=expense_id).all()
    if not spendings:
        return jsonify({'server_message': 'No such spending found'})
    output = []
    for spending in spendings:
        spending_output = dict(amount=spending.amount, date=spending.date, description=spending.description)
        output.append(spending_output)
    return jsonify(output)


@app.route('/spending', methods=['POST'])
@token_required
def create_spending(current_user):

    # get data
    data = request.get_json()

    account_balance = Accounts.query.with_entities(func.sum(Accounts.amount)).filter_by(
        user_id=current_user.public_id
    ).first()

    current_account_balance = account_balance[0] - data['amount']

    print("current_account_balance", current_account_balance)

    new_spending = Spendings(amount=data['amount'], date=datetime.datetime.utcnow(), user_id=current_user.public_id,
                             expense_id=data['expense_id'], account_id=data['account_id'],
                             description=data['description'], account_balance=current_account_balance)
    db.session.add(new_spending)
    db.session.commit()
    make_transaction(data['account_id'], data['amount'], data['expense_id'])
    # on client side we need id of newly created element / this will get last element id
    added_item_id = db.session.query(Spendings).order_by(Spendings.id.desc()).first().id
    return jsonify({'last_added_id': added_item_id})


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

    # we should also roll back all values in the account and the expense this spending was referring to
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


@app.route('/expense', methods=['GET'])
@token_required
def get_all_expenses(current_user):
    expenses = Expenses.query.filter_by(user_id=current_user.public_id).all()
    output = []
    for expense in expenses:
        expenses_list = {}
        expenses_list['id'] = expense.id
        expenses_list['name'] = expense.name
        expenses_list['icon'] = expense.icon
        expenses_list['wanted_limit'] = expense.wanted_limit
        expenses_list['spent_amount'] = expense.spent_amount
        output.append(expenses_list)
    return jsonify(output)


@app.route('/expense', methods=['POST'])
@token_required
def create_expense(current_user):

    # get data
    data = request.get_json()

    new_expense = Expenses(name=data['name'],
                           user_id=current_user.public_id, wanted_limit=data['wanted_limit'], icon=data['icon'])
    db.session.add(new_expense)
    db.session.commit()
    # on client side we need id of newly created element / this will get last element id
    added_item_id = db.session.query(Expenses).order_by(Expenses.id.desc()).first().id
    return jsonify({'last_added_id': added_item_id})


@app.route('/expense/<expense_id>', methods=['DELETE'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def delete_expense(current_user, expense_id):
    # create a query to filter table for this specific user
    expense = Expenses.query.filter_by(user_id=current_user.public_id).filter_by(id=expense_id).first()
    if not expense:
        return jsonify({'server_message': 'No such expense found'})

    db.session.delete(expense)
    db.session.commit()

    # we should also roll back all values in the account and the spendings this expense was referring to
    return jsonify({'server_message': 'The spending has been deleted!'})


@app.route('/expense/<expense_id>', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def upgrade_expense(current_user, expense_id):

    data = request.get_json()
    expense = Expenses.query.filter_by(user_id=current_user.public_id).filter_by(id=expense_id).first()
    if not expense:
        return jsonify({'server_message': 'No such expense found'})

    expense.name = data['name']
    expense.icon = data['icon']
    expense.wanted_limit = data['wanted_limit']
    db.session.commit()
    return jsonify({'server_message': 'This expense has been changed'})


def make_transaction(account_id, amount, expense_id):

    expense = Expenses.query.filter_by(id=expense_id).first()
    expense.spent_amount += amount
    account = Accounts.query.filter_by(id=account_id).first()
    account.amount -= amount
    db.session.commit()


def reset_expenses(account_id):
    expenses = Expenses.query.filter_by(user_id=account_id).all()
    for expense in expenses:
        expense['spent_amount'] = 0

    db.session.commit()


@app.route('/refresh_spending', methods=['POST'])
@token_required
def check_refresh_financial_period(current_user):
    current_date = datetime.datetime.now()
    current_month = current_date.month
    current_day = current_date.day
    wanted_refresh_day = current_user.wanted_refresh_day

    if not wanted_refresh_day:
        return
    else:
        if current_day == wanted_refresh_day and current_user.last_refresh_month < current_month:
            reset_expenses()
            current_user.last_refresh_month = current_month


@app.route('/inc_to_acc', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def transaction_inc_acc(current_user):

    data = request.get_json()
    print(data)
    acc = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=data['acc']["id"]).first()
    if not acc:
        return jsonify({'server_message': 'No such Account found'})
    inc = Incomes.query.filter_by(user_id=current_user.public_id).filter_by(id=data['inc']["id"]).first()
    if not inc:
        return jsonify({'server_message': 'No such Income found'})

    account_balance = Accounts.query.with_entities(func.sum(Accounts.amount)).filter_by(
        user_id=current_user.public_id
    ).first()

    current_account_balance = account_balance[0] + data['transaction_amount']

    new_account_track = AccountTrack(user_id=current_user.public_id, account_id=data['acc']["id"],
                                     income_id=data['inc']["id"], amount=data["transaction_amount"],
                                     date=datetime.datetime.utcnow(), account_balance=current_account_balance)
    db.session.add( new_account_track)

    inc.amount -= data["transaction_amount"]
    acc.amount += data["transaction_amount"]
    db.session.commit()
    return jsonify({'server_message': 'This transaction_inc_acc has been committed'})\



@app.route('/acc_to_acc', methods=['PUT'])
# this is a decorator to make this route opened to authenticated users with token
@token_required
def transaction_acc_acc(current_user):

    data = request.get_json()
    print(data)
    acc1 = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=data['accIdFrom']).first()
    if not acc1:
        return jsonify({'server_message': 'No such Account1 found'})
    acc2 = Accounts.query.filter_by(user_id=current_user.public_id).filter_by(id=data['accIdTo']).first()
    if not acc2:
        return jsonify({'server_message': 'No such Account2 found'})

    acc1.amount -= data["transaction_amount"]
    acc2.amount += data["transaction_amount"]
    db.session.commit()
    return jsonify({'server_message': 'This transaction_acc_acc has been committed'})


@app.route('/income_expense', methods=['GET'])
@token_required
def get_income_track_and_spendings(current_user):

    filter_after = datetime.datetime.today() - datetime.timedelta(days=30)
    current_month = datetime.datetime.today().month

    #expense_history = Spendings.query.filter(Spendings.date >= filter_after, Spendings.user_id == current_user.public_id).all()
    expense_history = Spendings.query.filter(extract('month', Spendings.date) == current_month, Spendings.user_id == current_user.public_id).all()

    output = []
    for expense in expense_history:
        expense_list = dict(id=expense.id, amount=expense.amount, date=expense.date, type="expense")
        output.append(expense_list)

    #income_tracks = IncomeTrack.query.filter(IncomeTrack.date >= filter_after, IncomeTrack.user_id == current_user.public_id).all()
    income_tracks = IncomeTrack.query.filter(extract('month', IncomeTrack.date) == current_month, IncomeTrack.user_id == current_user.public_id).all()


    for it in income_tracks:
        income_track_list = dict(id=it.id, amount=it.amount, date=it.date, type="income")
        output.append(income_track_list)
    output = sorted(output, key=itemgetter('date'), reverse=False)
    return jsonify(output)


if __name__ == '__main__':
    app.run(debug=True)
