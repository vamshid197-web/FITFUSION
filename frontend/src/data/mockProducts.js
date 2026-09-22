export const CLOTHING_CATEGORIES = [
  "All",
  "T-Shirts",
  "Shirts",
  "Hoodies",
  "Jeans/Pants",
  "Dresses",
  "Jackets",
  "Traditional Wear"
];

export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Classic Cotton Shirt",
    category: "Shirts",
    basePrice: 65,
    rating: 4.8,
    reviewsCount: 142,
    badge: "Featured",
    description: "Tailored to perfection with premium 100% long-staple cotton. Fully customizable collar, cuff architecture, placket, and monogramming for boardroom or evening elegance.",
    availableFabrics: [
      { name: "Egyptian Giza Cotton", composition: "100% Cotton 120s" },
      { name: "Oxford Weave", composition: "100% Combed Cotton" },
      { name: "Royal Twill", composition: "Silky Cotton Twill" }
    ],
    availableColors: [
      { name: "Crisp White", hex: "#FFFFFF" },
      { name: "Sky Blue", hex: "#93C5FD" },
      { name: "Midnight Navy", hex: "#1E3A8A" },
      { name: "Pale Pink", hex: "#FBCFE8" }
    ],
    availableSizes: ["XS", "S", "M", "L", "XL", "2XL", "Custom Tailored"],
    silhouetteColor: "from-blue-100 to-indigo-100",
    accentColor: "#1E3A8A",
  },
  {
    id: "2",
    name: "Oversized Heavyweight T-Shirt",
    category: "T-Shirts",
    basePrice: 42,
    rating: 4.7,
    reviewsCount: 98,
    badge: "Trending",
    description: "Crafted from 280 GSM luxury combed jersey. Features dropped shoulders, reinforced ribbed collar, and bespoke custom length and chest fitting.",
    availableFabrics: [
      { name: "Heavyweight Jersey", composition: "280 GSM Cotton" },
      { name: "Organic Bio-Washed", composition: "100% Organic Cotton" }
    ],
    availableColors: [
      { name: "Vintage Black", hex: "#1F2937" },
      { name: "Off-White", hex: "#F3F4F6" },
      { name: "Sage Green", hex: "#A7F3D0" },
      { name: "Earth Brown", hex: "#78350F" }
    ],
    availableSizes: ["S", "M", "L", "XL", "2XL", "Custom Tailored"],
    silhouetteColor: "from-stone-200 to-stone-300",
    accentColor: "#1F2937",
  },
  {
    id: "3",
    name: "Premium Denim Trucker Jacket",
    category: "Jackets",
    basePrice: 120,
    rating: 4.9,
    reviewsCount: 76,
    badge: "Featured",
    description: "Selvedge denim jacket tailored for a structured silhouette. Personalize button finishes (brass, matte black, antique silver), lining, and contrast stitch colors.",
    availableFabrics: [
      { name: "Japanese Selvedge Denim", composition: "14oz Raw Denim" },
      { name: "Washed Indigo Stretch", composition: "98% Cotton 2% Elastane" }
    ],
    availableColors: [
      { name: "Raw Deep Indigo", hex: "#1E293B" },
      { name: "Stonewash Blue", hex: "#60A5FA" },
      { name: "Washed Charcoal", hex: "#374151" }
    ],
    availableSizes: ["S", "M", "L", "XL", "Custom Tailored"],
    silhouetteColor: "from-sky-100 to-blue-200",
    accentColor: "#1E293B",
  },
  {
    id: "4",
    name: "Linen Casual Relaxed Shirt",
    category: "Shirts",
    basePrice: 75,
    rating: 4.6,
    reviewsCount: 84,
    badge: "Recommended",
    description: "Pure European breathable flax linen designed for effortless resort luxury. Customizable with camp collar, mandarin collar, or standard relaxed spread.",
    availableFabrics: [
      { name: "Pure European Flax", composition: "100% Linen" },
      { name: "Cotton-Linen Blend", composition: "55% Linen 45% Cotton" }
    ],
    availableColors: [
      { name: "Natural Sand", hex: "#E5E7EB" },
      { name: "Olive Green", hex: "#4B5563" },
      { name: "Coral Clay", hex: "#FCA5A5" },
      { name: "Sky Mist", hex: "#BAE6FD" }
    ],
    availableSizes: ["S", "M", "L", "XL", "2XL", "Custom Tailored"],
    silhouetteColor: "from-amber-50 to-orange-100",
    accentColor: "#D97706",
  },
  {
    id: "5",
    name: "Classic French Terry Hoodie",
    category: "Hoodies",
    basePrice: 85,
    rating: 4.9,
    reviewsCount: 112,
    badge: "Trending",
    description: "Plush 450 GSM loopback French terry cloth with metal-tipped drawstrings and double-lined hood. Custom fit options for sleeve taper, torso length, and embroidered initials.",
    availableFabrics: [
      { name: "Heavy French Terry", composition: "100% Brushed Cotton" },
      { name: "Organic Fleece", composition: "Cotton-Polyester Blend" }
    ],
    availableColors: [
      { name: "Heather Grey", hex: "#9CA3AF" },
      { name: "Deep Forest", hex: "#064E3B" },
      { name: "Midnight Navy", hex: "#1E3A8A" },
      { name: "Burgundy", hex: "#881337" }
    ],
    availableSizes: ["XS", "S", "M", "L", "XL", "2XL", "Custom Tailored"],
    silhouetteColor: "from-gray-100 to-slate-200",
    accentColor: "#475569",
  },
  {
    id: "6",
    name: "Bespoke Wool Tailored Blazer",
    category: "Jackets",
    basePrice: 195,
    rating: 5.0,
    reviewsCount: 63,
    badge: "Featured",
    description: "Fine Italian Super 130s wool structured blazer. Customize lapel width (notch, peak, or shawl), inner cupro lining pattern, horn buttons, and vents.",
    availableFabrics: [
      { name: "Italian Super 130s Wool", composition: "100% Fine Wool" },
      { name: "Wool-Silk Blend", composition: "80% Wool 20% Silk" }
    ],
    availableColors: [
      { name: "Charcoal Pinstripe", hex: "#1F2937" },
      { name: "Navy Houndstooth", hex: "#1E3A8A" },
      { name: "Camel Tan", hex: "#B45309" }
    ],
    availableSizes: ["36R", "38R", "40R", "42R", "44R", "Custom Tailored"],
    silhouetteColor: "from-slate-200 to-zinc-300",
    accentColor: "#18181B",
  },
  {
    id: "7",
    name: "Custom Tailored Chino Trousers",
    category: "Jeans/Pants",
    basePrice: 70,
    rating: 4.7,
    reviewsCount: 91,
    badge: "Recommended",
    description: "Versatile cotton-stretch twill trousers with side buckle adjusters, custom pleat options (flat front or single pleat), and precision hem cuffing.",
    availableFabrics: [
      { name: "Compact Stretch Twill", composition: "97% Cotton 3% Spandex" },
      { name: "Gabardine Weave", composition: "100% Mercerized Cotton" }
    ],
    availableColors: [
      { name: "Khaki Tan", hex: "#D4B996" },
      { name: "Dark Navy", hex: "#0F172A" },
      { name: "Slate Olive", hex: "#3F4A3C" }
    ],
    availableSizes: ["30W", "32W", "34W", "36W", "38W", "Custom Tailored"],
    silhouetteColor: "from-stone-100 to-amber-100",
    accentColor: "#78350F",
  },
  {
    id: "8",
    name: "Pure Silk Slip Evening Dress",
    category: "Dresses",
    basePrice: 140,
    rating: 4.8,
    reviewsCount: 52,
    badge: "Featured",
    description: "Bias-cut 22mm Mulberry silk charmeuse dress that drapes naturally. Personalize neckline depth, strap style, slit height, and custom bust/waist drape.",
    availableFabrics: [
      { name: "Mulberry Silk Charmeuse", composition: "100% Silk 22mm" },
      { name: "Matte Silk Crepe", composition: "100% Silk Crepe de Chine" }
    ],
    availableColors: [
      { name: "Champagne Gold", hex: "#FDE68A" },
      { name: "Emerald Noir", hex: "#065F46" },
      { name: "Ruby Crimson", hex: "#991B1B" }
    ],
    availableSizes: ["XS", "S", "M", "L", "XL", "Custom Tailored"],
    silhouetteColor: "from-rose-100 to-amber-100",
    accentColor: "#991B1B",
  },
  {
    id: "9",
    name: "Artisan Tailored Nehru Kurta",
    category: "Traditional Wear",
    basePrice: 88,
    rating: 4.9,
    reviewsCount: 78,
    badge: "Trending",
    description: "Hand-spun khadi cotton kurta featuring a structured mandarin collar, concealed placket, and customizable hem slit and side pocket configurations.",
    availableFabrics: [
      { name: "Hand-Spun Khadi Cotton", composition: "100% Handloom Cotton" },
      { name: "Tussar Silk Blend", composition: "60% Silk 40% Cotton" }
    ],
    availableColors: [
      { name: "Ivory Ecru", hex: "#FEF3C7" },
      { name: "Royal Indigo", hex: "#1E3A8A" },
      { name: "Teal Green", hex: "#0D9488" }
    ],
    availableSizes: ["38", "40", "42", "44", "46", "Custom Tailored"],
    silhouetteColor: "from-amber-100 to-teal-100",
    accentColor: "#0D9488",
  }
];
