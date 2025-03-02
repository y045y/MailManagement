import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import MailManagement from "./pages/MailManagement";
import ClientManagement from "./pages/ClientManagement";
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';  // この順番で読み込む

function App() {
    return (
        <Router>
            <div className="container">
                <h1>📌 メニュー</h1>
                <nav>
                    <ul>
                        <li><Link to="/mails">📨 郵便物管理</Link></li>
                        <li><Link to="/clients">🏢 取引先管理</Link></li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/mails" element={<MailManagement />} />
                    <Route path="/clients" element={<ClientManagement />} />
                    <Route path="/" element={<h2>📌 メニューから選択してください</h2>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

// import React from "react";
// import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
// import MailList from "./components/MailList";
// import PaymentsTest from "./components/PaymentsTest";  // 🔄 テストページをインポート

// const App = () => {
//     return (
//         <Router>
//             <div>
//                 <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
//                     <Link to="/" style={{ marginRight: "10px" }}>郵便物管理</Link>
//                     <Link to="/payments-test">振込・振替データテスト</Link>  {/* 🔄 テストページリンク */}
//                 </nav>
//                 <Routes>
//                     <Route path="/" element={<MailList />} />
//                     <Route path="/payments-test" element={<PaymentsTest />} />  {/* 🔄 テストページルート */}
//                 </Routes>
//             </div>
//         </Router>
//     );
// };

// export default App;

