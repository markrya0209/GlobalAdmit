import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://uhefibgtsbtdxfqluzxo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9z6iuc_jIARINrRIwbzRNw_nN6BGEr_";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const gradePoints = {
  "A*": 4.0,
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  E: 0,
  F: 0,
  G: 0
};

let universities = [];

function formatDbDateForPlanner(dateString) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) {
    return "";
  }

  return `${day}/${month}/${year}`;
}

function getMappedPreferenceValue(value, mapping) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim();
  if (Object.prototype.hasOwnProperty.call(mapping, normalized)) {
    return mapping[normalized];
  }

  const numericValue = Number.parseInt(normalized, 10);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function normalizeUniversityRecord(record) {
  const undergradSize = record.undergrad_size || "Medium";
  const climateValue = getMappedPreferenceValue(record.climate, {
    "Cold / Snowy": 1,
    "Mild / Mixed": 2,
    "Warm year-round": 3
  });
  const campusVibeValue = getMappedPreferenceValue(record.campus_vibe, {
    "Highly Competitive and Intense": 1,
    Balanced: 2,
    "Collaborative and relaxed": 3
  });
  const socialSceneValue = getMappedPreferenceValue(record.social_scene, {
    "Party-heavy": 1,
    Balanced: 2,
    "Quiet / Academic-focused": 3
  });
  const classStyleValue = getMappedPreferenceValue(record.class_style, {
    "Lecture-based": 1,
    "Discussion-based": 2,
    "Project-based": 3
  });

  return {
    name: record.name,
    hard_reach_min: record.extreme_reach_threshold ?? 0,
    reach_min: record.reach_threshold ?? 0,
    target_min: record.target_threshold ?? 101,
    match_min: record.match_threshold ?? 101,
    safety_min: record.safety_threshold ?? 101,
    international_aid: record.international_aid || "unknown",
    campus_setting: record.campus_setting || "Suburban",
    undergrad_size_band: undergradSize,
    undergrad_size_value: undergradSize === "Small" ? 1 : undergradSize === "Large" ? 3 : 2,
    climate_value: climateValue,
    campus_vibe_value: campusVibeValue,
    social_scene_value: socialSceneValue,
    class_style_value: classStyleValue,
    hasEA: Boolean(record.has_ea),
    hasED: Boolean(record.has_ed),
    ea_deadline: formatDbDateForPlanner(record.ea_deadline),
    ed_deadline: formatDbDateForPlanner(record.ed_deadline),
    rd_deadline: formatDbDateForPlanner(record.rd_deadline)
  };
}

async function loadUniversities() {
  const { data, error } = await supabase
    .from("University")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    setAuthStatus(error.message, true);
    return false;
  }

  universities = (data || []).map(normalizeUniversityRecord);
  return true;
}

const pageScorer = document.getElementById("page-scorer");
const pagePlanner = document.getElementById("page-planner");
const pageQuestionnaire = document.getElementById("page-questionnaire");
const pageTasks = document.getElementById("page-tasks");
const navScorer = document.getElementById("nav-scorer");
const navPlanner = document.getElementById("nav-planner");
const navQuestionnaire = document.getElementById("nav-questionnaire");
const navTasks = document.getElementById("nav-tasks");
const appContent = document.getElementById("app-content");
const authShell = document.getElementById("auth-shell");
const authForm = document.getElementById("auth-form");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authStatus = document.getElementById("auth-status");
const authSignupButton = document.getElementById("auth-signup-button");
const appSignoutButton = document.getElementById("app-signout-button");

const igcseSubjects = document.getElementById("igcse-subjects");
const extracurricularActivities = document.getElementById("extracurricular-activities");
const addSubjectButton = document.getElementById("add-subject-button");
const ibScoreInput = document.getElementById("ib-score");
const courseRigorInput = document.getElementById("course-rigor");
const satScoreInput = document.getElementById("sat-score");
const calculateButton = document.getElementById("calculate-button");
const profileScoreValue = document.getElementById("profile-score-value");
const profileMessage = document.getElementById("profile-message");
const scoreBreakdown = document.getElementById("score-breakdown");

const plannerEdList = document.getElementById("planner-ed-list");
const plannerEaList = document.getElementById("planner-ea-list");
const plannerRdList = document.getElementById("planner-rd-list");
const plannerSummary = document.getElementById("planner-summary");
const saveApplicationsButton = document.getElementById("save-applications-button");
const prefFinancialAid = document.getElementById("pref-financial-aid");
const prefClimate = document.getElementById("pref-climate");
const prefCampusVibe = document.getElementById("pref-campus-vibe");
const prefSocialScene = document.getElementById("pref-social-scene");
const prefClassStyle = document.getElementById("pref-class-style");
const campusRanking = document.getElementById("campus-ranking");
const questionnaireSummary = document.getElementById("questionnaire-summary");
const savePreferencesButton = document.getElementById("save-preferences-button");
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskTypeInput = document.getElementById("task-type");
const taskDateInput = document.getElementById("task-date");
const taskPriorityInput = document.getElementById("task-priority");
const taskHoursInput = document.getElementById("task-hours");
const taskCompletedInput = document.getElementById("task-completed");
const taskSaveButton = document.getElementById("task-save-button");
const taskCancelButton = document.getElementById("task-cancel-button");
const taskFilterUpcoming = document.getElementById("task-filter-upcoming");
const taskFilterOverdue = document.getElementById("task-filter-overdue");
const taskFilterCompleted = document.getElementById("task-filter-completed");
const taskFilterAll = document.getElementById("task-filter-all");
const taskSortField = document.getElementById("task-sort-field");
const taskSortDirection = document.getElementById("task-sort-direction");
const taskList = document.getElementById("task-list");

let currentProfileScore = null;
let currentAcademicScore = null;
let campusRankingOrder = ["Rural", "Urban", "Suburban"];
let selectedPlannerEd = "";
const selectedPlannerEa = new Set();
const selectedPlannerRd = new Set();
const tasks = [];
let taskFilter = "upcoming";
let taskSortFieldValue = "date";
let taskSortDirectionValue = "asc";
let editingTaskId = null;
let authMode = "signin";
let isAuthBusy = false;
let currentUser = null;
let isHydratingData = false;
let persistTimer = null;

function setAuthStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.classList.toggle("auth-status-error", isError);
}

function setAuthBusyState(isBusy) {
  isAuthBusy = isBusy;
  authEmailInput.disabled = isBusy;
  authPasswordInput.disabled = isBusy;
  authSignupButton.disabled = isBusy;
  appSignoutButton.disabled = isBusy;
  authForm.querySelector('button[type="submit"]').disabled = isBusy;
}

function setDefaultProfileInputs() {
  igcseSubjects.innerHTML = "";
  igcseSubjects.appendChild(createSubjectRow("Mathematics", "A*"));
  igcseSubjects.appendChild(createSubjectRow("English Language", "A"));

  extracurricularActivities.innerHTML = "";
  for (let i = 0; i < 10; i += 1) {
    extracurricularActivities.appendChild(createActivityRow(i));
  }

  ibScoreInput.value = "";
  courseRigorInput.value = "";
  satScoreInput.value = "";
}

function resetDerivedState() {
  currentProfileScore = null;
  currentAcademicScore = null;
  profileScoreValue.textContent = "Not calculated yet";
  profileMessage.textContent = "Enter your subjects and scores to derive your academic score automatically.";
  scoreBreakdown.hidden = true;
  scoreBreakdown.innerHTML = "";
}

function resetAppState() {
  selectedPlannerEd = "";
  selectedPlannerEa.clear();
  selectedPlannerRd.clear();
  tasks.length = 0;
  taskFilter = "upcoming";
  editingTaskId = null;
  campusRankingOrder = ["Rural", "Urban", "Suburban"];

  prefFinancialAid.value = "";
  prefClimate.value = "";
  prefCampusVibe.value = "";
  prefSocialScene.value = "";
  prefClassStyle.value = "";
  document.querySelectorAll('input[name="class-size"]').forEach((input) => {
    input.checked = false;
  });

  taskForm.reset();
  resetTaskForm();
  setDefaultProfileInputs();
  resetDerivedState();
  renderPlanner();
  syncPlannerState();
  renderCampusRanking();
  renderQuestionnaireSummary();
  renderTaskList();
}

