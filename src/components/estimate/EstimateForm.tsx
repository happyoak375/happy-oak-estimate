"use client";

import { useState } from "react";
import { EstimateData, JobArea } from "@/types/estimate";
import { DatabaseService } from "@/lib/dbService";
import { PDFService } from "@/lib/pdfService";

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function EstimateForm() {
const [formData, setFormData] = useState<EstimateData>({
    estimateName: "",
    clientName: "",
    street: "",
    cityStateZip: "",
    showLineItemPrices: true,
    jobAreas: [
      { id: generateId(), areaName: "", tasks: "", exceptions: "", price: "" }
    ],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);

  // 1. Handle Top-Level Fields (Client Name, Street, etc.)
  const handleTopLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Handle Job Area Fields
  const handleJobAreaChange = (id: string, field: keyof JobArea, value: string) => {
    setFormData((prev) => ({
      ...prev,
      jobAreas: prev.jobAreas.map((area) => 
        area.id === id ? { ...area, [field]: value } : area
      )
    }));
  };

  // 3. Add / Remove Job Areas
  const addJobArea = () => {
    setFormData((prev) => ({
      ...prev,
      jobAreas: [...prev.jobAreas, { id: generateId(), areaName: "", tasks: "", exceptions: "", price: "" }]
    }));
  };

  const removeJobArea = (idToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      jobAreas: prev.jobAreas.filter(area => area.id !== idToRemove)
    }));
  };

  // 4. Calculate Grand Total dynamically
  const grandTotal = formData.jobAreas.reduce((total, area) => {
    const areaPrice = Number(area.price) || 0;
    return total + areaPrice;
  }, 0);

  const handleSaveToCloud = async () => {
    if (!formData.clientName) {
      setStatusMessage({ text: "Client Name is required.", type: "error" });
      return;
    }
    setIsSaving(true);
    setStatusMessage({ text: "Saving to Happy Oak Database...", type: "info" });

    try {
      const documentId = await DatabaseService.saveProposal(formData);
      setStatusMessage({ text: `Success! Saved securely. (ID: ${documentId})`, type: "success" });
    } catch (error) {
      console.error("Firebase Error:", error);
      setStatusMessage({ text: "Failed to save. Check your connection or Firebase rules.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* --- Job Identity Card --- */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-green-800">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Estimate Name</label>
            <input type="text" name="estimateName" value={formData.estimateName} onChange={handleTopLevelChange} placeholder="e.g. Interior & Exterior Paint" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Client Name</label>
            <input type="text" name="clientName" value={formData.clientName} onChange={handleTopLevelChange} placeholder="John Doe" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <input type="text" name="street" value={formData.street} onChange={handleTopLevelChange} placeholder="123 Main St" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">City, State, ZIP</label>
            <input type="text" name="cityStateZip" value={formData.cityStateZip} onChange={handleTopLevelChange} placeholder="Medellín, ANT 050021" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
      </section>

      {/* --- Dynamic Job Areas --- */}
      {formData.jobAreas.map((area, index) => (
        <section key={area.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-green-800">
              Job Area {index + 1}
            </h2>
            {formData.jobAreas.length > 1 && (
              <button onClick={() => removeJobArea(area.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors">
                ✕ Remove Area
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Area Name</label>
              <input type="text" value={area.areaName} onChange={(e) => handleJobAreaChange(area.id, 'areaName', e.target.value)} placeholder="e.g. Master Bedroom" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500 font-semibold" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tasks (One per line)</label>
              <textarea rows={4} value={area.tasks} onChange={(e) => handleJobAreaChange(area.id, 'tasks', e.target.value)} placeholder="- Prep walls&#10;- Apply 2 coats of paint" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500 resize-y" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Exceptions</label>
                <input type="text" value={area.exceptions} onChange={(e) => handleJobAreaChange(area.id, 'exceptions', e.target.value)} placeholder="e.g. Baseboards not included" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Price for this Area ($)</label>
                <input type="number" value={area.price} onChange={(e) => handleJobAreaChange(area.id, 'price', e.target.value)} placeholder="0.00" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-green-500 text-right font-bold text-green-900 bg-green-50" />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* --- Add Area Button --- */}
      <button 
        onClick={addJobArea}
        className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-xl hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-all"
      >
        + Add Another Job Area
      </button>

      {/* --- Grand Total & Actions --- */}
      {/* --- Grand Total & Actions --- */}
      <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
        
        {/* NEW: Options Bar */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
            <input 
              type="checkbox" 
              checked={formData.showLineItemPrices} 
              onChange={(e) => setFormData(prev => ({ ...prev, showLineItemPrices: e.target.checked }))}
              className="w-4 h-4 rounded text-green-500 accent-green-500 cursor-pointer"
            />
            Show individual area prices on PDF
          </label>
        </div>

        {/* Totals and Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xl">
            <span className="text-gray-400 mr-2">Grand Total:</span> 
            <span className="font-bold text-green-400">${grandTotal.toFixed(2)}</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleSaveToCloud} disabled={isSaving} className={`px-6 py-2 rounded-md font-bold transition-colors w-full sm:w-auto ${isSaving ? 'bg-gray-600 text-gray-400' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
              {isSaving ? "Saving..." : "Save to Database"}
            </button>
            <button 
              onClick={() => PDFService.generateEstimatePDF(formData)} 
              className="px-6 py-2 bg-green-500 hover:bg-green-400 text-gray-900 rounded-md font-bold transition-colors shadow-sm w-full sm:w-auto"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </div>
      
      {statusMessage && (
        <div className={`p-4 rounded-md text-sm font-medium ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          {statusMessage.text}
        </div>
      )}

    </div>
  );
}