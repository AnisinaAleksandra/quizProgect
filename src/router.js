import { Form } from "./components/form.js";
import { Choice } from "./components/choice.js";
import { Test } from "./components/test.js";
import { Result } from "./components/result.js";

export class Router {
  constructor() {
    this.routes = [
      {
        route: "#/",
        title: "Главная",
        template: "../templates/index.html",
        styles: "styles/style.css",
        load: () => {},
      },
      {
        route: "#/form",
        title: "Регистрация",
        template: "../templates/form.html",
        styles: "styles/form.css",
        load: () => {
          new Form();
        },
      },
      {
        route: "#/choice",
        title: "Выбор теста",
        template: "../templates/choice.html",
        styles: "styles/choice.css",
        load: () => {
          new Choice();
        },
      },
      {
        route: "#/test",
        title: "Прохождение теста",
        template: "../templates/test.html",
        styles: "styles/test.css",
        load: () => {
          new Test();
        },
      },
      {
        route: "#/result",
        title: "Результат теста",
        template: "../templates/result.html",
        styles: "styles/result.css",
        load: () => {
          new Result();
        },
      },
    ];
  }

  async openRoute() {
    const newRoute = this.routes.find((item) => {
      return item.route === window.location.hash.split('?')[0];
    });
    console.log(newRoute);

    if (!newRoute) {
      window.location.href = "#/";
      return;
    }
    document.getElementById("content").innerHTML = await fetch(
      newRoute.template
    ).then((response) => response.text());
    document.getElementById("styles").setAttribute("href", newRoute.styles);
    document.getElementById("title").innerHTML = newRoute.title;
    newRoute.load();
  }
}
