"use client";

import { useState, useEffect } from "react";
import { EstimateData, JobArea } from "@/types/estimate";
import { DatabaseService } from "@/lib/dbService";
import { PDFService } from "@/lib/pdfService";

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function EstimateForm({ estimateId }: { estimateId?: string }) {
  const [formData, setFormData] = useState<EstimateData>({
    estimateName: "",
    clientName: "",
    clientEmail: "", // Required for Resend
    street: "",
    cityStateZip: "",
    showLineItemPrices: true,
    status: "Draft",
    jobAreas: [{ id: generateId(), areaName: "", tasks: "", exceptions: "", price: "" }],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(!!estimateId);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);

  // Fetch data if we are in Edit Mode
  useEffect(() => {
    async function loadEstimate() {
      if (!estimateId) return;
      try {
        const data = await DatabaseService.getProposalById(estimateId);
        if (data) {
          const loadedData = data as EstimateData;
          if (!loadedData.jobAreas || loadedData.jobAreas.length === 0) {
            loadedData.jobAreas = [{ id: generateId(), areaName: "", tasks: "", exceptions: "", price: "" }];
          }
          if (loadedData.showLineItemPrices === undefined) {
            loadedData.showLineItemPrices = true;
          }
          setFormData(loadedData);
        }
      } catch (error) {
        console.error("Failed to load estimate:", error);
        setStatusMessage({ text: "Failed to load estimate data.", type: "error" });
      } finally {
        setIsLoading(false);
      }
    }
    loadEstimate();
  }, [estimateId]);

  const handleTopLevelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobAreaChange = (id: string, field: keyof JobArea, value: string) => {
    setFormData((prev) => ({
      ...prev,
      jobAreas: prev.jobAreas.map((area) =>
        area.id === id ? { ...area, [field]: value } : area
      )
    }));
  };

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

  const grandTotal = formData.jobAreas.reduce((total, area) => {
    const areaPrice = Number(area.price) || 0;
    return total + areaPrice;
  }, 0);

  // Save OR Update depending on mode
  const handleSaveToCloud = async () => {
    if (!formData.clientName) {
      setStatusMessage({ text: "Client Name is required.", type: "error" });
      return;
    }
    setIsSaving(true);
    setStatusMessage({ text: estimateId ? "Updating Database..." : "Saving to Database...", type: "info" });

    try {
      if (estimateId) {
        await DatabaseService.updateProposal(estimateId, formData);
        setStatusMessage({ text: "Success! Estimate updated.", type: "success" });
      } else {
        await DatabaseService.saveProposal(formData);
        setStatusMessage({ text: `Success! Saved securely.`, type: "success" });
      }
    } catch (error) {
      console.error("Firebase Error:", error);
      setStatusMessage({ text: "Failed to save to database.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Generate PDF and Send via Resend
  const handleSendEmail = async () => {
    if (!formData.clientEmail) {
      setStatusMessage({ text: "Client Email is required to send the proposal.", type: "error" });
      return;
    }
    setIsSending(true);
    setStatusMessage({ text: "Generating PDF and sending email...", type: "info" });

    try {
      const pdfBase64 = await PDFService.generateEstimatePDFBase64(formData);

      const response = await fetch('/api/send-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.clientEmail,
          clientName: formData.clientName,
          estimateName: formData.estimateName || "Project Estimate",
          pdfBase64: pdfBase64,
        }),
      });

      if (!response.ok) throw new Error("Failed to send");

      setFormData(prev => ({ ...prev, status: "Sent" }));
      setStatusMessage({ text: "Success! Email sent to client.", type: "success" });
    } catch (error) {
      console.error(error);
      setStatusMessage({ text: "Failed to send email. Check console.", type: "error" });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto py-20 text-center text-brand-blue font-bold text-xl">Loading Estimate Data...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-brand-brown">
        <h2 className="text-lg font-semibold text-brand-brown mb-4">Project Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Estimate Name</label>
            <input type="text" name="estimateName" value={formData.estimateName} onChange={handleTopLevelChange} placeholder="e.g. Interior Paint" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Client Name</label>
            <input type="text" name="clientName" value={formData.clientName} onChange={handleTopLevelChange} placeholder="John Doe" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue outline-none" />
          </div>
          {/* --- THE MISSING EMAIL FIELD --- */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Client Email</label>
            <input type="email" name="clientEmail" value={formData.clientEmail || ""} onChange={handleTopLevelChange} placeholder="client@email.com" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Proposal Status</label>
            <select
              name="status"
              value={formData.status || "Draft"}
              onChange={handleTopLevelChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue outline-none bg-white font-semibold text-brand-brown"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent to Client</option>
              <option value="Approved">Approved (Won)</option>
              <option value="Declined">Declined (Lost)</option>
            </select>
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm font-medium text-gray-700">Street Address</label>
            <input type="text" name="street" value={formData.street} onChange={handleTopLevelChange} placeholder="123 Main St" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue outline-none" />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm font-medium text-gray-700">City, State, ZIP</label>
            <input type="text" name="cityStateZip" value={formData.cityStateZip} onChange={handleTopLevelChange} placeholder="Bernardsville, NJ 07924" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue outline-none" />
          </div>
        </div>
      </section>

      {formData.jobAreas.map((area, index) => (
        <section key={area.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-brand-brown">
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
              <input type="text" value={area.areaName} onChange={(e) => handleJobAreaChange(area.id, 'areaName', e.target.value)} placeholder="e.g. Master Bedroom" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-brand-blue font-semibold" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tasks (One per line)</label>
              <textarea rows={4} value={area.tasks} onChange={(e) => handleJobAreaChange(area.id, 'tasks', e.target.value)} placeholder="- Prep walls&#10;- Apply 2 coats of paint" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-brand-blue resize-y" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Exceptions</label>
                <input type="text" value={area.exceptions} onChange={(e) => handleJobAreaChange(area.id, 'exceptions', e.target.value)} placeholder="e.g. Baseboards not included" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-brand-blue" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Price for this Area ($)</label>
                <input type="number" value={area.price} onChange={(e) => handleJobAreaChange(area.id, 'price', e.target.value)} placeholder="0.00" className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-brand-blue text-right font-bold text-brand-blue bg-blue-50" />
              </div>
            </div>
          </div>
        </section>
      ))}

      <button
        onClick={addJobArea}
        className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-xl hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50 transition-all"
      >
        + Add Another Job Area
      </button>

      <div className="bg-brand-brown text-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white border-opacity-20 pb-4">
          <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={formData.showLineItemPrices}
              onChange={(e) => setFormData(prev => ({ ...prev, showLineItemPrices: e.target.checked }))}
              className="w-4 h-4 rounded text-brand-blue accent-brand-blue cursor-pointer"
            />
            Show individual area prices on PDF
          </label>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-xl">
            <span className="text-gray-300 mr-2">Grand Total:</span>
            <span className="font-bold text-brand-green bg-white px-3 py-1 rounded-md shadow-sm">${grandTotal.toFixed(2)}</span>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
            <button onClick={handleSaveToCloud} disabled={isSaving} className={`px-4 py-2 rounded-md font-bold transition-colors shadow-sm ${isSaving ? 'bg-gray-500' : 'bg-brand-amber hover:bg-opacity-90 text-white'}`}>
              {isSaving ? (estimateId ? "Updating..." : "Saving...") : (estimateId ? "Update" : "Save")}
            </button>
            <button
              onClick={() => PDFService.generateEstimatePDF(formData)}
              className="px-4 py-2 bg-gray-600 hover:bg-opacity-90 text-white rounded-md font-bold transition-colors shadow-sm"
            >
              View PDF
            </button>
            {/* --- THE SEND BUTTON --- */}
            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className={`px-4 py-2 rounded-md font-bold transition-colors shadow-sm ${isSending ? 'bg-gray-400 text-white' : 'bg-brand-blue hover:bg-opacity-90 text-white'}`}
            >
              {isSending ? "Sending..." : "📧 Send to Client"}
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-md text-sm font-medium ${statusMessage.type === 'error' ? 'bg-red-50 text-red-700' : statusMessage.type === 'success' ? 'bg-green-50 text-brand-green' : 'bg-blue-50 text-brand-blue'}`}>
          {statusMessage.text}
        </div>
      )}
    </div>
  );
}