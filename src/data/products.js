export const PRODUCTS = [
  {
    id: "berry-royal-entremet",
    name: "Berry Brown Valrhona Royal Entremet",
    tagline: "Chef Safa's Signature 5-Star Masterpiece",
    category: "entremets",
    badge: "Chef's Signature",
    image: "/images/hero_signature_cake.jpg",
    rating: 5.0,
    reviewsCount: 48,
    basePrice: 320,
    leadTimeHours: 24,
    description: "An homage to haute French pâtisserie. Silky 64% Valrhona Manjari dark chocolate mousse enveloping a tart wild blackberry & raspberry confit core, layered over a crisp hazelnut praline feuilletine and moist almond dacquoise. Crowned with edible 24k gold leaf and fresh berries.",
    dietary: ["100% Halal", "Gelatin-Free", "Pure French Butter AOP", "Single-Origin Valrhona"],
    allergens: ["Dairy", "Nuts (Hazelnuts & Almonds)", "Gluten", "Eggs"],
    sizes: [
      { id: "mini", label: '4" Petite (2-4 servings)', price: 210 },
      { id: "classic", label: '6" Classic (6-8 servings)', price: 320, default: true },
      { id: "grand", label: '8" Grand (10-14 servings)', price: 460 },
      { id: "event", label: '10" Luxe (16-22 servings)', price: 620 }
    ],
    flavorProfiles: [
      { id: "original", name: "Signature: Valrhona Dark 64% & Wild Berry Confit" },
      { id: "milk-choc", name: "Valrhona Jivara 40% Milk Chocolate & Strawberry Rose" },
      { id: "espresso", name: "Mocha Ganache & Dark Berry Espresso Fusion" }
    ],
    servingsGuide: "Chilled at 3-5°C. Remove from chiller 15 minutes before serving for optimal silkiness."
  },
  {
    id: "pistachio-kunafa-crunch",
    name: "Dubai Pistachio & Golden Kunafa Entremet",
    tagline: "Middle Eastern Heritage Meets French Precision",
    category: "entremets",
    badge: "Dubai Bestseller",
    image: "/images/pistachio_kunafa_cake.jpg",
    rating: 5.0,
    reviewsCount: 62,
    basePrice: 340,
    leadTimeHours: 24,
    description: "A tribute to Dubai's rich culinary traditions. Light-as-air Sicilian pistachio mousse cradling an artisanal spun crispy kunafa nest roasted in clarified French butter and orange blossom honey. Finished with an emerald pistachio velvet veil, dried Damascene rose petals, and 24k gold leaf flakes.",
    dietary: ["100% Halal", "Gelatin-Free", "Locally Roasted Pistachios", "Real Orange Blossom"],
    allergens: ["Dairy", "Nuts (Pistachio)", "Gluten", "Eggs"],
    sizes: [
      { id: "mini", label: '4" Petite (2-4 servings)', price: 230 },
      { id: "classic", label: '6" Classic (6-8 servings)', price: 340, default: true },
      { id: "grand", label: '8" Grand (10-14 servings)', price: 490 },
      { id: "event", label: '10" Luxe (16-22 servings)', price: 650 }
    ],
    flavorProfiles: [
      { id: "original", name: "Signature: Bronte Pistachio Cream & Crisp Kunafa Core" },
      { id: "rose-infused", name: "Pistachio Rose Ispahan with Raspberry Reduction" }
    ],
    servingsGuide: "Serve cool. The contrast between chilled velvety mousse and warm-spiced crunchy kunafa is unmatched."
  },
  {
    id: "valrhona-noir-praline",
    name: "Grand Cru Valrhona Dark & Salted Caramel",
    tagline: "Deep, Rich & Decadent Five-Star Elegance",
    category: "entremets",
    badge: "Luxury Classic",
    image: "/images/valrhona_chocolate_entremet.jpg",
    rating: 4.9,
    reviewsCount: 37,
    basePrice: 310,
    leadTimeHours: 24,
    description: "Crafted for discerning dark chocolate lovers. Intense 70% Guanaja Valrhona dark chocolate mousse, flowing salted caramel infused with Guerande fleur de sel, and a crunchy Piedmont hazelnut biscuit base. Topped with hand-sculpted chocolate ribbons dusted with gold.",
    dietary: ["100% Halal", "Gelatin-Free", "Low Added Sugar", "French Valrhona Grand Cru"],
    allergens: ["Dairy", "Nuts (Hazelnuts)", "Gluten", "Eggs"],
    sizes: [
      { id: "mini", label: '4" Petite (2-4 servings)', price: 210 },
      { id: "classic", label: '6" Classic (6-8 servings)', price: 310, default: true },
      { id: "grand", label: '8" Grand (10-14 servings)', price: 440 },
      { id: "event", label: '10" Luxe (16-22 servings)', price: 590 }
    ],
    flavorProfiles: [
      { id: "original", name: "Signature: 70% Dark Guanaja & Fleur de Sel Caramel" },
      { id: "hazelnut-extra", name: "Double Hazelnut Praline & Dark Cocoa Ganache" }
    ],
    servingsGuide: "Cut with a hot knife wiped dry between each slice for razor-sharp 5-star presentation."
  },
  {
    id: "charlotte-fruits-rouges",
    name: "Tahitian Vanilla & Forest Berry Charlotte",
    tagline: "Airy, Elegant & Bursting with Fresh Berries",
    category: "celebration",
    badge: "Light & Refreshing",
    image: "/images/berry_charlotte_cake.jpg",
    rating: 4.9,
    reviewsCount: 29,
    basePrice: 290,
    leadTimeHours: 24,
    description: "An authentic Parisian Charlotte aux fruits rouges. Delicate house-baked ladyfinger biscuits tied with an ivory grosgrain ribbon, encasing a cloud-like Bavarian cream infused with real Tahitian vanilla beans and ruby raspberry compote. Heaped with freshly flown-in raspberries, blackberries, red currants, and wild blueberries.",
    dietary: ["100% Halal", "Natural Madagascar Vanilla", "Fresh Unfrozen Berries"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    sizes: [
      { id: "classic", label: '6" Classic (6-8 servings)', price: 290, default: true },
      { id: "grand", label: '8" Grand (10-14 servings)', price: 420 },
      { id: "event", label: '10" Luxe (16-22 servings)', price: 560 }
    ],
    flavorProfiles: [
      { id: "original", name: "Signature: Tahitian Vanilla Bean & Wild Berry Compote" },
      { id: "lemon-berry", name: "Lemon Verbena Mousseline & Fresh Raspberry" }
    ],
    servingsGuide: "Keep refrigerated until moments before slicing. Beautiful centerpiece for daytime celebrations."
  },
  {
    id: "celebration-bespoke-cake",
    name: "Haute Couture Gold & Floral Celebration Cake",
    tagline: "Bespoke Multi-Tier Masterpiece for Milestone Events",
    category: "celebration",
    badge: "Bespoke Event",
    image: "/images/celebration_bespoke_cake.jpg",
    rating: 5.0,
    reviewsCount: 41,
    basePrice: 850,
    leadTimeHours: 48,
    description: "Custom commissioned tiered cakes tailored for Dubai's finest weddings, anniversaries, and VIP milestones. Handcrafted with delicate stone-textured Swiss meringue buttercream, raw 24k edible gold leaf deckled edges, fresh pesticide-free garden roses, and French almond macarons.",
    dietary: ["100% Halal", "Custom Flavor Infill", "Gelatin-Free", "Vegetarian-Friendly"],
    allergens: ["Dairy", "Nuts (Almonds in Macarons)", "Gluten", "Eggs"],
    sizes: [
      { id: "two-tier-mini", label: '2-Tier Classic (18-24 guests)', price: 850, default: true },
      { id: "two-tier-grand", label: '2-Tier Grand (30-38 guests)', price: 1250 },
      { id: "three-tier-royal", label: '3-Tier Royal Gala (50-65 guests)', price: 1850 }
    ],
    flavorProfiles: [
      { id: "champagne-berry", name: "Madagascar Vanilla Sponge & Strawberry Champagne Confit" },
      { id: "salted-caramel-valrhona", name: "Valrhona Chocolate Sponge & Salted Butter Caramel" },
      { id: "pistachio-cardamom", name: "Pistachio Cake with Cardamom Rose Buttercream" }
    ],
    servingsGuide: "Delivered in a custom thermal travel crate with white-glove setup available across Dubai."
  },
  {
    id: "exotic-mango-passion-tart",
    name: "Exotic Alphonso Mango & Passion Fruit Tart",
    tagline: "Buttery Breton Sable with Spiral Mango Rosette",
    category: "tarts",
    badge: "Seasonal Creation",
    image: "/images/exotic_mango_tart.jpg",
    rating: 4.8,
    reviewsCount: 33,
    basePrice: 240,
    leadTimeHours: 24,
    description: "Crisp golden Breton sablé crust with French AOP butter, filled with silky passion fruit curd and Tahitian vanilla frangipane cream. Artfully layered with hand-carved Alphonso mango petals creating a blooming floral sculpture, brushed with passion fruit glaze, micro-mint, and fresh Persian lime zest.",
    dietary: ["100% Halal", "Seasonal Tropical Fruit", "Zero Preservatives"],
    allergens: ["Dairy", "Gluten", "Eggs", "Nuts (Almond flour)"],
    sizes: [
      { id: "classic", label: '6" Tart (5-7 servings)', price: 240, default: true },
      { id: "grand", label: '8" Tart (8-11 servings)', price: 340 }
    ],
    flavorProfiles: [
      { id: "original", name: "Signature: Passion Fruit Curd & Fresh Alphonso Rosette" },
      { id: "coconut-lime", name: "Lime Curd & Toasted Coconut Crunch with Mango" }
    ],
    servingsGuide: "Best enjoyed cool on the day of delivery for maximum pastry snap and fruit vibrancy."
  }
];

export const CATEGORIES = [
  { id: "all", label: "All Creations" },
  { id: "entremets", label: "Haute Entremets" },
  { id: "celebration", label: "Celebration & Bespoke" },
  { id: "tarts", label: "Artisan Tarts" }
];
