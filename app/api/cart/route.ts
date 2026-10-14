import { NextRequest, NextResponse } from "next/server";
import { getCart, removeFromCart, updateCart } from "@/lib/cart";
import { products } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function readCartId(request: NextRequest) {
  const cartId = request.headers.get("x-cart-id");
  if (!cartId || !/^[a-zA-Z0-9-]{8,80}$/.test(cartId)) {
    return null;
  }
  return cartId;
}

export async function GET(request: NextRequest) {
  const cartId = readCartId(request);
  if (!cartId) {
    return NextResponse.json({ error: "A valid cart ID is required." }, { status: 400 });
  }

  try {
    return NextResponse.json({ items: await getCart(cartId) });
  } catch (error) {
    console.error("Unable to load cart:", error);
    return NextResponse.json({ error: "Unable to load your cart." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cartId = readCartId(request);
  if (!cartId) {
    return NextResponse.json({ error: "A valid cart ID is required." }, { status: 400 });
  }

  let body: { productId?: unknown; quantity?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const product = products.find((item) => item.id === body.productId);
  const quantity = body.quantity ?? 1;
  if (!product || !Number.isInteger(quantity) || Number(quantity) < 1 || Number(quantity) > 20) {
    return NextResponse.json({ error: "Choose a valid product and quantity (1–20)." }, { status: 400 });
  }

  try {
    const items = await updateCart(cartId, product.id, Number(quantity));
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Unable to update cart:", error);
    return NextResponse.json({ error: "Unable to update your cart." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cartId = readCartId(request);
  if (!cartId) {
    return NextResponse.json({ error: "A valid cart ID is required." }, { status: 400 });
  }

  let body: { productId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.productId !== "string" || !products.some((item) => item.id === body.productId)) {
    return NextResponse.json({ error: "Choose a valid product to remove." }, { status: 400 });
  }

  try {
    const items = await removeFromCart(cartId, body.productId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Unable to remove cart item:", error);
    return NextResponse.json({ error: "Unable to remove that item." }, { status: 500 });
  }
}
