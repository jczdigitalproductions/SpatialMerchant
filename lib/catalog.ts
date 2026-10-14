export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  material: string;
  scaleLabel: string;
  model: "vase" | "headphones" | "lamp" | "sneaker" | "molecule";
  color: string;
  accent: string;
  background: string;
  glow: string;
  emoji: string;
  amazonSearchTerm?: string;
  badge?: string;
};

export type CartItem = {
  id: string;
  quantity: number;
  price: number;
};

export const products: Product[] = [
  {
    id: "sora-vase",
    name: "Sora Sculptural Vase",
    category: "Living",
    price: 148,
    description: "A quiet statement, made to be noticed.",
    material: "Glazed ceramic",
    scaleLabel: "1:1",
    model: "vase",
    color: "#c3a788",
    accent: "#f2dfc7",
    background: "linear-gradient(145deg, #383a32, #222624)",
    glow: "#9c875d",
    emoji: "◒",
    badge: "BESTSELLER",
  },
  {
    id: "arc-headphones",
    name: "Arc Studio Headphones",
    category: "Audio",
    price: 329,
    description: "Pure sound. Thoughtful form.",
    material: "Brushed titanium",
    scaleLabel: "1:1",
    model: "headphones",
    color: "#bdc4c1",
    accent: "#d7fb71",
    background: "linear-gradient(145deg, #2f3a3a, #202526)",
    glow: "#53716d",
    emoji: "◉",
    badge: "NEW",
  },
  {
    id: "forma-lamp",
    name: "Forma Table Light",
    category: "Living",
    price: 286,
    description: "A softer kind of statement piece.",
    material: "Anodized aluminum",
    scaleLabel: "1:1",
    model: "lamp",
    color: "#829286",
    accent: "#d6c298",
    background: "linear-gradient(145deg, #3a3830, #242523)",
    glow: "#968351",
    emoji: "◐",
  },
  {
    id: "pace-sneaker",
    name: "Pace 01 Sneaker",
    category: "Wear",
    price: 195,
    description: "Everyday comfort, reimagined.",
    material: "Recycled knit",
    scaleLabel: "1:1",
    model: "sneaker",
    color: "#d4d4c8",
    accent: "#d7fb71",
    background: "linear-gradient(145deg, #34382f, #222522)",
    glow: "#687a4e",
    emoji: "◡",
  },
  {
    id: "molecule-no-01",
    name: "Molecule No. 01",
    category: "Collectibles",
    price: 89,
    description: "A luminous molecular study for your space.",
    material: "Sculpted molecular resin",
    scaleLabel: "1:1",
    model: "molecule",
    color: "#b7d6d7",
    accent: "#d7fb71",
    background: "linear-gradient(145deg, #283c3c, #1d2728)",
    glow: "#4c9990",
    emoji: "✣",
    amazonSearchTerm: "molecular model sculpture",
    badge: "NEW",
  },
];

export interface VaseProduct {
  id: string;
  kind?: "vase" | "molecule";
  badge?: string;
  name: string;
  subtitle: string;
  price: number;
  sku: string;
  dimensions: string;
  materialName: string;
  description: string;
  color: string;
  roughness: number;
  metalness: number;
  transmission?: number;
  profile?: "ribbed-amphora" | "twisted-torus" | "minimal-flute";
  finishes: { name: string; hex: string; roughness: number; metalness: number }[];
  atoms?: MoleculeAtom[];
  bonds?: MoleculeBond[];
}

export type MoleculeElement = "C" | "N" | "O" | "H" | "S" | "P" | "F" | "Cl";

export interface MoleculeAtom {
  id: string;
  element: MoleculeElement;
  position: [number, number, number];
  radius: number;
}

export type MoleculeBond = [number, number];

