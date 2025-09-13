import { Howl } from "howler";

export default class Loader {
  constructor(game, dom, sprites) {
    this.game = game;
    this.dom = dom;
    this.sprites = sprites;
    // 直接进入游戏
    this.handleStart();

    // 窗口变化时，顶部/底部栏与画布宽度保持一致
    window.addEventListener("resize", this.syncUiWidth.bind(this));
  }

  // 移除启动界面相关方法

  handleStart() {
    this.hideSplash();
    this.addHowl();
    this.showBoard();
    this.game.animateBorder();
    this.game.animateBlocks();
    this.game.gameStarted = true;
  }

  hideSplash() {
    if (this.dom.play) this.dom.play.style.display = "none";
    if (this.dom.startText) this.dom.startText.style.display = "none";
    if (this.dom.footer) this.dom.footer.style.opacity = 0;
    // 防止 footer 遮挡底部按钮
    if (this.dom.footer) this.dom.footer.style.pointerEvents = "none";
  }

  showBoard() {
    // 先准备画布，再整体显示
    if (this.dom?.canvas) this.dom.canvas.style.backgroundColor = "rgb(186, 186, 186)";
    if (this.dom?.towerMenu) this.dom.towerMenu.classList.add("active");
    if (this.dom?.tutorial) this.dom.tutorial.style.opacity = 100;
    // 帧容器一次性显现，避免初始阶段宽度不同步的闪烁
    if (this.dom?.frame) this.dom.frame.style.opacity = 100;
    if (this.dom?.holder) this.dom.holder.style.opacity = 100;
    if (this.dom?.topBar) this.dom.topBar.style.opacity = 100;
    if (this.dom?.bottomBar) this.dom.bottomBar.style.opacity = 100;

    // 与画布宽度对齐
    this.syncUiWidth();
  }

  syncUiWidth() {
    if (!this.dom?.canvas) return;
    // 使用游戏实际像素尺寸，避免 DPI/缩放导致的比例偏差
    const w = this.dom.canvas.width;
    const h = this.dom.canvas.height;
    // 固定 canvas 的 CSS 尺寸与像素尺寸一致，避免被浏览器等比缩放
    this.dom.canvas.style.width = `${w}px`;
    this.dom.canvas.style.height = `${h}px`;

    if (this.dom?.frame) this.dom.frame.style.width = `${w}px`;
    if (this.dom?.wrapper) {
      this.dom.wrapper.style.width = `${w}px`;
      this.dom.wrapper.style.height = `${h}px`;
    }
    if (this.dom?.topBar) this.dom.topBar.style.width = `${w}px`;
    if (this.dom?.bottomBar) this.dom.bottomBar.style.width = `${w}px`;
  }

  addHowl() {
    this.game.sound = new Howl({
      src: "../audio/Arigato.mp3",
      loop: true,
    });
    if (!this.game.muted) this.game.sound.play();
  }
}
