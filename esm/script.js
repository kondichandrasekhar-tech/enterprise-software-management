const KEY="esm-software-v1";
const seed=[
 {id:1,name:"Microsoft 365",vendor:"Microsoft",version:"E3",category:"Productivity",owner:"IT",seats:500,used:462,cost:4800000,renewal:"2027-03-31",retired:false},
 {id:2,name:"Jira Software",vendor:"Atlassian",version:"Cloud",category:"Development",owner:"Engineering",seats:150,used:96,cost:1250000,renewal:"2026-12-15",retired:false},
 {id:3,name:"CrowdStrike Falcon",vendor:"CrowdStrike",version:"7.x",category:"Security",owner:"InfoSec",seats:520,used:515,cost:3600000,renewal:"2027-08-01",retired:false},
 {id:4,name:"Tally Prime",vendor:"Tally Solutions",version:"4.1",category:"Finance",owner:"Finance",seats:25,used:18,cost:210000,renewal:"2026-10-20",retired:false},
 {id:5,name:"Legacy HRMS",vendor:"InHouse",version:"2.3",category:"HR",owner:"HR",seats:80,used:0,cost:0,renewal:"2026-06-30",retired:true}];
let items,sort={k:"name",d:1},editing=null;
try{items=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!Array.isArray(items))items=seed;
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}};
const $=id=>document.getElementById(id);
const inr=n=>"₹"+Number(n).toLocaleString("en-IN");
const days=d=>Math.ceil((new Date(d)-new Date())/864e5);
function status(i){if(i.retired)return"Retired";const d=days(i.renewal);return d<0?"Expired":d<=60?"Expiring":"Active"}
const cols=[["name","Name"],["vendor","Vendor"],["category","Category"],["seats","Licence use"],["cost","Annual cost"],["renewal","Renewal"],["status","Status"]];
$("head").innerHTML=cols.map(c=>`<th data-k="${c[0]}">${c[1]}</th>`).join("")+"<th></th>";
$("head").onclick=e=>{const k=e.target.dataset.k;if(!k)return;sort=sort.k===k?{k,d:-sort.d}:{k,d:1};render()};
const cats=["All categories",...new Set(seed.map(s=>s.category).concat(["Operations"]))];
$("cat").innerHTML=cats.map(c=>`<option>${c}</option>`).join("");
$("st").innerHTML=["All statuses","Active","Expiring","Expired","Retired"].map(c=>`<option>${c}</option>`).join("");
["q","cat","st"].forEach(id=>$(id).oninput=render);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function render(){
  const q=$("q").value.toLowerCase(),c=$("cat").value,s=$("st").value;
  let list=items.filter(i=>(!q||[i.name,i.vendor,i.owner].join(" ").toLowerCase().includes(q))&&(c==="All categories"||i.category===c)&&(s==="All statuses"||status(i)===s));
  const val=i=>sort.k==="status"?status(i):sort.k==="seats"?i.used/i.seats:i[sort.k];
  list.sort((a,b)=>(val(a)>val(b)?1:-1)*sort.d);
  $("rows").innerHTML=list.map(i=>{const p=Math.min(100,Math.round(i.used/i.seats*100)),st=status(i);
   return`<tr><td><b>${esc(i.name)}</b><br><small style="color:var(--muted)">${esc(i.version)} · ${esc(i.owner)}</small></td><td>${esc(i.vendor)}</td><td>${esc(i.category)}</td>
   <td><span class="meter"><i style="width:${p}%"></i></span>${i.used}/${i.seats}</td><td>${inr(i.cost)}</td><td>${i.renewal}</td>
   <td><span class="tag ${st}">${st}</span></td><td><button class="link" onclick="edit(${i.id})">Edit</button><button class="link del" onclick="del(${i.id})">Delete</button></td></tr>`}).join("");
  $("empty").hidden=list.length>0;
  const live=items.filter(i=>!i.retired),seats=live.reduce((a,i)=>a+i.seats,0),used=live.reduce((a,i)=>a+i.used,0);
  const waste=live.reduce((a,i)=>a+(i.seats?(i.seats-i.used)/i.seats*i.cost:0),0);
  $("stats").innerHTML=[[live.length,"Active applications"],[inr(live.reduce((a,i)=>a+i.cost,0)),"Annual spend"],[(seats?Math.round(used/seats*100):0)+"%","Licence utilisation"],
   [items.filter(i=>status(i)==="Expiring"||status(i)==="Expired").length,"Need renewal attention"],[inr(Math.round(waste)),"Estimated unused spend"]]
   .map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
}
const f=$("form");
function open(i){editing=i;$("dtitle").textContent=i?"Edit software":"Add software";f.reset();
  if(i)for(const k in i){const el=f.elements[k];if(el)el.type==="checkbox"?el.checked=i[k]:el.value=i[k]}
  $("dlg").showModal()}
window.edit=id=>open(items.find(i=>i.id===id));
window.del=id=>{if(confirm("Delete this software entry?")){items=items.filter(i=>i.id!==id);persist();render()}};
$("add").onclick=()=>open(null);$("cancel").onclick=()=>$("dlg").close();
f.onsubmit=e=>{if(!f.checkValidity())return;
  const d=Object.fromEntries(new FormData(f));d.seats=+d.seats;d.used=+d.used;d.cost=+d.cost;d.retired=f.elements.retired.checked;
  if(d.used>d.seats){e.preventDefault();alert("Licences in use cannot exceed licences purchased.");return}
  if(editing)Object.assign(editing,d);else items.push({id:Date.now(),...d});
  persist();render()};
$("theme").onclick=()=>{const r=document.documentElement,dark=getComputedStyle(r).getPropertyValue("--bg").trim()==="#10161e";r.dataset.theme=dark?"light":"dark"};
render();