export const SORA_COLLECTION: VaseProduct[] = [
  {
    id: "sora-01-origin",
    name: "Sora Sculptural Vase — Origin",
    subtitle: "Hand-finished stoneware silhouette",
    price: 240,
    sku: "SORA-ORG-01",
    dimensions: "38cm × 22cm × 22cm",
    materialName: "Matte Raw Terracotta / Ceramic",
    description:
      "An organic, fluid vessel inspired by wind-carved canyon forms. Designed for 1:1 spatial inspection on tabletops.",
    color: "#e0dcd3",
    roughness: 0.75,
    metalness: 0.05,
    profile: "ribbed-amphora",
    finishes: [
      { name: "Chalk Stone", hex: "#e0dcd3", roughness: 0.75, metalness: 0.05 },
      { name: "Kyoto Moss", hex: "#4a5d4e", roughness: 0.6, metalness: 0.1 },
      { name: "Burnt Sienna", hex: "#b85d43", roughness: 0.7, metalness: 0.05 },
    ],
  },
  {
    id: "sora-02-aura",
    name: "Sora Sculptural Vase — Aura",
    subtitle: "Iridescent anodised aluminum",
    price: 380,
    sku: "SORA-AUR-02",
    dimensions: "44cm × 19cm × 19cm",
    materialName: "Brushed Spatial Alloy",
    description:
      "Features a dramatic hyperbolic waist that catches directional ambient light in both physical passthrough and virtual environments.",
    color: "#818cf8",
    roughness: 0.18,
    metalness: 0.88,
    profile: "twisted-torus",
    finishes: [
      { name: "Cobalt Chrome", hex: "#818cf8", roughness: 0.18, metalness: 0.88 },
      { name: "Champagne Gold", hex: "#d4af37", roughness: 0.22, metalness: 0.9 },
      { name: "Obsidian Mirror", hex: "#27272a", roughness: 0.1, metalness: 0.95 },
    ],
  },
  {
    id: "sora-03-solstice",
    name: "Sora Sculptural Vase — Solstice",
    subtitle: "Architectural fluted vessel",
    price: 310,
    sku: "SORA-SOL-03",
    dimensions: "32cm × 26cm × 26cm",
    materialName: "Satin Glazed Porcelain",
    description:
      "Wide-shouldered sculptural silhouette balanced on a narrow pedestal foot. Ideal as a centerpiece in mixed reality.",
    color: "#f4f4f5",
    roughness: 0.3,
    metalness: 0.15,
    profile: "minimal-flute",
    finishes: [
      { name: "Glacier White", hex: "#f4f4f5", roughness: 0.3, metalness: 0.15 },
      { name: "Cobalt Blue", hex: "#2563eb", roughness: 0.25, metalness: 0.2 },
      { name: "Warm Sand", hex: "#d6c7b2", roughness: 0.55, metalness: 0.1 },
    ],
  },
  {
    id: "mol-03-beta-sheet",
    kind: "molecule",
    badge: "2° β",
    name: "Secondary: β-pleated sheet",
    subtitle: "Three antiparallel strands linked by interstrand H-bonds",
    price: 320,
    sku: "MOL-BET-2B",
    dimensions: "46cm × 34cm × 16cm",
    materialName: "Pleated Polypeptide Lattice & Hydrogen Bridge Alloy",
    description:
      "Three antiparallel polypeptide strands arranged in a corrugated zig-zag plane, stabilized by interstrand hydrogen bonds between carbonyl oxygens and amide nitrogens.",
    color: "#06b6d4",
    roughness: 0.22,
    metalness: 0.7,
    atoms: [
      { id: "S1-N1", element: "N", position: [-0.14, -0.15, 0.03], radius: 0.032 },
      { id: "S1-C1", element: "C", position: [-0.14, -0.05, -0.03], radius: 0.035 },
      { id: "S1-O1", element: "O", position: [-0.08, -0.05, -0.03], radius: 0.028 },
      { id: "S1-N2", element: "N", position: [-0.14, 0.05, 0.03], radius: 0.032 },
      { id: "S1-C2", element: "C", position: [-0.14, 0.15, -0.03], radius: 0.035 },
      { id: "S2-C1", element: "C", position: [0, -0.15, -0.03], radius: 0.035 },
      { id: "S2-N1", element: "N", position: [0, -0.05, 0.03], radius: 0.032 },
      { id: "S2-C2", element: "C", position: [0, 0.05, -0.03], radius: 0.035 },
      { id: "S2-O2", element: "O", position: [0.06, 0.05, -0.03], radius: 0.028 },
      { id: "S2-N2", element: "N", position: [0, 0.15, 0.03], radius: 0.032 },
      { id: "S3-N1", element: "N", position: [0.14, -0.15, 0.03], radius: 0.032 },
      { id: "S3-C1", element: "C", position: [0.14, -0.05, -0.03], radius: 0.035 },
      { id: "S3-N2", element: "N", position: [0.14, 0.05, 0.03], radius: 0.032 },
      { id: "S3-C2", element: "C", position: [0.14, 0.15, -0.03], radius: 0.035 },
    ],
    bonds: [
      [0, 1], [1, 2], [1, 3], [3, 4],
      [5, 6], [6, 7], [7, 8], [7, 9],
      [10, 11], [11, 12], [12, 13],
      [0, 5], [2, 6], [3, 7], [4, 9],
      [5, 10], [6, 11], [8, 12], [9, 13],
    ],
    finishes: [
      { name: "Cyan Ribbon (2° β)", hex: "#06b6d4", roughness: 0.2, metalness: 0.65 },
      { name: "CPK Standard", hex: "#38bdf8", roughness: 0.2, metalness: 0.6 },
      { name: "Titanium Pleat", hex: "#e4e4e7", roughness: 0.25, metalness: 0.9 },
    ],
  },
];
