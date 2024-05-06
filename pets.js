// Required modules
const express = require('express');
const session = require('express-session');
const path = require('path');

const fs = require('fs');

// Arrays to store user and pet information, and reading of those text files
var userlist= [];
fs.readFile('loginNames.txt', 'utf8', (err, text) => {
    if(err)
        return "Error reading file.";
    else
        userlist = text.split('\n');
});

var petlist= [];
fs.readFile('petInfo.txt', 'utf8', (err, list) => {
    if(err)
        return "Error reading file.";
    else
        petlist = list.split('\n');
});

// Function to validate username
function validateUsername(name) {
     // Check for non-alphabet or non-numerical characters
    for(let i in name)
    {
        let c = name[i].charCodeAt(0);
        if(!( ((c>=48) && (c<=57)) || ((c>=65) && (c<=90)) || ((c>=97) && (c<=122)) )) 
            return "Username cannot have non-alphabet or non-numerical characters";
    }
    return "Valid username";
}

// Function to validate password
function validatePassword(pass){
    // Check for at least one letter and one number, and minimum length
    let hasNumber = /\d/.test(pass);
    let hasLetter = /[a-zA-Z]/.test(pass);

    if(!(hasNumber && hasLetter))
        return "Password must contain at least 1 letter and at least 1 number";
    else if(pass.length<4)
        return "Password too short, must be at least 4 characters in length\n";
    else
    {   // Check for non-alphabet or non-numerical characters
        for(let i in pass)
        {
            let c = pass[i].charCodeAt(0);
            if(!( ((c>=48) && (c<=57)) || ((c>=65) && (c<=90)) || ((c>=97) && (c<=122)) )) 
                return "Password cannot have non-alphabet or non-numerical characters";
        }
        return "Valid password";
    }
}

// Function to check if username-password pair is valid
function isValidUser(name, pass)
{
    if(name=="Valid username" && pass=="Valid password")
        return true;
    else
        return false;
}

// Function to check if username already exists
function nameFound(name){
    //console.log(name);
    
    for(let i = 0; i < userlist.length; i++)
    {
        username= userlist[i].split(':');
        if(name==username[0])
            return true;
    }
    return false;
}

// Function to check if username-password pair exists
function namePairFound(namePair){
    for(let i = 0; i < userlist.length; i++)
    {
        if(namePair==userlist[i])
            return true;
    }
    return false;
}

// Function to see if pet description fits anything in petInfo.txt
function petFound(petInfoStr){
    
    var result = "<table>";
    var found = false;
    var petInfo = petInfoStr.split(':');
    for(let i = 0; i < petlist.length; i++)
    {
        pet = petlist[i].split(':');
        //petInfo format: request.session.username+":"+petType+":"+breed+":"+age+":"+gender+":"+compatibility
        //pet format: 2:mother:dog:huskey:senior:male:Gets along with other dogs::name:email
        if(petInfo[1]==pet[2] && petInfo[2]==pet[3] && petInfo[3]==pet[4] && petInfo[4]==pet[5])
        {
            found = true;
             result += "<tr><td>" + pet[2] + "</td><td>" + pet[3] + "</td><td>" + pet[4] + "</td><td>" + pet[5] + "</td><td>" +pet[6] + "</td><td>" +pet[7] + "</td><td>" + "</td></tr>" 
        }
    }

    if (!found)
        result +="<tr><td>No records found</td></tr>";

    result += "</table>";
    return result;
}
    
// Function to update login file with new user information
function updateLoginFile(info){
    //console.log(userlist);
    userlist.push(info);
    users= userlist.join("\n");
    //console.log(users);
    fs.writeFile('loginNames.txt', users,'utf8', (err) => {
        if(err) {
            return "Error writing file";
        }
        else{
            return "File written successfully.";
        }
    });
}

// Function to update pet file with new pet information
function updatePetFile(info){
    index= petlist.length;
    petlist.push(index+":"+info);
    pets= petlist.join("\n");
    //console.log(users);
    fs.writeFile('petInfo.txt', pets,'utf8', (err) => {
        if(err) {
            return "Error writing file";
        }
        else{
            return "File written successfully.";
        }
    });
}

