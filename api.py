import sqlite3
import os

# Existenz der Datenbank überprüfen und ggf. diese anlegen
if not os.path.exists("db/coins.db"):
    print('Datenbank tempdata.db nicht vorhanden - Datenbank wird anglegt.')
myDB = sqlite3.connect('db/coins.db')
dbCursor = myDB.cursor()
parameter = ('2',)
# dbCursor.execute('SELECT *  FROM users where id=?', parameter)
dbCursor.execute('SELECT *  FROM users')
print(dbCursor.fetchall())
