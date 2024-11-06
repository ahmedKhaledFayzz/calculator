let currentTheme = "light";
const themes = ["light", "dark", "nature", "ocean"];

function toggleTheme() {
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  currentTheme = themes[nextIndex];
  document.body.className = `theme-${currentTheme}`;
}

function appendToDisplay(value) {
  document.getElementById("display").value += value;
}

function clearDisplay() {
  document.getElementById("display").value = "";
}

function deleteLastDigit() {
  let display = document.getElementById("display");
  display.value = display.value.slice(0, -1);
}

function appendFraction() {
  let display = document.getElementById("display");
  let currentValue = display.value;
  let lastNumber = currentValue.split(/[\+\-\*\/]/).pop();

  if (lastNumber && !isNaN(lastNumber)) {
    display.value =
      currentValue.slice(0, -lastNumber.length) + lastNumber + "/";
  } else {
    display.value += "/";
  }
}

function calculate() {
  try {
    let expression = document.getElementById("display").value.toLowerCase();

    // الحالات الخاصة للدوال المثلثية واللوغاريتمية والجذور
    const specialCases = {
      "sin(30)": "1/2",
      "sin(60)": "√3/2",
      "cos(60)": "1/2",
      "tan(30)": "√3/3",
      "tan(45)": "1",
      "tan(60)": "√3",
      "sin(90)": "1",
      "cos(90)": "0",
      "tan(90)": "غير معرّف",
      "log(1)": "0",
      "log(10)": "1",
      "log(100)": "2",
      "ln(1)": "0",
      "ln(e)": "1",
      "∛(8)": "2",
      "∛(27)": "3",
      "∛(-8)": "-2",
    };

    // التحقق من الحالات الخاصة
    for (let [key, value] of Object.entries(specialCases)) {
      if (expression === key) {
        document.getElementById("display").value = value;
        return;
      }
    }

    // إذا لم تكن حالة خاصة، نتابع الحساب العادي
    expression = expression.replace(/sin\(/g, "sin(pi/180*");
    expression = expression.replace(/cos\(/g, "cos(pi/180*");
    expression = expression.replace(/tan\(/g, "tan(pi/180*");
    expression = expression.replace(/log\(/g, "log10(");
    expression = expression.replace(/ln\(/g, "log(");

    let result;

    if (expression.includes("√")) {
      let value = expression.match(/√\((.*?)\)/)[1];
      result = Math.sqrt(parseFloat(value));
    } else if (expression.includes("∛")) {
      let value = expression.match(/∛\((.*?)\)/)[1];
      result = Math.cbrt(parseFloat(value));
    } else {
      result = math.evaluate(expression);
    }

    // تقريب النتيجة إلى 8 أرقام عشرية كحد أقصى
    result = Number(result.toFixed(8));

    document.getElementById("display").value = result;
  } catch (error) {
    document.getElementById("display").value = "خطأ";
  }
}

// إظهار رسالة الترحيب عند تحميل الصفحة
window.onload = function () {
  document.getElementById("welcomeModal").style.display = "block";
};

function closeWelcomeModal() {
  document.getElementById("welcomeModal").style.display = "none";
}
let history = [];

function addToHistory(expression, result) {
  history.push({ expression: expression, result: result });
  updateHistoryPanel();
}

function updateHistoryPanel() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  history
    .slice()
    .reverse()
    .forEach((item, index) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = `${item.expression} = ${item.result}`;
      span.className = "history-item";
      span.onclick = function () {
        document.getElementById("display").value = item.expression;
      };
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "حذف";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = function () {
        history.splice(history.length - 1 - index, 1);
        updateHistoryPanel();
      };
      li.appendChild(span);
      li.appendChild(deleteBtn);
      historyList.appendChild(li);
    });
}

function toggleHistory() {
  const panel = document.getElementById("historyPanel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function clearAllHistory() {
  history = [];
  updateHistoryPanel();
}

function calculateAbsolute(expression) {
  const absRegex = /abs\((.*?)\)/g;
  return expression.replace(absRegex, (match, p1) => {
    return Math.abs(eval(p1));
  });
}

// تحديث دالة calculate لدعم القيمة المطلقة
const originalCalculate = calculate;
calculate = function () {
  try {
    let expression = document.getElementById("display").value.toLowerCase();

    // معالجة القيمة المطلقة
    expression = calculateAbsolute(expression);

    // استدعاء الدالة الأصلية للحساب
    document.getElementById("display").value = expression;
    originalCalculate();

    // إضافة العملية إلى السجل
    const result = document.getElementById("display").value;
    addToHistory(expression, result);
  } catch (error) {
    document.getElementById("display").value = "خطأ";
  }
};
