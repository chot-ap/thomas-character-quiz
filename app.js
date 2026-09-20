/**
 * きかんしゃトーマス キャラクターあてクイズ
 */

// キャラクターデータ定義 (10体)
const CHARACTERS = [
  {
    id: "thomas",
    name: "トーマス",
    number: "1ばん",
    desc: "あおいろの タンクきかんしゃ",
    image: "images/thomas.jpg"
  },
  {
    id: "percy",
    name: "パーシー",
    number: "6ばん",
    desc: "みどりいろの ちいさなきかんしゃ",
    image: "images/percy.jpg"
  },
  {
    id: "james",
    name: "ジェームス",
    number: "5ばん",
    desc: "あかい ピカピカのきかんしゃ",
    image: "images/james.jpg"
  },
  {
    id: "gordon",
    name: "ゴードン",
    number: "4ばん",
    desc: "おおきくて つよいきゅうこうれっしゃ",
    image: "images/gordon.jpg"
  },
  {
    id: "henry",
    name: "ヘンリー",
    number: "3ばん",
    desc: "みどりいろの おおきなきかんしゃ",
    image: "images/henry.jpg"
  },
  {
    id: "edward",
    name: "エドワード",
    number: "2ばん",
    desc: "あおいろの やさしいきかんしゃ",
    image: "images/edward.jpg"
  },
  {
    id: "toby",
    name: "トビー",
    number: "7ばん",
    desc: "ちゃいろの しかくい ろめんきかんしゃ",
    image: "images/toby.jpg"
  },
  {
    id: "emily",
    name: "エミリー",
    number: "12ばん",
    desc: "ふかみどりの おおきなしゃりんのきかんしゃ",
    image: "images/emily.jpg"
  },
  {
    id: "hiro",
    name: "ヒロ",
    number: "51ばん",
    desc: "にほんからきた てつどうのえいゆう (D51)",
    image: "images/hiro.jpg"
  },
  {
    id: "diesel",
    name: "ディーゼル",
    number: "くろいろ",
    desc: "いたずらずきな ディーゼルきかんしゃ",
    image: "images/diesel.jpg"
  }
];

// サウンドエンジン (Web Audio API)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playWhistle() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // 汽笛コード (C5 + G5の重音)
    [523.25, 783.99].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      
      // フィルターで蒸気っぽい柔らかさに
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.setValueAtTime(0.12, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  playTick() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playCorrect() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // ピンポン音
    [659.25, 880].forEach((freq, idx) => {
      const startTime = now + (idx * 0.15);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playReveal() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((freq, idx) => {
      const startTime = now + (idx * 0.08);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  playFanfare() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, t: 0.12 },
      { f: 659.25, t: 0.12 },
      { f: 783.99, t: 0.12 },
      { f: 1046.5, t: 0.45 }
    ];
    let offset = 0;
    melody.forEach(item => {
      const startTime = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.t);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + item.t);
      offset += item.t * 0.85;
    });
  }
}

// 音声読み上げ
function speakName(text) {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ja-JP';
      utter.rate = 1.0;
      utter.pitch = 1.2;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.log('TTS unsupported or blocked:', e);
    }
  }
}

// ゲーム管理
class ThomasQuizApp {
  constructor() {
    this.sound = new SoundEngine();
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.selectedChoiceId = null;
    this.timerAnimationId = null;
    this.phase = "idle"; // 'thinking' | 'revealing' | 'done'

    // DOM要素
    this.screens = {
      start: document.getElementById("startScreen"),
      quiz: document.getElementById("quizScreen"),
      result: document.getElementById("resultScreen")
    };

    this.dom = {
      startBtn: document.getElementById("startBtn"),
      restartBtn: document.getElementById("restartBtn"),
      soundToggleBtn: document.getElementById("soundToggleBtn"),
      soundIcon: document.getElementById("soundIcon"),
      currentQuestionNum: document.getElementById("currentQuestionNum"),
      quizProgressBar: document.getElementById("quizProgressBar"),
      currentScore: document.getElementById("currentScore"),
      timerCircle: document.getElementById("timerCircle"),
      timerText: document.getElementById("timerText"),
      phaseMessage: document.getElementById("phaseMessage"),
      characterImage: document.getElementById("characterImage"),
      revealOverlay: document.getElementById("revealOverlay"),
      revealedName: document.getElementById("revealedName"),
      revealedMeta: document.getElementById("revealedMeta"),
      nextSeconds: document.getElementById("nextSeconds"),
      choicesGrid: document.getElementById("choicesGrid"),
      finalScore: document.getElementById("finalScore"),
      scoreComment: document.getElementById("scoreComment"),
      charactersGallery: document.getElementById("charactersGallery")
    };

    this.bindEvents();
    this.renderResultGallery();
  }

