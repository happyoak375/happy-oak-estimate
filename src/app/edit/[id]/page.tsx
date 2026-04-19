"use client";

import Header from "@/components/layout/Header";
import EstimateForm from "@/components/estimate/EstimateForm";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditEstimatePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-brand-canvas">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="text-brand-blue hover:underline font-semibold flex items-center gap-1">
            ← Back to Command Center
          </Link>
        </div>
        
        {/* We pass the ID from the URL right into the form! */}
        <EstimateForm estimateId={id} />
      </main>
    </div>
  );
}