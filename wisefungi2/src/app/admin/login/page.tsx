'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-nature-100 to-nature-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-nature-200">
        <div className="p-10">
          <h2 className="text-3xl font-bold text-center text-nature-800 mb-8">Admin Login</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-nature-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-nature-200 focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@wisefungi.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nature-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-nature-200 focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-nature-600 hover:bg-nature-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-nature-600/20 transition-all hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
