from sqlite3.dbapi2 import Cursor

from flask import Flask, render_template, jsonify
from flask_cors import CORS, cross_origin

from flask_restful import Resource, Api

import sqlite3

app = Flask(__name__)
api = Api(app)
CORS(app)

@app.route('/')
def hello():
    return render_template("indexMain.html")

class Employees(Resource):
    def get(self):
        return {'employees': [{'id': 1, 'name': 'Balram'}, {'id': 2, 'name': 'Tom'}]}

class Users(Resource):
    def get(self):
        myDB = sqlite3.connect('db/coins.db')
        dbCursor = myDB.cursor()
        dbCursor.execute('SELECT * FROM users')
        return jsonify(dbCursor.fetchall())

class Incomes(Resource):
    def get(self):
        myDB = sqlite3.connect('db/coins.db')
        dbCursor = myDB.cursor()
        dbCursor.execute('SELECT * FROM incomes WHERE user_id=2')
        return jsonify(dbCursor.fetchall())
api.add_resource(Employees, '/employees')  # Route_1

api.add_resource(Users, '/users')  # Route_2
api.add_resource(Incomes, '/incomes')  # Route_3
app.run()
