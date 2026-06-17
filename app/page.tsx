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
      <main style={{minHeight:'100vh',background:'#f2f2f0',fontFamily:sans}}>
        <div style={{background:navy,padding:'1.2rem 1.5rem 1.5rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.2rem'}}>
            <div style={{fontSize:'0.55rem',color:'rgba(255,255,255,0.35)',letterSpacing:'0.2em',textTransform:'uppercase',fontFamily:sans}}>Conditioning Gym</div>
            <div style={{fontFamily:serif,fontSize:'1.4rem',color:gold,letterSpacing:'0.14em',fontWeight:'600',fontStyle:'italic'}}>Art</div>
            <button onClick={()=>{supabase.auth.signOut();setLoggedIn(false);}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.28)',cursor:'pointer',fontSize:'0.7rem',fontFamily:sans}}>ログアウト</button>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'14px',padding:'1.2rem'}}>
            <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.38)',letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:'0.3rem',fontFamily:sans}}>Welcome back</div>
            <div style={{fontFamily:serif,fontSize:'1.6rem',color:'white',fontWeight:'300',marginBottom:'0.8rem'}}>会員 <span style={{color:gold}}>様</span></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem'}}>
              {[{n:'—',l:'通算回数'},{n:'—',l:'今月残り'},{n:'—',l:'継続日数'}].map(s=>(
                <div key={s.l} style={{textAlign:'center'}}>
                  <div style={{fontFamily:serif,fontSize:'1.6rem',color:gold,fontWeight:'600',lineHeight:'1'}}>{s.n}</div>
                  <div style={{fontSize:'0.55rem',color:'rgba(255,255,255,0.38)',marginTop:'0.2rem',letterSpacing:'0.06em',fontFamily:sans}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:'1rem 1.2rem',display:'flex',flexDirection:'column',gap:'0.8rem'}}>
          <div style={{background:'white',borderRadius:'14px',padding:'1.1rem',display:'flex',alignItems:'center',gap:'1rem',boxShadow:'0 2px 12px rgba(13,31,60,0.06)'}}>
            <div style={{width:'48px',height:'48px',background:navy,borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <div style={{fontSize:'0.48rem',color:gold,letterSpacing:'0.08em',textTransform:'uppercase',fontFamily:sans}}>NEXT</div>
              <div style={{fontFamily:serif,fontSize:'1.3rem',color:'white',fontWeight:'600',lineHeight:'1'}}>—</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.82rem',fontWeight:'700',color:navy,fontFamily:sans}}>次回セッション</div>
              <div style={{fontSize:'0.7rem',color:'#8a8a9a',marginTop:'0.15rem',fontFamily:sans}}>予約をご確認ください</div>
            </div>
            <a href="/booking" style={{fontSize:'0.68rem',color:gold,textDecoration:'none',fontWeight:'700',fontFamily:sans}}>予約 →</a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.7rem'}}>
            <a href="/booking" style={{display:'flex',flexDirection:'column',gap:'0.4rem',background:'white',borderRadius:'14px',padding:'1.1rem',textDecoration:'none',boxShadow:'0 2px 8px rgba(13,31,60,0.05)'}}>
              <div style={{fontSize:'1.4rem'}}>📅</div>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:navy,fontFamily:sans}}>予約する</div>
              <div style={{fontSize:'0.62rem',color:'#8a8a9a',fontFamily:sans}}>空き枠を確認</div>
            </a>
            <a href="/mypage" style={{display:'flex',flexDirection:'column',gap:'0.4rem',background:'white',borderRadius:'14px',padding:'1.1rem',textDecoration:'none',boxShadow:'0 2px 8px rgba(13,31,60,0.05)'}}>
              <div style={{fontSize:'1.4rem'}}>📋</div>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:navy,fontFamily:sans}}>マイページ</div>
              <div style={{fontSize:'0.62rem',color:'#8a8a9a',fontFamily:sans}}>記録・履歴</div>
            </a>
            {isTrainer && (
              <a href="/trainer" style={{display:'flex',flexDirection:'column',gap:'0.4rem',background:navy,borderRadius:'14px',padding:'1.1rem',textDecoration:'none',gridColumn:'span 2'}}>
                <div style={{fontSize:'1.4rem'}}>🏋️</div>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'white',fontFamily:sans}}>管理画面</div>
                <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',fontFamily:sans}}>トレーナー専用</div>
              </a>
            )}
          </div>
        </div>
      </main>
    );
  }
  return (
    <main style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:navy,padding:'2rem 1.5rem',fontFamily:sans}}>
      <div style={{width:'100%',maxWidth:'280px',display:'flex',flexDirection:'column',alignItems:'center',gap:'2.5rem'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.32)',letterSpacing:'0.3em',textTransform:'uppercase',marginBottom:'0.7rem',fontFamily:sans}}>Conditioning Gym</div>
          <div style={{fontFamily:serif,fontSize:'3.8rem',color:gold,letterSpacing:'0.16em',lineHeight:'1',fontWeight:'600',fontStyle:'italic'}}>Art</div>
        </div>
        <div style={{width:'100%',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
          <input type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)}
            style={{padding:'0.85rem 1rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'0.85rem',outline:'none',width:'100%',fontFamily:sans}}/>
          <input type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}
            style={{padding:'0.85rem 1rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'0.85rem',outline:'none',width:'100%',fontFamily:sans}}/>
          <button onClick={handleLogin} disabled={loading}
            style={{padding:'0.9rem',borderRadius:'9px',border:'none',background:gold,color:navy,fontWeight:'700',fontSize:'0.85rem',cursor:'pointer',marginTop:'0.2rem',letterSpacing:'0.1em',width:'100%',fontFamily:sans}}>
            {loading?'ログイン中...':'ログイン'}
          </button>
        </div>
        {message&&<p style={{textAlign:'center',color:'#e74c3c',fontSize:'0.78rem',margin:'-1.5rem 0'}}>{message}</p>}
        <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:'0.75rem',width:'100%'}}>
          <p style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.25)',fontFamily:sans}}>
            はじめての方は<a href="/register" style={{color:gold,marginLeft:'0.4rem',textDecoration:'none'}}>新規会員登録</a>
          </p>
          <a href="/register" style={{display:'block',padding:'0.75rem',borderRadius:'9px',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.38)',fontSize:'0.75rem',textDecoration:'none',letterSpacing:'0.05em',fontFamily:sans}}>
            体験トレーニングを申し込む
          </a>
        </div>
      </div>
    </main>
  );
}