function getUsernameFromUser(user) {
  return user?.email?.split("@")[0] || "student";
}

function getSelectedSubjects() {
  return Array.from(igcseSubjects.querySelectorAll(".subject-row"))
    .map((row) => ({
      name: row.querySelector(".subject-name").value.trim(),
      grade: row.querySelector(".subject-grade").value
    }))
    .filter((subject) => subject.name);
}

function getSelectedSubjectGrades() {
  return getSelectedSubjects().map((subject) => subject.grade);
}

function getSelectedSubjectNames() {
  return getSelectedSubjects().map((subject) => subject.name);
}

function getSelectedActivityEntries() {
  return Array.from(extracurricularActivities.querySelectorAll(".activity-row"))
    .map((row) => ({
      name: row.querySelector(".activity-name").value.trim(),
      description: row.querySelector(".activity-description").value.trim(),
      impact: row.querySelector(".activity-impact").value
    }))
    .filter((activity) => activity.name && activity.impact);
}

function getSelectedActivityImpacts() {
  return getSelectedActivityEntries().map((activity) => Number.parseInt(activity.impact, 10));
}

function getSelectedActivityNames() {
  return getSelectedActivityEntries().map((activity) => activity.name);
}

function getSelectedActivityDescriptions() {
  return getSelectedActivityEntries().map((activity) => activity.description);
}

function parseSavedActivityDescriptions(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? ""));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((entry) => String(entry ?? "")) : [value];
    } catch (_error) {
      return [value];
    }
  }

  return [];
}

function collectProfilePayload() {
  const ibTotal = Number.parseInt(ibScoreInput.value, 10);
  const courseRigor = Number.parseInt(courseRigorInput.value, 10);
  const sat = Number.parseInt(satScoreInput.value, 10);

  return {
    id: currentUser.id,
    username: getUsernameFromUser(currentUser),
    aid_requirement: prefFinancialAid.value || null,
    campus_preference: JSON.stringify({ ranking: campusRankingOrder, vibe: prefCampusVibe.value || null }),
    size_preference: getSelectedRadioValue("class-size") || null,
    climate_preference: prefClimate.value || null,
    social_scene_preference: prefSocialScene.value || null,
    class_style_preference: prefClassStyle.value || null,
    ib_total: Number.isNaN(ibTotal) ? null : ibTotal,
    sat: Number.isNaN(sat) ? null : sat,
    course_rigor: Number.isNaN(courseRigor) ? null : courseRigor,
    academic_score: currentAcademicScore,
    overall_score: currentProfileScore,
    igcse_grades: getSelectedSubjectGrades(),
    igcse_subjects: getSelectedSubjectNames(),
    activity_impact_list: getSelectedActivityImpacts(),
    activity_names: getSelectedActivityNames(),
    activity_description: JSON.stringify(getSelectedActivityDescriptions())
  };
}

function collectApplicationsPayload() {
  const selections = getAppliedSchoolSelections();
  const earliestTime = selections.length > 0
    ? Math.min(...selections.map((application) => parsePlannerDeadline(application.deadline).getTime()))
    : null;

  return selections.map((application) => {
    const scoringMatch = getMappedScoringUniversity(application.name);
    return {
      user_id: currentUser.id,
      university_name: application.name,
      application_round: application.round,
      category_for_user: currentProfileScore !== null && scoringMatch
        ? classifyUniversity(currentProfileScore, scoringMatch)
        : null,
      deadline: toInputDate(application.deadline),
      is_earliest_deadline: earliestTime !== null && parsePlannerDeadline(application.deadline).getTime() === earliestTime
    };
  });
}

function collectTasksPayload() {
  return tasks.map((task) => ({
    user_id: currentUser.id,
    title: task.title,
    type: task.type,
    due_date: task.date,
    priority: task.priority,
    hours: task.hours,
    completed: task.completed,
    autogenerated: task.autogenerated,
    user_modified: task.userModified,
    source_key: task.sourceKey || null
  }));
}

async function persistProfileData() {
  if (!currentUser || isHydratingData) {
    return false;
  }

  const profilePayload = collectProfilePayload();
  const { error } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });

  if (error) {
    setAuthStatus(error.message, true);
    return false;
  }

  return true;
}

async function persistApplicationsData() {
  if (!currentUser || isHydratingData) {
    return false;
  }

  const applicationsPayload = collectApplicationsPayload();
  const { error: deleteApplicationsError } = await supabase.from("applications").delete().eq("user_id", currentUser.id);
  if (deleteApplicationsError) {
    setAuthStatus(deleteApplicationsError.message, true);
    return false;
  }

  if (applicationsPayload.length > 0) {
    const { error: applicationsError } = await supabase.from("applications").insert(applicationsPayload);
    if (applicationsError) {
      setAuthStatus(applicationsError.message, true);
      return false;
    }
  }

  return true;
}

async function persistTasksData() {
  if (!currentUser || isHydratingData) {
    return false;
  }

  const tasksPayload = collectTasksPayload();
  const { error: deleteTasksError } = await supabase.from("tasks").delete().eq("user_id", currentUser.id);
  if (deleteTasksError) {
    setAuthStatus(deleteTasksError.message, true);
    return false;
  }

  if (tasksPayload.length > 0) {
    const { error: tasksError } = await supabase.from("tasks").insert(tasksPayload);
    if (tasksError) {
      setAuthStatus(tasksError.message, true);
      return false;
    }
  }

  return true;
}

async function persistAppData() {
  if (!currentUser || isHydratingData) {
    return;
  }

  const profileSaved = await persistProfileData();
  if (!profileSaved) {
    return;
  }

  const applicationsSaved = await persistApplicationsData();
  if (!applicationsSaved) {
    return;
  }

  const tasksSaved = await persistTasksData();
  if (!tasksSaved) {
    return;
  }

  setAuthStatus(`Signed in as ${currentUser.email}. Changes saved.`);
}

function schedulePersistence() {
  if (!currentUser || isHydratingData) {
    return;
  }

  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistAppData();
  }, 400);
}

function applyLoadedProfile(profile) {
  setDefaultProfileInputs();

  if (Array.isArray(profile?.igcse_grades) && profile.igcse_grades.length > 0) {
    igcseSubjects.innerHTML = "";
    profile.igcse_grades.forEach((grade, index) => {
      const subjectName = Array.isArray(profile?.igcse_subjects) ? profile.igcse_subjects[index] : "";
      igcseSubjects.appendChild(createSubjectRow(subjectName || `Subject ${index + 1}`, grade || "A*"));
    });
  }

  const savedActivityDescriptions = parseSavedActivityDescriptions(profile?.activity_description);

  if (
    (Array.isArray(profile?.activity_impact_list) && profile.activity_impact_list.length > 0) ||
    savedActivityDescriptions.length > 0
  ) {
    extracurricularActivities.innerHTML = "";
    const impactCount = Array.isArray(profile?.activity_impact_list) ? profile.activity_impact_list.length : 0;
    const totalRows = Math.max(10, impactCount, savedActivityDescriptions.length);
    for (let i = 0; i < totalRows; i += 1) {
      const row = createActivityRow(i);
      const activityName = Array.isArray(profile?.activity_names) ? profile.activity_names[i] : "";
      const activityDescription = savedActivityDescriptions[i] || "";
      const savedImpact = Array.isArray(profile?.activity_impact_list) ? profile.activity_impact_list[i] : undefined;

      if (activityName) {
        row.querySelector(".activity-name").value = activityName;
      }
      if (savedImpact !== undefined) {
        row.querySelector(".activity-impact").value = String(savedImpact);
      }
      if (activityDescription) {
        row.querySelector(".activity-description").value = activityDescription;
      }

      extracurricularActivities.appendChild(row);
    }
  }

  ibScoreInput.value = profile?.ib_total ?? "";
  courseRigorInput.value = profile?.course_rigor ?? "";
  satScoreInput.value = profile?.sat ?? "";
  prefFinancialAid.value = profile?.aid_requirement ?? "";
  prefClimate.value = profile?.climate_preference ?? "";
  prefSocialScene.value = profile?.social_scene_preference ?? "";
  prefClassStyle.value = profile?.class_style_preference ?? "";

  if (profile?.size_preference) {
    document.querySelectorAll('input[name="class-size"]').forEach((input) => {
      input.checked = input.value === profile.size_preference;
    });
  }

  if (profile?.campus_preference) {
    try {
      const savedCampusPreference = JSON.parse(profile.campus_preference);
      if (Array.isArray(savedCampusPreference.ranking) && savedCampusPreference.ranking.length === 3) {
        campusRankingOrder = savedCampusPreference.ranking;
      }
      prefCampusVibe.value = savedCampusPreference.vibe ?? "";
    } catch (_error) {
      const savedOrder = profile.campus_preference.split("|").filter(Boolean);
      if (savedOrder.length === 3) {
        campusRankingOrder = savedOrder;
      }
    }
  }

  currentProfileScore = profile?.overall_score ?? null;
  currentAcademicScore = profile?.academic_score ?? null;

  if (currentProfileScore !== null && currentAcademicScore !== null) {
    profileScoreValue.textContent = currentProfileScore.toFixed(1);
    profileMessage.textContent = "Saved profile loaded. Click Calculate score after edits to update it.";
    scoreBreakdown.hidden = false;
    scoreBreakdown.innerHTML = `
      <div class="breakdown-grid">
        <div class="breakdown-item">
          <span>Overall Academic Score</span>
          <strong>${currentAcademicScore.toFixed(1)}</strong>
        </div>
        <div class="breakdown-item">
          <span>Final ProfileScore</span>
          <strong>${currentProfileScore.toFixed(1)}</strong>
        </div>
      </div>
    `;
  } else {
    resetDerivedState();
  }
}

