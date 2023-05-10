const readline = require('readline');




const consoleCapture = (message) => {
    
    return new Promise((resolve, reject) => {
        let captureInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        captureInterface.question(message, function (answer) {
            captureInterface.close();
            resolve(answer);
        });
    });
}

module.exports ={consoleCapture};

