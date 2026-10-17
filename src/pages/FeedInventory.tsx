import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Wheat,
  Package,
  ShoppingCart,
  TrendingDown,
  CalendarDays,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";

type FeedType = {
  id: string;
  name: string;
  bagWeightKg: number;
  birds: string[];
};

type Purchase = {
  id: string;
  feedId: string;
  date: string;
  bags: number;
  pricePerBag: number;
  bagWeightKg: number;
  supplier: string;
};

type Consumption = {
  id: string;
  feedId: string;
  date: string;
  quantityKg: number;
  birdType: string;
  batch: string;
  notes: string;
};

type FeedData = {
  feedTypes: FeedType[];
  purchases: Purchase[];
  consumption: Consumption[];
};

const STORAGE_KEY = "mueldaro_feed_inventory_v1";

const initialData: FeedData = {
  feedTypes: [
    {
      id: "starter",
      name: "Starter Feed",
      bagWeightKg: 25,
      birds: ["Broilers", "Newellas", "Imported Turkeys"],
    },
    {
      id: "grower",
      name: "Grower Feed",
      bagWeightKg: 25,
      birds: ["Broilers", "Newellas", "Imported Turkeys"],
    },
  ],
  purchases: [],
  consumption: [],
};

function loadData(): FeedData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as FeedData;

      if (
        Array.isArray(parsed.feedTypes) &&
        Array.isArray(parsed.purchases) &&
        Array.isArray(parsed.consumption)
      ) {
        return parsed;
      }
    }
  } catch {
    console.error("Unable to load feed inventory.");
  }

  return initialData;
}

