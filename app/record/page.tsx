'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
type Session={id:string;start_time:string;end_time:string;member_id:string|null;};
type UserMap={[key:string]:string};
export default function RecordPage() {
  const [sessions,setSessions]=useState<Session[]>([]);
  const [userMap,setUserMap]=useState<UserMap>({});
  const [selectedSession,setSelectedSession]=useState<Session|null>(null);
  const [content,setContent]=useState('');
  const [homeExercise,setHomeExercise]=useState('');
  const [weight,setWeight]=useState('');
  const [bodyFat,setBodyFat]=useState('');
  const [waterContent,setWaterContent]=useState('');
  const [muscleMass,setMuscleMass]=useState('');
  const [showMeasurement,setShowMeasurement]=useState(false);
  const [photo,setPhoto]=useState<File|null>(null);
  const [photoPreview,setPhotoPreview]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');
  const DAYS=['日','月','火','水','木','金','土'];
  useEffect(()=>{
    const fetchData=async()=>{
      const today=new Date();
      const start=new Date(today);start.setHours(0,0,0,0);
      const end=new Date(today);end.setHours(23,59,59,999);
      const{data:sd}=await supabase.from('sessions').select('*').eq('status','booked').gte('start_time',start.toISOString()).lte('start_time',end.toISOString()).order('start_time');
      setSessions(sd||[]);
      const{data:ud}=await supabase.from('users').select('id,full_name,email');
      const map:UserMap={};
      (ud||[]).forEach(u=>{map[u.id]=u.full_name||u.email||'会員';});
      setUserMap(map);
    };
    fetchData();
  },[]);
  const fmt=(d:string)=>new Date(d);
  const formatTime=(s:string)=>{const d=fmt(s);return`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
  const formatDate=(s:string)=>{const d=fmt(s);return`${d.getMonth()+1}月${d.getDate()}日（${DAYS[d.getDay()]}）`;};
  const getName=(id:string|null)=>id?userMap[id]||'会員':'会員';
  const handlePhoto=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(file){setPhoto(file);setPhotoPreview(URL.createObjectURL(file));}
  };
  const handleSave=async()=>{
    if(!selectedSession){setMessage('セッションを選んでください');return;}
    if(!content){setMessage('実施内容を入力してください');return;}
    setLoading(true);
    let photoUrl=null;
    if(photo&&selectedSession.member_id){
      const ext=photo.name.split('.').pop();
      const path=`${selectedSession.member_id}/${Date.now()}.${ext}`;
      const{data:uploadData}=await supabase.storage.from('member-photos').upload(path,photo);
      if(uploadData){
        const{data:urlData}=supabase.storage.from('member-photos').getPublicUrl(path);
        photoUrl=urlData.publicUrl;
      }
    }
    const{error}=await supabase.from('conditioning_scores').insert({session_id:selectedSession.id,member_id:selectedSession.member_id,trainer_comment:content,photo_url:photoUrl,recorded_at:new Date().toISOString()});
    if(error){setMessage('保存に失敗しました: '+error.message);setLoading(false);return;}
    if(weight||bodyFat||waterContent||muscleMass){
      await supabase.from('body_measurements').insert({member_id:selectedSession.member_id,weight:weight?Number(weight):null,body_fat:bodyFat?Number(bodyFat):null,water_content:waterContent?Number(waterContent):null,muscle_mass:muscleMass?Number(muscleMass):null,measured_at:new Date().toISOString()});
    }
    await supabase.from('sessions').update({status:'completed',notes:homeExercise}).eq('id',selectedSession.id);
    setMessage('記録を保存しました！');
    setSelectedSession(null);setContent('');setHomeExercise('');setWeight('');setBodyFat('');setWaterContent('');setMuscleMass('');setShowMeasurement(false);setPhoto(null);setPhotoPreview(null);
    setSessions(prev=>prev.filter(s=>s.id!==selectedSession.id));
    setLoading(false);
  };
  return(
    <main style={{minHeight:'100vh',background:'#f2f2f0'}}>
      <div style={{background:'#0d1f3c',padding:'1.2rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/trainer" style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',textDecoration:'none'}}>← 管理画面</a>
        <span style={{color:'white',fontWeight:'700',fontSize:'1rem'}}>記録入力</span>
        <span style={{width:'60px'}}></span>
      </div>
      <div style={{maxWidth:'480px',margin:'0 auto',padding:'1.5rem'}}>
        <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',color:'#8a8a9a',marginBottom:'0.8rem'}}>本日のセッション</p>
        {sessions.length===0&&(<div style={{background:'white',borderRadius:'14px',padding:'2rem',textAlign:'center'}}><div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📋</div><div style={{color:'#8a8a9a',fontSize:'0.85rem'}}>本日の予約はありません</div></div>)}
        {sessions.map(s=>(<button key={s.id} onClick={()=>{setSelectedSession(s);setMessage('');}} style={{width:'100%',background:selectedSession?.id===s.id?'#0d1f3c':'white',borderRadius:'14px',padding:'1rem 1.2rem',marginBottom:'0.8rem',border:selectedSession?.id===s.id?'none':'1px solid #e0e0e0',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',textAlign:'left'}}><div><div style={{fontWeight:'700',color:selectedSession?.id===s.id?'white':'#0d1f3c',fontSize:'0.95rem'}}>{getName(s.member_id)}</div><div style={{color:selectedSession?.id===s.id?'rgba(255,255,255,0.6)':'#8a8a9a',fontSize:'0.82rem',marginTop:'0.2rem'}}>{formatDate(s.start_time)} {formatTime(s.start_time)}〜</div></div>{selectedSession?.id===s.id&&<span style={{color:'#b8975a',fontSize:'1.2rem'}}>✓</span>}</button>))}
        {selectedSession&&(
          <div style={{marginTop:'1.5rem'}}>
            <div style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'1rem'}}>
              <p style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.5rem'}}>実施内容 <span style={{color:'#c0392b'}}>*</span></p>
              <textarea placeholder="本日実施したトレーニング内容" value={content} onChange={e=>setContent(e.target.value)} rows={4} style={{width:'100%',padding:'0.8rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none',resize:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'1rem'}}>
              <p style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.5rem'}}>ホームエクササイズ（任意）</p>
              <textarea placeholder="例：ドローイン 10回×3セット" value={homeExercise} onChange={e=>setHomeExercise(e.target.value)} rows={3} style={{width:'100%',padding:'0.8rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none',resize:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'1rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <p style={{fontSize:'0.75rem',color:'#8a8a9a'}}>体組成（任意）</p>
                <button onClick={()=>setShowMeasurement(!showMeasurement)} style={{background:'none',border:'none',color:'#b8975a',fontSize:'0.8rem',fontWeight:'700',cursor:'pointer'}}>{showMeasurement?'閉じる':'＋ 入力する'}</button>
              </div>
              {showMeasurement&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem',marginTop:'0.8rem'}}>
                  <div><p style={{fontSize:'0.72rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>体重 (kg)</p><input type="number" placeholder="58.5" value={weight} onChange={e=>setWeight(e.target.value)} style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}}/></div>
                  <div><p style={{fontSize:'0.72rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>体脂肪率 (%)</p><input type="number" placeholder="22.3" value={bodyFat} onChange={e=>setBodyFat(e.target.value)} style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}}/></div>
                  <div><p style={{fontSize:'0.72rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>体水分量 (%)</p><input type="number" placeholder="55.0" value={waterContent} onChange={e=>setWaterContent(e.target.value)} style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}}/></div>
                  <div><p style={{fontSize:'0.72rem',color:'#8a8a9a',marginBottom:'0.3rem'}}>筋肉量 (kg)</p><input type="number" placeholder="42.0" value={muscleMass} onChange={e=>setMuscleMass(e.target.value)} style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}}/></div>
                </div>
              )}
            </div>
            <div style={{background:'white',borderRadius:'14px',padding:'1.2rem',marginBottom:'1rem'}}>
              <p style={{fontSize:'0.75rem',color:'#8a8a9a',marginBottom:'0.8rem'}}>写真（任意）</p>
              {photoPreview&&<img src={photoPreview} alt="preview" style={{width:'100%',borderRadius:'8px',marginBottom:'0.8rem',maxHeight:'200px',objectFit:'cover'}}/>}
              <label style={{display:'block',padding:'0.8rem',borderRadius:'8px',border:'1px dashed #d0d0d0',textAlign:'center',cursor:'pointer',color:'#8a8a9a',fontSize:'0.85rem'}}>
                📷 {photo?photo.name:'写真を選択'}
                <input type="file" accept="image/*" onChange={handlePhoto} style={{display:'none'}}/>
              </label>
            </div>
            <button onClick={handleSave} disabled={loading} style={{width:'100%',padding:'1rem',borderRadius:'12px',border:'none',cursor:'pointer',background:'#b8975a',color:'white',fontWeight:'700',fontSize:'1rem'}}>{loading?'保存中...':'記録を保存する'}</button>
          </div>
        )}
        {message&&<p style={{marginTop:'1rem',textAlign:'center',color:message.includes('保存しました')?'#3a9e6f':'#c0392b',fontWeight:'600'}}>{message}</p>}
      </div>
    </main>
  );
}
