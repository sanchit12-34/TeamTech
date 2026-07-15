function createCapsule(title, message, unlockDate) {

    let capsule = {
        id: Date.now(),
        title,
        message,
        unlockDate,
        createdDate: new Date()
    };

    capsules.push(capsule);

    saveCapsules();

    console.log("Capsule Created:");
    console.log(capsule);
}