'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Member = {
  id: string;
  email: string;
  full_name: string | null;
  plan_type: string | null;
  created_at: string | null;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || (!user.email?.includes('art') && !user.email?.includes('trainer'))) {
        window.location.href = '/';
        return;
      }
      const { data } = await supabase.from('users').select('*').not('email', 'ilike', '%art%').not('email', 'ilike', '%trainer%').order('created_at', { ascending: false });
      setMembers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f2f2f0'}}><p>読み込み中...</p></div>;

  return (
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1rem',display:'flex',alignItems:'center',gap:'1rem'}}>
        <button onClick={()=>router.push('/trainer')} style={{background:'none',border:'none',color:'white',fontSize:'1rem',cursor:'pointer'}}>← 管理画面</button>
        <h1 style={{color:'white',fontSize:'1.1rem',fontWeight:'700',margin:'0 auto'}}>会員一覧</h1>
      </div>
      <div style={{padding:'1rem',maxWidth:'600px',margin:'0 auto'}}>
        <p style={{color:'#8a8a9a',fontSize:'0.85rem',marginBottom:'1rem'}}>{members.length}名の会員</p>
        {members.length === 0 ? (
          <div style={{background:'white',borderRadius:'14px',padding:'2rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>👥</div>
            <div style={{color:'#8a8a9a',fontSize:'0.85rem'}}>会員がいません</div>
          </div>
        ) : (
          members.map(m => (
            <div key={m.id} onClick={()=>router.push(`/members/${m.id}`)} style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'0.8rem',cursor:'pointer',borderLeft:'4px solid #b8975a'}}>
              <div style={{fontWeight:'700',color:'#0d1f3c',marginBottom:'0.3rem'}}>{m.full_name || '名前未設定'}</div>
              <div style={{fontSize:'0.8rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>{m.email}</div>
              <div style={{fontSize:'0.75rem',color:'#b8975a'}}>{m.plan_type || 'プラン未設定'}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
