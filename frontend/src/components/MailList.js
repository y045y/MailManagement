import React from "react";
import { Table, Button, Container } from "react-bootstrap";

const MailList = ({ mails, setMails, onEditMail }) => {
    const handleDelete = async (id) => {
        if (!window.confirm("本当に削除しますか？")) return;

        try {
            await fetch(`http://localhost:5000/mails/${id}`, { method: "DELETE" });
            setMails(mails.filter(mail => mail.id !== id));
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "なし";
        return new Date(dateString).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    };

    return (
        <Container>
            <h2>📬 郵便物一覧</h2>
            <Table striped bordered hover>
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
                                <Button variant="warning" size="sm" onClick={() => onEditMail(mail)}>編集</Button>
                                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(mail.id)}>削除</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default MailList;
