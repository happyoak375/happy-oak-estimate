import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

function getPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  return privateKey?.replace(/\\n/g, "\n");
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) return;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({
      credential: applicationDefault(),
    });
    return;
  }

  if (serviceAccountKey) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
    });
    return;
  }

  if (serviceAccountKeyBase64) {
    const decodedServiceAccountKey = Buffer.from(serviceAccountKeyBase64, "base64").toString("utf8");

    initializeApp({
      credential: cert(JSON.parse(decodedServiceAccountKey)),
    });
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured.");
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function requireAuthenticatedRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    return {
      user: null,
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  try {
    initializeFirebaseAdmin();
    const user = await getAuth().verifyIdToken(token);
    return { user, response: null };
  } catch (error) {
    console.error("Firebase token verification failed:", error);

    if (error instanceof Error && error.message === "Firebase Admin credentials are not configured.") {
      return {
        user: null,
        response: NextResponse.json(
          { error: "Firebase Admin credentials are not configured on the server" },
          { status: 500 },
        ),
      };
    }

    return {
      user: null,
      response: NextResponse.json({ error: "Invalid authentication token" }, { status: 401 }),
    };
  }
}
