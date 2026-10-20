// HorairePro — service de paiement CinetPay et délivrance automatique des licences.
// Aucune dépendance : Node 18+ (fetch et WebCrypto intégrés).
// Variables d'environnement (à saisir dans Render → Environment) :
//   CINETPAY_APIKEY        clé API CinetPay
//   CINETPAY_SITE_ID       identifiant du site CinetPay
//   LICENCE_PRIVATE_JWK    contenu de la clé privée (objet "private" du fichier cle-admin-horairepro.json)
//   APP_URL                adresse de l'application (ex : https://horairepro.onrender.com/)
//   API_URL                adresse de ce service (ex : https://horairepro-api.onrender.com)
//   OFFRES                 (facultatif) JSON : [{"id":"petit","nom":"Petit établissement","max":12,"prix":30000},…]
"use strict";
const http = require("http");
const { webcrypto } = require("crypto");
const subtle = webcrypto.subtle;

const PORT = process.env.PORT || 10000;
const APP_URL = (process.env.APP_URL || "https://horairepro.onrender.com/").replace(/\/?$/, "/");
const API_URL = (process.env.API_URL || "https://horairepro-api.onrender.com").replace(/\/$/, "");
const APIKEY = process.env.CINETPAY_APIKEY || "";
const SITE_ID = process.env.CINETPAY_SITE_ID || "";
const OFFRES = (() => { try { return JSON.parse(process.env.OFFRES || ""); } catch (e) { return null; } })() || [
  { id: "petit", nom: "Petit établissement", max: 12, prix: 30000 },
  { id: "moyen", nom: "Établissement moyen", max: 25, prix: 50000 },
  { id: "grand", nom: "Grand établissement", max: 0, prix: 80000 }
];
const CP = process.env.CINETPAY_BASE || "https://api-checkout.cinetpay.com/v2";
const pending = new Map(); // tid -> { n, o, at } (cache ; la vérification repose sur CinetPay)

let KEY = null;
async function key() {
  if (KEY) return KEY;
  const raw = process.env.LICENCE_PRIVATE_JWK || "";
  let jwk = JSON.parse(raw);
  if (jwk.private) jwk = jwk.private; // accepte aussi le fichier complet
  const { kty, crv, x, y, d } = jwk;
  KEY = await subtle.importKey("jwk", { kty, crv, x, y, d }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  return KEY;
}
const b64u = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const today = () => new Date().toISOString().slice(0, 10);
function schoolYearEnd() { const d = new Date(); const y = d.getUTCMonth() >= 7 ? d.getUTCFullYear() + 1 : d.getUTCFullYear(); return y + "-08-31"; }
function offerFor(classes) { const n = +classes || 0; return OFFRES.find(o => !o.max || n <= o.max) || OFFRES[OFFRES.length - 1]; }
async function licence(nom, offre, tid) {
  const data = { v: 1, n: nom, e: schoolYearEnd(), i: today(), id: tid, t: "annuel", o: offre.nom, c: offre.max || 0, pay: "cinetpay" };
  const pay = new TextEncoder().encode(JSON.stringify(data));
  const sig = await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, await key(), pay);
  return "HP-" + b64u(pay) + "." + b64u(sig);
}
const clean = (s, n) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 .'-]/g, " ").replace(/\s+/g, " ").trim().slice(0, n || 60);

