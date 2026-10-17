import { useState } from "react";
import "./App.css";

import Sidebar from "./components/sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Batches from "./pages/Batches";
import FeedInventory from "./pages/FeedInventory";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        <Header />

        <section className="page-content">
          {activePage === "Dashboard" && <Dashboard />}

          {activePage === "Batches" && <Batches />}

          {activePage === "Feed Inventory" && <FeedInventory />}

          {activePage !== "Dashboard" &&
            activePage !== "Batches" &&
            activePage !== "Feed Inventory" && (
              <div>
                <h1>{activePage}</h1>
                <p>This section is coming soon.</p>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default App;