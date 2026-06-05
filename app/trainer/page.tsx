'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
const DAYS=['日','月','火','水','木','金','土'];
const SLOTS=['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
type Session={id:string;start_time:string;end_time:string;status:string;session_type:string;member_id:string|null;};
export default function TrainerPage() {
  const [selectedDate,setSelectedDate]=useState(new Date());
  const [sessions,setSessions]=useState<Session[]>([]);
  const [loading,setLoading]=useState(false);
  const fetchSessions=async(date:Date)=>{
    setLoading(true);
    const start=new Date(date);start.setHours(0,0,0,0);
    const end=new Date(date);end.setHours(23,59,59,999);
    const{data}=await supabase.from('sessions').select('*').gte('start_time',start.toISOString()).lte('start_time',end.toISOString()).order('start_time');
    setSessions(data||[]);
    setLoading(false);
  };
  useEffect(()=>{fetchSessions(selectedDate);},[selectedDate]);
  const changeDate=(diff:number)=>{
    const d=new Date(selectedDate);d.setDate(d.getDate()+diff);setSelectedDate(d);
  };
  const addSlot=async(timeStr:string)=>{
    const start=new Date(selectedDate);
    const[h,m]=timeStr.split(':');start.setHours(Number(h),Number(m),0,0);
    const end=new Date(start);end.setMinutes(end.getMinutes()+50);
    await supabase.from('sessions').insert({start_time:start.toISOString(),end_time:end.toISOString(),status:'available',session_type:'conditioning'});
    fetchSessions(selectedDate);
  };
  const bookedCount=sessions.filter(s=>s.status==='booked').length;
  const availableCount=sessions.filter(s=>s.status==='available').length;
  const totalCount=SLOTS.length;
  const getSession=(timeStr:string)=>{
    return sessions.find(s=>{
      const t=new Date(s.start_time);
      return t.getHours()===Number(timeStr.split(':')[0])&&t.getMinutes()===Number(timeStr.split(':')[1]);
    });
  };
  return(
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1.2rem 1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:'serif',fontSize:'1.1rem',color:'white'}}>Gym <span style={{color:'#b8975a',fontWeight:'700'}}>ART</span></span>
          <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8rem'}}>管理</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem',marginTop:'1rem'}}>
          {[{label:'本日予約',value:bookedCount,color:'#b8975a'},{label:'空き枠',value:availableCount,color:'white'},{label:'総枠数/日',value:totalCount,color:'white'}].map(item=>(
            <div key={item.label} style={{textAlign:'center'}}>
              <div style={{fontSize:'1.8rem',fontWeight:'700',color:item.color}}>{item.value}</div>
              <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',marginTop:'0.2rem'}}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'white',padding:'0.8rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #f2f2f0'}}>
        <button onClick={()=>changeDate(-1)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',color:'#0d1f3c'}}>‹</button>
        <span style={{fontWeight:'700',color:'#0d1f3c',fontSize:'0.95rem'}}>
          {selectedDate.getFullYear()}年{selectedDate.getMonth()+1}月{selectedDate.getDate()}日（{DAYS[selectedDate.getDay()]}）
        </span>
        <button onClick={()=>changeDate(1)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',color:'#0d1f3c'}}>›</button>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'1rem'}}>
        {loading&&<p style={{textAlign:'center',color:'#8a8a9a',padding:'2rem'}}>読み込み中...</p>}
        {SLOTS.map(timeStr=>{
          const session=getSession(timeStr);
          const endH=String(Math.floor((Number(timeStr.split(':')[0])*60+Number(timeStr.split(':')[1])+50)/60)).padStart(2,'0');
          const endM=String((Number(timeStr.split(':')[1])+50)%60).padStart(2,'0');
          return(
            <div key={timeStr} style={{display:'flex',gap:'0.8rem',marginBottom:'0.5rem',alignItems:'stretch'}}>
              <div style={{width:'60px',flexShrink:0,paddingTop:'0.8rem'}}>
                <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#0d1f3c'}}>{timeStr}</div>
                <div style={{fontSize:'0.68rem',color:'#8a8a9a'}}>{endH}:{endM}</div>
              </div>
              {session?(
                <div style={{flex:1,borderRadius:'12px',padding:'0.8rem 1rem',background:session.status==='booked'?'white':'rgba(184,151,90,0.08)',border:session.status==='booked'?'none':'1px dashed rgba(184,151,90,0.4)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  {session.status==='booked'?(
                    <>
                      <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#0d1f3c',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.75rem',fontWeight:'700'}}>木</div>
                        <div>
                          <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#0d1f3c'}}>予約済み</div>
                          <div style={{fontSize:'0.72rem',color:'#8a8a9a'}}>{session.session_type}</div>
                        </div>
                      </div>
                      <span style={{fontSize:'0.68rem',background:'rgba(58,158,111,0.1)',color:'#3a9e6f',padding:'0.2rem 0.6rem',borderRadius:'100px',fontWeight:'700'}}>確定</span>
                    </>
                  ):(
                    <>
                      <span style={{fontSize:'0.82rem',color:'#8a8a9a'}}>空き枠</span>
                      <span style={{fontSize:'0.75rem',color:'#b8975a',fontWeight:'700'}}>公開中</span>
                    </>
                  )}
                </div>
              ):(
                <button onClick={()=>addSlot(timeStr)} style={{flex:1,borderRadius:'12px',padding:'0.8rem 1rem',background:'none',border:'1px dashed #d0d0d0',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',color:'#8a8a9a',fontSize:'0.82rem'}}>
                  <span>空き枠なし</span>
                  <span style={{color:'#b8975a',fontWeight:'700'}}>＋ 追加</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
