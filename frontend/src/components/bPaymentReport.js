import React from "react";
import { Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 📌 日本語フォントのロード関数
const loadCustomFont = async () => {
    try {
        const fontUrl = "/fonts/NotoSansJP-Regular.ttf"; // フォントファイルのパス
        const response = await fetch(fontUrl);
        if (!response.ok) throw new Error("フォントの読み込みに失敗しました");

        const fontData = await response.arrayBuffer();
        return fontData;
    } catch (error) {
        console.error("フォントロードエラー:", error);
        return null;
    }
};

const PaymentReport = ({ mails }) => {
    const currentMonth = new Date().getMonth() + 1; // 現在の月

    const generatePDF = async () => {
        const doc = new jsPDF();

        // 📌 カスタムフォントをロード
        const fontData = await loadCustomFont();
        if (fontData) {
            doc.addFileToVFS("NotoSansJP-Regular.ttf", fontData);
            doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal");
            doc.setFont("NotoSansJP");
        } else {
            console.warn("フォントが読み込めなかったため、デフォルトフォントを使用します。");
        }

        doc.setFontSize(16);
        doc.text(`${currentMonth}月 振込一覧表`, 15, 10);

        // 📌 今月の振込一覧を取得（振込日が今月のデータのみ）
        const filteredPayments = mails.filter(mail => {
            if (!mail.transfer_date) return false;
            const transferMonth = new Date(mail.transfer_date).getMonth() + 1;
            return transferMonth === currentMonth;
        });

        // 📌 振込一覧データを作成
        const paymentData = filteredPayments.map(mail => [
            mail.company_name,
            mail.amount ? `${mail.amount.toLocaleString()} 円` : "なし",
            mail.payment_deadline ? new Date(mail.payment_deadline).toLocaleDateString("ja-JP") : "なし",
        ]);

        let lastTable = null;

        if (paymentData.length > 0) {
            lastTable = autoTable(doc, {
                head: [["振込先", "金額", "振込期限"]],
                body: paymentData,
                startY: 20,
                theme: "grid",
                styles: { font: "NotoSansJP", fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 60 }, // 振込先
                    1: { cellWidth: 40 }, // 金額
                    2: { cellWidth: 40 }, // 振込期限
                },
            });
        } else {
            doc.text("振込予定はありません", 15, 30);
        }

        // 📌 今月の振替データを作成
        const transferData = filteredPayments.map(mail => [
            mail.transfer_date ? new Date(mail.transfer_date).toLocaleDateString("ja-JP") : "なし",
            mail.company_name,
            mail.amount ? `${mail.amount.toLocaleString()} 円` : "なし",
        ]);

        if (transferData.length > 0) {
            lastTable = autoTable(doc, {
                head: [["振替日", "会社名", "金額"]],
                body: transferData,
                startY: lastTable ? lastTable.finalY + 15 : 40,
                theme: "grid",
                styles: { font: "NotoSansJP", fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 40 }, // 振替日
                    1: { cellWidth: 60 }, // 会社名
                    2: { cellWidth: 40 }, // 金額
                },
            });
        } else {
            doc.text("振替予定はありません", 15, lastTable ? lastTable.finalY + 15 : 40);
        }

        // 📌 今月の出費合計
        const totalExpense = filteredPayments.reduce((sum, mail) => sum + (mail.amount ? parseFloat(mail.amount) : 0), 0);
        const startY = lastTable ? lastTable.finalY + 15 : 60;
        doc.text(`💰 今月の出費合計: ${totalExpense.toLocaleString()} 円`, 15, startY);

        // 🔹 PDF ダウンロード
        doc.save(`振込一覧_${currentMonth}月.pdf`);
    };

    return (
        <div className="text-center mt-4">
            <Button variant="primary" onClick={generatePDF}>
                PDFをダウンロード
            </Button>
        </div>
    );
};

export default PaymentReport;
