import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
    family: "NotoSansJP",
    src: process.env.REACT_APP_FONT_PATH,
  });

// ✅ 📌 スタイル設定
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "NotoSansJP",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 5,
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#666",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#666",
    alignItems: "center",
    height: 30,
  },
  tableCell: {
    padding: 6,
    fontSize: 12,
    textAlign: "left",
    borderRightWidth: 1,
    borderRightColor: "#666",
  },
  rightAlign: {
    textAlign: "right",
  },
  headerCell: {
    fontWeight: "bold",
    backgroundColor: "#f2f2f2",
  },
  columnWidths: {
    receivedDate: { width: "12%" },
    companyName: { width: "18%" },
    category: { width: "12%" },
    amount: { width: "12%" },
    description: { width: "25%" },
    transferDate: { width: "10%" },
    paymentDeadline: { width: "10%" },
  },
});

// ✅ 📌 データをページ分割（1ページ最大14件）
const splitIntoPages = (data, itemsPerPage = 14) => {
  const pages = [];
  for (let i = 0; i < data.length; i += itemsPerPage) {
    pages.push(data.slice(i, i + itemsPerPage));
  }
  return pages;
};

// ✅ 📌 日付・金額のフォーマット関数
const formatNumber = (number) =>
  number != null ? new Intl.NumberFormat("ja-JP").format(number) : "0";

const formatDate = (dateString) => {
  if (!dateString) return "なし";
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// ✅ 📌 PDF コンポーネント
const MailManagementPDF = ({ mails = [], currentMonth }) => {
  const pages = splitIntoPages(mails, 14);

  return (
    <Document>
      {pages.map((pageMails, pageNumber) => (
        <Page key={pageNumber} style={styles.page} size="A4">
          <Text style={styles.title}>📄 郵便物管理表 ({currentMonth}月) - {pageNumber + 1}ページ</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>

          {/* 📌 表のヘッダー */}
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.headerCell, styles.columnWidths.receivedDate]}>届いた日</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.columnWidths.companyName]}>会社名</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.columnWidths.category]}>区分</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.columnWidths.amount, styles.rightAlign]}>金額</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.columnWidths.description]}>内容</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.columnWidths.transferDate, styles.rightAlign]}>振替日</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.columnWidths.paymentDeadline, styles.rightAlign]}>振込期限</Text>
            </View>

            {/* 📌 表のデータ */}
            {pageMails.map((mail, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.columnWidths.receivedDate]}>{formatDate(mail.received_date)}</Text>
                <Text style={[styles.tableCell, styles.columnWidths.companyName]}>{mail.company_name ?? "不明"}</Text>
                <Text style={[styles.tableCell, styles.columnWidths.category]}>{mail.category ?? "未分類"}</Text>
                <Text style={[styles.tableCell, styles.columnWidths.amount, styles.rightAlign]}>
                  {formatNumber(mail.amount)}
                </Text>
                <Text style={[styles.tableCell, styles.columnWidths.description]}>{mail.description ?? "なし"}</Text>
                <Text style={[styles.tableCell, styles.columnWidths.transferDate, styles.rightAlign]}>{formatDate(mail.transfer_date)}</Text>
                <Text style={[styles.tableCell, styles.columnWidths.paymentDeadline, styles.rightAlign]}>{formatDate(mail.payment_deadline)}</Text>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default MailManagementPDF;
