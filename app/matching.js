const normalize = (value = '') => String(value).trim().toLocaleLowerCase('es');
const includesLoose = (haystack, needle) => {
  const a = normalize(haystack);
  const b = normalize(needle);
  return Boolean(a && b && (a.includes(b) || b.includes(a)));
};

export const ACTIONABLE_MATCH_MIN_SCORE = 70;
export const ACTIONABLE_MATCH_LIMIT = 15;

function budgetReason(buyer, property) {
  if (!property.price || (!buyer.minBudget && !buyer.maxBudget)) return null;
  const min = buyer.minBudget ?? 0;
  const max = buyer.maxBudget ?? Number.POSITIVE_INFINITY;
  const price = property.price;
  if (price >= min && price <= max) return { key:'budget',label:'Presupuesto',points:35,maxPoints:35,detail:`€${Math.round(price/1000)}k dentro de su rango`,passed:true };
  if (Number.isFinite(max) && price > max && price <= max * 1.1) return { key:'budget',label:'Presupuesto',points:18,maxPoints:35,detail:'Hasta un 10% por encima del máximo',passed:false };
  if (price < min && min > 0) return { key:'budget',label:'Presupuesto',points:24,maxPoints:35,detail:'Por debajo de su rango objetivo',passed:true };
  return { key:'budget',label:'Presupuesto',points:0,maxPoints:35,detail:'Fuera del presupuesto',passed:false };
}

function locationReason(buyer, property) {
  if (!buyer.desiredLocations?.length) return null;
  const fields = [property.city, property.region, property.neighborhood].filter(Boolean);
  const hit = buyer.desiredLocations.find((location) => fields.some((field) => includesLoose(field, location)));
  return hit ? { key:'location',label:'Zona',points:25,maxPoints:25,detail:`Encaja con ${hit}`,passed:true } : { key:'location',label:'Zona',points:0,maxPoints:25,detail:'Fuera de las zonas indicadas',passed:false };
}

function typeReason(buyer, property) {
  if (!buyer.propertyTypes?.length || !property.propertyType) return null;
  const hit = buyer.propertyTypes.some((type) => includesLoose(property.propertyType, type));
  return hit ? { key:'type',label:'Tipo',points:15,maxPoints:15,detail:property.propertyType,passed:true } : { key:'type',label:'Tipo',points:0,maxPoints:15,detail:`Busca ${buyer.propertyTypes.join(' / ')}`,passed:false };
}

function bedroomsReason(buyer, property) {
  if (buyer.minBedrooms == null || property.bedrooms == null) return null;
  const hit = property.bedrooms >= buyer.minBedrooms;
  return hit ? { key:'bedrooms',label:'Dormitorios',points:10,maxPoints:10,detail:`${property.bedrooms} ≥ ${buyer.minBedrooms}`,passed:true } : { key:'bedrooms',label:'Dormitorios',points:0,maxPoints:10,detail:`${property.bedrooms} < ${buyer.minBedrooms}`,passed:false };
}

function featuresReason(buyer, property) {
  if (!buyer.desiredFeatures?.length) return null;
  const hits = buyer.desiredFeatures.filter((wanted) => property.features?.some((feature) => includesLoose(feature, wanted)));
  const ratio = hits.length / buyer.desiredFeatures.length;
  return { key:'features',label:'Extras',points:Math.round(15*ratio),maxPoints:15,detail:hits.length?`${hits.length}/${buyer.desiredFeatures.length}: ${hits.join(', ')}`:'No coincide ningún extra clave',passed:ratio>=0.5 };
}

export function matchBuyerToProperty(buyer, property) {
  const reasons = [budgetReason(buyer,property),locationReason(buyer,property),typeReason(buyer,property),bedroomsReason(buyer,property),featuresReason(buyer,property)].filter(Boolean);
  const earned = reasons.reduce((sum,reason)=>sum+reason.points,0);
  const possible = reasons.reduce((sum,reason)=>sum+reason.maxPoints,0)||1;
  const score = Math.round((earned/possible)*100);
  const budget = reasons.find((reason)=>reason.key==='budget');
  const location = reasons.find((reason)=>reason.key==='location');
  const hardMismatch = Boolean((budget && budget.points===0)||(location && location.points===0));
  return { buyer, property, score, reasons, hardMismatch };
}

const statusPriority = (status) => ({ active:3, qualified:2, lead:1, paused:0 }[status] ?? 0);

export function rankBuyersForProperty(property,buyers) {
  return buyers
    .filter((buyer)=>!['lost','won'].includes(buyer.status))
    .map((buyer)=>matchBuyerToProperty(buyer,property))
    .sort((a,b)=>b.score-a.score || Number(a.hardMismatch)-Number(b.hardMismatch) || statusPriority(b.buyer.status)-statusPriority(a.buyer.status));
}

export function getContactQueue(property, buyers, actions = [], options = {}) {
  const minScore = options.minScore ?? ACTIONABLE_MATCH_MIN_SCORE;
  const limit = options.limit ?? ACTIONABLE_MATCH_LIMIT;
  const resolved = new Set(['contacted','interested','not_interested']);
  const actionByBuyer = new Map(
    actions
      .filter((action)=>action.propertyId===property.id)
      .map((action)=>[action.buyerId, action]),
  );

  return rankBuyersForProperty(property,buyers)
    .filter((match)=>match.score>=minScore)
    .filter((match)=>!match.hardMismatch)
    .filter((match)=>!['paused','lost','won'].includes(match.buyer.status))
    .filter((match)=>!resolved.has(actionByBuyer.get(match.buyer.id)?.status))
    .slice(0,limit);
}

export function getOpportunitySummary(property, buyers, actions = []) {
  const ranked = rankBuyersForProperty(property,buyers);
  const propertyActions = actions.filter((action)=>action.propertyId===property.id);
  const processedBuyerIds = new Set(
    propertyActions
      .filter((action)=>['contacted','interested','not_interested'].includes(action.status))
      .map((action)=>action.buyerId),
  );
  const unprocessed = ranked.filter((match)=>!processedBuyerIds.has(match.buyer.id));
  const actionable = unprocessed.filter((match)=>
    match.score>=ACTIONABLE_MATCH_MIN_SCORE &&
    !match.hardMismatch &&
    !['paused','lost','won'].includes(match.buyer.status),
  );
  const queue = actionable.slice(0,ACTIONABLE_MATCH_LIMIT);
  const automaticallyDiscarded = unprocessed.filter((match)=>
    match.buyer.status==='paused' ||
    match.score<ACTIONABLE_MATCH_MIN_SCORE ||
    match.hardMismatch,
  ).length;

  return {
    analyzed: ranked.length,
    actionableTotal: actionable.length,
    queueCount: queue.length,
    overflow: Math.max(0, actionable.length-queue.length),
    processed: processedBuyerIds.size,
    automaticallyDiscarded,
  };
}

export function matchLabel(score) { if(score>=85)return'Muy alto'; if(score>=70)return'Alto'; if(score>=55)return'Medio'; return'Bajo'; }
