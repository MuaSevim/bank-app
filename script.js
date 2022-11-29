'use strict';

// DATA \\
const accounts = [
  {
    name: 'Jonas Schmedtman',
    movements: [1000, 250, -300, 1500, 300, -200, 450, -50, 700],
    interestRate: 1.2,
    pin: 1111,
  },
  {
    name: 'Jaden Darren',
    movements: [
      5000, 3400, -150, -790, 1200, -3210, 430, 240, -1000, 8500, -30,
    ],
    interestRate: 1.5,
    pin: 2222,
  },
];

const actions = {
  transfer: {
    title: 'Transfer Money',
    inputs: [
      {
        type: 'text',
        id: 'inputTransferUser',
        label: 'Transfer To',
      },
      {
        type: 'number',
        id: 'inputTransferAmount',
        label: 'Amount',
      },
    ],
  },
  close: {
    title: 'Close Account',
    inputs: [
      {
        type: 'text',
        id: 'inputCloseUser',
        label: 'user',
      },
      {
        type: 'password',
        id: 'inputClosePin',
        label: 'pin',
      },
    ],
  },
  loan: {
    title: 'Request Loan',
    inputs: [
      {
        type: 'number',
        id: 'inputLoan',
        label: 'Loan Amount',
      },
    ],
  },
};

// Labels
const labelMessage = document.querySelector('.message');
const labelBalance = document.querySelector('.balance-amount');
const labelSumIn = document.querySelector('.sum-in');
const labelSumOut = document.querySelector('.sum-out');
const labelSumInterest = document.querySelector('.sum-interest');

//Inputs
const inputLoginUserName = document.querySelector('.login--username');
const inputLoginPin = document.querySelector('.login--pin');

//Containers
const containerMain = document.querySelector('.main');
const containerMovements = document.querySelector('.movements-container');
const containerModalForm = document.querySelector('.modal-form-container');
const containerModalTitle = document.querySelector('.modal-title-container');

//Modal
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');

// Buttons
const btnLogin = document.querySelector('.btn-login');
const btnSort = document.querySelector('.btn-sort');
const btnTransfer = document.querySelector('.btn-transfer');
const btnLoan = document.querySelector('.btn-loan');
const btnClose = document.querySelector('.btn-close');
const btnSubmit = document.querySelector('.modal-form--btn');

// Functions
const generateUserName = function (accounts) {
  accounts.forEach(acc => {
    acc.userName = acc.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toLowerCase();
  });
};
generateUserName(accounts);

