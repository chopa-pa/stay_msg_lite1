(function(){
  const db = { app_settings:{}, reservations:{}, messages:{}, sms_jobs:{} };
  const mock = { _db:db, _fail:null, _log:[], auth:{ _cb:null,
    getSession: async()=>({data:{session:{user:{email:'test@local'}}}}),
    signInWithPassword: async()=>({data:{session:{user:{email:'test@local'}}},error:null}),
    signOut: async()=>{}, onAuthStateChange(cb){ this._cb=cb; } },
    from(table){
      const q={ op:'select', filters:[], lim:null };
      const b={
        select(){ if(q.op==='select'||!q.op) q.op='select'; return b; }, neq(k,v){ q.filters.push(r=>r[k]!==v); return b; },
        order(){ return b; }, limit(n){ q.lim=n; return b; }, in(k,vals){ if(q.op==='delete'){ q.inIds=vals; } else { q.filters.push(r=>vals.includes(r[k])); } return b; }, eq(k,v){ q.filters.push(r=>String(r[k])===String(v)); return b; },
        update(obj){ q.op='update'; q.upd=obj; return b; },
        upsert(rows){ q.op='upsert'; q.rows=Array.isArray(rows)?rows:[rows]; return b; },
        delete(){ q.op='delete'; return b; },
        then(res){ if(mock._delay) setTimeout(()=>res(exec()), mock._delay); else res(exec()); }
      };
      function exec(){
        mock._log.push(table+':'+q.op);
        if(mock._fail===q.op || mock._fail===table+':'+q.op) return {data:null,error:{message:'mock fail '+q.op,code:'MOCK'}};
        if(q.op==='upsert' && mock._rejectId && q.rows.some(r=>r.id===mock._rejectId)) return {data:null,error:{message:'overlap',code:'23P01'}};
        const t=db[table]; const key = table==='app_settings'?'key':'id';
        if(q.op==='select'){ let rows=Object.values(t).filter(r=>q.filters.every(f=>f(r))); if(q.lim) rows=rows.slice(0,q.lim); return {data:JSON.parse(JSON.stringify(rows)),error:null}; }
        if(q.op==='upsert'){ q.rows.forEach(r=>{ t[r[key]]=JSON.parse(JSON.stringify(r)); }); return {data:null,error:null}; }
        if(q.op==='delete'){ (q.inIds||[]).forEach(id=>delete t[id]); return {data:null,error:null}; }
        if(q.op==='update'){ const hit=Object.values(t).filter(r=>q.filters.every(f=>f(r))); hit.forEach(r=>Object.assign(r,q.upd)); return {data:JSON.parse(JSON.stringify(hit)),error:null}; }
      }
      return b;
    } };
  // seed
  db.app_settings.settings={key:'settings',value:{name:'서버숙소',addr:'주소',account:'농협 1 임연신',rooms:[{id:'r_solsoop',name:'서버숙소',pw:'200,000원',pwe:'230,000원',ph:'',phMode:'eve',base:'2',max:'2',sp:{}}],dogOn:true,dogFee:'20,000원',bbqOn:true,bbqFee:'20,000원'}};
  db.reservations.r1={id:'r1',name:'손님1',phone:'010-1',checkin:'2026-11-01',checkout:'2026-11-02',guests:'2명',price:'200,000원',room_id:'r_solsoop',channel:'네이버예약',memo:'',status:'confirmed',created_at:'2026-10-01T00:00:00Z'};
  db.reservations.r2={id:'r2',name:'취소손님',checkin:'2026-11-05',checkout:'2026-11-06',status:'cancelled'};
  db.sms_jobs[1]={id:1,reservation_id:'r1',stage_id:'precheckin',channel:'네이버예약',phone:'01000000001',scheduled_date:'2026-11-01',body:'입실 안내 본문',body_hash:'x',status:'pending'};
  db.app_settings.bot_state={key:'bot_state',value:{last_run_at:'2026-10-27T09:40:00+09:00',mode:'preview',naver:{ok_at:'2026-10-27T09:39:00+09:00'}}};
  db.messages.h1={id:'h1',stage_id:'booked',stage_label:'예약확정',tpl_title:'t',name:'손님1',phone:'010-1',body:'b',sent_by:'bot',status:'sent',sent_at:'2026-10-20T00:00:00Z'};
  window.supabase = { createClient(){ return mock; } };
  window.__mock = mock;
})();
