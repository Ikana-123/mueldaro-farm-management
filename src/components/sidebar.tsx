import {
  LayoutDashboard,
  Bird,
  ClipboardList,
  HeartPulse,
  Wheat,
  Wallet,
  ShoppingCart,
  TrendingUp,
  Users,
  Building2,
  CheckSquare,
  Bell,
  Info,
  Settings,
  Package,
} from "lucide-react";

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Batches", icon: Bird },
  { label: "Daily Records", icon: ClipboardList },
  { label: "Health", icon: HeartPulse },
  { label: "Feed Inventory", icon: Wheat },
  { label: "Expenses", icon: Wallet },
  { label: "Sales", icon: ShoppingCart },
  { label: "Profitability", icon: TrendingUp },
  { label: "Staff", icon: Users },
  { label: "Farm Overview", icon: Building2 },
  { label: "Tasks", icon: CheckSquare },
  { label: "Notifications", icon: Bell },
  { label: "About", icon: Info },
  { label: "Settings", icon: Settings },
];

function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Package size={27} />
        </div>

        <div>
          <h2>MUELDARO</h2>
          <p>AGRO & FARM</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-link ${
                activePage === item.label ? "active" : ""
              }`}
              onClick={() => onNavigate(item.label)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>MUELDARO Agro</p>
        <span>Farm Management System</span>
      </div>
    </aside>
  );
}

export default Sidebar;