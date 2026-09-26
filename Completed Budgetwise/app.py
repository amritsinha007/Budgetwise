from flask import Flask, render_template, request, jsonify
import sqlite3, json
from pathlib import Path

BASE_DIR=Path(__file__).resolve().parent
DB_PATH=BASE_DIR/'budgetwise.db'
app=Flask(__name__,template_folder='templates',static_folder='static')

def db():
    c=sqlite3.connect(DB_PATH); c.row_factory=sqlite3.Row; c.execute('PRAGMA foreign_keys=ON'); return c

def init_db():
    c=db(); c.executescript("""
    CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS profiles(user_id INTEGER PRIMARY KEY,name TEXT DEFAULT '',currency TEXT DEFAULT '₹',dark_mode INTEGER DEFAULT 0,alerts_on INTEGER DEFAULT 1,email TEXT DEFAULT '',phone TEXT DEFAULT '',photo TEXT DEFAULT '',email_verified INTEGER DEFAULT 0,language TEXT DEFAULT 'en',FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS transactions(id INTEGER NOT NULL,user_id INTEGER NOT NULL,type TEXT NOT NULL,date TEXT NOT NULL,description TEXT NOT NULL,category TEXT NOT NULL,amount REAL NOT NULL,payment_method TEXT DEFAULT '',location TEXT DEFAULT '',receipt TEXT DEFAULT '',PRIMARY KEY(id,user_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS budgets(user_id INTEGER NOT NULL,category TEXT NOT NULL,amount REAL NOT NULL DEFAULT 0,PRIMARY KEY(user_id,category),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS categories(user_id INTEGER NOT NULL,category_key TEXT NOT NULL,name TEXT NOT NULL,color TEXT DEFAULT '',PRIMARY KEY(user_id,category_key),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS bills(id INTEGER NOT NULL,user_id INTEGER NOT NULL,name TEXT NOT NULL,amount REAL NOT NULL,category TEXT DEFAULT '',due_date TEXT NOT NULL,notes TEXT DEFAULT '',paid INTEGER DEFAULT 0,paid_date TEXT DEFAULT '',PRIMARY KEY(id,user_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS subscriptions(id INTEGER NOT NULL,user_id INTEGER NOT NULL,name TEXT NOT NULL,amount REAL NOT NULL,frequency TEXT NOT NULL,next_date TEXT NOT NULL,category TEXT DEFAULT '',status TEXT DEFAULT 'active',PRIMARY KEY(id,user_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS emis(id INTEGER NOT NULL,user_id INTEGER NOT NULL,loan_name TEXT NOT NULL,principal REAL NOT NULL,rate REAL NOT NULL,tenure_months INTEGER NOT NULL,emi_amount REAL NOT NULL,start_date TEXT NOT NULL,paid_months INTEGER DEFAULT 0,PRIMARY KEY(id,user_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS app_state(state_key TEXT PRIMARY KEY,state_value TEXT NOT NULL);
    """); c.commit(); c.close()

def uid(username):
    c=db(); r=c.execute('SELECT id FROM users WHERE username=?',(username,)).fetchone(); c.close(); return r['id'] if r else None

def save_profile(u,p):
    c=db(); c.execute("""INSERT INTO profiles(user_id,name,currency,dark_mode,alerts_on,email,phone,photo,email_verified,language) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,currency=excluded.currency,dark_mode=excluded.dark_mode,alerts_on=excluded.alerts_on,email=excluded.email,phone=excluded.phone,photo=excluded.photo,email_verified=excluded.email_verified,language=excluded.language""",(u,p.get('name',''),p.get('currency','₹'),int(bool(p.get('darkMode',False))),int(bool(p.get('alertsOn',True))),p.get('email',''),p.get('phone',''),p.get('photo',''),int(bool(p.get('emailVerified',False))),p.get('language','en'))); c.commit(); c.close()

def get_store(key):
    if key=='app-users':
        c=db(); rows=c.execute('SELECT username,password FROM users ORDER BY username').fetchall(); c.close(); return {r['username']:r['password'] for r in rows},True
    if key=='app-session':
        c=db(); r=c.execute('SELECT state_value FROM app_state WHERE state_key=?',(key,)).fetchone(); c.close(); return (json.loads(r['state_value']) if r else ''),True
    if ':' not in key: return None,False
    kind,user=key.split(':',1); u=uid(user)
    if u is None:return None,False
    c=db()
    if kind=='profile':
        r=c.execute('SELECT * FROM profiles WHERE user_id=?',(u,)).fetchone(); c.close()
        if not r:return {'name':user,'currency':'₹','darkMode':False,'alertsOn':True,'email':'','phone':'','photo':'','emailVerified':False,'language':'en'},True
        return {'name':r['name'],'currency':r['currency'],'darkMode':bool(r['dark_mode']),'alertsOn':bool(r['alerts_on']),'email':r['email'],'phone':r['phone'],'photo':r['photo'],'emailVerified':bool(r['email_verified']),'language':r['language']},True
    if kind=='entries':
        rows=c.execute('SELECT * FROM transactions WHERE user_id=? ORDER BY date DESC,id DESC',(u,)).fetchall(); c.close(); return [dict(id=r['id'],type=r['type'],date=r['date'],desc=r['description'],category=r['category'],amount=r['amount'],paymentMethod=r['payment_method'],location=r['location'],receipt=r['receipt']) for r in rows],True
    if kind=='budgets':
        rows=c.execute('SELECT category,amount FROM budgets WHERE user_id=?',(u,)).fetchall(); c.close(); return {r['category']:r['amount'] for r in rows},True
    if kind=='categories':
        rows=c.execute('SELECT category_key,name,color FROM categories WHERE user_id=?',(u,)).fetchall(); c.close(); return [dict(key=r['category_key'],name=r['name'],color=r['color']) for r in rows],True
    if kind=='bills':
        rows=c.execute('SELECT * FROM bills WHERE user_id=? ORDER BY due_date,id',(u,)).fetchall(); c.close(); return [dict(id=r['id'],name=r['name'],amount=r['amount'],category=r['category'],dueDate=r['due_date'],notes=r['notes'],paid=bool(r['paid']),paidDate=r['paid_date'] or None) for r in rows],True
    if kind=='subscriptions':
        rows=c.execute('SELECT * FROM subscriptions WHERE user_id=? ORDER BY next_date,id',(u,)).fetchall(); c.close(); return [dict(id=r['id'],name=r['name'],amount=r['amount'],frequency=r['frequency'],nextDate=r['next_date'],category=r['category'],status=r['status']) for r in rows],True
    if kind=='emis':
        rows=c.execute('SELECT * FROM emis WHERE user_id=? ORDER BY start_date,id',(u,)).fetchall(); c.close(); return [dict(id=r['id'],loanName=r['loan_name'],principal=r['principal'],rate=r['rate'],tenureMonths=r['tenure_months'],emiAmount=r['emi_amount'],startDate=r['start_date'],paidMonths=r['paid_months']) for r in rows],True
    c.close(); return None,False

