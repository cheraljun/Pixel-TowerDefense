export default class Attack {
  constructor(loc, sprites, context, angle, idx, level, type, damage, speed) {
    this.location = loc.copy();
    this.sprites = sprites;
    this.context = context;
    this.angle = angle;
    this.radius = 10;
    this.idx = idx;
    this.level = level;
    this.type = type;
    this.speed = 5;
    this.hit = false;
    this.damage = damage;
    this.speed = speed;
    this.width = 18;
    this.height = 18;
  }

  run() {
    this.update();
    this.render();
  }

  update() {
    this.location.y += Math.sin(this.angle) * this.speed;
    this.location.x += Math.cos(this.angle) * this.speed;
    const w = this.context?.canvas?.width;
    const h = this.context?.canvas?.height;
    if (
      this.location.x > w ||
      this.location.x < 0 ||
      this.location.y > h ||
      this.location.y < 0
    ) {
      this.hit = true;
    }
  }

  render() {
    this.context.save();
    const prevSmoothing = this.context.imageSmoothingEnabled;
    this.context.imageSmoothingEnabled = true;

    this.context.translate(this.location.x, this.location.y);
    this.context.rotate(this.angle);
    const type = ["basic", "slow", "fast", "all"][this.idx];
    const img = this.sprites.attackCanvas?.[type]?.[this.level];
    if (img) {
      this.context.drawImage(img, -this.width / 2, -this.height / 2);
    }

    this.context.restore();
    this.context.imageSmoothingEnabled = prevSmoothing;
  }
}
