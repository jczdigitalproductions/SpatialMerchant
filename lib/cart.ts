import { neon } from "@neondatabase/serverless";
import { products } from "@/lib/catalog";
import type { CartItem } from "@/lib/catalog";

const memoryCarts = new Map<string, Map<string, number>>();
let tableReady: Promise<void> | undefined;

function getMemoryCart(cartId: string) {
  let cart = memoryCarts.get(cartId);
  if (!cart) {
    cart = new Map<string, number>();
    memoryCarts.set(cartId, cart);
  }
  return cart;
}

async function ensureTable() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;
  if (!tableReady) {
    const sql = neon(connectionString);
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS spatial_merchant_cart_items (
        session_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 20),
        PRIMARY KEY (session_id, product_id)
      )
    `.then(() => undefined).catch((error: unknown) => {
      tableReady = undefined;
      throw error;
    });
  }
  await tableReady;
}

function toCartItems(rows: { product_id: string; quantity: number }[]): CartItem[] {
  return rows.flatMap((row) => {
    const product = products.find((item) => item.id === row.product_id);
    return product ? [{ id: product.id, quantity: Number(row.quantity), price: product.price }] : [];
  });
}

export async function getCart(cartId: string): Promise<CartItem[]> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return toCartItems(
      Array.from(getMemoryCart(cartId), ([product_id, quantity]) => ({ product_id, quantity })),
    );
  }

  await ensureTable();
  const sql = neon(connectionString);
  const rows = await sql`
    SELECT product_id, quantity
    FROM spatial_merchant_cart_items
    WHERE session_id = ${cartId}
    ORDER BY product_id
  `;
  return toCartItems(rows as { product_id: string; quantity: number }[]);
}

export async function updateCart(
  cartId: string,
  productId: string,
  quantity: number,
): Promise<CartItem[]> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const cart = getMemoryCart(cartId);
    cart.set(productId, Math.min(20, (cart.get(productId) ?? 0) + quantity));
    return getCart(cartId);
  }

  await ensureTable();
  const sql = neon(connectionString);
  await sql`
    INSERT INTO spatial_merchant_cart_items (session_id, product_id, quantity)
    VALUES (${cartId}, ${productId}, ${quantity})
    ON CONFLICT (session_id, product_id)
    DO UPDATE SET quantity = LEAST(spatial_merchant_cart_items.quantity + EXCLUDED.quantity, 20)
  `;
  return getCart(cartId);
}

export async function removeFromCart(cartId: string, productId: string): Promise<CartItem[]> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    getMemoryCart(cartId).delete(productId);
    return getCart(cartId);
  }

  await ensureTable();
  const sql = neon(connectionString);
  await sql`
    DELETE FROM spatial_merchant_cart_items
    WHERE session_id = ${cartId} AND product_id = ${productId}
  `;
  return getCart(cartId);
}
