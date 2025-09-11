// Creating instances of document objects
const taskList = document.getElementById("taskList");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");
const submitBtn = document.getElementById("submitBtn");
const editTaskBtn = document.getElementById("editTask");
const tasksHeading = document.getElementById("heading-tasks");
const searchBar = document.getElementById("searchBar");
const modeToggleBtn = document.getElementById("modeToggle");
const checkboxes = document.querySelectorAll(".form-check-input");
let editItem = null;
const tasksWithPriority = [];
let tasksTitleArray = [];
const priorityColors = {
  High: "task-priority-High",
  Medium: "task-priority-Medium",
  Low: "task-priority-Low",
  Completed: "task-completed",
};

const priorityValues = {
  High: 3,
  Medium: 2,
  Low: 1,
};

// Adding Event Listeners to Document Objects [buttons, text fields, dropdown lists]
editTaskBtn.addEventListener("click", (e) => {
  handleEditClick(e);
});
submitBtn.addEventListener("click", (e) => {
  addItem(e);
});
taskList.addEventListener("click", handleItemClick);
modeToggleBtn.addEventListener("click", toggleMode);
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", markAsComplete);
});

flatpickr(dueDateInput, {
  enableTime: false,
  dateFormat: "Y-m-d",
});

//settibng up default theme
function init() {
  const searchBar = document.getElementById("searchBar");
  searchBar.addEventListener("input", handleSearch);
  loadTasksFromLocalStorage();
  tasksCheck();
}

