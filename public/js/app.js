const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const ENTRY_CATEGORIES = {
  income: ['Salário', 'Freelancer', 'Extras'],
  essential: ['Moradia', 'Alimentação', 'Saúde', 'Transporte'],
  discretionary: ['Lazer', 'Viagens', 'Compras'],
  contribution: ['Investimentos', 'Reserva', 'Aporte extra']
};

const state = { step: 1, entries: [], onboarded: false };

const EMERGENCY_REFERENCES = [
  { item: 'Troca de óleo + filtro', cost: 325, source: 'Seu Carro Usado (2025)', url: 'https://seucarrousado.com.br/revisao-de-carro-usado-quanto-custa-e-o-que-verificar-em-2025' },
  { item: 'Correia dentada + mão de obra', cost: 1800, source: 'Seu Carro Usado (2025)', url: 'https://seucarrousado.com.br/revisao-de-carro-usado-quanto-custa-e-o-que-verificar-em-2025' },
  { item: 'Revisões iniciais carro popular (3 revisões)', cost: 2000, source: 'CNN Brasil Auto (2025)', url: 'https://www.cnnbrasil.com.br/auto/confira-o-valor-da-revisao-dos-10-carros-mais-vendidos-do-brasil/' },
  { item: 'Diária UTI adulto (SUS)', cost: 650, source: 'Ministério da Saúde (2022)', url: 'https://www.gov.br/saude/pt-br/assuntos/noticias/2022/janeiro/ministerio-da-saude-aumenta-valor-para-custeio-de-utis' },
  { item: 'Diária UTI referência de mercado (histórica)', cost: 1330.66, source: 'Unimed PTU A500 (2018-2019)', url: 'https://s3.amazonaws.com/us.inevent.files.general/570e0a5dd72282bb4d5729f2cf33ee4157d6aa0b.pdf' }
];

const el = (id) => document.getElementById(id);
const ui = {
  loading: el('loadingState'),
  onboarding: el('onboarding'),
  panel: el('panel'),
  steps: [...document.querySelectorAll('.step')],
  stepPanels: [el('step1'), el('step2')],
  prevStep: el('prevStep'),
  nextStep: el('nextStep'),
  finishOnboarding: el('finishOnboarding'),
  qTrack: el('qTrack'),
  qNever: el('qNever'),
  qSometimes: el('qSometimes'),
  qOften: el('qOften'),
  qDependents: el('qDependents'),
  qSchoolWrap: el('qSchoolWrap'),
  qSchool: el('qSchool'),
  qIncome: el('qIncome'),
  qFixed: el('qFixed'),
  qVariable: el('qVariable'),
  qReserve: el('qReserve'),
  qHasInsurance: el('qHasInsurance'),
  habitDetailFields: el('habitDetailFields'),
  qFixedHousing: el('qFixedHousing'),
  qFixedHealth: el('qFixedHealth'),
  qVarFood: el('qVarFood'),
  qVarLeisure: el('qVarLeisure'),
  profileResult: el('profileResult'),
  onboardingSummary: el('onboardingSummary'),
  toggleMethodology: el('toggleMethodology'),
  methodology: el('methodology'),
  monthlyIncome: el('monthlyIncome'),
  fixedCosts: el('fixedCosts'),
  otherIncome: el('otherIncome'),
  variableCosts: el('variableCosts'),
  advancedCostFields: el('advancedCostFields'),
  fixedHousing: el('fixedHousing'),
  fixedHealth: el('fixedHealth'),
  varFood: el('varFood'),
  varLeisure: el('varLeisure'),
  debts: el('debts'),
  insuranceCost: el('insuranceCost'),
  investments: el('investments'),
  emergencyReserve: el('emergencyReserve'),
  dependentsCount: el('dependentsCount'),
  schoolCosts: el('schoolCosts'),
  schoolCostsWrap: el('schoolCostsWrap'),
  hasInsurance: el('hasInsurance'),
  coverageWrap: el('coverageWrap'),
  coverageAbsence: el('coverageAbsence'),
  coverageDisability: el('coverageDisability'),
  coverageCritical: el('coverageCritical'),
  insuranceText: el('insuranceText'),
  mBalance: el('mBalance'),
  mReserveMonths: el('mReserveMonths'),
  mCommitment: el('mCommitment'),
  mRuin: el('mRuin'),
  barSlack: el('barSlack'),
  barLiquidity: el('barLiquidity'),
  priorityList: el('priorityList'),
  entryType: el('entryType'),
  entryCategory: el('entryCategory'),
  entryDescription: el('entryDescription'),
  entryAmount: el('entryAmount'),
  entryFrequency: el('entryFrequency'),
  addEntry: el('addEntry'),
  resetEntries: el('resetEntries'),
  entryList: el('entryList'),
  scenarioGrid: el('scenarioGrid'),
  summaryBars: el('summaryBars'),
  listIncome: el('listIncome'),
  listEssential: el('listEssential'),
  listDiscretionary: el('listDiscretionary'),
  listInvest: el('listInvest'),
  listProtection: el('listProtection'),
  cutSuggestions: el('cutSuggestions'),
  tipReserveList: el('tipReserveList'),
  tipRuinList: el('tipRuinList')
};

