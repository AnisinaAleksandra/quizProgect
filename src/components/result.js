import { UrlManager } from "../utils/url-menedjer.js";

export class Result {
  constructor() {
    this.routeParams = UrlManager.getQueryParams();
    // UrlManager.checkUserData(this.routeParams);
    document.getElementById("result-score").innerText =
      this.routeParams.score + "/" + this.routeParams.total;
    document.getElementById("see-answers").onclick = function () {
      location.href = `#/seeAnswers?id=${this.routeParams.id}`;
    };
  }
}
