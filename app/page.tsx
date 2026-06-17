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
        <div style={{background:'#0d1f3c',padding:'1.5rem',textAlign:'center',paddingTop:'3rem',paddingBottom:'2rem'}}>
          <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.45)',letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:'0.4rem'}}>Conditioning Gym</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'2.8rem',color:'#b8975a',fontWeight:'400',letterSpacing:'0.12em'}}>Art</div>
          <div style={{width:'40px',height:'1px',background:'rgba(184,151,90,0.4)',margin:'1rem auto 0'}}></div>
        </div>
        <div style={{maxWidth:'400px',margin:'2rem auto',padding:'0 1.5rem',display:'flex',flexDirection:'column',gap:'0.9rem'}}>
          <a href="/booking" style={{display:'block',background:'#b8975a',color:'white',padding:'1.2rem',borderRadius:'14px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.95rem',letterSpacing:'0.05em'}}>
            📅 予約する
          </a>
          <a href="/mypage" style={{display:'block',background:'white',color:'#0d1f3c',padding:'1.2rem',borderRadius:'14px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.95rem',border:'1px solid #e8e8e6',letterSpacing:'0.05em'}}>
            📋 マイページ
          </a>
          {isTrainer && (
            <a href="/trainer" style={{display:'block',background:'#0d1f3c',color:'white',padding:'1.2rem',borderRadius:'14px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.95rem',letterSpacing:'0.05em'}}>
              🏋️ 管理画面
            </a>
          )}
          <button onClick={()=>{supabase.auth.signOut();setLoggedIn(false);}} style={{background:'none',border:'1px solid #d8d8d5',color:'#8a8a9a',padding:'0.8rem',borderRadius:'10px',cursor:'pointer',fontSize:'0.82rem',marginTop:'0.5rem'}}>
            ログアウト
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d1f3c',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:'360px',display:'flex',flexDirection:'column',alignItems:'center',gap:'2.5rem'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.38)',letterSpacing:'0.28em',textTransform:'uppercase',marginBottom:'0.6rem'}}>Conditioning Gym</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'3.2rem',color:'#b8975a',fontWeight:'400',letterSpacing:'0.14em',lineHeight:'1'}}>Art</div>
          <div style={{width:'36px',height:'1px',background:'rgba(184,151,90,0.35)',margin:'1.2rem auto 0'}}></div>
        </div>
        <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'0.9rem'}}>
          <input type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)}
            style={{padding:'1rem 1.1rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.9rem',outline:'none',letterSpacing:'0.03em'}}/>
          <input type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)}
            style={{padding:'1rem 1.1rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.9rem',outline:'none'}}/>
          <button onClick={handleLogin} disabled={loading}
            style={{padding:'1rem',borderRadius:'10px',border:'none',background:'#b8975a',color:'#0d1f3c',fontWeight:'700',fontSize:'0.95rem',cursor:'pointer',marginTop:'0.3rem',letterSpacing:'0.1em'}}>
            {loading?'ログイン中...':'ログイン'}
          </button>
        </div>
        {message&&<p style={{textAlign:'center',color:'#e74c3c',fontSize:'0.82rem'}}>{message}</p>}
        <div style={{textAlign:'center'}}>
          <p style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.35)',marginBottom:'1rem'}}>
            はじめての方は
            <a href="/register" style={{color:'#b8975a',marginLeft:'0.4rem',textDecoration:'none'}}>新規会員登録</a>
          </p>
          <a href="/register" style={{display:'inline-block',padding:'0.8rem 1.8rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.6)',fontSize:'0.82rem',textDecoration:'none',letterSpacing:'0.05em'}}>
            体験トレーニングを申し込む
          </a>
        </div>
      </div>
    </main>
  );
}
