(function () {
  const Result = {
    init() {
      const url = new URL(location.href);
      const testId = url.searchParams.get("id");
      document.getElementById("result-score").innerText =
        url.searchParams.get("score") + "/" + url.searchParams.get("total");
      document.getElementById("see-answers").onclick = function () {
        location.href = `seeAnswers.html?id=${testId}`;
      };
    },
  };
  Result.init();
})();