function applyLoadedApplications(applications) {
  selectedPlannerEd = "";
  selectedPlannerEa.clear();
  selectedPlannerRd.clear();

  applications.forEach((application) => {
    if (application.application_round === "ED") {
      selectedPlannerEd = application.university_name;
    }
    if (application.application_round === "EA") {
      selectedPlannerEa.add(application.university_name);
    }
    if (application.application_round === "RD") {
      selectedPlannerRd.add(application.university_name);
    }
  });

  renderPlanner();
  syncPlannerState();
}

function applyLoadedTasks(savedTasks) {
  tasks.length = 0;
  savedTasks.forEach((task) => {
    tasks.push({
      id: task.id ? `task-db-${task.id}` : `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: task.title,
      type: task.type,
      date: task.due_date,
      priority: task.priority,
      hours: task.hours,
      completed: task.completed,
      autogenerated: task.autogenerated,
      userModified: task.user_modified,
      sourceKey: task.source_key || ""
    });
  });
  renderTaskList();
}

async function loadUserData() {
  if (!currentUser) {
    return;
  }

  isHydratingData = true;
  setAuthStatus(`Signed in as ${currentUser.email}. Loading your data...`);

  const [{ data: profile, error: profileError }, { data: applications, error: applicationsError }, { data: savedTasks, error: tasksError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle(),
    supabase.from("applications").select("*").eq("user_id", currentUser.id),
    supabase.from("tasks").select("*").eq("user_id", currentUser.id).order("due_date", { ascending: true })
  ]);

  if (profileError || applicationsError || tasksError) {
    setAuthStatus(profileError?.message || applicationsError?.message || tasksError?.message, true);
    isHydratingData = false;
    return;
  }

  resetAppState();
  applyLoadedProfile(profile);
  renderCampusRanking();
  renderQuestionnaireSummary();
  applyLoadedTasks(savedTasks || []);
  applyLoadedApplications(applications || []);

  isHydratingData = false;
  setAuthStatus(`Signed in as ${currentUser.email}. Data loaded.`);
}

function updateAuthUi(session) {
  currentUser = session?.user ?? null;
  const isSignedIn = Boolean(currentUser);

  document.body.classList.toggle("signed-out", !isSignedIn);
  document.body.classList.toggle("signed-in", isSignedIn);
  appContent.hidden = !isSignedIn;
  authShell.hidden = isSignedIn;
  authForm.hidden = false;
  appSignoutButton.hidden = !isSignedIn;

  if (isSignedIn) {
    setAuthStatus(`Signed in as ${currentUser.email}.`);
  } else {
    setAuthStatus("Sign in or create an account to unlock the app.");
  }
}

async function handleAuthSubmit(mode) {
  if (isAuthBusy) {
    return;
  }

  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;

  if (!email || !password) {
    setAuthStatus("Enter both email and password.", true);
    return;
  }

  if (password.length < 6) {
    setAuthStatus("Password must be at least 6 characters.", true);
    return;
  }

  setAuthBusyState(true);
  setAuthStatus(mode === "signup" ? "Creating account..." : "Signing in...");

  const action = mode === "signup"
    ? supabase.auth.signUp({ email, password })
    : supabase.auth.signInWithPassword({ email, password });

  let { data, error } = await action;

  setAuthBusyState(false);

  if (error) {
    setAuthStatus(error.message, true);
    return;
  }

  authPasswordInput.value = "";

  if (mode === "signup" && !data.session) {
    const signInAfterSignup = await supabase.auth.signInWithPassword({ email, password });
    if (!signInAfterSignup.error && signInAfterSignup.data.session) {
      data = signInAfterSignup.data;
    } else {
      setAuthStatus("Account created. If you are not signed in automatically, disable email confirmation in Supabase Auth > Email.");
      updateAuthUi(null);
      return;
    }
  }

  updateAuthUi(data.session);
  const universitiesLoaded = await loadUniversities();
  if (!universitiesLoaded) {
    return;
  }
  await loadUserData();
}

async function handleSignOut() {
  if (isAuthBusy) {
    return;
  }

  setAuthBusyState(true);
  const { error } = await supabase.auth.signOut();
  setAuthBusyState(false);

  if (error) {
    setAuthStatus(error.message, true);
    return;
  }

  authForm.reset();
  resetAppState();
  updateAuthUi(null);
}

async function initializeAuth() {
  setAuthBusyState(true);
  const { data, error } = await supabase.auth.getSession();
  setAuthBusyState(false);

  if (error) {
    setAuthStatus(error.message, true);
    updateAuthUi(null);
    return;
  }

  updateAuthUi(data.session);
  if (data.session) {
    const universitiesLoaded = await loadUniversities();
    if (!universitiesLoaded) {
      return;
    }
    await loadUserData();
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    updateAuthUi(session);
    if (session) {
      const universitiesLoaded = await loadUniversities();
      if (!universitiesLoaded) {
        return;
      }
      await loadUserData();
    }
  });
}

function showPage(pageName) {
  const isScorer = pageName === "scorer";
  const isPlanner = pageName === "planner";
  const isQuestionnaire = pageName === "questionnaire";
  const isTasks = pageName === "tasks";

  pageScorer.classList.toggle("page-view-active", isScorer);
  pagePlanner.classList.toggle("page-view-active", isPlanner);
  pageQuestionnaire.classList.toggle("page-view-active", isQuestionnaire);
  pageTasks.classList.toggle("page-view-active", isTasks);

  navScorer.classList.toggle("nav-button-active", isScorer);
  navPlanner.classList.toggle("nav-button-active", isPlanner);
  navQuestionnaire.classList.toggle("nav-button-active", isQuestionnaire);
  navTasks.classList.toggle("nav-button-active", isTasks);
}

function createSubjectRow(subjectName = "", grade = "A*") {
  const row = document.createElement("div");
  row.className = "subject-row";
  row.innerHTML = `
    <label class="field">
      <span>Subject name</span>
      <input type="text" class="subject-name" placeholder="e.g. Mathematics" value="${subjectName}" />
    </label>
    <label class="field">
      <span>Grade</span>
      <select class="subject-grade">
        <option value="A*">A*</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
        <option value="G">G</option>
      </select>
    </label>
    <button type="button" class="icon-button remove-subject-button">Remove</button>
  `;
  row.querySelector(".subject-grade").value = grade;
  return row;
}

function createActivityRow(index) {
  const row = document.createElement("div");
  row.className = "activity-row";
  row.innerHTML = `
    <label class="field activity-name-field">
      <span>Activity ${index + 1}</span>
      <input type="text" class="activity-name" placeholder="e.g. Debate club president" />
    </label>
    <label class="field activity-description-field">
      <span>Activity description</span>
      <textarea
        class="activity-description"
        rows="3"
        maxlength="150"
        placeholder="Describe the activity in up to 150 characters"
      ></textarea>
    </label>
    <label class="field activity-impact-field">
      <span>Impact score</span>
      <select class="activity-impact">
        <option value="">Select</option>
        <option value="10">10</option>
        <option value="9">9</option>
        <option value="8">8</option>
        <option value="7">7</option>
        <option value="6">6</option>
        <option value="5">5</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
      </select>
    </label>
    <div class="activity-optimize">
      <button type="button" class="secondary-button activity-optimize-button">Optimize Activity</button>
    </div>
  `;
  return row;
}

function clampScore(value) {

  return Math.min(100, Math.max(0, value));
}

function calculateIbGpa(ibTotal) {
  if (ibTotal >= 43) return 4;
  if (ibTotal >= 41 && ibTotal < 43) return 3.9;
  if (ibTotal >= 39 && ibTotal < 41) return 3.8;
  if (ibTotal === 38) return 3.7;
  if (ibTotal === 37) return 3.6;
  if (ibTotal === 36) return 3.5;
  if (ibTotal === 35) return 3.4;
  if (ibTotal === 34) return 3.3;
  if (ibTotal === 33) return 3.15;
  if (ibTotal === 32) return 3.0;
  if (ibTotal === 31) return 2.85;
  if (ibTotal === 30) return 2.7;
  if (ibTotal === 29) return 2.5;
  if (ibTotal === 28) return 2.4;
  if (ibTotal === 27) return 2.3;
  if (ibTotal === 26) return 2.2;
  if (ibTotal === 25) return 2.1;
  if (ibTotal === 24) return 2.0;
  return 0;
}

function getIgcseGpa() {
  const rows = Array.from(igcseSubjects.querySelectorAll(".subject-row"));
  const validRows = rows.filter((row) => row.querySelector(".subject-name").value.trim().length > 0);

  if (validRows.length === 0) {
    return { error: "Enter a name for at least one IGCSE subject." };
  }

  const totalPoints = validRows.reduce((sum, row) => {
    const grade = row.querySelector(".subject-grade").value;
    return sum + gradePoints[grade];
  }, 0);

  return { value: totalPoints / validRows.length, subjectCount: validRows.length };
}

function convertSatToAcademicScore(satScore) {
  if (satScore >= 1550) return 100;
  if (satScore >= 1500 && satScore < 1550) return 93;
  if (satScore >= 1450 && satScore < 1500) return 86;
  if (satScore >= 1400 && satScore < 1450) return 78;
  if (satScore >= 1350 && satScore < 1400) return 72;
  if (satScore >= 1300 && satScore < 1450) return 66;
  if (satScore >= 1250 && satScore < 1300) return 60;
  if (satScore >= 1200 && satScore < 1250) return 54;
  if (satScore >= 1100 && satScore < 1200) return 49;
  if (satScore >= 1000 && satScore < 1100) return 44;
  return satScore / 25;
}

function getAcademicScore() {
  const igcseResult = getIgcseGpa();
  if (igcseResult.error) {
    return igcseResult;
  }

  const ibTotal = Number.parseInt(ibScoreInput.value, 10);
  const courseRigor = Number.parseInt(courseRigorInput.value, 10);
  const satScore = Number.parseFloat(satScoreInput.value);

  if (Number.isNaN(ibTotal) || Number.isNaN(courseRigor) || Number.isNaN(satScore)) {
    return { error: "Please enter IB grade, course rigor, and SAT score." };
  }

  if (ibTotal < 1 || ibTotal > 45) {
    return { error: "Overall IB grade must be between 1 and 45." };
  }

  if (courseRigor < 0 || courseRigor > 10) {
    return { error: "Course rigor must be between 0 and 10." };
  }

  if (satScore < 400 || satScore > 1600) {
    return { error: "SAT score must be between 400 and 1600." };
  }

  const ibGpa = calculateIbGpa(ibTotal);
  const unweightedGpa = 0.3 * igcseResult.value + 0.7 * ibGpa;

  let weightedGpa = unweightedGpa;
  if (courseRigor === 10) weightedGpa = unweightedGpa + 1.0;
  else if (courseRigor === 9) weightedGpa = unweightedGpa + 0.8;
  else if (courseRigor === 8) weightedGpa = unweightedGpa + 0.6;
  else if (courseRigor === 7) weightedGpa = unweightedGpa + 0.4;
  else if (courseRigor === 6) weightedGpa = unweightedGpa + 0.2;

  const gradesAcademicScore = clampScore(weightedGpa * 20);
  const satAcademicScore = clampScore(convertSatToAcademicScore(satScore));
  const overallAcademicScore = (gradesAcademicScore + satAcademicScore) / 2;

  return {
    value: overallAcademicScore,
    details: {
      igcseGpa: igcseResult.value,
      ibGpa,
      unweightedGpa,
      weightedGpa,
      gradesAcademicScore,
      satAcademicScore,
      subjectCount: igcseResult.subjectCount
    }
  };
}

function convertImpactToPoints(impactScore) {
  if (impactScore === 10) return 50;
  if (impactScore === 9) return 20;
  if (impactScore === 8) return 10;
  if (impactScore === 7) return 6;
  if (impactScore === 6) return 3;
  if (impactScore === 5) return 1;
  return 0;
}

function getExtracurricularScore() {
  const rows = Array.from(extracurricularActivities.querySelectorAll(".activity-row"));
  const completedActivities = rows
    .map((row) => ({
      name: row.querySelector(".activity-name").value.trim(),
      impact: row.querySelector(".activity-impact").value
    }))
    .filter((activity) => activity.name.length > 0 || activity.impact.length > 0);

  if (completedActivities.length === 0) {
    return { error: "Enter at least one extracurricular activity and impact score." };
  }

  const hasPartialActivity = completedActivities.some(
    (activity) => activity.name.length === 0 || activity.impact.length === 0
  );
  if (hasPartialActivity) {
    return { error: "Each extracurricular activity needs both a name and an impact score." };
  }

  const totalScore = completedActivities.reduce((sum, activity) => {
    return sum + convertImpactToPoints(Number.parseInt(activity.impact, 10));
  }, 0);

  return {
    value: Math.min(100, totalScore),
    activityCount: completedActivities.length
  };
}

function getProfileScore() {
  const academicResult = getAcademicScore();
  if (academicResult.error) return academicResult;

  const extracurricularResult = getExtracurricularScore();
  if (extracurricularResult.error) return extracurricularResult;

  const profileScore = 0.67 * academicResult.value + 0.33 * extracurricularResult.value;
  return {
    value: clampScore(profileScore),
    academicScore: academicResult.value,
    details: {
      ...academicResult.details,
      extracurricularScore: extracurricularResult.value,
      activityCount: extracurricularResult.activityCount
    }
  };
}

function classifyUniversity(profileScore, university) {
  if (profileScore >= university.safety_min && university.safety_min <= 100) return "Safety";
  if (profileScore >= university.match_min && university.match_min <= 100) return "Match";
  if (profileScore >= university.target_min && university.target_min <= 100) return "Target";
  if (profileScore >= university.reach_min) return "Reach";
  return "Hard Reach";
}

function getBadgeClass(category) {
  return `badge-${category.toLowerCase().replace(/\s+/g, "-")}`;
}

function getMappedScoringUniversity(plannerName) {
  return universities.find((university) => university.name === plannerName) || null;
}

function getPlannerCategoryMarkup(plannerName) {
  if (currentProfileScore === null) {
    return "";
  }

  const scoringMatch = getMappedScoringUniversity(plannerName);

  if (!scoringMatch) {
    return "";
  }

  const category = classifyUniversity(currentProfileScore, scoringMatch);
  return `<span class="badge planner-category ${getBadgeClass(category)}">${category}</span>`;
}

function getQuestionnairePreferences() {
  const financialAid = prefFinancialAid.value;
  const climatePreference = prefClimate.value;
  const campusVibePreference = prefCampusVibe.value;
  const socialScenePreference = prefSocialScene.value;
  const classStylePreference = prefClassStyle.value;
  const classSize = getSelectedRadioValue("class-size");

  if (!financialAid || !classSize || !climatePreference || !campusVibePreference || !socialScenePreference || !classStylePreference) {
    return null;
  }

  return {
    financialAid,
    climatePreference: climatePreference === "no_preference" ? null : Number.parseInt(climatePreference, 10),
    campusVibePreference: campusVibePreference === "no_preference" ? null : Number.parseInt(campusVibePreference, 10),
    socialScenePreference: socialScenePreference === "no_preference" ? null : Number.parseInt(socialScenePreference, 10),
    classStylePreference: classStylePreference === "no_preference" ? null : Number.parseInt(classStylePreference, 10),
    classSize,
    classSizeValue: classSize.startsWith("Small") ? 1 : classSize.startsWith("Medium") ? 2 : 3,
    campusRanking: campusRankingOrder
  };
}

function getAidFitScore(financialAidNeed, internationalAid) {
  const aidLevel = internationalAid === "unknown" ? "limited" : internationalAid;

  if (financialAidNeed === "Needs no financial aid") {
    return 100;
  }

  if (financialAidNeed === "Needs some financial aid") {
    if (aidLevel === "none") return 30;
    if (aidLevel === "limited") return 65;
    return 100;
  }

  if (financialAidNeed === "Needs full financial aid") {
    if (aidLevel === "full") return 100;
    if (aidLevel === "limited") return 50;
    return 0;
  }

  return 0;
}

function getCampusTypeScore(campusRanking, campusSetting) {
  const index = campusRanking.indexOf(campusSetting);
  if (index === 0) return 100;
  if (index === 1) return 65;
  return 30;
}

function getClassSizeScore(selectedClassSize, universitySizeBand) {
  if (!Number.isFinite(selectedClassSize) || !Number.isFinite(universitySizeBand)) {
    return 50;
  }
  return 100 - (50 * Math.abs(selectedClassSize - universitySizeBand));
}

function getOrdinalPreferenceMatchScore(userPreference, universityPreference) {
  if (userPreference === null) {
    return 100;
  }

  if (!Number.isFinite(userPreference) || !Number.isFinite(universityPreference)) {
    return 50;
  }

  return 100 - (50 * Math.abs(userPreference - universityPreference));
}

function getClimateScore(userClimatePreference, universityClimateValue) {
  return getOrdinalPreferenceMatchScore(userClimatePreference, universityClimateValue);
}

function getCampusVibeScore(userCampusVibePreference, universityCampusVibeValue) {
  return getOrdinalPreferenceMatchScore(userCampusVibePreference, universityCampusVibeValue);
}

function getSocialSceneScore(userSocialScenePreference, universitySocialSceneValue) {
  return getOrdinalPreferenceMatchScore(userSocialScenePreference, universitySocialSceneValue);
}

function getClassStyleScore(userClassStylePreference, universityClassStyleValue) {
  return getOrdinalPreferenceMatchScore(userClassStylePreference, universityClassStyleValue);
}

function getFitScore(plannerName) {
  const preferences = getQuestionnairePreferences();
  if (!preferences) {
    return null;
  }

  const university = getMappedScoringUniversity(plannerName);
  if (!university) {
    return null;
  }

  const aidFitScore = getAidFitScore(preferences.financialAid, university.international_aid);
  const campusTypeScore = getCampusTypeScore(preferences.campusRanking, university.campus_setting);
  const classSizeScore = getClassSizeScore(preferences.classSizeValue, university.undergrad_size_value);
  const climateScore = getClimateScore(preferences.climatePreference, university.climate_value);
  const campusVibeScore = getCampusVibeScore(preferences.campusVibePreference, university.campus_vibe_value);
  const socialSceneScore = getSocialSceneScore(preferences.socialScenePreference, university.social_scene_value);
  const classStyleScore = getClassStyleScore(preferences.classStylePreference, university.class_style_value);

  return Math.round((0.64 * aidFitScore) + (0.06 * campusTypeScore) + (0.06 * classSizeScore) + (0.06 * climateScore) + (0.06 * campusVibeScore) + (0.06 * socialSceneScore) + (0.06 * classStyleScore));
}

function getFitScoreMarkup(plannerName) {
  const fitScore = getFitScore(plannerName);
  if (fitScore === null) {
    return "";
  }

  let fitClass = "fit-below-50";
  if (fitScore >= 90) {
    fitClass = "fit-90-plus";
  } else if (fitScore >= 80) {
    fitClass = "fit-80s";
  } else if (fitScore >= 70) {
    fitClass = "fit-70s";
  } else if (fitScore >= 60) {
    fitClass = "fit-60s";
  } else if (fitScore >= 50) {
    fitClass = "fit-50s";
  }

  return `<span class="badge fit-badge ${fitClass}">Fit ${fitScore}</span>`;
}

function getPlannerBadgesMarkup(plannerName) {
  const fitScoreMarkup = getFitScoreMarkup(plannerName);
  const categoryMarkup = getPlannerCategoryMarkup(plannerName);

  if (!fitScoreMarkup && !categoryMarkup) {
    return "";
  }

  return `<span class="planner-option-badges">${fitScoreMarkup}${categoryMarkup}</span>`;
}

function sortPlannerSchoolsByFit(schools) {
  const preferences = getQuestionnairePreferences();
  if (!preferences) {
    return schools;
  }

  return [...schools].sort((a, b) => {
    const fitA = getFitScore(a.name) ?? -1;
    const fitB = getFitScore(b.name) ?? -1;

    if (fitB !== fitA) {
      return fitB - fitA;
    }

    return a.name.localeCompare(b.name);
  });
}

async function calculateAndRender() {

  const result = getProfileScore();

  if (result.error) {
    currentProfileScore = null;
    currentAcademicScore = null;
    profileScoreValue.textContent = "Not calculated yet";
    profileMessage.textContent = result.error;
    scoreBreakdown.hidden = true;
    scoreBreakdown.innerHTML = "";
    return;
  }

  currentProfileScore = result.value;
  currentAcademicScore = result.academicScore;
  profileScoreValue.textContent = currentProfileScore.toFixed(1);
  profileMessage.textContent = "ProfileScore = 0.67 × Overall Academic Score + 0.33 × ExtracurricularScore";
  scoreBreakdown.hidden = false;
  scoreBreakdown.innerHTML = `
    <div class="breakdown-grid">
      <div class="breakdown-item">
        <span>IGCSE GPA (${result.details.subjectCount} subjects)</span>
        <strong>${result.details.igcseGpa.toFixed(2)}</strong>
      </div>
      <div class="breakdown-item">
        <span>IB GPA</span>
        <strong>${result.details.ibGpa.toFixed(2)}</strong>
      </div>
      <div class="breakdown-item">
        <span>Unweighted GPA</span>
        <strong>${result.details.unweightedGpa.toFixed(2)}</strong>
      </div>
      <div class="breakdown-item">
        <span>Weighted GPA</span>
        <strong>${result.details.weightedGpa.toFixed(2)}</strong>
      </div>
      <div class="breakdown-item">
        <span>Grades Academic Score</span>
        <strong>${result.details.gradesAcademicScore.toFixed(1)}</strong>
      </div>
      <div class="breakdown-item">
        <span>SAT Academic Score</span>
        <strong>${result.details.satAcademicScore.toFixed(1)}</strong>
      </div>
      <div class="breakdown-item">
        <span>Overall Academic Score</span>
        <strong>${currentAcademicScore.toFixed(1)}</strong>
      </div>
      <div class="breakdown-item">
        <span>Extracurricular Score (${result.details.activityCount} activities)</span>
        <strong>${result.details.extracurricularScore.toFixed(1)}</strong>
      </div>
      <div class="breakdown-item">
        <span>Final ProfileScore</span>
        <strong>${currentProfileScore.toFixed(1)}</strong>
      </div>
    </div>
  `;
  renderPlanner();
  syncPlannerState();

  const profileSaved = await persistProfileData();
  if (profileSaved) {
    setAuthStatus(`Signed in as ${currentUser.email}. Profile saved.`);
  }
}

function renderPlanner() {
  const edSchools = sortPlannerSchoolsByFit(universities.filter((school) => school.hasED));
  const eaSchools = sortPlannerSchoolsByFit(universities.filter((school) => school.hasEA));
  const rdSchools = sortPlannerSchoolsByFit(universities);

  plannerEdList.innerHTML = edSchools
    .map(
      (school) => `
        <label class="planner-option" data-school="${school.name}">
          <input type="checkbox" class="planner-ed-checkbox" value="${school.name}" ${selectedPlannerEd === school.name ? "checked" : ""} />
          <span class="planner-option-text">
            <strong>${school.name}</strong>
            <span class="planner-option-meta">
              <span>Binding Early Decision</span>
              ${getPlannerBadgesMarkup(school.name)}
            </span>
          </span>
        </label>
      `
    )
    .join("");

  plannerEaList.innerHTML = eaSchools
    .map(
      (school) => `
        <label class="planner-option" data-school="${school.name}">
          <input type="checkbox" class="planner-ea-checkbox" value="${school.name}" ${selectedPlannerEa.has(school.name) ? "checked" : ""} />
          <span class="planner-option-text">
            <strong>${school.name}</strong>
            <span class="planner-option-meta">
              <span>Non-binding Early Action</span>
              ${getPlannerBadgesMarkup(school.name)}
            </span>
          </span>
        </label>
      `
    )
    .join("");

  plannerRdList.innerHTML = rdSchools
    .map(
      (school) => `
        <label class="planner-option" data-school="${school.name}">
          <input type="checkbox" class="planner-rd-checkbox" value="${school.name}" ${selectedPlannerRd.has(school.name) ? "checked" : ""} />
          <span class="planner-option-text">
            <strong>${school.name}</strong>
            <span class="planner-option-meta">
              <span>Regular Decision</span>
              ${getPlannerBadgesMarkup(school.name)}
            </span>
          </span>
        </label>
      `
    )
    .join("");
}

function getCheckedValues(container, selector) {
  return Array.from(container.querySelectorAll(selector))
    .filter((input) => input.checked)
    .map((input) => input.value)
    .sort((a, b) => a.localeCompare(b));
}

function syncPlannerState(trigger) {
  const edInputs = Array.from(plannerEdList.querySelectorAll(".planner-ed-checkbox"));
  const edSchool = selectedPlannerEd;
  const eaInputs = Array.from(plannerEaList.querySelectorAll(".planner-ea-checkbox"));
  const rdInputs = Array.from(plannerRdList.querySelectorAll(".planner-rd-checkbox"));

  if (trigger?.type === "ed" && trigger.value) {
    selectedPlannerEd = selectedPlannerEd === trigger.value ? "" : trigger.value;
    selectedPlannerEa.delete(trigger.value);
    selectedPlannerRd.delete(trigger.value);
    renderPlanner();
    return syncPlannerState();
  }

  if (trigger?.type === "ed" && edSchool) {
    selectedPlannerEa.delete(edSchool);
    selectedPlannerRd.delete(edSchool);
  }

  if (trigger?.type === "ea" && trigger.value) {
    if (selectedPlannerEa.has(trigger.value)) {
      selectedPlannerEa.delete(trigger.value);
    } else {
      selectedPlannerEa.add(trigger.value);
      selectedPlannerEd = selectedPlannerEd === trigger.value ? "" : selectedPlannerEd;
      selectedPlannerRd.delete(trigger.value);
    }
    renderPlanner();
    return syncPlannerState();
  }

  if (trigger?.type === "rd" && trigger.value) {
    if (selectedPlannerRd.has(trigger.value)) {
      selectedPlannerRd.delete(trigger.value);
    } else {
      selectedPlannerRd.add(trigger.value);
      selectedPlannerEd = selectedPlannerEd === trigger.value ? "" : selectedPlannerEd;
      selectedPlannerEa.delete(trigger.value);
    }
    renderPlanner();
    return syncPlannerState();
  }

  const selectedEa = selectedPlannerEa;
  const selectedRd = selectedPlannerRd;

  eaInputs.forEach((input) => {
    const isBlocked = input.value === edSchool || selectedRd.has(input.value);
    input.disabled = isBlocked;
    input.closest(".planner-option").classList.toggle("planner-option-disabled", isBlocked);
  });

  rdInputs.forEach((input) => {
    const isBlocked = input.value === edSchool || selectedEa.has(input.value);
    input.disabled = isBlocked;
    input.closest(".planner-option").classList.toggle("planner-option-disabled", isBlocked);
  });

  edInputs.forEach((input) => {
    const isBlocked = selectedEa.has(input.value) || selectedRd.has(input.value);
    input.disabled = isBlocked;
    input.closest(".planner-option").classList.toggle("planner-option-disabled", isBlocked);
  });

  renderPlannerSummary();
  syncApplicationTasks();
  schedulePersistence();
}

function renderPlannerSummary() {
  const edSchool = selectedPlannerEd;
  const eaSchools = Array.from(selectedPlannerEa).sort((a, b) => a.localeCompare(b));
  const rdSchools = Array.from(selectedPlannerRd).sort((a, b) => a.localeCompare(b));

  if (!edSchool && eaSchools.length === 0 && rdSchools.length === 0) {
    plannerSummary.className = "results-empty";
    plannerSummary.textContent = "Start selecting schools to build your application plan.";
    return;
  }

  const renderList = (items, emptyText) =>
    items.length > 0 ? `<ul class="summary-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>` : `<p class="helper-text">${emptyText}</p>`;

  plannerSummary.className = "planner-summary-grid";
  plannerSummary.innerHTML = `
    <section class="summary-block">
      <h3 class="heading-ed">Early Decision</h3>
      ${edSchool ? renderList([edSchool], "No Early Decision school selected.") : '<p class="helper-text">No Early Decision school selected.</p>'}
    </section>
    <section class="summary-block">
      <h3 class="heading-ea">Early Action</h3>
      ${renderList(eaSchools, "No Early Action schools selected.")}
    </section>
    <section class="summary-block">
      <h3 class="heading-rd">Regular Decision</h3>
      ${renderList(rdSchools, "No Regular Decision schools selected.")}
    </section>
  `;
}

function getSelectedRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}

function renderQuestionnaireSummary() {
  const financialAid = prefFinancialAid.value;
  const climatePreference = prefClimate.value;
  const campusVibePreference = prefCampusVibe.value;
  const socialScenePreference = prefSocialScene.value;
  const classStylePreference = prefClassStyle.value;
  const classSize = getSelectedRadioValue("class-size");

  const filledValues = [financialAid, climatePreference, campusVibePreference, socialScenePreference, classStylePreference, classSize].filter(Boolean);
  if (filledValues.length === 0) {
    questionnaireSummary.className = "results-empty";
    questionnaireSummary.textContent = "Fill out the questionnaire to capture the user's preferences.";
    return;
  }

  questionnaireSummary.className = "planner-summary-grid";
  questionnaireSummary.innerHTML = `
    <section class="summary-block">
      <h3>Financial Aid Need</h3>
      <p class="helper-text">${financialAid || "Not selected yet."}</p>
    </section>
    <section class="summary-block">
      <h3>Climate And Campus</h3>
      <p class="helper-text">${climatePreference === "1" ? "Cold / Snowy" : climatePreference === "2" ? "Mild / Mixed" : climatePreference === "3" ? "Warm year-round" : "Climate not selected yet."}</p>
      <p class="helper-text">${campusVibePreference === "1" ? "Highly Competitive and Intense" : campusVibePreference === "2" ? "Balanced" : campusVibePreference === "3" ? "Collaborative and relaxed" : "Campus vibe not selected yet."}</p>
      <p class="helper-text">${socialScenePreference === "1" ? "Party-heavy" : socialScenePreference === "2" ? "Balanced" : socialScenePreference === "3" ? "Quiet / Academic-focused" : "Social scene not selected yet."}</p>
      <p class="helper-text">${classStylePreference === "1" ? "Lecture-based" : classStylePreference === "2" ? "Discussion-based" : classStylePreference === "3" ? "Project-based" : "Class style not selected yet."}</p>
      <ul class="summary-list">
        ${campusRankingOrder.map((item, index) => `<li>${index + 1}. ${item}</li>`).join("")}
      </ul>
    </section>
    <section class="summary-block">
      <h3>Class Size</h3>
      <ul class="summary-list">
        <li>${classSize || "Not selected yet."}</li>
      </ul>
    </section>
  `;

  renderPlanner();
  syncPlannerState();
  schedulePersistence();
}

function renderCampusRanking() {
  campusRanking.innerHTML = campusRankingOrder
    .map(
      (item, index) => `
        <div class="ranking-item" draggable="true" data-campus="${item}">
          <span class="ranking-handle">::</span>
          <span class="ranking-position">${index + 1}</span>
          <span class="ranking-label">${item}</span>
        </div>
      `
    )
    .join("");
}

function formatTaskDate(dateString) {
  if (!dateString) return "No date";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function getPriorityClass(priority) {
  if (priority >= 9) return "priority-9-10";
  if (priority >= 7) return "priority-7-8";
  if (priority >= 5) return "priority-5-6";
  if (priority >= 3) return "priority-3-4";
  return "priority-1-2";
}

function getPriorityInlineStyle(priority) {
  if (priority >= 9) return "background:#f8d7d7;color:#922b2b;";
  if (priority >= 7) return "background:#ffe0c7;color:#9b4d08;";
  if (priority >= 5) return "background:#fff0c9;color:#8b6200;";
  if (priority >= 3) return "background:#dff0ff;color:#165c96;";
  return "background:#dff4d9;color:#1b6d30;";
}

function isTaskUpcoming(task) {
  return !task.completed;
}

function isTaskOverdue(task) {
  if (task.completed || !task.date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(`${task.date}T00:00:00`);
  return taskDate < today;
}

function compareTasks(a, b) {
  const direction = taskSortDirectionValue === "desc" ? -1 : 1;

  if (a.completed !== b.completed) {
    return Number(a.completed) - Number(b.completed);
  }

  let comparison = 0;
  if (taskSortFieldValue === "hours") {
    comparison = (a.hours || 0) - (b.hours || 0);
  } else if (taskSortFieldValue === "priority") {
    comparison = (a.priority || 0) - (b.priority || 0);
  } else {
    const aDate = a.date ? new Date(`${a.date}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
    const bDate = b.date ? new Date(`${b.date}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
    comparison = aDate - bDate;
  }

  if (comparison !== 0) {
    return comparison * direction;
  }

  return a.title.localeCompare(b.title);
}

function getVisibleTasks() {
  if (taskFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  if (taskFilter === "overdue") {
    return tasks.filter((task) => isTaskOverdue(task));
  }
  if (taskFilter === "upcoming") {
    return tasks.filter((task) => !task.completed);
  }
  return tasks;
}

function getPlannerSchoolByName(name) {
  return universities.find((school) => school.name === name) || null;
}

function getAppliedSchoolSelections() {
  const selections = [];

  if (selectedPlannerEd) {
    const school = getPlannerSchoolByName(selectedPlannerEd);
    if (school && school.ed_deadline) {
      selections.push({ name: school.name, deadline: school.ed_deadline, round: "ED" });
    }
  }

  Array.from(selectedPlannerEa)
    .sort((a, b) => a.localeCompare(b))
    .forEach((name) => {
      const school = getPlannerSchoolByName(name);
      if (school && school.ea_deadline) {
        selections.push({ name: school.name, deadline: school.ea_deadline, round: "EA" });
      }
    });

  Array.from(selectedPlannerRd)
    .sort((a, b) => a.localeCompare(b))
    .forEach((name) => {
      const school = getPlannerSchoolByName(name);
      if (school && school.rd_deadline) {
        selections.push({ name: school.name, deadline: school.rd_deadline, round: "RD" });
      }
    });

  return selections;
}

function parsePlannerDeadline(dateString) {
  const [day, month, year] = dateString.split("/");
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

function toInputDate(dateString) {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
}

function upsertGeneratedTask(config) {
  const existingTask = tasks.find((task) => task.sourceKey === config.sourceKey);

  if (existingTask) {
    if (!existingTask.userModified) {
      existingTask.title = config.title;
      existingTask.type = config.type;
      existingTask.date = config.date;
      existingTask.priority = config.priority;
      existingTask.hours = config.hours;
    }
    return;
  }

  tasks.push({
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: config.title,
    type: config.type,
    date: config.date,
    priority: config.priority,
    hours: config.hours,
    completed: false,
    autogenerated: true,
    userModified: false,
    sourceKey: config.sourceKey
  });
}

function syncApplicationTasks() {
  const selectedApplications = getAppliedSchoolSelections();
  const desiredKeys = new Set();

  if (selectedApplications.length > 0) {
    const earliestApplication = selectedApplications.reduce((earliest, current) => {
      return parsePlannerDeadline(current.deadline) < parsePlannerDeadline(earliest.deadline) ? current : earliest;
    });

    desiredKeys.add("essay:personal-statement");
    upsertGeneratedTask({
      sourceKey: "essay:personal-statement",
      title: "Write Personal Statement",
      type: "Essay",
      date: toInputDate(earliestApplication.deadline),
      priority: 9,
      hours: 20
    });
  }

  selectedApplications.forEach((application) => {
    const sourceKey = `essay:supplemental:${application.name}`;
    desiredKeys.add(sourceKey);
    upsertGeneratedTask({
      sourceKey,
      title: `${application.name} Supplemental Essays`,
      type: "Essay",
      date: toInputDate(application.deadline),
      priority: 5,
      hours: 4
    });
  });

  for (let index = tasks.length - 1; index >= 0; index -= 1) {
    const task = tasks[index];
    if (task.autogenerated && !desiredKeys.has(task.sourceKey)) {
      tasks.splice(index, 1);
    }
  }

  renderTaskList();
}

function renderTaskList() {
  [taskFilterUpcoming, taskFilterOverdue, taskFilterCompleted, taskFilterAll].forEach((button) => {
    button.classList.remove("filter-button-active");
  });

  if (taskFilter === "upcoming") taskFilterUpcoming.classList.add("filter-button-active");
  if (taskFilter === "overdue") taskFilterOverdue.classList.add("filter-button-active");
  if (taskFilter === "completed") taskFilterCompleted.classList.add("filter-button-active");
  if (taskFilter === "all") taskFilterAll.classList.add("filter-button-active");

  taskSortFieldValue = taskSortField?.value || "date";
  taskSortDirectionValue = taskSortDirection?.value || "asc";

  const visibleTasks = getVisibleTasks()
    .slice()
    .sort(compareTasks);

  if (visibleTasks.length === 0) {
    taskList.className = "task-list results-empty";
    taskList.textContent = "No tasks in this section yet.";
    return;
  }

  taskList.className = "task-list";
  taskList.innerHTML = visibleTasks
    .map(
      (task) => `
<article class="task-card">
  <div class="task-card-top">
    <div class="task-main">
      <div>
        <h3>${task.title}</h3>
        <p>${task.type} · ${formatTaskDate(task.date)} · ${task.hours} hour${task.hours === 1 ? "" : "s"}</p>
      </div>
      <div class="task-actions">
        <button type="button" class="secondary-button task-edit-button" data-task-id="${task.id}" style="padding-top:10px;padding-bottom:10px;">Edit</button>
        <button type="button" class="secondary-button task-toggle-button" data-task-id="${task.id}" style="padding-top:10px;padding-bottom:10px;">
          ${task.completed ? "Mark upcoming" : "Mark completed"}
        </button>
      </div>
    </div>
    <div class="task-side">
      <div class="task-meta">
        <span class="task-chip ${getPriorityClass(task.priority)}" style="${getPriorityInlineStyle(task.priority)}">Priority ${task.priority}</span>
        <span class="task-chip">${task.completed ? "Completed" : "Upcoming"}</span>
      </div>
      <button type="button" class="secondary-button task-remove-button" data-task-id="${task.id}" style="background:#f8d7d7;color:#922b2b;padding-top:20px;padding-bottom:20px;align-self:end;">Remove task</button>
    </div>
  </div>
</article>
      `
    )
    .join("");
}

function resetTaskForm() {
  taskForm.reset();
  editingTaskId = null;
  taskSaveButton.textContent = "Add task";
  taskCancelButton.hidden = true;
}

function populateTaskForm(task) {
  taskTitleInput.value = task.title;
  taskTypeInput.value = task.type;
  taskDateInput.value = task.date;
  taskPriorityInput.value = String(task.priority);
  taskHoursInput.value = String(task.hours);
  taskCompletedInput.checked = task.completed;
  editingTaskId = task.id;
  taskSaveButton.textContent = "Save changes";
  taskCancelButton.hidden = false;
}


authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authMode = "signin";
  await handleAuthSubmit(authMode);
});

authSignupButton.addEventListener("click", async () => {
  authMode = "signup";
  await handleAuthSubmit(authMode);
});

appSignoutButton.addEventListener("click", handleSignOut);

saveApplicationsButton.addEventListener("click", async () => {
  const applicationsSaved = await persistApplicationsData();
  if (!applicationsSaved) {
    return;
  }

  const tasksSaved = await persistTasksData();
  if (!tasksSaved) {
    return;
  }

  setAuthStatus(`Signed in as ${currentUser.email}. Applications saved.`);
});

savePreferencesButton.addEventListener("click", async () => {
  const saved = await persistProfileData();
  if (saved) {
    setAuthStatus(`Signed in as ${currentUser.email}. Preferences saved.`);
  }
});

navScorer.addEventListener("click", () => showPage("scorer"));
navPlanner.addEventListener("click", () => showPage("planner"));
navQuestionnaire.addEventListener("click", () => showPage("questionnaire"));
navTasks.addEventListener("click", () => showPage("tasks"));

calculateButton.addEventListener("click", () => {
  calculateAndRender();
});

addSubjectButton.addEventListener("click", () => {
  igcseSubjects.appendChild(createSubjectRow());
  schedulePersistence();
});

igcseSubjects.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  if (event.target.classList.contains("remove-subject-button")) {
    const row = event.target.closest(".subject-row");
    if (row) row.remove();
    schedulePersistence();
  }
});


plannerEdList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  syncPlannerState({ type: "ed", value: event.target.value });
});

plannerEaList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  syncPlannerState({ type: "ea", value: event.target.value });
});

