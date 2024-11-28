import sqlite3

connection = sqlite3.connect('my_database.db')
cursor = connection.cursor()

# Выбираем имена и возраст пользователей в возрасте 52 лет
cursor.execute('SELECT username, age FROM Users WHERE age = ?', (52,))
results = cursor.fetchall()

for row in results:
  print(row)

connection.close()