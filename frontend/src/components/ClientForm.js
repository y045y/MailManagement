import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

const ClientForm = ({ editingClient, setEditingClient, refreshClients }) => {
    const [companyName, setCompanyName] = useState("");
    const [bankName, setBankName] = useState("");
    const [branchName, setBranchName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountType, setAccountType] = useState("普通");
    const [paymentMethod, setPaymentMethod] = useState("振込");

    useEffect(() => {
        if (editingClient) {
            setCompanyName(editingClient.company_name);
            setBankName(editingClient.bank_name || "");
            setBranchName(editingClient.branch_name || "");
            setAccountNumber(editingClient.account_number || "");
            setAccountType(editingClient.account_type);
            setPaymentMethod(editingClient.payment_method);
        }
    }, [editingClient]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const clientData = {
            company_name: companyName,
            bank_name: bankName,
            branch_name: branchName,
            account_number: accountNumber,
            account_type: accountType,
            payment_method: paymentMethod
        };

        if (editingClient) {
            await fetch(`http://localhost:5000/clients/${editingClient.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clientData)
            });
            setEditingClient(null);
        } else {
            await fetch("http://localhost:5000/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clientData)
            });
        }

        refreshClients();
        setCompanyName("");
        setBankName("");
        setBranchName("");
        setAccountNumber("");
        setAccountType("普通");
        setPaymentMethod("振込");
    };

    return (
        <Container className="mt-4">
            <h2 className="text-center">{editingClient ? "✏ 取引先を編集" : "📝 取引先を登録"}</h2>
            <Form onSubmit={handleSubmit} className="p-3 border rounded bg-light shadow-sm">
                <Row className="mb-3">
                    <Col>
                        <Form.Group controlId="companyName">
                            <Form.Label>会社名</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="会社名を入力" 
                                value={companyName} 
                                onChange={(e) => setCompanyName(e.target.value)} 
                                required 
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="bankName">
                            <Form.Label>銀行名</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="銀行名を入力" 
                                value={bankName} 
                                onChange={(e) => setBankName(e.target.value)} 
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="branchName">
                            <Form.Label>支店名</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="支店名を入力" 
                                value={branchName} 
                                onChange={(e) => setBranchName(e.target.value)} 
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="accountNumber">
                            <Form.Label>口座番号</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="口座番号を入力" 
                                value={accountNumber} 
                                onChange={(e) => setAccountNumber(e.target.value)} 
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="accountType">
                            <Form.Label>口座種別</Form.Label>
                            <Form.Select 
                                value={accountType} 
                                onChange={(e) => setAccountType(e.target.value)}
                            >
                                <option value="普通">普通</option>
                                <option value="当座">当座</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="paymentMethod">
                            <Form.Label>支払い方法</Form.Label>
                            <Form.Select 
                                value={paymentMethod} 
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="振込">振込</option>
                                <option value="現金">現金</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="text-center">
                    <Button variant="primary" type="submit" className="me-2">
                        {editingClient ? "更新" : "登録"}
                    </Button>
                    {editingClient && (
                        <Button variant="secondary" onClick={() => setEditingClient(null)}>
                            キャンセル
                        </Button>
                    )}
                </div>
            </Form>
        </Container>
    );
};

export default ClientForm;
