BUDGETWISE - FLASK + SQLITE VERSION
====================================

This version keeps the existing BudgetWise frontend and moves persistent data to a real SQLite database through a Flask backend.

FOLDER
------
app.py              Flask backend + SQLite database/API
index.html          BudgetWise frontend
styles.css          Existing UI styles
script.js           Existing app logic + OCR + Voice Expense
requirements.txt    Python dependency list
budgetwise.db       Created automatically on first run

SETUP (Windows / VS Code)
-------------------------
1. Install Python 3.10+ if it is not already installed.
2. Open this BudgetWise-final folder in VS Code.
3. Open Terminal in this folder.
4. Run:

   pip install -r requirements.txt

5. Start BudgetWise:

   python app.py

6. Open in Chrome:

   http://127.0.0.1:5000

IMPORTANT
---------
- Do NOT open index.html directly with double-click.
- Do NOT use the old Live Server URL for this database version.
- Start app.py and use http://127.0.0.1:5000.
- budgetwise.db is created automatically beside app.py.
- The frontend uses Flask API endpoints for the primary storage path.
- Browser localStorage is only a fallback if the backend is unavailable.

DATABASE
--------
SQLite tables include:
users
profiles
transactions
budgets
categories
smart_data
app_state

QUICK DATABASE CHECK
--------------------
Open:
http://127.0.0.1:5000/api/health

It should return JSON showing SQLite and the database tables.
