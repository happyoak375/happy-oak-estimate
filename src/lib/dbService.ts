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
import { EstimateData } from "@/types/estimate";

export const DatabaseService = {
  // 1. Check if a customer exists, save them if they are new
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

  // 2. Save the proposal to the database
  async saveProposal(estimateData: EstimateData) {
    await this.saveCustomerIfNew(estimateData.clientName);

    const proposalsRef = collection(db, "proposals");
    const docRef = await addDoc(proposalsRef, {
      ...estimateData,
      status: "draft",
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  // 3. Get proposals ordered by newest first
  async getProposals() {
    const proposalsRef = collection(db, "proposals");
    const q = query(proposalsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // --- NEW: Fetch a single proposal by its ID ---
  async getProposalById(id: string) {
    const docRef = doc(db, "proposals", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  // --- NEW: Update an existing proposal ---
  async updateProposal(id: string, estimateData: EstimateData) {
    const docRef = doc(db, "proposals", id);
    await updateDoc(docRef, {
      ...estimateData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteProposal(id: string) {
    const docRef = doc(db, "proposals", id);
    await deleteDoc(docRef);
  },
};
