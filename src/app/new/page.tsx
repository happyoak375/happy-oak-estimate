import Header from "@/components/layout/Header";
import EstimateForm from "@/components/estimate/EstimateForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="p-4 sm:p-8">
        <EstimateForm />
      </main>
    </div>
  );
}