import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MailListPDF from "./MailListPDF";

const PDFButton = ({ mails }) => (
  <PDFDownloadLink
    document={<MailListPDF mails={mails} />}
    fileName="郵便物一覧.pdf"
    className="btn btn-primary"
  >
    {({ loading }) => (loading ? "出力中..." : "PDFダウンロード")}
  </PDFDownloadLink>
);

export default PDFButton;
