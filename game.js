const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;

const words = [];
const targets = [];
const beams = []; // Mảng chứa các hiệu ứng tia
let score = 0; // Biến tính điểm
let speedMultiplier = 0.5; // Hệ số nhân tốc độ rơi

// Tạo ô nhập liệu
const inputField = document.createElement("input");
inputField.type = "text";
inputField.id = "gameInput";
inputField.autocomplete = "off";
inputField.style.position = "absolute";
inputField.style.bottom = "20px";
inputField.style.left = "50%";
inputField.style.transform = "translateX(-50%)";
inputField.style.fontSize = "20px";
inputField.style.padding = "5px";
document.body.appendChild(inputField);

// Function để thêm từ vựng
function addWords(newWords) {
  words.push(...newWords);
}

// Function để tạo mục tiêu ngẫu nhiên không vượt qua 2 bên canvas
function spawnTarget() {
  if (words.length === 0) return;
  ctx.font = "20px Arial"; // Đặt font trước khi đo
  const word = words[Math.floor(Math.random() * words.length)];
  const textWidth = ctx.measureText(word).width;

  const margin = 20; // Khoảng cách từ viền
  let x = margin;
  if (canvas.width - margin * 2 > textWidth) {
    x = Math.random() * (canvas.width - textWidth - margin * 2) + margin;
  }
  const y = 0;
  const speed = (Math.random() * 2 + 1) * speedMultiplier;
  targets.push({ word, x, y, speed });
}

// Hàm cập nhật và vẽ các mục tiêu (với ô chữ) cùng bảng điểm và hiệu ứng tia
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Thông số cho ô chữ
  const fontSize = 20;
  const padding = 10;
  ctx.font = fontSize + "px Arial";

  // Vẽ các mục tiêu (ô chữ chứa từ)
  for (let i = targets.length - 1; i >= 0; i--) {
    const target = targets[i];
    target.y += target.speed;

    // Nếu ô chữ sắp vượt quá đáy canvas, xóa bỏ nó
    if (target.y > canvas.height - (fontSize + padding * 2)) {
      targets.splice(i, 1);
      continue;
    }

    const textWidth = ctx.measureText(target.word).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = fontSize + padding * 2;

    // Vẽ nền ô chữ
    ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
    ctx.fillRect(target.x, target.y, boxWidth, boxHeight);

    // Vẽ viền ô chữ
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(target.x, target.y, boxWidth, boxHeight);

    // Vẽ từ bên trong ô chữ
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const textX = target.x + padding;
    const textY = target.y + boxHeight / 2;
    ctx.fillText(target.word, textX, textY);
  }

  // Vẽ bảng điểm ở góc trên bên phải
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "right";
  ctx.fillText("Score: " + score, canvas.width - 20, 40);

  // Vẽ các hiệu ứng tia
  for (let i = beams.length - 1; i >= 0; i--) {
    const beam = beams[i];
    // Tính alpha giảm dần theo thời gian (life)
    const alpha = beam.life / beam.maxLife;
    ctx.strokeStyle = `rgb(255,0,0)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beam.startX, beam.startY);
    ctx.lineTo(beam.endX, beam.endY);
    ctx.stroke();
    // Giảm thời gian sống của tia
    beam.life--;
    if (beam.life <= 0) {
      beams.splice(i, 1);
    }
  }

  requestAnimationFrame(update);
}

// Lắng nghe sự kiện khi người chơi gõ vào ô nhập
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const inputWord = inputField.value.trim();
    for (let i = targets.length - 1; i >= 0; i--) {
      if (targets[i].word === inputWord) {
        // Tạo hiệu ứng tia từ ô nhập đến ô chữ đó trước khi xóa mục tiêu

        // Tính vị trí ô nhập trên canvas
        const canvasRect = canvas.getBoundingClientRect();
        const inputRect = inputField.getBoundingClientRect();
        const startX = inputRect.left + inputRect.width / 2 - canvasRect.left;
        const startY = inputRect.top + inputRect.height / 2 - canvasRect.top;

        // Tính tâm của ô chữ chứa từ
        ctx.font = "20px Arial";
        const textWidth = ctx.measureText(targets[i].word).width;
        const padding = 10;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 20 + padding * 2; // fontSize = 20
        const endX = targets[i].x + boxWidth / 2;
        const endY = targets[i].y + boxHeight / 2;

        // Thêm hiệu ứng tia: life và maxLife đặt là 30 frame (có thể điều chỉnh)
        beams.push({ startX, startY, endX, endY, life: 30, maxLife: 30 });

        // Tăng điểm và xóa mục tiêu
        targets.splice(i, 1);
        score++;
        break;
      }
    }
    inputField.value = "";
  }
});

// Tạo mục tiêu mới theo khoảng thời gian (mỗi 5000ms)
setInterval(spawnTarget, 5000);
update();
addWords([
  "apple",
  "banana",
  "chicken",
  "elephant",
  "guitar",
  "ocean",
  "pencil",
  "tiger",
]);
