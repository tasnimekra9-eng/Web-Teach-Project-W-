// Default Medicine & Healthcare Inventory
const DEFAULT_PRODUCTS = [
  {
    id: 101,
    name: "Napa Extend 665mg (Paracetamol)",
    category: "Pain & Fever",
    price: 20,
    stock: 150,
    rxRequired: false,
    manufacturer: "Beximco Pharmaceuticals",
    image: "assets/images/napa.png",
    description: "Extended-release paracetamol tablet for effective relief from fever, headache, and mild to moderate body pain."
  },
  {
    id: 102,
    name: "Seclo 20mg Capsule (Omeprazole)",
    category: "Gastric & Digestion",
    price: 60,
    stock: 120,
    rxRequired: false,
    manufacturer: "Square Pharmaceuticals",
    image: "assets/images/seclo.jpg",
    description: "Proton pump inhibitor used for acidity, heartburn, GERD, and peptic ulcer management (1 Strip / 10 Capsules)."
  },
  {
    id: 103,
    name: "Azithrocin 500mg Tablet",
    category: "Antibiotics",
    price: 210,
    stock: 45,
    rxRequired: true,
    manufacturer: "Square Pharmaceuticals",
    image: "assets/images/azithrocin.jpg",
    description: "Broad-spectrum macrolide antibiotic for respiratory and bacterial infections. Valid prescription required."
  },
  {
    id: 104,
    name: "Digital Blood Pressure Monitor",
    category: "Healthcare Devices",
    price: 2400,
    stock: 25,
    rxRequired: false,
    manufacturer: "Omron Healthcare",
    image: "assets/images/bp-monitor.webp",
    description: "Automatic upper-arm blood pressure monitor with irregular heartbeat detector and 60-reading memory."
  },
  {
    id: 105,
    name: "Fexo 120mg (Fexofenadine)",
    category: "Allergy & Cold",
    price: 90,
    stock: 95,
    rxRequired: false,
    manufacturer: "Square Pharmaceuticals",
    image: "assets/images/fexo.jpg",
    description: "Non-drowsy antihistamine tablet for seasonal allergic rhinitis, sneezing, and skin hives."
  },
  {
    id: 106,
    name: "Infrared Non-Contact Thermometer",
    category: "Healthcare Devices",
    price: 1850,
    stock: 40,
    rxRequired: false,
    manufacturer: "Beurer Medical",
    image: "assets/images/thermometer.jpg",
    description: "1-second forehead temperature measurement with fever alarm and backlit LCD screen."
  },
  {
    id: 107,
    name: "Bisopro 2.5mg Tablet (Bisoprolol)",
    category: "Heart & Blood Pressure",
    price: 180,
    stock: 80,
    rxRequired: true,
    manufacturer: "Square Pharmaceuticals",
    image: "assets/images/bisopro.webp",
    description: "Beta-blocker tablet (Bisoprolol Fumarate 2.5 mg) used to treat high blood pressure (hypertension) and heart failure."
  },
  {
    id: 108,
    name: "Secrin 1mg Tablet (Glimepiride)",
    category: "Diabetes Care",
    price: 180,
    stock: 100,
    rxRequired: true,
    manufacturer: "Healthcare Pharmaceuticals",
    image: "assets/images/secrin.jpeg",
    description: "Oral antidiabetic tablet (Glimepiride 1 mg) used to control blood sugar levels in adults with Type 2 diabetes mellitus."
  },
  {
    id: 109,
    name: "Trilock 10mg Tablet (Montelukast USP)",
    category: "Allergy & Cold",
    price: 150,
    stock: 110,
    rxRequired: true,
    manufacturer: "Renata Limited",
    image: "assets/images/trilock.webp",
    description: "Montelukast USP 10 mg tablet used for asthma prevention, breathing difficulty, and seasonal allergy symptoms."
  },
  {
    id: 110,
    name: "Reelife Tablet (Chlordiazepoxide 5mg + Amitriptyline 12.5mg)",
    category: "Mental Wellness & Neurology",
    price: 250,
    stock: 60,
    rxRequired: true,
    manufacturer: "Incepta Pharmaceuticals",
    image: "assets/images/reelife.webp",
    description: "Combination tablet containing Chlordiazepoxide USP 5 mg and Amitriptyline 12.5 mg for anxiety and depressive disorders. Prescription required."
  }
];

// Clean fallback inline SVG generator
function getProductImage(imagePath, title) {
  const cleanTitle = title.substring(0, 20).replace(/[&<>'"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="#e7f1ff"/><circle cx="150" cy="70" r="28" fill="#0d6efd"/><rect x="145" y="54" width="10" height="32" fill="white"/><rect x="134" y="65" width="32" height="10" fill="white"/><text x="150" y="130" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#084298" text-anchor="middle">${cleanTitle}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// Initialize & Sync LocalStorage Database
function initDatabase() {
  const storedProducts = JSON.parse(localStorage.getItem("pq_products"));
  if (!storedProducts) {
    localStorage.setItem("pq_products", JSON.stringify(DEFAULT_PRODUCTS));
  } else {
    let updated = false;
    DEFAULT_PRODUCTS.forEach(defItem => {
      const existing = storedProducts.find(p => p.id === defItem.id);
      if (!existing) {
        storedProducts.push(defItem);
        updated = true;
      } else if (existing.image !== defItem.image) {
        existing.image = defItem.image;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem("pq_products", JSON.stringify(storedProducts));
    }
  }

  if (!localStorage.getItem("pq_users")) {
    const defaultUsers = [
      { id: 1, name: "System Admin", email: "admin@pharmaquick.com", password: "123", role: "admin" },
      { id: 2, name: "Demo Customer", email: "user@pharmaquick.com", password: "123", role: "customer" }
    ];
    localStorage.setItem("pq_users", JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem("pq_orders")) {
    localStorage.setItem("pq_orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("pq_cart")) {
    localStorage.setItem("pq_cart", JSON.stringify([]));
  }
}

initDatabase();