const studentDb = require('./db/database.json'); // Imports the student database from a JSON file.
const http = require('http'); // Imports the built-in Node.js 'http' module for creating HTTP servers.
const fs = require('fs'); // Imports the built-in Node.js 'fs' (file system) module for file operations.
const PORT = 8086; // Defines the port number on which the server will listen.

const server = http.createServer((req, res) => { // Creates an HTTP server instance
    const {url, method} = req; // Destructures the 'url' and 'method' properties from the incoming request object.

    if(url === '/create-student' && method === 'POST') { // Checks if the request URL is '/create-student' and the HTTP method is 'POST'.
        let body = ''; // Initializes an empty string to store the request body data.

        req.on('data', (chunks) => { // Listens for 'data' events, which occur when a chunk of data is received in the request body.
            console.log('I am chunks', chunks); // Logs the received data chunks
            body += chunks; // Appends each received chunk to the 'body' string.
            console.log('I am the raw body', body); // Logs the accumulated raw body
        });

        req.on('end', () => { // Listens for the 'end' event, which signifies that the entire request body has been received.
            const data = JSON.parse(body); // Converts the request body string to javascrpit object for easy manipulation.

            const student = { // Creates a new student object.
                id: studentDb.length + 1, // Assigns a unique ID to the student,
                name: data.name, // Assigns the student's name.
                gender: data.gender, // Assigns the student's gender.
                age: data.age, // Assigns the student's age.
            };

            studentDb.push(student); // Adds the new student object to the database array.

            fs.writeFile('./db/database.json', JSON.stringify(studentDb, null, 2), 'utf-8', (error) => { // Writes the updated student database back to the JSON file.
                if(error) { // Checks if an error occurred during the file write operation.
                    res.writeHead(400, {"content-type": "text/plain"}); // Sets the HTTP status code to 400 (Bad Request) and content type to plain text.
                    res.end('Bad request'); // Sends 'Bad request' as the response body and ends the response.
                } else { // If no error occurred during file write.
                    res.writeHead(201, {"content-type": "application/json"}); // Sets the HTTP status code to 201 (Created) and content type to JSON.
                    res.end(JSON.stringify({ // Sends a JSON response indicating success.
                        message: "Student Created Successfully", // Success message.
                        data: student // The newly created student.
                    }));
                }
            });
        });
    }
});

server.listen(PORT, () => { // Starts the HTTP server and makes it listen for incoming requests on the specified port.
    console.log(`Server is running on Port: ${PORT}`); // Logs a message to the console  when the server starts.
});
