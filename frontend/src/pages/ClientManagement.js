import React, { useEffect, useState } from "react";
import ClientList from "../components/ClientList";
import ClientForm from "../components/ClientForm";

const ClientManagement = () => {
    const [clients, setClients] = useState([]);
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    // 取引先リストを取得
    const fetchClients = () => {
        fetch("http://localhost:5000/clients")
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error("データ取得エラー:", error));
    };

    // 編集ボタンが押されたときの処理
    const onEditClient = (client) => {
        console.log("編集するクライアント:", client);
        setEditingClient(client);
    };

    // 削除処理
    const onDeleteClient = async (id) => {
        if (!window.confirm("本当に削除しますか？")) return;
        await fetch(`http://localhost:5000/clients/${id}`, { method: "DELETE" });
        fetchClients(); // 削除後にリスト更新
    };

    return (
        <div>
            <h1>🏢 取引先管理</h1>
            <ClientForm
                editingClient={editingClient}
                setEditingClient={setEditingClient}
                refreshClients={fetchClients}
            />
            <ClientList
                clients={clients}
                setClients={setClients}
                onEditClient={onEditClient}
                onDeleteClient={onDeleteClient}
            />
        </div>
    );
};

export default ClientManagement;
