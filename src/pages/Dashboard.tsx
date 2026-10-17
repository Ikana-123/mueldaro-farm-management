import {
  Bird,
  Package,
  AlertTriangle,
  Wheat,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Clock,
} from "lucide-react";

import {
  currentStock,
  farmHistory,
  feedPurchases,
  dailyOperations,
} from "../data/farmData";

export default function Dashboard() {
  const totalFeedBags = feedPurchases.reduce(
    (total, purchase) => total + purchase.quantity,
    0
  );

  return (
    <div className="dashboard-page">
      {/* Dashboard Heading */}

      <div className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">FARM OVERVIEW</p>

          <h1>Good day, Farm manager 👋</h1>

          <p>
            Here is what is happening across your farm operations today.
          </p>
        </div>

        <div className="dashboard-date">
          <CalendarDays size={19} />

          <div>
            <strong>Current Operations</strong>
            <span>Farm system active</span>
          </div>
        </div>
      </div>

      {/* Statistics */}

      <div className="dashboard-grid">
        <div className="stat-card dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon green">
              <Bird size={23} />
            </div>

            <span className="stat-label">TOTAL BIRDS</span>
          </div>

          <h3>{currentStock.totalBirds}</h3>

          <p>Birds currently on the farm</p>
        </div>

        <div className="stat-card dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon gold">
              <Package size={23} />
            </div>

            <span className="stat-label">ACTIVE BATCHES</span>
          </div>

          <h3>2</h3>

          <p>8-week and 4-week stock groups</p>
        </div>

        <div className="stat-card dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon red">
              <AlertTriangle size={23} />
            </div>

            <span className="stat-label">MORTALITY</span>
          </div>

          <h3>{farmHistory.stockAsAtOctober4.totalLosses}</h3>

          <p>Recorded losses as at 4 October</p>
        </div>

        <div className="stat-card dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon blue">
              <Wheat size={23} />
            </div>

            <span className="stat-label">FEED PURCHASES</span>
          </div>

          <h3>{totalFeedBags}</h3>

          <p>Total bags recorded in history</p>
        </div>
      </div>

      {/* Main Dashboard Sections */}

      <div className="dashboard-main-grid">
        {/* Current Stock */}

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Current Farm Stock</h2>

              <p>Birds currently recorded on the farm.</p>
            </div>

            <Bird size={24} />
          </div>

          <div className="stock-list">
            <div className="stock-row">
              <div>
                <strong>Broilers</strong>
                <span>43 birds</span>
              </div>

              <strong>{currentStock.totalBroilers}</strong>
            </div>

            <div className="stock-row">
              <div>
                <strong>Newellas</strong>
                <span>18 birds</span>
              </div>

              <strong>{currentStock.totalNewellas}</strong>
            </div>

            <div className="stock-row">
              <div>
                <strong>Imported Turkeys</strong>
                <span>3 birds</span>
              </div>

              <strong>{currentStock.totalTurkeys}</strong>
            </div>

            <div className="stock-total">
              <span>Total Birds</span>
              <strong>{currentStock.totalBirds}</strong>
            </div>
          </div>
        </section>

        {/* Active Batches */}

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Active Batches</h2>

              <p>Your current stock groups.</p>
            </div>

            <Package size={24} />
          </div>

          <div className="batch-summary">
            <div className="batch-card">
              <div className="batch-card-title">
                <span className="batch-dot green-dot"></span>

                <strong>Existing Stock</strong>
              </div>

              <h3>43 birds</h3>

              <p>8 weeks old</p>

              <div className="batch-breakdown">
                <span>23 Broilers</span>
                <span>17 Newellas</span>
                <span>3 Turkeys</span>
              </div>
            </div>

            <div className="batch-card">
              <div className="batch-card-title">
                <span className="batch-dot gold-dot"></span>

                <strong>New Stock</strong>
              </div>

              <h3>21 birds</h3>

              <p>4 weeks old</p>

              <div className="batch-breakdown">
                <span>20 Broilers</span>
                <span>1 Newella</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Operations and Activity */}

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Today's Farm Operations</h2>

              <p>Regular activities carried out on the farm.</p>
            </div>

            <Clock size={24} />
          </div>

          <div className="operations-time">
            <strong>{dailyOperations.morningTime}</strong>

            <span>Morning operations</span>
          </div>

          <div className="operations-list">
            {dailyOperations.morningActivities.map((activity) => (
              <div className="operation-item" key={activity}>
                <span className="operation-check">✓</span>

                <span>{activity}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Farm Performance</h2>

              <p>Financial records will appear here once entered.</p>
            </div>

            <TrendingUp size={24} />
          </div>

          <div className="empty-finance">
            <div className="finance-icon">
              <TrendingDown size={26} />
            </div>

            <h3>No financial records yet</h3>

            <p>
              Expenses, sales and profitability will be calculated
              automatically after records are entered.
            </p>
          </div>
        </section>
      </div>

      {/* Recent Feed History */}

      <section className="dashboard-panel recent-activity-panel">
        <div className="panel-header">
          <div>
            <h2>Recent Feed Purchases</h2>

            <p>Feed purchase history currently recorded.</p>
          </div>

          <Wheat size={24} />
        </div>

        <div className="feed-history">
          {feedPurchases.slice().reverse().slice(0, 5).map((purchase, index) => (
            <div className="feed-history-row" key={`${purchase.date}-${index}`}>
              <div>
                <strong>{purchase.feedType} Feed</strong>

                <span>{purchase.date}</span>
              </div>

              <strong>
                {purchase.quantity}{" "}
                {purchase.quantity === 1 ? "bag" : "bags"}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}