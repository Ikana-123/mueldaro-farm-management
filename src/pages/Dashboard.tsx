
import { useState } from "react";
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

  feedPurchases,
  dailyOperations,
} from "../data/farmData";

type BirdType = "Broilers" | "Newellas" | "Imported Turkeys";

type BirdStock = {
  birdType: BirdType;
  quantity: number;
};

type Batch = {
  id: string;
  batchNumber: number;
  name: string;
  purchaseDate: string;
  ageWeeks: number;
  supplier: string;
  notes: string;
  birds: BirdStock[];
  losses: number;
  sold: number;
};

const STORAGE_KEY = "mueldaro_batches_v2";

const initialBatches: Batch[] = [
  {
    id: "batch-001",
    batchNumber: 1,
    name: "Existing Stock",
    purchaseDate: "2026-09-12",
    ageWeeks: 8,
    supplier: "",
    notes: "Initial farm stock.",
    birds: [
      { birdType: "Broilers", quantity: 23 },
      { birdType: "Newellas", quantity: 17 },
      { birdType: "Imported Turkeys", quantity: 3 },
    ],
    losses: 7,
    sold: 0,
  },
  {
    id: "batch-002",
    batchNumber: 2,
    name: "New Stock",
    purchaseDate: "2026-10-05",
    ageWeeks: 4,
    supplier: "",
    notes: "Second acquisition of birds.",
    birds: [
      { birdType: "Broilers", quantity: 20 },
      { birdType: "Newellas", quantity: 1 },
    ],
    losses: 0,
    sold: 0,
  },
];

function readBatches(): Batch[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as Batch[];
      }
    }
  } catch {
    console.error("Could not load saved batch records.");
  }

  return initialBatches;
}

function getStartingQuantity(batch: Batch): number {
  return batch.birds.reduce(
    (total, bird) => total + bird.quantity,
    0
  );
}

function getCurrentQuantity(batch: Batch): number {
  return Math.max(
    0,
    getStartingQuantity(batch) - batch.losses - batch.sold
  );
}

export default function Dashboard() {
  const [batches] = useState<Batch[]>(readBatches);

  const totalBirds = batches.reduce(
    (total, batch) => total + getCurrentQuantity(batch),
    0
  );

  const totalLosses = batches.reduce(
    (total, batch) => total + batch.losses,
    0
  );

  const totalSold = batches.reduce(
    (total, batch) => total + batch.sold,
    0
  );

  const totalFeedBags = feedPurchases.reduce(
    (total, purchase) => total + purchase.quantity,
    0
  );

  return (
    <div className="dashboard-page">
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

      <div className="dashboard-grid">
        <div className="stat-card dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon green">
              <Bird size={23} />
            </div>
            <span className="stat-label">TOTAL BIRDS</span>
          </div>
          <h3>{totalBirds}</h3>
          <p>Birds currently on the farm</p>
        </div>

        <div className="stat-card dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon gold">
              <Package size={23} />
            </div>
            <span className="stat-label">ACTIVE BATCHES</span>
          </div>
          <h3>{batches.length}</h3>
          <p>Registered bird stock groups</p>
        </div>

        <div className="stat-card dashboard-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon red">
              <AlertTriangle size={23} />
            </div>
            <span className="stat-label">MORTALITY</span>
          </div>
          <h3>{totalLosses}</h3>
          <p>Total recorded bird losses</p>
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

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Current Farm Stock</h2>
              <p>Calculated from your saved batch records.</p>
            </div>
            <Bird size={24} />
          </div>

          <div className="stock-list">
            <div className="stock-row">
              <div>
                <strong>Birds currently on farm</strong>
                <span>After recorded losses and sales</span>
              </div>
              <strong>{totalBirds}</strong>
            </div>

            <div className="stock-row">
              <div>
                <strong>Total recorded losses</strong>
                <span>Across all batches</span>
              </div>
              <strong>{totalLosses}</strong>
            </div>

            <div className="stock-row">
              <div>
                <strong>Birds sold</strong>
                <span>Across all batches</span>
              </div>
              <strong>{totalSold}</strong>
            </div>

            <div className="stock-total">
              <span>Total starting stock</span>
              <strong>
                {batches.reduce(
                  (total, batch) => total + getStartingQuantity(batch),
                  0
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Active Batches</h2>
              <p>Details from your saved batch records.</p>
            </div>
            <Package size={24} />
          </div>

          <div className="batch-summary">
            {batches.map((batch, index) => (
              <div className="batch-card" key={batch.id}>
                <div className="batch-card-title">
                  <span
                    className={`batch-dot ${
                      index % 2 === 0 ? "green-dot" : "gold-dot"
                    }`}
                  />
                  <strong>{batch.name}</strong>
                </div>

                <h3>{getCurrentQuantity(batch)} birds</h3>
                <p>{batch.ageWeeks}-week age at last update</p>

                <div className="batch-breakdown">
                  {batch.birds.map((bird) => (
                    <span key={bird.birdType}>
                      {bird.quantity} {bird.birdType}
                    </span>
                  ))}
                  <span>Losses: {batch.losses}</span>
                  <span>Sold: {batch.sold}</span>
                </div>
              </div>
            ))}

            {batches.length === 0 && (
              <p>No batches recorded. Add a batch in Bird Batch Management.</p>
            )}
          </div>
        </section>
      </div>

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

      <section className="dashboard-panel recent-activity-panel">
        <div className="panel-header">
          <div>
            <h2>Recent Feed Purchases</h2>
            <p>Feed purchase history currently recorded.</p>
          </div>
          <Wheat size={24} />
        </div>

        <div className="feed-history">
          {feedPurchases
            .slice()
            .reverse()
            .slice(0, 5)
            .map((purchase, index) => (
              <div
                className="feed-history-row"
                key={`${purchase.date}-${index}`}
              >
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
