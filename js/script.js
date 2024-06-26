document.getElementById('loan-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const annualInterestRate = parseFloat(document.getElementById('interest').value) / 100;
    const years = parseInt(document.getElementById('years').value);

    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingrese un monto de préstamo válido.');
        return;
    }

    if (isNaN(annualInterestRate) || annualInterestRate < 0) {
        alert('Por favor, ingrese una tasa de interés anual válida.');
        return;
    }

    if (isNaN(years) || years <= 0) {
        alert('Por favor, ingrese un plazo válido en años.');
        return;
    }

    const months = years * 12;
    const monthlyInterestRate = annualInterestRate / 12;
    let monthlyPayment;

    if (monthlyInterestRate === 0) {
        monthlyPayment = amount / months;
    } else {
        monthlyPayment = (amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -months));
    }

    let balance = amount;
    let totalInterest = 0;

    let result = `
        <h2>Detalles del Crédito</h2>
        <p>Pago mensual: ${monthlyPayment.toFixed(2)}</p>
        <table>
            <thead>
                <tr>
                    <th>Pago #</th>
                    <th>Pago Mensual</th>
                    <th>Interés</th>
                    <th>Principal</th>
                    <th>Balance</th>
                </tr>
            </thead>
            <tbody>
    `;

    const payments = [];

    for (let i = 1; i <= months; i++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;

        payments.push({
            paymentNumber: i,
            monthlyPayment: monthlyPayment.toFixed(2),
            interestPayment: interestPayment.toFixed(2),
            principalPayment: principalPayment.toFixed(2),
            balance: balance.toFixed(2)
        });

        result += `
            <tr>
                <td>${i}</td>
                <td>${monthlyPayment.toFixed(2)}</td>
                <td>${interestPayment.toFixed(2)}</td>
                <td>${principalPayment.toFixed(2)}</td>
                <td>${balance.toFixed(2)}</td>
            </tr>
        `;
    }

    result += `
            </tbody>
        </table>
        <p>Total de Intereses Pagados: ${totalInterest.toFixed(2)}</p>
    `;

    document.getElementById('result').innerHTML = result;

    // Guardar los datos en localStorage
    const loanData = {
        amount: amount.toFixed(2),
        annualInterestRate: (annualInterestRate * 100).toFixed(2),
        years: years,
        monthlyPayment: monthlyPayment.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        payments: payments
    };

    let history = JSON.parse(localStorage.getItem('loanHistory')) || [];
    history.push(loanData);
    localStorage.setItem('loanHistory', JSON.stringify(history));

    displayHistory();
});

function displayHistory() {
    const history = JSON.parse(localStorage.getItem('loanHistory')) || [];
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history.forEach((loan, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Préstamo #${index + 1} - Monto: ${loan.amount}, Tasa de Interés: ${loan.annualInterestRate}%, Plazo: ${loan.years} años, Pago mensual: ${loan.monthlyPayment}`;
        listItem.style.cursor = 'pointer';
        listItem.onclick = function() {
            displayLoanDetails(loan);
        };
        historyList.appendChild(listItem);
    });
}

function displayLoanDetails(loan) {
    let result = `
        <h2>Detalles del Crédito</h2>
        <p>Pago mensual: ${loan.monthlyPayment}</p>
        <table>
            <thead>
                <tr>
                    <th>Pago #</th>
                    <th>Pago Mensual</th>
                    <th>Interés</th>
                    <th>Principal</th>
                    <th>Balance</th>
                </tr>
            </thead>
            <tbody>
    `;

    loan.payments.forEach(payment => {
        result += `
            <tr>
                <td>${payment.paymentNumber}</td>
                <td>${payment.monthlyPayment}</td>
                <td>${payment.interestPayment}</td>
                <td>${payment.principalPayment}</td>
                <td>${payment.balance}</td>
            </tr>
        `;
    });

    result += `
            </tbody>
        </table>
        <p>Total de Intereses Pagados: ${loan.totalInterest}</p>
    `;

    document.getElementById('result').innerHTML = result;
}

// Mostrar historial al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    fetch('loan_data.json')
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('loanHistory', JSON.stringify(data));
            displayHistory();
        });
});