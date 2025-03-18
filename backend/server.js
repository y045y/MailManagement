const express = require('express');
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs")
const sql = require('mssql');
const cors = require('cors');
const { createObjectCsvStringifier } = require("csv-writer");

require('dotenv').config();


const app = express();
const upload = multer({ dest: "uploads/" }); // 一時保存ディレクトリ
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

// 取引先リスト取得 (GET)
app.get('/clients', async (req, res) => {
    try {
        const result = await sql.query('SELECT id, company_name, bank_name, branch_name, account_number, account_type, payment_method, transaction_details FROM Clients');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'データ取得エラー' });
    }
});

// 取引先追加 (POST)
app.post('/clients', async (req, res) => {
    try {
        const { company_name, bank_name, branch_name, account_number, account_type, payment_method, transaction_details } = req.body;

        // 会社名の重複チェック
        const checkQuery = `SELECT COUNT(*) AS count FROM Clients WHERE company_name = @company_name`;
        const checkRequest = new sql.Request();
        checkRequest.input('company_name', sql.NVarChar, company_name);
        const checkResult = await checkRequest.query(checkQuery);

        if (checkResult.recordset[0].count > 0) {
            return res.status(400).json({ error: "この会社名はすでに登録されています。" });
        }

        // 取引先情報を追加
        const query = `
            INSERT INTO Clients (company_name, bank_name, branch_name, account_number, account_type, payment_method, transaction_details)
            VALUES (@company_name, @bank_name, @branch_name, @account_number, @account_type, @payment_method, @transaction_details)
        `;

        const request = new sql.Request();
        request.input('company_name', sql.NVarChar, company_name);
        request.input('bank_name', sql.NVarChar, bank_name);
        request.input('branch_name', sql.NVarChar, branch_name);
        request.input('account_number', sql.NVarChar, account_number);
        request.input('account_type', sql.NVarChar, account_type);
        request.input('payment_method', sql.NVarChar, payment_method);
        request.input('transaction_details', sql.NVarChar, transaction_details || "未設定");

        await request.query(query);
        res.status(201).json({ message: '取引先が追加されました' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'データ追加エラー' });
    }
});

// 取引先削除 (DELETE)
app.delete("/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // `Mails` にこの `client_id` が存在するかチェック
        const checkQuery = "SELECT COUNT(*) AS count FROM Mails WHERE client_id = @id";
        const checkRequest = new sql.Request();
        checkRequest.input("id", sql.Int, id);
        const checkResult = await checkRequest.query(checkQuery);

        if (checkResult.recordset[0].count > 0) {
            return res.status(400).json({ error: "この取引先に関連する郵便物があるため削除できません" });
        }

        // クライアント削除処理
        const query = "DELETE FROM Clients WHERE id = @id";
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "削除対象の取引先が見つかりません" });
        }

        res.json({ message: "取引先を削除しました" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "削除エラー" });
    }
});