plannerRdList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  syncPlannerState({ type: "rd", value: event.target.value });
});

[prefFinancialAid, prefClimate, prefCampusVibe, prefSocialScene, prefClassStyle].forEach((element) => {
  element.addEventListener("change", renderQuestionnaireSummary);
});

document.querySelectorAll('input[name="class-size"]').forEach((input) => {
  input.addEventListener("change", renderQuestionnaireSummary);
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  const type = taskTypeInput.value;
  const date = taskDateInput.value;
  const priority = Number.parseInt(taskPriorityInput.value, 10);
  const hours = Number.parseFloat(taskHoursInput.value);
  const completed = taskCompletedInput.checked;

  if (!title || !type || !date || Number.isNaN(priority) || Number.isNaN(hours)) {
    return;
  }

  if (priority < 1 || priority > 10 || hours < 0) {
    return;
  }

  if (editingTaskId) {
    const task = tasks.find((item) => item.id === editingTaskId);
    if (task) {
      task.title = title;
      task.type = type;
      task.date = date;
      task.priority = priority;
      task.hours = hours;
      task.completed = completed;
      if (task.autogenerated) {
        task.userModified = true;
      }
    }
  } else {
    tasks.push({
      id: `task-${Date.now()}`,
      title,
      type,
      date,
      priority,
      hours,
      completed,
      autogenerated: false,
      userModified: false,
      sourceKey: ""
    });
  }

  resetTaskForm();
  renderTaskList();
  syncApplicationTasks();
  await persistTasksData();
  setAuthStatus(`Signed in as ${currentUser.email}. Tasks saved.`);
});

