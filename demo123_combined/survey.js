const surveyForm = document.querySelector("#experience-survey");
const surveyStatus = document.querySelector("#survey-status");
const googleFormResponse = document.querySelector("#google-form-response");
const surveyStorageKey = "ocpus-urch-survey-draft";
let waitingForGoogleResponse = false;

// 读取所有字段。复选题可能有多个答案，因此统一把每个字段保存为数组。
function readSurveyAnswers() {
  const answers = {};

  for (const field of surveyForm.elements) {
    if (!field.name || field.type === "submit" || field.type === "button") {
      continue;
    }

    if ((field.type === "checkbox" || field.type === "radio") && !field.checked) {
      continue;
    }

    if (!answers[field.name]) answers[field.name] = [];
    answers[field.name].push(field.value);
  }

  return answers;
}

// 输入时自动保存草稿。这里只保存在参与者当前设备，不会发送到网络。
function saveSurveyDraft(showMessage = false) {
  localStorage.setItem(
    surveyStorageKey,
    JSON.stringify(readSurveyAnswers())
  );

  if (showMessage) {
    showSurveyStatus("草稿已保存在当前设备。");
  }
}

// 页面重新打开时，恢复文本、单选和多选内容。
function restoreSurveyDraft() {
  const savedDraft = localStorage.getItem(surveyStorageKey);
  if (!savedDraft) return;

  const answers = JSON.parse(savedDraft);

  for (const field of surveyForm.elements) {
    if (!field.name || !answers[field.name]) continue;

    const savedValues = answers[field.name];

    if (field.type === "checkbox" || field.type === "radio") {
      field.checked = savedValues.includes(field.value);
    } else {
      field.value = savedValues[0] || "";
    }
  }
}

function showSurveyStatus(message) {
  surveyStatus.textContent = message;
}

surveyForm.addEventListener("input", () => saveSurveyDraft(false));

document.querySelector("#save-survey").addEventListener("click", () => {
  saveSurveyDraft(true);
});

// 这是参与者主动点击的最终提交动作。
// 字段会按 Google Form 的 entry 编号发送到你的表单，
// 返回页面装入隐藏 iframe，因此参与者不会离开 Demo 页面。
surveyForm.addEventListener("submit", () => {
  saveSurveyDraft(false);
  waitingForGoogleResponse = true;
  showSurveyStatus("正在提交，请稍候……");
});

googleFormResponse.addEventListener("load", () => {
  // iframe 创建时也会触发一次 load；只处理真正提交后的加载。
  if (!waitingForGoogleResponse) return;

  waitingForGoogleResponse = false;
  localStorage.removeItem(surveyStorageKey);
  surveyForm.reset();
  showSurveyStatus("提交成功，感谢你的回答！");
});

restoreSurveyDraft();
