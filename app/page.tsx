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
        <div style={{background:'#0d1f3c',padding:'2.5rem 1.5rem 2rem',textAlign:'center'}}>
          <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.38)',letterSpacing:'0.28em',textTransform:'uppercase',marginBottom:'0.5rem'}}>Conditioning Gym</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'2.2rem',color:'#b8975a',letterSpacing:'0.12em'}}>Art</div>
        </div>
        <div style={{maxWidth:'360px',margin:'1.8rem auto',padding:'0 1.2rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          <a href="/booking" style={{display:'block',background:'#b8975a',color:'#0d1f3c',padding:'1rem',borderRadius:'12px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.88rem',letterSpacing:'0.08em'}}>
            📅 予約する
          </a>
          <a href="/mypage" style={{display:'block',background:'white',color:'#0d1f3c',padding:'1rem',borderRadius:'12px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.88rem',border:'1px solid #e8e8e6'}}>
            📋 マイページ
          </a>
          {isTrainer && (
            <a href="/trainer" style={{display:'block',background:'#0d1f3c',color:'white',padding:'1rem',borderRadius:'12px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.88rem'}}>
              🏋️ 管理画面
            </a>
          )}
          <button onClick={()=>{supabase.auth.signOut();setLoggedIn(false);}} style={{background:'none',border:'1px solid #d8d8d5',color:'#8a8a9a',padding:'0.75rem',borderRadius:'10px',cursor:'pointer',fontSize:'0.78rem',marginTop:'0.3rem'}}>
            ログアウト
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0d1f3c',padding:'2rem 1.5rem'}}>
      <div style={{width:'100%',maxWidth:'320px',display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{textAlign:'center',marginBottom:'2.8rem'}}>
          <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.35)',letterSpacing:'0.28em',textTransform:'uppercase',marginBottom:'0.5rem'}}>Conditioning Gym</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'2.8rem',color:'#b8975a',letterSpacing:'0.14em',lineHeight:'1'}}>Art</div>
          <div style={{width:'32px',height:'1px',background:'rgba(184,151,90,0.3)',margin:'1rem auto 0'}}></div>
        </div>
        <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          <input type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)}
            style={{padding:'0.85rem 1rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.85rem',outline:'none'}}/>
          <input type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)}
            style={{padding:'0.85rem 1rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.85rem',outline:'none'}}/>
          <button onClick={handleLogin} disabled={loading}
            style={{padding:'0.9rem',borderRadius:'9px',border:'none',background:'#b8975a',color:'#0d1f3c',fontWeight:'700',fontSize:'0.88rem',cursor:'pointer',marginTop:'0.2rem',letterSpacing:'0.1em'}}>
            {loading?'ログイン中...':'ログイン'}
          </button>
        </div>
        {message&&<p style={{marginTop:'0.9rem',textAlign:'center',color:'#e74c3c',fontSize:'0.78rem'}}>{message}</p>}
        <div style={{marginTop:'2rem',textAlign:'center',display:'flex',flexDirection:'column',gap:'0.9rem',width:'100%'}}>
          <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.3)'}}>
            はじめての方は
            <a href="/register" style={{color:'#b8975a',marginLeft:'0.4rem',textDecoration:'none'}}>新規会員登録</a>
          </p>
          <a href="/register" style={{display:'block',padding:'0.75rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.5)',fontSize:'0.78rem',textDecoration:'none',letterSpacing:'0.04em'}}>
            体験トレーニングを申し込む
          </a>
        </div>
      </div>
    </main>
  );
}
