const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const ENTRY_CATEGORIES = {
  income: ['Salário', 'Freelancer', 'Comissão', 'Renda extra', 'Aluguel recebido', 'Outros'],
  expense: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Impostos', 'Outros']
};

const defaultData = {
  monthlyIncome: 6500,
  extraIncome: 500,
  fixedCosts: 2600,
  variableCosts: 1200,
  debts: 600,
  investments: 700,
  emergencyReserve: 9000,
  dependentsCount: 0,
  dependentsIncomeProfile: 'none_work',
  schoolCosts: 0,
  hasInsurance: 'no',
  coverageAbsence: 0,
  coverageDisability: 0,
  coverageCritical: 0
};
const HORIZONS = [1, 3, 6, 12, 24];
const state = { entries: [] };

const fields = {
  monthlyIncome: document.getElementById('monthlyIncome'),
  extraIncome: document.getElementById('extraIncome'),
  fixedCosts: document.getElementById('fixedCosts'),
  variableCosts: document.getElementById('variableCosts'),
  debts: document.getElementById('debts'),
  investments: document.getElementById('investments'),
  emergencyReserve: document.getElementById('emergencyReserve'),
  dependentsCount: document.getElementById('dependentsCount'),
  dependentsIncomeProfile: document.getElementById('dependentsIncomeProfile'),
  schoolCosts: document.getElementById('schoolCosts'),
  hasInsurance: document.getElementById('hasInsurance'),
  coverageAbsence: document.getElementById('coverageAbsence'),
  coverageDisability: document.getElementById('coverageDisability'),
  coverageCritical: document.getElementById('coverageCritical'),
  entryType: document.getElementById('entryType'),
  entryCategory: document.getElementById('entryCategory'),
  entryDescription: document.getElementById('entryDescription'),
  entryAmount: document.getElementById('entryAmount')
};

const ui = {
  loadingState: document.getElementById('loadingState'),
  onboardingCard: document.getElementById('onboardingCard'),
  appContent: document.getElementById('appContent'),
  schoolCostsWrapper: document.getElementById('schoolCostsWrapper'),
  coverageFields: document.getElementById('coverageFields'),
  monthlyBalance: document.getElementById('monthlyBalance'),
  totalIncome: document.getElementById('totalIncome'),
  totalExpenses: document.getElementById('totalExpenses'),
  investingValue: document.getElementById('investingValue'),
  emergencyMonths: document.getElementById('emergencyMonths'),
  healthIndicator: document.getElementById('healthIndicator'),
  budgetSlackFill: document.getElementById('budgetSlackFill'),
  budgetSlackText: document.getElementById('budgetSlackText'),
  liquidityFill: document.getElementById('liquidityFill'),
  liquidityText: document.getElementById('liquidityText'),
  incomePie: document.getElementById('incomePie'),
  insightsList: document.getElementById('insightsList'),
  protectionCard: document.getElementById('protectionCard'),
  protectionMessage: document.getElementById('protectionMessage'),
  protectionCta: document.getElementById('protectionCta'),
  absenceBar: document.getElementById('absenceBar'),
  disabilityBar: document.getElementById('disabilityBar'),
  criticalBar: document.getElementById('criticalBar'),
  absenceGapLabel: document.getElementById('absenceGapLabel'),
  disabilityGapLabel: document.getElementById('disabilityGapLabel'),
  criticalGapLabel: document.getElementById('criticalGapLabel'),
  insuranceNeedSummary: document.getElementById('insuranceNeedSummary'),
  entriesList: document.getElementById('entriesList'),
  cashflowCards: document.getElementById('cashflowCards'),
  futureBar1: document.getElementById('futureBar1'),
  futureBar3: document.getElementById('futureBar3'),
  futureBar6: document.getElementById('futureBar6'),
  futureBar12: document.getElementById('futureBar12'),
  futureBar24: document.getElementById('futureBar24'),
  projectionNarrative: document.getElementById('projectionNarrative'),
  addEntryBtn: document.getElementById('addEntryBtn'),
  resetEntriesBtn: document.getElementById('resetEntriesBtn'),
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  qControl: document.getElementById('qControl'),
  qBudget: document.getElementById('qBudget'),
  qIncome: document.getElementById('qIncome'),
  qFixedCosts: document.getElementById('qFixedCosts'),
  qDependents: document.getElementById('qDependents'),
  qSchoolCostsWrapper: document.getElementById('qSchoolCostsWrapper'),
  qSchoolCosts: document.getElementById('qSchoolCosts'),
  startExperienceBtn: document.getElementById('startExperienceBtn'),
  profileResult: document.getElementById('profileResult')
};

