const modal = document.getElementById("linkModal");
const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewerContainer");
const toolbar = document.getElementById("viewerToolbar");
const clearAllBtn = document.getElementById("clearAllBtn");

let currentKey = "";

/* فحص وجود روابط */
function hasAnyLinks() {
    return Object.keys(localStorage).some(k => k.startsWith("drive_"));
}

function updateClearAllState() {
    clearAllBtn.classList.toggle("disabled", !hasAnyLinks());
}

updateClearAllState();

/* القائمة */
function toggleMenu() {
    const m = document.getElementById("dropdownMenu");
    m.style.display = m.style.display === "block" ? "none" : "block";
}

/* عنصر */
function handleItemClick(name) {
    toggleMenu();
    currentKey = "drive_" + name;
    const link = localStorage.getItem(currentKey);
    link ? loadFile(link) : openModal(name);
}

/* نافذة */
function openModal(title) {
    modal.style.display = "flex";
    input.value = "";
}

function closeModal() {
    modal.style.display = "none";
}

/* حفظ */
function saveLink() {
    if (!input.value.trim()) return;
    localStorage.setItem(currentKey, input.value.trim());
    closeModal();
    loadFile(input.value.trim());
    updateClearAllState();
}

/* عرض */
function toPreview(link) {
    const m = link.match(/\/d\/([^/]+)/);
    return m ? `https://drive.google.com/file/d/${m[1]}/preview` : link;
}

function loadFile(link) {
    viewer.innerHTML = `<iframe src="${toPreview(link)}"></iframe>`;
    toolbar.style.display = "flex";
}

/* أدوات */
function editCurrentLink() {
    openModal();
    input.value = localStorage.getItem(currentKey) || "";
}

function downloadCurrentFile() {
    const link = localStorage.getItem(currentKey);
    if (link) window.open(link, "_blank");
}

function deleteCurrentLink() {
    if (!confirm("هل تريد حذف هذا الرابط؟")) return;
    localStorage.removeItem(currentKey);
    viewer.innerHTML = "";
    toolbar.style.display = "none";
    updateClearAllState();
}

/* مسح الكل بحماية */
function clearAllLinks() {
    if (!confirm("⚠️ تأكيد حذف جميع الروابط؟")) return;
    const code = prompt("للتأكيد اكتب كلمة: حذف");
    if (code !== "حذف") return alert("تم إلغاء العملية");

    localStorage.clear();
    location.reload();
}
