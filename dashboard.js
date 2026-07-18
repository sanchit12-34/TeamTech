// =====================================
// ADVANCED TIME CAPSULE
// dashboard.js - Unified Production Script
// =====================================

// =====================================
// GLOBAL APP STATE & SELECTORS
// =====================================
let uploadedFiles = [];
let searchText = "";
let currentFilter = "all";
let countdownInterval;

// Load data safely
let capsules = JSON.parse(localStorage.getItem("capsules")) || [];

const capsuleForm = document.getElementById("capsuleForm");
const capsuleContainer = document.getElementById("capsuleContainer");
const totalCapsules = document.getElementById("totalCapsules");
const lockedCapsules = document.getElementById("lockedCapsules");
const openedCapsules = document.getElementById("openedCapsules");
const totalFiles = document.getElementById("totalFiles");
const searchInput = document.querySelector(".search-box input");
const filterSelect = document.querySelector(".capsule-header select");
const uploadInputs = document.querySelectorAll(".upload-box input");

// =====================================
// INITIAL LOAD & RUNTIME LIFECYCLE
// =====================================
document.addEventListener("DOMContentLoaded", () => {
    displayCapsules();
    updateStats();
});

// =====================================
// CREATE & PERSISTENCE SYSTEMS
// =====================================
if (capsuleForm) {
    capsuleForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let title = document.getElementById("title").value.trim();
        let message = document.getElementById("message").value.trim();
        let unlockDate = document.getElementById("unlockDate").value;

        // Base model state
        let capsule = {
            id: Date.now(),
            title: title,
            message: message,
            unlockDate: unlockDate, // Keeps YYYY-MM-DD
            files: getFiles(),
            status: "locked",
            createdAt: new Date().toISOString()
        };

        // Recalculate status immediately upon creation
        const targetTime = new Date(capsule.unlockDate + "T00:00:00").getTime();
        if (targetTime - Date.now() <= 0) {
            capsule.status = "unlocked";
        }

        capsules.push(capsule);
        saveCapsules();
        capsuleForm.reset();
        
        displayCapsules();
        updateStats();
        showToast("✓ Capsule Created Successfully");
    });
}

function saveCapsules() {
    localStorage.setItem("capsules", JSON.stringify(capsules));
}

function getFiles() {
    let files = [];
    uploadInputs.forEach(function(input) {
        if (input.files) {
            Array.from(input.files).forEach(function(file) {
                uploadedFiles.push(file); // Saved in runtime memory for live previews
                files.push({
                    name: file.name,
                    type: file.type
                });
            });
        }
    });
    return files;
}

// =====================================
// DISPLAY ENGINE & TEMPLATING
// =====================================
function displayCapsules() {
    capsuleContainer.innerHTML = "";
    let filteredCapsules = getFilteredCapsules();

    if (filteredCapsules.length === 0) {
        capsuleContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #a0a0b8;">
                <i class="fa-solid fa-hourglass-half" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                <p>No capsules found</p>
            </div>
        `;
        return;
    }

    filteredCapsules.forEach(function(capsule) {
        let card = document.createElement("div");
        card.className = "capsule-card";
        // Tag identity directly to element to decouple safely from layout arrays
        card.dataset.id = capsule.id; 

        card.innerHTML = `
            <div class="card-top">
                <h3>${escapeHTML(capsule.title)}</h3>
                <div class="lock-icon">${capsule.status === "locked" ? "🔒" : "🔓"}</div>
            </div>
            <p class="capsule-message">
                ${capsule.status === "locked" ? "<em>This content is dynamically sealed until the unlock condition is met.</em>" : escapeHTML(capsule.message)}
            </p>
            <div class="capsule-date">📅 Unlocks: ${capsule.unlockDate}</div>
            <div class="countdown" data-id="${capsule.id}">Loading...</div>
            <div class="file-info">${displayFiles(capsule.files)}</div>
            <div class="card-buttons">
                <button class="open-btn">Open</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        capsuleContainer.appendChild(card);
    });

    addCardEvents();
    startCountdown();
}

function displayFiles(files) {
    if (!files || files.length === 0) {
        return `<span>📂 No Files</span>`;
    }
    let html = "";
    files.forEach(function(file) {
        let icon = "📄";
        if (file.type.startsWith("image")) icon = "🖼️";
        else if (file.type.startsWith("video")) icon = "🎥";
        else if (file.type.startsWith("audio")) icon = "🎵";

        // Prevent layout collision inside nested templates safely
        const escapedName = escapeHTML(file.name);
        html += `
            <span class="file-item" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; margin-right:8px;" data-filename="${escapedName}">
                ${icon} ${escapedName}
            </span>
        `;
    });
    return html;
}

