"use client";

import { useState } from "react";
import { ArrowRight, Atom, Check, ExternalLink, Sparkles, X } from "lucide-react";
import type { MoleculeAtom, MoleculeBond, VaseProduct } from "@/lib/catalog";

const V0_EDITOR_URL =
  "https://v0.app/downloadwenjian-3504/chat/spatial-molecule-editor-jVbSZIgm4RB";

interface V0MoleculeBridgeProps {
  onImportMolecule: (customProduct: VaseProduct) => void;
}

const ELEMENTS = new Set(["C", "N", "O", "H", "S", "P", "F", "Cl"]);
const DEFAULT_ATOMS: MoleculeAtom[] = [
  { id: "C1", element: "C", position: [0, 0.08, 0], radius: 0.038 },
  { id: "N1", element: "N", position: [0.11, 0.04, 0.02], radius: 0.036 },
  { id: "C2", element: "C", position: [0.08, -0.08, -0.02], radius: 0.038 },
  { id: "N2", element: "N", position: [-0.05, -0.1, 0.03], radius: 0.036 },
  { id: "C3", element: "C", position: [-0.11, 0, -0.01], radius: 0.038 },
  { id: "O1", element: "O", position: [-0.21, 0.02, -0.04], radius: 0.034 },
  { id: "O2", element: "O", position: [0.16, -0.16, -0.05], radius: 0.034 },
  { id: "H1", element: "H", position: [0.2, 0.09, 0.05], radius: 0.024 },
];
const DEFAULT_BONDS: MoleculeBond[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [4, 5],
  [2, 6],
  [1, 7],
];

function validateAtoms(value: unknown): MoleculeAtom[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200) return null;

  const atoms: MoleculeAtom[] = [];
  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("id" in item) ||
      !("element" in item) ||
      !("position" in item) ||
      !("radius" in item)
    ) {
      return null;
    }

    const atom = item as Record<string, unknown>;
    if (
      typeof atom.id !== "string" ||
      atom.id.length === 0 ||
      atom.id.length > 20 ||
      typeof atom.element !== "string" ||
      !ELEMENTS.has(atom.element) ||
      !Array.isArray(atom.position) ||
      atom.position.length !== 3 ||
      !atom.position.every(
        (coordinate) =>
          typeof coordinate === "number" && Number.isFinite(coordinate) && Math.abs(coordinate) <= 10,
      ) ||
      typeof atom.radius !== "number" ||
      !Number.isFinite(atom.radius) ||
      atom.radius < 0.005 ||
      atom.radius > 0.2
    ) {
      return null;
    }

    atoms.push({
      id: atom.id,
      element: atom.element as MoleculeAtom["element"],
      position: atom.position as MoleculeAtom["position"],
      radius: atom.radius,
    });
  }
  return atoms;
}

function validateBonds(value: unknown, atomCount: number): MoleculeBond[] | null {
  if (!Array.isArray(value) || value.length > 400) return null;
  const bonds: MoleculeBond[] = [];
  for (const bond of value) {
    if (
      !Array.isArray(bond) ||
      bond.length !== 2 ||
      !bond.every((index) => Number.isInteger(index) && index >= 0 && index < atomCount) ||
      bond[0] === bond[1]
    ) {
      return null;
    }
    bonds.push([bond[0], bond[1]]);
  }
  return bonds;
}

