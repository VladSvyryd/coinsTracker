from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(50))
    email = db.Column(db.String(50))
    password = db.Column(db.String(80))
    admin = db.Column(db.Boolean)
    wanted_refresh_day = db.Column(db.Integer, default=1)
    last_refresh_month = db.Column(db.INTEGER)


class Expenses(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(250))
    user_id = db.Column(db.Integer)
    wanted_limit = db.Column(db.Integer, default=0)
    spent_amount = db.Column(db.Integer, default=0)
    icon = db.Column(db.String(50))


class Incomes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.TIMESTAMP)
    user_id = db.Column(db.Integer)
    name = db.Column(db.String(50))
    wanted_income = db.Column(db.Integer)
    amount = db.Column(db.Integer)
    paycheck_date = db.Column(db.TIMESTAMP)
    icon = db.Column(db.String(50))


class Spendings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer)
    date = db.Column(db.TIMESTAMP)
    user_id = db.Column(db.Integer)
    expense_id = db.Column(db.Integer)
    account_id = db.Column(db.INTEGER)
    description = db.Column(db.String(50))


class Accounts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(250))
    user_id = db.Column(db.Integer)
    amount = db.Column(db.Integer)
    date = db.Column(db.TIMESTAMP)
    icon = db.Column(db.String(50))

