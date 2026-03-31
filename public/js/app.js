const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const ENTRY_CATEGORIES = {
  income: ['Salário extra', 'Freelancer', 'Outros'],
  essential: ['Moradia', 'Transporte', 'Saúde', 'Alimentação'],
  discretionary: ['Lazer', 'Compras', 'Assinaturas'],
  contribution: ['Investimentos', 'Reserva', 'Aporte']
};
const state = { maturity: 'Em diagnóstico', entries: [] };
const el = (id) => document.getElementById(id);
const ui = {
  loadingState: el('loadingState'), onboarding: el('onboarding'), panel: el('panel'),
  quickStart: el('quickStart'), openPanel: el('openPanel'), onboardingFeedback: el('onboardingFeedback'),
  qTrack: el('qTrack'), qIncome: el('qIncome'), qFixed: el('qFixed'), qVariable: el('qVariable'),
  qHasDependents: el('qHasDependents'), qSchoolWrap: el('qSchoolWrap'), qSchool: el('qSchool'),
  qReserve: el('qReserve'), qHasInsurance: el('qHasInsurance'), detailFields: el('detailFields'),
  qFixedHousing: el('qFixedHousing'), qFixedHealth: el('qFixedHealth'), qVarFood: el('qVarFood'), qVarLeisure: el('qVarLeisure'),

  statusBadge: el('statusBadge'), summaryLine: el('summaryLine'), summaryReasons: el('summaryReasons'), interpretationText: el('interpretationText'),
  priorityList: el('priorityList'), mBalance: el('mBalance'), mReserveMonths: el('mReserveMonths'), mCommitment: el('mCommitment'), mRuin: el('mRuin'),
  tipReserveList: el('tipReserveList'), tipRuinList: el('tipRuinList'),
  summaryBars: el('summaryBars'), listIncome: el('listIncome'), listEssential: el('listEssential'), listDiscretionary: el('listDiscretionary'), listInvest: el('listInvest'), listProtection: el('listProtection'),

  toggleMethodology: el('toggleMethodology'), methodology: el('methodology'), insuranceText: el('insuranceText'), protectionCta: el('protectionCta'),
  hasInsurance: el('hasInsurance'), coverageWrap: el('coverageWrap'), coverageAbsence: el('coverageAbsence'), coverageDisability: el('coverageDisability'), coverageCritical: el('coverageCritical'),

  monthlyIncome: el('monthlyIncome'), otherIncome: el('otherIncome'), fixedCosts: el('fixedCosts'), variableCosts: el('variableCosts'), fixedHousing: el('fixedHousing'), fixedHealth: el('fixedHealth'), varFood: el('varFood'), varLeisure: el('varLeisure'), advancedCostFields: el('advancedCostFields'), debts: el('debts'), investments: el('investments'), emergencyReserve: el('emergencyReserve'),
  dependentsCount: el('dependentsCount'), schoolCostsWrap: el('schoolCostsWrap'), schoolCosts: el('schoolCosts'), inlineError: el('inlineError'),

  entryType: el('entryType'), entryCategory: el('entryCategory'), entryDescription: el('entryDescription'), entryAmount: el('entryAmount'), entryFrequency: el('entryFrequency'),
  addEntry: el('addEntry'), resetEntries: el('resetEntries'), entryFeedback: el('entryFeedback'), entryList: el('entryList'), scenarioGrid: el('scenarioGrid')
};

const moneyInputs = [...document.querySelectorAll('.money-input')];
const digitsOnly = (v) => String(v || '').replace(/\D/g, '');
const parseMoney = (input) => (Number(digitsOnly(input.value || 0)) / 100);
const setMoney = (input, value = 0) => { input.value = BRL.format(value); };
const fmt = (v) => BRL.format(v || 0);

function bindMoneyMasks() {
  moneyInputs.forEach((input) => {
    input.value = BRL.format(0);
    input.addEventListener('input', () => {
      input.value = BRL.format(Number(digitsOnly(input.value || 0)) / 100);
      if (!ui.panel.classList.contains('hidden')) renderAll();
    });
  });
}

