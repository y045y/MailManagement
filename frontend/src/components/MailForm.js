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
        <Container className="mt-4">
            <h2 className="text-center">{editMail ? "📄 郵便物を編集" : "📬 郵便物を登録"}</h2>
            <Form onSubmit={handleSubmit} className="p-3 border rounded bg-light shadow-sm">
                
                {/* 1行目: 届いた日・会社名・区分 */}
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group controlId="received_date">
                            <Form.Label>届いた日</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="received_date" 
                                value={formData.received_date} 
                                onChange={handleChange} 
                                required 
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="client_id">
                            <Form.Label>会社</Form.Label>
                            <Form.Select name="client_id" value={formData.client_id} onChange={handleChange} required>
                                <option value="">選択してください</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.company_name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="category">
                            <Form.Label>区分</Form.Label>
                            <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">選択してください</option>
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                {/* 2行目: 金額・内容・振替日・振込期限 */}
                <Row className="mb-3">
                    <Col md={3}>
                        <Form.Group controlId="amount">
                            <Form.Label>金額</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="amount" 
                                placeholder="金額を入力" 
                                value={formData.amount} 
                                onChange={handleChange} 
                                required 
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="description">
                            <Form.Label>内容</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="description" 
                                placeholder="内容を入力" 
                                value={formData.description} 
                                onChange={handleChange} 
                                required 
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="transfer_date">
                            <Form.Label>振替日</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="transfer_date" 
                                value={formData.transfer_date} 
                                onChange={handleChange} 
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="payment_deadline">
                            <Form.Label>振込期限</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="payment_deadline" 
                                value={formData.payment_deadline} 
                                onChange={handleChange} 
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* ボタンエリア */}
                <div className="text-center">
                    <Button variant="primary" type="submit" className="me-2">
                        {editMail ? "更新" : "登録"}
                    </Button>
                    {editMail && (
                        <Button variant="secondary" onClick={() => setEditingMail(null)}>
                            キャンセル
                        </Button>
                    )}
                </div>

            </Form>
        </Container>
    );
};

export default MailForm;
