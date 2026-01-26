const menu = document.getElementById("dropdownMenu");
const modal = document.getElementById("linkModal");
const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewerContainer");
const title = document.getElementById("selectedTitle");

let currentKey = "";
let qrScanner = null;

function toggleMenu() {
    menu.classList.toggle("show");
}

function openModal(name) {
    currentKey = "drive_" + name;
    document.getElementById("modalTitle").textContent = name;
    input.value = localStorage.getItem(currentKey) || "";
    modal.style.display = "flex";
    menu.classList.remove("show");
}

function closeModal() {
    modal.style.display = "none";
    stopQR();
}

function saveLink() {
    if (!input.value) return;
    localStorage.setItem(currentKey, input.value);
    loadFile(input.value);
    closeModal();
}

function clearAllLinks() {
    Object.keys(localStorage).forEach(k => {
        if (k.startsWith("drive_")) localStorage.removeItem(k);
    });
    viewer.innerHTML = "";
    title.textContent = "تم مسح جميع الروابط";
}

function startQR() {
    const qr = document.getElementById("qr-reader");
    qr.innerHTML = "";
    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 220 }, txt => {
        input.value = txt;
        saveLink();
    });
}

function stopQR() {
    if (qrScanner) {
        qrScanner.stop().catch(() => {});
        qrScanner = null;
    }
}

function loadFile(link) {
    viewer.innerHTML = `<iframe src="https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(link)}"></iframe>`;
}

document.addEventListener("click", e => {
    if (!menu.contains(e.target) && !e.target.classList.contains("menu-btn")) {
        menu.classList.remove("show");
    }
});
