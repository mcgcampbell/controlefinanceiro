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
  dependentsCount: 2,
  dependentsIncomeProfile: 'some_work',
  hasInsurance: 'no',
  insuranceCoverage: 0
};

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
  hasInsurance: document.getElementById('hasInsurance'),
  insuranceCoverage: document.getElementById('insuranceCoverage'),
  entryType: document.getElementById('entryType'),
  entryCategory: document.getElementById('entryCategory'),
  entryDescription: document.getElementById('entryDescription'),
  entryAmount: document.getElementById('entryAmount')
};

const ui = {
  loadingState: document.getElementById('loadingState'),
  appContent: document.getElementById('appContent'),
  coverageField: document.getElementById('coverageField'),
  monthlyBalance: document.getElementById('monthlyBalance'),
  totalIncome: document.getElementById('totalIncome'),
  totalExpenses: document.getElementById('totalExpenses'),
  savingsRate: document.getElementById('savingsRate'),
  emergencyMonths: document.getElementById('emergencyMonths'),
  healthIndicator: document.getElementById('healthIndicator'),
  budgetSlackFill: document.getElementById('budgetSlackFill'),
  budgetSlackText: document.getElementById('budgetSlackText'),
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
  projectionNarrative: document.getElementById('projectionNarrative'),
  addEntryBtn: document.getElementById('addEntryBtn'),
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel')
};

const numberValue = (input) => Number(input.value) || 0;

function populateEntryCategories() {
  const type = fields.entryType.value;
  const categories = ENTRY_CATEGORIES[type] || [];
  fields.entryCategory.innerHTML = categories.map((category) => `<option value="${category}">${category}</option>`).join('');
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
    hasInsurance: fields.hasInsurance.value,
    insuranceCoverage: numberValue(fields.insuranceCoverage)
  };
}

function calculateMetrics(data) {
  const totalIncome = data.monthlyIncome + data.extraIncome;
  const totalExpenses = data.fixedCosts + data.variableCosts + data.debts + data.investments;
  const monthlyBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (monthlyBalance / totalIncome) * 100 : 0;
  const baseCost = data.fixedCosts + data.variableCosts;
  const emergencyMonths = baseCost > 0 ? data.emergencyReserve / baseCost : 0;
  const budgetSlack = totalIncome > 0 ? (monthlyBalance / totalIncome) * 100 : 0;

  return { totalIncome, totalExpenses, monthlyBalance, savingsRate, emergencyMonths, budgetSlack };
}

function healthStatus(metrics) {
  if (metrics.monthlyBalance < 0 || metrics.emergencyMonths < 1) return { label: 'Crítica', className: 'status status--danger' };
  if (metrics.savingsRate < 10 || metrics.emergencyMonths < 3) return { label: 'Atenção', className: 'status status--warning' };
  return { label: 'Saudável', className: 'status status--success' };
}

function renderBudgetSlack(metrics) {
  const slackValue = Math.max(-30, Math.min(40, metrics.budgetSlack));
  const meterWidth = ((slackValue + 30) / 70) * 100;
  ui.budgetSlackFill.style.width = `${meterWidth}%`;

  if (metrics.budgetSlack >= 20) ui.budgetSlackText.textContent = `Folga orçamentária muito boa (${metrics.budgetSlack.toFixed(1)}%).`;
  else if (metrics.budgetSlack >= 10) ui.budgetSlackText.textContent = `Folga orçamentária adequada (${metrics.budgetSlack.toFixed(1)}%).`;
  else if (metrics.budgetSlack >= 0) ui.budgetSlackText.textContent = `Folga orçamentária baixa (${metrics.budgetSlack.toFixed(1)}%).`;
  else ui.budgetSlackText.textContent = `Sem folga orçamentária (${metrics.budgetSlack.toFixed(1)}%).`;
}

function insuranceFactorsByDependents(profile) {
  if (profile === 'none_work') return 1.35;
  if (profile === 'some_work') return 1.1;
  return 0.9;
}