const moneyInputs = [...document.querySelectorAll('.money-input')];

const digitsOnly = (v) => String(v || '').replace(/\D/g, '');
const formatDigitsToMoney = (d) => BRL.format((Number(d || 0)) / 100);
const parseMoney = (input) => (Number(digitsOnly(input.value || 0)) / 100);
const setMoney = (input, value = 0) => { input.value = BRL.format(value); };

function bindMoneyMasks() {
  moneyInputs.forEach((input) => {
    input.value = BRL.format(0);
    input.addEventListener('input', () => {
      input.value = formatDigitsToMoney(digitsOnly(input.value));
      if (state.onboarded) renderDashboard();
    });
  });
}

function updateFollowup() {
  const v = ui.qTrack.value;
  ui.qNever.classList.toggle('hidden', v !== 'never');
  ui.qSometimes.classList.toggle('hidden', v !== 'sometimes');
  ui.qOften.classList.toggle('hidden', v !== 'often');
  ui.habitDetailFields.classList.toggle('hidden', !(v === 'sometimes' || v === 'often'));
}

function goToStep(step) {
  state.step = Math.max(1, Math.min(2, step));
  ui.steps.forEach((s, i) => s.classList.toggle('active', i + 1 === state.step));
  ui.stepPanels.forEach((p, i) => p.classList.toggle('active', i + 1 === state.step));
  ui.prevStep.classList.toggle('hidden', state.step === 1);
  ui.nextStep.classList.toggle('hidden', state.step === 2);
  ui.finishOnboarding.classList.toggle('hidden', state.step !== 2);
}

function getData() {
  return {
    income: parseMoney(ui.monthlyIncome),
    otherIncome: parseMoney(ui.otherIncome),
    fixed: parseMoney(ui.fixedCosts),
    variable: parseMoney(ui.variableCosts),
    debts: parseMoney(ui.debts),
    insuranceCost: parseMoney(ui.insuranceCost),
    investments: parseMoney(ui.investments),
    reserve: parseMoney(ui.emergencyReserve),
    dependents: Number(ui.dependentsCount.value) || 0,
    school: parseMoney(ui.schoolCosts),
    hasInsurance: ui.hasInsurance.value,
    covAbs: parseMoney(ui.coverageAbsence),
    covDis: parseMoney(ui.coverageDisability),
    covCrit: parseMoney(ui.coverageCritical),
    fixedHousing: parseMoney(ui.fixedHousing),
    fixedHealth: parseMoney(ui.fixedHealth),
    varFood: parseMoney(ui.varFood),
    varLeisure: parseMoney(ui.varLeisure)
  };
}

function calculate(data) {
  const totalIncome = data.income + data.otherIncome;
  const detailedFixed = data.fixedHousing + data.fixedHealth;
  const detailedVariable = data.varFood + data.varLeisure;
  const fixedValue = detailedFixed > 0 ? detailedFixed : data.fixed;
  const variableValue = detailedVariable > 0 ? detailedVariable : data.variable;
  const essential = fixedValue + variableValue + data.debts + data.school + data.insuranceCost;
  const balance = totalIncome - essential - data.investments;
  const reserveMonths = essential > 0 ? data.reserve / essential : 0;
  const commitment = totalIncome > 0 ? (essential / totalIncome) * 100 : 0;
  const ruinRisk = Math.min(100, Math.max(0, (3 - reserveMonths) * 25 + (commitment - 60) * 1.2));
  return { totalIncome, essential, balance, reserveMonths, commitment, ruinRisk };
}

