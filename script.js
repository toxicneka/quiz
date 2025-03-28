const QUESTIONS = [
  {
    text: "Какое свойство CSS используется для установки внешних отступов элемента?",
    answers: ["padding", "margin", "border", "spacing"],
    rightIndex: 1,
  },
  {
    text: "Какой HTML тег используется для вставки изображений в веб-страницы?",
    answers: ["<picture>", "<image>", "<img>", "<src>"],
    rightIndex: 2,
  },
  {
    text: "Какой HTML тег используется для создания маркированного списка?",
    answers: ["<list>", "<ol>", "<li>", "<ul>"],
    rightIndex: 3,
  },
  {
    text: " Какое свойство CSS задает границу вокруг элементов без изменения размера бокса?",
    answers: ["border", "outline", "edge", "frame"],
    rightIndex: 1,
  },
  {
    text: "Какой HTML атрибут используется для определения языка содержимого документа?",
    answers: ["lang", "language", "type", "script"],
    rightIndex: 0,
  },
  {
    text: "Какое свойство CSS используется для установления прозрачности элемента, включая его содержимое?",
    answers: ["clear", "visibility", "opacity", "filter"],
    rightIndex: 2,
  },
  {
    text: "Какой HTML тег используется для создания раскрывающегося списка опций?",
    answers: ["<select>", "<dropdown>", "<option>", "<list>"],
    rightIndex: 2,
  },
  {
    text: "Какое свойство и значение CSS используются для создания скроллбара в элементе, если его контент переполняет размер?",
    answers: ["auto", "hidden", "scroll", "visible"],
    rightIndex: 0,
  },
  {
    text: "Какое значение свойства CSS 'position' позволяет элементу оставаться в пределах видимой части окна браузера, даже при прокрутке страницы?",
    answers: ["static", "absolute", "relative", "sticky"],
    rightIndex: 3,
  },
  {
    text: "Какое значение object-fit заставляет содержимое размером с контейнер, сохраняя пропорции, даже если это приводит к обрезке контента?",
    answers: ["contain", "cover", "fill", "none"],
    rightIndex: 1,
  },
];

const MONEY_NODES = document.querySelectorAll(".money");
const START_GAME_BUTTONS = document.querySelectorAll(".start-game");
const SCREEN_NODES = document.querySelectorAll(".screen");
const ANSWER_NODES = document.querySelectorAll(".answer");
const PRIZE_FOR_RIGHT_ANSWER = 100;
const HIGHLIGHT_TIMEOUT_MS = 1500;

let activeQuestionIndex = 0;
let money = 0;
let countdownInterval;
const countdownNumberEl = document.getElementById('countdown-number');
const countdownCircleEl = document.querySelector('#countdown circle');

const CONFETTI_COLORS = ['#d13447', '#ffbf00', '#263672'];
const CONFETTI_COUNT = 150;

// Инициализация игры
START_GAME_BUTTONS.forEach((button) =>
  button.addEventListener("click", startNewGame)
);

function startNewGame() {
  activeQuestionIndex = 0;
  updateMoneyDisplay(0);
  setActiveQuestion(0);
  showScreen(1);
  document.querySelector('.confetti-container').innerHTML = '';
}

function updateMoneyDisplay(newMoney) {
  money = newMoney;
  MONEY_NODES.forEach(moneyNode => moneyNode.textContent = money);
}

function setActiveQuestion(index) {
  ANSWER_NODES.forEach(node => node.classList.remove("active", "right", "wrong"));
  activeQuestionIndex = index;
  const activeQuestion = QUESTIONS[index];
  
  document.querySelector(".question").textContent = activeQuestion.text;
  activeQuestion.isChecking = false;
  
  startTimer(15);
  setupAnswers(activeQuestion);
}

function showScreen(index) {
  SCREEN_NODES.forEach((screen, i) => {
    screen.classList.toggle("visible", i === index);
  });
}

function setupAnswers(question) {
  ANSWER_NODES.forEach((answerNode, index) => {
    const letters = ["A", "B", "C", "D"];
    answerNode.textContent = `${letters[index]}. ${question.answers[index]}`;
    answerNode.onclick = () => handleAnswerClick(answerNode, question);
  });
}

async function handleAnswerClick(answerNode, question) {
  if (question.isChecking) return;
  
  clearInterval(countdownInterval);
  question.isChecking = true;
  
  await highlightAnswer(answerNode, "active", HIGHLIGHT_TIMEOUT_MS);
  
  const rightAnswerNode = ANSWER_NODES[question.rightIndex];
  const isRight = answerNode === rightAnswerNode;
  
  if (!isRight) {
    answerNode.classList.add("wrong");
    rightAnswerNode.classList.add("right");
    await new Promise(resolve => setTimeout(resolve, HIGHLIGHT_TIMEOUT_MS));
    answerNode.classList.remove("wrong");
    rightAnswerNode.classList.remove("right");
    gameOver("lose");
    return;
  } else {
    await highlightAnswer(rightAnswerNode, "right", HIGHLIGHT_TIMEOUT_MS);
  }
  
  updateMoneyDisplay(money + PRIZE_FOR_RIGHT_ANSWER);
  
  if (activeQuestionIndex === QUESTIONS.length - 1) {
    gameOver("win");
  } else {
    setActiveQuestion(activeQuestionIndex + 1);
  }
}

function startTimer(seconds) {
  countdownCircleEl.style.animation = 'none';
  void countdownCircleEl.offsetWidth;
  
  const animationName = `countdown-${Date.now()}`;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ${animationName} {
      from { stroke-dashoffset: 0; }
      to { stroke-dashoffset: 251px; }
    }
  `;
  document.head.appendChild(style);
  countdownCircleEl.style.animation = `${animationName} ${seconds}s linear forwards`;
  clearInterval(countdownInterval);

  let currentTime = seconds;
  countdownNumberEl.textContent = currentTime;
  
  countdownInterval = setInterval(() => {
    currentTime--;
    countdownNumberEl.textContent = currentTime;
    
    if(currentTime <= 0) {
      clearInterval(countdownInterval);
      document.head.removeChild(style);
      gameOver("lose");
    }
  }, 1000);

  setTimeout(() => {
    document.head.removeChild(style);
  }, seconds * 1000);
}

function updateTimerDisplay() {
  const timerElement = document.querySelector(".timer");
  if (timerElement) {
    timerElement.textContent = timeLeft.toString().padStart(2, "0");
  }
}

function gameOver(status) {
  clearInterval(countdownInterval);
  countdownCircleEl.style.animation = 'none';
  if (status === "win") {
    createConfetti();
    showScreen(3);
  } else {
    showScreen(2);
  }
}

async function highlightAnswer(node, className, duration) {
  node.classList.add(className);
  await new Promise(resolve => setTimeout(resolve, duration));
  node.classList.remove(className);
}

function createConfetti() {
  const container = document.querySelector('.confetti-container');
  container.innerHTML = '';
  
  for(let i = 0; i < 200; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const size = Math.random() * 10 + 5;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const left = Math.random() * 110 - 5; // (-5% до 105%)
    const delay = Math.random() * 4;
    const duration = 3 + Math.random() * 3;

    confetti.style.cssText = `
      width: ${size}px;
      height: ${size * 0.4}px;
      background-color: ${color};
      left: ${left}%;
      --random-left: ${Math.random() * 0.5 + 0.25};
      animation-delay: ${-delay}s;
      animation-duration: ${duration}s;
    `;

    container.appendChild(confetti);
  }
}