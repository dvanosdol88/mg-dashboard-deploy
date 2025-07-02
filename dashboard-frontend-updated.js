// Updated Dashboard frontend JavaScript to use database API instead of localStorage
// This replaces the localStorage functions in your existing index.html

const API_BASE_URL = 'http://localhost:3001/api'; // Change this to your deployed API URL

// Replace the loadTasks function
async function loadTasks() {
    try {
        // Get tasks from database instead of localStorage
        const response = await fetch(`${API_BASE_URL}/tasks/default_user`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        const tasks = await response.json();
        
        // Separate work and personal tasks
        const workTasks = tasks.filter(task => task.type === 'work');
        const personalTasks = tasks.filter(task => task.type === 'personal');
        
        // Update the DOM
        displayTasks('work-list', workTasks);
        displayTasks('personal-list', personalTasks);
        
        console.log('✅ Tasks loaded from database:', tasks.length);
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
        // Fallback to localStorage if API fails
        loadTasksFromLocalStorage();
    }
}

// Replace the saveTasks function  
async function saveTask(text, type) {
    try {
        // Save task to database instead of localStorage
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                type: type,
                userId: 'default_user'
            })
        });
        
        if (!response.ok) throw new Error('Failed to save task');
        
        const newTask = await response.json();
        console.log('✅ Task saved to database:', newTask);
        
        // Reload tasks to update display
        await loadTasks();
        
    } catch (error) {
        console.error('❌ Error saving task:', error);
        // Fallback to localStorage if API fails
        saveTaskToLocalStorage(text, type);
    }
}

// Replace the task completion toggle function
async function toggleTaskCompletion(taskId, completed) {
    try {
        // Update task in database instead of localStorage
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: completed
            })
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        console.log('✅ Task updated in database:', updatedTask);
        
        // Reload tasks to update display
        await loadTasks();
        
    } catch (error) {
        console.error('❌ Error updating task:', error);
        // Fallback to localStorage if API fails
        toggleTaskInLocalStorage(taskId, completed);
    }
}

// Helper function to display tasks in the DOM
function displayTasks(listId, tasks) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;
    
    listElement.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onchange="toggleTaskCompletion(${task.id}, this.checked)">
            <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            ${task.description ? `<small> - ${task.description}</small>` : ''}
        `;
        listElement.appendChild(li);
    });
}

// Fallback functions for localStorage (keep existing functionality)
function loadTasksFromLocalStorage() {
    const workTasks = JSON.parse(localStorage.getItem('workTasks')) || [];
    const personalTasks = JSON.parse(localStorage.getItem('personalTasks')) || [];
    
    displayTasksFromLocalStorage('work-list', workTasks);
    displayTasksFromLocalStorage('personal-list', personalTasks);
}

function saveTaskToLocalStorage(text, type) {
    const storageKey = type === 'work' ? 'workTasks' : 'personalTasks';
    const tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    tasks.push({
        id: Date.now(),
        text: text,
        completed: false,
        type: type
    });
    
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    loadTasksFromLocalStorage();
}

function toggleTaskInLocalStorage(taskId, completed) {
    ['workTasks', 'personalTasks'].forEach(storageKey => {
        const tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = completed;
            localStorage.setItem(storageKey, JSON.stringify(tasks));
        }
    });
    loadTasksFromLocalStorage();
}

// Update the form submission handlers
function addWorkTask() {
    const input = document.getElementById('work-task-input');
    if (input && input.value.trim()) {
        saveTask(input.value.trim(), 'work');
        input.value = '';
    }
}

function addPersonalTask() {
    const input = document.getElementById('personal-task-input');
    if (input && input.value.trim()) {
        saveTask(input.value.trim(), 'personal');
        input.value = '';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
});

console.log('📱 Dashboard frontend updated to use database API!');