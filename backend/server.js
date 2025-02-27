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


app.delete("/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM Clients WHERE id = @id";
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        
        const result = await request.query(query); // ✅ 結果を取得
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "削除対象の取引先が見つかりません" });
        }

        res.json({ message: "取引先を削除しました" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "削除エラー" });
    }
});


/**
 * 取引先の修正 (更新)
 */
app.put("/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, bank_name, branch_name, account_number, account_type, payment_method } = req.body;

        const query = `
            UPDATE Clients
            SET company_name = @company_name,
                bank_name = @bank_name,
                branch_name = @branch_name,
                account_number = @account_number,
                account_type = @account_type,
                payment_method = @payment_method
            WHERE id = @id
        `;

        const request = new sql.Request();
        request.input("id", sql.Int, id);
        request.input("company_name", sql.NVarChar, company_name);
        request.input("bank_name", sql.NVarChar, bank_name);
        request.input("branch_name", sql.NVarChar, branch_name);
        request.input("account_number", sql.NVarChar, account_number);
        request.input("account_type", sql.NVarChar, account_type);
        request.input("payment_method", sql.NVarChar, payment_method);

        await request.query(query);
        res.json({ message: "取引先情報を更新しました" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "更新エラー" });
    }
});


app.post('/mails', async (req, res) => {
    try {
        const { received_date, client_id, category, amount, transfer_date, payment_deadline, description } = req.body;


        const query = `
        INSERT INTO Mails (received_date, client_id, category, amount, transfer_date, payment_deadline, description)
        VALUES (@received_date, @client_id, @category, @amount, @transfer_date, @payment_deadline, @description)
            `;
            
            const request = new sql.Request();
            request.input('received_date', sql.Date, received_date);
            request.input('client_id', sql.Int, client_id);  // 🔄 変更
            request.input('category', sql.NVarChar, category);
            request.input('amount', sql.Decimal(18,2), amount);
            request.input('transfer_date', sql.Date, transfer_date || null);
            request.input('payment_deadline', sql.Date, payment_deadline || null);
            request.input('description', sql.NVarChar, description);
            

        await request.query(query);
        res.status(201).json({ message: '郵便物が追加されました' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'データ追加エラー' });
    }
});



app.get('/mails', async (req, res) => {
    try {
        const query = `
            SELECT 
                Mails.id, 
                Mails.received_date, 
                Clients.company_name, 
                Mails.category, 
                Mails.amount, 
                Mails.description, 
                Mails.transfer_date, 
                Mails.payment_deadline 
            FROM Mails
            LEFT JOIN Clients ON Mails.client_id = Clients.id
            ORDER BY Mails.received_date ASC, Mails.id ASC  -- ✅ 修正
        `;

        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'データ取得エラー' });
    }
});


/**
 * 郵便物の削除
 */
app.delete("/mails/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM Mails WHERE id = @id";
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        await request.query(query);
        res.json({ message: "郵便物を削除しました" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "削除エラー" });
    }
});

/**
 * 郵便物の修正 (更新)
 */
app.put("/mails/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { received_date, client_id, category, amount, transfer_date, payment_deadline, description } = req.body;

        const query = `
            UPDATE Mails
            SET received_date = @received_date,
                client_id = @client_id,  -- 修正: company_name → client_id
                category = @category,
                amount = @amount,
                transfer_date = @transfer_date,
                payment_deadline = @payment_deadline,
                description = @description
            WHERE id = @id
        `;

        const request = new sql.Request();
        request.input("id", sql.Int, id);
        request.input("received_date", sql.Date, received_date);
        request.input("client_id", sql.Int, client_id);  // 修正: company_name ではなく client_id
        request.input("category", sql.NVarChar, category);
        request.input("amount", sql.Decimal(18, 2), amount);
        request.input("transfer_date", sql.Date, transfer_date || null);
        request.input("payment_deadline", sql.Date, payment_deadline || null);
        request.input("description", sql.NVarChar, description);

        await request.query(query);
        res.json({ message: "郵便物情報を更新しました" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "更新エラー" });
    }
});

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
});