function setMaturity(track) {
  const map = { never: 'Iniciante', sometimes: 'Intermediário', often: 'Avançado', dontknow: 'Em diagnóstico' };
  state.maturity = map[track] || 'Em diagnóstico';
  ui.detailFields.classList.toggle('hidden', !(track === 'sometimes' || track === 'often'));
}

function getBaseData() {
  const detailedFixed = parseMoney(ui.qFixedHousing) + parseMoney(ui.qFixedHealth);
  const detailedVar = parseMoney(ui.qVarFood) + parseMoney(ui.qVarLeisure);

  return {
    income: parseMoney(ui.monthlyIncome), otherIncome: parseMoney(ui.otherIncome),
    fixed: detailedFixed > 0 ? detailedFixed : parseMoney(ui.fixedCosts),
    variable: detailedVar > 0 ? detailedVar : parseMoney(ui.variableCosts),
    debts: parseMoney(ui.debts),
    investments: parseMoney(ui.investments),
    reserve: parseMoney(ui.emergencyReserve),
    dependents: Number(ui.dependentsCount.value) || 0,
    school: parseMoney(ui.schoolCosts),
    hasInsurance: ui.hasInsurance.value,
    covAbs: parseMoney(ui.coverageAbsence), covDis: parseMoney(ui.coverageDisability), covCrit: parseMoney(ui.coverageCritical)
  };
}

function calculateModel(d) {
  const totalIncome = d.income + d.otherIncome;
  const essential = d.fixed + d.variable + d.debts + d.school;
  const balance = totalIncome - essential - d.investments;
  const reserveMonths = essential > 0 ? d.reserve / essential : 0;
  const committed = totalIncome > 0 ? (essential / totalIncome) * 100 : 0;
  const ruinRisk = Math.max(0, Math.min(100, (3 - reserveMonths) * 25 + (committed - 60) * 1.1));
  return { totalIncome, essential, balance, reserveMonths, committed, ruinRisk };
}

function interpretSituation(d, m) {
  let status = 'green';
  if (m.balance < 0 || m.reserveMonths < 1) status = 'red';
  else if (m.reserveMonths < 3 || m.committed > 70) status = 'yellow';

  const reasons = [];
  if (m.balance < 0) reasons.push('Hoje suas saídas estão maiores do que suas entradas.');
  else reasons.push('Você ainda mantém saldo mensal positivo.');
  reasons.push(`Sua reserva sustenta cerca de ${m.reserveMonths.toFixed(1)} meses do seu custo necessário.`);
  reasons.push(`Seu custo necessário consome ${m.committed.toFixed(1)}% da renda total.`);

  let line = 'Sua estrutura está saudável e com boa margem.';
  if (status === 'yellow') line = 'Sua estrutura está em atenção: há pontos de pressão no orçamento.';
  if (status === 'red') line = 'Sua estrutura está apertada e pede ajustes imediatos.';

  const text = status === 'red'
    ? 'Hoje você está mais exposto do que parece. Sem ajustes, qualquer imprevisto tende a gerar dívida.'
    : status === 'yellow'
      ? 'Você está em um ponto de alerta. Pequenas mudanças agora evitam pressão maior nos próximos meses.'
      : 'Você está em um ponto confortável. O próximo passo é proteger essa estabilidade.';

  return { status, line, reasons: reasons.slice(0, 3), text };
}

function buildPriorities(d, m) {
  const priorities = [];
  if (m.reserveMonths < 3) priorities.push('Aumente sua reserva para pelo menos 3 meses de custo necessário.');
  if (m.committed > 60) priorities.push('Reduza custos fixos e essenciais que estão pressionando sua renda.');
  if (m.balance < 0) priorities.push('Evite novos compromissos e corte supérfluos já neste mês.');

  if (state.maturity === 'Iniciante') priorities.push('Anote gastos semanais para descobrir vazamentos do orçamento.');
  if (state.maturity === 'Intermediário') priorities.push('Defina limite mensal para gastos variáveis e acompanhe por categoria.');
  if (state.maturity === 'Avançado') priorities.push('Otimize a alocação entre segurança, liquidez e crescimento sem perder proteção.');

  if (d.hasInsurance !== 'yes' && d.dependents > 0) priorities.push('Priorize proteção de renda por ter dependentes.');
  return priorities.slice(0, 3);
}

