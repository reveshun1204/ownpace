export const ranks=Object.freeze([
 {name:'ROOKIE',min:0,color:'#58a9ed'},
 {name:'REGULAR',min:5,color:'#ed665f'},
 {name:'ALLSTAR',min:10,color:'#cbd7e1'},
 {name:'LEGEND',min:25,color:'#e1bb67'},
 {name:'GOAT',min:50,color:'#9da6b1'},
]);
export function rankProgress(value){
 const count=Math.max(0,Math.trunc(Number(value)||0));
 const index=ranks.findLastIndex(r=>count>=r.min),rank=ranks[index],next=ranks[index+1]||null;
 return {count,index,rank,next,remaining:next?next.min-count:0,progress:next?(count-rank.min)/(next.min-rank.min):1};
}
export const rankName=value=>String(value).toUpperCase()==='MEMBER'?'ROOKIE':String(value).toUpperCase();
export const rankImage=name=>`../assets/img/rank/emblems/rank-${String(name).toLowerCase()}.png`;
