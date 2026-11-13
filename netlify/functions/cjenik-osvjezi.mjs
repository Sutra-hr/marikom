// Ručno pokretanje sinkronizacije (npr. odmah nakon objave ili nakon greške).
// POST /cjenici/osvjezi s "Authorization: Bearer <MARIKOMERC_CJENIK_ADMIN_TOKEN>".
import { pokreni } from "../lib/pokreni.mjs";

export const config = {
  method: ["POST"],
  path: "/cjenici/osvjezi",
};

export default async function handler(request) {
  const token = String(process.env.MARIKOMERC_CJENIK_ADMIN_TOKEN || "");
  const auth = request.headers.get("authorization") || "";
  if (!token || auth !== `Bearer ${token}`) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const rezultat = await pokreni();
  return Response.json(rezultat, { status: rezultat.ok ? 200 : 500 });
}
