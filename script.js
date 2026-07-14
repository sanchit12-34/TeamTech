console.log("JavaScript is working!");

let capsules = [];


function createCapsule(title, message, unlockDate) {

    let capsule = {
        id: Date.now(),
        title: title,
        message: message,
        unlockDate: unlockDate
    };

    capsules.push(capsule);

    console.log("Capsule Created:");
    console.log(capsule);
}


createCapsule(
    "College Memory",
    "Started my Time Capsule project",
    "2027-01-01"
);


console.log("All Capsules:");
console.log(capsules);