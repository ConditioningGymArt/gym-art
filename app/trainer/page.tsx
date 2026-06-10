'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
const DAYS=['日','月','火','水','木','金','土'];
const SLOTS=['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
type Session={id:string;start_time:string;end_time:string;status:string;session_type:string;member_id:string|null;};
type UserMap={[key:string]:string};
export default function TrainerPage() {
  const router = useRouter();
  const [selectedDate,setSelectedDate]=useState(new Date());
  const [sessions,setSessions]=useState<Session[]>([]);
  const [loading,setLoading]=useState(false);
  const [closedDays,setClosedDays]=useState<string[]>([]);
  const [showClosedModal,setShowClosedModal]=useState(false);
  const [closedInput,setClosedInput]=useState('');
  const [closedReason,setClosedReason]=useState('');
  const [userMap,setUserMap]=useState<UserMap>({});

  const fetchSessions=async(date:Date)=>{
    setLoading(true);
    const start=new Date(date);start.setHours(0,0,0,0);
    const end=new Date(date);end.setHours(23,59,59,999);
    const{data}=await supabase.from('sessions').select('*').gte('start_time',start.toISOString()).lte('start_time',end.toISOString()).order('start_time');
    setSessions(data||[]);
    setLoading(false);
  };

  const fetchUsers=async()=>{
    const{data}=await supabase.from('users').select('id,full_name,email');
    const map:UserMap={};
    (data||[]).forEach(u=>{map[u.id]=u.full_name||u.email||'会員';});
    setUserMap(map);
  };

  const fetchClosedDays=async()=>{
    const{data}=await supabase.from('closed_days').select('closed_date');
    setClosedDays((data||[]).map(d=>d.closed_date));
  };

  useEffect(()=>{fetchSessions(selectedDate);fetchClosedDays();fetchUsers();},[selectedDate]);

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

  const addClosedDay=async()=>{
    if(!closedInput)return;
    await supabase.from('closed_days').insert({closed_date:closedInput,reason:closedReason});
    setClosedDays(prev=>[...prev,closedInput]);
    setClosedInput('');setClosedReason('');setShowClosedModal(false);
  };

  const removeClosedDay=async(date:string)=>{
    await supabase.from('closed_days').delete().eq('closed_date',date);
    setClosedDays(prev=>prev.filter(d=>d!==date));
  };

  const todayDateStr=`${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
  const isClosed=closedDays.includes(todayDateStr);
  const bookedCount=sessions.filter(s=>s.status==='booked').length;
  const availableCount=sessions.filter(s=>s.status==='available').length;

  const getSession=(timeStr:string)=>sessions.find(s=>{
    const t=new Date(s.start_time);
    return t.getHours()===Number(timeStr.split(':')[0])&&t.getMinutes()===Number(timeStr.split(':')[1]);
  });

  const getMemberName=(memberId:string|null)=>{
    if(!memberId)return '会員';
    return userMap[memberId]||'会員';
  };

  const getInitial=(name:string)=>name.charAt(0)||'会';

  return(
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1.2rem 1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <a href="/" style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8rem',textDecoration:'none'}}>← ホーム</a>
          <span style={{fontFamily:'serif',fontSize:'1.1rem',color:'white'}}>Gym <span style={{color:'#b8975a',fontWeight:'700'}}>ART</span></span>
          <button onClick={()=>router.push('/members')} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'white',padding:'0.4rem 0.8rem',borderRadius:'8px',fontSize:'0.75rem',cursor:'pointer',marginRight:'0.5rem'}}>会員一覧</button><button onClick={()=>setShowClosedModal(true)} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'white',padding:'0.4rem 0.8rem',borderRadius:'8px',fontSize:'0.75rem',cursor:'pointer'}}>休業日設定</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem',marginTop:'1rem'}}>
          {[{label:'本日予約',value:bookedCount,color:'#b8975a'},{label:'空き枠',value:availableCount,color:'white'},{label:'総枠数/日',value:SLOTS.length,color:'white'}].map(item=>(
            <div key={item.label} style={{textAlign:'center'}}>
              <div style={{fontSize:'1.8rem',fontWeight:'700',color:item.color}}>{item.value}</div>
              <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',marginTop:'0.2rem'}}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'white',padding:'0.8rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #f2f2f0'}}>
        <button onClick={()=>changeDate(-1)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',color:'#0d1f3c'}}>‹</button>
        <div style={{textAlign:'center'}}>
          <span style={{fontWeight:'700',color:'#0d1f3c',fontSize:'0.95rem'}}>{selectedDate.getFullYear()}年{selectedDate.getMonth()+1}月{selectedDate.getDate()}日（{DAYS[selectedDate.getDay()]}）</span>
          {isClosed&&<div style={{fontSize:'0.72rem',color:'#c0392b',fontWeight:'700'}}>🔴 休業日</div>}
        </div>
        <button onClick={()=>changeDate(1)} style={{background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',color:'#0d1f3c'}}>›</button>
      </div>
      {isClosed&&(
        <div style={{background:'rgba(192,57,43,0.08)',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:'#c0392b',fontSize:'0.85rem',fontWeight:'600'}}>この日は休業日に設定されています</span>
          <button onClick={()=>removeClosedDay(todayDateStr)} style={{background:'#c0392b',color:'white',border:'none',padding:'0.4rem 0.8rem',borderRadius:'8px',fontSize:'0.75rem',cursor:'pointer'}}>解除する</button>
        </div>
      )}
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'1rem'}}>
        {loading&&<p style={{textAlign:'center',color:'#8a8a9a',padding:'2rem'}}>読み込み中...</p>}
        {!isClosed&&SLOTS.map(timeStr=>{
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
                <div onClick={session.status==='completed'?()=>router.push('/record'):undefined} style={{flex:1,borderRadius:'12px',padding:'0.8rem 1rem',background:session.status==='booked'?'white':session.status==='completed'?'rgba(58,158,111,0.06)':'rgba(184,151,90,0.08)',border:session.status==='booked'?'none':session.status==='completed'?'1px solid rgba(58,158,111,0.2)':'1px dashed rgba(184,151,90,0.4)',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:session.status==='completed'?'pointer':'default'}}>
                  {session.status==='booked'?(
                    <>
                      <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#0d1f3c',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.75rem',fontWeight:'700'}}>{getInitial(getMemberName(session.member_id))}</div>
                        <div>
                          <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#0d1f3c'}}>{getMemberName(session.member_id)}</div>
                        </div>
                      </div>
                      <a href="/record" style={{fontSize:'0.75rem',color:'#b8975a',fontWeight:'700',textDecoration:'none'}}>記録入力 →</a>
                    </>
                  ):session.status==='completed'?(<div onClick={()=>router.push('/record')} style={{cursor:'pointer'}}>
                    <>
                      <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#3a9e6f',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.75rem',fontWeight:'700'}}>{getInitial(getMemberName(session.member_id))}</div>
                        <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#0d1f3c'}}>{getMemberName(session.member_id)}</div>
                      </div>
                      <span style={{fontSize:'0.68rem',background:'rgba(58,158,111,0.1)',color:'#3a9e6f',padding:'0.2rem 0.6rem',borderRadius:'100px',fontWeight:'700'}}>記録済み ✏️</span></div>
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
      {showClosedModal&&(
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',borderRadius:'16px',padding:'2rem',width:'90%',maxWidth:'400px'}}>
            <h3 style={{color:'#0d1f3c',marginBottom:'1.2rem',fontSize:'1rem'}}>休業日を追加</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.8rem'}}>
              <div>
                <p style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>日付</p>
                <input type="date" value={closedInput} onChange={e=>setClosedInput(e.target.value)} style={{width:'100%',padding:'0.8rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none'}}/>
              </div>
              <div>
                <p style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>理由（任意）</p>
                <input type="text" placeholder="例：研修のため" value={closedReason} onChange={e=>setClosedReason(e.target.value)} style={{width:'100%',padding:'0.8rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none'}}/>
              </div>
              <div style={{display:'flex',gap:'0.8rem',marginTop:'0.5rem'}}>
                <button onClick={()=>setShowClosedModal(false)} style={{flex:1,padding:'0.8rem',borderRadius:'8px',border:'1px solid #e0e0e0',background:'white',cursor:'pointer',fontSize:'0.9rem'}}>キャンセル</button>
                <button onClick={addClosedDay} style={{flex:1,padding:'0.8rem',borderRadius:'8px',border:'none',background:'#0d1f3c',color:'white',cursor:'pointer',fontSize:'0.9rem',fontWeight:'700'}}>追加する</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
