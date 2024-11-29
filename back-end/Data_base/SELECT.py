import sqlite3

connection = sqlite3.connect('my_database.db')
cursor = connection.cursor()

# Вывод таблицы
cursor.execute('SELECT * FROM Users')
results = cursor.fetchall()

for row in results:
  print(row)

connection.close()