const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoLane = document.getElementById("screened");

document.addEventListener('DOMContentLoaded', (event) => {
  var deleteButtons = document.querySelectorAll('.delete-button');
  deleteButtons.forEach(function(button) {
    button.addEventListener('click', deleteTask);
  });
});


const headerIdTracker = {
  screened: 3,
  selected: 1,
  incubated: 1,
  overdued: 1,
}

function isWhitespaceOrEmpty(str) {
  return !str.trim().length;
}


const handleInputSubmit = (e) => {
  e.preventDefault();
  const value = input.value;

  if (isWhitespaceOrEmpty(value)) return;


var newTask = document.createElement("div");
var paragraph = document.createElement("p")
var button = document.createElement("button");
var icon = document.createElement("i");

 // Set text content for the italic element
newTask.classList.add("task");
newTask.appendChild(paragraph)
paragraph.textContent = value;
newTask.appendChild(button);
button.appendChild(icon);
icon.classList.add("fa-solid", "fa-trash")
icon.addEventListener('click', function(){
  newTask.style.display = 'none';
})

  
  


  newTask.addEventListener("dragstart", () => {
    newTask.classList.add("is-dragging");
  });

  newTask.addEventListener("dragend", () => {
    newTask.classList.remove("is-dragging");
  });

  headerIdTracker.screened++;

  todoLane.appendChild(newTask);


  newTask.setAttribute("data-id", headerIdTracker.screened);

  input.value = "";

  appendDraggables();
  appendDropabbles();

}

form.addEventListener("submit", handleInputSubmit);
input.addEventListener("keypress", (e)=>{
  if(e.code == 13){
    handleInputSubmit(e);
  }
});

function deleteTask(e){
  e.target.closest('.delete-button').parentElement.remove();
}

// Dragging code

function handleDragEnd(task) {
  task.classList.remove("is-dragging");

  // Check if the task is being moved to the "selected" lane
  if (task.parentElement.id === 'selected' && task.getAttribute("data-serial") === null) {
    // Prompt acting as a popup
    const serial = prompt('Enter serial');
    // Insert the data serial which will be used to reverse order the tasks (IE: Descending order)
    task.setAttribute("data-serial", serial);

    // Create a new span element for the serial number
    const serialSpan = document.createElement("span");
    serialSpan.textContent = `${serial}. `;

    // Insert the serial span before the existing content
    task.firstChild.before(serialSpan);
    task.classList.add("flex");

    // Get all child nodes which are elements (HTML element)
    const tasks = Array.from(task.parentElement.querySelectorAll('.task'));

    // Sort the tasks in descending order based on data-serial
    tasks.sort((a, b) => {
      const serialA = a.getAttribute("data-serial");
      const serialB = b.getAttribute("data-serial");
      if (serialA === null) return 1;
      if (serialB === null) return -1;
      return Number(serialB) - Number(serialA);
    });

    // Append sorted tasks back to the "selected" lane
    tasks.forEach(element => task.parentElement.appendChild(element));

  }

  // Check if the task is being moved to the "incubated" lane
  if (task.parentElement.id === 'incubated' && task.getAttribute("data-days") === null) {
    // Prompt for remaining days
    const remainingDays = prompt('Enter remaining days');
    // Insert the remaining days
    task.setAttribute("data-days", remainingDays);

    // Create a new div element for the remaining days
    const daysDiv = document.createElement("div");
    daysDiv.classList.add("remaining-days");
    // Set the initial text content for the countdown
    daysDiv.innerHTML = `<p style="font-size: 12px; margin-top: -14px;">Remaining Days: ${remainingDays}</p>`;
    // Insert the days div at the bottom of the task
    task.appendChild(daysDiv);

    // Countdown the remaining days
    const countdownInterval = setInterval(() => {
      remainingDays--;
      // Update the text content for the countdown
      daysDiv.textContent = `Remaining Days: ${remainingDays}. `;

      // If remaining days reach 0 or less, clear the interval
      if (remainingDays <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000); // Update the countdown every second
  }

}




// This is enclosed in a function due to new task addition feature
// If `draggables` is global state as constant, it doesn't have access to the newly added tasks
// and additionally the new task doesn't have the following event listener calls, `dragstart` and `dragend`
function appendDraggables(){
  const draggables = document.querySelectorAll(".task");
  draggables.forEach((task) => {
    // For every task add a dragstart and dragend event listener
    task.addEventListener("dragstart", () => {
        task.classList.add("is-dragging");
      }
    );
    task.addEventListener("dragend", () => {
        handleDragEnd(task);
      }
    );
    }
  );
  
}

function appendDropabbles(){

  const droppables = document.querySelectorAll(".swim-lane");
  droppables.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();

      const bottomTask = insertAboveTask(zone, e.clientY);
      const curTask = document.querySelector(".is-dragging");

      if (!bottomTask) {
        zone.appendChild(curTask);
      } else {
        zone.insertBefore(curTask, bottomTask);
      }
      console.log(`After drag: ${curTask}`);
    });
  });

}

const insertAboveTask = (zone, mouseY) => {
  const els = zone.querySelectorAll(".task:not(.is-dragging)");

  let closestTask = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  els.forEach((task) => {
    const { top } = task.getBoundingClientRect();

    const offset = mouseY - top;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestTask = task;
    }
  });

  return closestTask;
};


document.addEventListener('DOMContentLoaded', (event) => {
  appendDraggables();
  appendDropabbles();
});