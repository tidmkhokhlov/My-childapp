from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS  # Импортируем CORS для обработки кросс-доменных запросов

app = Flask(__name__)

# Разрешаем кросс-доменные запросы с вашего фронтенд-домена
CORS(app, origins=["https://user399570766-zy4pbrve.tunnel.vk-apps.com"])

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
            event_id INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Главная страница (корень)
@app.route('/')
def home():
    return "Welcome to the Flask app!"

# Вставка ID мероприятий в базу данных
@app.route('/add_event_ids', methods=['POST'])
def add_event_ids():
    try:
        data = request.get_json()  # Получаем данные из JSON
        event_ids = data.get('event_ids', [])

        if not event_ids:
            return jsonify({"error": "No event IDs provided"}), 400

        # Вставляем ID мероприятий в базу данных
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.executemany('''
            INSERT INTO favorites (event_id)
            VALUES (?)
        ''', [(event_id,) for event_id in event_ids])
        conn.commit()
        conn.close()

        return jsonify({"message": "Event IDs added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Извлечение всех ID мероприятий
@app.route('/get_event_ids', methods=['GET'])
def get_event_ids():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT event_id FROM favorites')
    event_ids = [row[0] for row in cursor.fetchall()]
    conn.close()

    return jsonify({"event_ids": event_ids}), 200

if __name__ == '__main__':
    create_table()  # Создаём таблицу, если она ещё не существует
    app.run(debug=True)
