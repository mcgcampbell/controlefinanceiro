const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para retornar configuração inicial / mock do modo essencial.
app.get('/api/config', (_req, res) => {
  res.json({
    mode: 'essential',
    supportsAdvancedMode: true,
    currency: 'BRL',
    version: 'mvp-1'
  });
});

// Endpoint simples para cálculos no backend (opcional para evolução futura).
app.post('/api/analyze', (req, res) => {
  const data = req.body || {};

  const monthlyIncome = Number(data.monthlyIncome) || 0;
  const extraIncome = Number(data.extraIncome) || 0;
  const fixedCosts = Number(data.fixedCosts) || 0;
  const variableCosts = Number(data.variableCosts) || 0;
  const debts = Number(data.debts) || 0;
  const investments = Number(data.investments) || 0;
  const emergencyReserve = Number(data.emergencyReserve) || 0;

  const totalIncome = monthlyIncome + extraIncome;
  const totalExpenses = fixedCosts + variableCosts + debts + investments;
  const monthlyBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (monthlyBalance / totalIncome) * 100 : 0;
  const emergencyMonths = (fixedCosts + variableCosts) > 0
    ? emergencyReserve / (fixedCosts + variableCosts)
    : 0;

  res.json({
    totalIncome,
    totalExpenses,
    monthlyBalance,
    savingsRate,
    emergencyMonths
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
