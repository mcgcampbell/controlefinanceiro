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
  insuranceCoverage: 0
};

const state = { entries: [], onboardingDone: false };

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
  insuranceCoverage: document.getElementById('insuranceCoverage'),
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
  coverageField: document.getElementById('coverageField'),
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
  projectionShort: document.getElementById('projectionShort'),
  projectionMedium: document.getElementById('projectionMedium'),
  projectionLong: document.getElementById('projectionLong'),
  futureBarShort: document.getElementById('futureBarShort'),
  futureBarMedium: document.getElementById('futureBarMedium'),
  futureBarLong: document.getElementById('futureBarLong'),
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

const numberValue = (input) => Number(input.value) || 0;

function populateEntryCategories() {
  const type = fields.entryType.value;
  const categories = ENTRY_CATEGORIES[type] || [];
  fields.entryCategory.innerHTML = categories.map((c) => `<option value="${c}">${c}</option>`).join('');
}

function getFormData() {
  return {
    monthlyIncome: numberValue(fields.monthlyIncome),
    extraIncome: numberValue(fields.extraIncome),
    fixedCosts: numberValue(fields.fixedCosts),
    variableCosts: numberValue(fields.variableCosts),
    debts: numberValue(fields.debts),
    investments: numberValue(fields.investments),
    emergencyReserve: numberValue(fields.emergencyReserve),
    dependentsCount: numberValue(fields.dependentsCount),
    dependentsIncomeProfile: fields.dependentsIncomeProfile.value,
    schoolCosts: numberValue(fields.schoolCosts),
    hasInsurance: fields.hasInsurance.value,
    insuranceCoverage: numberValue(fields.insuranceCoverage)
  };
}

function calculateMetrics(data) {
  const totalIncome = data.monthlyIncome + data.extraIncome;
  const essentialExpenses = data.fixedCosts + data.variableCosts + data.debts + data.schoolCosts;
  const freeAfterEssentials = totalIncome - essentialExpenses;
  const monthlyBalance = freeAfterEssentials - data.investments;
  const emergencyMonths = essentialExpenses > 0 ? data.emergencyReserve / essentialExpenses : 0;
  const budgetSlack = totalIncome > 0 ? (monthlyBalance / totalIncome) * 100 : 0;
  const commitment = totalIncome > 0 ? (essentialExpenses / totalIncome) * 100 : 0;

  return { totalIncome, essentialExpenses, freeAfterEssentials, monthlyBalance, emergencyMonths, budgetSlack, commitment };
}

function healthStatus(metrics) {
  if (metrics.monthlyBalance < 0 || metrics.emergencyMonths < 1) return { label: 'Crítica', className: 'status status--danger' };
  if (metrics.budgetSlack < 10 || metrics.emergencyMonths < 3) return { label: 'Atenção', className: 'status status--warning' };
  return { label: 'Saudável', className: 'status status--success' };
}

function renderBudgetAndLiquidity(metrics) {
  const slack = Math.max(-30, Math.min(40, metrics.budgetSlack));
  ui.budgetSlackFill.style.width = `${((slack + 30) / 70) * 100}%`;
  ui.budgetSlackText.textContent = metrics.budgetSlack >= 20
    ? `Folga muito boa (${metrics.budgetSlack.toFixed(1)}%).`
    : metrics.budgetSlack >= 10
      ? `Folga adequada (${metrics.budgetSlack.toFixed(1)}%).`
      : metrics.budgetSlack >= 0
        ? `Folga baixa (${metrics.budgetSlack.toFixed(1)}%).`
        : `Sem folga orçamentária (${metrics.budgetSlack.toFixed(1)}%).`;

  const liquidityRatio = Math.max(0, Math.min(100, (metrics.emergencyMonths / 6) * 100));
  ui.liquidityFill.style.width = `${liquidityRatio}%`;
  ui.liquidityText.textContent = `Liquidez estimada: ${metrics.emergencyMonths.toFixed(1)} meses de despesas essenciais.`;
}

function renderPie(metrics, data) {
  const total = Math.max(metrics.totalIncome, 1);
  const expensePct = Math.max(0, Math.min(100, (metrics.essentialExpenses / total) * 100));
  const investPct = Math.max(0, Math.min(100 - expensePct, (data.investments / total) * 100));
  const freePct = Math.max(0, 100 - expensePct - investPct);

  ui.incomePie.style.background = `conic-gradient(#f08c2d 0 ${expensePct}%, #4f7cff ${expensePct}% ${expensePct + investPct}%, #55b67d ${expensePct + investPct}% 100%)`;
}

function calculateInsuranceNeeds(data) {
  const annualIncome = data.monthlyIncome * 12;
  const schoolAnnual = data.schoolCosts * 12;

  return {
    absenceNeed: annualIncome * 5 + schoolAnnual * 5,
    disabilityNeed: annualIncome * 10 + schoolAnnual * 10,
    criticalNeed: annualIncome * 2 + schoolAnnual * 2
  };
}

