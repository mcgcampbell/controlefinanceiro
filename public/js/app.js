const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const defaultData = {
  monthlyIncome: 6500,
  extraIncome: 500,
  fixedCosts: 2600,
  variableCosts: 1200,
  debts: 600,
  investments: 700,
  emergencyReserve: 9000,
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
  hasInsurance: document.getElementById('hasInsurance'),
  insuranceCoverage: document.getElementById('insuranceCoverage'),
  entryType: document.getElementById('entryType'),
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
  insightsList: document.getElementById('insightsList'),
  protectionCard: document.getElementById('protectionCard'),
  protectionMessage: document.getElementById('protectionMessage'),
  protectionCta: document.getElementById('protectionCta'),
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

function getFormData() {
  return {
    monthlyIncome: numberValue(fields.monthlyIncome),
    extraIncome: numberValue(fields.extraIncome),
    fixedCosts: numberValue(fields.fixedCosts),
    variableCosts: numberValue(fields.variableCosts),
    debts: numberValue(fields.debts),
    investments: numberValue(fields.investments),
    emergencyReserve: numberValue(fields.emergencyReserve),
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

  return { totalIncome, totalExpenses, monthlyBalance, savingsRate, emergencyMonths };
}

function healthStatus(metrics) {
  if (metrics.monthlyBalance < 0 || metrics.emergencyMonths < 1) return { label: 'Crítica', className: 'status status--danger' };
  if (metrics.savingsRate < 10 || metrics.emergencyMonths < 3) return { label: 'Atenção', className: 'status status--warning' };
  return { label: 'Saudável', className: 'status status--success' };
}

function buildInsights(data, metrics) {
  const insights = [];
  const totalIncome = Math.max(metrics.totalIncome, 1);
  const fixedCostRate = (data.fixedCosts / totalIncome) * 100;

  if (fixedCostRate > 50) insights.push('Seu custo fixo está alto para sua renda atual.');
  insights.push(`Sua reserva cobre ${metrics.emergencyMonths.toFixed(1)} meses de despesas essenciais.`);
  insights.push(metrics.monthlyBalance < 0 ? 'Suas saídas estão acima das entradas neste momento.' : 'Você mantém saldo mensal positivo, o que ajuda no planejamento.');

  if (data.hasInsurance === 'no') insights.push('Existe dependência da sua renda ativa para manter seu padrão atual.');
  else if (data.insuranceCoverage < data.monthlyIncome * 12) insights.push('Sua proteção financeira pode estar incompleta para seu padrão de renda.');
  else insights.push('Você possui uma base de proteção alinhada ao planejamento atual.');

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
          <small>${item.type === 'income' ? 'Entrada' : 'Saída'} recorrente mensal</small>
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

  renderProtection(data);
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

  if (!description || amount <= 0) {
    alert('Informe descrição e valor maior que zero para adicionar a movimentação.');
    return;
  }

  state.entries.unshift({ description, amount, type });
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
  Object.entries(defaultData).forEach(([key, value]) => { if (fields[key]) fields[key].value = value; });
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

  ui.addEntryBtn.addEventListener('click', addEntry);
  ui.protectionCta.addEventListener('click', () => {
    alert('Podemos explorar estratégias de proteção adequadas ao seu momento, com foco educativo e sem compromisso.');
  });
}

init();