// Create Express app
const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(session({
    secret: 'pet-key',
}));

// Route for creating account page
app.get('/createAccount', (request, response) => {
    response.sendFile(path.join(__dirname, '/createAcc.html'));
});

// Route for submitting account creation form
app.post('/createAccountSubmit', (request, response) => {
    const formName = request.body;
    const name = formName.name;
    const formPass = request.body;
    const pass = formPass.pass;
    const newUser = name+":"+pass;
    
    if(nameFound(name)==true)
        response.send("Account name already in use.");
    else
    {   
        response.send(validateUsername(name)+", "+validatePassword(pass));
        request.session.username = name;
        if(isValidUser(validateUsername(name), validatePassword(pass)))
            updateLoginFile(newUser);
    }
});

// Route for submitting login form
app.post('/loginSubmit', (request, response) => {
    const formName = request.body;
    const name = formName.name;
    const formPass = request.body;
    const pass = formPass.pass;
    const user = name+":"+pass;

    if(namePairFound(user)==true)
    {
        //response.send(validateUsername(name)+", "+validatePassword(pass));
        request.session.username = name;
        response.send("Successfully logged in.");// <a href='" + request.query.redirurl +"'> Continue.</a>");
    }
    else
        response.send("Username or password is incorrect.");
});

// Route for login page
app.get('/login', (request, response) => {
    response.sendFile(path.join(__dirname, '/login.html'));
});

// Route for logging out
app.get('/logout', (request, response) => {
    request.session.username = undefined;
    response.send("User logged out.");
});

// Route for giving away pets
app.get('/giveAway', (request, response) => {

    //console.log(request.session.username);

    if(!request.session.username)
        response.redirect("/login?redirurl=/giveAway");
    response.sendFile(path.join(__dirname, '/giveAway.html'));
});

// Route for submitting pet giveaway form
app.post('/giveAwaySubmit', (request, response) => {
    const formPet = request.body;
    const petType = formPet.petType;
    const breed = formPet.breed;
    const age = formPet.age;
    const gender = formPet.gender
    const compatibility = formPet.compatibility;
    const comments = formPet.comments;
    const ownerName = formPet.ownerName;
    const ownerEmail = formPet.ownerEmail;
    
    fullInfo = request.session.username+":"+petType+":"+breed+":"+age+":"+gender+":"+compatibility+":"+comments+":"+ownerName+":"+ownerEmail;

    updatePetFile(fullInfo);
    response.send("Successfully written.");
});

// Route for finding pets
app.post('/findPetSubmit', (request, response) => {
    const formPet = request.body;
    const petType = formPet.petType;
    const breed = formPet.breed;
    const age = formPet.age;
    const gender = formPet.gender
    const compatibility = formPet.compatibility;

    fullInfo = request.session.username+":"+petType+":"+breed+":"+age+":"+gender+":"+compatibility;/* +":"+comments+":"+ownerName+":"+ownerEmail */

    response.send(petFound(fullInfo));
});

// Routes for the different pages of the site
app.get('/home', (request, response) => {
    response.sendFile(path.join(__dirname, '/home.html'));
});

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/home.html'));
});

app.get('/findPet', (request, response) => {
    response.sendFile(path.join(__dirname, '/findPet.html'));
});

app.get('/dogCare', (request, response) => {
    response.sendFile(path.join(__dirname, '/dogCare.html'));
});

app.get('/catCare', (request, response) => {
    response.sendFile(path.join(__dirname, '/catCare.html'));
});

app.get('/contactUs', (request, response) => {
    response.sendFile(path.join(__dirname, '/contactUs.html'));
});

app.get('/pets', (request, response) => {
    response.sendFile(path.join(__dirname, '/pets.html'));
});

// Serve static files
app.use(express.static('public'));

// Start server
const PORT = 5207;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});