function renderSummaryStatus(result) {
  ui.statusBadge.className = `status ${result.status}`;
  ui.statusBadge.textContent = result.status === 'green' ? 'Saudável' : result.status === 'yellow' ? 'Atenção' : 'Crítico';
  ui.summaryLine.textContent = result.line;
  ui.summaryReasons.innerHTML = result.reasons.map((r) => `<li>${r}</li>`).join('');
  ui.interpretationText.textContent = result.text;
}

function renderMetrics(d, m) {
  ui.mBalance.textContent = fmt(m.balance);
  ui.mReserveMonths.textContent = `${m.reserveMonths.toFixed(1)} meses`;
  ui.mCommitment.textContent = `${m.committed.toFixed(1)}%`;
  ui.mRuin.textContent = m.ruinRisk > 70 ? 'Alto' : m.ruinRisk > 40 ? 'Médio' : 'Baixo';

  const reserveCases = state.maturity === 'Avançado'
    ? [{ n: 'UTI particular (diária)', c: 1330 }, { n: 'Adaptação da casa', c: 15000 }, { n: 'Cirurgia cara', c: 25000 }]
    : [{ n: 'Troca de óleo', c: 325 }, { n: 'Correia + mão de obra', c: 1800 }, { n: 'Consulta + exames', c: 1200 }];

  ui.tipReserveList.innerHTML = reserveCases.map((e) => `<li>${e.n}: ${d.reserve >= e.c ? 'cobre' : 'não cobre'} (${fmt(e.c)})</li>`).join('');
  ui.tipRuinList.innerHTML = reserveCases.map((e) => `<li>${e.n}: impacto de ${(e.c / Math.max(1, d.reserve) * 100).toFixed(0)}% da reserva.</li>`).join('');
}

function lineItem(label, value) { return `<li><span>${label}</span><strong>${fmt(value)}</strong></li>`; }
function renderDistribution(d, m) {
  const discretionary = state.entries.filter((e) => e.type === 'discretionary').reduce((a, e) => a + e.amount, 0);
  const essentialEntry = state.entries.filter((e) => e.type === 'essential').reduce((a, e) => a + e.amount, 0);
  const investEntry = state.entries.filter((e) => e.type === 'contribution').reduce((a, e) => a + e.amount, 0);
  const incomeEntry = state.entries.filter((e) => e.type === 'income').reduce((a, e) => a + e.amount, 0);

  const bars = [
    ['Receitas', m.totalIncome + incomeEntry, '#12b76a'],
    ['Necessários', m.essential + essentialEntry, '#0ea5e9'],
    ['Supérfluos', discretionary, '#8b5cf6'],
    ['Investimentos', d.investments + investEntry, '#2563eb'],
    ['Proteção + dívidas', d.debts, '#f59e0b']
  ];
  const max = Math.max(...bars.map((b) => b[1]), 1);
  ui.summaryBars.innerHTML = bars.map((b) => `<div class="summary-row"><span>${b[0]}</span><div class="summary-track"><div class="summary-fill" style="width:${(b[1]/max)*100}%;background:${b[2]}"></div></div><strong>${fmt(b[1])}</strong></div>`).join('');

  ui.listIncome.innerHTML = [lineItem('Salário', d.income), lineItem('Outras receitas', d.otherIncome), lineItem('Entradas lançadas', incomeEntry)].join('');
  ui.listEssential.innerHTML = [lineItem('Custos fixos/necessários', d.fixed), lineItem('Custos variáveis necessários', d.variable), lineItem('Escolares', d.school), lineItem('Necessários lançados', essentialEntry)].join('');
  ui.listDiscretionary.innerHTML = [lineItem('Supérfluos lançados', discretionary)].join('');
  ui.listInvest.innerHTML = [lineItem('Aporte base', d.investments), lineItem('Aportes lançados', investEntry)].join('');
  ui.listProtection.innerHTML = [lineItem('Dívidas', d.debts)].join('');
}