//search logic
function handleSearch() {
  const searchTerm = searchBar.value.toLowerCase();
  const tasks = document.querySelectorAll(".list-group-item");
  tasks.forEach((task) => {
    const taskTitle = task.childNodes[1].textContent.trim().toLowerCase();
    if (taskTitle.includes(searchTerm)) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
}

//logic to check whether no task is present and hide some buttons
function tasksCheck() {
  const tasks = taskList.children;
  if (tasks.length === 0) {
    tasksHeading.classList.toggle("hidden");
    searchBar.classList.toggle("hidden");
    document.querySelector(".clear_btn").style.display = "none";
    document.querySelector(".dropdown").style.display = "none";
  }
}

//this gets called after 'edit' button, fills text fields with data to be edited
function handleEditItem(e) {
  e.preventDefault();
  editTaskBtn.style.display = "inline";
  submitBtn.style.display = "none";
  const taskTitle = e.target.parentElement.childNodes[1].textContent.trim();
  console.log(e.target.parentElement.childNodes);
  const taskDescription = e.target.parentElement.childNodes[4].textContent
    .trim()
    .replace("Description:", "");
  document.getElementById("item").value = taskTitle;
  document.getElementById("description").value = taskDescription;
  document.getElementById("maintitle").innerText = "Edit your tasks below :";
  editItem = e.target;
  document.documentElement.scrollTop = 0;
  document.getElementById("item").focus();
}

//actual logic after editing a task and for adding a task   (gets called after edit button click, onChnage text fileds, date, priority)
function handleEditClick(e) {
  e.preventDefault();
  const itemInput = document.getElementById("item");
  const dueDateInput = document.getElementById("dueDate");
  const descriptionInput = document.getElementById("description");
  const editedItemText = itemInput.value;
  const editedDescriptionText = descriptionInput.value;
  const editedDueDate = new Date(dueDateInput.value);
  const currentDate = new Date().toISOString().split("T")[0];
  const editedPriority = document.getElementById("priority").value;

  //check if all fields are filled [basic validation]
  if (!editedItemText.trim()) {
    displayErrorMessage("Task not entered");
    return false;
  }

  if (!editedItemText) {
    displayErrorMessage("Title must not be empty!!!.");
    return false;
  }

  if (editedDueDate < new Date(currentDate)) {
    displayErrorMessage("Due date has already passed !!!");
    return false;
  }

  if (!editedPriority) {
    displayErrorMessage("Please select priority");
    return false;
  }
  //[basic validation ends]

  //actual manuplation of data
  const listItem = editItem.parentElement;
  listItem.childNodes[1].textContent = editedItemText;
  listItem.childNodes[4].textContent = editedDescriptionText.trim()
    ? "Description: " + editedDescriptionText
    : "";
  listItem.childNodes[7].textContent = editedPriority;
  if (editedDueDate >= new Date(currentDate)) {
    listItem.childNodes[6].textContent = `Due Date:${dueDateInput.value}`;
  }
  const capitalizedPriority =
    editedPriority.charAt(0).toUpperCase() +
    editedPriority.slice(1).toLowerCase();
  listItem.className = `list-group-item card shadow mb-4 bg-transparent ${priorityColors[capitalizedPriority]}`;
  displaySuccessMessage("Task edited successfully !!!");
  editItem = null;
  itemInput.value = "";
  descriptionInput.value = "";
  dueDateInput.value = "";
  document.getElementById("maintitle").innerText = "Add your tasks below :";
  editTaskBtn.style.display = "none";
  submitBtn.style.display = "inline";
  saveTasksToLocalStorage();
}

//Voice handled adding task logic   [start]
document.addEventListener("DOMContentLoaded", function () {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  let isListening = false;
  const voiceCommandButton = document.getElementById("voice-command-button");
  voiceCommandButton.addEventListener("click", function () {
    if (isListening) {
      recognition.stop();
      isListening = false;
      voiceCommandButton.innerHTML = '<i class="fas fa-microphone"></i>';
    } else {
      recognition.start();
      isListening = true;
      voiceCommandButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    }
  });

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    handleVoiceCommand(transcript);
  };

  recognition.onend = function () {
    isListening = false;
    voiceCommandButton.innerHTML = '<i class="fas fa-microphone"></i>';
  };

  function handleVoiceCommand(command) {
    console.log("Recognized Command:", command);
    const commandParts = command.split(" ");

    if (command.length >= 4) {
      if (command.toLowerCase().includes("add")) {
        const titleIndex = commandParts.indexOf("add") + 1;
        const dueIndex = commandParts.indexOf("due");
        const dateIndex = commandParts.indexOf("date");
        const priorityIndex = commandParts.indexOf("priority");
        if (
          titleIndex < dueIndex &&
          dueIndex < dateIndex &&
          dateIndex < priorityIndex
        ) {
          const taskTitle = commandParts.slice(titleIndex, dueIndex).join(" ");
          const dueDate = commandParts
            .slice(dateIndex + 1, priorityIndex)
            .join(" ");
          const priority = commandParts[priorityIndex + 1];
          addTask(taskTitle, dueDate, priority);
          return;
        }
      } else if (
        command.toLowerCase().includes("edit") &&
        command.toLowerCase().includes("task")
      ) {
        const editIndex = commandParts.indexOf("edit");
        const taskIndex = commandParts.indexOf("task");
        const toIndex = commandParts.indexOf("to");
        const dueDateIndex = commandParts.indexOf("due");
        const priorityIndex = commandParts.indexOf("priority");
        if (
          editIndex !== -1 &&
          taskIndex !== -1 &&
          toIndex !== -1 &&
          dueDateIndex !== -1 &&
          priorityIndex !== -1 &&
          toIndex > taskIndex &&
          dueDateIndex > toIndex &&
          priorityIndex > dueDateIndex &&
          priorityIndex < commandParts.length - 1
        ) {
          const oldTitle = commandParts.slice(taskIndex + 1, toIndex).join(" ");
          const newTitle = commandParts
            .slice(toIndex + 1, dueDateIndex)
            .join(" ");
          const newdueDate = commandParts.slice(
            dueDateIndex + 2,
            dueDateIndex + 4
          );
          const newpriority = capitalizeFirstLetter(
            commandParts[priorityIndex + 1]
          );

          function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
          }
          editTask(oldTitle, newTitle, newdueDate, newpriority);
          return;
        }
      } else if (command.toLowerCase().includes("delete")) {
        const titleIndex = commandParts.indexOf("task") + 1;
        const taskTitle = commandParts.slice(titleIndex).join(" ");
        deleteTask(taskTitle);
      } else {
        displayErrorMessage("Invalid voice command format.");
      }
    }
  }
  //Voice handled adding task logic   [end]

  function deleteTask(taskTitle) {
    const taskElement = findTaskElement(taskTitle);
    if (taskElement) {
      taskElement.remove();
      saveTasksToLocalStorage();
      displaySuccessMessage(`Task "${taskTitle}" deleted successfully.`);
    } else {
      displayErrorMessage(`Task "${taskTitle}" not found.`);
    }
  }

  //Setting edited data to below cards components
  function editTask(
    oldTitle,
    newTitle,
    newdueDate,
    newpriority,
    newDescription
  ) {
    const taskElement = findTaskElement(oldTitle);
    if (taskElement) {
      const dueDateElement = taskElement.querySelector("#task-dueDate");
      const priorityElement = taskElement.querySelector("#task-priority");
      const descElement = taskElement.querySelector("#description-at");
      const titleTextNode = taskElement.childNodes[1];
      titleTextNode.textContent = titleTextNode.textContent.replace(
        oldTitle,
        newTitle
      );
      //updating fields data
      if (dueDateElement) {
        dueDateElement.textContent = `Due Date: ${newdueDate}`;
        dueDateElement.id = "task-dueDate";
      }
      if (priorityElement) {
        priorityElement.textContent = newpriority;
        priorityElement.id = "task-priority";
      }
      if (descElement) {
        descElement.textContent = newDescription;
        descElement.id = "task-description";
      }

      //redesplaying task data in cards
      displayTaskDetails(taskElement);
      saveTasksToLocalStorage();
      displaySuccessMessage(`Task "${oldTitle}" edited successfully.`);
    } else {
      displayErrorMessage(`Task "${oldTitle}" not found.`);
    }
  }

  //returns the instance of task to be deleted or edited
  function findTaskElement(taskTitle) {
    const tasks = document.querySelectorAll(".list-group-item");
    for (const task of tasks) {
      const title = task.childNodes[1].textContent.trim().toLowerCase();
      if (title === taskTitle.toLowerCase()) {
        return task;
      }
    }
    return null;
  }

  //logic to add task, can be used for voice commands only, (need to be update this function!)
  function addTask(taskTitle, dueDate, priority) {
    const todoList = document.getElementById("taskList");
    const existingTasks = todoList.querySelectorAll("li");
    existingTasks.forEach((item) =>
      console.log(item.textContent.trim().toLowerCase())
    );
    const taskExists = Array.from(existingTasks).some(
      (item) =>
        item.textContent.trim().toLowerCase() === taskTitle.trim().toLowerCase()
    );

    if (taskExists) {
      displayErrorMessage("Task already exists !!!");
      return;
    }

    const li = document.createElement("li");
    const capitalizedPriority =
      priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    console.log("Priority:", priority);
    console.log("Priority Class:", priorityColors[capitalizedPriority]);

    li.className = `list-group-item card shadow mb-4 bg-transparent ${priorityColors[capitalizedPriority]}`;

    const completeCheckbox = document.createElement("input");
    completeCheckbox.type = "checkbox";
    completeCheckbox.className = "form-check-input task-completed";
    completeCheckbox.addEventListener("change", markAsComplete);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-outline-danger float-right delete";
    deleteButton.innerHTML =
      '<ion-icon name="trash-outline" style="font-size: 20px"></ion-icon>';

    const editButton = document.createElement("button");
    editButton.className = "btn btn-outline-success btn-sm float-right edit";
    editButton.innerHTML =
      '<ion-icon name="create-outline" style="font-size: 20px"></ion-icon>';
    editButton.style.marginRight = "8px";
    editButton.addEventListener("click", handleEditItem);

    const dateTimeParagraph = document.createElement("p");
    dateTimeParagraph.className = "text-muted";
    dateTimeParagraph.id = "created-at";
    dateTimeParagraph.style.fontSize = "15px";
    dateTimeParagraph.style.margin = "0 19px";
    dateTimeParagraph.appendChild(
      document.createTextNode("Created:" + new Date().toLocaleString())
    );

    const dueDateParagraph = document.createElement("p");
    dueDateParagraph.className = "text-muted";
    dueDateParagraph.id = "task-dueDate";
    dueDateParagraph.style.fontSize = "15px";
    dueDateParagraph.style.margin = "0 19px";
    dueDateParagraph.appendChild(
      document.createTextNode("Due Date:" + dueDate)
    );

    const priorityParagraph = document.createElement("p");
    priorityParagraph.className = "text-muted";
    priorityParagraph.id = "task-priority";
    priorityParagraph.style.fontSize = "15px";
    priorityParagraph.style.margin = "0 19px";
    priorityParagraph.appendChild(document.createTextNode(capitalizedPriority));

    li.appendChild(completeCheckbox);
    li.appendChild(document.createTextNode(taskTitle));
    li.appendChild(deleteButton);
    li.appendChild(editButton);
    li.appendChild(dateTimeParagraph);
    li.appendChild(dueDateParagraph);
    li.appendChild(priorityParagraph);
    todoList.appendChild(li);
    saveTasksToLocalStorage();

    displayTaskDetails(li);
  }
});