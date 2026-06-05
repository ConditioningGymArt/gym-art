'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
      setMessage('ログインに失敗しました');
    } else {
      setMessage('ログイン成功！');
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <main style={{minHeight:'100vh',background:'#0d1f3c',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{textAlign:'center',color:'white',width:'100%',maxWidth:'400px',padding:'2rem'}}>
        <h1 style={{fontSize:'2.5rem',fontWeight:'300',letterSpacing:'0.1em',marginBottom:'0.5rem'}}>
          Gym <span style={{color:'#b8975a',fontWeight:'600'}}>ART</span>
        </h1>
        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.75rem',letterSpacing:'0.3em',marginBottom:'3rem'}}>MEMBER PORTAL</p>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <input type='email' placeholder='email address' value={email} onChange={e=>setEmail(e.target.value)}
            style={{padding:'1rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:'1rem',outline:'none'}}/>
          <input type='password' placeholder='password' value={password} onChange={e=>setPassword(e.target.value)}
            style={{padding:'1rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:'1rem',outline:'none'}}/>
          {message && <p style={{color:message.includes('成功')?'#3a9e6f':'#c0392b',fontSize:'0.85rem'}}>{message}</p>}
          <button onClick={handleLogin} disabled={loading}
            style={{padding:'1rem',borderRadius:'8px',border:'none',background:'#b8975a',color:'#0d1f3c',fontSize:'1rem',fontWeight:'700',cursor:'pointer',letterSpacing:'0.1em',marginTop:'0.5rem',opacity:loading?0.7:1}}>
            {loading ? 'ログイン中...' : 'LOGIN'}
          </button>
        </div>
      </div>
    </main>
  );
}