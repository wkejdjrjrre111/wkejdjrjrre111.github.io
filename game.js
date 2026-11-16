
  const stage = document.getElementById('stage');
  const wrap = document.getElementById('stageWrap');
  const face = document.getElementById('face');
  const faceFx = document.getElementById('faceFx');
  const title = document.getElementById('title');
  const hint = document.getElementById('hint');
  const snow = document.getElementById('snow');
  const display = document.getElementById('display');
  const status = document.getElementById('status');
  const holdPill = document.getElementById('holdPill');
  const resetBtn = document.getElementById('resetBtn');

  const blanket = document.getElementById('blanket');
  const phone = document.getElementById('phone');
  const remote = document.getElementById('remote');
  const windowEl = document.getElementById('window');
  const door = document.getElementById('door');
  const switchEl = document.getElementById('switch');
  const wardrobe = document.getElementById('wardrobe');
  const sweater = document.getElementById('sweater');
  const toast = document.getElementById('toast');
  const outBtn = document.getElementById('outBtn');
  const water = document.getElementById('water');

  const hallScene = document.getElementById('hallScene');
  const bathScene = document.getElementById('bathScene');
  const walker = document.getElementById('walker');
  const bathDoor = document.getElementById('bathDoor');
  const bathTitle = document.getElementById('bathTitle');
  const sitBtn = document.getElementById('sitBtn');
  const bather = document.getElementById('bather');
  const undressBtn = document.getElementById('undressBtn');
  const washBtn = document.getElementById('washBtn');

  const washScene = document.getElementById('washScene');
  const washTitle = document.getElementById('washTitle');
  const washer = document.getElementById('washer');
  const waterBtn = document.getElementById('waterBtn');
  const dryBtn = document.getElementById('dryBtn');
  const towel = document.getElementById('towel');

  const nightstand = document.getElementById('nightstand');
  const pillEl = document.getElementById('pill');

  const diningScene = document.getElementById('diningScene');
  const diningTitle = document.getElementById('diningTitle');
  const bowl = document.getElementById('bowl');
  const diner = document.getElementById('diner');
  const sitDine = document.getElementById('sitDine');
  const eatBtn = document.getElementById('eatBtn');
  const roomDoor = document.querySelector('.big-door.room-side');
  const tempInput = document.getElementById('tempInput');
  const tempEval = document.getElementById('tempEval');

  // 四种取暖来源 + 窗户 / 门 / 灯
  const state = {
    covered: false,
    worn: false,
    phone: false,
    ac: false,
    windowOpen: false,
    wardrobeOpen: false,
    doorOpen: false,
    lightsOff: false,
    drank: false,
    relieved: false,
    overdue: false,
    openDrawer: false,
    pill: false,
    pillGone: false,
    poisoned: false,
    diningSat: false,
    ate: false
  };

  /* ===== 舞台等比缩放（内部仍是 500×660 画布，外框按比例占位）===== */
  function fit() {
    const k = Math.max(.32, Math.min(1,
      Math.min((window.innerWidth - 24) / 500, (window.innerHeight - 24) / 660)));
    stage.style.transformOrigin = 'top left';
    stage.style.transform = 'scale(' + k + ')';
    wrap.style.width = (500 * k).toFixed(1) + 'px';
    wrap.style.height = (660 * k).toFixed(1) + 'px';
  }

  window.addEventListener('resize', fit);

  /* ===== 可见才可聚焦 ===== */
  let currentView = 'room';

  function syncFocus() {
    [hallScene, bathScene, washScene, diningScene].forEach(function (sc) {
      const on = sc.classList.contains('active');
      sc.querySelectorAll('button, input').forEach(function (el) {
        el.setAttribute('tabindex', on ? '0' : '-1');
      });
    });
    outBtn.setAttribute('tabindex', (currentView === 'room' && state.doorOpen) ? '0' : '-1');
    sweater.setAttribute('tabindex', state.wardrobeOpen ? '0' : '-1');
  }

  const SNOW_DOTS = [
    [6, 80, 4, 0],    [16, 180, 5, 1.1], [26, 40, 4, 2.2],
    [36, 260, 4, .6], [46, 110, 5, 1.8], [56, 320, 4, 2.8],
    [66, 60, 4, .3],  [76, 380, 4, 3.3], [86, 200, 5, 2.5],
    [94, 300, 4, 1.5], [12, 420, 4, 3.8], [32, 480, 4, .9],
    [52, 20, 5, 4.2], [72, 140, 4, 2.0], [88, 440, 4, 3.0],
    [42, 360, 4, 1.2]
  ];

  SNOW_DOTS.forEach(function (d) {
    const el = document.createElement('i');
    el.style.left = d[0] + '%';
    el.style.top = d[1] + 'px';
    el.style.width = d[2] + 'px';
    el.style.height = d[2] + 'px';
    el.style.animationDuration = d[3] + 's';
    snow.appendChild(el);
  });

  function activeCount() {
    return (state.covered ? 1 : 0) + (state.worn ? 1 : 0) +
           (state.phone ? 1 : 0) + (state.ac ? 1 : 0);
  }

  // 开窗后更冷，需要两种取暖方式同时生效
  function needs() {
    return state.windowOpen ? 2 : 1;
  }

  function isWarm() {
    return activeCount() >= needs();
  }

  // 关灯的前提：盖上被子 + 关上窗（开门不受限制）
  function canLightOff() {
    return state.covered && !state.windowOpen;
  }

  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function sourceNames() {
    const n = [];
    if (state.covered) n.push('被子');
    if (state.worn) n.push('毛衣');
    if (state.phone) n.push('小米11');
    if (state.ac) n.push('空调');
    return n;
  }

  function pickTitle() {
    if (state.drank) return '喝了水，它憋得慌';
    if (state.lightsOff) {
      return state.doorOpen ? '灯关了，门外还站着一个 🙂' : '灯关了，它睡得很香';
    }
    if (state.doorOpen) return '门开了，门外站着另一个 🙂';

    if (isWarm()) {
      const names = sourceNames();
      const suffix = ['', '，真暖和', '，双倍温暖', '，三重温暖', '，四重温暖'][names.length] || '';
      if (state.windowOpen) return '开着窗也扛住了：' + names.join(' + ');
      return names.join(' + ') + suffix;
    }

    if (state.windowOpen) {
      return activeCount() === 0 ? '开了窗，冷风灌进来了' : '还是冷，再想一种办法';
    }
    return '好冷呀，快帮帮它';
  }

  function moodFace() {
    if (state.drank) {
      if (state.overdue) return '😖';
      return state.poisoned ? '😫' : '😣';
    }
    return isWarm() ? '🙂' : '🥶';
  }

  let lastFace = '';

  function setText(el, s) {
    if (el.textContent !== s) el.textContent = s;
  }

  function bump() {
    faceFx.classList.remove('bounce');
    void faceFx.offsetWidth;
    faceFx.classList.add('bounce');
  }

  function syncFaces() {
    const f = moodFace();
    faceFx.textContent = f;
    walker.textContent = f;
    bather.textContent = state.relieved ? '😌' : f;
    diner.textContent = state.ate ? '😋' : f;
    if (f !== lastFace) {
      lastFace = f;
      bump();
    }
  }

  function render() {
    const warm = isWarm();

    stage.classList.toggle('warm', warm);
    stage.classList.toggle('covered', state.covered);
    stage.classList.toggle('worn', state.worn);
    stage.classList.toggle('phone-on', state.phone);
    stage.classList.toggle('ac-on', state.ac);
    stage.classList.toggle('window-open', state.windowOpen);
    stage.classList.toggle('wardrobe-open', state.wardrobeOpen);
    stage.classList.toggle('door-open', state.doorOpen);
    stage.classList.toggle('dark', state.lightsOff);
    snow.classList.toggle('hide', warm);
    water.classList.toggle('drank', state.drank);
    water.classList.toggle('pilled', state.pill);
    nightstand.classList.toggle('open', state.openDrawer);
    nightstand.classList.toggle('taken', state.pillGone);
    diningScene.classList.toggle('sat', state.diningSat);
    diningScene.classList.toggle('ate', state.ate);

    syncFaces();
    setText(title, pickTitle());
    display.textContent = state.ac ? '26°C HEAT' : '—';

    if (state.drank) {
      setText(status, state.poisoned
        ? '拉肚子 · 先穿毛衣再去厕所'
        : (state.overdue ? '没憋住 · 先穿毛衣再去厕所' : '憋着呢 · 先穿毛衣再去厕所'));
    } else if (!warm) {
      setText(status, '需要 ' + needs() + ' 种取暖 · 已有 ' + activeCount() + ' 种');
    } else if (!canLightOff()) {
      setText(status, '已暖和 · 关灯需盖被并关窗');
    } else {
      setText(status, state.lightsOff ? '灯已关 · 晚安' : '已暖和 · 可以关灯了');
    }

    if (state.drank) {
      setText(hint, (state.worn ? '' : '先穿毛衣 · ') + '出去 · 进厕所 · 坐上马桶');
    } else if (!warm) {
      const todo = [];
      if (!state.covered) todo.push('盖被子');
      if (!state.worn) todo.push('换毛衣');
      if (!state.phone) todo.push('小米11');
      if (!state.ac) todo.push('遥控器');
      if (state.windowOpen) todo.push('关窗');
      setText(hint, todo.join(' · '));
    } else {
      const p = [];
      p.push(state.doorOpen ? '点门关门' : '点门看看门外');
      if (canLightOff()) p.push(state.lightsOff ? '点开关开灯' : '点开关关灯');
      if (!state.drank) p.push('点水杯喝水');
      setText(hint, p.join(' · '));
    }

    syncFocus();
  }

  function toggle(key) {
    state[key] = !state[key];
    // 关灯的前提被破坏时，灯自动亮回来（门不受影响）
    if (!canLightOff()) state.lightsOff = false;
    render();
  }

  // 通用触发：点击 + 回车/空格（所有可点元素共用一套）
  function bindAction(el, handler) {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      handler();
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  }

  function bind(el, key) {
    bindAction(el, function () { toggle(key); });
  }

  // 衣柜：开门 / 关门
  bindAction(wardrobe, function () {
    state.wardrobeOpen = !state.wardrobeOpen;
    render();
  });

  // 里面的毛衣：穿上 / 脱下
  bindAction(sweater, function () {
    state.worn = !state.worn;
    render();
  });

  // 关灯前先检查前提
  function needBedFirst() {
    if (canLightOff()) return false;
    if (!state.covered && state.windowOpen) showToast('关灯前：先盖被子、关上窗');
    else if (!state.covered) showToast('先盖上被子，才能关灯');
    else showToast('先关上窗，才能关灯');
    return true;
  }

  // 门随时可以开
  bindAction(door, function () {
    state.doorOpen = !state.doorOpen;
    render();
  });

  // 开关：前提不满足时抖一下
  bindAction(switchEl, function () {
    if (needBedFirst()) {
      switchEl.classList.remove('shake');
      void switchEl.offsetWidth;
      switchEl.classList.add('shake');
      return;
    }
    state.lightsOff = !state.lightsOff;
    render();
  });

  bind(blanket, 'covered');
  bind(phone, 'phone');
  bind(remote, 'ac');
  bind(windowEl, 'windowOpen');

  /* ===== 场景切换 ===== */
  let bathTimer = null;
  let sitting = false;
  let sitTimer = null;
  let sitLeft = 10;

  function setScene(name) {
    currentView = name;
    stage.classList.toggle('view-hall', name === 'hall');
    stage.classList.toggle('view-bath', name === 'bath');
    stage.classList.toggle('view-wash', name === 'wash');
    stage.classList.toggle('view-dining', name === 'dining');
    hallScene.classList.toggle('active', name === 'hall');
    bathScene.classList.toggle('active', name === 'bath');
    washScene.classList.toggle('active', name === 'wash');
    diningScene.classList.toggle('active', name === 'dining');
    hallScene.setAttribute('aria-hidden', String(name !== 'hall'));
    bathScene.setAttribute('aria-hidden', String(name !== 'bath'));
    washScene.setAttribute('aria-hidden', String(name !== 'wash'));
    diningScene.setAttribute('aria-hidden', String(name !== 'dining'));

    if (name !== 'bath' && sitting) {
      stopSit();
      standUp();
    }
    if (name !== 'hall') {
      bathDoor.classList.remove('open');
      roomDoor.classList.remove('open');
    }
    if (name === 'hall' || name === 'room' || name === 'dining') {
      walker.classList.remove('walking');
      walker.classList.remove('walk-in');
    }
    if (name === 'bath') {
      bathTitle.textContent = state.relieved ? '舒服了～可以洗澡了' : '厕所';
    }
    syncBathButtons();
    syncFocus();
  }

  // 房间里的「出去」：前提是穿上衣服，走向门口再切场景
  let exitTimer = null;

  bindAction(outBtn, function () {
    if (!state.worn) {
      showToast('先穿上衣服，才能出去');
      return;
    }
    state.lightsOff = false;
    render();
    stage.classList.add('leaving-room');
    clearTimeout(exitTimer);
    exitTimer = setTimeout(function () {
      stage.classList.remove('leaving-room');
      setScene('hall');
    }, 720);
  });

  // 走廊：回房间（房间门打开 + 走进去）
  bindAction(document.getElementById('toRoom'), function () {
    clearTimeout(bathTimer);
    clearTimeout(exitTimer);
    roomDoor.classList.add('open');
    walker.classList.add('walk-in');
    exitTimer = setTimeout(function () {
      setScene('room');
    }, 900);
  });

  // 走廊：去吃饭的地方
  bindAction(document.getElementById('toDining'), function () {
    clearTimeout(bathTimer);
    clearTimeout(exitTimer);
    walker.classList.add('walking');
    exitTimer = setTimeout(function () {
      setScene('dining');
    }, 900);
  });

  // 餐厅：去走廊
  bindAction(document.getElementById('diningBack'), function () {
    setScene('hall');
  });

  // 餐厅：坐上去 / 站起来
  bindAction(sitDine, function () {
    state.diningSat = !state.diningSat;
    sitDine.textContent = state.diningSat ? '站起来' : '坐上去';
    render();
    diningTitle.textContent = state.diningSat ? '坐下啦，桌上有面' : '吃饭的地方';
    showToast(state.diningSat ? '坐下来，准备开吃' : '站起来了');
  });

  // 餐厅：吃
  bindAction(eatBtn, function () {
    if (!state.diningSat) {
      showToast('先坐上去再吃');
      return;
    }
    if (state.ate) {
      showToast('已经吃完了');
      return;
    }
    state.ate = true;
    bowl.textContent = '🥣';
    render();
    diningTitle.textContent = '吃饱了，真满足';
    showToast('一口下去，好满足');
  });

  // 走廊：进厕所（先开厕所门，再走进去）
  function enterBath() {
    if (!hallScene.classList.contains('active')) return;
    clearTimeout(bathTimer);
    bathDoor.classList.add('open');
    walker.classList.add('walking');
    bathTimer = setTimeout(function () {
      sitting = false;
      bathScene.classList.remove('sitting');
      sitBtn.textContent = '坐上马桶';
      setScene('bath');
    }, 950);
  }

  bindAction(document.getElementById('toBath'), enterBath);
  bindAction(bathDoor, enterBath);

  // 厕所：出去
  bindAction(document.getElementById('bathOut'), function () {
    clearTimeout(bathTimer);
    stopSit();
    standUp();
    setScene('hall');
  });

  // 厕所：坐上马桶 → 等一会儿（正常 10 秒，憋输了要 20 秒）
  function stopSit() {
    clearInterval(sitTimer);
    sitTimer = null;
    sitLeft = 10;
  }

  function standUp() {
    sitting = false;
    bathScene.classList.remove('sitting');
    sitBtn.textContent = '坐上马桶';
    bathTitle.textContent = state.relieved ? '舒服了～可以洗澡了' : '厕所';
  }

  function sitDown() {
    sitting = true;
    state.relieved = false;
    bathScene.classList.add('sitting');
    sitBtn.textContent = '站起来';
    sitLeft = state.overdue ? 20 : 10;
    bathTitle.textContent = '坐着… 还剩 ' + sitLeft + ' 秒';
    clearInterval(sitTimer);
    sitTimer = setInterval(function () {
      sitLeft -= 1;
      if (sitLeft > 0) {
        bathTitle.textContent = '坐着… 还剩 ' + sitLeft + ' 秒';
        return;
      }
      clearInterval(sitTimer);
      sitTimer = null;
      state.relieved = true;
      state.drank = false;
      state.overdue = false;
      state.poisoned = false;
      stopHold();
      render();
      bathTitle.textContent = '舒服了～可以洗澡了';
      showToast('终于舒服了，去洗个澡吧');
    }, 1000);
  }

  bindAction(sitBtn, function () {
    if (sitting) {
      stopSit();
      standUp();
    } else {
      sitDown();
    }
  });

  // 厕所：脱掉毛衣 / 穿上毛衣
  function syncBathButtons() {
    undressBtn.textContent = state.worn ? '脱掉毛衣' : '穿上毛衣';
  }

  bindAction(undressBtn, function () {
    state.worn = !state.worn;
    syncBathButtons();
    render();
    showToast(state.worn ? '把毛衣穿回去了' : '衣服脱掉了');
  });

  /* ===== 浴室的水温 ===== */
  function tempValue() {
    let v = parseInt(tempInput.value, 10);
    if (isNaN(v)) v = 38;
    return Math.max(30, Math.min(42, v));
  }

  function evalTemp(v) {
    if (v <= 32) return ['🥶', '冰凉的水，一激灵'];
    if (v <= 35) return ['🥶', '有点凉，起鸡皮疙瘩'];
    if (v <= 37) return ['🙂', '温水，还行'];
    if (v <= 39) return ['😌', '刚刚好，舒服到叹气'];
    if (v <= 40) return ['😅', '有点烫了，脚不敢放'];
    return ['🥵', '太烫了！快调低一点'];
  }

  function updateTemp() {
    const v = tempValue();
    const pick = evalTemp(v);
    if (washScene.classList.contains('on')) {
      washer.textContent = pick[0];
      tempEval.textContent = v + '°C · ' + pick[1];
      washTitle.textContent = '洗澡 · ' + v + '°C';
    } else {
      tempEval.textContent = v + '°C · 水还没开';
    }
  }

  function resetWash() {
    washScene.classList.remove('on');
    washScene.classList.remove('dried');
    waterBtn.textContent = '打开水';
    washer.textContent = '😐';
    washTitle.textContent = '浴室 · 水还没开';
    tempEval.textContent = '30–42 度之间调一调';
  }

  // 擦身体：水必须已经关掉
  bindAction(dryBtn, function () {
    if (washScene.classList.contains('on')) {
      showToast('先关掉水，再擦');
      return;
    }
    if (washScene.classList.contains('dried')) {
      showToast('已经擦干了');
      return;
    }
    washScene.classList.add('dried');
    washer.textContent = '😌';
    washTitle.textContent = '擦干了 · 一身清爽';
    tempEval.textContent = '毛巾擦一擦，又干又暖';
    showToast('擦干了，舒服');
  });

  // 去洗澡：先脱衣服，走过一段再进浴室
  bindAction(washBtn, function () {
    if (!state.relieved) {
      showToast('先坐上马桶，等一会儿');
      return;
    }
    if (state.worn) {
      showToast('先把毛衣脱掉，才能洗澡');
      return;
    }
    if (sitting) {
      stopSit();
      standUp();
    }
    clearTimeout(bathTimer);
    bather.classList.add('goto-wash');
    bathTimer = setTimeout(function () {
      bather.classList.remove('goto-wash');
      resetWash();
      setScene('wash');
    }, 900);
  });

  bindAction(waterBtn, function () {
    const on = washScene.classList.toggle('on');
    waterBtn.textContent = on ? '关掉水' : '打开水';
    if (!on) {
      washer.textContent = '😐';
      washTitle.textContent = '浴室 · 水关了';
      tempEval.textContent = '水关了，冲一冲就好';
      return;
    }
    washScene.classList.remove('dried');
    tempInput.value = String(tempValue());
    updateTemp();
  });

  tempInput.addEventListener('input', updateTemp);
  tempInput.addEventListener('change', function () {
    tempInput.value = String(tempValue());
    updateTemp();
  });

  bindAction(document.getElementById('washOut'), function () {
    resetWash();
    setScene('bath');
  });

  /* ===== 憋尿：1 分钟，超时就得罚等 ===== */
  let holdTimer = null;
  let holdLeft = 60;

  function holdSeconds() {
    return state.poisoned ? 30 : 60;
  }

  function stopHold() {
    clearInterval(holdTimer);
    holdTimer = null;
    holdPill.classList.remove('show');
  }

  function startHold() {
    clearInterval(holdTimer);
    holdLeft = holdSeconds();
    state.overdue = false;
    holdPill.textContent = '还能憋 ' + holdLeft + ' 秒';
    holdPill.classList.add('show');
    holdTimer = setInterval(function () {
      holdLeft -= 1;
      if (holdLeft > 0) {
        holdPill.textContent = '还能憋 ' + holdLeft + ' 秒';
        render();
        return;
      }
      clearInterval(holdTimer);
      holdTimer = null;
      state.overdue = true;
      holdPill.textContent = '没憋住…';
      showToast('糟了，没憋住');
      if (sitting) {
        stopSit();
        sitDown();
      }
      render();
    }, 1000);
  }

  // 水杯：喝掉这杯水（如果丢过药片，就会闹肚子）
  bindAction(water, function () {
    if (state.drank) {
      showToast('杯子已经空了');
      return;
    }
    const wasPill = state.pill;
    state.drank = true;
    state.relieved = false;
    state.pill = false;
    if (wasPill) state.poisoned = true;
    render();
    startHold();
    showToast(wasPill ? '药水喝下去了，肚子咕咕叫' : '咕咚咕咚，有点急了');
  });

  // 床头柜：拉开抽屉
  bindAction(nightstand, function () {
    state.openDrawer = !state.openDrawer;
    render();
    if (state.openDrawer) showToast(state.pill ? '抽屉里空了' : '抽屉里有一颗药片');
    else showToast('抽屉关上了');
  });

  // 药片：丢进水里
  bindAction(pillEl, function () {
    if (!state.openDrawer) {
      showToast('先打开抽屉');
      return;
    }
    if (state.pillGone) {
      showToast('抽屉里已经没有药片了');
      return;
    }
    if (state.drank) {
      showToast('杯子空了，先重新开始吧');
      return;
    }
    state.pill = true;
    state.pillGone = true;
    render();
    showToast('药片丢进水里，化开了');
  });

  /* ===== 重新开始 ===== */
  bindAction(resetBtn, function () {
    Object.keys(state).forEach(function (k) { state[k] = false; });
    clearTimeout(bathTimer);
    clearTimeout(exitTimer);
    stage.classList.remove('leaving-room');
    stopSit();
    stopHold();
    sitting = false;
    bathScene.classList.remove('sitting');
    sitBtn.textContent = '坐上马桶';
    resetWash();
    tempInput.value = '38';
    bowl.textContent = '🍜';
    diningTitle.textContent = '吃饭的地方';
    sitDine.textContent = '坐上去';
    syncBathButtons();
    setScene('room');
    render();
    showToast('重新开始了');
  });

  fit();
  render();
