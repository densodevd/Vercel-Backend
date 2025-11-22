// api/saveGoogleFormSubmission.js
import admin from "./_firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    const { clientId, ownerId, periodKey, type, answers, fileUrls, formId, token } = body;

    // basic validation
    if (!clientId || !ownerId || !periodKey || !answers) {
      return res.status(400).json({ error: "Missing required fields: clientId, ownerId, periodKey or answers" });
    }

    const db = admin.firestore();

    // choose subcollection
    const subcol = (type === "monthly") ? "monthlyForms" : "weeklyForms";

    // prepare doc
    const docData = {
      ownerId,
      clientId,
      periodKey,
      type: type || "weekly",
      answers,
      fileUrls: fileUrls || [],
      formId: formId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // save under clients/{clientId}/{subcol}/{autoId}
    const docRef = await db.collection("clients").doc(clientId).collection(subcol).add(docData);

    // If a token was provided, try to mark it used.
    if (token) {
      const linksRef = db.collection(`clients/${clientId}/links`);
      const q = await linksRef.where("token", "==", token).get();
      q.forEach(async (d) => {
        try {
          await d.ref.update({
            status: "used",
            usedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (e) {
          console.warn("Could not update token doc:", e);
        }
      });
    }

    return res.status(200).json({ ok: true, id: docRef.id });

  } catch (err) {
    console.error("saveGoogleFormSubmission error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