function needsByCoverage(data) {
  const annual = (data.income + data.otherIncome) * 12;
  const depMult = data.dependents > 0 ? 1.2 : 1;
  return {
    abs: annual * 5 * depMult,
    dis: annual * 10 * depMult,
    crit: annual * 2 * depMult
  };
}

function renderInsurance(data, calc) {
  ui.coverageWrap.classList.toggle('hidden', data.hasInsurance !== 'yes');
  const n = needsByCoverage(data);
  const covAbs = data.hasInsurance === 'yes' ? data.covAbs : 0;
  const covDis = data.hasInsurance === 'yes' ? data.covDis : 0;
  const covCrit = data.hasInsurance === 'yes' ? data.covCrit : 0;

  const gapAbs = Math.max(0, n.abs - covAbs);
  const gapDis = Math.max(0, n.dis - covDis);
  const gapCrit = Math.max(0, n.crit - covCrit);

  if (data.hasInsurance === 'no' || data.hasInsurance === 'dontknow') {
    ui.insuranceText.textContent = `Sem cobertura informada. Prioridade imediata de proteção: ${Math.max(40, (100 - calc.reserveMonths * 15)).toFixed(0)}/100. Premissas: ausência 5x renda anual, invalidez 10x, doenças graves 2x.`;
  } else {
    ui.insuranceText.textContent = `Gap cobertura ausência: ${BRL.format(gapAbs)} | invalidez: ${BRL.format(gapDis)} | doenças graves: ${BRL.format(gapCrit)}.`;
  }
}

function priorities(calc, data) {
  const list = [];
  const maturity = state.maturity || 'Iniciante';
  list.push(`Seu custo essencial consome ${calc.commitment.toFixed(1)}% da renda; acima de 60% reduz margem de segurança.`);
  if (calc.reserveMonths < 3) list.push(maturity === 'Avançado' ? 'Ajuste alocação tática para elevar liquidez imediata sem desmontar estratégia.' : 'Monte reserva para 3 a 6 meses antes de novos compromissos.');
  else list.push(maturity === 'Iniciante' ? 'Mantenha disciplina mensal para não perder a reserva construída.' : 'Use sua margem para acelerar metas sem elevar seu risco.');
  if (data.hasInsurance !== 'yes') list.push('Estruturar proteção mínima por cobertura (ausência, invalidez e doenças graves).');
  else list.push('Comparar coberturas atuais com referências por renda e ajustar gaps críticos.');
  return list.slice(0, 3);
}

function renderEntries() {
  if (!state.entries.length) {
    ui.entryList.innerHTML = '<li class="small">Nenhum lançamento.</li>';
    return;
  }

  ui.entryList.innerHTML = state.entries.map((e, i) => `
    <li class="entry-item">
      <div>
        <strong>${e.description || 'Sem descrição'}</strong>
        <div class="entry-meta">${e.category} • ${e.frequency === 'recurring' ? 'Recorrente' : 'Único'}</div>
      </div>
      <div>
        <strong>${BRL.format(e.amount)}</strong>
        <button class="delete" data-index="${i}" type="button">Excluir</button>
      </div>
    </li>`).join('');

  ui.entryList.querySelectorAll('.delete').forEach((b) => b.onclick = () => {
    state.entries.splice(Number(b.dataset.index), 1);
    renderDashboard();
  });
}

function scenarioProjection(baseBalance, reserve, entries) {
  const recurring = entries.filter((e) => e.frequency === 'recurring');
  const recurringNet = recurring.reduce((acc, e) => {
    if (e.type === 'income') return acc + e.amount;
    if (e.type === 'essential' || e.type === 'discretionary' || e.type === 'contribution') return acc - e.amount;
    return acc;
  }, 0);

  const oneOff = entries.filter((e) => e.frequency === 'oneoff').reduce((acc, e) => {
    if (e.type === 'income') return acc + e.amount;
    return acc - e.amount;
  }, 0);

  const scenarios = [
    { name: 'Conservador', incomeAdj: 1, expenseAdj: 1.15 },
    { name: 'Realista', incomeAdj: 1, expenseAdj: 1 },
    { name: 'Pressionado', incomeAdj: 0.8, expenseAdj: 1.2 }
  ];

  return scenarios.map((s) => {
    const monthFlow = baseBalance * s.incomeAdj / s.expenseAdj + recurringNet;
    const reserve12 = reserve + monthFlow * 12 + oneOff;
    return { ...s, monthFlow, reserve12 };
  });
}

