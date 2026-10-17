export const companyInfo = {
  name: "MUELDARO Agro and Farm Management System",
  shortName: "MUELDARO",
  founder: "Mr. Sam Samuel Friday",
  establishedDate: "12 September 2026",

  description:
    "MUELDARO is a registered enterprise involved in poultry farming and the buying and selling of agricultural products and other farm-related goods.",

  history:
    "The enterprise began operations on 12 September 2026 with an initial stock of 30 broilers, 20 Newellas and 3 imported turkeys. Since then, the farm has continued to grow and expand its agricultural activities.",
};

export const management = [
  {
    name: "Mr. Sam Samuel Friday",
    role: "Founder",
  },
  {
    name: "Mrs. Samuel",
    role: "Deputy Managing Director",
    additionalRoles: ["Creditor", "Shareholder"],
    contribution: 160000,
  },
  {
    name: "Mr. Mkpoikanabasi Samuel",
    role: "Managing Director",
  },
  {
    name: "Samuel Kenedaramfonabasi",
    role: "Company Secretary",
  },
  {
    name: "Samuel Angel Mfoniso",
    role: "Co-Founder",
  },
];

export const farmHistory = {
  startDate: "12 September 2026",

  initialStock: {
    broilers: 30,
    newellas: 20,
    importedTurkeys: 3,
  },

  stockAsAtOctober4: {
    broilers: 23,
    newellas: 17,
    importedTurkeys: 3,
    totalLosses: 7,
  },

  newStockDate: "5 October 2026",

  newStock: {
    broilers: 20,
    newellas: 1,
    age: "4 weeks",
  },
};

export const currentStock = {
  existingStock: {
    age: "8 weeks",
    broilers: 23,
    newellas: 17,
    importedTurkeys: 3,
  },

  newStock: {
    age: "4 weeks",
    broilers: 20,
    newellas: 1,
  },

  totalBroilers: 43,
  totalNewellas: 18,
  totalTurkeys: 3,
  totalBirds: 64,
};

export const feedPurchases = [
  {
    date: "12 September 2026",
    feedType: "Starter",
    quantity: 2,
    unit: "bags",
  },
  {
    date: "19 September 2026",
    feedType: "Starter",
    quantity: 1,
    unit: "bag",
  },
  {
    date: "27 September 2026",
    feedType: "Grower",
    quantity: 1,
    unit: "bag",
  },
  {
    date: "5 October 2026",
    feedType: "Starter",
    quantity: 1,
    unit: "bag",
  },
  {
    date: "5 October 2026",
    feedType: "Grower",
    quantity: 1,
    unit: "bag",
  },
];

export const dailyOperations = {
  morningTime: "9:00 AM",

  morningActivities: [
    "Feeding",
    "Changing water",
    "Adding feed",
    "Cleaning the cage",
    "Cleaning feces",
  ],

  eveningActivities: [
    "Feeding",
    "Changing water",
    "Adding feed",
  ],

  responsibilities: {
    feeding: "Mr. Mkpoikanabasi Samuel",
    waterChange: "Mr. Mkpoikanabasi Samuel",
    additionalFeed: "Mr. Mkpoikanabasi Samuel",
    cageCleaning: "Mr. Mkpoikanabasi Samuel",
    fecesCleaning:
      "Mr. Sam Samuel Friday assisted by Mr. Mkpoikanabasi Samuel",
  },
};

export const financialInformation = {
  currency: "NGN",
  deputyManagingDirectorContribution: 160000,
  contributionDescription:
    "Mrs. Samuel contributed ₦160,000 to the company and is recorded as a creditor and shareholder.",
};

export const farmModules = [
  "Dashboard",
  "Batches",
  "Daily Records",
  "Health & Cleanliness",
  "Feed & Inventory",
  "Expenses",
  "Sales",
  "Profitability",
  "Staff & Management",
  "Farm Overview",
  "Tasks",
  "Notifications",
  "About",
  "Settings",
];