export default function V0MoleculeBridge({ onImportMolecule }: V0MoleculeBridgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [moleculeName, setMoleculeName] = useState("Custom Caffeine Molecule");
  const [formulaInput, setFormulaInput] = useState("C8H10N4O2");
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState("");

  function handleImport() {
    const name = moleculeName.trim();
    const formula = formulaInput.trim();
    if (!name || name.length > 60 || !/^[A-Za-z0-9()+·.\s-]{1,32}$/.test(formula)) {
      setError("Enter a title (up to 60 characters) and a valid short formula or identifier.");
      return;
    }

    let atoms = DEFAULT_ATOMS;
    let bonds = DEFAULT_BONDS;
    if (rawJson.trim()) {
      try {
        const parsed: unknown = JSON.parse(rawJson);
        if (typeof parsed !== "object" || parsed === null || !("atoms" in parsed)) {
          throw new Error("JSON must contain an atoms array.");
        }
        const parsedAtoms = validateAtoms(parsed.atoms);
        const parsedBonds =
          "bonds" in parsed
            ? validateBonds(parsed.bonds, parsedAtoms?.length ?? 0)
            : parsedAtoms
              ? []
              : null;
        if (!parsedAtoms || !parsedBonds) {
          throw new Error("Atoms or bonds are invalid. Check the supported JSON shape and limits.");
        }
        atoms = parsedAtoms;
        bonds = parsedBonds;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not parse molecule JSON.");
        return;
      }
    }

    const customProduct: VaseProduct = {
      id: `v0-custom-${crypto.randomUUID()}`,
      name: `v0 Custom — ${name}`,
      subtitle: `Designed in v0 Spatial Molecule Editor (${formula})`,
      price: 340,
      sku: `V0-MOL-${formula.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "CUSTOM"}`,
      dimensions: "38cm × 38cm × 24cm",
      materialName: "Custom Bespoke Atomic Sculpture",
      description:
        "A custom molecular sculpture for 1:1 WebXR inspection. Coordinates may be imported as JSON or use the included sample lattice.",
      color: "#38bdf8",
      roughness: 0.18,
      metalness: 0.75,
      profile: "ribbed-amphora",
      kind: "molecule",
      atoms,
      bonds,
      finishes: [
        { name: "CPK Standard", hex: "#38bdf8", roughness: 0.2, metalness: 0.6 },
        { name: "Iridescent Alloy", hex: "#818cf8", roughness: 0.15, metalness: 0.88 },
        { name: "Pure Gold", hex: "#f59e0b", roughness: 0.2, metalness: 0.92 },
      ],
    };

    onImportMolecule(customProduct);
    setError("");
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => {
          setError("");
          setIsOpen(true);
        }}
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:from-indigo-500 hover:to-cyan-500"
      >
        <Atom className="h-4 w-4" />
        Design Custom Molecule in v0
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="v0-molecule-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-neutral-900 p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
                <Sparkles className="h-4 w-4" />
                v0 → SpatialMerchant
              </div>
              <button
                aria-label="Close molecule import"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-white/5 p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 id="v0-molecule-title" className="mb-1 text-lg font-bold">
              Design or import a molecule
            </h2>
            <p className="mb-4 text-xs text-neutral-400">
              Open the editor, then paste atom-coordinate JSON here. Without coordinates, a sample
              lattice is used; entering a formula alone does not generate its chemical structure.
            </p>

            <a
              href={V0_EDITOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
            >
              <span className="flex items-center gap-2">
                <Atom className="h-4 w-4 text-cyan-400" />
                Open v0 Spatial Molecule Editor
              </span>
              <ExternalLink className="h-4 w-4 text-neutral-400" />
            </a>

            <div className="mb-5 space-y-3">
              <label className="block text-xs text-neutral-400">
                Sculpture title
                <input
                  type="text"
                  maxLength={60}
                  value={moleculeName}
                  onChange={(event) => setMoleculeName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white"
                />
              </label>

              <label className="block text-xs text-neutral-400">
                Formula or identifier
                <input
                  type="text"
                  maxLength={32}
                  value={formulaInput}
                  onChange={(event) => setFormulaInput(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-sm text-cyan-300"
                />
              </label>

              <label className="block text-xs text-neutral-400">
                Optional atom coordinates JSON
                <textarea
                  rows={5}
                  placeholder='{"atoms":[{"id":"C1","element":"C","position":[0,0,0],"radius":0.038}],"bonds":[]}'
                  value={rawJson}
                  onChange={(event) => setRawJson(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-neutral-300"
                />
                <span className="mt-1 block text-[10px] text-neutral-500">
                  Elements: C, N, O, H, S, P, F, Cl. Bond endpoints are atom array indices.
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="mb-3 text-xs text-rose-300">
                {error}
              </p>
            )}

            <button
              onClick={handleImport}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl transition hover:bg-indigo-500"
            >
              <Check className="h-4 w-4" />
              Import to WebXR Showroom · $340
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      )}
    </>
  );
}
