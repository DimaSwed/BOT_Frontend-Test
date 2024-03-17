import './index.html';
import './index.sass';
import database from '../data/questions.json';
window.addEventListener('DOMContentLoaded', () => {
  // CLOSE PAGE и SHOW PAGE - функция скрыть / отобразить блок
  function togglePage(pageSelector, show) {
    const page = document.querySelector(pageSelector);
    page.classList.toggle('show', show);
    page.classList.toggle('hide', !show);
  }

  // START QUIZ
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

  // Добавляем обработчики событий для кнопок тем
  document.getElementById('html').addEventListener('click', () => handleTopicClick('html'));
  document.getElementById('css').addEventListener('click', () => handleTopicClick('css'));
  document.getElementById('javascript').addEventListener('click', () => handleTopicClick('javascript'));
  document.getElementById('react').addEventListener('click', () => handleTopicClick('react'));

  // const askedQuestions = [];
  let currentQuestion = 1;

  // HANDLE TOPIC CLICK - функция выбора темы

  function handleTopicClick(topic) {
    document.getElementById(topic).setAttribute('data-status', 'selected');

    // Получаем список вопросов по выбранной теме
    const questions = database[topic];

    // Прячем блок с кнопками выбора темы
    // Показываем блок с вопросами
    togglePage('#display__topic', false);
    togglePage('#display__game', true);

    // Отображаем вопросы из выбранной темы
    showQuestion(questions);

    // Обновляем результаты прогресс бара
    updateProgressBar(questions, topic);

    // Получаем все кнопки ответов
    assignEventListeners(questions);
  }

  // SHOW QUESTION - функция отображает вопрос
  let rightAnswers = [];
  function showQuestion(questions) {
    // Получаем индекс текущего вопроса
    const currentIndex = currentQuestion - 1;

    // Проверяем, есть ли вопрос с таким индексом
    if (currentIndex >= questions.length || currentIndex < 0) {
      console.error('Вопрос с текущим индексом отсутствует.');
      return;
    }

    // Получаем текущий вопрос
    const currentQuestionData = questions[currentIndex];

    // Отображаем текст вопроса
    document.querySelector('.quiz__question').textContent = currentQuestionData.text;

    // Очищаем блок с вариантами ответов или поле для ввода
    const quizAnswers = document.querySelector('.quiz__answers');
    if (!quizAnswers) {
      console.error('Элемент .quiz__answers не найден.');
      return; // Прекращаем выполнение функции, если элемент не найден
    }
    quizAnswers.innerHTML = '';

    // Отображаем варианты ответов из базы данных
    currentQuestionData.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.classList.add('btn');
      button.textContent = "".concat(index + 1, ") ").concat(option.text);
      button.setAttribute('data-correct', option.isCorrect ? '1' : '0');
      quizAnswers.appendChild(button);
    });
  }

  // UPDATE COUNTER - функция обновления счетчика ответов

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

  // HANDLE ANSWER CLICK - функция выбора ответа на вопрос

  // Создаем массив для ответов пользователя и правильных ответов
  const userAnswers = [];
  function handleAnswerClick(button, questions) {
    updateCounter(button);
    const isCorrect = button.dataset.correct === '1';
    const winnerAnswerDiv = document.querySelector('.quiz__winner-answer');

    // Добавляем ответ пользователя в массив
    userAnswers.push(button.textContent);

    // Добавляем класс и делаем кнопку неактивной для неправильных ответов
    if (!isCorrect) {
      button.classList.add('btn-false');

      // Прячем блок с кнопками ответов
      // Отображаем блок с правильным ответом
      togglePage('#quiz__answers', false);
      togglePage('.quiz__true', true);

      // Устанавливаем текст в блоке с правильным ответом
      winnerAnswerDiv.textContent = "".concat(button.textContent, " - \u043D\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442");
    }

    // Для правильных ответов
    if (isCorrect) {
      // Прячем блок с кнопками ответов
      // Отображаем блок с правильным ответом
      togglePage('#quiz__answers', false);
      togglePage('.quiz__true', true);

      // Устанавливаем текст в блоке с правильным ответом
      winnerAnswerDiv.textContent = "".concat(button.textContent, " - \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442");
    }

    // Проверяем, если текущий вопрос последний
    if (currentQuestion === questions.length) {
      // Если последний, вызываем функцию showResults
      showResults(questions);
    } else {
      // Иначе, переходим к следующему вопросу
      nextQuestion(nextQuestionSelectBtn);
    }
    currentQuestion++;
  }

  // ASSIGN EVENT LISTENERS - Перебор кнопок и при нажатии вызов handleAnswerClick

  function assignEventListeners(questions) {
    // Получаем все кнопки ответов
    const answerButtons = document.querySelectorAll('.quiz__answers button');

    // Перебираем все кнопки и назначаем обработчик события на каждую из них
    answerButtons.forEach(button => {
      button.addEventListener('click', () => handleAnswerClick(button, questions));
    });
  }

  // UPDATE PROGRESS BAR - функция изменения прогрессбара

  function updateProgressBar(questions) {
    const progressBar = document.getElementById('quiz__progress');
    const progressCount = document.querySelector('.quiz__progress-title');
    const totalQuestionsNumber = questions.length;
    let percentage = currentQuestion / totalQuestionsNumber * 100;
    progressCount.textContent = "\u0412\u043E\u043F\u0440\u043E\u0441 \u2116 ".concat(currentQuestion, ". \u0412\u0441\u0435\u0433\u043E: ").concat(totalQuestionsNumber);
    progressBar.style.width = "".concat(percentage, "%");
  }

  // // NEXT QUESTION - Перейти к следующему вопросу по нажатию кнопки "Следующий вопрос"

  const nextQuestionSelectBtn = document.getElementById('next_question-btn');
  function nextQuestion(btn) {
    btn.addEventListener('click', () => {
      // Прячем блок с правильным ответом
      // Отображаем блок с кнопками ответов
      togglePage('.quiz__true', false);
      togglePage('#quiz__answers', true);

      // Получаем выбранную тему
      const selectedTopicButton = document.querySelector('[data-status="selected"]');
      const topic = selectedTopicButton.id;
      handleTopicClick(topic);
    });
  }

  // SHOW REZULTS - функция перехода к результатам

  function showResults(questions) {
    // Закрываем блок с вариантами ответов
    // Отображаем блок с правильным ответом
    togglePage('#quiz__answers', false);
    togglePage('.quiz__true', true);

    // Заменяем текст на кнопке "Следующий вопрос" на "Закончить тестирование"
    const nextQuestionBtn = document.getElementById('next_question-btn');
    const btnSpan = nextQuestionBtn.querySelector('span');
    btnSpan.textContent = 'Закончить тестирование';

    // Обработчик нажатия кнопки "Закончить тестирование"
    nextQuestionBtn.addEventListener('click', () => {
      // Закрываем блок с вопросами
      // Отображаем блок с правильным ответом
      togglePage('#display__game', false);
      togglePage('#rezult', true);

      // Генерируем результаты
      generateResults(questions, userAnswers);
    });
  }

  // GENERATE REZULTS - Изменяем содержимое страницы rezults

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

    // Устанавливаем текст с количеством правильных ответов
    const rezultInnerScore = document.querySelector('.rezult__inner-score');
    const counter = document.querySelector('[data-counter="true"]').textContent;
    const scoreText = "\u0412\u044B \u043E\u0442\u0432\u0435\u0442\u0438\u043B\u0438 \u043D\u0430: ".concat(counter, "/").concat(questions.length);
    rezultInnerScore.innerHTML = "<p>".concat(scoreText, "</p>");
  }
});