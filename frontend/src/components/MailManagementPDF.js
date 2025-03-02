import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";

// 🟢 フォント登録
Font.register({
    family: "NotoSansJP",
    src: `${window.location.origin}/fonts/NotoSansJP-Regular.ttf`,
    fontStyle: "normal",
    fontWeight: "normal",
    unicode: true,
});

// 🟢 スタイル設定
const styles = StyleSheet.create({
    title: {
        textAlign: "center",
        fontSize: 16,
        marginBottom: 10,
        fontFamily: "NotoSansJP",
    },
    table: {
        display: "table",
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "#aaa",
        paddingVertical: 2,
    },
    tableCell: {
        padding: 4,
        fontSize: 10,
        borderRightWidth: 0.5,
        borderRightColor: "#aaa",
        textAlign: "left",
        fontFamily: "NotoSansJP",
    },
    header: {
        backgroundColor: "#f2f2f2",
        fontWeight: "bold",
    },
    rightAlign: {
        textAlign: "right",
    },
    totalSection: {
        marginTop: 20,
        textAlign: "right",
        paddingRight: 10,
        fontFamily: "NotoSansJP",
    },
    boldText: {
        fontWeight: "bold",
        fontSize: 12,
    },
    totalItem: {
        marginVertical: 2,
    },
    narrowCell: { flex: 1 },
    mediumCell: { flex: 2 },
    wideCell: { flex: 3 },
    extraWideCell: { flex: 4 },
    page: {
        padding: 20,
        fontFamily: "NotoSansJP",
    },
    marginVertical: {
        marginVertical: 5, // 🟢 間隔
    },
});

const MailManagementPDF = ({ mails = [], currentMonth }) => {
    if (!mails || mails.length === 0) {
        return (
            <Document>
                <Page style={styles.page}>
                    <Text style={styles.title}>郵便物一覧 ({currentMonth}月)</Text>
                    <Text>データがありません</Text>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            <Page style={styles.page} size="A4" wrap>
                <Text style={styles.title}>郵便物一覧 ({currentMonth}月)</Text>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.header]}>
                        <Text style={[styles.tableCell, styles.mediumCell]}>届いた日</Text>
                        <Text style={[styles.tableCell, styles.extraWideCell]}>会社名</Text>
                        <Text style={[styles.tableCell, styles.narrowCell]}>区分</Text>
                        <Text style={[styles.tableCell, styles.mediumCell, styles.rightAlign]}>金額</Text>
                        <Text style={[styles.tableCell, styles.wideCell]}>内容</Text>
                    </View>

                    {mails.map((mail, index) => (
                        <View
                            key={`mail-${index}`}
                            style={styles.tableRow}
                            wrap={false} // 🟢 改ページ対応
                        >
                            <Text style={[styles.tableCell, styles.mediumCell]}>
                                {mail.received_date ? new Date(mail.received_date).toLocaleDateString("ja-JP") : "未登録"}
                            </Text>
                            <Text style={[styles.tableCell, styles.extraWideCell]}>{mail.company_name || "不明な会社"}</Text>
                            <Text style={[styles.tableCell, styles.narrowCell]}>{mail.category || "未設定"}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell, styles.rightAlign]}>
                                {mail.amount ? mail.amount.toLocaleString() : "0"}
                            </Text>
                            <Text style={[styles.tableCell, styles.wideCell]}>{mail.description || "なし"}</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default MailManagementPDF;
