from flask import Flask, request, jsonify, send_from_directory
import sqlite3, json, os
from datetime import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, 'budgetwise.db')
app = Flask(__name__, static_folder=BASE, static_url_path='')


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db()
    conn.executescript('''
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
        user_id INTEGER PRIMARY KEY,
        name TEXT DEFAULT '', email TEXT DEFAULT '', phone TEXT DEFAULT '',
        currency TEXT DEFAULT '₹', dark_mode INTEGER DEFAULT 0,
        alerts_on INTEGER DEFAULT 1, photo TEXT DEFAULT '',
        email_verified INTEGER DEFAULT 0, language TEXT DEFAULT 'en',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, entry_id TEXT,
        type TEXT NOT NULL, date TEXT, description TEXT,
        category TEXT, amount REAL NOT NULL DEFAULT 0,
        payment_method TEXT, location TEXT, receipt TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, category TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0, month TEXT,
        UNIQUE(user_id, category, month),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, name TEXT NOT NULL,
        UNIQUE(user_id, name),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS smart_data (
        user_id INTEGER PRIMARY KEY,
        data_json TEXT NOT NULL DEFAULT '{"reminders":[],"subscriptions":[],"emis":[]}',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY, value_json TEXT NOT NULL
    );
    ''')
    conn.commit(); conn.close()


def get_user(conn, username):
    return conn.execute('SELECT * FROM users WHERE username=?', (username,)).fetchone()


def get_or_create_user(conn, username, password=''):
    row = get_user(conn, username)
    if row: return row
    now = datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    conn.execute('INSERT INTO users(username,password,created_at) VALUES(?,?,?)', (username,password,now))
    conn.commit()
    return get_user(conn, username)


def get_key(key):
    conn = db()
    try:
        if key == 'app-users':
            rows = conn.execute('SELECT username,password FROM users').fetchall()
            return {r['username']: r['password'] for r in rows}, bool(rows)
        if key == 'app-session':
            r = conn.execute('SELECT value_json FROM app_state WHERE key=?',(key,)).fetchone()
            return (json.loads(r['value_json']) if r else ''), bool(r)
        if ':' not in key:
            r = conn.execute('SELECT value_json FROM app_state WHERE key=?',(key,)).fetchone()
            return (json.loads(r['value_json']) if r else None), bool(r)
        prefix, username = key.split(':',1)
        user = get_user(conn, username)
        if not user: return None, False
        uid = user['id']
        if prefix == 'entries':
            rows = conn.execute('SELECT entry_id,type,date,description,category,amount,payment_method,location,receipt FROM transactions WHERE user_id=? ORDER BY id', (uid,)).fetchall()
            out=[]
            for r in rows:
                out.append({'id':r['entry_id'],'type':r['type'],'date':r['date'],'desc':r['description'],'category':r['category'],'amount':r['amount'],'paymentMethod':r['payment_method'],'location':r['location'],'receipt':r['receipt']})
            return out, True
        if prefix == 'budgets':
            rows=conn.execute('SELECT category,amount FROM budgets WHERE user_id=?',(uid,)).fetchall()
            return {r['category']:r['amount'] for r in rows}, True
        if prefix == 'categories':
            rows=conn.execute('SELECT name FROM categories WHERE user_id=? ORDER BY id',(uid,)).fetchall()
            return [r['name'] for r in rows], True
        if prefix == 'profile':
            r=conn.execute('SELECT * FROM profiles WHERE user_id=?',(uid,)).fetchone()
            if not r: return None, False
            return {'name':r['name'],'currency':r['currency'],'darkMode':bool(r['dark_mode']),'alertsOn':bool(r['alerts_on']),'email':r['email'],'phone':r['phone'],'photo':r['photo'],'emailVerified':bool(r['email_verified']),'language':r['language']}, True
        if prefix == 'smart':
            r=conn.execute('SELECT data_json FROM smart_data WHERE user_id=?',(uid,)).fetchone()
            return (json.loads(r['data_json']) if r else {'reminders':[],'subscriptions':[],'emis':[]}), bool(r)
        return None, False
    finally:
        conn.close()


