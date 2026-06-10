'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Session = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
};

type Record = {
  id: string;
  session_id: string;
  trainer_comment: string;
  recorded_at: string;
  photo_url: string | null;
};

type Measurement = {
  id: string;
  weight: number | null;
  body_fat: number | null;
  water_content: number | null;
  muscle_mass: number | null;
  measured_at: string;
};

export default function MyPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState<'booking'|'record'|'body'>('booking');

  const DAYS = ['日','月','火','水','木','金','土'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/'; return; }

      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .in('status', ['booked', 'completed'])
        .order('start_time', { ascending: true });
      setSessions(sessionData || []);

      const { data: recordData } = await supabase
        .from('conditioning_scores')
        .select('*')
        .eq('member_id', user.id)
        .order('recorded_at', { ascending: false });
      setRecords(recordData || []);

      const { data: measurementData } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('member_id', user.id)
        .order('measured_at', { ascending: false });
      setMeasurements(measurementData || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('この予約をキャンセルしますか？')) return;
    setCancelling(id);
    const { error } = await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', id);
    if (!error) setSessions(prev => prev.filter(s => s.id !== id));
    setCancelling(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth()+1}月${d.getDate()}日（${DAYS[d.getDay()]}）`;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const isPast = (dateStr: string) => new Date(dateStr) < new Date();
  const upcomingSessions = sessions.filter(s => s.status==='booked' && !isPast(s.start_time));
  const pastSessions = sessions.filter(s => s.status==='booked' && isPast(s.start_time)).reverse();

  return (
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1.2rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',textDecoration:'none'}}>← ホーム</a>
        <span style={{color:'white',fontWeight:'700',fontSize:'1rem'}}>マイページ</span>
        <span style={{width:'60px'}}></span>
      </div>

      <div style={{display:'flex',background:'white',borderBottom:'1px solid #f2f2f0'}}>
        <button onClick={()=>setActiveTab('booking')} style={{flex:1,padding:'0.9rem',border:'none',background:'none',cursor:'pointer',fontSize:'0.8rem',fontWeight:'700',color:activeTab==='booking'?'#0d1f3c':'#8a8a9a',borderBottom:activeTab==='booking'?'2px solid #0d1f3c':'2px solid transparent'}}>予約履歴</button>
        <button onClick={()=>setActiveTab('record')} style={{flex:1,padding:'0.9rem',border:'none',background:'none',cursor:'pointer',fontSize:'0.8rem',fontWeight:'700',color:activeTab==='record'?'#0d1f3c':'#8a8a9a',borderBottom:activeTab==='record'?'2px solid #0d1f3c':'2px solid transparent'}}>カルテ</button>
        <button onClick={()=>setActiveTab('body')} style={{flex:1,padding:'0.9rem',border:'none',background:'none',cursor:'pointer',fontSize:'0.8rem',fontWeight:'700',color:activeTab==='body'?'#0d1f3c':'#8a8a9a',borderBottom:activeTab==='body'?'2px solid #0d1f3c':'2px solid transparent'}}>体組成</button>
      </div>

      <div style={{maxWidth:'480px',margin:'0 auto',padding:'1.5rem'}}>
        {loading ? (
          <p style={{textAlign:'center',color:'#8a8a9a',padding:'2rem'}}>読み込み中...</p>
        ) : activeTab==='booking' ? (
          <>
            {upcomingSessions.length > 0 && (
              <div style={{marginBottom:'2rem'}}>
                <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',color:'#8a8a9a',marginBottom:'0.8rem'}}>今後の予約</p>
                {upcomingSessions.map(s => (
                  <div key={s.id} style={{background:'white',borderRadius:'14px',padding:'1rem 1.2rem',marginBottom:'0.8rem',borderLeft:'4px solid #b8975a'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:'700',color:'#0d1f3c',fontSize:'0.95rem'}}>{formatDate(s.start_time)}</div>
                        <div style={{color:'#8a8a9a',fontSize:'0.82rem',marginTop:'0.2rem'}}>{formatTime(s.start_time)} 〜 {formatTime(s.end_time)}</div>
                      </div>
                      <button onClick={() => handleCancel(s.id)} disabled={cancelling === s.id}
                        style={{background:'rgba(192,57,43,0.08)',color:'#c0392b',border:'none',padding:'0.4rem 0.8rem',borderRadius:'8px',fontSize:'0.75rem',fontWeight:'700',cursor:'pointer'}}>
                        {cancelling === s.id ? '処理中...' : 'キャンセル'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {upcomingSessions.length === 0 && (
              <div style={{background:'white',borderRadius:'14px',padding:'2rem',textAlign:'center',marginBottom:'2rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📅</div>
                <div style={{color:'#8a8a9a',fontSize:'0.85rem'}}>今後の予約はありません</div>
                <a href="/booking" style={{display:'inline-block',marginTop:'1rem',background:'#b8975a',color:'white',padding:'0.7rem 1.5rem',borderRadius:'10px',textDecoration:'none',fontSize:'0.85rem',fontWeight:'700'}}>予約する</a>
              </div>
            )}
            {pastSessions.length > 0 && (
              <div>
                <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',color:'#8a8a9a',marginBottom:'0.8rem'}}>過去の予約</p>
                {pastSessions.map(s => (
                  <div key={s.id} style={{background:'white',borderRadius:'14px',padding:'1rem 1.2rem',marginBottom:'0.8rem',opacity:0.7}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:'700',color:'#0d1f3c',fontSize:'0.95rem'}}>{formatDate(s.start_time)}</div>
                        <div style={{color:'#8a8a9a',fontSize:'0.82rem',marginTop:'0.2rem'}}>{formatTime(s.start_time)} 〜 {formatTime(s.end_time)}</div>
                      </div>
                      <span style={{background:'#f2f2f0',color:'#8a8a9a',padding:'0.3rem 0.8rem',borderRadius:'100px',fontSize:'0.72rem',fontWeight:'700'}}>完了</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab==='record' ? (
          <>
            {records.length === 0 && (
              <div style={{background:'white',borderRadius:'14px',padding:'2rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📋</div>
                <div style={{color:'#8a8a9a',fontSize:'0.85rem'}}>まだカルテがありません</div>
              </div>
            )}
            {records.map(r => {
              const session = sessions.find(s => s.id === r.session_id);
              return (
                <div key={r.id} style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'1rem',borderLeft:'4px solid #0d1f3c'}}>
                  <div style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.8rem'}}>
                    {session ? formatDate(session.start_time) : formatDate(r.recorded_at)}
                  </div>
                  <div style={{marginBottom:'0.8rem'}}>
                    <p style={{fontSize:'0.72rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>実施内容</p>
                    <p style={{fontSize:'0.9rem',color:'#0d1f3c',lineHeight:'1.6'}}>{r.trainer_comment}</p>
                  </div>
                  {session?.notes && (
                    <div style={{background:'rgba(184,151,90,0.08)',borderRadius:'8px',padding:'0.8rem',marginTop:'0.5rem'}}>
                      <p style={{fontSize:'0.72rem',color:'#b8975a',fontWeight:'700',marginBottom:'0.3rem'}}>🏠 ホームエクササイズ</p>
                      <p style={{fontSize:'0.85rem',color:'#0d1f3c',lineHeight:'1.6'}}>{session.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <>
            {measurements.length === 0 && (
              <div style={{background:'white',borderRadius:'14px',padding:'2rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📊</div>
                <div style={{color:'#8a8a9a',fontSize:'0.85rem'}}>まだ体組成データがありません</div>
              </div>
            )}
            {measurements.map(m => (
              <div key={m.id} style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'1rem'}}>
                <div style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.8rem'}}>{formatDate(m.measured_at)}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem'}}>
                  {m.weight&&<div style={{background:'#f2f2f0',borderRadius:'8px',padding:'0.8rem',textAlign:'center'}}><div style={{fontSize:'0.68rem',color:'#8a8a9a',marginBottom:'0.2rem'}}>体重</div><div style={{fontSize:'1.2rem',fontWeight:'700',color:'#0d1f3c'}}>{m.weight}<span style={{fontSize:'0.72rem',color:'#8a8a9a'}}> kg</span></div></div>}
                  {m.body_fat&&<div style={{background:'#f2f2f0',borderRadius:'8px',padding:'0.8rem',textAlign:'center'}}><div style={{fontSize:'0.68rem',color:'#8a8a9a',marginBottom:'0.2rem'}}>体脂肪率</div><div style={{fontSize:'1.2rem',fontWeight:'700',color:'#0d1f3c'}}>{m.body_fat}<span style={{fontSize:'0.72rem',color:'#8a8a9a'}}> %</span></div></div>}
                  {m.water_content&&<div style={{background:'#f2f2f0',borderRadius:'8px',padding:'0.8rem',textAlign:'center'}}><div style={{fontSize:'0.68rem',color:'#8a8a9a',marginBottom:'0.2rem'}}>体水分量</div><div style={{fontSize:'1.2rem',fontWeight:'700',color:'#0d1f3c'}}>{m.water_content}<span style={{fontSize:'0.72rem',color:'#8a8a9a'}}> %</span></div></div>}
                  {m.muscle_mass&&<div style={{background:'#f2f2f0',borderRadius:'8px',padding:'0.8rem',textAlign:'center'}}><div style={{fontSize:'0.68rem',color:'#8a8a9a',marginBottom:'0.2rem'}}>筋肉量</div><div style={{fontSize:'1.2rem',fontWeight:'700',color:'#0d1f3c'}}>{m.muscle_mass}<span style={{fontSize:'0.72rem',color:'#8a8a9a'}}> kg</span></div></div>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
