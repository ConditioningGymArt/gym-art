'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('ログインに失敗しました: ' + error.message);
    } else {
      setMessage('ログイン成功！');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Gym ART</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">コンディショニングジム</p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
        {message && (
          <p className="mt-4 text-center text-sm text-yellow-400">{message}</p>
        )}
      </div>
    </main>
  );
}