function onlyDigits(v) { return String(v || '').replace(/\D/g, ''); }
function formatMoneyFromDigits(digits) {
  const n = Number(digits || 0) / 100;
  return BRL.format(n);
}
function parseMoney(inputEl) {
  const digits = onlyDigits(inputEl.value);
  return Number(digits || 0) / 100;
}
function setMoneyValue(inputEl, amount) {
  inputEl.value = BRL.format(Number(amount || 0));
}

function bindMoneyMasks() {
  document.querySelectorAll('.money-input').forEach((input) => {
    input.addEventListener('input', () => {
      const digits = onlyDigits(input.value);
      input.value = formatMoneyFromDigits(digits);
      render();
    });
    if (!input.value) input.value = BRL.format(0);
  });
}

function populateEntryCategories() {
  const type = fields.entryType.value;
  fields.entryCategory.innerHTML = (ENTRY_CATEGORIES[type] || []).map((c) => `<option value="${c}">${c}</option>`).join('');
}

function getFormData() {
  return {
    monthlyIncome: parseMoney(fields.monthlyIncome),
    extraIncome: parseMoney(fields.extraIncome),
    fixedCosts: parseMoney(fields.fixedCosts),
    variableCosts: parseMoney(fields.variableCosts),
    debts: parseMoney(fields.debts),
    investments: parseMoney(fields.investments),
    emergencyReserve: parseMoney(fields.emergencyReserve),
    dependentsCount: Number(fields.dependentsCount.value) || 0,
    dependentsIncomeProfile: fields.dependentsIncomeProfile.value,
    schoolCosts: parseMoney(fields.schoolCosts),
    hasInsurance: fields.hasInsurance.value,
    coverageAbsence: parseMoney(fields.coverageAbsence),
    coverageDisability: parseMoney(fields.coverageDisability),
    coverageCritical: parseMoney(fields.coverageCritical)
  };
}

function calculateMetrics(data) {
  const totalIncome = data.monthlyIncome + data.extraIncome;
  const essentialExpenses = data.fixedCosts + data.variableCosts + data.debts + data.schoolCosts;
  const balanceBeforeInvest = totalIncome - essentialExpenses;
  const monthlyBalance = balanceBeforeInvest - data.investments;
  const emergencyMonths = essentialExpenses > 0 ? data.emergencyReserve / essentialExpenses : 0;
  const budgetSlack = totalIncome > 0 ? (monthlyBalance / totalIncome) * 100 : 0;
  const commitment = totalIncome > 0 ? (essentialExpenses / totalIncome) * 100 : 0;
  return { totalIncome, essentialExpenses, monthlyBalance, emergencyMonths, budgetSlack, commitment };
}

function healthStatus(m) {
  if (m.monthlyBalance < 0 || m.emergencyMonths < 1) return { label: 'Crítica', className: 'status status--danger' };
  if (m.budgetSlack < 10 || m.emergencyMonths < 3) return { label: 'Atenção', className: 'status status--warning' };
  return { label: 'Saudável', className: 'status status--success' };
}

function renderPrimaryCharts(data, m) {
  ui.budgetSlackFill.style.width = `${Math.max(0, Math.min(100, ((m.budgetSlack + 30) / 70) * 100))}%`;
  ui.budgetSlackText.textContent = `Folga orçamentária atual: ${m.budgetSlack.toFixed(1)}%.`;

  ui.liquidityFill.style.width = `${Math.max(0, Math.min(100, (m.emergencyMonths / 6) * 100))}%`;
  ui.liquidityText.textContent = `Liquidez: ${m.emergencyMonths.toFixed(1)} meses.`;

  const total = Math.max(m.totalIncome, 1);
  const expensesPct = Math.max(0, Math.min(100, (m.essentialExpenses / total) * 100));
  const investPct = Math.max(0, Math.min(100 - expensesPct, (data.investments / total) * 100));
  ui.incomePie.style.background = `conic-gradient(#f29a3c 0 ${expensesPct}%, #4f7cff ${expensesPct}% ${expensesPct + investPct}%, #33b27f ${expensesPct + investPct}% 100%)`;
}

function calculateInsuranceNeeds(data) {
  const annual = data.monthlyIncome * 12;
  const depAdj = data.dependentsCount > 0 ? 1 + (data.dependentsIncomeProfile === 'none_work' ? 0.4 : data.dependentsIncomeProfile === 'some_work' ? 0.2 : 0.1) : 1;
  const schoolAnnual = data.schoolCosts * 12;
  return {
    absenceNeed: annual * 5 * depAdj + schoolAnnual * 5,
    disabilityNeed: annual * 10 * depAdj + schoolAnnual * 10,
    criticalNeed: annual * 2 * depAdj + schoolAnnual * 2
  };
}

