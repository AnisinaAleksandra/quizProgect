(function () {
  const ListAnswers = {
    listAnswers: null,
    quiz: null,
    itemListAnswers: null,
    init() {
      const url = new URL(location.href);
      const testId = url.searchParams.get("id");
      if (testId) {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "GET",
          `https://testologia.site/get-quiz-right?id=${testId}`,
          false
        );
        xhr.send();

        if (xhr.status == 200 && xhr.responseText) {
          try {
            this.listAnswers = JSON.parse(xhr.responseText);
          } catch (error) {
            location.href = "index.html";
          }
        } else {
          location.href = "index.html";
        }
      }
      const xhrTwo = new XMLHttpRequest();
      xhrTwo.open(
        "GET",
        `https://testologia.site/get-quiz?id=${testId}`,
        false
      );
      xhrTwo.send();

      if (this.listAnswers.length) {
        if (xhrTwo.status === 200 && xhrTwo.responseText) {
          try {
            this.quiz = JSON.parse(xhrTwo.responseText);
          } catch (error) {
            location.href = "index.html";
          }
        } else {
          location.href = "index.html";
        }
      } else {
        location.href = "index.html";
      }
      document.getElementById("see-results").onclick = function () {
        history.back();
      };
      this.showQuestions();
      this.findUnCorrectAnswers();
    },
    showQuestions() {
      this.itemListAnswers = document.getElementById("list-of-answers");
      this.quiz.questions.forEach((question, index) => {
        const questionElement = document.createElement("div");
        questionElement.className = "question-container";
        const titleElementQuestion = document.createElement("div");
        titleElementQuestion.className = "test-question-title";
        titleElementQuestion.innerHTML = `<span>Вопрос ${index + 1}:</span> ${
          question.question
        }`;
        questionElement.appendChild(titleElementQuestion);
        question.answers.forEach((item) => {
          const inputElement = document.createElement("input");

          inputElement.className = "option-answer";
          inputElement.setAttribute("type", "radio");
          inputElement.setAttribute("name", "answer");

          const labelElement = document.createElement("label");
          labelElement.innerText = item.answer;

          const optionElement = document.createElement("div");
          optionElement.setAttribute("id", item.id);
          optionElement.className = "test-question-option";
          if (this.listAnswers.find((el) => el === item.id)) {
            optionElement.classList.add("correct");
            inputElement.classList.add("correct");
          }

          optionElement.appendChild(inputElement);
          optionElement.appendChild(labelElement);
          questionElement.appendChild(optionElement);
        });
        this.itemListAnswers.appendChild(questionElement);
      });
    },

    findUnCorrectAnswers() {
      const arrAnswersUserFromStorage = Object.keys(localStorage).map((el) =>
        localStorage.getItem(el)
      );
      this.listAnswers.forEach((answer, index) => {
        if (arrAnswersUserFromStorage[index] !== "null") {
          if (answer.toString() !== arrAnswersUserFromStorage[index]) {
            document
              .getElementById(arrAnswersUserFromStorage[index])
              .childNodes[0].classList.add("uncorrect");
            document
              .getElementById(arrAnswersUserFromStorage[index])
              .classList.add("uncorrect");
          }
        }
      });
    },
  };
  ListAnswers.init();
})();
