# GitDB – Time-Traveling SQLite Database

🔹 A unique mini-DBMS built with Node.js + SQLite + Git  
🔹 Automatically saves the database after every SQL change  
🔹 Lets you **rollback**, **branch**, and **query past states**

## 📦 How it works

- Data stored in `data.db` (SQLite)
- Every `INSERT`, `UPDATE`, `DELETE` triggers a `git commit`
- `checkout.sh` lets you time travel
- `query.sh` lets you run queries on old DB versions without changing anything

## 🚀 How to Use

1. Run demo:

```bash
node demo.js
```
