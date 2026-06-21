'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
const SLOTS=[
  {start:'09:00',end:'09:50'},{start:'09:30',end:'10:20'},
  {start:'10:00',end:'10:50'},{start:'10:30',end:'11:20'},
  {start:'11:00',end:'11:50'},{start:'11:30',end:'12:20'},
  {start:'12:00',end:'12:50'},{start:'12:30',end:'13:20'},
  {start:'13:00',end:'13:50'},{start:'13:30',end:'14:20'},
  {start:'14:00',end:'14:50'},{start:'14:30',end:'15:20'},
  {start:'15:00',end:'15:50'},{start:'15:30',end:'16:20'},
  {start:'16:00',end:'16:50'},{start:'16:30',end:'17:20'},
  {start:'17:00',end:'17:50'},{start:'17:30',end:'18:20'},
  {start:'18:00',end:'18:50'},{start:'18:30',end:'19:20'},
  {start:'19:00',end:'19:50'},
];
const DAYS=['日','月','火','水','木','金','土'];
const toMinutes=(t:string)=>Number(t.split(':')[0])*60+Number(t.split(':')[1]);
export default function BookingPage() {
  const [selectedDate,setSelectedDate]=useState<Date|null>(null);
  const [selectedSlot,setSelectedSlot]=useState<{start:string,end:string}|null>(null);
  const [bookedSlots,setBookedSlots]=useState<{start:string,end:string}[]>([]);
  const [closedDays,setClosedDays]=useState<string[]>([]);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const [userId,setUserId]=useState<string|null>(null);
  const today=new Date();
  const [currentMonth,setCurrentMonth]=useState(today.getMonth());
  const [currentYear,setCurrentYear]=useState(today.getFullYear());
  const firstDay=new Date(currentYear,currentMonth,1).getDay();
  const daysInMonth=new Date(currentYear,currentMonth+1,0).getDate();
  useEffect(()=>{
    const init=async()=>{
      const{data:{user}}=await supabase.auth.getUser();
      if(user)setUserId(user.id);
      const{data}=await supabase.from('closed_days').select('closed_date');
      setClosedDays((data||[]).map(d=>d.closed_date));
    };
    init();
  },[]);
  const fetchBookedSlots=async(date:Date)=>{
    const start=new Date(date);start.setHours(0,0,0,0);
    const end=new Date(date);end.setHours(23,59,59,999);
    const{data}=await supabase.from('sessions').select('start_time,end_time').eq('status','booked').gte('start_time',start.toISOString()).lte('start_time',end.toISOString());
    setBookedSlots((data||[]).map(s=>{
      const sd=new Date(s.start_time);const ed=new Date(s.end_time);
      return{start:`${String(sd.getHours()).padStart(2,'0')}:${String(sd.getMinutes()).padStart(2,'0')}`,end:`${String(ed.getHours()).padStart(2,'0')}:${String(ed.getMinutes()).padStart(2,'0')}`};
    }));
  };
  useEffect(()=>{if(selectedDate)fetchBookedSlots(selectedDate);},[selectedDate]);
  const isPastSlot=(slot:{start:string,end:string})=>{
    const now=new Date();
    if(selectedDate.toDateString()!==now.toDateString())return false;
    const[h,m]=slot.start.split(':');
    const slotTime=new Date(selectedDate);
    slotTime.setHours(Number(h),Number(m),0,0);
    return slotTime<now;
  };
  const isConflict=(slot:{start:string,end:string})=>{
    const s=toMinutes(slot.start),e=toMinutes(slot.end);
    return bookedSlots.some(b=>s<toMinutes(b.end)&&e>toMinutes(b.start));
  };
  const toDateStr=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const handleBook=async()=>{
    if(!selectedDate||!selectedSlot){setMessage('日付と時間を選んでください');return;}
    setLoading(true);
    const start=new Date(selectedDate);
    const[h,m]=selectedSlot.start.split(':');start.setHours(Number(h),Number(m),0,0);
    const end=new Date(selectedDate);
    const[eh,em]=selectedSlot.end.split(':');end.setHours(Number(eh),Number(em),0,0);
    const{error}=await supabase.from('sessions').insert({start_time:start.toISOString(),end_time:end.toISOString(),status:'booked',session_type:'conditioning',booked_at:new Date().toISOString(),member_id:userId});
    if(error){setMessage('予約に失敗しました: '+error.message);}else{setMessage('予約完了しました！');setSelectedDate(null);setSelectedSlot(null);setBookedSlots([]);}
    setLoading(false);
  };
  return(
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1.2rem 1.5rem',display:'flex',alignItems:'center'}}>
        <a href="/" style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',textDecoration:'none'}}>← ホーム</a>
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
              const day=i+1;const date=new Date(currentYear,currentMonth,day);
              const isToday=date.toDateString()===today.toDateString();
              const isSelected=selectedDate?.toDateString()===date.toDateString();
              const isPast=date<new Date(today.getFullYear(),today.getMonth(),today.getDate());
              const isClosed=closedDays.includes(toDateStr(date));
              const disabled=isPast||isClosed;
              return(<button key={day} onClick={()=>!disabled&&setSelectedDate(date)} style={{border:'none',borderRadius:'50%',width:'36px',height:'36px',margin:'2px auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.82rem',cursor:disabled?'default':'pointer',background:isSelected?'#0d1f3c':isToday?'rgba(184,151,90,0.2)':'none',color:isSelected?'white':disabled?'#ccc':'#0d1f3c',fontWeight:isToday||isSelected?'700':'400',textDecoration:isClosed?'line-through':'none'}}>{day}</button>);
            })}
          </div>
        </div>
        {selectedDate&&(
          <div style={{background:'white',borderRadius:'16px',padding:'1.2rem',marginBottom:'1rem'}}>
            <p style={{fontSize:'0.8rem',color:'#8a8a9a',marginBottom:'0.8rem'}}>時間を選択</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
              {SLOTS.map(s=>{
                const conflict=isConflict(s)||isPastSlot(s);
                return(<button key={s.start} onClick={()=>!conflict&&setSelectedSlot(s)} disabled={conflict} style={{padding:'0.8rem',borderRadius:'10px',border:'none',cursor:conflict?'default':'pointer',fontSize:'0.85rem',fontWeight:'600',background:conflict?'#f2f2f0':selectedSlot?.start===s.start?'#0d1f3c':'#f2f2f0',color:conflict?'#ccc':selectedSlot?.start===s.start?'white':'#0d1f3c',textDecoration:conflict?'line-through':'none'}}>{s.start}〜{s.end}</button>);
              })}
            </div>
            <p style={{fontSize:'0.72rem',color:'#8a8a9a',marginTop:'0.8rem'}}>※ 取り消し線は予約不可です</p>
          </div>
        )}
        {selectedDate&&selectedSlot&&(
          <div style={{background:'#0d1f3c',borderRadius:'16px',padding:'1.2rem',marginBottom:'1rem'}}>
            <p style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',marginBottom:'0.3rem'}}>予約内容</p>
            <p style={{color:'white',fontWeight:'700',fontSize:'1rem'}}>{selectedDate.getMonth()+1}/{selectedDate.getDate()} {DAYS[selectedDate.getDay()]}曜日 {selectedSlot.start}〜{selectedSlot.end}</p>
          </div>
        )}
        <button onClick={handleBook} disabled={loading} style={{width:'100%',padding:'1rem',borderRadius:'12px',border:'none',cursor:'pointer',background:'#b8975a',color:'white',fontWeight:'700',fontSize:'1rem'}}>{loading?'予約中...':'予約する'}</button>
        {message&&<p style={{marginTop:'1rem',textAlign:'center',color:message.includes('完了')?'#3a9e6f':'#c0392b',fontWeight:'600'}}>{message}</p>}
      </div>
    </main>
  );
}