// =====================================
// COUNTDOWN LOOP & CALCULATIONS
// =====================================
function startCountdown() {
    clearInterval(countdownInterval);

    function updateCountdown() {
        let countdownElements = document.querySelectorAll(".countdown");
        if (countdownElements.length === 0) return;

        countdownElements.forEach(function(element) {
            let id = Number(element.dataset.id);
            let capsule = capsules.find(c => c.id === id);
            if (!capsule) return;

            let now = Date.now();
            // Adjusted to trigger exactly at midnight start of date (local time)
            let unlockTime = new Date(capsule.unlockDate + "T00:00:00").getTime();
            let difference = unlockTime - now;

            if (difference <= 0) {
                if (capsule.status === "locked") {
                    capsule.status = "unlocked";
                    saveCapsules();
                    updateStats();
                    
                    // Live UI flip
                    let card = element.closest(".capsule-card");
                    if (card) {
                        let icon = card.querySelector(".lock-icon");
                        if (icon) icon.innerHTML = "🔓";
                        let messageBody = card.querySelector(".capsule-message");
                        if (messageBody) messageBody.innerHTML = escapeHTML(capsule.message);
                    }
                }
                element.innerHTML = "🔓 Capsule Unlocked";
                return;
            }

            let days = Math.floor(difference / (1000 * 60 * 60 * 24));
            let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((difference % (1000 * 60)) / 1000);

            element.innerHTML = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
        });
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// =====================================
// MUTATION & INTERACTION HANDLERS
// =====================================
function addCardEvents() {
    // Intercept clicks on the container instead of fragile position arrays
    const cards = capsuleContainer.querySelectorAll(".capsule-card");
    cards.forEach(card => {
        const id = Number(card.dataset.id);

        card.querySelector(".open-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openCapsule(id);
        });

        card.querySelector(".edit-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            editCapsule(id);
        });

        card.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteCapsule(id);
        });

        // Setup attachment event interceptors
        card.querySelectorAll(".file-item").forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                previewFile(item.dataset.filename);
            });
        });
    });
}

function openCapsule(id) {
    let capsule = capsules.find(c => c.id === id);
    if (!capsule) return;

    let modal = document.getElementById("capsuleModal");
    let modalBody = document.getElementById("modalBody");
    if (!modal || !modalBody) return;

    // Direct structural assignment instead of additive bugs
    if (capsule.status === "locked") {
        modalBody.innerHTML = `
            <h2>🔒 Capsule Locked</h2>
            <p>This memory is protected until its clock expires.</p>
            <p><strong>Unlock Date:</strong> ${capsule.unlockDate}</p>
        `;
    } else {
        modalBody.innerHTML = `
            <h2>🔓 ${escapeHTML(capsule.title)}</h2>
            <hr style="border:0; border-top: 1px solid #2d2d44; margin: 15px 0;">
            <h3>Message</h3>
            <p style="white-space: pre-wrap; background:#252538; padding:12px; border-radius:6px;">${escapeHTML(capsule.message)}</p>
            <h3>Files</h3>
            <div class="modal-files-list">${displayFiles(capsule.files)}</div>
            <div id="previewZone" style="margin-top:15px;"></div>
        `;

        // Wire event handlers explicitly for modal context files
        modalBody.querySelectorAll(".file-item").forEach(item => {
            item.addEventListener("click", () => previewFile(item.dataset.filename));
        });
    }
    modal.classList.add("show");
}

function editCapsule(id) {
    let capsule = capsules.find(c => c.id === id);
    if (!capsule) return;

    let newTitle = prompt("New title:", capsule.title);
    let newMessage = prompt("New message:", capsule.message);

    if (newTitle !== null && newMessage !== null) {
        capsule.title = newTitle.trim() || capsule.title;
        capsule.message = newMessage.trim() || capsule.message;

        saveCapsules();
        displayCapsules();
        updateStats();
        showToast("✓ Capsule Updated");
    }
}

function deleteCapsule(id) {
    if (confirm("Are you sure you want to delete this capsule permanently?")) {
        capsules = capsules.filter(c => c.id !== id);
        saveCapsules();
        displayCapsules();
        updateStats();
        showToast("✓ Capsule Deleted");
    }
}

function previewFile(fileName) {
    let file = uploadedFiles.find(f => f.name === fileName);
    let previewZone = document.getElementById("previewZone");

    if (!file) {
        alert("File binary inaccessible. Note: Mock files lose state memory across fresh screen reloads unless stored in an external cloud platform like Firebase.");
        return;
    }

    let url = URL.createObjectURL(file);
    if (!previewZone) {
        // Fallback fallback mechanism directly into browser tab if target zone container container fails
        window.open(url);
        return;
    }

    // Clean viewport targets
    if (file.type.startsWith("image/")) {
        previewZone.innerHTML = `<h3>Preview</h3><img src="${url}" style="max-width:100%; border-radius:6px; margin-top:10px;">`;
    } else if (file.type.startsWith("video/")) {
        previewZone.innerHTML = `<h3>Preview</h3><video controls style="width:100%; margin-top:10px;"><source src="${url}"></video>`;
    } else {
        window.open(url);
    }
}

