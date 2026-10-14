"use client";

import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  ExternalLink,
  Glasses,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/lib/catalog";
import { products } from "@/lib/catalog";
import XRScene from "@/components/xr/XRScene";

type CartResponse = { items: CartItem[]; error?: string };

function amazonSearchUrl(product: Product) {
  const searchTerm = product.amazonSearchTerm ?? product.name;
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`;
}

function useCartId() {
  const [cartId, setCartId] = useState("");
  useEffect(() => {
    const storedId = window.localStorage.getItem("spatial-merchant-cart");
    const id = storedId ?? window.crypto.randomUUID();
    if (!storedId) window.localStorage.setItem("spatial-merchant-cart", id);
    const timer = window.setTimeout(() => setCartId(id), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return cartId;
}

function ProductThumb({ product }: { product: Product }) {
  return (
    <div
      className="product-art flex h-full w-full items-center justify-center rounded-xl"
      style={{ background: product.background, ["--glow" as string]: product.glow }}
    >
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-2xl shadow-xl backdrop-blur">
        {product.emoji}
      </div>
    </div>
  );
}

export default function Showroom() {
  const xrStore = useMemo(() => createXRStore(), []);
  const cartId = useCartId();
  const [selected, setSelected] = useState(products[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All pieces");
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [xrBusy, setXrBusy] = useState(false);

  const requestCart = useCallback(
    async (method: "GET" | "POST" | "DELETE", body?: object) => {
      const response = await fetch("/api/cart", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-cart-id": cartId,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = (await response.json()) as CartResponse;
      if (!response.ok) throw new Error(data.error ?? "Cart request failed.");
      setCart(data.items);
    },
    [cartId],
  );

  useEffect(() => {
    if (!cartId) return;
    const timer = window.setTimeout(() => {
      requestCart("GET").catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Unable to load your cart.");
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cartId, requestCart]);

  const categories = ["All pieces", ...Array.from(new Set(products.map((item) => item.category)))];
  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === "All pieces" || product.category === category;
    const query = search.trim().toLowerCase();
    return (
      matchesCategory &&
      (!query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query))
    );
  });
  const selectedIndex = products.findIndex((item) => item.id === selected.id);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.quantity * item.price, 0);

  function chooseProduct(product: Product) {
    setSelected(product);
    setRotation(0);
    setScale(1);
    setError("");
  }

  async function addToCart() {
    if (!cartId) return;
    try {
      setError("");
      await requestCart("POST", { productId: selected.id });
      setNotice(`${selected.name} added to your bag`);
      window.setTimeout(() => setNotice(""), 2600);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to add this item.");
    }
  }

  async function removeFromCart(productId: string) {
    try {
      setError("");
      await requestCart("DELETE", { productId });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove this item.");
    }
  }

  async function enterXR(mode: "ar" | "vr") {
    try {
      setError("");
      setXrBusy(true);
      await (mode === "ar" ? xrStore.enterAR() : xrStore.enterVR());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This browser or device could not start a WebXR session.",
      );
    } finally {
      setXrBusy(false);
    }
  }

  function stepProduct(direction: -1 | 1) {
    const next = (selectedIndex + direction + products.length) % products.length;
    chooseProduct(products[next]);
  }

  return (
    <main className="showroom-shell min-h-screen px-4 pb-8 pt-4 md:px-8 md:pt-6">
      <header className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/" aria-label="Spatial Merchant home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d7fb71] text-[#161811]">
            <Sparkles size={19} strokeWidth={2.4} />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.13em]">SPATIAL</span>
            <span className="block text-[10px] tracking-[0.28em] text-white/45">MERCHANT</span>
          </span>
        </Link>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d7fb71]" />
          YOUR PERSONAL SHOWROOM
        </div>
        <button
          aria-label={`Open shopping bag, ${cartCount} items`}
          onClick={() => setCartOpen(true)}
          className="relative flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm transition hover:bg-white/10"
        >
          <ShoppingBag size={17} />
          <span className="hidden sm:inline">Bag</span>
          {cartCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d7fb71] px-1 text-[10px] font-bold text-[#151711]">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <section className="mx-auto mt-8 grid w-full max-w-[1600px] gap-5 lg:mt-10 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="glass order-2 flex max-h-[680px] flex-col rounded-[26px] p-4 lg:order-1">
          <div className="flex items-start justify-between px-1 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#d7fb71]">The collection</p>
              <h1 className="mt-2 text-2xl font-medium tracking-tight">Objects of desire.</h1>
            </div>
            <span className="mt-1 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/55">
              0{products.length} ITEMS
            </span>
          </div>

          <label className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-white/45">
            <Search size={15} />
            <input
              className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-white/35 focus:outline-none"
              placeholder="Find your next favorite"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
            <span className="text-[9px]">⌘ K</span>
          </label>

          <div className="catalog-scroll mt-4 flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] transition ${
                  category === item
                    ? "bg-[#d7fb71] font-semibold text-[#171a12]"
                    : "border border-white/10 text-white/55 hover:border-white/25 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="catalog-scroll mt-4 flex flex-col gap-2 overflow-y-auto pr-1">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group flex w-full items-center gap-2 rounded-2xl border p-2 transition ${
                  selected.id === product.id
                    ? "border-[#d7fb71]/60 bg-[#d7fb71]/[0.07]"
                    : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => chooseProduct(product)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="h-[58px] w-[58px] shrink-0">
                    <ProductThumb product={product} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-medium">{product.name}</span>
                      {product.badge && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[#d7fb71]">
                          {product.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[10px] text-white/45">{product.category}</span>
                    <span className="mt-1.5 block text-xs font-medium">${product.price.toFixed(2)}</span>
                  </span>
                  <span className="pr-1 text-[9px] text-white/30">0{index + 1}</span>
                </button>
                <a
                  href={amazonSearchUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Search Amazon for ${product.name}`}
                  title={`Search Amazon for ${product.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-[#d7fb71]"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
            {visibleProducts.length === 0 && (
              <p className="px-2 py-8 text-center text-xs text-white/45">No pieces match that search.</p>
            )}
          </div>

          <div className="mt-auto border-t border-white/[0.08] pt-4">
            <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/[0.04]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/70">
                <CircleHelp size={16} />
              </span>
              <span className="flex-1">
                <span className="block text-[11px]">A little help?</span>
                <span className="mt-0.5 block text-[9px] text-white/40">How to explore in 3D</span>
              </span>
              <ArrowRight size={14} className="text-white/35" />
            </button>
          </div>
        </aside>

        <div className="order-1 flex min-h-[540px] flex-col lg:order-2 lg:min-h-[680px]">
          <div className="relative min-h-[540px] flex-1 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#171a19] lg:min-h-[680px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(138,158,113,0.13),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_40%,rgba(0,0,0,0.22))]" />
            <div className="canvas-wrap absolute inset-0">
              <Canvas
                shadows
                dpr={[1, 1.75]}
                camera={{ position: [0, 1.2, 5], fov: 42 }}
                gl={{ antialias: true, alpha: true }}
              >
                <XR store={xrStore}>
                  <Suspense fallback={null}>
                    <XRScene product={selected} rotation={rotation} scale={scale} />
                  </Suspense>
                </XR>
              </Canvas>
            </div>

            <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-white/65 backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d7fb71]" />
              Spatial preview
            </div>
            <div className="absolute right-5 top-5 z-10 hidden rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[9px] tracking-wide text-white/50 backdrop-blur-md sm:block">
              DRAG TO ORBIT <span className="mx-1 text-white/20">·</span> SCROLL TO ZOOM
            </div>
            <div className="pointer-events-none absolute bottom-[190px] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.22em] text-white/35 sm:bottom-[176px]">
              {selected.material} · {selected.scaleLabel} scale
            </div>

            <div className="glass absolute bottom-4 left-4 right-4 z-10 rounded-[22px] p-4 sm:bottom-5 sm:left-5 sm:right-5 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-[180px] flex-1 items-center gap-3">
                  <span className="h-12 w-12 shrink-0">
                    <ProductThumb product={selected} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">{selected.category}</p>
                    <h2 className="mt-1 truncate text-lg font-medium">{selected.name}</h2>
                    <p className="mt-0.5 text-xs text-white/60">${selected.price.toFixed(2)}</p>
                  </div>
                  <button
                    aria-label={favoriteIds.includes(selected.id) ? "Remove from favorites" : "Add to favorites"}
                    onClick={() =>
                      setFavoriteIds((current) =>
                        current.includes(selected.id)
                          ? current.filter((id) => id !== selected.id)
                          : [...current, selected.id],
                      )
                    }
                    className={`ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 transition hover:bg-white/10 ${
                      favoriteIds.includes(selected.id) ? "text-rose-300" : "text-white/55"
                    }`}
                  >
                    <Heart size={16} fill={favoriteIds.includes(selected.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-10 items-center rounded-full border border-white/10 bg-black/20 p-1">
                    <button
                      aria-label="Rotate left"
                      onClick={() => setRotation((value) => value - 0.4)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      aria-label="Reset product view"
                      onClick={() => {
                        setRotation(0);
                        setScale(1);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      aria-label="Rotate right"
                      onClick={() => setRotation((value) => value + 0.4)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="flex h-10 items-center rounded-full border border-white/10 bg-black/20 p-1">
                    <button
                      aria-label="Make product smaller"
                      onClick={() => setScale((value) => Math.max(0.65, value - 0.1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-10 text-center text-[10px] text-white/60">{Math.round(scale * 100)}%</span>
                    <button
                      aria-label="Make product larger"
                      onClick={() => setScale((value) => Math.min(1.5, value + 0.1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    onClick={addToCart}
                    disabled={!cartId}
                    className="flex h-10 items-center gap-2 rounded-full bg-[#d7fb71] px-5 text-xs font-semibold text-[#1b1d15] transition hover:bg-[#e3ff9a] disabled:cursor-wait disabled:opacity-60"
                  >
                    <ShoppingBag size={14} />
                    Add to bag
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                <span className="text-[10px] text-white/40">{selected.description}</span>
                <div className="flex items-center gap-1.5">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      aria-label={`View ${product.name}`}
                      onClick={() => chooseProduct(product)}
                      className={`h-1 rounded-full transition-all ${
                        product.id === selected.id ? "w-5 bg-[#d7fb71]" : "w-1.5 bg-white/25 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2 text-[10px] text-white/45">
              <button
                onClick={() => stepProduct(-1)}
                aria-label="Previous product"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/10"
              >
                <ArrowLeft size={14} />
              </button>
              <span>Piece {String(selectedIndex + 1).padStart(2, "0")} of {String(products.length).padStart(2, "0")}</span>
              <button
                onClick={() => stepProduct(1)}
                aria-label="Next product"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/10"
              >
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={amazonSearchUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-[10px] transition hover:border-[#d7fb71]/60 hover:bg-[#d7fb71]/[0.07]"
              >
                Shop on Amazon
                <ExternalLink size={13} />
              </a>
              <button
                onClick={() => enterXR("ar")}
                disabled={xrBusy}
                className="flex h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-[10px] transition hover:border-[#d7fb71]/60 hover:bg-[#d7fb71]/[0.07] disabled:opacity-50"
              >
                <Glasses size={14} className="text-[#d7fb71]" />
                View in your space
              </button>
              <button
                onClick={() => enterXR("vr")}
                disabled={xrBusy}
                className="hidden h-9 items-center gap-2 rounded-full border border-white/10 px-4 text-[10px] text-white/60 transition hover:bg-white/10 sm:flex disabled:opacity-50"
              >
                Enter VR
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div role="alert" className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl border border-rose-300/20 bg-[#241b1b] px-4 py-3 text-xs text-rose-100 shadow-xl">
          <span className="max-w-[min(70vw,500px)]">{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}
      {notice && (
        <div role="status" className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d7fb71]/20 bg-[#1d2515] px-4 py-3 text-xs text-[#e9ffc1] shadow-xl">
          <Check size={14} /> {notice}
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCartOpen(false);
        }}>
          <section aria-label="Shopping bag" className="glass flex h-full w-full max-w-md flex-col border-y-0 border-r-0 p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.23em] text-[#d7fb71]">Your selection</p>
                <h2 className="mt-1 text-xl">Shopping bag <span className="text-sm text-white/40">({cartCount})</span></h2>
              </div>
              <button aria-label="Close shopping bag" onClick={() => setCartOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>
            <div className="catalog-scroll flex-1 overflow-y-auto py-4">
              {cart.map((item) => {
                const product = products.find((candidate) => candidate.id === item.id);
                if (!product) return null;
                return (
                  <div key={item.id} className="flex items-center gap-3 border-b border-white/[0.08] py-4">
                    <span className="h-16 w-16 shrink-0"><ProductThumb product={product} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{product.name}</p>
                      <p className="mt-1 text-xs text-white/45">Qty {item.quantity} · ${product.price.toFixed(2)}</p>
                    </div>
                    <button aria-label={`Remove ${product.name}`} onClick={() => removeFromCart(item.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
              {cart.length === 0 && (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-white/40"><ShoppingBag size={20} /></span>
                  <p className="mt-4 text-sm">Your bag is taking a little breather.</p>
                  <p className="mt-1 text-xs text-white/40">Find something you love in the collection.</p>
                  <button onClick={() => setCartOpen(false)} className="mt-5 flex items-center gap-2 text-xs text-[#d7fb71]">Explore pieces <ArrowRight size={13} /></button>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/55">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-[10px] text-white/35">Shipping and taxes calculated at checkout.</p>
              <button disabled={cart.length === 0} onClick={() => setError("Checkout is not connected yet. Your bag is saved for this session.")} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d7fb71] text-xs font-semibold text-[#1b1d15] transition hover:bg-[#e3ff9a] disabled:cursor-not-allowed disabled:opacity-40">
                Continue to checkout <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
