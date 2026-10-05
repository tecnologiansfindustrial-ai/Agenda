// Roda no GitHub Actions a cada 10 min: procura lembretes vencidos e manda push para os aparelhos do usuário.
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("Falta o secret FIREBASE_SERVICE_ACCOUNT no GitHub.");
  process.exit(1);
}
initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();
const fcm = getMessaging();
const APP_URL = process.env.APP_URL || "";
const now = Date.now();

const due = await db.collectionGroup("entries").where("alarmDue", "<=", now).get();
console.log(`Lembretes vencidos: ${due.size}`);

const tokensCache = new Map();
async function tokensOf(uid) {
  if (!tokensCache.has(uid)) {
    const s = await db.collection(`users/${uid}/tokens`).get();
    tokensCache.set(uid, s.docs.map(d => ({ ref: d.ref, token: d.data().token })));
  }
  return tokensCache.get(uid);
}

let enviados = 0;
for (const doc of due.docs) {
  const e = doc.data();
  const uid = doc.ref.parent.parent.id;
  const toks = await tokensOf(uid);
  if (toks.length) {
    const [dia, hora] = String(e.alarm?.at || "").split("T");
    const quando = dia ? `${dia.split("-").reverse().join("/")} às ${hora}` : "";
    const notification = {
      title: `Lembrete: ${e.title || "anotação"}`,
      body: [quando, (e.note || "").slice(0, 120)].filter(Boolean).join(" · "),
      tag: doc.id,
      requireInteraction: true
    };
    const webpush = { notification };
    if (APP_URL) {
      notification.icon = `${APP_URL.replace(/\/$/, "")}/icons/icon-192.png`;
      webpush.fcmOptions = { link: APP_URL };
    }
    const res = await fcm.sendEachForMulticast({ tokens: toks.map(t => t.token), webpush, data: { entryId: doc.id } });
    enviados += res.successCount;
    // remove aparelhos que não existem mais (app desinstalado, permissão revogada)
    res.responses.forEach((r, i) => {
      const code = r.error?.code || "";
      if (code.includes("registration-token-not-registered") || code.includes("invalid-registration-token") || code.includes("invalid-argument")) {
        toks[i].ref.delete().catch(() => {});
      }
    });
  }
  await doc.ref.update({ alarmDue: FieldValue.delete(), "alarm.pushedAt": now });
}
console.log(`Notificações entregues: ${enviados}`);
process.exit(0);
