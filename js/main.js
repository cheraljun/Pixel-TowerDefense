import DomHandler from "./dom";
import Sprites from "./sprites";
import Game from "./game";

window.addEventListener("load", init);

const targetFPS = 60;
var sprites = new Sprites();
var dom, game, animation;

function init() {
  dom = dom ?? new DomHandler();
  // Ensure canvas sprites are ready before starting the game
  const boot = async () => {
    await sprites.ready;
    game = new Game(dom, sprites);
    // 暴露到全局方便调试
    window.game = game;
    // 去除排行榜与数据库依赖
    game.actions.init = init;
    window.clearTimeout(animation);
    window.setTimeout(animate, 100);
  };
  boot();
}

function animate() {
  game.run();
  animation = window.setTimeout(animate, 1000 / targetFPS);
}
