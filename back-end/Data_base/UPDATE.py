import sqlite3

# Устанавливаем соединение с базой данных
connection = sqlite3.connect('my_database.db')
cursor = connection.cursor()

# Обновляем likes_id для пользователя с "vk_id"
cursor.execute('UPDATE Users SET likes_id = ? WHERE vk_id = ?', ('2, 3, 5', 'id399766'))

# Сохраняем изменения и закрываем соединение
connection.commit()
connection.close()