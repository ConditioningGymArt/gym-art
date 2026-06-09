'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      setMessage('すべての項目を入力してください');
      return;
    }
    if (password.length < 6) {
      setMessage('パスワードは6文字以上にしてください');
      return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      setMessage('登録に失敗しました: ' + error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d1f3c'}}>
        <div style={{background:'rgba(255,255,255,0.05)',padding:'2.5rem',borderRadius:'20px',width:'100%',maxWidth:'360px',margin:'1rem',textAlign:'center'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🎉</div>
          <div style={{color:'white',fontWeight:'700',fontSize:'1.2rem',marginBottom:'0.5rem'}}>登録完了！</div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.85rem',marginBottom:'2rem'}}>ようこそGym ARTへ！</div>
          <a href="/" style={{display:'block',background:'#b8975a',color:'white',padding:'0.9rem',borderRadius:'10px',textDecoration:'none',fontWeight:'700'}}>ログインする</a>
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
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'0.72rem',letterSpacing:'0.25em'}}>新規会員登録</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.8rem'}}>
          <input type="text" placeholder="お名前" value={fullName} onChange={e=>setFullName(e.target.value)}
            style={{padding:'0.9rem 1rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.9rem',outline:'none'}}/>
          <input type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)}
            style={{padding:'0.9rem 1rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.9rem',outline:'none'}}/>
          <input type="password" placeholder="パスワード（6文字以上）" value={password} onChange={e=>setPassword(e.target.value)}
            style={{padding:'0.9rem 1rem',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'0.9rem',outline:'none'}}/>
          <button onClick={handleRegister} disabled={loading}
            style={{padding:'0.9rem',borderRadius:'10px',border:'none',background:'#b8975a',color:'white',fontWeight:'700',fontSize:'0.95rem',cursor:'pointer',marginTop:'0.4rem'}}>
            {loading?'登録中...':'会員登録する'}
          </button>
        </div>
        {message&&<p style={{marginTop:'1rem',textAlign:'center',color:'#e74c3c',fontSize:'0.82rem'}}>{message}</p>}
        <p style={{marginTop:'1.5rem',textAlign:'center',fontSize:'0.8rem',color:'rgba(255,255,255,0.4)'}}>
          すでにアカウントをお持ちの方は
          <a href="/" style={{color:'#b8975a',marginLeft:'0.3rem'}}>ログイン</a>
        </p>
      </div>
    </main>
  );
}
