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
            console.log("📡 郵便物データ取得開始...");
            console.log(`📡 APIリクエスト: http://localhost:5000/mails?month=${currentMonth}&year=${currentYear}`);

            const response = await axios.get("http://localhost:5000/mails", {
                params: {
                    month: currentMonth,
                    year: currentYear // 🔄 修正: 年も送信
                }
            });

            console.log("📦 取得した郵便物データ:", response.data);
            setMails(response.data);
        } catch (error) {
            console.error("🛑 郵便物データ取得エラー:", error);
        }
    }, [setMails, currentMonth, currentYear]);

    const fetchPayments = useCallback(async () => {
        try {
            console.log("📡 振込・振替データ取得開始...");
            const response = await axios.get(`http://localhost:5000/payments`, {
                params: { 
                    month: currentMonth,
                    year: currentYear
                }
            });
            
            const data = response.data;
            console.log("📦 取得した振込・振替データ:", data);
            
            if (Array.isArray(data) && data.length > 0) {
                console.log("✅ データを setPaymentData に設定開始...");
                setPaymentData(data);
                console.log("✅ setPaymentData に設定完了:", data);
                console.log("🔄 setPaymentData 直後の paymentData:", paymentData);
            } else {
                console.warn("⚠️ API のレスポンスが空です。デフォルト値を設定します。");
                setPaymentData([[], [], [], [], []]);
            }
        } catch (error) {
            console.error("🛑 振込・振替データ取得エラー:", error);
            setPaymentData([[], [], [], [], []]);
        }
    }, [currentMonth, currentYear]);  // 🟢 ここを修正！
    
    
    
    
    useEffect(() => {
        console.log("🟢 paymentData が更新されました:", paymentData);
    }, [paymentData]);
    
    // 🟢 ローディング状態管理
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("🌟 useEffect 開始: ", { currentMonth, currentYear });
        const getData = async () => {
            setIsLoading(true);  // 🔄 データ取得開始時にローディングを true に
            await fetchMails();
            await fetchPayments();
            setIsLoading(false);  // 🔄 データ取得完了後にローディングを false に
        };
        getData();
    }, [fetchMails, fetchPayments, currentMonth, currentYear]);

    useEffect(() => {
        if (paymentData && paymentData.length > 0) {
            console.log("🟢 paymentData が更新されました:", paymentData);
        }
        console.log("📡 fetchPayments 完了: paymentData =", paymentData);
    }, [paymentData]);
    
        
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
            <div className="d-flex justify-content-end mb-3">
    {!isLoading && (
        <>
            <PDFButton 
                mails={mails} 
                currentMonth={currentMonth} 
                type="mail" 
                buttonText="郵便物 PDF" 
                className="me-2"
                key={`mail-${currentMonth}-${mails.length}`}
            />
            <PDFButton 
                mails={mails} 
                payments={paymentData}  // 🔄 `paymentData` 全体を渡す
                currentMonth={currentMonth} 
                type="payment" 
                buttonText="振込・振替 PDF" 
                key={`payment-${currentMonth}-${paymentData.length}-${JSON.stringify(paymentData)}`} 
            />
        </>
    )}
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
