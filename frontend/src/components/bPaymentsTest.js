import React, { useState, useEffect } from "react";
import axios from "axios";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentsTestPDF from "./PaymentsTestPDF";

const PaymentsTest = () => {
    const [payments, setPayments] = useState([]);
    const [currentYear] = useState(new Date().getFullYear());
    const [currentMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                console.log("📡 振込・振替データ取得テスト開始...");
                const response = await axios.get(`http://localhost:5000/payments`, {
                    params: { 
                        month: currentMonth,
                        year: currentYear
                    }
                });
                
                const data = response.data;
                console.log("📦 取得した振込・振替データ (テスト):", data);
                setPayments(data);
            } catch (error) {
                console.error("🛑 振込・振替データ取得エラー (テスト):", error);
            }
        };

        fetchPayments();
    }, [currentMonth, currentYear]);

    return (
        <div style={{ padding: "20px" }}>
            <h2>振込・振替データテスト表示 ({currentMonth}月)</h2>
            <pre>{JSON.stringify(payments, null, 2)}</pre>
            
            {/* 🔄 PDF 出力ボタンを追加 */}
            <div style={{ marginTop: "20px" }}>
            <PDFDownloadLink
                document={<PaymentsTestPDF payments={payments} currentMonth={currentMonth} />}
                fileName={`振込振替一覧_${currentMonth}月.pdf`}
                style={{
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "none"
                }}
            >
                {({ loading }) => (loading ? "PDFを生成中..." : "PDF出力")}
            </PDFDownloadLink>

            </div>
        </div>
    );
};

export default PaymentsTest;
