const input = document.getElementById("driveLink");
const viewerContainer = document.getElementById("viewerContainer");
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const selectedTitle = document.getElementById("selectedTitle");
const clearAllBtn = document.getElementById("clearAllBtn");
const clearCurrentBtn = document.querySelector(".clear-current");

let currentItemKey = null;
let qrScanner = null;

window.onload = function () {
    viewerContainer.innerHTML = "";
    document.getElementById("subTitle").textContent = "";
    updateClearAllButton();
};

function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
}

function updateClearAllButton() {
    let hasLinks = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("drive_item_")) { hasLinks = true; break; }
    }
    clearAllBtn.classList.toggle("disabled", !hasLinks);
}

function openModal(itemName) {
    currentItemKey = "drive_item_" + itemName;
    modalTitle.textContent = "
