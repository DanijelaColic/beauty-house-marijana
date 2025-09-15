import { useMemo, useState } from "react";

const SERVICES = [
  { id: "cut", name: "Šišanje", duration: 45 },
  { id: "color", name: "Bojanje", duration: 90 },
  { id: "style", name: "Styling", duration: 30 },
];

const WORK_HOURS = { Mon:[8,20], Tue:[8,20], Wed:[8,20], Thu:[8,20], Fri:[8,20], Sat:[8,14], Sun:null };
const busySlotsMock = ["2025-09-09T10:00","2025-09-09T12:00","2025-09-10T09:00","2025-09-11T16:00"];
const fmt = d => new Date(d).toLocaleString("hr-HR",{dateStyle:"medium",timeStyle:"short"});
const dayKey = d => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(d).getDay()];
function* gen(start,end,dur){for(let i=new Date(start);i<=end;i=new Date(i.getTime()+15*60000)){const wh=WORK_HOURS[dayKey(i)];if(!wh)continue;const h=i.getHours()+i.getMinutes()/60;if(h<wh[0]||h+dur/60>wh[1])continue;yield new Date(i);}}
function overlaps(s,dur,busy){const S=s.getTime(),E=S+dur*60000;return busy.some(iso=>{const bs=new Date(iso).getTime(),be=bs+60*60000;return Math.max(S,bs)<Math.min(E,be);});}

export default function SmartSuggestions(){
  const [serviceId,setServiceId]=useState(SERVICES[0].id);
  const [range,setRange]=useState("today");

  const duration = SERVICES.find(s=>s.id===serviceId)?.duration ?? 45;
  const slots = useMemo(()=>{
    const now=new Date(); let start=new Date(), end=new Date();
    if(range==="today"){end.setHours(23,59,59,999);}
    else if(range==="tomorrow"){start=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0); end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,23,59);}
    else {end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+7,23,59);}
    const out=[]; for(const s of gen(start,end,duration)){ if(s<now)continue; if(overlaps(s,duration,busySlotsMock))continue; out.push(s); }
    return out.slice(0,5);
  },[serviceId,range,duration]);

  function onPick(s){
    const y=s.getFullYear(), m=String(s.getMonth()+1).padStart(2,"0"), d=String(s.getDate()).padStart(2,"0");
    const dateISO=`${y}-${m}-${d}`; const time=s.toTimeString().slice(0,5);
    const base=import.meta.env.PUBLIC_ZOYYA_WIDGET_URL;
    if(base){ const url=`${base}${base.includes("?")?"&":"?"}date=${dateISO}&time=${time}`; try{window.open(url,"_blank","noopener");}catch{} }
    window.location.hash="#rezervacije";
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Usluga</span>
          <select value={serviceId} onChange={e=>setServiceId(e.target.value)} className="select select-bordered rounded-xl">
            {SERVICES.map(s=><option key={s.id} value={s.id}>{s.name} — {s.duration} min</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-600">Raspon</span>
          <select value={range} onChange={e=>setRange(e.target.value)} className="select select-bordered rounded-xl">
            <option value="today">Danas</option>
            <option value="tomorrow">Sutra</option>
            <option value="week">Ovaj tjedan</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {slots.length===0 && <p className="text-sm text-slate-600">Nema dostupnih termina.</p>}
        {slots.map((s,i)=>(
          <button key={i} className="px-4 py-2 rounded-xl border border-slate-300 hover:border-[#2563EB] hover:text-[#2563EB] transition" onClick={()=>onPick(s)}>
            {fmt(s)}
          </button>
        ))}
      </div>
    </div>
  );
}
