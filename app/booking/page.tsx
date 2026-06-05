'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
const TIMES=['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
const DAYS=['日','月','火','水','木','金','土'];
export default function BookingPage() {
  const [selectedDate,setSelectedDate]=useState<Date|null>(null);
  const [selectedTime,setSelectedTime]=useState<string|null>(null);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const today=new Date();
  const [currentMonth,setCurrentMonth]=useState(today.getMonth());
  const [currentYear,setCurrentYear]=useState(today.getFullYear());
  const firstDay=new Date(currentYear,currentMonth,1).getDay();
  const daysInMonth=new Date(currentYear,currentMonth+1,0).getDate();
  const handleBook=async()=>{
    if(!selectedDate||!selectedTime){setMessage('日付と時間を選んでください');return;}
    setLoading(true);
    const start=new Date(selectedDate);
    const[h,m]=selectedTime.split(':');
    start.setHours(Number(h),Number(m),0,0);
    const end=new Date(start);
    end.setMinutes(end.getMinutes()+30);
    const{error}=await supabase.from('sessions').insert({start_time:start.toISOString(),end_time:end.toISOString(),status:'booked',session_type:'conditioning',booked_at:new Date().toISOString()});
    if(error){setMessage('予約に失敗しました: '+error.message);}else{setMessage('予約完了しました！');setSelectedDate(null);setSelectedTime(null);}
    setLoading(false);
  };
  return(
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1.2rem 1.5rem',display:'flex',alignItems:'center'}}>
        <span style={{color:'white',fontWeight:'700',fontSize:'1rem',margin:'0 auto'}}>予約する</span>
      </div>
      <div style={{maxWidth:'480px',margin:'0 auto',padding:'1.5rem'}}>
        <div style={{background:'white',borderRadius:'16px',padding:'1.2rem',marginBottom:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
            <button onClick={()=>setCurrentMonth(m=>m===0?11:m-1)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer'}}>‹</button>
            <span style={{fontWeight:'700',color:'#0d1f3c'}}>{currentYear}年 {currentMonth+1}月</span>
            <button onClick={()=>setCurrentMonth(m=>m===11?0:m+1)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer'}}>›</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',marginBottom:'0.5rem'}}>
            {DAYS.map((d,i)=>(<div key={d} style={{textAlign:'center',fontSize:'0.72rem',color:i===0?'#c0392b':i===6?'#2980b9':'#8a8a9a',padding:'0.3rem 0'}}>{d}</div>))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px'}}>
            {Array(firstDay).fill(null).map((_,i)=><div key={i}/>)}
            {Array(daysInMonth).fill(null).map((_,i)=>{
              const day=i+1;
              const date=new Date(currentYear,currentMonth,day);
              const isToday=date.toDateString()===today.toDateString();
              const isSelected=selectedDate?.toDateString()===date.toDateString();
              const isPast=date<new Date(today.getFullYear(),today.getMonth(),today.getDate());
              return(<button key={day} onClick={()=>!isPast&&setSelectedDate(date)} style={{border:'none',borderRadius:'50%',width:'36px',height:'36px',margin:'2px auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.82rem',cursor:isPast?'default':'pointer',background:isSelected?'#0d1f3c':isToday?'rgba(184,151,90,0.2)':'none',color:isSelected?'white':isPast?'#ccc':'#0d1f3c',fontWeight:isToday||isSelected?'700':'400'}}>{day}</button>);
            })}
          </div>
        </div>
        {selectedDate&&(
          <div style={{background:'white',borderRadius:'16px',padding:'1.2rem',marginBottom:'1rem'}}>
            <p style={{fontSize:'0.8rem',color:'#8a8a9a',marginBottom:'0.8rem'}}>時間を選択</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
              {TIMES.map(t=>(<button key={t} onClick={()=>setSelectedTime(t)} style={{padding:'0.8rem',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'0.85rem',fontWeight:'600',background:selectedTime===t?'#0d1f3c':'#f2f2f0',color:selectedTime===t?'white':'#0d1f3c'}}>{t}〜{String(Number(t.split(':')[0])*60+Number(t.split(':')[1])+30).replace(/(\d+)(\d{2})/,'$1:$2').padStart(5,'0')}</button>))}
            </div>
          </div>
        )}
        {selectedDate&&selectedTime&&(
          <div style={{background:'#0d1f3c',borderRadius:'16px',padding:'1.2rem',marginBottom:'1rem'}}>
            <p style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',marginBottom:'0.3rem'}}>予約内容</p>
            <p style={{color:'white',fontWeight:'700',fontSize:'1rem'}}>{selectedDate.getMonth()+1}/{selectedDate.getDate()} {DAYS[selectedDate.getDay()]}曜日 {selectedTime}〜</p>
          </div>
        )}
        <button onClick={handleBook} disabled={loading} style={{width:'100%',padding:'1rem',borderRadius:'12px',border:'none',cursor:'pointer',background:'#b8975a',color:'white',fontWeight:'700',fontSize:'1rem'}}>{loading?'予約中...':'予約する'}</button>
        {message&&<p style={{marginTop:'1rem',textAlign:'center',color:message.includes('完了')?'#3a9e6f':'#c0392b',fontWeight:'600'}}>{message}</p>}
      </div>
    </main>
  );
}