function renderCoverageBar(bar, label, need, coverage) {
  const pct = need > 0 ? Math.min(100, (coverage / need) * 100) : 0;
  const gap = Math.max(0, need - coverage);
  bar.style.width = `${pct}%`;
  label.textContent = gap > 0 ? `${BRL.format(gap)} de diferença` : 'Cobertura suficiente pela referência';
}

function renderInsuranceNeeds(data) {
  const needs = calculateInsuranceNeeds(data);
  const coverage = data.hasInsurance === 'yes' ? data.insuranceCoverage : 0;

  renderCoverageBar(ui.absenceBar, ui.absenceGapLabel, needs.absenceNeed, coverage);
  renderCoverageBar(ui.disabilityBar, ui.disabilityGapLabel, needs.disabilityNeed, coverage);
  renderCoverageBar(ui.criticalBar, ui.criticalGapLabel, needs.criticalNeed, coverage);

  ui.insuranceNeedSummary.textContent = `Referências por renda anual: ausência 5x, invalidez 10x, doenças graves 2x. Cobertura atual considerada: ${BRL.format(coverage)}.`;
}

function buildInsights(data, metrics) {
  const insights = [];
  if (metrics.commitment > 80) insights.push('Seu comprometimento da renda com despesas essenciais está alto.');
  else insights.push('Seu comprometimento de renda está em faixa administrável.');

  insights.push(`Investimentos aparecem separados das despesas: aporte atual de ${BRL.format(data.investments)}.`);
  insights.push(`Reserva atual cobre ${metrics.emergencyMonths.toFixed(1)} meses de despesas essenciais.`);

  if (data.dependentsCount > 0 && data.schoolCosts <= 0) insights.push('Preencha custos escolares para refinar a análise com dependentes.');

  return insights;
}

function renderProtection(data) {
  if (data.hasInsurance === 'no') {
    ui.protectionMessage.textContent = 'Sem seguro informado: use a pré-análise para entender referências de cobertura pela sua renda.';
    ui.protectionCard.style.borderLeftColor = '#fdb022';
    ui.protectionCta.classList.remove('hidden');
  } else {
    ui.protectionMessage.textContent = `Cobertura atual informada: ${BRL.format(data.insuranceCoverage)}.`; 
    ui.protectionCard.style.borderLeftColor = '#12b76a';
    ui.protectionCta.classList.add('hidden');
  }
}

function renderEntryList() {
  if (state.entries.length === 0) {
    ui.entriesList.innerHTML = '<li class="empty">Nenhuma movimentação adicionada ainda.</li>';
    return;
  }

  ui.entriesList.innerHTML = state.entries.map((item, index) => `
    <li class="entry-item">
      <div>
        <strong>${item.description}</strong>
        <span class="entry-meta">${item.category} • ${item.type === 'income' ? 'Entrada' : 'Saída'} recorrente mensal</span>
      </div>
      <div class="entry-actions">
        <strong class="${item.type}">${item.type === 'income' ? '+' : '-'} ${BRL.format(item.amount)}</strong>
        <button class="entry-delete" data-index="${index}" type="button">Excluir</button>
      </div>
    </li>
  `).join('');

  ui.entriesList.querySelectorAll('.entry-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      state.entries.splice(idx, 1);
      render();
    });
  });
}

function renderProjection(metrics, data) {
  const entriesNet = state.entries.reduce((acc, item) => acc + (item.type === 'income' ? item.amount : -item.amount), 0);
  const monthResult = metrics.monthlyBalance + entriesNet;

  const short = data.emergencyReserve + monthResult * 3;
  const medium = data.emergencyReserve + monthResult * 12;
  const long = data.emergencyReserve + monthResult * 36;

  ui.projectionShort.textContent = BRL.format(short);
  ui.projectionMedium.textContent = BRL.format(medium);
  ui.projectionLong.textContent = BRL.format(long);

  const totalIncome = Math.max(metrics.totalIncome, 1);
  const commitmentFuture = (reserveValue) => {
    const pressure = Math.max(0, (metrics.essentialExpenses - Math.max(0, reserveValue / 12)) / totalIncome);
    return Math.max(0, Math.min(100, pressure * 100));
  };

  ui.futureBarShort.style.width = `${commitmentFuture(short)}%`;
  ui.futureBarMedium.style.width = `${commitmentFuture(medium)}%`;
  ui.futureBarLong.style.width = `${commitmentFuture(long)}%`;

  ui.projectionNarrative.textContent = monthResult >= 0
    ? 'Com o ritmo atual, a tendência é de manutenção/crescimento da reserva ao longo do tempo.'
    : 'Com o ritmo atual, existe tendência de redução da reserva e maior comprometimento futuro.';
}

function validateDependentFields() {
  const hasDependents = numberValue(fields.dependentsCount) > 0;
  ui.schoolCostsWrapper.classList.toggle('hidden', !hasDependents);
  fields.schoolCosts.required = hasDependents;

  if (hasDependents && numberValue(fields.schoolCosts) <= 0) {
    fields.schoolCosts.setCustomValidity('Preencha os custos escolares quando houver dependentes.');
  } else {
    fields.schoolCosts.setCustomValidity('');
  }
}

