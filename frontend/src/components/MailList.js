import React, { useEffect } from "react";

const MailList = ({ mails, setMails, onEditMail }) => {
    useEffect(() => {
        fetch("http://localhost:5000/mails")
            .then(response => response.json())
            .then(data => setMails(data))
            .catch(error => console.error("データ取得エラー:", error));
    }, [setMails]);

    // 郵便物の削除処理
    const handleDelete = async (id) => {
        if (!window.confirm("本当に削除しますか？")) return;

        try {
            await fetch(`http://localhost:5000/mails/${id}`, { method: "DELETE" });

            // フロント側でも即時反映
            setMails(mails.filter(mail => mail.id !== id));
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    // 日付を "M/D" 形式に変換
    const formatDate = (dateString) => {
        if (!dateString) return "なし";
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    return (
        <div>
            <h2>📬 郵便物一覧</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>届いた日</th>
                        <th>会社名</th>
                        <th>区分</th>
                        <th>金額</th>
                        <th>内容</th>
                        <th>振替日</th>
                        <th>振込期限</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {mails.map(mail => (
                        <tr key={mail.id}>
                            <td>{formatDate(mail.received_date)}</td>
                            <td>{mail.company_name === "new" ? "不明な会社" : mail.company_name}</td>
                            <td>{mail.category}</td>
                            <td>{mail.amount}</td>
                            <td>{mail.description}</td>
                            <td>{formatDate(mail.transfer_date)}</td>
                            <td>{formatDate(mail.payment_deadline)}</td>
                            <td>
                                <button onClick={() => onEditMail(mail)}>編集</button>
                                <button onClick={() => handleDelete(mail.id)}>削除</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MailList;