// 取引先の修正 (PUT)
app.put("/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, bank_name, branch_name, account_number, account_type, payment_method, transaction_details } = req.body;

        const query = `
            UPDATE Clients
            SET company_name = @company_name,
                bank_name = @bank_name,
                branch_name = @branch_name,
                account_number = @account_number,
                account_type = @account_type,
                payment_method = @payment_method,
                transaction_details = @transaction_details
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
        request.input("transaction_details", sql.NVarChar, transaction_details || "未設定");

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

app.get("/payments", async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: "month と year は必須です" });
        }

        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("TargetMonth", sql.Int, parseInt(month))
            .input("TargetYear", sql.Int, parseInt(year))
            .execute("GetPaymentsByMonth");

        res.json(result.recordsets); // 結果をJSONで返す
    } catch (err) {
        console.error("ストアド実行エラー:", err);
        res.status(500).json({ error: "データ取得エラー" });
    }
});

app.get("/export/clients", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Clients ORDER BY id ASC");

        const formattedData = result.recordset.map(client => ({
            id: client.id,
            company_name: client.company_name || "なし",
            bank_name: client.bank_name || "なし",
            branch_name: client.branch_name || "なし",
            account_number: client.account_number || "なし",
            account_type: client.account_type || "なし",
            payment_method: client.payment_method || "なし",
            transaction_details: client.transaction_details || "なし"
        }));

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: "id", title: "ID" },
                { id: "company_name", title: "会社名" },
                { id: "bank_name", title: "銀行名" },
                { id: "branch_name", title: "支店名" },
                { id: "account_number", title: "口座番号" },
                { id: "account_type", title: "口座種別" },
                { id: "payment_method", title: "支払方法" },
                { id: "transaction_details", title: "取引内容" }
            ]
        });

        const BOM = "\uFEFF";
        const csvData = BOM + csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedData);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=clients.csv");
        res.send(csvData);
    } catch (err) {
        console.error("CSVエクスポートエラー:", err);
        res.status(500).json({ error: "CSVエクスポートエラー" });
    }
});


app.get("/export/mails", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT 
                Mails.id, 
                Mails.received_date, 
                Clients.company_name, 
                Mails.category, 
                Mails.amount, 
                Mails.description, 
                Mails.transfer_date, 
                Mails.payment_deadline, 
                Mails.created_at
            FROM Mails
            LEFT JOIN Clients ON Mails.client_id = Clients.id
            ORDER BY Mails.received_date ASC, Mails.id ASC
        `);

        const formattedData = result.recordset.map(mail => ({
            id: mail.id,
            received_date: mail.received_date ? new Date(mail.received_date).toLocaleDateString() : "なし",
            company_name: mail.company_name || "なし",
            category: mail.category || "なし",
            amount: mail.amount ? mail.amount.toFixed(2) : "なし", // 小数第2位まで表示
            description: mail.description || "なし",
            transfer_date: mail.transfer_date ? new Date(mail.transfer_date).toLocaleDateString() : "なし",
            payment_deadline: mail.payment_deadline ? new Date(mail.payment_deadline).toLocaleDateString() : "なし",
            created_at: mail.created_at ? new Date(mail.created_at).toLocaleString("ja-JP") : "なし"
        }));

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: "id", title: "ID" },
                { id: "received_date", title: "届いた日" },
                { id: "company_name", title: "会社名" },
                { id: "category", title: "区分" },
                { id: "amount", title: "金額" },
                { id: "description", title: "内容" },
                { id: "transfer_date", title: "振替日" },
                { id: "payment_deadline", title: "振込期限" },
                { id: "created_at", title: "登録日時" }
            ]
        });

        const BOM = "\uFEFF";
        const csvData = BOM + csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formattedData);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=mails.csv");
        res.send(csvData);
    } catch (err) {
        console.error("CSVエクスポートエラー:", err);
        res.status(500).json({ error: "CSVエクスポートエラー" });
    }
});
app.post("/import/clients", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "ファイルがアップロードされていません" });

    const filePath = req.file.path;
    const clients = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
            clients.push({
                company_name: row["会社名"],
                bank_name: row["銀行名"],
                branch_name: row["支店名"],
                account_number: row["口座番号"],
                account_type: row["口座種別"],
                payment_method: row["支払方法"],
                transaction_details: row["取引内容"]
            });
        })
        .on("end", async () => {
            try {
                await sql.connect(dbConfig); // ✅ DB接続
                for (let client of clients) {
                    await new sql.Request() // ✅ 直接 sql.Request() を使う
                        .input("company_name", sql.NVarChar, client.company_name)
                        .input("bank_name", sql.NVarChar, client.bank_name)
                        .input("branch_name", sql.NVarChar, client.branch_name)
                        .input("account_number", sql.NVarChar, client.account_number)
                        .input("account_type", sql.NVarChar, client.account_type)
                        .input("payment_method", sql.NVarChar, client.payment_method)
                        .input("transaction_details", sql.NVarChar, client.transaction_details)
                        .query(`INSERT INTO Clients (company_name, bank_name, branch_name, account_number, account_type, payment_method, transaction_details)
                                VALUES (@company_name, @bank_name, @branch_name, @account_number, @account_type, @payment_method, @transaction_details)`);
                }
                fs.unlinkSync(filePath); // ✅ 一時ファイル削除
                res.json({ message: "取引先データをインポートしました" });
            } catch (error) {
                console.error("CSVインポートエラー:", error);
                res.status(500).json({ error: "インポートエラー" });
            }
        });
});


app.post("/import/mails", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "ファイルがアップロードされていません" });

    const filePath = req.file.path;
    const mails = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
            mails.push({
                received_date: row["届いた日"],
                client_id: row["会社ID"],
                category: row["区分"],
                amount: row["金額"],
                transfer_date: row["振替日"],
                payment_deadline: row["振込期限"],
                description: row["内容"]
            });
        })
        .on("end", async () => {
            try {
                await sql.connect(dbConfig);
                const pool = sql.pool;

                // **📌 ① 既存データを削除**
                await pool.request().query("DELETE FROM Mails");

                const validateDate = (date) => {
                    if (!date || isNaN(new Date(date))) {
                        return null;
                    }
                    return new Date(date).toISOString().split("T")[0]; // `YYYY-MM-DD` 形式に変換
                };

                const validateAmount = (amount) => {
                    const num = parseFloat(amount);
                    return isNaN(num) ? null : num;
                };

                // **📌 ② 新規インポート**
                for (let mail of mails) {
                    await pool.request()
                        .input("received_date", sql.Date, validateDate(mail.received_date))
                        .input("client_id", sql.Int, mail.client_id)
                        .input("category", sql.NVarChar, mail.category)
                        .input("amount", sql.Decimal(18,2), validateAmount(mail.amount))
                        .input("transfer_date", sql.Date, validateDate(mail.transfer_date))
                        .input("payment_deadline", sql.Date, validateDate(mail.payment_deadline))
                        .input("description", sql.NVarChar, mail.description)
                        .query(`
                            INSERT INTO Mails (received_date, client_id, category, amount, transfer_date, payment_deadline, description)
                            VALUES (@received_date, @client_id, @category, @amount, @transfer_date, @payment_deadline, @description)
                        `);
                }

                // **📌 ③ アップロードしたCSVファイルを削除**
                fs.unlinkSync(filePath);
                res.json({ message: "郵便物データをインポートしました（上書き）" });

            } catch (error) {
                console.error("CSVインポートエラー:", error);
                res.status(500).json({ error: "インポートエラー" });
            }
        });
});


// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
});