// =====================================
// FILTERING, STATS, & UTILITIES
// =====================================
function getFilteredCapsules() {
    return capsules.filter(function(capsule) {
        let searchMatch = capsule.title.toLowerCase().includes(searchText.toLowerCase()) ||
                          capsule.message.toLowerCase().includes(searchText.toLowerCase());
        let filterMatch = true;
        if (currentFilter === "locked") filterMatch = capsule.status === "locked";
        if (currentFilter === "unlocked") filterMatch = capsule.status === "unlocked";

        return searchMatch && filterMatch;
    });
}

function updateStats() {
    let now = Date.now();
    let locked = 0;
    let opened = 0;
    let fileCount = 0;

    capsules.forEach(c => {
        fileCount += (c.files ? c.files.length : 0);
        let unlockTime = new Date(c.unlockDate + "T00:00:00").getTime();
        if (unlockTime - now > 0) {
            c.status = "locked";
            locked++;
        } else {
            c.status = "unlocked";
            opened++;
        }
    });

    if (totalCapsules) totalCapsules.innerText = capsules.length;
    if (lockedCapsules) lockedCapsules.innerText = locked;
    if (openedCapsules) openedCapsules.innerText = opened;
    if (totalFiles) totalFiles.innerText = fileCount;
}

if (searchInput) {
    searchInput.addEventListener("input", function() {
        searchText = this.value;
        displayCapsules();
    });
}

if (filterSelect) {
    filterSelect.addEventListener("change", function() {
        currentFilter = this.value.toLowerCase();
        displayCapsules();
    });
}

const closeModal = document.getElementById("closeModal");
if (closeModal) {
    closeModal.addEventListener("click", function() {
        document.getElementById("capsuleModal").classList.remove("show");
    });
}

// Global modal background closer escape hatch
window.addEventListener("click", (e) => {
    const modal = document.getElementById("capsuleModal");
    if (e.target === modal) modal.classList.remove("show");
});

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}
// =====================================
// FIXED LOGOUT ROUTER
// =====================================
document.addEventListener("DOMContentLoaded", function() {
    // Look for the logout link or button directly
    const btn = document.getElementById("logoutBtn") || document.querySelector(".logout-btn");
    
    if (btn) {
        btn.addEventListener("click", function(event) {
            event.preventDefault(); // Stops the page from simply reloading
            
            if (typeof showToast === "function") {
                showToast("Sealing dashboard... Logging out! 👋", "info");
            } else {
                alert("Logging out...");
            }
            
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 800);
        });
    }
});
// =====================================
// PROFILE DROPDOWN
//=

document.addEventListener("DOMContentLoaded", function () {

    const profileToggle = document.querySelector(".profile-toggle");
    const profileMenu = document.querySelector(".profile-menu");


    if (profileToggle && profileMenu) {

        profileToggle.addEventListener("click", function (event) {

            event.stopPropagation();

            profileMenu.classList.toggle("active");

        });


        document.addEventListener("click", function () {

            profileMenu.classList.remove("active");

        });

    }

});

// =====================================
// THEME TOGGLE
// =====================================

const themeBtn = document.querySelector(".theme-btn");

if (themeBtn) {

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            localStorage.setItem("theme", "dark");
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }

    });

}




// ================= PROFILE SYSTEM =================


const profileButton =
document.querySelector(".profile");


const profileModal =
document.getElementById("profileModal");


const closeProfile =
document.getElementById("closeProfile");



// OPEN PROFILE

profileButton.addEventListener("click", function(){

    profileModal.classList.add("show");

    loadProfile();

});



// CLOSE USING X BUTTON

closeProfile.addEventListener("click", function(){

    profileModal.classList.remove("show");

});



// CLOSE WHEN CLICK OUTSIDE

profileModal.addEventListener("click", function(e){


    if(e.target === profileModal){

        profileModal.classList.remove("show");

    }


});



// LOAD USER DATA

function loadProfile(){


    let user =
    JSON.parse(localStorage.getItem("currentUser"));



    if(user){


        document.getElementById("profileName").innerText =
        user.name;


        document.getElementById("profileEmail").innerText =
        user.email;


    }



    let capsules =
    JSON.parse(localStorage.getItem("capsules")) || [];



    let locked = 0;

    let opened = 0;



    capsules.forEach(function(capsule){


        let date =
        new Date(capsule.unlockDate);



        if(date <= new Date()){

            opened++;

        }
        else{

            locked++;

        }


    });



    document.getElementById("profileTotal").innerText =
    capsules.length;


    document.getElementById("profileLocked").innerText =
    locked;


    document.getElementById("profileOpened").innerText =
    opened;


}



// LOGOUT

document
.getElementById("profileLogout")
.addEventListener("click",function(){


    localStorage.removeItem("currentUser");


    window.location.href="login.html";


});
