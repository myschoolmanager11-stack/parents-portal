const modal = document.getElementById("linkModal");
const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewerContainer");
const viewerToolbar = document.getElementById("viewerToolbar");
const clearAllBtn = document.getElementById("clearAllBtn");

let currentKey = "";

/* ===== القائمة ===== */
function toggleMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
    updateClearButton();
}

function handleOutsideClick(e) {
    const menu = document.getElementById("dropdownMenu");
    if (!menu.contains(e.target)) {
        menu.style.display = "none";
    }
}

/* ===== تفعيل زر مسح الكل ===== */
function updateClearButton() {
    const hasLinks = Object.keys(localStorage).some(k => k.startsWith("drive_"));
    clearAllBtn.classList.toggle("disabled", !hasLinks);
}

/* ===== اختيار عنصر ===== */
function handleItemClick(name) {
    document.getElementById("dropdownMenu").style.display = "none";
    currentKey = "drive_" + name;

    const link = localStorage.getItem(currentKey);
    if (link) {
        loadFile(link);
    } else {
        openModal(name);
    }
}

/* ===== Modal ===== */
function openModal(title) {
    document.getElementById("modalTitle").textContent = title;
    input.value = "";
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}

/* ===== حفظ ===== */
function saveLink() {
    if (!input.value.trim()) return;
    localStorage.setItem(currentKey, input.value.trim());
    closeModal();
    loadFile(input.value.trim());
    updateClearButton();
}

/* ===== عرض ===== */
function loadFile(link) {
    viewer.innerHTML = `<iframe src="${link}"></iframe>`;
    viewerToolbar.style.display = "flex";
}

/* ===== مسح الكل ===== */
function clearAllLinks() {
    if (!confirm("⚠️ سيتم حذف جميع الروابط نهائيًا، هل أنت متأكد؟")) return;
    Object.keys(localStorage)
        .filter(k => k.startsWith("drive_"))
        .forEach(k => localStorage.removeItem(k));
    location.reload();
}

updateClearButton();
