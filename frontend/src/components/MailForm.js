import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

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

    const fetchClients = async () => {
        try {
            const response = await fetch("http://localhost:5000/clients");
            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error("取引先データ取得エラー:", error);
        }
    };

    useEffect(() => {
        if (editMail) {
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
        <Container className="mb-4">
            <h2 className="mb-3">{editMail ? "📄 郵便物を編集" : "📬 郵便物を登録"}</h2>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col>
                        <Form.Label>届いた日</Form.Label>
                        <Form.Control type="date" name="received_date" value={formData.received_date} onChange={handleChange} required />
                    </Col>
                    <Col>
                        <Form.Label>会社</Form.Label>
                        <Form.Select name="client_id" value={formData.client_id} onChange={handleChange} required>
                            <option value="">選択してください</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.company_name}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col>
                        <Form.Label>区分</Form.Label>
                        <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="">選択してください</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col>
                        <Form.Label>金額</Form.Label>
                        <Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                    </Col>
                    <Col>
                        <Form.Label>内容</Form.Label>
                        <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} required />
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col>
                        <Form.Label>振替日</Form.Label>
                        <Form.Control type="date" name="transfer_date" value={formData.transfer_date} onChange={handleChange} />
                    </Col>
                    <Col>
                        <Form.Label>振込期限</Form.Label>
                        <Form.Control type="date" name="payment_deadline" value={formData.payment_deadline} onChange={handleChange} />
                    </Col>
                </Row>

                <Button variant="primary" type="submit">{editMail ? "更新" : "登録"}</Button>
                {editMail && <Button variant="secondary" className="ms-2" onClick={() => setEditingMail(null)}>キャンセル</Button>}
            </Form>
        </Container>
    );
};

export default MailForm;
