import React, { useEffect, useState } from "react";

const ClientList = ({ onEditClient, onDeleteClient }) => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/clients")
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error("データ取得エラー:", error));
    }, []);

    return (
        <div>
            <h2>📋 取引先一覧</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>会社名</th>
                        <th>銀行名</th>
                        <th>支店名</th>
                        <th>口座番号</th>
                        <th>口座種別</th>
                        <th>支払い方法</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td>{client.company_name}</td>
                            <td>{client.bank_name || "なし"}</td>
                            <td>{client.branch_name || "なし"}</td>
                            <td>{client.account_number || "なし"}</td>
                            <td>{client.account_type}</td>
                            <td>{client.payment_method}</td>
                            <td>
                                <button onClick={() => onEditClient(client)}>編集</button>
                                <button onClick={() => onDeleteClient(client.id)}>削除</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ClientList;
