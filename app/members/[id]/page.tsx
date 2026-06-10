'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

type Record = { id: string; trainer_comment: string; recorded_at: string; photo_url: string | null; };
type Measurement = { id: string; weight: number | null; body_fat: number | null; measured_at: string; };

export default function MemberDetailPage() {
  const [member, setMember] = useState<any>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [activeTab, setActiveTab] = useState<'karte'|'body'>('karte');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetch = async () => {
      const { data: memberData } = await supabase.from('users').select('*').eq('id', id).single();
      setMember(memberData);
      const { data: recordData } = await supabase.from('conditioning_scores').select('*').eq('member_id', id).order('recorded_at', { ascending: false });
      setRecords(recordData || []);
      const { data: measData } = await supabase.from('body_measurements').select('*').eq('member_id', id).order('measured_at', { ascending: false });
      setMeasurements(measData || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const formatDate = (s: string) => { const d = new Date(s); return `${d.getMonth()+1}月${d.getDate()}日`; };

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f2f2f0'}}><p>読み込み中...</p></div>;

  return (
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1rem',display:'flex',alignItems:'center'}}>
        <button onClick={()=>router.push('/members')} style={{background:'none',border:'none',color:'white',fontSize:'1rem',cursor:'pointer'}}>← 会員一覧</button>
        <h1 style={{color:'white',fontSize:'1.1rem',fontWeight:'700',margin:'0 auto'}}>{member?.full_name || '会員詳細'}</h1>
      </div>
      <div style={{padding:'1rem',maxWidth:'600px',margin:'0 auto'}}>
        <div style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'1rem'}}>
          <div style={{fontWeight:'700',color:'#0d1f3c',marginBottom:'0.3rem'}}>{member?.full_name || '名前未設定'}</div>
          <div style={{fontSize:'0.8rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>{member?.email}</div>
          <div style={{fontSize:'0.75rem',color:'#b8975a'}}>{member?.plan_type || 'プラン未設定'}</div>
        </div>
        <div style={{display:'flex',background:'white',borderRadius:'14px',marginBottom:'1rem',overflow:'hidden'}}>
          {(['karte','body'] as const).map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:1,padding:'0.8rem',border:'none',background:activeTab===tab?'#0d1f3c':'white',color:activeTab===tab?'white':'#8a8a9a',fontWeight:'700',cursor:'pointer'}}>
              {tab==='karte'?'カルテ':'体組成'}
            </button>
          ))}
        </div>
        {activeTab==='karte' && (
          records.length===0 ? <div style={{background:'white',borderRadius:'14px',padding:'2rem',textAlign:'center',color:'#8a8a9a'}}>カルテがありません</div> :
          records.map(r => (
            <div key={r.id} style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'0.8rem',borderLeft:'4px solid #0d1f3c'}}>
              <div style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.8rem'}}>{formatDate(r.recorded_at)}</div>
              <p style={{fontSize:'0.9rem',color:'#0d1f3c',lineHeight:'1.6'}}>{r.trainer_comment}</p>
              {r.photo_url && <img src={r.photo_url} alt='写真' style={{width:'100%',borderRadius:'10px',marginTop:'0.8rem',objectFit:'cover',maxHeight:'260px'}} />}
            </div>
          ))
        )}
        {activeTab==='body' && (
          measurements.length===0 ? <div style={{background:'white',borderRadius:'14px',padding:'2rem',textAlign:'center',color:'#8a8a9a'}}>体組成データがありません</div> :
          measurements.map(m => (
            <div key={m.id} style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'0.8rem'}}>
              <div style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.8rem'}}>{formatDate(m.measured_at)}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem'}}>
                {m.weight&&<div style={{background:'#f2f2f0',borderRadius:'8px',padding:'0.8rem',textAlign:'center'}}><div style={{fontSize:'0.68rem',color:'#8a8a9a',marginBottom:'0.2rem'}}>体重</div><div style={{fontSize:'1.2rem',fontWeight:'700',color:'#0d1f3c'}}>{m.weight}<span style={{fontSize:'0.72rem',color:'#8a8a9a'}}> kg</span></div></div>}
                {m.body_fat&&<div style={{background:'#f2f2f0',borderRadius:'8px',padding:'0.8rem',textAlign:'center'}}><div style={{fontSize:'0.68rem',color:'#8a8a9a',marginBottom:'0.2rem'}}>体脂肪率</div><div style={{fontSize:'1.2rem',fontWeight:'700',color:'#0d1f3c'}}>{m.body_fat}<span style={{fontSize:'0.72rem',color:'#8a8a9a'}}> %</span></div></div>}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