taskCancelButton.addEventListener("click", resetTaskForm);

taskFilterUpcoming.addEventListener("click", () => {
  taskFilter = "upcoming";
  renderTaskList();
});

taskFilterOverdue.addEventListener("click", () => {
  taskFilter = "overdue";
  renderTaskList();
});

taskFilterCompleted.addEventListener("click", () => {
  taskFilter = "completed";
  renderTaskList();
});

taskFilterAll.addEventListener("click", () => {
  taskFilter = "all";
  renderTaskList();
});

taskSortField.addEventListener("change", () => {
  taskSortFieldValue = taskSortField.value;
  renderTaskList();
});

taskSortDirection.addEventListener("change", () => {
  taskSortDirectionValue = taskSortDirection.value;
  renderTaskList();
});

taskList.addEventListener("click", async (event) => {
  if (!(event.target instanceof HTMLElement)) return;

  const editButton = event.target.closest(".task-edit-button");
  if (editButton instanceof HTMLElement) {
    const task = tasks.find((item) => item.id === editButton.dataset.taskId);
    if (task) {
      populateTaskForm(task);
    }
    return;
  }

  const removeButton = event.target.closest(".task-remove-button");
  if (removeButton instanceof HTMLElement) {
    const index = tasks.findIndex((item) => item.id === removeButton.dataset.taskId);
    if (index !== -1) {
      const [removedTask] = tasks.splice(index, 1);
      if (editingTaskId === removedTask.id) {
        resetTaskForm();
      }
      renderTaskList();
      await persistTasksData();
      setAuthStatus(`Signed in as ${currentUser.email}. Task removed.`);
    }
    return;
  }

  const toggleButton = event.target.closest(".task-toggle-button");
  if (toggleButton instanceof HTMLElement) {
    const task = tasks.find((item) => item.id === toggleButton.dataset.taskId);
    if (task) {
      task.completed = !task.completed;
      renderTaskList();
      schedulePersistence();
    }
  }
});


