import React, { useEffect, useState } from "react";
import MailList from "../components/MailList";
import MailForm from "../components/MailForm";

const MailManagement = () => {
    const [mails, setMails] = useState([]);
    const [editingMail, setEditingMail] = useState(null);

    useEffect(() => {
        fetchMails();
    }, []);

    // 郵便物リストを取得
    const fetchMails = async () => {
        try {
            const response = await fetch("http://localhost:5000/mails");
            const data = await response.json();
            console.log("郵便物リスト:", data);
            setMails(data);
        } catch (error) {
            console.error("データ取得エラー:", error);
        }
    };

    // 新規登録または編集時の送信
    const handleSubmit = async (mailData) => {
        const method = editingMail ? "PUT" : "POST";
        const url = editingMail ? `http://localhost:5000/mails/${editingMail.id}` : "http://localhost:5000/mails";

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mailData),
            });

            if (!response.ok) throw new Error("登録・更新に失敗しました");

            await fetchMails(); // 更新後にリストをリロード
            setEditingMail(null); // 編集モードを解除
        } catch (error) {
            console.error("登録・更新エラー:", error);
        }
    };

    // 編集モードへ切り替え
    const onEditMail = (mail) => {
        console.log("編集する郵便物:", mail);
        setEditingMail(mail);
    };

    return (
        <div>
            <h1>📨 郵便物管理</h1>
            <MailForm
                editMail={editingMail} // `editingMail` の値を渡す
                setEditingMail={setEditingMail}
                refreshMails={fetchMails}
                onSubmit={handleSubmit}
            />
            <MailList
                mails={mails}
                setMails={setMails}
                onEditMail={onEditMail}
            />
        </div>
    );
};

export default MailManagement;
