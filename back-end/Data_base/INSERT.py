import sqlite3

# Устанавливаем соединение с базой данных
connection = sqlite3.connect('my_database.db')
cursor = connection.cursor()

# Добавляем нового пользователя
cursor.execute('INSERT INTO Users (vk_id, likes_id) VALUES (?, ?)', ('id999766', '9, 582'))

# Сохраняем изменения и закрываем соединение
connection.commit()
connection.close()