  bindEvents() {
    this.dom.startBtn.addEventListener("click", () => {
      this.sound.init();
      this.sound.playWhistle();
      this.startGame();
    });

    this.dom.restartBtn.addEventListener("click", () => {
      this.sound.playWhistle();
      this.startGame();
    });

    this.dom.soundToggleBtn.addEventListener("click", () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundIcon.textContent = this.sound.enabled ? "🔊" : "🔇";
      if (this.sound.enabled) {
        this.sound.init();
        this.sound.playWhistle();
      }
    });
  }

  switchScreen(screenName) {
    Object.values(this.screens).forEach(screen => screen.classList.remove("active"));
    this.screens[screenName].classList.add("active");
  }

  startGame() {
    // 10問の出題リスト作成 (全10体をシャッフル)
    this.questions = [...CHARACTERS].sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.score = 0;
    this.dom.currentScore.textContent = "0";

    this.switchScreen("quiz");
    this.loadQuestion();
  }

  loadQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.finishGame();
      return;
    }

    const currentQ = this.questions[this.currentIndex];
    this.selectedChoiceId = null;
    this.phase = "thinking";

    // UI更新
    this.dom.currentQuestionNum.textContent = this.currentIndex + 1;
    this.dom.quizProgressBar.style.width = `${((this.currentIndex) / this.questions.length) * 100}%`;
    this.dom.phaseMessage.textContent = "このきかんしゃは だーれだ？";
    this.dom.characterImage.src = currentQ.image;
    this.dom.revealOverlay.classList.remove("active");

    // 4択選択肢の作成 (正解1 + 誤答3)
    const incorrectChoices = CHARACTERS.filter(c => c.id !== currentQ.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [currentQ, ...incorrectChoices].sort(() => Math.random() - 0.5);

    this.dom.choicesGrid.innerHTML = "";
    choices.forEach(c => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = c.name;
      btn.dataset.id = c.id;

      btn.addEventListener("click", () => {
        if (this.phase !== "thinking" || this.selectedChoiceId !== null) return;
        this.selectedChoiceId = c.id;
        btn.classList.add("selected");
        this.sound.playTick();
      });

      this.dom.choicesGrid.appendChild(btn);
    });

    // 10秒シンキングタイムのカウントダウン開始
    this.startThinkingTimer(10000);
  }

  // 10秒のカウントダウン (シンキング)
  startThinkingTimer(durationMs) {
    const startTime = performance.now();
    const circumference = 264; // 2 * pi * 42
    let lastSecond = Math.ceil(durationMs / 1000);

    // タイマーサークル初期化
    this.dom.timerCircle.style.stroke = "var(--accent-red)";
    this.dom.timerText.style.color = "var(--accent-red)";
    this.dom.timerCircle.style.strokeDashoffset = "0";
    this.dom.timerText.textContent = lastSecond.toString();
    this.sound.playTick();

    const update = (now) => {
      const elapsed = now - startTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      // チクタク音
      if (remainingSec !== lastSecond && remainingSec > 0) {
        this.sound.playTick();
        lastSecond = remainingSec;
      }

      this.dom.timerText.textContent = remainingSec > 0 ? remainingSec : "0";

      // 進行度 (0 -> 264)
      const progress = elapsed / durationMs;
      const offset = circumference * progress;
      this.dom.timerCircle.style.strokeDashoffset = `${offset}`;

      if (elapsed < durationMs) {
        this.timerAnimationId = requestAnimationFrame(update);
      } else {
        // 3秒経過 -> 正解発表フェーズへ！
        this.revealAnswer();
      }
    };

    cancelAnimationFrame(this.timerAnimationId);
    this.timerAnimationId = requestAnimationFrame(update);
  }

  // 正解発表 (3秒間表示)
  revealAnswer() {
    this.phase = "revealing";
    const currentQ = this.questions[this.currentIndex];

    // 正解・不正解の判定
    const isCorrect = this.selectedChoiceId === currentQ.id;
    if (isCorrect) {
      this.score++;
      this.dom.currentScore.textContent = this.score;
      this.sound.playCorrect();
    } else {
      this.sound.playReveal();
    }

    // 音声読み上げ
    speakName(currentQ.name);

    // 選択肢ボタンスタイル反映
    const choiceButtons = this.dom.choicesGrid.querySelectorAll(".choice-btn");
    choiceButtons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.id === currentQ.id) {
        btn.classList.add("correct");
      } else if (btn.dataset.id === this.selectedChoiceId) {
        btn.classList.add("wrong");
      }
    });

    // 正解オーバーレイ表示
    this.dom.revealedName.textContent = currentQ.name;
    this.dom.revealedMeta.textContent = `${currentQ.number}・${currentQ.desc}`;
    this.dom.phaseMessage.textContent = `せいかいは「${currentQ.name}」！`;
    this.dom.revealOverlay.classList.add("active");

    // 3秒カウントダウン (正解発表から次の問題へ)
    this.startRevealTimer(3000);
  }

  // 3秒カウントダウン (正解発表後 -> 次の問題)
  startRevealTimer(durationMs) {
    const startTime = performance.now();
    const circumference = 264;
    let lastSecond = 3;

    this.dom.timerCircle.style.stroke = "var(--accent-green)";
    this.dom.timerText.style.color = "var(--accent-green)";
    this.dom.timerCircle.style.strokeDashoffset = "0";
    this.dom.timerText.textContent = "3";
    this.dom.nextSeconds.textContent = "3";

    const update = (now) => {
      const elapsed = now - startTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      if (remainingSec !== lastSecond && remainingSec > 0) {
        lastSecond = remainingSec;
        this.dom.nextSeconds.textContent = remainingSec;
      }

      this.dom.timerText.textContent = remainingSec > 0 ? remainingSec : "0";
      const progress = elapsed / durationMs;
      const offset = circumference * progress;
      this.dom.timerCircle.style.strokeDashoffset = `${offset}`;

      if (elapsed < durationMs) {
        this.timerAnimationId = requestAnimationFrame(update);
      } else {
        // 3秒経過 -> 次の問題へ！
        this.currentIndex++;
        this.loadQuestion();
      }
    };

    cancelAnimationFrame(this.timerAnimationId);
    this.timerAnimationId = requestAnimationFrame(update);
  }

  finishGame() {
    this.phase = "done";
    cancelAnimationFrame(this.timerAnimationId);
    this.dom.quizProgressBar.style.width = "100%";
    this.dom.finalScore.textContent = this.score;

    // スコアに応じたコメント
    if (this.score === 10) {
      this.dom.scoreComment.textContent = "たいへんよくできました！ きみはパーフェクト・トーマスはかせだ！ 🌟";
    } else if (this.score >= 7) {
      this.dom.scoreComment.textContent = "すごい！ トーマスのなかまたちを よくしっているね！ 🚂";
    } else if (this.score >= 4) {
      this.dom.scoreComment.textContent = "がんばったね！ なんどもあそんで なかよくなろう！ 🛤️";
    } else {
      this.dom.scoreComment.textContent = "たのしくおぼえよう！ もういっかいちょうせんしてみてね！ 💨";
    }

    this.switchScreen("result");
    this.sound.playFanfare();
  }

  renderResultGallery() {
    this.dom.charactersGallery.innerHTML = "";
    CHARACTERS.forEach(c => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
        <img src="${c.image}" alt="${c.name}" loading="lazy">
        <div class="gallery-name">${c.name}</div>
      `;
      this.dom.charactersGallery.appendChild(item);
    });
  }
}

// 起動
document.addEventListener("DOMContentLoaded", () => {
  new ThomasQuizApp();
});
