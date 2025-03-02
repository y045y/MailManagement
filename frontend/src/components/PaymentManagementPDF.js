import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";

// 🟢 フォント登録 (必要なら)
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
        marginVertical: 5, // 🟢 振込と振替の間のスペース
    },
});

const PaymentManagementPDF = ({ payments = [], currentMonth }) => {
    if (!payments || payments.length === 0) {
        return (
            <Document>
                <Page style={styles.page}>
                    <Text style={styles.title}>振込・振替一覧 ({currentMonth}月)</Text>
                    <Text>データがありません</Text>
                </Page>
            </Document>
        );
    }

    const totalTransfer = payments[1]?.[0]?.合計金額 || 0;
    const totalRemittance = payments[3]?.[0]?.合計金額 || 0;
    const totalMonth = payments[4]?.[0]?.合計金額 || 0;

    return (
        <Document>
            <Page style={styles.page} size="A4" wrap>
                <Text style={styles.title}>振込・振替一覧 ({currentMonth}月)</Text>

                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.header]}>
                        <Text style={[styles.tableCell, styles.narrowCell]}>種別</Text>
                        <Text style={[styles.tableCell, styles.mediumCell]}>期限</Text>
                        <Text style={[styles.tableCell, styles.extraWideCell]}>会社名</Text>
                        <Text style={[styles.tableCell, styles.mediumCell, styles.rightAlign]}>金額</Text>
                        <Text style={[styles.tableCell, styles.wideCell]}>内容</Text>
                        <Text style={[styles.tableCell, styles.wideCell]}>銀行名</Text>
                        <Text style={[styles.tableCell, styles.mediumCell]}>支店名</Text>
                        <Text style={[styles.tableCell, styles.narrowCell]}>種別</Text>
                        <Text style={[styles.tableCell, styles.mediumCell]}>口座番号</Text>
                    </View>

                    {/* 振込の表示 */}
                    {payments[0]?.map((payment, index) => (
                        <View
                            key={`payment-${index}`}
                            style={styles.tableRow}
                            wrap={false} // 🟢 改ページ対応
                        >
                            <Text style={[styles.tableCell, styles.narrowCell]}>{payment.種別}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell]}>
                                {payment.期限 ? new Date(payment.期限).toLocaleDateString("ja-JP") : "未登録"}
                            </Text>
                            <Text style={[styles.tableCell, styles.extraWideCell]}>{payment.会社名}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell, styles.rightAlign]}>
                                {payment.金額?.toLocaleString()}
                            </Text>
                            <Text style={[styles.tableCell, styles.wideCell]}>{payment.内容}</Text>
                            <Text style={[styles.tableCell, styles.wideCell]}>{payment.銀行名}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell]}>{payment.支店名}</Text>
                            <Text style={[styles.tableCell, styles.narrowCell]}>{payment.口座種別}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell]}>{payment.口座番号}</Text>
                        </View>
                    ))}

                    {/* 🟢 振込と振替の間にスペースを追加 */}
                    <View style={styles.marginVertical} />

                    {/* 振替の表示 (データがある場合のみ) */}
                    {payments[2]?.map((payment, index) => (
                        <View
                            key={`remittance-${index}`}
                            style={styles.tableRow}
                            wrap={false} // 🟢 改ページ対応
                        >
                            <Text style={[styles.tableCell, styles.narrowCell]}>{payment.種別}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell]}>
                                {payment.期限 ? new Date(payment.期限).toLocaleDateString("ja-JP") : "未登録"}
                            </Text>
                            <Text style={[styles.tableCell, styles.extraWideCell]}>{payment.会社名}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell, styles.rightAlign]}>
                                {payment.金額?.toLocaleString()}
                            </Text>
                            <Text style={[styles.tableCell, styles.wideCell]}>{payment.内容}</Text>
                            <Text style={[styles.tableCell, styles.wideCell]}>{payment.銀行名}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell]}>{payment.支店名}</Text>
                            <Text style={[styles.tableCell, styles.narrowCell]}>{payment.口座種別}</Text>
                            <Text style={[styles.tableCell, styles.mediumCell]}>{payment.口座番号}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totalSection}>
                    <Text style={[styles.boldText, styles.totalItem]}>振込合計: {totalTransfer.toLocaleString()} 円</Text>
                    <Text style={[styles.boldText, styles.totalItem]}>振替合計: {totalRemittance.toLocaleString()} 円</Text>
                    <Text style={[styles.boldText, styles.totalItem]}>月合計: {totalMonth.toLocaleString()} 円</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PaymentManagementPDF;