const displayMovements = function ({ movements }, sorted = false) {
  //Clear Container
  containerMovements.innerHTML = '';

  let movs = [...movements];
  if (sorted) movs.sort((a, b) => a - b);

  //Display movements
  movs.forEach((mov, i) => {
    const type = mov >= 0 ? 'deposit' : 'withdrawal';
    const el = `
  <div class="movement-row">
    <p class="movement-type movement--${type}">${i + 1} ${type}</p>
    <p class="movement-amount">${mov}€</p>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', el);
  });
};

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((sum, mov) => sum + mov, 0);
  if (account.balance >= 0) labelBalance.textContent = `${account.balance}€`;
};

const calcDisplaySummary = function ({ movements: movs, interestRate: rate }) {
  //Display Total Deposit and Withdrawal
  const inAndOut = function (test, el) {
    el.textContent =
      Math.abs(movs.filter(test).reduce((sum, mov) => mov + sum, 0)) + '€';
  };

  inAndOut(n => n > 0, labelSumIn);
  inAndOut(n => n < 0, labelSumOut);

  // Display Interest
  labelSumInterest.textContent =
    Math.round(
      movs
        .filter(mov => mov > 0)
        .map(mov => (mov * rate) / 100)
        .filter(mov => mov >= 1)
        .reduce((sum, mov) => sum + mov, 0)
    ) + '€';
};

const updateUI = function (account) {
  containerMain.style.opacity = 1;
  labelMessage.textContent = `Welcome ${account.name.split(' ')[0]}`;
  calcDisplayBalance(account);
  displayMovements(account);
  calcDisplaySummary(account);
};

// Open and Close Modal & Overlay
const modalToggle = function () {
  modal.classList.toggle('hidden');
  overlay.classList.toggle('hidden');
};

// Display Modals "Dynamically"
const displayModal = function (action) {
  containerModalForm.innerHTML = '';
  containerModalTitle.innerHTML = `<h3 class="modal-title">${actions[action].title}</h3>`;

  actions[action].inputs
    .map(
      ({ type, id, label }) => `      
      <div class="modal-form--group">
        <input type="${type}" class="modal-form--input" id="${id}" />
        <label for="${id}">${label}</label>
      </div>`
    )
    .forEach(el => containerModalForm.insertAdjacentHTML('beforeend', el));

  btnSubmit.classList = `modal-form--btn submit-${action}`;
  modal.classList = `modal hidden modal-${action}`;
  modalToggle();
};

const clearInputs = function (...inputs) {
  if (inputs[0]) {
    inputs.forEach(i => (i.value = ''));
    inputs.at(-1).blur();
  }
};

// Initialize Account
let currentAccount;

// Login to Account
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUserName.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    updateUI(currentAccount);
  }

  clearInputs(inputLoginUserName, inputLoginPin);
});

// Sort Movements
let sort = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sort = !sort;
  displayMovements(currentAccount, sort);
});

// Transfer Money
btnTransfer.addEventListener('click', function (e) {
  displayModal('transfer');

  //Event Listener
  document
    .querySelector('.submit-transfer')
    .addEventListener('click', function (e) {
      e.preventDefault();
      // Conditionally get values
      const userName = document.getElementById('inputTransferUser')?.value;
      const amount = Number(
        document.getElementById('inputTransferAmount')?.value
      );

      // Clear inputs
      clearInputs(
        document.getElementById('inputTransferUser'),
        document.getElementById('inputTransferAmount')
      );

      // Get Account
      const account = accounts.find(acc => acc.userName === userName);
      if (
        account &&
        account.userName !== currentAccount.userName &&
        amount > 0 &&
        currentAccount.balance >= amount
      ) {
        currentAccount.movements.push(-amount);
        account.movements.push(amount);
        modalToggle();
        updateUI(currentAccount);
      }
    });
});

// Request Loan
btnLoan.addEventListener('click', function (e) {
  displayModal('loan');

  // Event Listener
  document
    .querySelector('.submit-loan')
    .addEventListener('click', function (e) {
      e.preventDefault();
      // Get Loan
      const loan = Number(document.getElementById('inputLoan')?.value);

      // Check whether account has any movements that is at least 20% of requested loan
      if (loan > 0 && currentAccount.movements.some(mov => mov >= loan * 0.2)) {
        currentAccount.movements.push(loan);
        modalToggle();
        updateUI(currentAccount);
      }

      clearInputs(document.getElementById('inputLoan'));
    });
});

// Close Account
btnClose.addEventListener('click', function (e) {
  displayModal('close');

  // Event Listener
  document
    .querySelector('.submit-close')
    .addEventListener('click', function (e) {
      e.preventDefault();

      // Store Values
      const userName = document.getElementById('inputCloseUser')?.value;
      const pin = Number(document.getElementById('inputClosePin')?.value);

      // Conditions
      if (currentAccount.userName === userName && currentAccount.pin === pin) {
        accounts.splice(
          accounts.findIndex(acc => acc.userName === currentAccount.userName),
          1
        );
        containerMain.style.opacity = 0;
        modalToggle();
      }

      // Clear Inputs
      clearInputs(
        document.getElementById('inputCloseUser'),
        document.getElementById('inputClosePin')
      );
    });
});

overlay.addEventListener('click', modalToggle);