def replace(user,kind,v):
    u=uid(user)
    if u is None:return False
    if kind=='profile': save_profile(u,v); return True
    c=db(); c.execute({'entries':'DELETE FROM transactions WHERE user_id=?','budgets':'DELETE FROM budgets WHERE user_id=?','categories':'DELETE FROM categories WHERE user_id=?','bills':'DELETE FROM bills WHERE user_id=?','subscriptions':'DELETE FROM subscriptions WHERE user_id=?','emis':'DELETE FROM emis WHERE user_id=?'}.get(kind,'SELECT 1'),(u,))
    if kind=='entries':
        for x in v or []: c.execute('INSERT INTO transactions VALUES(?,?,?,?,?,?,?,?,?,?)',(int(x.get('id',0)),u,x.get('type','expense'),x.get('date',''),x.get('desc',''),x.get('category','other'),float(x.get('amount',0)),x.get('paymentMethod',''),x.get('location',''),x.get('receipt','')))
    elif kind=='budgets':
        for cat,a in (v or {}).items(): c.execute('INSERT INTO budgets VALUES(?,?,?)',(u,cat,float(a or 0)))
    elif kind=='categories':
        for x in v or []: c.execute('INSERT INTO categories VALUES(?,?,?,?)',(u,x.get('key',''),x.get('name',''),x.get('color','')))
    elif kind=='bills':
        for x in v or []: c.execute('INSERT INTO bills VALUES(?,?,?,?,?,?,?,?,?)',(int(x.get('id',0)),u,x.get('name',''),float(x.get('amount',0)),x.get('category',''),x.get('dueDate',''),x.get('notes',''),int(bool(x.get('paid',False))),x.get('paidDate') or ''))
    elif kind=='subscriptions':
        for x in v or []: c.execute('INSERT INTO subscriptions VALUES(?,?,?,?,?,?,?,?)',(int(x.get('id',0)),u,x.get('name',''),float(x.get('amount',0)),x.get('frequency','monthly'),x.get('nextDate',''),x.get('category',''),x.get('status','active')))
    elif kind=='emis':
        for x in v or []: c.execute('INSERT INTO emis VALUES(?,?,?,?,?,?,?,?,?)',(int(x.get('id',0)),u,x.get('loanName',''),float(x.get('principal',0)),float(x.get('rate',0)),int(x.get('tenureMonths',0)),float(x.get('emiAmount',0)),x.get('startDate',''),int(x.get('paidMonths',0))))
    else: c.close(); return False
    c.commit(); c.close(); return True

@app.get('/')
def index(): return render_template('index.html')
@app.get('/api/health')
def health(): return jsonify(ok=True,database=str(DB_PATH))
@app.get('/api/storage')
def storage_get():
    key=request.args.get('key',''); v,e=get_store(key); return jsonify(exists=e,value=v)
@app.post('/api/storage')
def storage_set():
    d=request.get_json(silent=True) or {}; key=d.get('key'); v=d.get('value')
    if key=='app-users':
        c=db(); c.execute('DELETE FROM users')
        for name,pw in (v or {}).items():
            c.execute('INSERT INTO users(username,password) VALUES(?,?)',(name,pw)); r=c.execute('SELECT id FROM users WHERE username=?',(name,)).fetchone(); c.execute('INSERT OR IGNORE INTO profiles(user_id,name) VALUES(?,?)',(r['id'],name))
        c.commit(); c.close(); return jsonify(ok=True)
    if key=='app-session':
        c=db(); c.execute('INSERT INTO app_state VALUES(?,?) ON CONFLICT(state_key) DO UPDATE SET state_value=excluded.state_value',(key,json.dumps(v))); c.commit(); c.close(); return jsonify(ok=True)
    if ':' not in (key or ''): return jsonify(error='Unsupported key'),400
    kind,user=key.split(':',1)
    return (jsonify(ok=True) if replace(user,kind,v) else (jsonify(error='Unknown user/key'),400))

if __name__=='__main__':
    init_db(); print(f'BudgetWise database: {DB_PATH}'); print('Open: http://127.0.0.1:5000'); app.run(host='127.0.0.1',port=5000,debug=False)
