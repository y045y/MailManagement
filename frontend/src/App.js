import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import MailManagement from "./pages/MailManagement";
import ClientManagement from "./pages/ClientManagement";

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
