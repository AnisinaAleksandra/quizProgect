(function () {
  const Test = {
    quiz: null,
    questionTitleElement: null,
    optionsElement: null,
    currentQuestionIndex: 0,
    nextButtonElement: null,
    prevButtonElement: null,
    passButtonElement: null,
    progressBarElement: null,
    userResult: [],
    testId: null,
    init() {
      checkUserData();
      const url = new URL(location.href);
      this.testId = url.searchParams.get("id");

      if (this.testId) {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "GET",
          "https://testologia.site/get-quiz?id=" + this.testId,
          false
        );
        xhr.send();
        if (xhr.status === 200 && xhr.responseText) {
          try {
            this.quiz = JSON.parse(xhr.responseText);
          } catch (error) {
            location.href = "index.html";
          }
          this.prepareProgressBar();
          this.startQuiz();
        } else {
          location.href = "index.html";
        }
      } else {
        location.href = "index.html";
      }
    },
    startQuiz() {
      this.questionTitleElement = document.getElementById("title");
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
    },
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
    },
    showQuestion() {
      const activeQuestion = this.quiz.questions[this.currentQuestionIndex];
      this.questionTitleElement.innerHTML = `<span>Вопрос ${
        this.currentQuestionIndex + 1
      }:</span> ${activeQuestion.question}`;

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
        if (choosenOption && choosenOption.choosenAnswerId === answer.id) {
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

      if (choosenOption && choosenOption.choosenAnswerId) {
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
    },
    chooseAnswer() {
      this.nextButtonElement.removeAttribute("disabled");
      this.prevButtonElement.removeAttribute("disabled");
    },
    move(action) {
      const activeQuestion = this.quiz.questions[this.currentQuestionIndex];
      const choosenAnswer = Array.from(
        document.getElementsByClassName("option-answer")
      ).find((el) => {
        return el.checked;
      });
      let choosenAnswerId = null;
      if (choosenAnswer && choosenAnswer?.value) {
        choosenAnswerId = Number(choosenAnswer?.value);
      }
      const existingResult = this.userResult.find((item) => {
        return item.questionId === activeQuestion.id;
      });
      if (existingResult) {
        existingResult.choosenAnswerId = choosenAnswerId;
      } else {
        this.userResult.push({
          questionId: activeQuestion.id,
          choosenAnswerId: choosenAnswerId,
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
    },
    complete() {
      const url = new URL(location.href);
      const name = url.searchParams.get("name");
      const lastName = url.searchParams.get("lastName");
      const email = url.searchParams.get("email");
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://testologia.site/pass-quiz?id=" + this.testId,
        false
      );
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(
        JSON.stringify({
          name: name,
          lastName: lastName,
          email: email,
          results: this.userResult,
        })
      );
      this.userResult.forEach((el, index) => {
        return localStorage.setItem(`${index}`, `${el.choosenAnswerId}`);
      });
      if (xhr.status === 200 && xhr.responseText) {
        let result = null;
        try {
          result = JSON.parse(xhr.responseText);
        } catch (err) {
          location.href = "index.html";
        }
        if (result) {
          location.href =
            "result.html?score=" +
            result.score +
            "&total=" +
            result.total +
            "&id=" +
            this.testId;
        }
      } else {
        location.href = "index.html";
      }
    },
  };
  Test.init();
})();
