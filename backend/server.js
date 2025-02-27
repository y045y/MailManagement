const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MSSQL接続設定
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),  // ポートを整数に変換
    options: { 
        encrypt: false, // Azure以外はfalseにする
        enableArithAbort: true 
    }
};


// DB接続
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log('✅ MSSQL 接続成功');
    } catch (err) {
        console.error('❌ DB接続エラー:', err);
    }
}
connectDB();

// API: 取引先リスト取得
app.get('/clients', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Clients');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'データ取得エラー' });
    }
});

// API: 請求データ取得
app.get('/invoices', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Invoices');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'データ取得エラー' });
    }
});

app.post('/clients', async (req, res) => {
    try {
        const { company_name, bank_name, branch_name, account_number, account_type, payment_method } = req.body;

        // まずは、同じ会社名が存在しないかチェック
        const checkQuery = `
            SELECT COUNT(*) AS count FROM Clients WHERE company_name = @company_name
        `;
        const checkRequest = new sql.Request();
        checkRequest.input('company_name', sql.NVarChar, company_name);
        const checkResult = await checkRequest.query(checkQuery);

        if (checkResult.recordset[0].count > 0) {
            return res.status(400).json({ error: "この会社名はすでに登録されています。" });
        }

        // 会社情報を追加
        const query = `
            INSERT INTO Clients (company_name, bank_name, branch_name, account_number, account_type, payment_method)
            VALUES (@company_name, @bank_name, @branch_name, @account_number, @account_type, @payment_method)
        `;

        const request = new sql.Request();
        request.input('company_name', sql.NVarChar, company_name);
        request.input('bank_name', sql.NVarChar, bank_name);
        request.input('branch_name', sql.NVarChar, branch_name);
        request.input('account_number', sql.NVarChar, account_number);
        request.input('account_type', sql.NVarChar, account_type);
        request.input('payment_method', sql.NVarChar, payment_method);

        await request.query(query);
        res.status(201).json({ message: '取引先が追加されました' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'データ追加エラー' });
    }
});

app.post('/mails', async (req, res) => {
    try {
        const { received_date, company_name, category, description, transfer_date, payment_deadline } = req.body;

        console.log("受信データ:", req.body); // デバッグ用

        const query = `
            INSERT INTO Mails (received_date, company_name, category, description, transfer_date, payment_deadline)
            VALUES (@received_date, @company_name, @category, @description, @transfer_date, @payment_deadline)
        `;

        const request = new sql.Request();
        request.input('received_date', sql.Date, received_date);
        request.input('company_name', sql.NVarChar, company_name);
        request.input('category', sql.NVarChar, category);
        request.input('description', sql.NVarChar, description || '');
        request.input('transfer_date', sql.Date, transfer_date || null);
        request.input('payment_deadline', sql.Date, payment_deadline || null);

        console.log("DB登録データ:", {
            received_date,
            company_name,
            category,
            description,
            transfer_date,
            payment_deadline
        }); // デバッグ用

        await request.query(query);
        res.status(201).json({ message: '郵便物が登録されました' });

    } catch (err) {
        console.error("DBエラー:", err);
        res.status(500).json({ error: 'データ追加エラー' });
    }
});



app.get('/mails', async (req, res) => {
    try {
        const result = await sql.query('SELECT * FROM Mails ORDER BY received_date DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'データ取得エラー' });
    }
});



// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
});
