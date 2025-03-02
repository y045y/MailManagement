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
  page: {
    padding: 20,
    fontFamily: "NotoSansJP",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "NotoSansJP",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    flex: 1,
    padding: 4,
  },
  tableCell: {
    fontSize: 12,
    fontFamily: "NotoSansJP",
  },
});

// 🟢 日付フォーマット
const formatDate = (dateString) => {
  if (!dateString) return "未登録";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "未登録" : date.toLocaleDateString("ja-JP");
};

// 🟢 金額フォーマット
const formatAmount = (amount) =>
  amount != null && !isNaN(amount) ? `${amount.toLocaleString()} 円` : "0 円";

// 🟢 PDF ドキュメント
const MailListPDF = ({ mails }) => (
  <Document>
    <Page style={styles.page} size="A4">
      <Text style={styles.title}>郵便物一覧</Text>
      <View style={styles.table}>
        {/* ヘッダー */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text style={styles.tableCell}>届いた日</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>会社名</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>区分</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>金額</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>内容</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>振替日</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>振込期限</Text></View>
        </View>

        {/* データ */}
        {mails.map((mail, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(mail.received_date)}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.company_name || "未登録"}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.category || "未分類"}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatAmount(mail.amount)}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{mail.description || "なし"}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(mail.transfer_date)}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(mail.payment_deadline)}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default MailListPDF;
