function getCurrentDate()
{
    const d = new Date();
    let year = d.getFullYear();
    let dayNum = d.getDate();
    let monthNum = d.getMonth();
    let weekdayNum = d.getDay();
    let weekdayStr = "";
    let monthStr = "";

    switch (weekdayNum){
        case 0: weekdayStr = "Sunday";break;
        case 1: weekdayStr = "Monday";break;
        case 2: weekdayStr = "Tuesday";break;
        case 3: weekdayStr = "Wednesday";break;
        case 4: weekdayStr = "Thursday";break;
        case 5: weekdayStr = "Friday";break;
        case 6: weekdayStr = "Saturday";break;
    }

    switch (monthNum){
        case 0: monthStr = "January";break;
        case 1: monthStr = "February";break;
        case 2: monthStr = "March";break;
        case 3: monthStr = "April";break;
        case 4: monthStr = "May";break;
        case 5: monthStr = "June";break;
        case 6: monthStr = "July";break;
        case 7: monthStr = "August";break;
        case 8: monthStr = "September";break;
        case 9: monthStr = "October";break;
        case 10: monthStr = "November";break;
        case 11: monthStr = "December";break;
    }

    const realDate = "<b>"+weekdayStr+", "+monthStr+" "+dayNum+", "+year+"<br></b>";
    return realDate;
}