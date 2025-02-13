export function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

export function drawRoundedLShape(_ctx, color, lineWidth, from, to, config = {cornerRadius: 30}) {
    const {cornerRadius} = config
    const isRight = to.x > from.x // 是否向右绘制
    const isUp = to.y < from.y
    const midX = isRight ? from.x + cornerRadius : from.x - cornerRadius
    const midY = isUp ? to.y + cornerRadius : to.y - cornerRadius
    _ctx.beginPath();
    _ctx.moveTo(from.x, from.y);

    // 画竖线
    _ctx.lineTo(from.x, midY);

    // 画圆角
    _ctx.arcTo(from.x, to.y, midX, to.y, cornerRadius);
    // 画横线
    _ctx.moveTo(midX, to.y);
    _ctx.lineTo(to.x, to.y);

    _ctx.strokeStyle = color;
    _ctx.lineWidth = lineWidth;
    _ctx.stroke();
}
