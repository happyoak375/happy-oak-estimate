import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { EstimateData, EstimateStatus } from "@/types/estimate";

const VALID_STATUSES: EstimateStatus[] = ["Draft", "Sent", "Approved", "Declined"];

/**
 * Ensures the status strictly conforms to the EstimateStatus type.
 * Acts as a fallback mechanism to prevent UI crashes from corrupted data.
 */
function normalizeStatus(status: unknown): EstimateStatus {
  if (typeof status !== "string") return "Draft";

  const match = VALID_STATUSES.find(
    (validStatus) => validStatus.toLowerCase() === status.toLowerCase(),
  );

  return match || "Draft";
}

/**
 * Core Database Service handling all Firestore CRUD operations for the ERP.
 * Note: Errors are intentionally left to bubble up so they can be caught and handled 
 * by the UI layer (e.g., showing a toast notification to the user).
 */
export const DatabaseService = {
  /**
   * Checks if a customer exists by name and creates a new record if they don't.
   * @param clientName - The full name of the client.
   * @returns The Firestore Document ID of the new or existing customer, or null if no name provided.
   */
  async saveCustomerIfNew(clientName: string) {
    if (!clientName) return null;

    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("name", "==", clientName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const docRef = await addDoc(customersRef, {
        name: clientName,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    }

    return querySnapshot.docs[0].id;
  },

  /**
   * Creates a new estimate/proposal in the database.
   * @param estimateData - The data payload for the new estimate.
   * @returns The newly generated Firestore Document ID.
   */
  async saveProposal(estimateData: EstimateData) {
    await this.saveCustomerIfNew(estimateData.clientName);

    // Prevent saving the local 'id' property into the Firestore document fields
    const { id: _, ...dataToSave } = estimateData;

    const proposalsRef = collection(db, "proposals");
    const docRef = await addDoc(proposalsRef, {
      ...dataToSave,
      status: normalizeStatus(estimateData.status),
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  /**
   * Retrieves all proposals, ordered by creation date (newest first).
   * @returns An array of EstimateData objects.
   */
  async getProposals(): Promise<EstimateData[]> {
    const proposalsRef = collection(db, "proposals");
    const q = query(proposalsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      status: normalizeStatus(doc.data().status),
    })) as EstimateData[];
  },

  /**
   * Fetches a single proposal by its unique Firestore ID.
   * @param id - The Firestore Document ID.
   * @returns The EstimateData object, or null if not found.
   */
  async getProposalById(id: string): Promise<EstimateData | null> {
    const docRef = doc(db, "proposals", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data, status: normalizeStatus(data.status) } as EstimateData;
    }
    return null;
  },

  /**
   * Updates an existing proposal with new data.
   * @param id - The Firestore Document ID of the proposal to update.
   * @param estimateData - The updated data payload.
   */
  async updateProposal(id: string, estimateData: EstimateData) {
    // Prevent saving the local 'id' property into the Firestore document fields
    const { id: _, ...dataToUpdate } = estimateData;
    const docRef = doc(db, "proposals", id);
    
    await updateDoc(docRef, {
      ...dataToUpdate,
      status: normalizeStatus(estimateData.status),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Permanently deletes a proposal from the database.
   * @param id - The Firestore Document ID.
   */
  async deleteProposal(id: string) {
    const docRef = doc(db, "proposals", id);
    await deleteDoc(docRef);
  },
};