function renderProtection(d, m) {
  const annual = (d.income + d.otherIncome) * 12;
  const needs = { abs: annual * 5, dis: annual * 10, crit: annual * 2 };
  if (d.hasInsurance !== 'yes') {
    ui.coverageWrap.classList.add('hidden');
    ui.protectionCta.classList.remove('hidden');
    ui.insuranceText.textContent = `Sem proteção informada. Você está exposto principalmente se sua renda parar por 1 a 3 meses.`;
    return;
  }
  ui.coverageWrap.classList.remove('hidden');
  ui.protectionCta.classList.add('hidden');
  const gapAbs = Math.max(0, needs.abs - d.covAbs);
  const gapDis = Math.max(0, needs.dis - d.covDis);
  const gapCrit = Math.max(0, needs.crit - d.covCrit);
  ui.insuranceText.textContent = `Lacunas estimadas: ausência ${fmt(gapAbs)}, invalidez ${fmt(gapDis)} e doenças graves ${fmt(gapCrit)}.`;
}

function renderEntriesAndScenarios(m, d) {
  if (!state.entries.length) {
    ui.entryList.innerHTML = '<li class="small">Nenhum lançamento ainda.</li>';
  } else {
    ui.entryList.innerHTML = state.entries.map((e, i) => `<li class="entry-item"><div><strong>${e.description || 'Sem descrição'}</strong><div class="entry-meta">${e.category} • ${e.frequency === 'recurring' ? 'Recorrente' : 'Único'}</div></div><div><strong>${fmt(e.amount)}</strong> <button class="delete" data-i="${i}" type="button">Excluir</button></div></li>`).join('');
    ui.entryList.querySelectorAll('.delete').forEach((btn) => btn.addEventListener('click', () => { state.entries.splice(Number(btn.dataset.i), 1); renderAll(); }));
  }

  const recurringNet = state.entries.filter((e) => e.frequency === 'recurring').reduce((acc, e) => acc + (e.type === 'income' ? e.amount : -e.amount), 0);
  const oneOff = state.entries.filter((e) => e.frequency === 'oneoff').reduce((acc, e) => acc + (e.type === 'income' ? e.amount : -e.amount), 0);
  const scenarios = [
    ['Conservador', 1, 1.15],
    ['Realista', 1, 1],
    ['Pressionado', 0.8, 1.2]
  ];
  ui.scenarioGrid.innerHTML = scenarios.map(([name, iAdj, eAdj]) => {
    const flow = (m.balance * iAdj / eAdj) + recurringNet;
    const reserve12 = d.reserve + flow * 12 + oneOff;
    return `<article class="scenario"><h4>${name}</h4><p class="small">Projeção mensal: ${fmt(flow)}</p><p class="small">Reserva em 12 meses: ${fmt(reserve12)}</p></article>`;
  }).join('');
}

function validateRequired(d) {
  ui.inlineError.textContent = '';
  if (d.dependents > 0 && d.school <= 0) {
    ui.inlineError.textContent = 'Como você tem dependentes, informe os custos escolares para melhorar a precisão.';
    return false;
  } else {
    ui.advancedCostFields.classList.add('hidden');
  }
  return true;
}

function renderAll() {
  const data = getBaseData();
  ui.schoolCostsWrap.classList.toggle('hidden', data.dependents === 0);
  if (!validateRequired(data)) return;

  const model = calculateModel(data);
  const interpretation = interpretSituation(data, model);
  renderSummaryStatus(interpretation);
  ui.priorityList.innerHTML = buildPriorities(data, model).map((p) => `<li>${p}</li>`).join('');
  renderMetrics(data, model);
  renderDistribution(data, model);
  renderProtection(data, model);
  renderEntriesAndScenarios(model, data);
}

