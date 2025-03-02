import React, { useEffect } from "react";
import { Table, Button, Container } from "react-bootstrap";

const ClientList = ({ clients, setClients, onEditClient, onDeleteClient }) => {
    useEffect(() => {
        fetch("http://localhost:5000/clients")
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error("データ取得エラー:", error));
    }, [setClients]); // クライアントリストが更新されたら再取得

    return (
        <Container className="mt-4">
            <h2>📋 取引先一覧</h2>
            <Table striped bordered hover responsive>
            <thead className="table-dark">
                <tr>
                    <th>会社名</th>
                    <th>銀行名</th>
                    <th>支店名</th>
                    <th>口座番号</th>
                    <th>口座種別</th>
                    <th>支払い方法</th>
                    <th>取引内容</th>
                    <th>操作</th>
                </tr>
            </thead>
                <tbody>
    {clients.map(client => (
        <React.Fragment key={client.id}>
            <tr>
                <td>{client.company_name}</td>
                <td>{client.bank_name || "なし"}</td>
                <td>{client.branch_name || "なし"}</td>
                <td>{client.account_number || "なし"}</td>
                <td>{client.account_type}</td>
                <td>{client.payment_method}</td>
                <td>{client.transaction_details || "なし"}</td>
                <td>
                    <Button 
                        variant="warning" 
                        size="sm" 
                        className="me-2"
                        onClick={() => onEditClient(client)}
                    >
                        編集
                    </Button>
                    <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => onDeleteClient(client.id)}
                    >
                        削除
                    </Button>
                </td>
            </tr>
        </React.Fragment>
    ))}
</tbody>


            </Table>
        </Container>
    );
};

export default ClientList;
