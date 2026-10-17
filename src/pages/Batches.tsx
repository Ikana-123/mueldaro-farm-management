import { useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Bird,
  X,
  Package,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

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

    if (saved) {
      return JSON.parse(saved) as Batch[];
    }
  } catch {
    console.error("Could not load saved batches.");
  }

  return initialBatches;
}

function getStartingQuantity(batch: Batch): number {
  return batch.birds.reduce((total, bird) => total + bird.quantity, 0);
}

function getCurrentQuantity(batch: Batch): number {
  return Math.max(
    0,
    getStartingQuantity(batch) - batch.losses - batch.sold
  );
}

function Batches() {
  const [batches, setBatches] = useState<Batch[]>(readBatches);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showStockDetails, setShowStockDetails] = useState<Batch | null>(null);

  const [form, setForm] = useState({
    name: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    ageWeeks: "0",
    supplier: "",
    notes: "",
    broilers: "0",
    newellas: "0",
    turkeys: "0",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  }, [batches]);

  const totalBirds = batches.reduce(
    (total, batch) => total + getCurrentQuantity(batch),
    0
  );

  const totalLosses = batches.reduce(
    (total, batch) => total + batch.losses,
    0
  );

  const filteredBatches = batches.filter((batch) => {
    const searchable = [
      batch.name,
      `Batch ${String(batch.batchNumber).padStart(3, "0")}`,
      batch.supplier,
      ...batch.birds.map((bird) => bird.birdType),
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(searchTerm.toLowerCase());
  });

  function openAddForm() {
    setEditingId(null);

    setForm({
      name: "",
      purchaseDate: new Date().toISOString().slice(0, 10),
      ageWeeks: "0",
      supplier: "",
      notes: "",
      broilers: "0",
      newellas: "0",
      turkeys: "0",
    });

    setShowForm(true);
  }

  function openEditForm(batch: Batch) {
    setEditingId(batch.id);

    const quantityFor = (type: BirdType) =>
      batch.birds.find((bird) => bird.birdType === type)?.quantity ?? 0;

    setForm({
      name: batch.name,
      purchaseDate: batch.purchaseDate,
      ageWeeks: String(batch.ageWeeks),
      supplier: batch.supplier,
      notes: batch.notes,
      broilers: String(quantityFor("Broilers")),
      newellas: String(quantityFor("Newellas")),
      turkeys: String(quantityFor("Imported Turkeys")),
    });

    setShowForm(true);
  }

  function saveBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantities = {
      broilers: Number(form.broilers),
      newellas: Number(form.newellas),
      turkeys: Number(form.turkeys),
    };

    if (
      Object.values(quantities).some(
        (quantity) => !Number.isInteger(quantity) || quantity < 0
      )
    ) {
      alert("Bird quantities must be whole numbers of zero or more.");
      return;
    }

   const allBirds: BirdStock[] = [
  { birdType: "Broilers", quantity: quantities.broilers },
  { birdType: "Newellas", quantity: quantities.newellas },
  { birdType: "Imported Turkeys", quantity: quantities.turkeys },
];

const birds = allBirds.filter((bird) => bird.quantity > 0);

    if (birds.length === 0) {
      alert("Enter the quantity of at least one type of bird.");
      return;
    }

    const ageWeeks = Number(form.ageWeeks);

    if (!Number.isInteger(ageWeeks) || ageWeeks < 0) {
      alert("Age must be a whole number of weeks, zero or more.");
      return;
    }

    if (!form.purchaseDate) {
      alert("Please select the acquisition date.");
      return;
    }

    if (editingId) {
      setBatches((current) =>
        current.map((batch) =>
          batch.id === editingId
            ? {
                ...batch,
                name: form.name.trim(),
                purchaseDate: form.purchaseDate,
                ageWeeks,
                supplier: form.supplier.trim(),
                notes: form.notes.trim(),
                birds,
              }
            : batch
        )
      );
    } else {
      const nextNumber =
        batches.reduce(
          (highest, batch) => Math.max(highest, batch.batchNumber),
          0
        ) + 1;

      const newBatch: Batch = {
        id: crypto.randomUUID(),
        batchNumber: nextNumber,
        name: form.name.trim() || "New Stock",
        purchaseDate: form.purchaseDate,
        ageWeeks,
        supplier: form.supplier.trim(),
        notes: form.notes.trim(),
        birds,
        losses: 0,
        sold: 0,
      };

      setBatches((current) => [...current, newBatch]);
    }

    setShowForm(false);
    setEditingId(null);
  }

  function deleteBatch(batch: Batch) {
    const confirmed = window.confirm(
      `Delete Batch ${String(batch.batchNumber).padStart(3, "0")} — ${batch.name}? This removes the batch record.`
    );

    if (!confirmed) return;

    setBatches((current) =>
      current.filter((item) => item.id !== batch.id)
    );

    if (showStockDetails?.id === batch.id) {
      setShowStockDetails(null);
    }
  }

  function recordAdjustment(batch: Batch, adjustmentType: "loss" | "sale") {
    const label = adjustmentType === "loss" ? "bird losses" : "birds sold";

    const answer = window.prompt(
      `How many ${label} should be recorded for ${batch.name}?`
    );

    if (answer === null) return;

    const quantity = Number(answer);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Enter a whole number greater than zero.");
      return;
    }

    const available = getCurrentQuantity(batch);

    if (quantity > available) {
      alert(`This batch currently has only ${available} birds remaining.`);
      return;
    }

    setBatches((current) =>
      current.map((item) =>
        item.id === batch.id
          ? adjustmentType === "loss"
            ? { ...item, losses: item.losses + quantity }
            : { ...item, sold: item.sold + quantity }
          : item
      )
    );
  }

  return (
    <div className="batches-page">
      <div className="batches-heading">
        <div>
          <h1>Bird Batch Management</h1>
          <p>
            Manage every bird acquisition, monitor stock and record changes.
          </p>
        </div>

        <button
          className="batch-primary-button"
          type="button"
          onClick={openAddForm}
        >
          <Plus size={19} />
          Add New Batch
        </button>
      </div>

      <div className="batches-summary">
        <div>
          <h3>Total Active Batches</h3>
          <strong>{batches.length}</strong>
        </div>

        <div>
          <h3>Birds Currently on Farm</h3>
          <strong>{totalBirds}</strong>
        </div>

        <div>
          <h3>Total Recorded Losses</h3>
          <strong>{totalLosses}</strong>
        </div>
      </div>

      <div className="batches-search">
        <Search size={20} />

        <input
          type="search"
          placeholder="Search batch name, number, bird type or supplier..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="batches-table-panel">
        <h2>All Batches ({filteredBatches.length})</h2>

        <div className="batches-table-wrapper">
          <table className="batches-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Bird Types</th>
                <th>Starting Stock</th>
                <th>Current Stock</th>
                <th>Age</th>
                <th>Acquisition Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBatches.map((batch) => (
                <tr key={batch.id}>
                  <td>
                    <strong>
                      Batch {String(batch.batchNumber).padStart(3, "0")}
                    </strong>
                    <br />
                    {batch.name}
                  </td>

                  <td>
                    {batch.birds.map((bird) => (
                      <div key={bird.birdType}>
                        {bird.quantity} {bird.birdType}
                      </div>
                    ))}
                  </td>

                  <td>{getStartingQuantity(batch)}</td>

                  <td>
                    <strong>{getCurrentQuantity(batch)}</strong>
                  </td>

                  <td>{batch.ageWeeks} weeks</td>

                  <td>{batch.purchaseDate}</td>

                  <td>
                    <div className="batch-action-buttons">
                      <button
                        type="button"
                        title="View batch details"
                        onClick={() => setShowStockDetails(batch)}
                      >
                        <Package size={17} />
                      </button>

                      <button
                        type="button"
                        title="Edit batch"
                        onClick={() => openEditForm(batch)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        title="Record bird losses"
                        onClick={() => recordAdjustment(batch, "loss")}
                      >
                        <AlertTriangle size={17} />
                      </button>

                      <button
                        type="button"
                        title="Record birds sold"
                        onClick={() => recordAdjustment(batch, "sale")}
                      >
                        <Bird size={17} />
                      </button>

                      <button
                        type="button"
                        title="Delete batch record"
                        onClick={() => deleteBatch(batch)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="batches-empty">
                      <Package size={35} />
                      <h3>No batches found</h3>
                      <p>Try another search or add a new batch.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="batch-form-overlay">
          <form className="batch-form" onSubmit={saveBatch}>
            <h2>{editingId ? "Edit Batch" : "Register New Batch"}</h2>

            <p>
              Each acquisition becomes a new batch. Add all bird types from
              that acquisition below.
            </p>

            <label>
              Batch Name
              <input
                type="text"
                placeholder="e.g. October New Stock"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>

            <label>
              Acquisition Date
              <input
                type="date"
                required
                value={form.purchaseDate}
                onChange={(event) =>
                  setForm({ ...form, purchaseDate: event.target.value })
                }
              />
            </label>

            <label>
              Age in Weeks
              <input
                type="number"
                min="0"
                step="1"
                required
                value={form.ageWeeks}
                onChange={(event) =>
                  setForm({ ...form, ageWeeks: event.target.value })
                }
              />
            </label>

            <h3>Bird Quantities</h3>

            <label>
              Broilers
              <input
                type="number"
                min="0"
                step="1"
                value={form.broilers}
                onChange={(event) =>
                  setForm({ ...form, broilers: event.target.value })
                }
              />
            </label>

            <label>
              Newellas
              <input
                type="number"
                min="0"
                step="1"
                value={form.newellas}
                onChange={(event) =>
                  setForm({ ...form, newellas: event.target.value })
                }
              />
            </label>

            <label>
              Imported Turkeys
              <input
                type="number"
                min="0"
                step="1"
                value={form.turkeys}
                onChange={(event) =>
                  setForm({ ...form, turkeys: event.target.value })
                }
              />
            </label>

            <label>
              Supplier (optional)
              <input
                type="text"
                value={form.supplier}
                onChange={(event) =>
                  setForm({ ...form, supplier: event.target.value })
                }
              />
            </label>

            <label>
              Notes (optional)
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
            </label>

            <div className="batch-form-actions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit">
                {editingId ? "Save Changes" : "Create Batch"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showStockDetails && (
        <div className="batch-form-overlay">
          <div className="batch-form">
            <button
              type="button"
              className="batch-close-button"
              aria-label="Close batch details"
              onClick={() => setShowStockDetails(null)}
            >
              <X size={20} />
            </button>

            <h2>{showStockDetails.name}</h2>

            <p>
              Batch {String(showStockDetails.batchNumber).padStart(3, "0")}
            </p>

            <p>
              <CalendarDays size={16} /> Acquisition:{" "}
              {showStockDetails.purchaseDate}
            </p>

            <h3>Bird Stock</h3>

            {showStockDetails.birds.map((bird) => (
              <p key={bird.birdType}>
                {bird.birdType}: {bird.quantity}
              </p>
            ))}

            <hr />

            <p>
              Starting quantity: {getStartingQuantity(showStockDetails)}
            </p>

            <p>Recorded losses: {showStockDetails.losses}</p>

            <p>Birds sold: {showStockDetails.sold}</p>

            <h3>
              Current stock: {getCurrentQuantity(showStockDetails)}
            </h3>

            <p>{showStockDetails.notes || "No additional notes."}</p>

            <div className="batch-form-actions">
              <button
                type="button"
                onClick={() => setShowStockDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Batches;