async function optimizeActivityRow(row) {
  const nameInput = row.querySelector(".activity-name");
  const descriptionInput = row.querySelector(".activity-description");
  const impactInput = row.querySelector(".activity-impact");
  const optimizeButton = row.querySelector(".activity-optimize-button");

  if (!(nameInput instanceof HTMLInputElement) || !(descriptionInput instanceof HTMLTextAreaElement) || !(impactInput instanceof HTMLSelectElement) || !(optimizeButton instanceof HTMLButtonElement)) {
    return;
  }

  const activityName = nameInput.value.trim();
  const activityDescription = descriptionInput.value.trim();
  const impactScore = impactInput.value ? Number.parseInt(impactInput.value, 10) : null;

  if (!activityName || !activityDescription) {
    profileMessage.textContent = "Enter both an activity name and activity description before optimizing.";
    return;
  }

  const originalLabel = optimizeButton.textContent;
  optimizeButton.disabled = true;
  optimizeButton.textContent = "Optimizing...";

  const { data, error } = await supabase.functions.invoke("optimize-activity", {
    body: {
      activityName,
      activityDescription,
      impactScore,
    },
  });

  optimizeButton.disabled = false;
  optimizeButton.textContent = originalLabel;

  if (error) {
    profileMessage.textContent = error.message || "Failed to optimize activity.";
    return;
  }

  if (!data?.optimizedText || typeof data.optimizedText !== "string") {
    profileMessage.textContent = "The optimizer returned an invalid response.";
    return;
  }

  descriptionInput.value = data.optimizedText.slice(0, 150);
  profileMessage.textContent = "Activity description optimized. Review it before saving your profile.";
}


