import {useEffect,useRef,useState} from 'react';
import {PackagePlus, Trash2, PackageCheck} from 'lucide-react';
import {createPersonalProduct,loadPersonalProducts,savePersonalProducts,type PersonalProduct,type ProductLabel} from './personalProductCatalog';
import type {NutritionReference} from './nutrition';
import './personalProducts.css';
export function PersonalProducts({account,onApply}:{account:string;onApply:(reference:NutritionReference)=>void}) {
 const [open,setOpen]=useState(false),[creating,setCreating]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const heading = useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(notice)heading.current?.scrollIntoView({block:'start'});},[notice]);
 const [items,setItems]=useState<PersonalProduct[]>([]),[pendingDelete,setPendingDelete]=useState('');
 const [name,setName]=useState(''),[brand,setBrand]=useState(''),[barcode,setBarcode]=useState(''),[amount,setAmount]=useState('100'),[unit,setUnit]=useState<'g'|'ml'>('g');
 const [values,setValues]=useState({kcal:'',protein:'',carbs:'',fat:''}),[serving,setServing]=useState('100');
 const refresh=()=>{try{setItems(loadPersonalProducts(account));setError('');return true;}catch{setError('Não foi possível ler seus produtos salvos. O conteúdo foi preservado.');return false;}};
 const persist=(next:PersonalProduct[])=>{savePersonalProducts(account,next);setItems(next);};
 const save=()=>{
   setError('');setNotice('');
   try{
    const label:ProductLabel={name,brand,barcode,amount:Number(amount),unit,nutrients:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v.trim()===''?null:Number(v)])) as ProductLabel['nutrients']};
    const current=loadPersonalProducts(account), product=createPersonalProduct(label,current);
    persist([...current,product]);setCreating(false);setName('');setBrand('');setBarcode('');setValues({kcal:'',protein:'',carbs:'',fat:''});
    setNotice('Produto salvo só no seu catálogo pessoal. Não foi enviado ao catálogo geral.');
   }catch(e){setError(e instanceof DOMException?'Não foi possível salvar no navegador. Confira o espaço e as permissões de armazenamento.':e instanceof Error?e.message:'Não foi possível salvar. Confira os dados.');}
 };
 return <section className="personal-products" onKeyDown={event=>{if(event.key==='Enter' && event.target instanceof HTMLInputElement)event.preventDefault();}}>
  <button type="button" className="personal-toggle" aria-expanded={open} onClick={()=>{if(!open)refresh();setOpen(!open);}}><PackagePlus size={18}/> Meus produtos</button>
  {open && <div className="personal-panel">
   <h3 ref={heading}>Seu catálogo de rótulos</h3>
   <p>Cadastre produtos que não encontrou. Ficam vinculados a esta conta de demonstração neste navegador, sem sincronização entre aparelhos.</p>
   <button type="button" className="personal-create" onClick={()=>{setCreating(!creating);setError('');setNotice('');}}>{creating?'Cancelar cadastro':'Cadastrar produto pelo rótulo'}</button>
   {creating && <fieldset className="personal-fields"><legend>Dados do rótulo</legend>
    <label className="field"><span>Nome do produto</span><input maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className="field"><span>Marca do produto</span><input maxLength={80} value={brand} onChange={e=>setBrand(e.target.value)}/></label>
    <label className="field"><span>Código de barras (opcional)</span><input inputMode="numeric" maxLength={14} value={barcode} onChange={e=>setBarcode(e.target.value)}/></label>
    <div className="personal-grid"><label className="field"><span>Quantidade no rótulo</span><input type="number" min="0.1" max="5000" step="0.1" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
    <label className="field"><span>Unidade no rótulo</span><select value={unit} onChange={e=>setUnit(e.target.value as 'g'|'ml')}><option value="g">g</option><option value="ml">ml</option></select></label></div>
    <p>Copie os nutrientes para essa mesma quantidade. Ex.: se o rótulo informa por 30 g, preencha os valores de 30 g. Campos de macros vazios significam “sem informação”.</p>
    <div className="personal-grid">{(['kcal','protein','carbs','fat'] as const).map((key,i)=><label className="field" key={key}><span>{['Calorias do rótulo (kcal)','Proteína no rótulo (g)','Carboidratos no rótulo (g)','Gorduras no rótulo (g)'][i]}</span><input type="number" min="0" step="0.1" value={values[key]} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))}/></label>)}</div>
    <button type="button" className="food-search-submit" onClick={save}>Salvar meu produto</button>
   </fieldset>}
   {error && <p role="alert" className="personal-error">{error}</p>}{notice && <p role="status">{notice}</p>}
   {!creating && <>
    {items.length>0 && <label className="field"><span>Quantidade que vou consumir</span><input type="number" min="0.1" max="5000" step="0.1" value={serving} onChange={e=>setServing(e.target.value)}/></label>}
    <div className="personal-list">{items.map(product=><article key={product.id}>
      <strong>{product.label.name}</strong><span>{product.label.brand} · {product.food.per100.kcal} kcal / 100 {product.label.unit}</span>
      <small><PackageCheck size={13}/> Rótulo informado · não verificado</small>
      {product.integrity.warnings.map(w=><p key={w}>{w}</p>)}
      <div className="personal-actions"><button type="button" disabled={!Number.isFinite(Number(serving)) || Number(serving)<=0 || Number(serving)>5000 || product.food.per100.kcal!*Number(serving)/100>10000} onClick={()=>onApply({food:product.food,amount:Number(serving),retrievedAt:product.createdAt})}>Usar {serving || '…'} {product.label.unit} de {product.label.name}</button>
      <button type="button" className="personal-delete" aria-label={`Excluir produto ${product.label.name}`} onClick={()=>setPendingDelete(product.id)}><Trash2 size={16}/></button></div>
      {pendingDelete===product.id && <div className="personal-actions"><span>Excluir do seu catálogo? Os registros já feitos permanecem.</span><button type="button" onClick={()=>{try{persist(loadPersonalProducts(account).filter(p=>p.id!==product.id));setPendingDelete('');}catch{setError('Não foi possível excluir o produto.');}}}>Confirmar exclusão</button><button type="button" onClick={()=>setPendingDelete('')}>Cancelar exclusão</button></div>}
    </article>)}</div>
    {!items.length && <p>Você ainda não tem produtos salvos. Eles aparecerão também na busca unificada.</p>}
   </>}
  </div>}
 </section>;
}
