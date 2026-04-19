"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Update if your file is named differently
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // If successful, push them straight into the Command Center
      router.push("/");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Image 
          src="/logo.png" 
          alt="Happy Oak Logo" 
          width={150} 
          height={150} 
          className="object-contain drop-shadow-md mb-4"
          priority
        />
        <h2 className="text-center text-3xl font-extrabold text-brand-brown">
          Happy Oak ERP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Authorized Personnel Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border-t-4 border-t-brand-blue sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-brand-brown">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-medium"
                  placeholder="admin@happyoakpainting.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-brown">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white ${isLoggingIn ? 'bg-gray-400' : 'bg-brand-blue hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all'}`}
              >
                {isLoggingIn ? "Authenticating..." : "Sign In to Command Center"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}