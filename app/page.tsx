'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('ログインに失敗しました');
    } else {
      setLoggedIn(true);
      setIsTrainer(email.includes('trainer') || email.includes('art'));
    }
    setLoading(false);
  };

  if (loggedIn) {
    return (
      <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
        <div style={{background:'#0d1f3c',padding:'2rem 1.5rem',textAlign:'center'}}>
          <div style={{fontFamily:'serif',fontSize:'1.8rem',color:'white',marginBottom:'0.3rem'}}>
            Gym <span style={{color:'#b8975a',fontWeight:'700'}}>ART</span>
          </div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.8rem',letterSpacing:'0.2em'}}>CONDITIONING GYM</div>
        </div>
        <div style={{maxWidth:'400px',margin:'2rem auto',padding:'0 1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          <a href="/booking" style={{display:'block',background:'#b8975a',color:'white',padding:'1.2rem',borderRadius:'14px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'1rem'}}>
            📅 予約する
          </a>
          {isTrainer && (
            <a href="/trainer" style={{display:'block',background:'#0d1f3c',color:'white',padding:'1.2rem',borderRadius:'14px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'1rem'}}>
              🏋️ 管理画面
            </a>
          )}
          <button onClick={()=>{supabase.auth.signOut();setLoggedIn(false);}} style={{background:'none',border:'1px solid #d0d0d0',color:'#8a8a9a',padding:'0.8rem',borderRadius:'10px',cursor:'pointer',fontSize:'0.85rem'}}>
            ログアウト
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d1f3c'}}>
      <div style={{background:'rgba(255,255,255,0.05)',padding:'2.5rem',borderRadius:'20px',width:'100%',maxWidth:'360px',margin:'1rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontFamily:'serif',fontSize:'2rem',color:'white',marginBottom:'0.3rem'}}>
            Gym <span style={{color:'#b8975a',fontWeight:'700'}}>ART</span>
          </div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'0.72rem',letterSpacing:'0.25em'}}>MEMBER PORTAL</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.8rem'}}>
          <input type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)}
            style={{padding:'0.9rem 1rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.9rem',outline:'none'}}/>
          <input type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)}
            style={{padding:'0.9rem 1rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.9rem',outline:'none'}}/>
          <button onClick={handleLogin} disabled={loading}
            style={{padding:'0.9rem',borderRadius:'10px',border:'none',background:'#b8975a',color:'white',fontWeight:'700',fontSize:'0.95rem',cursor:'pointer',marginTop:'0.4rem'}}>
            {loading?'ログイン中...':'ログイン'}
          </button>
        </div>
        {message&&<p style={{marginTop:'1rem',textAlign:'center',color:'#e74c3c',fontSize:'0.82rem'}}>{message}</p>}
      </div>
    </main>
  );
}