function seedFromOnboarding() {
  ui.onboardingFeedback.textContent = '';
  if (ui.qHasDependents.value === 'yes' && parseMoney(ui.qSchool) <= 0) {
    ui.onboardingFeedback.textContent = 'Se você tem dependentes, informe custos escolares para continuar.';
    return false;
  }

  setMaturity(ui.qTrack.value);
  setMoney(ui.monthlyIncome, parseMoney(ui.qIncome));
  setMoney(ui.fixedCosts, parseMoney(ui.qFixed));
  setMoney(ui.variableCosts, parseMoney(ui.qVariable));
  ui.dependentsCount.value = ui.qHasDependents.value === 'yes' ? 1 : 0;
  setMoney(ui.schoolCosts, parseMoney(ui.qSchool));
  setMoney(ui.emergencyReserve, parseMoney(ui.qReserve));
  ui.hasInsurance.value = ui.qHasInsurance.value;

  if (ui.qTrack.value === 'sometimes' || ui.qTrack.value === 'often') {
    setMoney(ui.qFixedHousing, parseMoney(ui.qFixedHousing));
    setMoney(ui.qFixedHealth, parseMoney(ui.qFixedHealth));
    setMoney(ui.qVarFood, parseMoney(ui.qVarFood));
    setMoney(ui.qVarLeisure, parseMoney(ui.qVarLeisure));
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

function initOnboardingBehaviour() {
  ui.qTrack.addEventListener('change', () => setMaturity(ui.qTrack.value));
  ui.qHasDependents.addEventListener('change', () => ui.qSchoolWrap.classList.toggle('hidden', ui.qHasDependents.value !== 'yes'));
  setMaturity(ui.qTrack.value);
}

function initEntries() {
  ui.entryCategory.innerHTML = ENTRY_CATEGORIES[ui.entryType.value].map((c) => `<option>${c}</option>`).join('');
  ui.entryType.addEventListener('change', () => {
    ui.entryCategory.innerHTML = ENTRY_CATEGORIES[ui.entryType.value].map((c) => `<option>${c}</option>`).join('');
  });

  ui.addEntry.addEventListener('click', () => {
    ui.entryFeedback.textContent = '';
    const amount = parseMoney(ui.entryAmount);
    if (amount <= 0) {
      ui.entryFeedback.textContent = 'Informe um valor válido para o lançamento.';
      return;
    }
    state.entries.unshift({
      type: ui.entryType.value,
      category: ui.entryCategory.value,
      description: ui.entryDescription.value.trim(),
      frequency: ui.entryFrequency.value,
      amount
    });
    setMoney(ui.entryAmount, 0);
    ui.entryDescription.value = '';
    renderAll();
  });

  ui.resetEntries.addEventListener('click', () => { state.entries = []; renderAll(); });
}

async function init() {
  await fetch('/api/config');
  bindMoneyMasks();
  ui.loadingState.classList.add('hidden');
  ui.onboarding.classList.remove('hidden');

  ui.quickStart.addEventListener('click', () => {
    ui.onboarding.classList.add('hidden');
    ui.panel.classList.remove('hidden');
    renderAll();
  });

  ui.openPanel.addEventListener('click', () => {
    if (!seedFromOnboarding()) return;
    ui.onboarding.classList.add('hidden');
    ui.panel.classList.remove('hidden');
    renderAll();
  });

  ui.toggleMethodology.addEventListener('click', () => ui.methodology.classList.toggle('hidden'));
  [ui.monthlyIncome, ui.otherIncome, ui.fixedCosts, ui.variableCosts, ui.debts, ui.investments, ui.emergencyReserve, ui.schoolCosts, ui.coverageAbsence, ui.coverageDisability, ui.coverageCritical, ui.hasInsurance, ui.dependentsCount].forEach((f) => {
    f.addEventListener('input', () => !ui.panel.classList.contains('hidden') && renderAll());
    f.addEventListener('change', () => !ui.panel.classList.contains('hidden') && renderAll());
  });

  initOnboardingBehaviour();
  initEntries();
}

init();
