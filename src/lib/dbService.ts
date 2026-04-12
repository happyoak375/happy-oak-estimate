import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
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
    // First, ensure the customer is saved
    await this.saveCustomerIfNew(estimateData.clientName);

    // Then, save the actual estimate
    const proposalsRef = collection(db, "proposals");
    const docRef = await addDoc(proposalsRef, {
      ...estimateData,
      status: "draft",
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },
};
