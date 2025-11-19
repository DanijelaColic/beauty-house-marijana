// src/components/auth/LoginForm.tsx
import React from "react";

export default function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Force console output - sometimes console.log is filtered
    console.log('🔐 Starting login for:', email);
    console.info('🔐 Starting login for:', email);
    console.warn('🔐 Starting login for:', email);
    
    // Also try alert for debugging (remove later)
    if (import.meta.env.DEV) {
      console.log('=== LOGIN START ===', { email, timestamp: new Date().toISOString() });
    }
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login response status:', res.status, res.statusText);
      console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));
      console.log('📡 Response URL:', res.url);
      console.log('📡 Response type:', res.type);
      console.log('📡 Response ok:', res.ok);

      // Parse response as JSON
      let result;
      try {
        result = await res.json();
        console.log('📦 Login response data:', result);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        const text = await res.text().catch(() => 'Unknown error');
        console.error('❌ Raw response text:', text);
        setError('Greška pri parsiranju odgovora servera');
        return;
      }

      if (!res.ok) {
        console.error('❌ Login failed:', {
          status: res.status,
          statusText: res.statusText,
          error: result.error,
          details: result.details,
          fullResult: result,
        });
        setError(result.error || result.message || `Login error ${res.status}`);
        return;
      }

      console.log('✅ Response OK, checking result.success...', result);
      
      if (result.success) {
        console.log('✅ Login successful! Result:', result);
        console.log('🔄 Redirecting to /admin...');
        
        // Small delay to ensure cookies are set
        setTimeout(() => {
          console.log('🔄 Executing redirect now...');
          window.location.href = "/admin";
        }, 100);
      } else {
        console.error('❌ Login not successful - result.success is false:', result);
        setError(result.error || "Neočekivana greška pri prijavi");
      }
    } catch (err: any) {
      console.error('💥 Login exception:', err);
      setError(err?.message ?? "Neočekivana greška pri prijavi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Prijava za osoblje
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Beauty House Marijana - Admin Panel
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email adresa
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email adresa"
              autoComplete="email"
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Lozinka
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Lozinka"
              autoComplete="current-password"
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
              required
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Greška pri prijavi
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Prijavljujem...
              </>
            ) : (
              "Prijavi se"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