function renderCoverageBar(fill, label, need, current) {
  const gap = Math.max(0, need - current);
  const pct = need > 0 ? Math.min(100, (current / need) * 100) : 0;
  fill.style.width = `${pct}%`;
  label.textContent = gap > 0 ? `${BRL.format(gap)} de diferença` : 'Cobertura adequada pela referência';
}

function renderInsurance(data, m) {
  const needs = calculateInsuranceNeeds(data);
  const hasInsurance = data.hasInsurance === 'yes';

  renderCoverageBar(ui.absenceBar, ui.absenceGapLabel, needs.absenceNeed, hasInsurance ? data.coverageAbsence : 0);
  renderCoverageBar(ui.disabilityBar, ui.disabilityGapLabel, needs.disabilityNeed, hasInsurance ? data.coverageDisability : 0);
  renderCoverageBar(ui.criticalBar, ui.criticalGapLabel, needs.criticalNeed, hasInsurance ? data.coverageCritical : 0);

  if (!hasInsurance) {
    const urgency = Math.min(100, Math.max(40, 100 - m.emergencyMonths * 12 + m.commitment * 0.4));
    ui.protectionMessage.textContent = `Você precisa de proteção. Prioridade de contratação no curtíssimo prazo: ${urgency.toFixed(0)} / 100.`;
    ui.protectionCard.style.borderLeftColor = '#f59e0b';
    ui.protectionCta.classList.remove('hidden');
  } else {
    ui.protectionMessage.textContent = 'Sua cobertura foi avaliada por tipo. Ajuste cada cobertura para acompanhar o nível recomendado.';
    ui.protectionCard.style.borderLeftColor = '#12b76a';
    ui.protectionCta.classList.add('hidden');
  }

  ui.insuranceNeedSummary.textContent = `Referência: ausência 5x renda anual, invalidez 10x, doenças graves 2x (ajustada por dependentes/custos escolares).`;
}

function renderEntriesList() {
  if (!state.entries.length) {
    ui.entriesList.innerHTML = '<li class="empty">Nenhuma movimentação adicionada.</li>';
    return;
  }

  ui.entriesList.innerHTML = state.entries.map((entry, i) => `
    <li class="entry-item">
      <div><strong>${entry.description}</strong><span class="entry-meta">${entry.category} • ${entry.type === 'income' ? 'Entrada' : 'Saída'}</span></div>
      <div class="entry-actions"><strong class="${entry.type}">${entry.type === 'income' ? '+' : '-'} ${BRL.format(entry.amount)}</strong><button type="button" class="entry-delete" data-index="${i}">Excluir</button></div>
    </li>`).join('');

  ui.entriesList.querySelectorAll('.entry-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.entries.splice(Number(btn.dataset.index), 1);
      render();
    });
  });
}

function projectionPressure(reserve, essential, income) {
  const safe = Math.max(0, reserve / 12);
  return Math.max(0, Math.min(100, ((essential - safe) / Math.max(1, income)) * 100));
}

function renderCashflowProjection(data, m) {
  const entriesNet = state.entries.reduce((acc, e) => acc + (e.type === 'income' ? e.amount : -e.amount), 0);
  const monthFlow = m.monthlyBalance + entriesNet;

  const rows = HORIZONS.map((h) => {
    const reserveProjected = data.emergencyReserve + monthFlow * h;
    const pressure = projectionPressure(reserveProjected, m.essentialExpenses, m.totalIncome);
    return { h, reserveProjected, pressure };
  });

  ui.cashflowCards.innerHTML = rows.map((r) => `<div class="projection-card"><p>${r.h} ${r.h === 1 ? 'mês' : 'meses'}</p><strong>${BRL.format(r.reserveProjected)}</strong></div>`).join('');
  ui.futureBar1.style.width = `${rows[0].pressure}%`;
  ui.futureBar3.style.width = `${rows[1].pressure}%`;
  ui.futureBar6.style.width = `${rows[2].pressure}%`;
  ui.futureBar12.style.width = `${rows[3].pressure}%`;
  ui.futureBar24.style.width = `${rows[4].pressure}%`;

  ui.projectionNarrative.textContent = `Cálculo: reserva projetada = reserva atual + (saldo livre mensal + lançamentos) x horizonte. Pressão = relação entre despesas essenciais e capacidade financeira projetada.`;
}

function validateDependentFields(data) {
  const hasDeps = data.dependentsCount > 0;
  ui.schoolCostsWrapper.classList.toggle('hidden', !hasDeps);
  fields.schoolCosts.required = hasDeps;
  if (hasDeps && data.schoolCosts <= 0) {
    fields.schoolCosts.setCustomValidity('Informe os custos escolares para dependentes.');
  } else {
    fields.schoolCosts.setCustomValidity('');
  }
}

