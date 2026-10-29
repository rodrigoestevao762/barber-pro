const { 
  getAppointmentsForDate, 
  addStoredAppointment, 
  getLocalDateString 
} = require('../src/lib/appointments-store');
const { BARBERS, getBarberById } = require('../src/lib/barbers');

console.log('--- TESTE 1: BARBEIROS OFICIAIS ---');
console.log('Total de Barbeiros:', BARBERS.length);
BARBERS.forEach(b => console.log(`- ${b.id}: ${b.name} (${b.role}, comissão ${(b.commissionRate * 100)}%)`));

console.log('\n--- TESTE 2: SIMULAÇÃO DE AGENDAMENTO PARA NANDO ---');
const today = getLocalDateString();
const newApt = addStoredAppointment({
  date: `${today}T17:00:00.000Z`,
  barberId: 'barbeiro-nando',
  service: { id: 'combo-corte-barba', name: 'Corte + Barba', price: 55, duration: 50 },
  user: {
    id: 'u-teste-1',
    name: 'Carlos Oliveira Teste',
    phone: '(75) 99888-1234',
    email: 'carlos.teste@gmail.com'
  },
  status: 'CONFIRMED'
});

console.log('Agendamento criado:', newApt.id, 'para', newApt.barber.name);

console.log('\n--- TESTE 3: ISOLAMENTO DOS PAINÉIS DOS BARBEIROS ---');
const nandoApts = getAppointmentsForDate(today, 'barbeiro-nando');
console.log('Agendamentos no painel do NANDO:', nandoApts.length);
const foundInNando = nandoApts.some(a => a.id === newApt.id);
console.log('-> O agendamento do Carlos Teste está no painel do NANDO?', foundInNando);

const saulApts = getAppointmentsForDate(today, 'barbeiro-saul');
console.log('Agendamentos no painel do SAUL:', saulApts.length);
const foundInSaul = saulApts.some(a => a.id === newApt.id);
console.log('-> O agendamento do Carlos Teste vazou para o SAUL?', foundInSaul ? 'ERRO: Vazou' : 'SUCESSO: Isolado');

const adminApts = getAppointmentsForDate(today, null);
console.log('Agendamentos na visão geral do DONO/ADMIN:', adminApts.length);
const foundInAdmin = adminApts.some(a => a.id === newApt.id);
console.log('-> O agendamento está na visão geral do DONO?', foundInAdmin ? 'SUCESSO: Visível' : 'ERRO');

console.log('\n--- TESTES CONCLUÍDOS COM SUCESSO! ---');