function calculateInsuranceNeeds(data) {
  const annualIncome = data.monthlyIncome * 12;
  const depFactor = Math.max(1, data.dependentsCount * 0.35 + insuranceFactorsByDependents(data.dependentsIncomeProfile));

  const absenceNeed = annualIncome * depFactor * 4;
  const disabilityNeed = annualIncome * depFactor * 3 + data.debts * 24;
  const criticalNeed = annualIncome * 1.5 + (data.fixedCosts + data.variableCosts) * 8;

  return { absenceNeed, disabilityNeed, criticalNeed };
}

function renderCoverageBar(barElement, labelElement, needValue, currentCoverage) {
  const ratio = needValue > 0 ? Math.min(100, (currentCoverage / needValue) * 100) : 0;
  barElement.style.width = `${ratio}%`;

  const gap = Math.max(0, needValue - currentCoverage);
  labelElement.textContent = gap > 0 ? `${BRL.format(gap)} para atingir a referência` : 'Cobertura acima da referência';
}

function renderInsuranceNeeds(data) {
  const { absenceNeed, disabilityNeed, criticalNeed } = calculateInsuranceNeeds(data);
  const coverage = data.hasInsurance === 'yes' ? data.insuranceCoverage : 0;

  renderCoverageBar(ui.absenceBar, ui.absenceGapLabel, absenceNeed, coverage);
  renderCoverageBar(ui.disabilityBar, ui.disabilityGapLabel, disabilityNeed, coverage);
  renderCoverageBar(ui.criticalBar, ui.criticalGapLabel, criticalNeed, coverage);

  const reference = Math.max(absenceNeed, disabilityNeed, criticalNeed);
  const gap = Math.max(0, reference - coverage);

  ui.insuranceNeedSummary.textContent = `Referência educativa de cobertura: ${BRL.format(reference)}. Cobertura atual considerada: ${BRL.format(coverage)}. Diferença estimada: ${BRL.format(gap)}.`;
}

function buildInsights(data, metrics) {
  const insights = [];
  const totalIncome = Math.max(metrics.totalIncome, 1);
  const fixedCostRate = (data.fixedCosts / totalIncome) * 100;

  if (fixedCostRate > 50) insights.push('Seu custo fixo está alto para sua renda atual.');
  insights.push(`Sua reserva cobre ${metrics.emergencyMonths.toFixed(1)} meses de despesas essenciais.`);

  if (metrics.monthlyBalance < 0) insights.push('Suas saídas estão acima das entradas neste momento.');
  else insights.push('Você mantém saldo mensal positivo, o que ajuda no planejamento.');

  if (metrics.budgetSlack < 10) insights.push('Sua folga orçamentária está apertada; pequenas reduções de gasto podem gerar margem.');
  else insights.push('Sua folga orçamentária está em nível favorável para consistência financeira.');

  if (data.hasInsurance === 'no') insights.push('Mesmo sem seguro atualmente, já é possível visualizar a necessidade de proteção nos cenários simulados.');
  else insights.push('Sua cobertura atual está sendo comparada com necessidades estimadas de proteção.');

  if (state.entries.length > 0) {
    const entriesNet = state.entries.reduce((acc, item) => acc + (item.type === 'income' ? item.amount : -item.amount), 0);
    insights.push(entriesNet >= 0 ? 'Suas movimentações registradas reforçam tendência positiva de caixa.' : 'Suas movimentações recentes pedem ajuste para preservar saldo futuro.');
  }

  return insights;
}

function renderProtection(data) {
  if (data.hasInsurance === 'no') {
    ui.protectionMessage.textContent = 'Seu planejamento depende da sua renda. Ter proteção pode trazer continuidade aos seus planos.';
    ui.protectionCard.style.borderLeftColor = '#fdb022';
    ui.protectionCta.classList.remove('hidden');
  } else {
    ui.protectionMessage.textContent = `Você possui uma base de proteção de ${BRL.format(data.insuranceCoverage)} integrada ao seu plano financeiro.`;
    ui.protectionCard.style.borderLeftColor = '#12b76a';
    ui.protectionCta.classList.add('hidden');
  }
}

