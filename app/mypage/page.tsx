'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Session = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  session_type: string;
};

export default function MyPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const DAYS = ['日','月','火','水','木','金','土'];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/'; return; }
      setUserEmail(user.email || '');
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'booked')
        .order('start_time', { ascending: false });
      setSessions(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth()+1}月${d.getDate()}日（${DAYS[d.getDay()]}）`;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const isPast = (dateStr: string) => new Date(dateStr) < new Date();

  const upcomingSessions = sessions.filter(s => !isPast(s.start_time));
  const pastSessions = sessions.filter(s => isPast(s.start_time));

  return (
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1.2rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',textDecoration:'none'}}>← ホーム</a>
        <span style={{color:'white',fontWeight:'700',fontSize:'1rem'}}>予約履歴</span>
        <span style={{width:'60px'}}></span>
      </div>

      <div style={{maxWidth:'480px',margin:'0 auto',padding:'1.5rem'}}>
        {loading ? (
          <p style={{textAlign:'center',color:'#8a8a9a',padding:'2rem'}}>読み込み中...</p>
        ) : (
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
                        <div style={{color:'#8a8a9a',fontSize:'0.75rem',marginTop:'0.2rem'}}>{s.session_type}</div>
                      </div>
                      <span style={{background:'rgba(58,158,111,0.1)',color:'#3a9e6f',padding:'0.3rem 0.8rem',borderRadius:'100px',fontSize:'0.72rem',fontWeight:'700'}}>確定</span>
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
        )}
      </div>
    </main>
  );
}
