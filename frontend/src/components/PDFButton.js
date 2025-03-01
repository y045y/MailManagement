import React from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// PDFのスタイル設定
const styles = StyleSheet.create({
    page: { padding: 20 },
    title: { fontSize: 18, marginBottom: 10, textAlign: "center" },
    table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { flexDirection: "row" },
    tableCol: { borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, flex: 1, padding: 2 },
    tableCell: { margin: 5, fontSize: 10 },
    noDataText: { textAlign: "center", marginTop: 20, fontSize: 12, color: "grey" }
});

// PDFドキュメント
const PaymentPDFDocument = ({ mails, currentMonth }) => (
    <Document>
        <Page style={styles.page}>
            <Text style={styles.title}>{currentMonth}月の振込・振替一覧</Text>
            <View style={styles.table}>
                {/* テーブルヘッダー */}
                <View style={styles.tableRow}>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>種別</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>期限</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>会社名</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>金額</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>内容</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>銀行名</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>支店名</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>口座種別</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>口座番号</Text></View>
                </View>
                {/* テーブルデータ */}
                {mails.length > 0 ? (
                    mails.map((mail, index) => (
                        <View style={styles.tableRow} key={mail.id || index}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.種別 || "なし"}</Text></View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>
                                    {mail.期限 ? new Date(mail.期限).toLocaleDateString("ja-JP") : "なし"}
                                </Text>
                            </View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.会社名 || "不明な会社"}</Text></View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{mail.金額?.toLocaleString() || "0"} 円</Text>
                            </View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.内容 || "なし"}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.銀行名 || "未登録"}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.支店名 || "未登録"}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.口座種別 || "未設定"}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.口座番号 || "未登録"}</Text></View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noDataText}>データがありません</Text>
                )}
            </View>
        </Page>
    </Document>
);

// PDF出力ボタン
const PDFButton = ({ mails = [], currentMonth = 1, buttonText = "PDF出力" }) => (
    <PDFDownloadLink
        document={<PaymentPDFDocument mails={mails} currentMonth={currentMonth} />}
        fileName={`振込振替一覧_${currentMonth}月.pdf`}
        className="btn btn-primary me-2"
    >
        {({ loading }) => (loading ? "出力中..." : buttonText)}
    </PDFDownloadLink>
);

export default PDFButton;