function renderEntryList() {
  if (state.entries.length === 0) {
    ui.entriesList.innerHTML = '<li class="empty">Nenhuma movimentação adicionada ainda.</li>';
    return;
  }

  ui.entriesList.innerHTML = state.entries
    .map((item) => `
      <li class="entry-item">
        <div>
          <strong>${item.description}</strong>
          <span class="entry-meta">${item.category} • ${item.type === 'income' ? 'Entrada' : 'Saída'} recorrente mensal</span>
        </div>
        <strong class="${item.type}">${item.type === 'income' ? '+' : '-'} ${BRL.format(item.amount)}</strong>
      </li>
    `)
    .join('');
}

function renderProjection(metrics, data) {
  const entriesNet = state.entries.reduce((acc, item) => acc + (item.type === 'income' ? item.amount : -item.amount), 0);
  const baseMonthly = metrics.monthlyBalance + entriesNet;

  const short = data.emergencyReserve + baseMonthly * 3;
  const medium = data.emergencyReserve + baseMonthly * 12;
  const long = data.emergencyReserve + baseMonthly * 36;

  ui.projectionShort.textContent = BRL.format(short);
  ui.projectionMedium.textContent = BRL.format(medium);
  ui.projectionLong.textContent = BRL.format(long);

  if (baseMonthly > 0) ui.projectionNarrative.textContent = 'Com o ritmo atual, há tendência de crescimento da sua margem financeira nos três horizontes.';
  else if (baseMonthly === 0) ui.projectionNarrative.textContent = 'No cenário atual, sua evolução tende a estabilidade. Pequenos ajustes podem melhorar o resultado.';
  else ui.projectionNarrative.textContent = 'No cenário atual, a tendência é de redução da reserva ao longo do tempo; vale revisar prioridades.';
}

function render() {
  const data = getFormData();
  const metrics = calculateMetrics(data);
  const health = healthStatus(metrics);
  const insights = buildInsights(data, metrics);

  ui.totalIncome.textContent = BRL.format(metrics.totalIncome);
  ui.totalExpenses.textContent = BRL.format(metrics.totalExpenses);
  ui.monthlyBalance.textContent = BRL.format(metrics.monthlyBalance);
  ui.savingsRate.textContent = `${metrics.savingsRate.toFixed(1)}%`;
  ui.emergencyMonths.textContent = metrics.emergencyMonths.toFixed(1);
  ui.healthIndicator.className = health.className;
  ui.healthIndicator.textContent = health.label;
  ui.insightsList.innerHTML = insights.map((insight) => `<li>${insight}</li>`).join('');

  renderBudgetSlack(metrics);
  renderProtection(data);
  renderInsuranceNeeds(data);
  renderEntryList();
  renderProjection(metrics, data);
}

function setupInsuranceField() {
  ui.coverageField.classList.toggle('hidden', fields.hasInsurance.value !== 'yes');
}

function addEntry() {
  const description = fields.entryDescription.value.trim();
  const amount = numberValue(fields.entryAmount);
  const type = fields.entryType.value;
  const category = fields.entryCategory.value;

  if (!description || amount <= 0) {
    alert('Informe descrição e valor maior que zero para adicionar a movimentação.');
    return;
  }

  state.entries.unshift({ description, amount, type, category });
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

async function init() {
  Object.entries(defaultData).forEach(([key, value]) => {
    if (fields[key]) fields[key].value = value;
  });

  populateEntryCategories();
  await fetch('/api/config');

  ui.loadingState.classList.add('hidden');
  ui.appContent.classList.remove('hidden');

  setupTabs();
  setupInsuranceField();
  render();

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
    fields.hasInsurance,
    fields.insuranceCoverage
  ].forEach((field) => {
    field.addEventListener('input', () => {
      setupInsuranceField();
      render();
    });
    field.addEventListener('change', () => {
      setupInsuranceField();
      render();
    });
  });

  fields.entryType.addEventListener('change', () => {
    populateEntryCategories();
  });

  ui.addEntryBtn.addEventListener('click', addEntry);
  ui.protectionCta.addEventListener('click', () => {
    alert('Podemos explorar estratégias de proteção adequadas ao seu momento, com foco educativo e sem compromisso.');
  });
}

init();
