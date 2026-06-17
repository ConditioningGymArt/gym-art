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

  const serif = "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif";
  const sans = "var(--font-noto), 'Noto Sans JP', sans-serif";
  const gold = '#c9a96e';
  const navy = '#0d1f3c';

  if (loggedIn) {
    return (
      <main style={{minHeight:'100vh',background:navy,fontFamily:sans}}>
        <div style={{padding:'4rem 2rem 2.5rem',textAlign:'center'}}>
          <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',letterSpacing:'0.3em',textTransform:'uppercase',marginBottom:'0.6rem',fontFamily:sans}}>Conditioning Gym</div>
          <div style={{fontFamily:serif,fontSize:'3.5rem',color:gold,letterSpacing:'0.14em',lineHeight:'1',fontWeight:'300'}}>Art</div>
          <div style={{width:'24px',height:'1px',background:'rgba(201,169,110,0.3)',margin:'1.2rem auto 0'}}></div>
        </div>
        <div style={{maxWidth:'320px',margin:'0 auto',padding:'0 1.5rem 3rem',display:'flex',flexDirection:'column',gap:'0.7rem'}}>
          <a href="/booking" style={{display:'block',background:gold,color:navy,padding:'1rem',borderRadius:'10px',textAlign:'center',textDecoration:'none',fontWeight:'700',fontSize:'0.85rem',letterSpacing:'0.1em',fontFamily:sans}}>
            予約する
          </a>
          <a href="/mypage" style={{display:'block',background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.8)',padding:'1rem',borderRadius:'10px',textAlign:'center',textDecoration:'none',fontSize:'0.85rem',border:'1px solid rgba(255,255,255,0.1)',fontFamily:sans}}>
            マイページ
          </a>
          {isTrainer && (
            <a href="/trainer" style={{display:'block',background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.6)',padding:'1rem',borderRadius:'10px',textAlign:'center',textDecoration:'none',fontSize:'0.85rem',border:'1px solid rgba(255,255,255,0.08)',fontFamily:sans}}>
              管理画面
            </a>
          )}
          <button onClick={()=>{supabase.auth.signOut();setLoggedIn(false);}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',padding:'0.8rem',cursor:'pointer',fontSize:'0.75rem',marginTop:'0.8rem',fontFamily:sans}}>
            ログアウト
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:navy,padding:'2rem 1.5rem',fontFamily:sans}}>
      <div style={{width:'100%',maxWidth:'280px',display:'flex',flexDirection:'column',alignItems:'center',gap:'2.5rem'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.32)',letterSpacing:'0.3em',textTransform:'uppercase',marginBottom:'0.7rem',fontFamily:sans}}>Conditioning Gym</div>
          <div style={{fontFamily:serif,fontSize:'3.8rem',color:gold,letterSpacing:'0.16em',lineHeight:'1',fontWeight:'300'}}>Art</div>
          <div style={{width:'24px',height:'1px',background:'rgba(201,169,110,0.28)',margin:'1.3rem auto 0'}}></div>
        </div>
        <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{padding:'0.85rem 1rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'0.85rem',outline:'none',width:'100%',fontFamily:sans}}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            style={{padding:'0.85rem 1rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'0.85rem',outline:'none',width:'100%',fontFamily:sans}}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{padding:'0.9rem',borderRadius:'9px',border:'none',background:gold,color:navy,fontWeight:'700',fontSize:'0.85rem',cursor:'pointer',marginTop:'0.2rem',letterSpacing:'0.1em',width:'100%',fontFamily:sans}}
          >
            {loading?'ログイン中...':'ログイン'}
          </button>
        </div>
        {message&&<p style={{textAlign:'center',color:'#e74c3c',fontSize:'0.78rem',margin:'-1.5rem 0'}}>{message}</p>}
        <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:'0.75rem',width:'100%'}}>
          <p style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.25)',fontFamily:sans}}>
            はじめての方は
            <a href="/register" style={{color:gold,marginLeft:'0.4rem',textDecoration:'none'}}>新規会員登録</a>
          </p>
          <a href="/register" style={{display:'block',padding:'0.75rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.38)',fontSize:'0.75rem',textDecoration:'none',letterSpacing:'0.05em',fontFamily:sans}}>
            体験トレーニングを申し込む
          </a>
        </div>
      </div>
    </main>
  );
}
