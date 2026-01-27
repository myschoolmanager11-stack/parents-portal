let currentItemKey = "";
let currentItemName = "";

function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function openItem(name) {
    toggleMenu();

    currentItemName = name;
    currentItemKey = "drive_" + name;

    document.getElementById("selectedTitle").textContent = name;
    document.getElementById("editLinkBtn").style.display = "inline-block";
    document.getElementById("welcomeText").style.display = "none";

    const link = localStorage.getItem(currentItemKey);

    if (link) {
        loadFile(link);
    } else {
        openModal(name);
    }
}

function openModal(title) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("driveLink").value = "";
    document.getElementById("linkModal").style.display = "block";
}

function closeModal() {
    document.getElementById("linkModal").style.display = "none";
}

function saveLink() {
    const link = document.getElementById("driveLink").value.trim();
    if (!link) return;

    localStorage.setItem(currentItemKey, link);
    closeModal();
    loadFile(link);
}

function loadFile(link) {
    const viewer = document.getElementById("viewerContainer");
    viewer.innerHTML = `<iframe src="${link}"></iframe>`;

    document.getElementById("downloadBtn").href = link;
    document.getElementById("downloadContainer").style.display = "block";
}

function editCurrentLink() {
    openModal(currentItemName);
}

function clearAllLinks() {
    if (!confirm("هل تريد مسح جميع الروابط؟")) return;
    localStorage.clear();
    location.reload();
}

/* QR */
function startQR() {
    const qr = new Html5Qrcode("qr-reader");
    qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        txt => {
            document.getElementById("driveLink").value = txt;
            qr.stop();
        }
    );
}
