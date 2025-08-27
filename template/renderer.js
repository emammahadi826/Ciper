// DOM Elements
let taskInput, addButton, taskList, completedTaskList, taskListContainer, completedTaskListContainer, profileViewContainer, settingsViewContainer, scheduleButton, scheduleModal, confirmSchedule, cancelSchedule, themeButton, hamburgerMenu, sidebar, mainContent, menuIcon, dropdownContent, settingsLink, homeLink, completedTasksLink, profileLink, notificationPrompt, notificationPromptText, notificationYes, notificationNo, notificationSnooze, themeToggle, inputArea;

// App state
let tasks = [];

// Functions

function initializeDOMElements() {
    taskInput = document.getElementById('task-input');
    addButton = document.getElementById('add-button');
    taskList = document.getElementById('task-list');
    completedTaskList = document.getElementById('completed-task-list');
    taskListContainer = document.getElementById('task-list-container');
    completedTaskListContainer = document.getElementById('completed-task-list-container');
    profileViewContainer = document.getElementById('profile-view-container');
    settingsViewContainer = document.getElementById('settings-view-container');
    scheduleButton = document.getElementById('schedule-button');
    scheduleModal = document.getElementById('schedule-modal');
    confirmSchedule = document.getElementById('confirm-schedule');
    cancelSchedule = document.getElementById('cancel-schedule');
    themeButton = document.getElementById('theme-button');
    hamburgerMenu = document.getElementById('hamburger-menu');
    mainContent = document.getElementById('main-content');
    menuIcon = document.getElementById('menu-icon');
    dropdownContent = document.getElementById('dropdown-content');
    notificationPrompt = document.getElementById('notification-prompt');
    notificationPromptText = document.getElementById('notification-prompt-text');
    notificationYes = document.getElementById('notification-yes');
    notificationNo = document.getElementById('notification-no');
    notificationSnooze = document.getElementById('notification-snooze');
    themeToggle = document.getElementById('theme-toggle');
    inputArea = document.getElementById('input-area');
}

function initializeMenuEventListeners() {
    sidebar = document.getElementById('sidebar');
    settingsLink = document.getElementById('settings-link');
    homeLink = document.getElementById('home-link');
    completedTasksLink = document.getElementById('completed-tasks-link');
    profileLink = document.getElementById('profile-link');

    homeLink.addEventListener('click', (event) => {
        event.preventDefault();
        showPendingTasksView();
    });
    completedTasksLink.addEventListener('click', (event) => {
        event.preventDefault();
        showCompletedTasksView();
    });
    profileLink.addEventListener('click', (event) => {
        event.preventDefault();
        showProfileView();
    });
    settingsLink.addEventListener('click', (event) => {
        event.preventDefault();
        showSettingsView();
    });
    
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        mainContent.classList.toggle('full-width');
        inputArea.classList.toggle('full-width');
    });
}

