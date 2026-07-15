let capsules = JSON.parse(
    localStorage.getItem("capsules")
) || [];

function saveCapsules() {
    localStorage.setItem(
        "capsules",
        JSON.stringify(capsules)
    );
}