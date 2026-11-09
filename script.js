const dateLabel = document.getElementById("date-label");
const menuArea = document.getElementById("menu-area");
const rouletteDisplay = document.getElementById("roulette-display");
const rouletteInfo = document.getElementById("roulette-info");
const rouletteButton = document.getElementById("roulette-button");
const soundButton = document.getElementById("sound-button");
const wheel = document.getElementById("wheel");

let meals = [];
let drinks = [];

function todayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
}

function formatDate(date) {
    const parts = date.split("-");
    const week = ["日", "月", "火", "水", "木", "金", "土"];
    const day = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getDay();
    return Number(parts[1]) + "/" + Number(parts[2]) + "（" + week[day] + "）";
}

function shuffle(list) {
    const result = list.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}

function shopClass(shop) {
    if (shop === "学生食堂") {
        return "shop-a";
    }
    return "shop-b";
}

function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function renderMenu() {
    menuArea.innerHTML = "";

    meals.forEach(function(meal) {
        const card = makeElement("div", "menu-card");

        const top = makeElement("div", "menu-top");
        top.appendChild(makeElement("span", "menu-category", meal.category));
        top.appendChild(makeElement("span", "menu-shop " + shopClass(meal.shop), meal.shop));

        const name = makeElement("p", "menu-name", meal.name);

        const bottom = makeElement("div", "menu-bottom");
        const price = makeElement("span", "menu-price", meal.price);
        price.appendChild(makeElement("small", "", "円"));
        bottom.appendChild(price);
        bottom.appendChild(makeElement("span", "menu-kcal", meal.kcal + " kcal"));

        const bar = makeElement("div", "kcal-bar");
        const fill = makeElement("span");
        fill.style.width = Math.min(meal.kcal / 1000 * 100, 100) + "%";
        bar.appendChild(fill);

        card.appendChild(top);
        card.appendChild(name);
        card.appendChild(bottom);
        card.appendChild(bar);

        meal.card = card;
        menuArea.appendChild(card);
    });
}

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        filterButtons.forEach(function(item) {
            item.classList.remove("active");
        });
        button.classList.add("active");

        const shop = button.dataset.shop;
        meals.forEach(function(meal) {
            meal.card.hidden = shop !== "all" && meal.shop !== shop;
        });
    });
});

function highlight(meal) {
    meals.forEach(function(item) {
        item.card.classList.remove("hit");
    });
    meal.card.classList.add("hit");
}

const colors = {
    "学生食堂": ["#f0a35e", "#f8c88f"],
    "7号館CAFE": ["#6fb08f", "#a8d3bb"]
};
const size = 340;
let rotation = 0;

function drawWheel() {
    const ratio = window.devicePixelRatio || 1;
    wheel.width = size * ratio;
    wheel.height = size * ratio;

    const ctx = wheel.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const center = size / 2;
    const radius = center - 10;
    const angle = (Math.PI * 2) / meals.length;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fillStyle = "#2b2622";
    ctx.fill();

    meals.forEach(function(meal, index) {
        const start = -Math.PI / 2 + index * angle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, start + angle);
        ctx.closePath();
        ctx.fillStyle = colors[meal.shop][index % 2];
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + angle / 2);
        ctx.fillStyle = "#2b2622";
        ctx.font = "700 13px 'Zen Maru Gothic', sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        let label = meal.name;
        if (label.length > 8) {
            label = label.slice(0, 7) + "…";
        }
        ctx.fillText(label, radius - 14, 0);
        ctx.restore();
    });

    for (let i = 0; i < meals.length; i++) {
        const a = -Math.PI / 2 + i * angle;
        ctx.beginPath();
        ctx.arc(center + Math.cos(a) * (center - 6), center + Math.sin(a) * (center - 6), 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

let audio = null;
let soundOn = true;
let lastSegment = -1;

function beep(frequency, length, volume) {
    if (!soundOn || !audio) {
        return;
    }
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + length);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + length);
}

function fanfare() {
    beep(660, 0.15, 0.1);
    setTimeout(function() {
        beep(880, 0.3, 0.1);
    }, 120);
}

soundButton.addEventListener("click", function() {
    soundOn = !soundOn;
    soundButton.textContent = soundOn ? "音 ON" : "音 OFF";
});