async function loadMenu() {
    try {
        const response = await fetch('./menu.html');
        if (!response.ok) {
            throw new Error(`Failed to fetch menu.html: ${response.statusText}`);
        }
        const menuHTML = await response.text();
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) {
            menuContainer.innerHTML = menuHTML;
            initializeMenuEventListeners();
        } else {
            console.error('#menu-container not found');
        }
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

async function loadSettings() {
    try {
        const response = await fetch('./settings.html');
        if (!response.ok) {
            throw new Error(`Failed to fetch settings.html: ${response.statusText}`);
        }
        const settingsHTML = await response.text();
        if (settingsViewContainer) {
            settingsViewContainer.innerHTML = settingsHTML;
        } else {
            console.error('#settings-view-container not found');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}


function renderTasks() {
    taskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    const pendingTasks = tasks.filter(task => task.status !== 'completed');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    pendingTasks.forEach(task => {
        const taskBubble = document.createElement('div');
        taskBubble.classList.add('task-bubble');
        let taskHTML = `<strong>${task.title}</strong>`;
        if (task.scheduled_at) {
            taskHTML += `<br><small>Scheduled for: ${new Date(task.scheduled_at).toLocaleString()}</small>`;
        }
        taskBubble.innerHTML = taskHTML;
        taskList.appendChild(taskBubble);
    });

    completedTasks.forEach(task => {
        const taskBubble = document.createElement('div');
        taskBubble.classList.add('task-bubble', 'completed');
        let taskHTML = `<strong>${task.title}</strong>`;
        if (task.scheduled_at) {
            taskHTML += `<br><small>Completed at: ${new Date(task.scheduled_at).toLocaleString()}</small>`;
        }
        taskBubble.innerHTML = taskHTML;
        completedTaskList.appendChild(taskBubble);
    });
}

function saveTasks() {
    window.electronAPI.send('save-tasks', tasks);
}

function showPendingTasksView() {
    taskListContainer.style.display = 'block';
    completedTaskListContainer.style.display = 'none';
    profileViewContainer.style.display = 'none';
    settingsViewContainer.style.display = 'none';
    document.getElementById('input-area').style.display = 'flex';
    document.querySelector('header h1').textContent = 'Task Manager';
    homeLink.classList.add('active');
    completedTasksLink.classList.remove('active');
    profileLink.classList.remove('active');
    settingsLink.classList.remove('active');
}

function showCompletedTasksView() {
    taskListContainer.style.display = 'none';
    completedTaskListContainer.style.display = 'block';
    profileViewContainer.style.display = 'none';
    settingsViewContainer.style.display = 'none';
    document.getElementById('input-area').style.display = 'none';
    document.querySelector('header h1').textContent = 'Completed Tasks';
    homeLink.classList.remove('active');
    completedTasksLink.classList.add('active');
    profileLink.classList.remove('active');
    settingsLink.classList.remove('active');
}

function showProfileView() {
    taskListContainer.style.display = 'none';
    completedTaskListContainer.style.display = 'none';
    profileViewContainer.style.display = 'block';
    settingsViewContainer.style.display = 'none';
    document.getElementById('input-area').style.display = 'none';
    document.querySelector('header h1').textContent = 'Profile';
    homeLink.classList.remove('active');
    completedTasksLink.classList.remove('active');
    profileLink.classList.add('active');
    settingsLink.classList.remove('active');
}

function showSettingsView() {
    taskListContainer.style.display = 'none';
    completedTaskListContainer.style.display = 'none';
    profileViewContainer.style.display = 'none';
    settingsViewContainer.style.display = 'block';
    document.getElementById('input-area').style.display = 'none';
    document.querySelector('header h1').textContent = 'Settings';
    homeLink.classList.remove('active');
    completedTasksLink.classList.remove('active');
    profileLink.classList.remove('active');
    settingsLink.classList.add('active');
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        const newTask = {
            id: Date.now(),
            title: taskText,
            status: 'pending'
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }
}

function scheduleTask() {
    const taskText = taskInput.value.trim();
    const time = document.getElementById('time-input').value;

    if (taskText === '') {
        alert('Please enter a task description.');
        return;
    }

    if (time === '') {
        alert('Please select a time for the task.');
        return;
    }

    const [hours, minutes] = time.split(':');
    const now = new Date();
    const scheduled_at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (scheduled_at < now) {
        alert('You cannot schedule a task in the past.');
        return;
    }

    const newTask = {
        id: Date.now(),
        title: taskText,
        created_at: new Date().toISOString(),
        scheduled_at: scheduled_at.toISOString(),
        recurrence: 'none',
        status: 'pending',
        snoozed_until: null,
        metadata: {}
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    scheduleModal.style.display = 'none';
}

// Event Listeners
function initializeEventListeners() {
    addButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addButton.click();
        }
    });

    if (scheduleButton) {
        scheduleButton.addEventListener('click', () => {
            scheduleModal.style.display = 'block';
        });
    }

    if (cancelSchedule) {
        cancelSchedule.addEventListener('click', () => {
            scheduleModal.style.display = 'none';
        });
    }

    if (confirmSchedule) {
        confirmSchedule.addEventListener('click', scheduleTask);
    }

    themeButton.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        const theme = document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
        localStorage.setItem('theme', theme);
    });

    themeToggle.addEventListener('change', () => {
        const isChecked = themeToggle.checked;
        document.body.classList.toggle('dark-theme', !isChecked);
        document.body.classList.toggle('light-theme', isChecked);
        const theme = isChecked ? 'light-theme' : 'dark-theme';
        localStorage.setItem('theme', theme);
    });

    menuIcon.addEventListener('click', (event) => {
        dropdownContent.classList.toggle('show');
        event.stopPropagation();
    });

    document.body.addEventListener('click', (event) => {
        if (menuIcon && !menuIcon.contains(event.target)) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });
}


// Electron API Receivers
window.electronAPI.receive('load-tasks', (loadedTasks) => {
    tasks = loadedTasks;
    renderTasks();
});

window.electronAPI.receive('show-notification-prompt', (task) => {
    notificationPromptText.textContent = `Sir, this is your task complete time. Did you complete "${task.title}"?`;
    notificationPrompt.style.display = 'block';

    notificationYes.onclick = () => {
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex > -1) {
            tasks[taskIndex].status = 'completed';
            saveTasks();
            renderTasks();
        }
        notificationPrompt.style.display = 'none';
    };

    notificationNo.onclick = () => {
        notificationPrompt.style.display = 'none';
    };

    notificationSnooze.onclick = () => {
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex > -1) {
            const snoozedTask = tasks[taskIndex];
            const newScheduledTime = new Date(new Date(snoozedTask.scheduled_at).getTime() + 5 * 60000);
            snoozedTask.scheduled_at = newScheduledTime.toISOString();
            tasks[taskIndex] = snoozedTask;
            saveTasks();
            renderTasks();
        }
        notificationPrompt.style.display = 'none';
    };
});

// Initial Setup
async function initializeApp() {
    initializeDOMElements();
    await loadMenu();
    await loadSettings();
    initializeEventListeners();
    const currentTheme = localStorage.getItem('theme') || 'dark-theme';
    document.body.classList.add(currentTheme);
    if (currentTheme === 'light-theme') {
        document.body.classList.remove('dark-theme');
        themeToggle.checked = true;
    } else {
        themeToggle.checked = false;
    }
    showPendingTasksView();
}

initializeApp();