def set_key(key, value):
    conn=db()
    try:
        if key == 'app-users':
            if isinstance(value,dict):
                for username,password in value.items():
                    row=get_user(conn,username)
                    if row:
                        conn.execute('UPDATE users SET password=? WHERE username=?',(str(password),username))
                    else:
                        now=datetime.utcnow().isoformat(timespec='seconds')+'Z'
                        conn.execute('INSERT INTO users(username,password,created_at) VALUES(?,?,?)',(username,str(password),now))
                        uid=conn.execute('SELECT id FROM users WHERE username=?',(username,)).fetchone()['id']
                        conn.execute('INSERT OR IGNORE INTO profiles(user_id,name) VALUES(?,?)',(uid,username))
            conn.commit(); return
        if key == 'app-session':
            conn.execute('INSERT INTO app_state(key,value_json) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json',(key,json.dumps(value)))
            conn.commit(); return
        if ':' not in key:
            conn.execute('INSERT INTO app_state(key,value_json) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json',(key,json.dumps(value)))
            conn.commit(); return
        prefix, username=key.split(':',1)
        user=get_user(conn,username)
        if not user:
            # This can happen during the first register call; create the user so subsequent writes have a target.
            user=get_or_create_user(conn,username,'')
        uid=user['id']
        if prefix == 'entries':
            conn.execute('DELETE FROM transactions WHERE user_id=?',(uid,))
            for e in (value or []):
                conn.execute('INSERT INTO transactions(user_id,entry_id,type,date,description,category,amount,payment_method,location,receipt,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)', (uid,str(e.get('id','')),e.get('type','expense'),e.get('date',''),e.get('desc',''),e.get('category','other'),float(e.get('amount',0) or 0),e.get('paymentMethod',''),e.get('location',''),e.get('receipt',''),datetime.utcnow().isoformat(timespec='seconds')+'Z'))
        elif prefix == 'budgets':
            conn.execute('DELETE FROM budgets WHERE user_id=?',(uid,))
            for cat,amount in (value or {}).items():
                conn.execute('INSERT INTO budgets(user_id,category,amount,month) VALUES(?,?,?,?)',(uid,cat,float(amount or 0),''))
        elif prefix == 'categories':
            conn.execute('DELETE FROM categories WHERE user_id=?',(uid,))
            for name in (value or []):
                conn.execute('INSERT OR IGNORE INTO categories(user_id,name) VALUES(?,?)',(uid,str(name)))
        elif prefix == 'profile':
            p=value or {}
            conn.execute('INSERT INTO profiles(user_id,name,email,phone,currency,dark_mode,alerts_on,photo,email_verified,language) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,email=excluded.email,phone=excluded.phone,currency=excluded.currency,dark_mode=excluded.dark_mode,alerts_on=excluded.alerts_on,photo=excluded.photo,email_verified=excluded.email_verified,language=excluded.language',(uid,p.get('name',username),p.get('email',''),p.get('phone',''),p.get('currency','₹'),int(bool(p.get('darkMode',False))),int(bool(p.get('alertsOn',True))),p.get('photo',''),int(bool(p.get('emailVerified',False))),p.get('language','en')))
        elif prefix == 'smart':
            conn.execute('INSERT INTO smart_data(user_id,data_json) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET data_json=excluded.data_json',(uid,json.dumps(value or {'reminders':[],'subscriptions':[],'emis':[]})))
        conn.commit()
    finally: conn.close()


@app.post('/api/store/get')
def store_get():
    data=request.get_json(silent=True) or {}
    key=str(data.get('key',''))
    value,exists=get_key(key)
    return jsonify({'exists':exists,'value':value})


@app.post('/api/store/set')
def store_set():
    data=request.get_json(silent=True) or {}
    key=str(data.get('key',''))
    set_key(key,data.get('value'))
    return jsonify({'ok':True,'database':'SQLite','file':'budgetwise.db'})


@app.get('/api/health')
def health():
    conn=db(); tables=conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall(); conn.close()
    return jsonify({'ok':True,'database':'SQLite','file':'budgetwise.db','tables':[r['name'] for r in tables]})


@app.route('/', defaults={'path':'index.html'})
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(BASE, path)


if __name__ == '__main__':
    init_db()
    print(f'BudgetWise database: {DB_PATH}')
    app.run(host='127.0.0.1', port=5000, debug=False)