function send(res, code, obj, extra) {
  res.writeHead(code, Object.assign({ "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" }, extra || {}));
  res.end(obj === null ? "" : JSON.stringify(obj));
}
function body(req) {
  return new Promise((ok) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 1e5) req.destroy(); }); req.on("end", () => {
    const t = req.headers["content-type"] || "";
    try { if (t.includes("json")) return ok(JSON.parse(b || "{}")); } catch (e) { return ok({}); }
    ok(Object.fromEntries(new URLSearchParams(b)));
  }); });
}
async function check(tid) {
  const r = await fetch(CP + "/payment/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apikey: APIKEY, site_id: SITE_ID, transaction_id: tid }) });
  return r.json();
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (req.method === "OPTIONS") return send(res, 204, null);
    if (url.pathname === "/" || url.pathname === "/health") return send(res, 200, { ok: true, service: "HorairePro paiement", configured: !!(APIKEY && SITE_ID && process.env.LICENCE_PRIVATE_JWK) });
    if (url.pathname === "/offres") return send(res, 200, { offres: OFFRES });

    // 1. L'école lance le paiement
    if (url.pathname === "/pay/init" && req.method === "POST") {
      const b = await body(req);
      const nom = String(b.nom || "").trim().slice(0, 120);
      if (!nom) return send(res, 400, { error: "Nom de l'établissement manquant." });
      if (!APIKEY || !SITE_ID) return send(res, 503, { error: "Le paiement en ligne n'est pas encore configuré." });
      const offre = offerFor(b.classes);
      const amount = Math.ceil(offre.prix / 5) * 5;
      const tid = "HP" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase();
      pending.set(tid, { n: nom, o: offre.id, at: Date.now() });
      const meta = JSON.stringify({ n: nom, o: offre.id });
      const r = await fetch(CP + "/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        apikey: APIKEY, site_id: SITE_ID, transaction_id: tid, amount, currency: "XOF",
        description: clean("Licence HorairePro " + offre.nom, 80), channels: "ALL", lang: "FR", metadata: meta,
        notify_url: API_URL + "/pay/notify", return_url: API_URL + "/pay/return?tid=" + tid,
        customer_id: tid, customer_name: clean(nom, 40) || "Etablissement", customer_surname: "HorairePro", customer_email: "client@horairepro.ci",
        customer_phone_number: String(b.tel || "").replace(/\D/g, "").slice(-10) || "0700000000", customer_address: "Cote d'Ivoire", customer_city: clean(b.ville, 30) || "Abidjan",
        customer_country: "CI", customer_state: "CI", customer_zip_code: "00225"
      }) });
      const j = await r.json();
      if (!j.data || !j.data.payment_url) return send(res, 502, { error: "CinetPay a refusé la demande : " + (j.description || j.message || "erreur inconnue") });
      return send(res, 200, { tid, payment_url: j.data.payment_url, amount, offre });
    }

    // 2. CinetPay revient vers l'appli après le paiement (GET ou POST)
    if (url.pathname === "/pay/return") {
      let tid = url.searchParams.get("tid");
      if (!tid && req.method === "POST") { const b = await body(req); tid = b.transaction_id || b.cpm_trans_id; }
      res.writeHead(303, { Location: APP_URL + "?paiement=" + encodeURIComponent(tid || "") });
      return res.end();
    }

    // 3. Notification de CinetPay (serveur à serveur)
    if (url.pathname === "/pay/notify") { await body(req); return send(res, 200, { ok: true }); }

    // 4. L'appli demande le résultat : si payé, la licence signée est renvoyée
    if (url.pathname === "/pay/status") {
      const tid = url.searchParams.get("tid") || "";
      if (!/^HP[A-Z0-9]{6,30}$/.test(tid)) return send(res, 400, { error: "Référence de paiement invalide." });
      const j = await check(tid);
      const d = j.data || {};
      const status = d.status || (j.code === "00" ? "ACCEPTED" : j.message || "PENDING");
      if (status !== "ACCEPTED") return send(res, 200, { status, message: j.message || "" });
      let meta = {}; try { meta = typeof d.metadata === "string" ? JSON.parse(d.metadata) : (d.metadata || {}); } catch (e) {}
      const cache = pending.get(tid) || {};
      const nom = meta.n || cache.n;
      const offre = OFFRES.find(o => o.id === (meta.o || cache.o)) || offerFor(0);
      if (!nom) return send(res, 409, { error: "Paiement reçu mais nom de l'établissement introuvable. Contactez HorairePro avec la référence " + tid + "." });
      if (+d.amount && +d.amount < offre.prix) return send(res, 402, { error: "Montant payé insuffisant pour l'offre choisie." });
      const code = await licence(nom, offre, tid);
      return send(res, 200, { status: "ACCEPTED", code, offre: offre.nom, fin: schoolYearEnd(), tid });
    }

    send(res, 404, { error: "Introuvable" });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: "Erreur du service de paiement. Réessayez dans un instant." });
  }
}).listen(PORT, () => console.log("HorairePro paiement sur le port " + PORT));
