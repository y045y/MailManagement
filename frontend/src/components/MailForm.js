import React, { useEffect, useState } from "react";

const MailForm = ({ onSubmit, editMail, setEditingMail, refreshMails }) => {
    const [formData, setFormData] = useState({
        received_date: "",
        client_id: "",
        category: "",
        amount: "",
        transfer_date: "",
        payment_deadline: "",
        description: "",
    });

    const [clients, setClients] = useState([]);
    const categories = ["請求書", "納品書", "お知らせ"];

    useEffect(() => {
        fetchClients();
    }, []);

    // 取引先一覧を取得
    const fetchClients = async () => {
        try {
            const response = await fetch("http://localhost:5000/clients");
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error("取引先データ取得エラー:", error);
        }
    };

    // 編集モード時に `formData` を更新
    useEffect(() => {
        if (editMail) {
            console.log("編集モード: ", editMail);
            setFormData({
                received_date: editMail.received_date ? editMail.received_date.split("T")[0] : "",
                client_id: editMail.client_id || "",
                category: editMail.category || "",
                amount: editMail.amount || "",
                transfer_date: editMail.transfer_date ? editMail.transfer_date.split("T")[0] : "",
                payment_deadline: editMail.payment_deadline ? editMail.payment_deadline.split("T")[0] : "",
                description: editMail.description || "",
            });
        }
    }, [editMail]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("送信データ:", formData);
        await onSubmit(formData);
        setFormData({
            received_date: "",
            client_id: "",
            category: "",
            amount: "",
            transfer_date: "",
            payment_deadline: "",
            description: "",
        });
        setEditingMail(null);
        refreshMails();
    };

    return (
        <div>
            <h2>{editMail ? "📄 郵便物を編集" : "📬 郵便物を登録"}</h2>
            <form onSubmit={handleSubmit}>
                <label>届いた日: </label>
                <input type="date" name="received_date" value={formData.received_date} onChange={handleChange} required />

                <label>会社: </label>
                <select name="client_id" value={formData.client_id} onChange={handleChange} required>
                    <option value="">選択してください</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.company_name}</option>
                    ))}
                </select>

                <label>区分: </label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">選択してください</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                    ))}
                </select>

                <label>金額: </label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />

                <label>内容: </label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required />

                <label>振替日: </label>
                <input type="date" name="transfer_date" value={formData.transfer_date} onChange={handleChange} />

                <label>振込期限: </label>
                <input type="date" name="payment_deadline" value={formData.payment_deadline} onChange={handleChange} />

                <button type="submit">{editMail ? "更新" : "登録"}</button>
                {editMail && <button type="button" onClick={() => setEditingMail(null)}>キャンセル</button>}
            </form>
        </div>
    );
};

export default MailForm;