function render() {
  const data = getFormData();
  validateDependentFields();
  ui.coverageField.classList.toggle('hidden', data.hasInsurance !== 'yes');
  if (!document.getElementById('financeForm').checkValidity()) return;

  const metrics = calculateMetrics(data);
  const health = healthStatus(metrics);

  ui.totalIncome.textContent = BRL.format(metrics.totalIncome);
  ui.totalExpenses.textContent = BRL.format(metrics.essentialExpenses);
  ui.investingValue.textContent = BRL.format(data.investments);
  ui.monthlyBalance.textContent = BRL.format(metrics.monthlyBalance);
  ui.emergencyMonths.textContent = metrics.emergencyMonths.toFixed(1);
  ui.healthIndicator.className = health.className;
  ui.healthIndicator.textContent = health.label;

  renderBudgetAndLiquidity(metrics);
  renderPie(metrics, data);
  ui.insightsList.innerHTML = buildInsights(data, metrics).map((item) => `<li>${item}</li>`).join('');
  renderProtection(data);
  renderInsuranceNeeds(data);
  renderEntryList();
  renderProjection(metrics, data);
}

function addEntry() {
  const description = fields.entryDescription.value.trim();
  const amount = numberValue(fields.entryAmount);
  if (!description || amount <= 0) {
    alert('Informe descrição e valor maior que zero para adicionar a movimentação.');
    return;
  }

  state.entries.unshift({ description, amount, type: fields.entryType.value, category: fields.entryCategory.value });
  fields.entryDescription.value = '';
  fields.entryAmount.value = '';
  render();
}

function setupTabs() {
  ui.tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      ui.tabButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      const target = button.dataset.tab;
      ui.tabPanels.forEach((panel) => panel.classList.toggle('active', panel.id === target));
    });
  });
}

function calculateProfile() {
  let score = 0;
  if (ui.qControl.value === 'high') score += 2;
  if (ui.qControl.value === 'mid') score += 1;
  if (ui.qBudget.value === 'high') score += 2;
  if (ui.qBudget.value === 'mid') score += 1;

  if (score <= 1) return 'Iniciante';
  if (score <= 3) return 'Moderado';
  return 'Avançado';
}

function applyOnboardingData() {
  const dependents = numberValue(ui.qDependents);
  const schoolCosts = numberValue(ui.qSchoolCosts);

  if (dependents > 0 && schoolCosts <= 0) {
    alert('Para quem tem dependentes, o campo de custos escolares é obrigatório.');
    return false;
  }

  fields.monthlyIncome.value = numberValue(ui.qIncome);
  fields.fixedCosts.value = numberValue(ui.qFixedCosts);
  fields.dependentsCount.value = dependents;
  fields.schoolCosts.value = schoolCosts;

  const profile = calculateProfile();
  ui.profileResult.textContent = `Perfil identificado: ${profile}. Você pode ajustar os valores no painel principal.`;
  return true;
}

async function init() {
  Object.entries(defaultData).forEach(([key, value]) => {
    if (fields[key]) fields[key].value = value;
  });

  ui.qIncome.value = defaultData.monthlyIncome;
  ui.qFixedCosts.value = defaultData.fixedCosts;
  ui.qDependents.value = defaultData.dependentsCount;

  populateEntryCategories();
  await fetch('/api/config');

  ui.loadingState.classList.add('hidden');
  ui.onboardingCard.classList.remove('hidden');

  ui.qDependents.addEventListener('input', () => {
    ui.qSchoolCostsWrapper.classList.toggle('hidden', numberValue(ui.qDependents) === 0);
  });

  ui.startExperienceBtn.addEventListener('click', () => {
    if (!applyOnboardingData()) return;

    state.onboardingDone = true;
    ui.onboardingCard.classList.add('hidden');
    ui.appContent.classList.remove('hidden');
    setupTabs();
    render();
  });

  [
    fields.monthlyIncome,
    fields.extraIncome,
    fields.fixedCosts,
    fields.variableCosts,
    fields.debts,
    fields.investments,
    fields.emergencyReserve,
    fields.dependentsCount,
    fields.dependentsIncomeProfile,
    fields.schoolCosts,
    fields.hasInsurance,
    fields.insuranceCoverage
  ].forEach((field) => {
    field.addEventListener('input', render);
    field.addEventListener('change', render);
  });

  fields.entryType.addEventListener('change', populateEntryCategories);
  ui.addEntryBtn.addEventListener('click', addEntry);
  ui.resetEntriesBtn.addEventListener('click', () => {
    state.entries = [];
    render();
  });

  ui.protectionCta.addEventListener('click', () => {
    alert('Podemos explorar estratégias de proteção adequadas ao seu momento, com foco educativo e sem compromisso.');
  });
}

init();
