import './index.html';
import './index.sass';
// import database from '../data/questions.json';

window.addEventListener('DOMContentLoaded', () => {
  // Функция для скрытия / отображения блока страницы
  function togglePage(pageSelector, show) {
    const page = document.querySelector(pageSelector);
    page.classList.toggle('show', show);
    page.classList.toggle('hide', !show);
  }

  // Функция для начала викторины
  const startQuizBtn = document.querySelector('.welcome__button');
  const welcomePageSelector = '#display__welcome';
  const topicSelectionPageSelector = '#display__topic';
  function startQuiz(btn, closePageSelector, showPageSelector) {
    btn.addEventListener('click', () => {
      togglePage(closePageSelector, false);
      togglePage(showPageSelector, true);
    });
  }
  startQuiz(startQuizBtn, welcomePageSelector, topicSelectionPageSelector);

  // Добавление обработчиков событий для кнопок выбора темы
  ['html', 'css', 'javascript', 'react'].forEach(topic => {
    const topicBtn = document.getElementById(topic);
    topicBtn.addEventListener('click', () => handleTopicClick(topic));
  });
  let currentQuestion = 1;

  // Функция для обработки выбора темы
  /*   function handleTopicClick(topic) {
    document.getElementById(topic).setAttribute('data-status', 'selected');
     // Получение списка вопросов по выбранной теме
    const questions = database[topic];
     // Скрытие блока с кнопками выбора темы и отображение блока с вопросами
    togglePage('#display__topic', false);
    togglePage('#display__game', true);
     showQuestionAndAssignEventListeners(questions);
     // Обновление состояния прогресс-бара
    updateProgressBar(questions, topic);
  } */

  async function handleTopicClick(topic) {
    document.getElementById(topic).setAttribute('data-status', 'selected');
    try {
      // Получение списка вопросов по выбранной теме с помощью axios и json-server
      const response = await axios.get("http://localhost:3001/".concat(topic));
      const questions = response.data;

      // Скрытие блока с кнопками выбора темы и отображение блока с вопросами
      togglePage('#display__topic', false);
      togglePage('#display__game', true);
      showQuestionAndAssignEventListeners(questions);

      // Обновление состояния прогресс-бара
      updateProgressBar(questions, topic);
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error);
    }
  }

  // Функция для отображения вопроса
  function showQuestionAndAssignEventListeners(questions) {
    const currentIndex = currentQuestion - 1;

    // Проверка существования вопроса с текущим индексом
    if (currentIndex >= questions.length || currentIndex < 0) {
      console.error('Вопрос с текущим индексом отсутствует.');
      return;
    }
    const currentQuestionData = questions[currentIndex];

    // Отображение текста вопроса
    document.querySelector('.quiz__question').textContent = currentQuestionData.text;

    // Очистка блока с вариантами ответов или поля для ввода
    const quizAnswers = document.querySelector('.quiz__answers');
    quizAnswers.innerHTML = '';

    // Отображение вариантов ответов из базы данных
    currentQuestionData.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.classList.add('btn');
      button.textContent = "".concat(index + 1, ") ").concat(option.text);
      button.setAttribute('data-correct', option.isCorrect ? '1' : '0');
      button.addEventListener('click', () => handleAnswerClick(button, questions));
      quizAnswers.appendChild(button);
    });
  }

  // Функция для обновления счетчика ответов
  function updateCounter(button) {
    const isCorrect = button.getAttribute('data-correct') === '1';
    const trueCounter = document.querySelector('[data-counter="true"]');
    const falseCounter = document.querySelector('[data-counter="false"]');
    if (isCorrect) {
      trueCounter.textContent = parseInt(trueCounter.textContent) + 1;
    } else {
      falseCounter.textContent = parseInt(falseCounter.textContent) + 1;
    }
  }

  // Функция для обработки клика по варианту ответа
  const userAnswers = [];
  function handleAnswerClick(button, questions) {
    const isCorrect = button.getAttribute('data-correct') === '1';
    updateCounter(button);
    const winnerAnswerDiv = document.querySelector('.quiz__winner-answer');
    userAnswers.push(button.textContent);
    if (!isCorrect) {
      button.classList.add('btn-false');
    }
    togglePage('#quiz__answers', false);
    togglePage('.quiz__true', true);
    winnerAnswerDiv.textContent = isCorrect ? "".concat(button.textContent, " - \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442") : "".concat(button.textContent, " - \u043D\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442");
    if (currentQuestion === questions.length) {
      showResults(questions);
    } else {
      nextQuestion(nextQuestionSelectBtn);
    }
    currentQuestion++;
  }

  // Функция для обновления прогресс-бара
  function updateProgressBar(questions) {
    const progressBar = document.getElementById('quiz__progress');
    const progressCount = document.querySelector('.quiz__progress-title');
    const totalQuestionsNumber = questions.length;
    let percentage = currentQuestion / totalQuestionsNumber * 100;
    progressCount.textContent = "\u0412\u043E\u043F\u0440\u043E\u0441 \u2116 ".concat(currentQuestion, ". \u0412\u0441\u0435\u0433\u043E: ").concat(totalQuestionsNumber);
    progressBar.style.width = "".concat(percentage, "%");
  }

  // Функция для перехода к следующему вопросу
  const nextQuestionSelectBtn = document.getElementById('next_question-btn');
  function nextQuestion(btn) {
    btn.addEventListener('click', () => {
      togglePage('.quiz__true', false);
      togglePage('#quiz__answers', true);
      const selectedTopicButton = document.querySelector('[data-status="selected"]');
      const topic = selectedTopicButton.id;
      handleTopicClick(topic);
    });
  }

  // Функция для отображения результатов
  function showResults(questions) {
    togglePage('#quiz__answers', false);
    togglePage('.quiz__true', true);
    const nextQuestionBtn = document.getElementById('next_question-btn');
    const btnSpan = nextQuestionBtn.querySelector('span');
    btnSpan.textContent = 'Закончить тестирование';
    nextQuestionBtn.addEventListener('click', () => {
      togglePage('#display__game', false);
      togglePage('#rezult', true);
      generateResults(questions, userAnswers);
    });
  }

  // Функция для генерации результатов
  function generateResults(questions, answers) {
    const rezultInnerAnswers = document.querySelector('.rezult__inner-answers');
    rezultInnerAnswers.innerHTML = ''; // Очищаем блок с ответами

    questions.forEach((question, index) => {
      const div = document.createElement('div');
      div.classList.add('rezult__inner-item');
      const userAnswer = answers[index];
      const correctAnswer = question.options.find(option => option.isCorrect === true).text;
      div.innerHTML = "\n      <p><span>\u0412\u043E\u043F\u0440\u043E\u0441 ".concat(index + 1, ":</span> ").concat(question.text, "</p>");
      const userAnswerPara = document.createElement('p');
      userAnswerPara.textContent = "\u0412\u0430\u0448 \u043E\u0442\u0432\u0435\u0442: ".concat(userAnswer);
      div.appendChild(userAnswerPara);
      const correctAnswerPara = document.createElement('p');
      correctAnswerPara.textContent = "\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442: ".concat(correctAnswer);
      div.appendChild(correctAnswerPara);
      rezultInnerAnswers.appendChild(div);
    });
    const rezultInnerScore = document.querySelector('.rezult__inner-score');
    const counter = document.querySelector('[data-counter="true"]').textContent;
    const scoreText = "\u0412\u044B \u043E\u0442\u0432\u0435\u0442\u0438\u043B\u0438 \u043D\u0430: ".concat(counter, "/").concat(questions.length);
    rezultInnerScore.innerHTML = "<p>".concat(scoreText, "</p>");
  }
});