function renderScenarios(calc, data) {
  const scenarios = scenarioProjection(calc.balance, data.reserve, state.entries);
  ui.scenarioGrid.innerHTML = scenarios.map((s) => `
    <article class="scenario">
      <h5>${s.name}</h5>
      <p class="small">Fluxo mensal projetado: ${BRL.format(s.monthFlow)}</p>
      <p class="small">Reserva em 12m: ${BRL.format(s.reserve12)}</p>
    </article>
  `).join('');
}


function moneyLine(label, value){return `<li><span>${label}</span><strong>${BRL.format(value)}</strong></li>`;}

function renderDetailedView(data, calc){
  const discretionaryTotal = state.entries.filter(e=>e.type==='discretionary').reduce((a,e)=>a+e.amount,0);
  const essentialExtra = state.entries.filter(e=>e.type==='essential').reduce((a,e)=>a+e.amount,0);
  const investExtra = state.entries.filter(e=>e.type==='contribution').reduce((a,e)=>a+e.amount,0);
  const incomeExtra = state.entries.filter(e=>e.type==='income').reduce((a,e)=>a+e.amount,0);

  const totals = [
    {name:'Receitas', value: calc.totalIncome + incomeExtra, color:'#12b76a'},
    {name:'Necessários', value: calc.essential + essentialExtra, color:'#0ea5e9'},
    {name:'Supérfluos', value: discretionaryTotal, color:'#8b5cf6'},
    {name:'Investimentos', value: data.investments + investExtra, color:'#2563eb'},
    {name:'Seguro + Dívidas', value: data.insuranceCost + data.debts, color:'#f59e0b'}
  ];

  const max = Math.max(...totals.map(t=>t.value),1);
  ui.summaryBars.innerHTML = totals.map(t=>`<div class="summary-row"><span>${t.name}</span><div class="summary-track"><div class="summary-fill" style="width:${(t.value/max)*100}%;background:${t.color}"></div></div><strong>${BRL.format(t.value)}</strong></div>`).join('');

  ui.listIncome.innerHTML = [
    moneyLine('Salário', data.income),
    moneyLine('Outras receitas', data.otherIncome),
    moneyLine('Entradas lançadas', incomeExtra)
  ].join('');
  ui.listEssential.innerHTML = [
    moneyLine('Fixos', (data.fixedHousing+data.fixedHealth)||data.fixed), moneyLine('Variáveis', (data.varFood+data.varLeisure)||data.variable), moneyLine('Escolares', data.school), moneyLine('Essenciais lançadas', essentialExtra)
  ].join('');
  ui.listDiscretionary.innerHTML = [moneyLine('Supérfluos lançados', discretionaryTotal)].join('');
  ui.listInvest.innerHTML = [moneyLine('Aporte base', data.investments), moneyLine('Aportes lançados', investExtra)].join('');
  ui.listProtection.innerHTML = [moneyLine('Seguro mensal', data.insuranceCost), moneyLine('Dívidas', data.debts)].join('');

  const cuts = state.entries.filter(e=>e.type==='discretionary').sort((a,b)=>b.amount-a.amount).slice(0,3);
  if(!cuts.length){
    ui.cutSuggestions.innerHTML = '<li>Não há gastos supérfluos lançados. Registre para receber cortes sugeridos.</li>';
  } else {
    ui.cutSuggestions.innerHTML = cuts.map(c=>`<li>Revisar "${c.category}" (${BRL.format(c.amount)}). Redução de 20% já alivia o orçamento.</li>`).join('');
  }
}


