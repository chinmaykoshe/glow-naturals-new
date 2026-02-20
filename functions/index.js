import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

export const deleteUserAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const callerUid = request.auth.uid;
  const targetUid = request.data?.uid;

  if (!targetUid || typeof targetUid !== "string") {
    throw new HttpsError("invalid-argument", "A valid uid is required.");
  }

  if (callerUid === targetUid) {
    throw new HttpsError("failed-precondition", "Cannot delete your own account.");
  }

  const db = getFirestore();
  const callerDoc = await db.collection("users").doc(callerUid).get();
  const callerRole = callerDoc.exists ? callerDoc.data()?.role : null;

  if (callerRole !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can delete users.");
  }

  const auth = getAuth();

  try {
    await auth.deleteUser(targetUid);
  } catch (error) {
    // If Auth user is already missing, proceed with Firestore cleanup.
    if (error?.code !== "auth/user-not-found") {
      throw new HttpsError("internal", "Failed to delete auth user.");
    }
  }

  await db.collection("users").doc(targetUid).delete();

  return { success: true, uid: targetUid };
});