function buildInsights(data, m) {
  const insights = [
    `Comprometimento atual de renda com despesas essenciais: ${m.commitment.toFixed(1)}%.`,
    `Investimentos são exibidos separadamente: ${BRL.format(data.investments)} por mês.`
  ];
  if (data.hasInsurance === 'no') insights.push('Sem seguro ativo: prioridade em estruturar proteção mínima por cobertura.');
  return insights;
}

function render() {
  const data = getFormData();
  validateDependentFields(data);
  ui.coverageFields.classList.toggle('hidden', data.hasInsurance !== 'yes');
  const form = document.getElementById('financeForm');
  if (form && !form.checkValidity()) return;

  const m = calculateMetrics(data);
  const health = healthStatus(m);

  ui.totalIncome.textContent = BRL.format(m.totalIncome);
  ui.totalExpenses.textContent = BRL.format(m.essentialExpenses);
  ui.investingValue.textContent = BRL.format(data.investments);
  ui.monthlyBalance.textContent = BRL.format(m.monthlyBalance);
  ui.emergencyMonths.textContent = m.emergencyMonths.toFixed(1);
  ui.healthIndicator.className = health.className;
  ui.healthIndicator.textContent = health.label;

  renderPrimaryCharts(data, m);
  renderInsurance(data, m);
  ui.insightsList.innerHTML = buildInsights(data, m).map((i) => `<li>${i}</li>`).join('');
  renderEntriesList();
  renderCashflowProjection(data, m);
}

function addEntry() {
  const amount = parseMoney(fields.entryAmount);
  const description = fields.entryDescription.value.trim();
  if (!description || amount <= 0) return alert('Preencha descrição e valor válido.');
  state.entries.unshift({
    type: fields.entryType.value,
    category: fields.entryCategory.value,
    description,
    amount
  });
  setMoneyValue(fields.entryAmount, 0);
  fields.entryDescription.value = '';
  render();
}

function setupTabs() {
  ui.tabButtons.forEach((b) => b.addEventListener('click', () => {
    ui.tabButtons.forEach((btn) => btn.classList.remove('active'));
    b.classList.add('active');
    ui.tabPanels.forEach((p) => p.classList.toggle('active', p.id === b.dataset.tab));
  }));
}

function profileFromOnboarding() {
  let score = 0;
  score += ui.qControl.value === 'high' ? 2 : ui.qControl.value === 'mid' ? 1 : 0;
  score += ui.qBudget.value === 'high' ? 2 : ui.qBudget.value === 'mid' ? 1 : 0;
  if (score <= 1) return 'Iniciante';
  if (score <= 3) return 'Moderado';
  return 'Avançado';
}

function applyOnboarding() {
  const deps = Number(ui.qDependents.value) || 0;
  const school = parseMoney(ui.qSchoolCosts);
  if (deps > 0 && school <= 0) return alert('Para dependentes, informe custos escolares.'), false;

  setMoneyValue(fields.monthlyIncome, parseMoney(ui.qIncome));
  setMoneyValue(fields.fixedCosts, parseMoney(ui.qFixedCosts));
  fields.dependentsCount.value = deps;
  setMoneyValue(fields.schoolCosts, school);
  ui.profileResult.textContent = `Perfil identificado: ${profileFromOnboarding()}.`;
  return true;
}

async function init() {
  await fetch('/api/config');

  Object.entries(defaultData).forEach(([k, v]) => {
    if (!fields[k]) return;
    if (typeof v === 'number' && fields[k].classList.contains('money-input')) setMoneyValue(fields[k], v);
    else fields[k].value = v;
  });
  setMoneyValue(ui.qIncome, defaultData.monthlyIncome);
  setMoneyValue(ui.qFixedCosts, defaultData.fixedCosts);
  setMoneyValue(ui.qSchoolCosts, 0);

  bindMoneyMasks();
  populateEntryCategories();

  ui.loadingState.classList.add('hidden');
  ui.onboardingCard.classList.remove('hidden');

  ui.qDependents.addEventListener('input', () => ui.qSchoolCostsWrapper.classList.toggle('hidden', (Number(ui.qDependents.value) || 0) === 0));
  ui.startExperienceBtn.addEventListener('click', () => {
    if (!applyOnboarding()) return;
    ui.onboardingCard.classList.add('hidden');
    ui.appContent.classList.remove('hidden');
    setupTabs();
    render();
  });

  fields.entryType.addEventListener('change', populateEntryCategories);
  [fields.dependentsCount, fields.dependentsIncomeProfile, fields.hasInsurance].forEach((f) => {
    f.addEventListener('input', render);
    f.addEventListener('change', render);
  });

  ui.addEntryBtn.addEventListener('click', addEntry);
  ui.resetEntriesBtn.addEventListener('click', () => { state.entries = []; render(); });
  ui.protectionCta.addEventListener('click', () => window.open('https://wa.me/5511995488859', '_blank'));
}

init();