const board = document.getElementById("board");
const wheelArea = document.getElementById("wheel-area");
const hub = document.getElementById("hub");
const dartSvg =
    '<svg viewBox="0 0 24 70" width="24" height="70">' +
    '<path d="M12 0 L14 15 L10 15 Z" fill="#b8b2aa"/>' +
    '<rect x="8.5" y="14" width="7" height="24" rx="3" fill="#2b2622"/>' +
    '<rect x="11" y="37" width="2" height="16" fill="#2b2622"/>' +
    '<path d="M12 44 L1 68 L12 61 L23 68 Z" fill="#e8743b"/>' +
    '</svg>';

function setWheel() {
    board.style.transform = "rotate(" + rotation + "deg)";
    hub.style.transform = "rotate(" + (-rotation) + "deg)";

    const angle = 360 / meals.length;
    const segment = Math.floor((rotation % 360) / angle);
    if (segment !== lastSegment) {
        lastSegment = segment;
        beep(1200, 0.03, 0.04);
    }
}

const speed = 0.72;
const stopTime = 5000;
let spinning = false;
let thrown = false;
let lastTime = 0;

function finishSpin(index) {
    const meal = meals[index];
    highlight(meal);

    rouletteDisplay.textContent = meal.name;
    rouletteDisplay.classList.remove("pop");
    void rouletteDisplay.offsetWidth;
    rouletteDisplay.classList.add("pop");

    rouletteInfo.innerHTML = "";
    rouletteInfo.appendChild(makeElement("span", "chip " + shopClass(meal.shop), meal.shop));
    rouletteInfo.appendChild(makeElement("span", "chip", meal.price + "円"));
    rouletteInfo.appendChild(makeElement("span", "chip", meal.kcal + "kcal"));

    fanfare();
    thrown = false;
    rouletteButton.disabled = false;
    rouletteButton.textContent = "もう一回";
}

function spinLoop(time) {
    if (!spinning) {
        return;
    }
    rotation = rotation + speed * (time - lastTime);
    lastTime = time;
    setWheel();
    requestAnimationFrame(spinLoop);
}

function spinRoulette() {
    if (!audio) {
        audio = new AudioContext();
    }

    rouletteButton.disabled = true;
    wheelArea.classList.add("aiming");
    document.body.classList.add("aiming");
    rouletteInfo.innerHTML = "";
    rouletteDisplay.classList.remove("pop");
    rouletteDisplay.textContent = "…";
    meals.forEach(function(item) {
        item.card.classList.remove("hit");
    });
    board.querySelectorAll(".dart").forEach(function(dart) {
        dart.remove();
    });

    spinning = true;
    lastTime = performance.now();
    requestAnimationFrame(spinLoop);
}

function makeDart() {
    const dart = document.createElement("div");
    dart.className = "dart";
    dart.innerHTML = dartSvg;
    return dart;
}

let aimX = null;
let aimY = null;

function angleTo(fromX, fromY, toX, toY) {
    return Math.atan2(toX - fromX, -(toY - fromY)) * 180 / Math.PI;
}

function showSurprise(x, y) {
    const bubble = makeElement("div", "surprise", "！？");
    bubble.style.left = x + "px";
    bubble.style.top = y + "px";
    wheelArea.appendChild(bubble);
    setTimeout(function() {
        bubble.remove();
    }, 900);
}

