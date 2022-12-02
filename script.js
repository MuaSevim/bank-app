'use strict';

// DATA \\
const accounts = [
  {
    name: 'Jonas Schmedtman',
    movements: [1000, 250, -300, 1500, 300, -200, 450, -50, 700],
    interestRate: 1.2,
    pin: 1111,
    movementsDates: [
      '2022-11-02T06:57:00.000Z',
      '2022-11-14T01:51:00.000Z',
      '2022-11-07T23:50:00.000Z',
      '2022-11-15T07:17:00.000Z',
      '2022-11-16T21:58:00.000Z',
      '2022-11-23T11:31:00.000Z',
      '2022-11-27T09:37:00.000Z',
      '2022-12-02T12:32:00.000Z',
      '2022-12-02T13:16:31.884Z',
    ],
    locale: 'pt-PT',
    currency: 'EUR',
  },
  {
    name: 'Jaden Darren',
    movements: [5000, 3400, -150, -790, 1200, -3210, 430, 240, -1000, 8500],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: [
      '2022-11-03T21:00:00.000Z',
      '2022-11-03T23:20:00.000Z',
      '2022-11-10T08:54:00.000Z',
      '2022-11-12T19:46:00.000Z',
      '2022-11-13T18:52:00.000Z',
      '2022-11-14T04:32:00.000Z',
      '2022-11-19T21:18:00.000Z',
      '2022-11-22T00:49:00.000Z',
      '2022-11-22T05:24:00.000Z',
      '2022-11-27T14:20:00.000Z',
    ],
    locale: 'en-US',
    currency: 'USD',
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

const greetings = new Map([
  [[0, 3], 'Good night'],
  [[4, 11], 'Good morning'],
  [[12, 18], 'Good afternoon'],
  [[19, 23], 'Good evening'],
]);

// Labels
const labelMessage = document.querySelector('.message');
const labelBalance = document.querySelector('.balance-amount');
const labelSumIn = document.querySelector('.sum-in');
const labelSumOut = document.querySelector('.sum-out');
const labelSumInterest = document.querySelector('.sum-interest');
const labelTimer = document.querySelector('.timer');
const labelDate = document.querySelector('.date');

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

// General and Helper \\
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

// Date and Time \\
const daysPassed = function (dateSmall, dateBig) {
  return Math.round((dateBig - dateSmall) / (1000 * 60 * 60 * 24));
};

const secondsPassed = function (dateSmall, dateBig) {
  let second = Math.round((dateBig - dateSmall) / 1000);
  const minute = Math.round(second / 60);
  const hour = Math.round(minute / 60);

  if (second < 60) return `${second} second${second > 1 ? 's' : ''} ago`;
  if (minute < 60) return `${minute} minute${minute > 1 ? 's' : ''} ago`;
  else return `${hour} hour${hour > 1 ? 's' : ''} ago`;
};

const getDate = function (usrDate, locale) {
  let date = new Date(usrDate);
  let days = daysPassed(date, new Date());

  if (days === 0) return secondsPassed(date, new Date());
  if (days === 1) return 'Yesterday';
  if (days <= 7) return `${days} days ago`;
  else return new Intl.DateTimeFormat(locale).format(date);
};

console.log(599 % 60);

//Global timer variable
let timer;
const startLogoutTimer = function () {
  let time = 600;
  const timerHandler = function () {
    let second = `${time % 60}`.padStart(2, 0);
    let minute = `${Math.floor(time / 60)}`.padStart(2, 0);
    labelTimer.textContent = `${minute}:${second}`;

    if (time === 0) {
      clearInterval(timer);
      containerMain.style.opacity = 0;
      labelMessage.textContent = 'Log in to get started';
    }
    time--;
  };
  timerHandler();
  return setInterval(timerHandler, 1000);
};

const resetTimer = () => {
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
};

// Currency and Movements \\
const getCurrency = (locale, currency, value) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);

const displayMovements = function (acc, sorted = false) {
  // Clear Container
  containerMovements.innerHTML = '';

  // Sort Movements ?
  let movs = [...acc.movements];
  if (sorted) movs.sort((a, b) => a - b);

  // Print Movements
  movs.forEach((mov, i) => {
    const type = mov >= 0 ? 'deposit' : 'withdrawal';
    const value = getCurrency(acc.locale, acc.currency, mov);
    const date = getDate(acc.movementsDates[i]);
    const el = `
  <div class="movement-row">
    <p class="movement-type movement--${type}">${i + 1} ${type}</p>
    <p class="movement-date">${date}</p>
    <p class="movement-amount">${value}</p>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', el);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((sum, mov) => sum + mov, 0);
  if (acc.balance >= 0)
    labelBalance.textContent = getCurrency(
      acc.locale,
      acc.currency,
      acc.balance
    );
};

const calcDisplaySummary = function (acc) {
  //Calc and print "sum in" and "sum out"
  const inAndOut = function (test, el) {
    let value = Math.abs(
      acc.movements.filter(test).reduce((sum, mov) => mov + sum, 0)
    );
    el.textContent = getCurrency(acc.locale, acc.currency, value);
  };

  inAndOut(n => n > 0, labelSumIn);
  inAndOut(n => n < 0, labelSumOut);

  // Calc and display interest
  let valueInterest = Math.round(
    acc.movements
      .filter(mov => mov > 0)
      .map(mov => (mov * acc.interestRate) / 100)
      .filter(mov => mov >= 1)
      .reduce((sum, mov) => sum + mov, 0)
  );
  labelSumInterest.textContent = getCurrency(
    acc.locale,
    acc.currency,
    valueInterest
  );
};

// Print message according to current time
const getMessage = function (acc) {
  let hour = new Date(2022, 11, 10, 3).getHours();
  let name = acc.name.split(' ')[0];
  for (const [key, message] of greetings.entries()) {
    console.log(hour, key);
    if (hour >= key[0] && hour <= key[1]) {
      return `${message} ${name}`;
    }
  }
};

const updateUI = function (account) {
  containerMain.style.opacity = 1;
  labelMessage.textContent = getMessage(account);
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

// EVENT LISTENERS \\
// Login to Account
let currentAccount;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUserName.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI
    updateUI(currentAccount);

    //Start Timer
    resetTimer();

    //Display Login Time
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
      minute: 'numeric',
      hour: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(new Date());
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
  resetTimer();

  //Event Listener
  document
    .querySelector('.submit-transfer')
    .addEventListener('click', function (e) {
      e.preventDefault();
      // Conditionally get values
      const userName = document.getElementById('inputTransferUser')?.value;
      const amount = +document.getElementById('inputTransferAmount')?.value;
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
        currentAccount.movementsDates.push(new Date().toISOString());
        account.movements.push(amount);
        account.movementsDates.push(new Date().toISOString());
        modalToggle();
        setTimeout(() => updateUI(currentAccount), 2000);
      }
    });
});

// Request Loan
btnLoan.addEventListener('click', function (e) {
  displayModal('loan');
  resetTimer();

  // Event Listener
  document
    .querySelector('.submit-loan')
    .addEventListener('click', function (e) {
      e.preventDefault();
      // Get Loan
      const loan = +document.getElementById('inputLoan')?.value;

      // Check whether account has any movements that is at least 20% of requested loan
      if (loan > 0 && currentAccount.movements.some(mov => mov >= loan * 0.2)) {
        currentAccount.movements.push(loan);
        currentAccount.movementsDates.push(new Date().toISOString());
        modalToggle();
        setTimeout(() => updateUI(currentAccount), 2000);
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
      const pin = +document.getElementById('inputClosePin')?.value;

      // Conditions
      if (currentAccount.userName === userName && currentAccount.pin === pin) {
        accounts.splice(
          accounts.findIndex(acc => acc.userName === currentAccount.userName),
          1
        );
        containerMain.style.opacity = 0;
        modalToggle();
        clearInterval(timer);
      }

      // Clear Inputs
      clearInputs(
        document.getElementById('inputCloseUser'),
        document.getElementById('inputClosePin')
      );
    });
});

overlay.addEventListener('click', modalToggle);
