import { UrlManager } from "../utils/url-menedjer.js";

export class Test {
  constructor() {
    this.quiz = null;
    this.questionTitleElement = null;
    this.optionsElement = null;
    this.currentQuestionIndex = 0;
    this.nextButtonElement = null;
    this.prevButtonElement = null;
    this.passButtonElement = null;
    this.progressBarElement = null;
    this.userResult = [];
    this.testId = null;
    this.routeParams = UrlManager.getQueryParams();
    UrlManager.checkUserData(this.routeParams);
    console.log(this.routeParams.id);
    if (this.routeParams.id) {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://testologia.site/get-quiz?id=" + this.routeParams.id,
        false
      );
      xhr.send();
      if (xhr.status === 200 && xhr.responseText) {
        try {
          this.quiz = JSON.parse(xhr.responseText);
        } catch (error) {
          location.href = "#/";
        }
        this.prepareProgressBar();
        this.startQuiz();
      } else {
        location.href = "#/";
      }
    } else {
      location.href = "#/";
    }
  }

  startQuiz() {
    this.questionTitleElement = document.getElementById("test-question-title");
    this.optionsElement = document.getElementById("options");
    this.nextButtonElement = document.getElementById("next");
    this.prevButtonElement = document.getElementById("prev");
    this.passButtonElement = document.getElementById("pass");
    this.progressBarElement = document.getElementById("progress-bar");
    this.nextButtonElement.onclick = this.move.bind(this, "next");
    this.passButtonElement.onclick = this.move.bind(this, "pass");
    this.prevButtonElement.onclick = this.move.bind(this, "prev");
    document.getElementById("pre-title").innerText = this.quiz.name;
    this.showQuestion();
    this.prepareProgressBar();

    const timerElement = document.getElementById("timer");
    let seconds = 59;
    const interval = setInterval(
      function () {
        seconds--;
        timerElement.innerText = seconds;
        if (seconds === 0) {
          clearInterval(interval);
          this.complete();
        }
      }.bind(this),
      1000
    );
  }
  prepareProgressBar() {
    for (let i = 0; i < this.quiz.questions.length; i++) {
      const itemElement = document.createElement("div");
      itemElement.className = `test-progress-bar-item ${
        i == 0 ? "active" : ""
      }`;

      const itemCircleElement = document.createElement("div");
      itemCircleElement.className = "test-progress-bar-item-circle";

      const itemTextElement = document.createElement("div");
      itemTextElement.className = "test-progress-bar-item-text";
      itemTextElement.innerText = `Вопрос ${i + 1}`;

      itemElement.appendChild(itemCircleElement);
      itemElement.appendChild(itemTextElement);
      this.progressBarElement?.appendChild(itemElement);
    }
  }
  showQuestion() {
    const activeQuestion = this.quiz.questions[this.currentQuestionIndex];
    this.questionTitleElement.innerHTML = `<span>Вопрос ${
      this.currentQuestionIndex + 1
    }:</span> ${activeQuestion.question}`;

    console.log(this.questionTitleElement);
    const answers = this.quiz.questions[this.currentQuestionIndex];
    this.optionsElement.innerHTML = "";
    const that = this;
    const choosenOption = this.userResult.find(
      (item) => item.questionId === activeQuestion.id
    );
    activeQuestion.answers?.forEach((answer) => {
      const optionElement = document.createElement("div");
      optionElement.className = "test-question-option";

      const inputId = `answer-${answer.id}`;

      const inputElement = document.createElement("input");
      inputElement.className = "option-answer";
      inputElement.setAttribute("id", inputId);
      inputElement.setAttribute("type", "radio");
      inputElement.setAttribute("name", "answer");
      inputElement.setAttribute("value", answer.id);
      if (choosenOption && choosenOption.chosenAnswerId === answer.id) {
        inputElement.setAttribute("checked", "checked");
      }

      inputElement.onchange = function () {
        that.chooseAnswer();
      };
      const labelElement = document.createElement("label");
      labelElement.setAttribute("for", inputId);
      labelElement.innerText = answer.answer;

      optionElement.appendChild(inputElement);
      optionElement.appendChild(labelElement);

      this.optionsElement.appendChild(optionElement);
    });

    if (choosenOption && choosenOption.chosenAnswerId) {
      this.nextButtonElement.removeAttribute("disabled");
    } else {
      this.nextButtonElement.setAttribute("disabled", "disabled");
    }
    if (this.currentQuestionIndex === 0) {
      this.prevButtonElement.setAttribute("disabled", "disabled");
    }
    if (this.currentQuestionIndex > 1) {
      this.prevButtonElement.removeAttribute("disabled");
    }
    if (this.currentQuestionIndex + 1 === this.quiz.questions.length) {
      this.nextButtonElement.innerText = "Завершить";
    } else if (this.currentQuestionIndex + 1 < this.quiz.questions.length) {
      this.nextButtonElement.innerText = "Далее";
    }
  }
  chooseAnswer() {
    this.nextButtonElement.removeAttribute("disabled");
    this.prevButtonElement.removeAttribute("disabled");
  }
  move(action) {
    const activeQuestion = this.quiz.questions[this.currentQuestionIndex];
    const choosenAnswer = Array.from(
      document.getElementsByClassName("option-answer")
    ).find((el) => {
      return el.checked;
    });
    let chosenAnswerId = null;
    if (choosenAnswer && choosenAnswer?.value) {
      chosenAnswerId = Number(choosenAnswer?.value);
    }
    const existingResult = this.userResult.find((item) => {
      return item.questionId === activeQuestion.id;
    });
    if (existingResult) {
      existingResult.chosenAnswerId = chosenAnswerId;
    } else {
      this.userResult.push({
        questionId: activeQuestion.id,
        chosenAnswerId: chosenAnswerId,
      });
    }
    if (action === "next" || action === "pass") {
      this.currentQuestionIndex += 1;
    } else {
      this.currentQuestionIndex -= 1;
    }

    if (this.currentQuestionIndex + 1 > this.quiz.questions.length) {
      this.complete();
      return;
    }
    Array.from(this.progressBarElement.children).forEach((item, index) => {
      const currentItemIndex = index + 1;
      item.classList.remove("complete");
      item.classList.remove("active");

      if (currentItemIndex === this.currentQuestionIndex + 1) {
        item.classList.add("active");
      } else if (currentItemIndex < this.currentQuestionIndex + 1) {
        item.classList.add("complete");
      }
    });
    this.showQuestion();
  }
  complete() {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://testologia.site/pass-quiz?id=" + this.routeParams.id,
      false
    );
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(
      JSON.stringify({
        name: this.routeParams.name,
        lastName: this.routeParams.lastName,
        email: this.routeParams.email,
        results: this.userResult,
      })
    );
    this.userResult.forEach((el, index) => {
      return localStorage.setItem(`${index}`, `${el.chosenAnswerId}`);
    });
    if (xhr.status === 200 && xhr.responseText) {
      let result = null;
      try {
        result = JSON.parse(xhr.responseText);
      } catch (err) {
        location.href = "#/";
      }
      if (result) {
        location.href =
          "#/result?score=" +
          result.score +
          "&total=" +
          result.total +
          "&id=" +
          this.routeParams.id;
      }
    } else {
      location.href = "#/";
    }
  }
}