function throwDart(clientX, clientY) {
    thrown = true;
    wheelArea.classList.remove("aiming");
    document.body.classList.remove("aiming");

    const rect = wheelArea.getBoundingClientRect();
    const width = wheelArea.clientWidth;
    const center = width / 2;
    const scale = width / size;

    let distance = (55 + Math.random() * 95) * scale;
    let direction = Math.random() * Math.PI * 2;
    let trick = false;
    let aimPointX = 0;
    let aimPointY = 0;

    if (clientX !== null) {
        aimPointX = clientX - rect.left;
        aimPointY = clientY - rect.top;
        const aimDistance = Math.hypot(aimPointX - center, aimPointY - center);

        if (aimDistance > 160 * scale) {
            trick = true;
        } else {
            distance = Math.min(Math.max(aimDistance, 48 * scale), 150 * scale);
            direction = Math.atan2(aimPointY - center, aimPointX - center);
        }
    }

    const x = center + Math.cos(direction) * distance;
    const y = center + Math.sin(direction) * distance;
    const startX = center - x;
    const startY = width + 120 - y;

    const flying = makeDart();
    flying.style.left = x + "px";
    flying.style.top = y + "px";
    wheelArea.appendChild(flying);

    beep(400, 0.12, 0.05);

    let flight;

    if (trick) {
        const turnX = aimPointX - x;
        const turnY = aimPointY - y;
        const goAngle = angleTo(center, width + 120, aimPointX, aimPointY);
        const backAngle = angleTo(aimPointX, aimPointY, x, y);
        const here = "translate(" + turnX + "px, " + turnY + "px) ";

        flight = flying.animate(
            [
                { offset: 0, transform: "translate(" + startX + "px, " + startY + "px) rotate(" + goAngle + "deg) scale(2.2)", opacity: 0.6 },
                { offset: 0.3, transform: here + "rotate(" + goAngle + "deg) scale(1.3)", opacity: 1, easing: "ease-in-out" },
                { offset: 0.42, transform: here + "rotate(" + (goAngle - 30) + "deg) scale(1.3)", easing: "ease-in-out" },
                { offset: 0.52, transform: here + "rotate(" + (goAngle + 30) + "deg) scale(1.3)", easing: "ease-in-out" },
                { offset: 0.64, transform: here + "rotate(" + backAngle + "deg) scale(1.4)", easing: "cubic-bezier(0.6, 0, 0.9, 0.6)" },
                { offset: 1, transform: "translate(0, 0) rotate(0deg) scale(1)" }
            ],
            { duration: 1600 }
        );

        setTimeout(function() {
            showSurprise(aimPointX, aimPointY);
            beep(900, 0.08, 0.06);
            setTimeout(function() {
                beep(500, 0.12, 0.06);
            }, 120);
        }, 520);

        setTimeout(function() {
            beep(1400, 0.2, 0.04);
        }, 1020);
    } else {
        flight = flying.animate(
            [
                { transform: "translate(" + startX + "px, " + startY + "px) scale(2.2)", opacity: 0.6 },
                { transform: "translate(0, 0) scale(1)", opacity: 1 }
            ],
            { duration: 380, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" }
        );
    }

    flight.onfinish = function() {
        hitBoard(flying, x - center, y - center, center);
    };
}

function hitBoard(flying, dx, dy, center) {
    const theta = rotation * Math.PI / 180;
    const localX = dx * Math.cos(theta) + dy * Math.sin(theta);
    const localY = -dx * Math.sin(theta) + dy * Math.cos(theta);

    const stuck = makeDart();
    stuck.style.left = (center + localX) + "px";
    stuck.style.top = (center + localY) + "px";
    stuck.style.transform = "rotate(" + (-rotation) + "deg)";
    board.appendChild(stuck);
    flying.remove();

    beep(150, 0.15, 0.2);
    wheelArea.animate(
        [
            { transform: "translate(0, 0)" },
            { transform: "translate(0, -4px)" },
            { transform: "translate(0, 2px)" },
            { transform: "translate(0, 0)" }
        ],
        { duration: 200 }
    );

    const angle = 360 / meals.length;
    const pointAngle = Math.atan2(localY, localX) * 180 / Math.PI;
    const index = Math.floor((((pointAngle + 90) % 360) + 360) % 360 / angle);

    spinning = false;
    const start = rotation;
    const goal = speed * stopTime / 2;
    const startTime = performance.now();

    function slowDown(time) {
        const t = Math.min((time - startTime) / stopTime, 1);
        rotation = start + goal * (1 - (1 - t) * (1 - t));
        setWheel();

        if (t < 1) {
            requestAnimationFrame(slowDown);
        } else {
            finishSpin(index);
        }
    }

    requestAnimationFrame(slowDown);
}

rouletteButton.addEventListener("click", function() {
    spinRoulette();
});

document.addEventListener("mousemove", function(event) {
    aimX = event.clientX;
    aimY = event.clientY;
});

document.addEventListener("click", function(event) {
    if (meals.length === 0 || event.target.closest("button")) {
        return;
    }
    if (spinning && !thrown) {
        throwDart(event.clientX, event.clientY);
    } else if (!spinning && !thrown && wheelArea.contains(event.target)) {
        spinRoulette();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.code !== "Space" || meals.length === 0) {
        return;
    }
    event.preventDefault();
    if (spinning && !thrown) {
        throwDart(aimX, aimY);
    } else if (!spinning && !thrown) {
        spinRoulette();
    }
});

function setActive(buttons, active) {
    buttons.forEach(function(button) {
        button.classList.remove("active");
    });
    active.classList.add("active");
}

function addPlanItem(list, item, value) {
    const li = document.createElement("li");
    li.appendChild(makeElement("span", "dot " + shopClass(item.shop)));
    li.appendChild(makeElement("span", "item-name", item.name));
    li.appendChild(makeElement("span", "item-value", value));
    list.appendChild(li);
}

function setTotal(element, big, rest) {
    element.innerHTML = "";
    element.appendChild(makeElement("strong", "", big));
    element.appendChild(document.createTextNode(rest));
}

const budgetButtons = document.querySelectorAll(".budget-btn");
const budgetResult = document.getElementById("budget-result");
const budgetList = document.getElementById("budget-list");
const budgetMeter = document.getElementById("budget-meter");
const budgetTotal = document.getElementById("budget-total");

function chooseByBudget(budget) {
    const shuffledMeals = shuffle(meals);
    const result = [];
    let total = 0;

    const main = shuffledMeals.find(function(meal) {
        return meal.price <= budget;
    });

    if (main) {
        result.push(main);
        total = main.price;
    }

    const others = shuffle(shuffledMeals.filter(function(meal) {
        return meal !== main;
    }).concat(drinks));

    others.forEach(function(item) {
        if (total + item.price <= budget) {
            result.push(item);
            total = total + item.price;
        }
    });

    return { items: result, total: total };
}

function showBudget(budget) {
    const plan = chooseByBudget(budget);
    budgetResult.hidden = false;
    budgetList.innerHTML = "";

    let kcal = 0;

    plan.items.forEach(function(item) {
        addPlanItem(budgetList, item, item.price + "円");
        if (item.kcal) {
            kcal = kcal + item.kcal;
        }
    });

    budgetMeter.style.width = "0";
    requestAnimationFrame(function() {
        budgetMeter.style.width = (plan.total / budget * 100) + "%";
    });

    setTotal(budgetTotal, plan.total + "円",
        " ／ おつり " + (budget - plan.total) + "円・" + plan.items.length + "品・" + kcal + "kcal");
}

budgetButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        setActive(budgetButtons, button);
        showBudget(Number(button.dataset.budget));
    });
});