function renderEmergencyCoverage(data){
  const profile = state.maturity || 'Iniciante';
  const reserve = data.reserve;
  const base = profile === 'Avançado'
    ? [
      { item:'Internação particular (diária UTI)', cost:1330.66, src:'Unimed PTU A500', url:'https://s3.amazonaws.com/us.inevent.files.general/570e0a5dd72282bb4d5729f2cf33ee4157d6aa0b.pdf' },
      { item:'Adaptação residencial p/ invalidez', cost:15000, src:'Referência de mercado', url:'https://www.caixa.gov.br/' },
      { item:'Cirurgia de urgência particular', cost:25000, src:'Referência hospitalar', url:'https://www.gov.br/saude/' }
    ]
    : [
      { item:'Troca de óleo + filtro', cost:325, src:'Seu Carro Usado', url:'https://seucarrousado.com.br/revisao-de-carro-usado-quanto-custa-e-o-que-verificar-em-2025' },
      { item:'Correia dentada + mão de obra', cost:1800, src:'Seu Carro Usado', url:'https://seucarrousado.com.br/revisao-de-carro-usado-quanto-custa-e-o-que-verificar-em-2025' },
      { item:'Diária UTI SUS', cost:650, src:'Ministério da Saúde', url:'https://www.gov.br/saude/pt-br/assuntos/noticias/2022/janeiro/ministerio-da-saude-aumenta-valor-para-custeio-de-utis' }
    ];

  ui.tipReserveList.innerHTML = base.map((e)=>`<li>${e.item}: ${reserve>=e.cost?'cobre':'não cobre'} (${BRL.format(e.cost)}) <a href="${e.url}" target="_blank" rel="noreferrer">fonte</a></li>`).join('');
  ui.tipRuinList.innerHTML = base.map((e)=>`<li>${e.item}: impacto ${((e.cost/Math.max(reserve,1))*100).toFixed(0)}% da sua reserva.</li>`).join('');
}

function renderDashboard() {
  const data = getData();
  const c = calculate(data);

  ui.schoolCostsWrap.classList.toggle('hidden', data.dependents === 0);
  if (data.dependents > 0 && data.school <= 0) {
    ui.schoolCosts.setCustomValidity('Informe custo escolar para dependentes.');
  } else {
    ui.schoolCosts.setCustomValidity('');
  }

  ui.mBalance.textContent = BRL.format(c.balance);
  ui.mReserveMonths.textContent = c.reserveMonths.toFixed(1);
  ui.mCommitment.textContent = `${c.commitment.toFixed(1)}%`;
  ui.mRuin.textContent = c.ruinRisk > 70 ? 'Alto' : c.ruinRisk > 40 ? 'Médio' : 'Baixo';

  ui.barSlack.style.width = `${Math.max(0, Math.min(100, ((c.balance / Math.max(data.income, 1)) * 100 + 30) * 1.2))}%`;
  ui.barLiquidity.style.width = `${Math.max(0, Math.min(100, (c.reserveMonths / 6) * 100))}%`;

  const prioritiesList = priorities(c, data);
  ui.priorityList.innerHTML = prioritiesList.map((p) => `<li>${p}</li>`).join('');

  renderInsurance(data, c);
  renderEntries();
  renderScenarios(c, data);
  renderDetailedView(data, c);
  renderEmergencyCoverage(data);
}

function seedFromOnboarding() {
  const deps = Number(ui.qDependents.value) || 0;
  const school = parseMoney(ui.qSchool);
  if (deps > 0 && school <= 0) return alert('Se houver dependentes, informe custos escolares.'), false;

  setMoney(ui.monthlyIncome, parseMoney(ui.qIncome));
  setMoney(ui.fixedCosts, parseMoney(ui.qFixed));
  setMoney(ui.otherIncome, 0);
  setMoney(ui.variableCosts, parseMoney(ui.qVariable));
  setMoney(ui.emergencyReserve, parseMoney(ui.qReserve));
  ui.dependentsCount.value = deps;
  setMoney(ui.schoolCosts, school);
  ui.hasInsurance.value = ui.qHasInsurance.value;

  const maturityMap = { never: 'Iniciante', sometimes: 'Moderado', often: 'Avançado', dontknow: 'Em diagnóstico' };
  state.maturity = maturityMap[ui.qTrack.value];
  ui.profileResult.textContent = `Perfil identificado: ${state.maturity}.`;
  ui.onboardingSummary.textContent = `Com base no que você respondeu, sua situação hoje é: ${state.maturity} em maturidade financeira.`;
  if (ui.qTrack.value === 'sometimes' || ui.qTrack.value === 'often') {
    setMoney(ui.fixedHousing, parseMoney(ui.qFixedHousing));
    setMoney(ui.fixedHealth, parseMoney(ui.qFixedHealth));
    setMoney(ui.varFood, parseMoney(ui.qVarFood));
    setMoney(ui.varLeisure, parseMoney(ui.qVarLeisure));
    ui.advancedCostFields.classList.remove('hidden');
  } else {
    ui.advancedCostFields.classList.add('hidden');
  }
  return true;
}

