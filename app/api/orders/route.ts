import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { SORA_COLLECTION } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SpatialOrder = {
  id: number;
  product_id: string;
  product_name: string;
  finish: string;
  price: number;
  created_at: string;
};

const memoryOrders: SpatialOrder[] = [];
let nextMemoryOrderId = 1;

export async function POST(request: Request) {
  let body: { productId?: unknown; name?: unknown; finish?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof body.productId !== "string" ||
    typeof body.finish !== "string" ||
    typeof body.name !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "A valid productId, name, and finish are required." },
      { status: 400 },
    );
  }

  const catalogProduct = SORA_COLLECTION.find((item) => item.id === body.productId);
  const isCustomMolecule =
    /^v0-custom-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      body.productId,
    ) &&
    body.name.startsWith("v0 Custom — ") &&
    body.name.length <= 80;
  const customFinishNames = ["CPK Standard", "Iridescent Alloy", "Pure Gold"];
  const finish = catalogProduct?.finishes.find((item) => item.name === body.finish);
  const validCustomFinish = customFinishNames.includes(body.finish);

  if (
    (!catalogProduct && !isCustomMolecule) ||
    (catalogProduct && !finish) ||
    (isCustomMolecule && !validCustomFinish)
  ) {
    return NextResponse.json(
      { success: false, error: "Choose a valid Sora product or custom molecule finish." },
      { status: 400 },
    );
  }

  const orderProduct = catalogProduct
    ? { id: catalogProduct.id, name: catalogProduct.name, price: catalogProduct.price }
    : { id: body.productId, name: body.name, price: 340 };

  try {
    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);

      await sql`
        CREATE TABLE IF NOT EXISTS spatial_orders (
          id SERIAL PRIMARY KEY,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          finish TEXT NOT NULL,
          price NUMERIC NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const inserted = await sql`
        INSERT INTO spatial_orders (product_id, product_name, finish, price)
        VALUES (${orderProduct.id}, ${orderProduct.name}, ${body.finish}, ${orderProduct.price})
        RETURNING id, created_at
      `;

      return NextResponse.json({
        success: true,
        storage: "neon-postgres",
        order: inserted[0],
      });
    }

    const order: SpatialOrder = {
      id: nextMemoryOrderId++,
      product_id: orderProduct.id,
      product_name: orderProduct.name,
      finish: body.finish,
      price: orderProduct.price,
      created_at: new Date().toISOString(),
    };
    memoryOrders.push(order);

    return NextResponse.json({
      success: true,
      storage: "process-memory",
      order,
    });
  } catch (error) {
    console.error("Order persistence error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record spatial order." },
      { status: 500 },
    );
  }
}
