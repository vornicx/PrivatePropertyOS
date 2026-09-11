import { demoBuyers, demoProperties } from './demo.js';
const keys={buyers:'ppo.buyers.v1',properties:'ppo.properties.v1',actions:'ppo.actions.v1'};
const clone=(value)=>JSON.parse(JSON.stringify(value));
function read(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):clone(fallback);}catch{return clone(fallback);}}
export const loadState=()=>({buyers:read(keys.buyers,demoBuyers),properties:read(keys.properties,demoProperties),actions:read(keys.actions,[])});
export const persist=(state)=>{localStorage.setItem(keys.buyers,JSON.stringify(state.buyers));localStorage.setItem(keys.properties,JSON.stringify(state.properties));localStorage.setItem(keys.actions,JSON.stringify(state.actions));};
export const resetDemo=()=>Object.values(keys).forEach((key)=>localStorage.removeItem(key));
