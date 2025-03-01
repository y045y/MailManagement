import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Container } from "react-bootstrap";
import PDFButton from "./PDFButton"; // ✅ PDF 出力用
import axios from "axios"; // ✅ API コール用

const MailList = ({ mails, setMails, onEditMail }) => {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
   // 振込・振替データの初期値を空配列に修正
    const [paymentData, setPaymentData] = useState([[], [], [], [], []]); 

    // ✅ `fetchMails` を `useEffect` より前に定義
    const fetchMails = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/mails", {
                params: {
                    month: currentMonth,
                    year: currentYear // 🔄 修正: 年も送信
                }
            });
            setMails(response.data);
        } catch (error) {
            console.error("郵便物データ取得エラー:", error);
        }
    }, [setMails, currentMonth, currentYear]);

    // ✅ `fetchPayments` で振込・振替データ取得
    const fetchPayments = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/payments`, {
                params: { 
                    month: currentMonth,
                    year: currentYear  // 🛠 修正: 年も送信
                }
            });

            const data = response.data;
            if (Array.isArray(data) && data.length >= 5) {
                setPaymentData(data);  // 🛠 全体のレスポンスを設定
            } else {
                console.error("API のレスポンスが不正です:", data);
                setPaymentData([[], [], [], [], []]);  // 🛠 想定外なら空に
            }
        } catch (error) {
            console.error("振込・振替データ取得エラー:", error);
        }
    }, [currentMonth, currentYear]);

    // ✅ `useEffect` でデータ取得
    useEffect(() => {
        const getData = async () => {
            await fetchMails();
            await fetchPayments();
        };
        getData();
    }, [fetchMails, fetchPayments]);    

    const handleDelete = async (id) => {
        if (!window.confirm("本当に削除しますか？")) return;
        try {
            await axios.delete(`http://localhost:5000/mails/${id}`);
            setMails(mails.filter(mail => mail.id !== id));
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "なし";
        return new Date(dateString).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    };

    const goToPreviousMonth = () => {
        setCurrentMonth((prevMonth) => {
            if (prevMonth === 1) {
                setCurrentYear((prevYear) => prevYear - 1); // 年を1減らす
                return 12;
            } else {
                return prevMonth - 1;
            }
        });
    };
    
    const goToNextMonth = () => {
        setCurrentMonth((prevMonth) => {
            if (prevMonth === 12) {
                setCurrentYear((prevYear) => prevYear + 1); // 年を1増やす
                return 1;
            } else {
                return prevMonth + 1;
            }
        });
    };
    const filteredMails = (mails || []).filter(mail => {
        if (!mail.received_date) return false;
        const mailDate = new Date(mail.received_date);
        return (
            mailDate.getMonth() + 1 === currentMonth &&
            mailDate.getFullYear() === currentYear
        );
    });
    

    return (
        <Container className="mt-4">
            <h2>📬 郵便物 & 振込・振替一覧</h2>

            {/* 🔄 前月・次月ボタンは中央寄せ */}
            <div className="d-flex justify-content-center mb-3">
                <Button variant="secondary" className="me-2" onClick={goToPreviousMonth}>
                    前月
                </Button>
                <Button variant="secondary" onClick={goToNextMonth}>
                    次月
                </Button>
            </div>
                        {/* 🔄 PDF 出力ボタンは右寄せ */}
            <div className="d-flex justify-content-end mb-3">
                <PDFButton 
                    mails={mails} 
                    currentMonth={currentMonth} 
                    type="mail" 
                    buttonText="郵便物 PDF" 
                    className="me-2"  // 🔄 横に並べるためのマージン
                />
                <PDFButton 
                    mails={paymentData} 
                    currentMonth={currentMonth} 
                    buttonText="振込・振替 PDF" 
                />
            </div>

            <h5 className="text-center">{currentMonth}月の郵便物</h5>

            {/* 📌 郵便物リスト */}
            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>届いた日</th>
                        <th>会社名</th>
                        <th>区分</th>
                        <th>金額</th>
                        <th>内容</th>
                        <th>振替日</th>
                        <th>振込期限</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMails.length > 0 ? (
                        filteredMails.map(mail => ( // 🔄 ここで呼び出されている！
                            <tr key={mail.id}>
                                <td>{formatDate(mail.received_date)}</td>
                                <td>{mail.company_name || "不明な会社"}</td>
                                <td>{mail.category}</td>
                                <td>{mail.amount ? mail.amount.toLocaleString() : "なし"}</td>
                                <td>{mail.description || "なし"}</td>
                                <td>{formatDate(mail.transfer_date)}</td>
                                <td>{formatDate(mail.payment_deadline)}</td>
                                <td>
                                    <Button 
                                        variant="warning" 
                                        size="sm" 
                                        className="me-2"
                                        onClick={() => onEditMail(mail)}
                                    >
                                        編集
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={() => handleDelete(mail.id)}
                                    >
                                        削除
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">この月には郵便物がありません</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <h5 className="text-center mt-4">{currentMonth}月の振込・振替</h5>

                {/* 📌 振込・振替リスト */}
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>種別</th>
                            <th>期限</th>
                            <th>会社名</th>
                            <th>金額</th>
                            <th>内容</th>
                            <th>銀行名</th>
                            <th>支店名</th>
                            <th>口座種別</th>
                            <th>口座番号</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentData[0]?.map((data, index) => (
                            <tr key={`payment-${index}`}>
                                <td>{data.種別}</td>
                                <td>{new Date(data.期限).toLocaleDateString()}</td>
                                <td>{data.会社名}</td>
                                <td>{data.金額.toLocaleString()} 円</td>
                                <td>{data.内容}</td>
                                <td>{data.銀行名}</td>
                                <td>{data.支店名}</td>
                                <td>{data.口座種別}</td>
                                <td>{data.口座番号}</td>
                            </tr>
                        ))}
                        {paymentData[2]?.map((data, index) => (
                            <tr key={`transfer-${index}`}>
                                <td>{data.種別}</td>
                                <td>{new Date(data.期限).toLocaleDateString()}</td>
                                <td>{data.会社名}</td>
                                <td>{data.金額.toLocaleString()} 円</td>
                                <td>{data.内容}</td>
                                <td>{data.銀行名}</td>
                                <td>{data.支店名}</td>
                                <td>{data.口座種別}</td>
                                <td>{data.口座番号}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                    {/* 🔄 合計金額を表示するエリア */}
                    <div className="d-flex justify-content-end mt-4">
                        <div className="text-end">
                            <h5>振込合計: {paymentData[1]?.[0]?.合計金額?.toLocaleString() || "0"} 円</h5>
                            <h5>振替合計: {paymentData[3]?.[0]?.合計金額?.toLocaleString() || "0"} 円</h5>
                            <h5>月合計: {paymentData[4]?.[0]?.合計金額?.toLocaleString() || "0"} 円</h5>
                        </div>
                    </div>
        </Container>
    );
};

export default MailList;