function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function FeedInventory() {
  const [data, setData] = useState<FeedData>(loadData);

  const [activeTab, setActiveTab] = useState<
    "inventory" | "purchases" | "consumption" | "weekly"
  >("inventory");

  const [search, setSearch] = useState("");
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);

  const [feedForm, setFeedForm] = useState({
    name: "",
    bagWeightKg: "25",
    birds: ["Broilers"] as string[],
  });

  const [purchaseForm, setPurchaseForm] = useState({
    feedId: "starter",
    date: today(),
    bags: "1",
    pricePerBag: "",
    bagWeightKg: "25",
    supplier: "",
  });

  const [usageForm, setUsageForm] = useState({
    feedId: "starter",
    date: today(),
    quantityKg: "",
    birdType: "Broilers",
    batch: "",
    notes: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.error("Unable to save feed inventory.");
    }
  }, [data]);

  function getFeed(feedId: string) {
    return data.feedTypes.find((feed) => feed.id === feedId);
  }

  // Calculate purchases, consumption and remaining feed separately.
  const feedStats = useMemo(() => {
    return data.feedTypes.map((feed) => {
      const purchases = data.purchases.filter(
        (purchase) => purchase.feedId === feed.id
      );

      const usage = data.consumption.filter(
        (record) => record.feedId === feed.id
      );

      const totalPurchasedKg = purchases.reduce(
        (sum, purchase) => sum + purchase.bags * purchase.bagWeightKg,
        0
      );

      const totalConsumedKg = usage.reduce(
        (sum, record) => sum + record.quantityKg,
        0
      );

      const totalBagsPurchased = purchases.reduce(
        (sum, purchase) => sum + purchase.bags,
        0
      );

      const totalSpent = purchases.reduce(
        (sum, purchase) => sum + purchase.bags * purchase.pricePerBag,
        0
      );

      // Do not display negative remaining stock.
      const remainingKg = Math.max(
        0,
        totalPurchasedKg - totalConsumedKg
      );

      const lastPurchase = [...purchases].sort((a, b) =>
        b.date.localeCompare(a.date)
      )[0];

      const lastUsage = [...usage].sort((a, b) =>
        b.date.localeCompare(a.date)
      )[0];

      const exhaustionDate =
        remainingKg === 0 &&
        totalPurchasedKg > 0 &&
        usage.length > 0
          ? lastUsage?.date ?? null
          : null;

      return {
        feed,
        totalPurchasedKg,
        totalConsumedKg,
        remainingKg,
        totalBagsPurchased,
        totalSpent,
        lastPurchaseDate: lastPurchase?.date ?? "Not recorded",
        exhaustionDate,
      };
    });
  }, [data]);

  const totalPurchased = feedStats.reduce(
    (sum, item) => sum + item.totalPurchasedKg,
    0
  );

  const totalConsumed = feedStats.reduce(
    (sum, item) => sum + item.totalConsumedKg,
    0
  );

  const totalRemaining = feedStats.reduce(
    (sum, item) => sum + item.remainingKg,
    0
  );

  const totalSpent = feedStats.reduce(
    (sum, item) => sum + item.totalSpent,
    0
  );

  const filteredFeeds = feedStats.filter((item) =>
    item.feed.name.toLowerCase().includes(search.toLowerCase())
  );

  const todayUsage = data.consumption
    .filter((record) => record.date === today())
    .reduce((sum, record) => sum + record.quantityKg, 0);

  const weeklyUsage = useMemo(() => {
    const weeklyMap = new Map<string, number>();

    data.consumption.forEach((record) => {
      const date = new Date(`${record.date}T12:00:00`);
      const day = date.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;

      date.setDate(date.getDate() + mondayOffset);

      const weekStart = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const key = `${weekStart}|${record.feedId}`;

      weeklyMap.set(
        key,
        (weeklyMap.get(key) ?? 0) + record.quantityKg
      );
    });

    return Array.from(weeklyMap.entries())
      .map(([key, quantityKg]) => {
        const [weekStart, feedId] = key.split("|");

        return {
          weekStart,
          feedId,
          feedName: getFeed(feedId)?.name ?? "Unknown feed",
          quantityKg,
        };
      })
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }, [data]);

  function formatMoney(amount: number) {
    return `₦${amount.toLocaleString("en-NG", {
      maximumFractionDigits: 2,
    })}`;
  }

  function addFeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = feedForm.name.trim();
    const weight = Number(feedForm.bagWeightKg);

    if (!name || !Number.isFinite(weight) || weight <= 0) {
      alert("Enter a valid feed name and bag weight.");
      return;
    }

    if (
      data.feedTypes.some(
        (feed) => feed.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("This feed type already exists.");
      return;
    }

    const newFeed: FeedType = {
      id: crypto.randomUUID(),
      name,
      bagWeightKg: weight,
      birds: feedForm.birds,
    };

    setData((current) => ({
      ...current,
      feedTypes: [...current.feedTypes, newFeed],
    }));

    setPurchaseForm((current) => ({
      ...current,
      feedId: newFeed.id,
      bagWeightKg: String(weight),
    }));

    setUsageForm((current) => ({
      ...current,
      feedId: newFeed.id,
    }));

    setFeedForm({
      name: "",
      bagWeightKg: "25",
      birds: ["Broilers"],
    });

    setShowFeedForm(false);
  }

  function addPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const bags = Number(purchaseForm.bags);
    const price = Number(purchaseForm.pricePerBag);
    const weight = Number(purchaseForm.bagWeightKg);

    if (
      !purchaseForm.feedId ||
      !purchaseForm.date ||
      !Number.isFinite(bags) ||
      bags <= 0 ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      alert("Please enter valid purchase details.");
      return;
    }

    const purchase: Purchase = {
      id: crypto.randomUUID(),
      feedId: purchaseForm.feedId,
      date: purchaseForm.date,
      bags,
      pricePerBag: price,
      bagWeightKg: weight,
      supplier: purchaseForm.supplier.trim(),
    };

    setData((current) => ({
      ...current,
      purchases: [...current.purchases, purchase],
    }));

    setShowPurchaseForm(false);

    setPurchaseForm((current) => ({
      ...current,
      bags: "1",
      pricePerBag: "",
      supplier: "",
      date: today(),
    }));
  }

  function addConsumption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantityKg = Number(usageForm.quantityKg);

    if (
      !usageForm.feedId ||
      !usageForm.date ||
      !Number.isFinite(quantityKg) ||
      quantityKg <= 0
    ) {
      alert("Enter a valid feed quantity in kilograms.");
      return;
    }

    // Include previously recorded consumption when checking stock.
    const stats = feedStats.find(
      (item) => item.feed.id === usageForm.feedId
    );

    if (!stats || quantityKg > stats.remainingKg) {
      alert(
        `Only ${Math.max(0, stats?.remainingKg ?? 0)} kg is available. Record your opening stock and purchases first if necessary.`
      );
      return;
    }

    const record: Consumption = {
      id: crypto.randomUUID(),
      feedId: usageForm.feedId,
      date: usageForm.date,
      quantityKg,
      birdType: usageForm.birdType,
      batch: usageForm.batch.trim(),
      notes: usageForm.notes.trim(),
    };

    setData((current) => ({
      ...current,
      consumption: [...current.consumption, record],
    }));

    setShowUsageForm(false);

    setUsageForm((current) => ({
      ...current,
      date: today(),
      quantityKg: "",
      batch: "",
      notes: "",
    }));
  }

  function deletePurchase(id: string) {
    if (!window.confirm("Delete this purchase record?")) return;

    setData((current) => ({
      ...current,
      purchases: current.purchases.filter((item) => item.id !== id),
    }));
  }

  function deleteConsumption(id: string) {
    if (!window.confirm("Delete this consumption record?")) return;

    setData((current) => ({
      ...current,
      consumption: current.consumption.filter((item) => item.id !== id),
    }));
  }

  function toggleBird(bird: string) {
    setFeedForm((current) => ({
      ...current,
      birds: current.birds.includes(bird)
        ? current.birds.filter((item) => item !== bird)
        : [...current.birds, bird],
    }));
  }

  return (
    <div className="feed-page">
      <div className="feed-page-heading">
        <div>
          <span className="feed-eyebrow">MUELDARO INVENTORY</span>
          <h1>Feed Inventory</h1>
          <p>Track purchases, daily consumption and remaining feed.</p>
        </div>

        <div className="feed-heading-actions">
          <button
            className="feed-secondary-button"
            type="button"
            onClick={() => setShowFeedForm(true)}
          >
            <Plus size={17} /> Add Feed Type
          </button>

          <button
            className="feed-primary-button"
            type="button"
            onClick={() => {
              const feed = data.feedTypes[0];

              setPurchaseForm((current) => ({
                ...current,
                feedId: feed?.id ?? "",
                bagWeightKg: String(feed?.bagWeightKg ?? 25),
                date: today(),
              }));

              setShowPurchaseForm(true);
            }}
            disabled={data.feedTypes.length === 0}
          >
            <ShoppingCart size={17} /> Record Purchase
          </button>
        </div>
      </div>

      <div className="feed-summary-grid">
        <div className="feed-summary-card">
          <span className="feed-summary-icon"><Wheat size={21} /></span>
          <p>Feed Types</p>
          <strong>{data.feedTypes.length}</strong>
          <small>Registered feed varieties</small>
        </div>

        <div className="feed-summary-card">
          <span className="feed-summary-icon"><Package size={21} /></span>
          <p>Total Purchased</p>
          <strong>{totalPurchased.toLocaleString()} kg</strong>
          <small>Total recorded purchases</small>
        </div>

        <div className="feed-summary-card">
          <span className="feed-summary-icon"><TrendingDown size={21} /></span>
          <p>Total Consumed</p>
          <strong>{totalConsumed.toLocaleString()} kg</strong>
          <small>All recorded usage</small>
        </div>

        <div className="feed-summary-card">
          <span className="feed-summary-icon"><CheckCircle size={21} /></span>
          <p>Feed Remaining</p>
          <strong>{totalRemaining.toLocaleString()} kg</strong>
          <small>Purchased minus consumed</small>
        </div>

        <div className="feed-summary-card">
          <span className="feed-summary-icon"><ShoppingCart size={21} /></span>
          <p>Total Feed Cost</p>
          <strong>{formatMoney(totalSpent)}</strong>
          <small>Recorded purchase costs</small>
        </div>
      </div>

      <div className="feed-notice">
        <strong>Important:</strong> Starter and Grower are set to 25 kg per
        bag. Record your real purchases and daily usage. Remaining stock is
        calculated automatically; a finished bag must not be deducted twice.
      </div>

      <div className="feed-tabs">
        <button
          type="button"
          className={activeTab === "inventory" ? "active" : ""}
          onClick={() => setActiveTab("inventory")}
        >
          Current Inventory
        </button>

        <button
          type="button"
          className={activeTab === "purchases" ? "active" : ""}
          onClick={() => setActiveTab("purchases")}
        >
          Purchase History
        </button>

        <button
          type="button"
          className={activeTab === "consumption" ? "active" : ""}
          onClick={() => setActiveTab("consumption")}
        >
          Daily Consumption
        </button>

        <button
          type="button"
          className={activeTab === "weekly" ? "active" : ""}
          onClick={() => setActiveTab("weekly")}
        >
          Weekly Reports
        </button>
      </div>

      {activeTab === "inventory" && (
        <section className="feed-section">
          <div className="feed-section-heading">
            <div>
              <h2>Feed Stock Overview</h2>
              <p>Each feed type has its own stock balance.</p>
            </div>

            <div className="feed-search">
              <Search size={18} />
              <input
                placeholder="Search feed types..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="feed-cards-grid">
            {filteredFeeds.map((item) => (
              <article className="feed-stock-card" key={item.feed.id}>
                <div className="feed-stock-card-top">
                  <span className="feed-stock-icon"><Wheat size={24} /></span>
                  <span className="feed-status">
                    {item.remainingKg > 0
                      ? "Stock available"
                      : "No stock remaining"}
                  </span>
                </div>

                <h3>{item.feed.name}</h3>

                <p className="feed-weight">
                  Standard bag weight: {item.feed.bagWeightKg} kg
                </p>

                <div className="feed-stock-main">
                  <strong>{item.remainingKg.toLocaleString()} kg</strong>
                  <span>remaining</span>
                </div>

                <div className="feed-progress-track">
                  <div
                    className="feed-progress-fill"
                    style={{
                      width: `${
                        item.totalPurchasedKg > 0
                          ? Math.max(
                              0,
                              Math.min(
                                100,
                                (item.remainingKg / item.totalPurchasedKg) *
                                  100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="feed-stock-details">
                  <div>
                    <span>Purchased</span>
                    <strong>{item.totalPurchasedKg} kg</strong>
                  </div>

                  <div>
                    <span>Consumed</span>
                    <strong>{item.totalConsumedKg} kg</strong>
                  </div>

                  <div>
                    <span>Bags bought</span>
                    <strong>{item.totalBagsPurchased}</strong>
                  </div>

                  <div>
                    <span>Amount spent</span>
                    <strong>{formatMoney(item.totalSpent)}</strong>
                  </div>
                </div>

                <div className="feed-bird-tags">
                  {item.feed.birds.map((bird) => (
                    <span key={bird}>{bird}</span>
                  ))}
                </div>

                <p className="feed-last-purchase">
                  <CalendarDays size={15} />
                  Last purchase: {item.lastPurchaseDate}
                </p>

                {item.exhaustionDate && (
                  <p className="feed-last-purchase">
                    Finished: {item.exhaustionDate}
                  </p>
                )}

                <button
                  className="feed-card-action"
                  type="button"
                  onClick={() => {
                    setPurchaseForm({
                      feedId: item.feed.id,
                      date: today(),
                      bags: "1",
                      pricePerBag: "",
                      bagWeightKg: String(item.feed.bagWeightKg),
                      supplier: "",
                    });

                    setShowPurchaseForm(true);
                  }}
                >
                  <Plus size={16} /> Add Stock
                </button>
              </article>
            ))}

            {filteredFeeds.length === 0 && (
              <div className="feed-empty">
                <h3>No feed types found</h3>
                <p>Try another search or add a new feed type.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "purchases" && (
        <section className="feed-section">
          <div className="feed-section-heading">
            <div>
              <h2>Purchase History</h2>
              <p>All recorded feed purchases.</p>
            </div>
          </div>

          <div className="feed-table-wrap">
            <table className="feed-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Feed</th>
                  <th>Bags</th>
                  <th>Weight</th>
                  <th>Price per Bag</th>
                  <th>Total Cost</th>
                  <th>Supplier</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {[...data.purchases]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.date}</td>
                      <td>{getFeed(purchase.feedId)?.name ?? "Unknown"}</td>
                      <td>{purchase.bags}</td>
                      <td>{purchase.bags * purchase.bagWeightKg} kg</td>
                      <td>{formatMoney(purchase.pricePerBag)}</td>
                      <td>
                        {formatMoney(purchase.bags * purchase.pricePerBag)}
                      </td>
                      <td>{purchase.supplier || "—"}</td>
                      <td>
                        <button
                          className="feed-delete-button"
                          type="button"
                          title="Delete purchase"
                          onClick={() => deletePurchase(purchase.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {data.purchases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="feed-empty-cell">
                      No purchases recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "consumption" && (
        <section className="feed-section">
          <div className="feed-section-heading">
            <div>
              <h2>Daily Feed Consumption</h2>
              <p>
                Today: {todayUsage} kg recorded. Record the quantity used
                each day.
              </p>
            </div>

            <button
              className="feed-primary-button"
              type="button"
              disabled={data.feedTypes.length === 0}
              onClick={() => {
                setUsageForm((current) => ({
                  ...current,
                  feedId: data.feedTypes[0]?.id ?? "",
                  date: today(),
                }));

                setShowUsageForm(true);
              }}
            >
              <Plus size={17} /> Record Feed Usage
            </button>
          </div>

          <div className="feed-table-wrap">
            <table className="feed-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Feed</th>
                  <th>Quantity Used</th>
                  <th>Bird Type</th>
                  <th>Batch</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {[...data.consumption]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((record) => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td>{getFeed(record.feedId)?.name ?? "Unknown"}</td>
                      <td>{record.quantityKg} kg</td>
                      <td>{record.birdType}</td>
                      <td>{record.batch || "—"}</td>
                      <td>{record.notes || "—"}</td>
                      <td>
                        <button
                          className="feed-delete-button"
                          type="button"
                          title="Delete usage record"
                          onClick={() => deleteConsumption(record.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {data.consumption.length === 0 && (
                  <tr>
                    <td colSpan={7} className="feed-empty-cell">
                      No consumption recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "weekly" && (
        <section className="feed-section">
          <div className="feed-section-heading">
            <div>
              <h2>Weekly Consumption Report</h2>
              <p>Consumption grouped by week and feed type.</p>
            </div>
          </div>

          <div className="feed-table-wrap">
            <table className="feed-table">
              <thead>
                <tr>
                  <th>Week Starting</th>
                  <th>Feed Type</th>
                  <th>Total Consumed</th>
                </tr>
              </thead>

              <tbody>
                {weeklyUsage.map((record) => (
                  <tr key={`${record.weekStart}-${record.feedId}`}>
                    <td>{record.weekStart}</td>
                    <td>{record.feedName}</td>
                    <td>{record.quantityKg} kg</td>
                  </tr>
                ))}

                {weeklyUsage.length === 0 && (
                  <tr>
                    <td colSpan={3} className="feed-empty-cell">
                      Weekly reports will appear after you record consumption.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showFeedForm && (
        <div className="feed-modal-overlay">
          <form className="feed-modal" onSubmit={addFeed}>
            <button
              type="button"
              className="feed-modal-close"
              onClick={() => setShowFeedForm(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2>Add New Feed Type</h2>
            <p>Register another feed variety.</p>

            <label>
              Feed Name
              <input
                required
                placeholder="e.g. Finisher Feed"
                value={feedForm.name}
                onChange={(event) =>
                  setFeedForm({ ...feedForm, name: event.target.value })
                }
              />
            </label>

            <label>
              Bag Weight (kg)
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={feedForm.bagWeightKg}
                onChange={(event) =>
                  setFeedForm({
                    ...feedForm,
                    bagWeightKg: event.target.value,
                  })
                }
              />
            </label>

            <span className="feed-form-label">
              Bird Types That Eat This Feed
            </span>

            {["Broilers", "Newellas", "Imported Turkeys"].map((bird) => (
              <label className="feed-checkbox-label" key={bird}>
                <input
                  type="checkbox"
                  checked={feedForm.birds.includes(bird)}
                  onChange={() => toggleBird(bird)}
                />
                {bird}
              </label>
            ))}

            <div className="feed-modal-actions">
              <button
                type="button"
                className="feed-cancel-button"
                onClick={() => setShowFeedForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="feed-primary-button">
                Add Feed Type
              </button>
            </div>
          </form>
        </div>
      )}

      {showPurchaseForm && (
        <div className="feed-modal-overlay">
          <form className="feed-modal" onSubmit={addPurchase}>
            <button
              type="button"
              className="feed-modal-close"
              onClick={() => setShowPurchaseForm(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2>Record Feed Purchase</h2>
            <p>Enter the actual purchase details.</p>

            <label>
              Feed Type
              <select
                value={purchaseForm.feedId}
                onChange={(event) => {
                  const feed = getFeed(event.target.value);

                  setPurchaseForm({
                    ...purchaseForm,
                    feedId: event.target.value,
                    bagWeightKg: String(feed?.bagWeightKg ?? 25),
                  });
                }}
                required
              >
                {data.feedTypes.map((feed) => (
                  <option key={feed.id} value={feed.id}>
                    {feed.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Purchase Date
              <input
                type="date"
                required
                value={purchaseForm.date}
                onChange={(event) =>
                  setPurchaseForm({
                    ...purchaseForm,
                    date: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Number of Bags Purchased
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={purchaseForm.bags}
                onChange={(event) =>
                  setPurchaseForm({
                    ...purchaseForm,
                    bags: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Weight per Bag (kg)
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={purchaseForm.bagWeightKg}
                onChange={(event) =>
                  setPurchaseForm({
                    ...purchaseForm,
                    bagWeightKg: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Price per Bag (₦)
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={purchaseForm.pricePerBag}
                onChange={(event) =>
                  setPurchaseForm({
                    ...purchaseForm,
                    pricePerBag: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Supplier (optional)
              <input
                value={purchaseForm.supplier}
                onChange={(event) =>
                  setPurchaseForm({
                    ...purchaseForm,
                    supplier: event.target.value,
                  })
                }
              />
            </label>

            <div className="feed-modal-actions">
              <button
                type="button"
                className="feed-cancel-button"
                onClick={() => setShowPurchaseForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="feed-primary-button">
                Save Purchase
              </button>
            </div>
          </form>
        </div>
      )}

      {showUsageForm && (
        <div className="feed-modal-overlay">
          <form className="feed-modal" onSubmit={addConsumption}>
            <button
              type="button"
              className="feed-modal-close"
              onClick={() => setShowUsageForm(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2>Record Feed Usage</h2>
            <p>Record the amount actually used by your birds.</p>

            <label>
              Feed Type
              <select
                value={usageForm.feedId}
                onChange={(event) =>
                  setUsageForm({
                    ...usageForm,
                    feedId: event.target.value,
                  })
                }
                required
              >
                {data.feedTypes.map((feed) => (
                  <option key={feed.id} value={feed.id}>
                    {feed.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date Used
              <input
                type="date"
                required
                value={usageForm.date}
                onChange={(event) =>
                  setUsageForm({
                    ...usageForm,
                    date: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Quantity Used (kg)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={usageForm.quantityKg}
                onChange={(event) =>
                  setUsageForm({
                    ...usageForm,
                    quantityKg: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Bird Type
              <select
                value={usageForm.birdType}
                onChange={(event) =>
                  setUsageForm({
                    ...usageForm,
                    birdType: event.target.value,
                  })
                }
                required
              >
                <option>Broilers</option>
                <option>Newellas</option>
                <option>Imported Turkeys</option>
              </select>
            </label>

            <label>
              Batch (optional)
              <input
                placeholder="e.g. Existing stock"
                value={usageForm.batch}
                onChange={(event) =>
                  setUsageForm({
                    ...usageForm,
                    batch: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Notes (optional)
              <textarea
                value={usageForm.notes}
                onChange={(event) =>
                  setUsageForm({
                    ...usageForm,
                    notes: event.target.value,
                  })
                }
              />
            </label>

            <div className="feed-modal-actions">
              <button
                type="button"
                className="feed-cancel-button"
                onClick={() => setShowUsageForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="feed-primary-button">
                Save Consumption
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default FeedInventory;