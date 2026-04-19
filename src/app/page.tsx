"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { DatabaseService } from "@/lib/dbService";
import { PDFService } from "@/lib/pdfService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  // 1. ALL HOOKS GO AT THE VERY TOP
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 2. Security Bouncer: Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // 3. Data Loading Effect
  useEffect(() => {
    async function loadData() {
      // Don't try to load data if the user isn't logged in yet
      if (!user) return; 

      try {
        const data = await DatabaseService.getProposals();
        setProposals(data);
      } catch (error) {
        console.error("Error loading proposals:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // --- NEW MATH: Calculate Approved vs Sent ---
  const approvedTotal = proposals
    .filter(prop => prop.status === "Approved")
    .reduce((total, prop) => {
      const propTotal = prop.jobAreas?.reduce((sum: number, area: any) => sum + (Number(area.price) || 0), 0) || 0;
      return total + propTotal;
    }, 0);

  const sentTotal = proposals
    .filter(prop => prop.status === "Sent")
    .reduce((total, prop) => {
      const propTotal = prop.jobAreas?.reduce((sum: number, area: any) => sum + (Number(area.price) || 0), 0) || 0;
      return total + propTotal;
    }, 0);

  // --- Handle the safe deletion process ---
  const handleDelete = async (id: string, estimateName: string) => {
    const isConfirmed = window.confirm(`Are you sure you want to permanently delete "${estimateName}"? This cannot be undone.`);
    
    if (isConfirmed) {
      try {
        await DatabaseService.deleteProposal(id);
        setProposals(prevProposals => prevProposals.filter(prop => prop.id !== id));
      } catch (error) {
        console.error("Failed to delete:", error);
        alert("An error occurred while trying to delete the estimate.");
      }
    }
  };

  // Helper to color-code the status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-brand-green text-white"; 
      case "Sent":
        return "bg-brand-blue text-white shadow-sm"; 
      case "Declined":
        return "bg-gray-200 text-gray-500";
      case "Draft":
      default:
        return "bg-brand-yellow text-brand-brown bg-opacity-30"; 
    }
  };

  // 4. NOW WE CAN SAFELY DO EARLY RETURNS
  // While the bouncer is checking IDs, show a blank or loading screen
  if (authLoading || !user) {
    return <div className="min-h-screen bg-brand-canvas flex items-center justify-center text-brand-blue font-bold text-xl">Securing connection...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-canvas">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-brown">Command Center</h2>
            <p className="text-sm text-gray-600 mt-1">Manage Happy Oak estimates.</p>
          </div>
          <Link 
            href="/new" 
            className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-brand-blue text-white font-bold text-base sm:text-lg rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            New Estimate
          </Link>
        </div>

        {/* --- THE NEW 3-CARD LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Approved Revenue (Vine Green) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-brand-green">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Approved Revenue</h3>
            <p className="text-3xl font-bold text-brand-green">${approvedTotal.toFixed(2)}</p>
          </div>

          {/* Card 2: Pending Pipeline (Trusty Blue) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-brand-blue">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Pending Pipeline</h3>
            <p className="text-3xl font-bold text-brand-blue">${sentTotal.toFixed(2)}</p>
          </div>

          {/* Card 3: Total Volume (Acorn Amber) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-brand-amber">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Proposals</h3>
            <p className="text-3xl font-bold text-brand-brown">{proposals.length}</p>
          </div>

        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-brand-brown">Recent Estimates</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-brand-blue font-semibold">Loading pipeline data...</div>
          ) : proposals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No proposals found. Click "Create New Estimate" to get started!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500 bg-white">
                    <th className="px-6 py-4 font-semibold">Client / Project</th>
                    <th className="px-6 py-4 font-semibold">Address</th>
                    <th className="px-6 py-4 font-semibold">Total Value</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((prop) => {
                    const total = prop.jobAreas?.reduce((sum: number, area: any) => sum + (Number(area.price) || 0), 0) || 0;
                    return (
                      <tr key={prop.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-brand-brown">{prop.clientName || "Unknown Client"}</div>
                          <div className="text-sm text-gray-600">{prop.estimateName || "General Estimate"}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {prop.street ? `${prop.street}, ${prop.cityStateZip}` : "No address"}
                        </td>
                        <td className="px-6 py-4 font-bold text-brand-green">
                          ${total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusBadge(prop.status)}`}>
                            {prop.status || "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-3">
                            <button 
                              onClick={() => PDFService.generateEstimatePDF(prop)}
                              className="text-brand-blue hover:text-blue-800 font-bold text-sm transition-colors"
                            >
                              PDF
                            </button>
                            <span className="text-gray-300">|</span>
                            <Link 
                              href={`/edit/${prop.id}`}
                              className="text-gray-400 hover:text-brand-amber font-bold text-sm transition-colors"
                            >
                              Edit
                            </Link>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleDelete(prop.id, prop.clientName || "this estimate")}
                              className="text-red-400 hover:text-red-600 font-bold text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}