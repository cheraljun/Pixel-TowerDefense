import { CanvasSpriteBuilder } from "./canvasdraw";

export default class Sprites {
  constructor(basePath = "/") {
    // canvas caches
    this.towerCanvas = {}; // { basic: [lvl0, lvl1, lvl2], ... }
    this.attackCanvas = {}; // { basic: [lvl0, lvl1, lvl2], ... }
    this.tileCanvas = {}; // { basic, slow, fast, all }
    this.board = {}; // { border, wall, wallSelected, start, goal }

    // keep creep images as Image
    this.slime = {};
    this.gork = {};
    this.uwo = {};

    // async build
    this.ready = this.init();
  }

  async init() {
    // splash 按钮图片不再加载，避免额外请求

    // load creeps (still PNG)
    this.addCreepImages();

    // build 33 canvases from Canvas 指令 HTMLs
    const builder = new CanvasSpriteBuilder();
    const { towers, attacks, tiles, board } = await builder.buildAll();
    this.towerCanvas = towers;
    this.attackCanvas = attacks;
    this.tileCanvas = tiles;
    this.board = board;
  }

  addCreepImages() {
    for (let i = 0; i < 5; i++) {
      this.slime[i] = new Image();
      this.slime[i].src = `/images/creeps/slime/slime-${i}.png`;

      this.gork[i] = new Image();
      this.gork[i].src = `/images/creeps/gork/gork-${i}.png`;

      this.uwo[i] = new Image();
      this.uwo[i].src = `/images/creeps/uwo/uwo-${i}.png`;
    }
  }
}