function initOnboarding() {
  updateFollowup();
  ui.qTrack.addEventListener('change', updateFollowup);
  ui.qDependents.addEventListener('input', () => ui.qSchoolWrap.classList.toggle('hidden', (Number(ui.qDependents.value) || 0) === 0));
  ui.prevStep.onclick = () => goToStep(state.step - 1);
  ui.nextStep.onclick = () => goToStep(state.step + 1);
  ui.finishOnboarding.onclick = () => {
    if (!seedFromOnboarding()) return;
    state.onboarded = true;
    ui.onboarding.classList.add('hidden');
    ui.panel.classList.remove('hidden');
    renderDashboard();
  };
}

function initPanel() {
  [ui.monthlyIncome, ui.otherIncome, ui.fixedCosts, ui.variableCosts, ui.debts, ui.insuranceCost, ui.investments, ui.emergencyReserve, ui.schoolCosts, ui.coverageAbsence, ui.coverageDisability, ui.coverageCritical, ui.fixedHousing, ui.fixedHealth, ui.varFood, ui.varLeisure, ui.entryAmount].forEach((i) => i.addEventListener('input', () => state.onboarded && renderDashboard()));
  [ui.dependentsCount, ui.hasInsurance].forEach((i) => i.addEventListener('change', () => state.onboarded && renderDashboard()));

  ui.toggleMethodology.onclick = () => ui.methodology.classList.toggle('hidden');

  ui.entryType.addEventListener('change', () => {
    ui.entryCategory.innerHTML = ENTRY_CATEGORIES[ui.entryType.value].map((c) => `<option>${c}</option>`).join('');
  });
  ui.entryCategory.innerHTML = ENTRY_CATEGORIES[ui.entryType.value].map((c) => `<option>${c}</option>`).join('');

  ui.addEntry.onclick = () => {
    const amount = parseMoney(ui.entryAmount);
    if (amount <= 0) return alert('Informe valor do lançamento.');
    state.entries.unshift({
      type: ui.entryType.value,
      category: ui.entryCategory.value,
      description: ui.entryDescription.value.trim(),
      frequency: ui.entryFrequency.value,
      amount
    });
    setMoney(ui.entryAmount, 0);
    ui.entryDescription.value = '';
    renderDashboard();
  };

  ui.resetEntries.onclick = () => { state.entries = []; renderDashboard(); };
}

async function init() {
  await fetch('/api/config');
  bindMoneyMasks();
  setMoney(ui.qIncome, 0); setMoney(ui.qFixed, 0); setMoney(ui.qVariable, 0); setMoney(ui.qSchool, 0); setMoney(ui.qReserve, 0); setMoney(ui.qFixedHousing,0); setMoney(ui.qFixedHealth,0); setMoney(ui.qVarFood,0); setMoney(ui.qVarLeisure,0);
  setMoney(ui.monthlyIncome, 0); setMoney(ui.otherIncome, 0); setMoney(ui.fixedCosts, 0); setMoney(ui.variableCosts, 0); setMoney(ui.debts, 0); setMoney(ui.insuranceCost, 0); setMoney(ui.investments, 0); setMoney(ui.emergencyReserve, 0); setMoney(ui.schoolCosts, 0);
  setMoney(ui.coverageAbsence, 0); setMoney(ui.coverageDisability, 0); setMoney(ui.coverageCritical, 0); setMoney(ui.fixedHousing,0); setMoney(ui.fixedHealth,0); setMoney(ui.varFood,0); setMoney(ui.varLeisure,0); setMoney(ui.entryAmount, 0);

  ui.loading.classList.add('hidden');
  ui.onboarding.classList.remove('hidden');
  initOnboarding();
  initPanel();
}

init();
