
let capsules = JSON.parse(
    localStorage.getItem("capsules")
) || [];




function createCapsule(title, message, unlockDate) {


    let capsule = {

        id: Date.now(),

        title: title,

        message: message,

        unlockDate: unlockDate,

        createdDate: new Date()

    };


    capsules.push(capsule);


    saveCapsules();


    console.log("Capsule Created:");
    console.log(capsule);

}




function saveCapsules(){

    localStorage.setItem(
        "capsules",
        JSON.stringify(capsules)
    );

}





function showCapsules(){

    console.log("All Capsules:");

    console.log(capsules);

}





createCapsule(
    "College Memory",
    "Learning JavaScript for Time Capsule",
    "2027-01-01"
);


showCapsules();