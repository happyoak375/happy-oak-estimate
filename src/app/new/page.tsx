import RequireAuth from "@/components/auth/RequireAuth";
import Header from "@/components/layout/Header";
import EstimateForm from "@/components/estimate/EstimateForm";

/**
 * Estimate Creation Page.
 * Protected route for drafting new proposals. 
 * Remains a Server Component while `<RequireAuth>` handles client-side session validation.
 */
export default function Home() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <main className="p-4 sm:p-8">
          <EstimateForm />
        </main>
      </div>
    </RequireAuth>
  );
}