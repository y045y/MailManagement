import React, { useState, useEffect } from "react";

const ClientForm = ({ editingClient, setEditingClient, refreshClients }) => {
    const [companyName, setCompanyName] = useState("");
    const [bankName, setBankName] = useState("");
    const [branchName, setBranchName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountType, setAccountType] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

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
            // 編集モード
            await fetch(`http://localhost:5000/clients/${editingClient.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clientData)
            });
            setEditingClient(null);
        } else {
            // 新規登録モード
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
        setAccountType("");
        setPaymentMethod("");
    };

    return (
        <div>
            <h2>{editingClient ? "✏ 取引先を編集" : "📝 取引先を登録"}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="会社名" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                <input type="text" placeholder="銀行名" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                <input type="text" placeholder="支店名" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
                <input type="text" placeholder="口座番号" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                    <option value="普通">普通</option>
                    <option value="当座">当座</option>
                </select>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="振込">振込</option>
                    <option value="現金">現金</option>
                </select>
                <button type="submit">{editingClient ? "更新" : "登録"}</button>
                {editingClient && <button type="button" onClick={() => setEditingClient(null)}>キャンセル</button>}
            </form>
        </div>
    );
};

export default ClientForm;