const kcalButtons = document.querySelectorAll(".kcal-btn");
const kcalResult = document.getElementById("kcal-result");
const kcalList = document.getElementById("kcal-list");
const kcalMeter = document.getElementById("kcal-meter");
const kcalTotal = document.getElementById("kcal-total");

function chooseByKcal(limit) {
    const result = [];
    let total = 0;

    shuffle(meals).forEach(function(meal) {
        if (total + meal.kcal <= limit) {
            result.push(meal);
            total = total + meal.kcal;
        }
    });

    return { items: result, total: total };
}

function showKcal(limit) {
    const plan = chooseByKcal(limit);
    kcalResult.hidden = false;
    kcalList.innerHTML = "";

    let price = 0;

    plan.items.forEach(function(item) {
        addPlanItem(kcalList, item, item.kcal + "kcal");
        price = price + item.price;
    });

    kcalMeter.style.width = "0";
    requestAnimationFrame(function() {
        kcalMeter.style.width = (plan.total / limit * 100) + "%";
    });

    if (plan.items.length === 0) {
        setTotal(kcalTotal, "", limit + "kcal 以内のメニューはありません");
    } else {
        setTotal(kcalTotal, plan.total + "kcal",
            " ／ あと " + (limit - plan.total) + "kcal・" + plan.items.length + "品・" + price + "円");
    }
}

kcalButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        setActive(kcalButtons, button);
        showKcal(Number(button.dataset.kcal));
    });
});

fetch("menu.csv")
    .then(function(response) {
        return response.text();
    })
    .then(function(data) {
        const rows = data.trim().split("\n");
        const headers = rows[0].split(",");

        const items = rows.slice(1).map(function(row) {
            const values = row.split(",");
            const item = {};
            headers.forEach(function(header, index) {
                item[header] = values[index];
            });
            item.price = Number(item.price);
            item.kcal = Number(item.kcal);
            return item;
        });

        drinks = items.filter(function(item) {
            return item.date === "drink";
        });

        const dates = items.filter(function(item) {
            return item.date !== "drink";
        }).map(function(item) {
            return item.date;
        });

        const today = todayString();
        let showDate = today;

        if (!dates.includes(today)) {
            dates.sort();
            const next = dates.find(function(date) {
                return date > today;
            });
            if (next) {
                showDate = next;
                dateLabel.textContent = "今日はお休み ・ 次の営業日 " + formatDate(showDate) + " のメニューを表示中";
            } else {
                showDate = dates[dates.length - 1];
                dateLabel.textContent = "今日のメニューはまだありません ・ " + formatDate(showDate) + " のメニューを表示中";
            }
        } else {
            dateLabel.textContent = formatDate(today) + " のメニュー";
        }

        meals = items.filter(function(item) {
            return item.date === showDate;
        });

        renderMenu();
        document.fonts.ready.then(function() {
            drawWheel();
        });
    });
