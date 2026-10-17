import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const targets={};
try{
 for(const plan of ['Emagrecer','Cutting','Manutenção','Lean bulking']){
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL||'http://localhost:5200');
  await page.getByRole('button',{name:'Cadastre-se',exact:true}).click();
  for(const [label,value] of [['E-mail','plan@example.com'],['Data de nascimento','1995-03-15'],['Senha','fitin123'],['Confirmar senha','fitin123']])await page.getByLabel(label,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Próximo',exact:true}).click();
  await page.getByLabel('Seu nome').fill('Teste plano');await page.getByRole('button',{name:'Outro',exact:true}).click();
  await page.getByRole('button',{name:'Próximo',exact:true}).click();
  await page.getByRole('button',{name:'Informar todas as medidas depois'}).click();
  await page.getByRole('button',{name:'Próximo',exact:true}).click();
  await page.getByRole('button',{name:/^Leve/}).click();
  await page.getByRole('button',{name:'Próximo',exact:true}).click();
  assert.equal(await page.locator('.choices .choice').count(),4);
  await page.getByRole('button',{name:new RegExp('^'+plan)}).click();
  await page.getByRole('button',{name:'Calcular meu plano!'}).click();
  await page.getByRole('button',{name:'Avançar',exact:true}).click();
  const target=Number((await page.locator('.calorie > strong').innerText()).replace(/[^0-9]/g,''));targets[plan]=target;
  await page.getByRole('button',{name:'Ver como fica o dia'}).click();
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.getByRole('button',{name:'Quero ajustar o ritmo'}).click();
  await page.getByRole('button',{name:'Prefiro decidir depois'}).click();
  await page.getByRole('button',{name:'Adicionar alimentos',exact:true}).click();
  await page.getByLabel('Alimento ou refeição').fill('Caso de teste');await page.getByLabel('Energia (kcal)').fill(String(target-100));
  await page.getByRole('button',{name:'Adicionar registro',exact:true}).click();
  const colors={good:'rgb(37, 123, 75)',warning:'rgb(190, 31, 76)',neutral:'rgb(105, 92, 118)'};
  const check=async(net,tone)=>{
   assert.equal(await page.locator('.ring strong').innerText(),String(Math.max(0,-net)));
   assert.equal(await page.locator('.ring small').innerText(),'kcal restantes');
   assert.equal(await page.locator('.daily-equation strong').evaluate(e=>getComputedStyle(e).color),colors[tone],`${plan} / ${net}`);
   assert.equal(await page.locator('.daily-equation strong').innerText(),`${net===0?0:-net} kcal · ${net<0?'déficit':net>0?'superávit':'equilíbrio'}`);
   assert.equal(await page.locator('.equation-consumed').evaluate(e=>getComputedStyle(e).color),plan==='Manutenção'?colors.neutral:plan==='Lean bulking'?colors.good:colors.warning);
   assert.equal(await page.locator('.equation-activity').evaluate(e=>getComputedStyle(e).color),plan==='Manutenção'?colors.neutral:plan==='Lean bulking'?colors.warning:colors.good);
  };
  await check(-100,['Emagrecer','Cutting'].includes(plan)?'good':'warning');
  for(const width of [320,390,1000,1440]){
   await page.setViewportSize({width,height:1000});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${plan}: overflow ${width}`);
   const geometry=await page.locator('.ring').evaluate(r=>{
    const inner=r.firstElementChild,number=inner.querySelector('strong'),label=inner.querySelector('small');
    const i=inner.getBoundingClientRect(),n=number.getBoundingClientRect(),l=label.getBoundingClientRect();
    return {dx:Math.abs((n.left+n.right)/2-(i.left+i.right)/2),dy:Math.abs((n.top+l.bottom)/2-(i.top+i.bottom)/2),labelHeight:l.height,labelLine:parseFloat(getComputedStyle(label).lineHeight)};
   });
   assert.ok(geometry.dx<1 && geometry.dy<2,`Ring centering ${JSON.stringify(geometry)}`);
   assert.ok(geometry.labelHeight<=geometry.labelLine+1);
   const tail=await page.locator('.equation-outcome').evaluate(e=>({height:e.getBoundingClientRect().height,line:parseFloat(getComputedStyle(e).lineHeight)}));
   assert.ok(tail.height<=tail.line+2,`Equation outcome wrapped at ${width}`);
  }
  await page.screenshot({path:`/tmp/fitin-plan-${plan.replaceAll(' ','-')}.png`,fullPage:true});
  for(const net of [0,100]){
   await page.getByRole('button',{name:'Diário',exact:true}).click();
   await page.getByRole('button',{name:'Editar Caso de teste',exact:true}).click();
   await page.getByLabel('Energia (kcal)').fill(String(target+net));await page.getByRole('button',{name:'Salvar alterações',exact:true}).click();
   await page.getByRole('button',{name:'Home',exact:true}).click();
   await check(net,net===0?(plan==='Manutenção'?'good':'neutral'):plan==='Lean bulking'?'good':'warning');
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 assert.equal(targets.Emagrecer,targets.Cutting);
 assert.equal(targets.Manutenção,2450);
 assert.ok(targets['Lean bulking']>targets.Manutenção && targets.Emagrecer<targets.Manutenção);
 console.log('PASS: four plans, target directions, deficit/equilibrium/surplus colors, neutral remaining ring, centered text and unbroken equation result at 320–1440px.');
}finally{await browser.close();}
