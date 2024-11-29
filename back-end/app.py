from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS  # Импортируем CORS для обработки кросс-доменных запросов

app = Flask(__name__)

# Разрешаем кросс-доменные запросы с вашего фронтенд-домена
CORS(app)

# Подключение к базе данных SQLite
def get_db_connection():
    conn = sqlite3.connect('events.db')
    conn.row_factory = sqlite3.Row
    return conn

# Создание таблицы в базе данных
def create_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            vk_id TEXT NOT NULL  -- Меняем тип vk_id на TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Главная страница (корень)
@app.route('/')
def home():
    return "Welcome to the Flask app!"

# Вставка или обновление ID мероприятий для vk_id
@app.route('/add_event_ids', methods=['POST'])
def add_event_ids():
    try:
        data = request.get_json()  # Получаем данные из JSON
        event_ids = data.get('event_ids', [])
        vk_id = data.get('vk_id', None)

        if not event_ids or vk_id is None:
            return jsonify({"error": "No event IDs or vk_id provided"}), 400

        # Подключаемся к базе данных
        conn = get_db_connection()
        cursor = conn.cursor()

        # Удаляем старые записи для данного vk_id
        cursor.execute('DELETE FROM favorites WHERE vk_id = ?', (vk_id,))
        conn.commit()

        # Вставляем новые event_ids для данного vk_id
        cursor.executemany('''
            INSERT INTO favorites (event_id, vk_id)
            VALUES (?, ?)
        ''', [(event_id, vk_id) for event_id in event_ids])
        conn.commit()
        conn.close()

        return jsonify({"message": "Event IDs updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Извлечение всех ID мероприятий для конкретного vk_id
@app.route('/get_event_ids/<string:vk_id>', methods=['GET'])
def get_event_ids(vk_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT event_id FROM favorites WHERE vk_id = ?', (vk_id,))
    event_ids = [row[0] for row in cursor.fetchall()]
    conn.close()

    return jsonify({"event_ids": event_ids}), 200

if __name__ == '__main__':
    create_table()  # Создаём таблицу, если она ещё не существует
    app.run(debug=True)
