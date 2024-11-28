import sqlite3

# # Создаем подключение к базе данных (файл my_database.db будет создан)
# connection = sqlite3.connect('my_database.db')
#
# connection.close()

# Устанавливаем соединение с базой данных
connection = sqlite3.connect('my_database.db')
cursor = connection.cursor()

# Создаем таблицу Users
cursor.execute('''
CREATE TABLE IF NOT EXISTS Users (
id INTEGER PRIMARY KEY,
vk_id TEXT NOT NULL,
likes_id TEXT NOT NULL
)
''')

# Сохраняем изменения и закрываем соединение
connection.commit()
connection.close()