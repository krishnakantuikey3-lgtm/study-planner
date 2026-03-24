import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Bool "mo:core/Bool";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";
import Order "mo:core/Order";
import List "mo:core/List";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  type DayIntensity = {
    #green;
    #red;
    #gray;
  };

  public type Subject = Text;

  public type StudyTask = {
    id : Nat;
    text : Text;
    date : Text;
    completed : Bool;
  };

  public type TimetableConfig = {
    dailyStudyHours : Nat;
    subjects : [Subject];
    subjectTimeSlots : [(Subject, Time.Time)];
  };

  public type CalendarEntry = {
    date : Text;
    tasks : [StudyTask];
  };

  public type ProgressStats = {
    totalTasks : Nat;
    completedTasks : Nat;
    remainingTasks : Nat;
  };

  public type DailyCompletionStatus = {
    date : Text;
    status : DayIntensity;
  };

  public type UserProfile = {
    name : Text;
  };

  public type UserData = {
    tasks : Map.Map<Nat, StudyTask>;
    nextTaskId : Nat;
    timetableConfig : TimetableConfig;
    completedDays : Set.Set<Text>;
  };

  let userData : Map.Map<Principal, UserData> = Map.empty();
  let userProfiles : Map.Map<Principal, UserProfile> = Map.empty();

  func getUserData(caller : Principal) : UserData {
    switch (userData.get(caller)) {
      case (null) { Runtime.trap("User data not found") };
      case (?data) { data };
    };
  };

  func getTask(caller : Principal, taskId : Nat) : StudyTask {
    switch (userData.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?data) {
        switch (data.tasks.get(taskId)) {
          case (null) { Runtime.trap("Task not found") };
          case (?task) { task };
        };
      };
    };
  };

  module CalendarEntry {
    public func compare(a : CalendarEntry, b : CalendarEntry) : Order.Order {
      Text.compare(a.date, b.date);
    };
  };

  func daysInMonth(year : Nat, month : Nat) : Nat {
    switch (month) {
      case (2) {
        if ((year % 4 == 0 and year % 100 != 0) or year % 400 == 0) {
          29;
        } else {
          28;
        };
      };
      case (4) { 30 };
      case (6) { 30 };
      case (9) { 30 };
      case (11) { 30 };
      case (_) { 31 };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerUser() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    if (userData.containsKey(caller)) {
      Runtime.trap("User already registered");
    };

    let defaultUserData : UserData = {
      tasks = Map.empty();
      nextTaskId = 1;
      timetableConfig = {
        dailyStudyHours = 4;
        subjects = [];
        subjectTimeSlots = [];
      };
      completedDays = Set.empty();
    };

    userData.add(caller, defaultUserData);
  };

  public shared ({ caller }) func addSubject(subject : Subject) : async TimetableConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add subjects");
    };

    let data = getUserData(caller);

    let existingSubjects = data.timetableConfig.subjects;
    let newSubjects = existingSubjects.concat([subject]);
    let numSubjects = newSubjects.size();
    if (numSubjects == 0) {
      Runtime.trap("No subjects available");
    };
    let timeSlotsPerSubject = data.timetableConfig.dailyStudyHours / numSubjects;

    let subjectTimeSlots = newSubjects.map(func(s) { (s, timeSlotsPerSubject) });

    let updatedConfig : TimetableConfig = {
      dailyStudyHours = data.timetableConfig.dailyStudyHours;
      subjects = newSubjects;
      subjectTimeSlots;
    };

    userData.add(
      caller,
      {
        data with
        timetableConfig = updatedConfig;
      },
    );

    updatedConfig;
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };

    getUserData(caller).timetableConfig.subjects;
  };

  public shared ({ caller }) func addTask(text : Text, date : Text) : async StudyTask {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };

    let data = getUserData(caller);

    let newTask = {
      id = data.nextTaskId;
      text;
      date;
      completed = false;
    };

    data.tasks.add(newTask.id, newTask);

    userData.add(
      caller,
      {
        data with
        nextTaskId = data.nextTaskId + 1;
      },
    );

    newTask;
  };

  public shared ({ caller }) func toggleTaskCompletion(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle task completion");
    };

    let data = getUserData(caller);
    let task = getTask(caller, taskId);

    let taskList : List.List<StudyTask> = List.empty();
    for (taskIdIter in data.tasks.keys()) {
      if (taskIdIter != taskId) {
        taskList.add(getTask(caller, taskIdIter));
      };
    };
    taskList.add({ task with completed = not task.completed });
    let newTasks = taskList.toArray();

    // FIXED: Provide explicit type parameters in the following line
    userData.add(
      caller,
      { data with tasks = Map.fromIter<Nat, StudyTask>(newTasks.values().enumerate().map(func((i, t)) { (i + 1, t) })) },
    );
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    let data = getUserData(caller);

    if (not data.tasks.containsKey(taskId)) {
      Runtime.trap("Task not found");
    };

    data.tasks.remove(taskId);
    userData.add(caller, data);
  };

  public query ({ caller }) func getTasksForDate(date : Text) : async [StudyTask] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let tasks : List.List<StudyTask> = List.empty();
    for (task in getUserData(caller).tasks.values()) {
      if (task.date == date) {
        tasks.add(task);
      };
    };
    tasks.toArray();
  };

  public query ({ caller }) func getDailyCompletionStatus(year : Nat, month : Nat) : async [DailyCompletionStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view completion status");
    };

    let daysInMonthVal = daysInMonth(year, month);

    let dailyStatus : List.List<DailyCompletionStatus> = List.empty();

    for (day in Nat.range(1, daysInMonthVal + 1)) {
      let date = year.toText().concat("-").concat(month.toText()).concat("-").concat(day.toText());

      let tasksForDay : List.List<StudyTask> = List.empty();
      for (task in getUserData(caller).tasks.values()) {
        if (task.date == date) {
          tasksForDay.add(task);
        };
      };

      if (tasksForDay.isEmpty()) {
        dailyStatus.add({ date; status = #gray });
      } else {
        if (tasksForDay.toArray().all(func(task) { task.completed })) {
          dailyStatus.add({ date; status = #green });
        } else {
          dailyStatus.add({ date; status = #red });
        };
      };
    };

    dailyStatus.toArray();
  };

  public query ({ caller }) func getProgressStats(startDate : Text, endDate : Text) : async ProgressStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress stats");
    };

    var totalTasks = 0;
    var completedTasks = 0;
    var remainingTasks = 0;

    for (task in getUserData(caller).tasks.values()) {
      if (task.date >= startDate and task.date <= endDate) {
        totalTasks += 1;
        if (task.completed) {
          completedTasks += 1;
        } else {
          remainingTasks += 1;
        };
      };
    };

    {
      totalTasks;
      completedTasks;
      remainingTasks;
    };
  };
};
