from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from pymysql.constants import CLIENT
import os
import json
import random
import pymysql
import time


app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)

DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME', 'feedback_db')


def init_db():
    attempts = 0
    max_attempts = 5
    delay = 5  # seconds

    while attempts < max_attempts:
        try:
            
            conn = pymysql.connect(
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWORD
            )
            cursor = conn.cursor()
            cursor.execute("SELECT VERSION();")

            # Moved flag initialization to init.sql on the DB server for SECURITY + to stop those pesky hackers!!1  
            # cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
            # conn.select_db(DB_NAME)
            # cursor.execute('''
            #     CREATE TABLE IF NOT EXISTS feedback (
            #         id INT AUTO_INCREMENT PRIMARY KEY,
            #         joke_id TEXT NOT NULL,
            #         feedback TEXT NOT NULL
            #     )
            # ''')
            # cursor.execute('''
            #     CREATE TABLE IF NOT EXISTS admin (
            #         id INT AUTO_INCREMENT PRIMARY KEY,
            #         token TEXT NOT NULL
            #     )
            # ''')

            # cursor.execute(f'''
            #     INSERT IGNORE INTO flag (flag)
            #     VALUES ("{os.getenv('FLAG')}")
            # ''')

            conn.commit()
            cursor.close()

            conn.close()
            print("Database initialized successfully.")
            return
        except Exception as e:
            attempts += 1
            print(f"Attempt {attempts} failed: {e}")
            if attempts < max_attempts:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("Max retries reached. Could not initialize database.")
                raise


def load_jokes():
    with open('programming_jokes.json', 'r') as file:
        jokes = json.load(file)
    return jokes

@app.route('/')
def index():
    return send_from_directory(os.path.join(app.static_folder), 'index.html')

@app.route('/joke')
def random_joke():
    jokes = load_jokes()
    joke = random.choice(jokes)
    return jsonify(joke)

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    joke_id = data.get('joke_id')
    user_feedback = data.get('feedback')
    
    if not joke_id or not user_feedback:
        return jsonify({'error': 'Invalid data. Please provide both joke id and feedback.'}), 400

    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            client_flag=CLIENT.MULTI_STATEMENTS
        )
        cursor = conn.cursor()
        cursor.execute(f'''
            INSERT IGNORE INTO feedback (joke_id, feedback)
            VALUES ("{joke_id}", "{user_feedback}")
        ''')
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Feedback saved successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/flags', methods=['GET'])
def admin_flags():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization header required'}), 403
    token = auth_header.split(' ')[1]

    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()
        
        cursor.execute('SELECT token FROM admin WHERE token = %s', (token,))
        admin = cursor.fetchone()
        
        if not admin:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Unauthorized access'}), 403
        
        cursor.execute('SELECT flag FROM flag')
        flags = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({'flags': [row[0] for row in flags]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=80, debug=False)
