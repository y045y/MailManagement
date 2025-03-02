import React, { useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MailManagementPDF from "./MailManagementPDF";
import PaymentManagementPDF from "./PaymentManagementPDF"; // 🟢 新しく追加！

// 🟢 ボタンスタイル設定
const buttonStyle = {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    marginRight: "10px"
};

// 🟢 PDFButton コンポーネント
const PDFButton = ({
    mails = [],
    payments = [],
    currentMonth = 1,
    buttonText = "PDF出力",
    type = "mail"
}) => {
    console.log("📦 PDFButton に渡された mails:", mails);
    console.log("📦 PDFButton に渡された payments:", payments);

    // 🟢 コンポーネントのマウント時にログ出力
    useEffect(() => {
        console.log("🟢 PDFButton に渡された mails:", mails);
        console.log("🟢 PDFButton に渡された payments:", payments);
    }, [mails, payments]);

    // 🟠 データが空の場合の表示
    if (
        (mails.length === 0 || mails.every(array => array.length === 0)) &&
        (payments.length === 0 || payments.every(array => array.length === 0))
    ) {
        console.log("⚠️ データが空です！");
        return <span style={{ color: "red" }}>データがありません</span>;
    }

    // 🟢 `type` によって使う PDF コンポーネントを切り替え
    const DocumentComponent = type === "mail" ? MailManagementPDF : PaymentManagementPDF;
    const data = type === "mail" ? mails : payments;
    const fileName = type === "mail"
        ? `郵便物一覧_${currentMonth}月.pdf`
        : `振込振替一覧_${currentMonth}月.pdf`;

    // 🟢 PDFDownloadLink コンポーネントで PDF を生成してダウンロード
    return (
        <PDFDownloadLink
            document={
                <DocumentComponent
                    mails={type === "mail" ? mails : []}
                    payments={type === "payment" ? payments : []}
                    currentMonth={currentMonth}
                />
            }
            fileName={fileName}
            style={buttonStyle}
            key={`${type}-${currentMonth}-${data.length}`}  // 🔄 再レンダリング用のキーを追加
        >
            {({ blob, url, loading, error }) => {
                if (error) {
                    console.log("🛑 PDF生成エラー:", error.message);
                    return <span style={{ color: "red" }}>エラー: {error.message}</span>;
                }

                if (loading) {
                    console.log("📄 PDFを生成中...");
                    return <span style={{ color: "gray" }}>出力中...</span>;
                }

                console.log("📦 PDFButton に渡された mails:", mails);
                console.log("📦 PDFButton に渡された payments:", payments);  // 🔄 ここを確認
                console.log("📦 paymentData[0]:", payments[0]);                // 🔄 ここも確認
                console.log("📦 paymentData[1]:", payments[1]);                // 🔄 ここも確認
                

                return buttonText;
            }}
        </PDFDownloadLink>
    );
};

export default PDFButton;