extracurricularActivities.addEventListener("click", async (event) => {
  if (!(event.target instanceof HTMLElement)) return;

  const optimizeButton = event.target.closest(".activity-optimize-button");
  if (!(optimizeButton instanceof HTMLButtonElement)) {
    return;
  }

  const row = optimizeButton.closest(".activity-row");
  if (!(row instanceof HTMLElement)) {
    return;
  }

  await optimizeActivityRow(row);
});

let draggedCampus = null;

campusRanking.addEventListener("dragstart", (event) => {
  const item = event.target.closest(".ranking-item");
  if (!item) return;
  draggedCampus = item.dataset.campus;
  item.classList.add("dragging");
});

campusRanking.addEventListener("dragend", (event) => {
  const item = event.target.closest(".ranking-item");
  if (item) {
    item.classList.remove("dragging");
  }
});

campusRanking.addEventListener("dragover", (event) => {
  event.preventDefault();
});

campusRanking.addEventListener("drop", (event) => {
  event.preventDefault();
  const target = event.target.closest(".ranking-item");
  if (!target || !draggedCampus) return;

  const targetCampus = target.dataset.campus;
  if (draggedCampus === targetCampus) return;

  const nextOrder = [...campusRankingOrder];
  const draggedIndex = nextOrder.indexOf(draggedCampus);
  const targetIndex = nextOrder.indexOf(targetCampus);
  nextOrder.splice(draggedIndex, 1);
  nextOrder.splice(targetIndex, 0, draggedCampus);
  campusRankingOrder = nextOrder;

  renderCampusRanking();
  renderQuestionnaireSummary();
});

igcseSubjects.appendChild(createSubjectRow("Mathematics", "A*"));
igcseSubjects.appendChild(createSubjectRow("English Language", "A"));

for (let i = 0; i < 10; i += 1) {
  extracurricularActivities.appendChild(createActivityRow(i));
}
renderPlanner();
syncPlannerState();
renderCampusRanking();
renderQuestionnaireSummary();
renderTaskList();
initializeAuth();
