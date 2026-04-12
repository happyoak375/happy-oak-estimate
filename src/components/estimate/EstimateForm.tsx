"use client";

import { useState } from "react";
import { EstimateData } from "@/types/estimate";
import { DatabaseService } from "@/lib/dbService"; // <-- NEW: Importing our brain's connection to the cloud
import { PDFService } from "@/lib/pdfService";

export default function EstimateForm() {
  const [formData, setFormData] = useState<EstimateData>({
    estimateName: "",
    clientName: "",
    street: "",
    cityStateZip: "",
    area: "",
    tasks: "",
    exceptions: "",
    totalPrice: "",
  });

  // NEW: State to handle the "loading" experience
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // NEW: The function that talks to Firebase
  const handleSaveToCloud = async () => {
    // 1. Basic Validation
    if (!formData.clientName || !formData.totalPrice) {
      setStatusMessage({ text: "Client Name and Total Price are required.", type: "error" });
      return;
    }

    // 2. Start Loading
    setIsSaving(true);
    setStatusMessage({ text: "Saving to Happy Oak Database...", type: "info" });

    try {
      // 3. Send to Cloud
      const documentId = await DatabaseService.saveProposal(formData);
      
      // 4. Success!
      setStatusMessage({ text: `Success! Saved securely. (ID: ${documentId})`, type: "success" });
    } catch (error) {
      console.error("Firebase Error:", error);
      setStatusMessage({ text: "Failed to save. Check your connection or Firebase rules.", type: "error" });
    } finally {
      // 5. Stop Loading
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* --- Job Identity Card --- */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Job Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Estimate Name</label>
            <input 
              type="text" name="estimateName" value={formData.estimateName} onChange={handleChange}
              placeholder="e.g. Exterior Painting" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Client Name</label>
            <input 
              type="text" name="clientName" value={formData.clientName} onChange={handleChange}
              placeholder="John Doe" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <input 
              type="text" name="street" value={formData.street} onChange={handleChange}
              placeholder="123 Main St" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">City, State, ZIP</label>
            <input 
              type="text" name="cityStateZip" value={formData.cityStateZip} onChange={handleChange}
              placeholder="Medellín, ANT 050021" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
        </div>
      </section>

      {/* --- Scope & Pricing Card --- */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Scope of Work</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Areas of Work</label>
            <input 
              type="text" name="area" value={formData.area} onChange={handleChange}
              placeholder="e.g. Master Bedroom, Kitchen" 
              className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Tasks (One per line)</label>
            <textarea 
              rows={5} name="tasks" value={formData.tasks} onChange={handleChange}
              placeholder="- Prep walls&#10;- Apply 2 coats of paint" 
              className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500 resize-y" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Exceptions</label>
              <input 
                type="text" name="exceptions" value={formData.exceptions} onChange={handleChange}
                placeholder="e.g. Baseboards not included" 
                className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Total Price ($)</label>
              <input 
                type="number" name="totalPrice" value={formData.totalPrice} onChange={handleChange}
                placeholder="0.00" 
                className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500 text-right font-semibold" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Status Message --- */}
      {statusMessage && (
        <div className={`p-4 rounded-md text-sm font-medium ${
          statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : 
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 
          'bg-blue-50 text-blue-700'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* --- Action Buttons --- */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={handleSaveToCloud}
          disabled={isSaving}
          className={`px-5 py-2 text-white rounded-md font-medium transition-colors shadow-sm
            ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'}
          `}
        >
          {isSaving ? "Saving..." : "Save to Database"}
        </button>
        <button 
            type="button"
            onClick={() => PDFService.generateEstimatePDF(formData)}
            className="px-5 py-2 text-white bg-green-700 rounded-md font-medium hover:bg-green-800 transition-colors shadow-sm"
        >
            Generate PDF
        </button>
      </div>

    </div>
  );
}