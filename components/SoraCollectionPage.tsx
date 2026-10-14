"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Box,
  CheckCircle2,
  Glasses,
  Layers,
  RotateCw,
  Ruler,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { VaseProduct } from "@/lib/catalog";
import { SORA_COLLECTION } from "@/lib/catalog";
import { xrStore } from "@/components/xr/XRScene";
import V0MoleculeBridge from "@/components/V0MoleculeBridge";

const SoraVaseXRScene = dynamic(
  () => import("@/components/xr/XRScene").then((module) => module.SoraVaseXRScene),
  { ssr: false },
);

type OrderResponse = {
  success?: boolean;
  storage?: string;
  order?: { id: number | string };
  error?: string;
};

export default function SoraCollectionPage() {
  const [selectedProduct, setSelectedProduct] = useState<VaseProduct>(SORA_COLLECTION[0]);
  const [customProducts, setCustomProducts] = useState<VaseProduct[]>([]);
  const [activeFinish, setActiveFinish] = useState(SORA_COLLECTION[0].finishes[0]);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [xrError, setXrError] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  function handleSelectProduct(product: VaseProduct) {
    setSelectedProduct(product);
    setActiveFinish(product.finishes[0]);
  }

  function handleImportMolecule(product: VaseProduct) {
    setCustomProducts((current) => [...current, product]);
    handleSelectProduct(product);
  }

  async function handleAddToCart() {
    setIsOrdering(true);
    setOrderStatus("Recording your order...");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          name: selectedProduct.name,
          finish: activeFinish.name,
        }),
      });
      const data = (await response.json()) as OrderResponse;
      if (!response.ok || !data.success || !data.order) {
        throw new Error(data.error ?? "Could not record your order.");
      }

      setCartCount((count) => count + 1);
      setOrderStatus(`Reserved (#${data.order.id} · ${data.storage ?? "saved"})`);
      window.setTimeout(() => setOrderStatus(null), 4000);
    } catch (error) {
      setOrderStatus(error instanceof Error ? error.message : "Could not record your order.");
    } finally {
      setIsOrdering(false);
    }
  }

  async function enterXR(mode: "ar" | "vr") {
    setXrError("");
    try {
      await (mode === "ar" ? xrStore.enterAR() : xrStore.enterVR());
    } catch (error) {
      setXrError(
        error instanceof Error ? error.message : "This device could not start a WebXR session.",
      );
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080a0f] text-white lg:h-screen">
      <div className="absolute inset-0 z-0">
        <SoraVaseXRScene
          product={selectedProduct}
          activeFinish={activeFinish}
          scaleMultiplier={scaleMultiplier}
          autoRotate={autoRotate}
          showDimensions={showDimensions}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_48%,transparent_20%,rgba(8,10,15,0.34)_100%)]" />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/75 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/20">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight sm:text-base">SPATIAL MERCHANT</h1>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-[9px] uppercase tracking-widest text-indigo-200">
                Sora Collection
              </span>
            </div>
            <p className="mt-0.5 hidden text-xs text-neutral-400 sm:block">
              WebXR sculptural showroom
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => void enterXR("ar")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-medium shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 sm:px-4 sm:text-sm"
          >
            <Glasses className="h-4 w-4" />
            <span className="hidden sm:inline">Place in Room</span>
            <span className="sm:hidden">AR</span>
          </button>
          <button
            onClick={() => void enterXR("vr")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/80 px-3 py-2.5 text-xs text-neutral-200 backdrop-blur-xl transition hover:bg-neutral-800 sm:px-4 sm:text-sm"
          >
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Enter VR Gallery</span>
            <span className="sm:hidden">VR</span>
          </button>
          <div
            aria-label={`${cartCount} orders`}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900/80 px-3 py-2.5 text-sm backdrop-blur-xl"
          >
            <ShoppingBag className="h-4 w-4 text-indigo-300" />
            <span className="font-mono font-semibold">{cartCount}</span>
          </div>
        </div>
      </header>

      <Link
        href="/showroom"
        className="absolute right-5 top-[5.5rem] z-20 rounded-full border border-white/10 bg-neutral-900/75 px-3 py-2 text-[10px] text-neutral-300 backdrop-blur-xl transition hover:bg-neutral-800 sm:right-6 sm:top-24"
      >
        Browse all objects
      </Link>

      <section className="absolute left-4 top-28 z-20 max-h-[34vh] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900/75 p-4 shadow-2xl backdrop-blur-xl sm:left-6 sm:top-1/2 sm:max-h-[68vh] sm:-translate-y-1/2">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <Layers className="h-3.5 w-3.5 text-indigo-300" />
          Sora Sculptural Objects
        </div>
        <div className="flex flex-col gap-2">
          {[...SORA_COLLECTION, ...customProducts].map((item) => {
            const isSelected = item.id === selectedProduct.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectProduct(item)}
                aria-pressed={isSelected}
                className={`rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? "border-cyan-500/40 bg-[#091e26]/90 text-white shadow-lg shadow-cyan-950/50"
                    : "border-transparent bg-white/5 text-neutral-300 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">
                    {item.name.split("—")[1]?.trim() ?? item.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {item.badge && (
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                        {item.badge}
                      </span>
                    )}
                    <span className="font-mono text-xs text-indigo-200">${item.price}</span>
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-neutral-400">{item.subtitle}</span>
              </button>
            );
          })}
        </div>
        <V0MoleculeBridge onImportMolecule={handleImportMolecule} />
      </section>

      <section className="absolute left-4 top-[calc(28vh+1rem)] z-20 flex w-[min(21rem,calc(100vw-2rem))] items-center justify-between gap-2 rounded-2xl border border-white/10 bg-neutral-900/75 p-3 backdrop-blur-xl sm:left-6 sm:top-auto sm:bottom-6">
        <button
          onClick={() => setAutoRotate((value) => !value)}
          aria-pressed={autoRotate}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[10px] font-medium transition sm:text-xs ${
            autoRotate ? "bg-indigo-600 text-white" : "bg-white/5 text-neutral-300"
          }`}
        >
          <RotateCw className="h-3.5 w-3.5" />
          Turntable
        </button>
        <button
          onClick={() => setShowDimensions((value) => !value)}
          aria-pressed={showDimensions}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[10px] font-medium transition sm:text-xs ${
            showDimensions ? "bg-indigo-600 text-white" : "bg-white/5 text-neutral-300"
          }`}
        >
          <Ruler className="h-3.5 w-3.5" />
          Dimensions
        </button>
        <button
          onClick={() => setScaleMultiplier((value) => (value === 1 ? 1.35 : 1))}
          aria-label={scaleMultiplier === 1 ? "Scale to 135 percent" : "Reset scale to 100 percent"}
          className="rounded-xl bg-white/5 px-3 py-2 font-mono text-[10px] text-neutral-200 transition hover:bg-white/10 sm:text-xs"
        >
          {scaleMultiplier === 1 ? "100%" : "135%"}
        </button>
      </section>

      <aside className="absolute bottom-4 right-4 z-20 max-h-[48vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-white/10 bg-neutral-900/85 p-4 shadow-2xl backdrop-blur-2xl sm:bottom-6 sm:right-6 sm:max-h-[80vh] sm:p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-indigo-300">
              SKU: {selectedProduct.sku}
            </span>
            <h2 className="mt-1 text-lg font-semibold sm:text-xl">{selectedProduct.name}</h2>
            <p className="mt-1 text-xs text-neutral-400">
              {selectedProduct.dimensions} · {selectedProduct.materialName}
            </p>
          </div>
          <span className="whitespace-nowrap font-mono text-xl font-bold">${selectedProduct.price}</span>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-neutral-300">{selectedProduct.description}</p>

        <div className="mb-4">
          <span className="mb-2 block text-xs text-neutral-400">
            Finish: <strong className="text-white">{activeFinish.name}</strong>
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedProduct.finishes.map((finish) => (
              <button
                key={finish.name}
                onClick={() => setActiveFinish(finish)}
                aria-pressed={activeFinish.name === finish.name}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[10px] transition sm:text-xs ${
                  activeFinish.name === finish.name
                    ? "border-white bg-white/15 font-medium text-white"
                    : "border-white/10 bg-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: finish.hex }}
                />
                {finish.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => void handleAddToCart()}
          disabled={isOrdering}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-xl transition hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-60"
        >
          <ShoppingBag className="h-4 w-4" />
          {isOrdering ? "Recording order..." : "Acquire Sculptural Object"}
        </button>

        {orderStatus && (
          <div
            role={orderStatus.startsWith("Reserved") ? "status" : "alert"}
            className={`mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium ${
              orderStatus.startsWith("Reserved") || orderStatus.startsWith("Recording")
                ? "text-emerald-400"
                : "text-rose-300"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {orderStatus}
          </div>
        )}
      </aside>

      {xrError && (
        <div
          role="alert"
          className="absolute bottom-5 left-1/2 z-30 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-rose-300/20 bg-[#241b1b] px-4 py-3 text-xs text-rose-100 shadow-xl"
        >
          {xrError}
        </div>
      )}
    </main>
  );
}
