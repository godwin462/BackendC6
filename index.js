const http = require("http");
const fs = require("fs");
const studentDb = require("./db/database.json");
// const {on} = require("events");
const uuid = require("uuid").v4;
// const uuid = require("crypto").randomUUID;

// console.log(crypto());
// console.log(uuid());


const PORT = 8080;

const server = http.createServer((req, res) => {
    const {url, method} = req;
    if(url === "/create-student" && method === "POST") {
        let body = "";
        console.log("I am the first body: ", body);

        req.on("data", (chunks) => {
            body += chunks;
            // console.log(body, chunks);

        });

        req.on("end", () => {
            const data = JSON.parse(body);
            // const student = {}
            data.id = uuid();
            const student = data;
            studentDb.push(student);

            fs.writeFile("./db/database.json", JSON.stringify(studentDb, null, 2), "utf-8", (err, data) => {
                console.log(data);
                if(err) {
                    res.writeHead(400, {"content-type": "application/json"});
                    res.end("Error creating student");
                    console.log(err);
                } else {
                    res.writeHead(200, {"content-type": "application/json"});
                    res.end(JSON.stringify({message: "Stuent created successfully", data: student}));
                    console.log("Student creted");
                }
            });
        });

    } else if(url.startsWith("/students") && method === "GET") {
        if(studentDb.length < 1) {
            res.writeHead(404, {"content-type": "text/plain"});
            res.end("no student found");
        } else {
            res.writeHead(200, {"content-type": "application/json"});
            res.end(JSON.stringify({
                message: "All students below",
                total: studentDb.length,
                data: studentDb
            }));
        }
    }
    else if(url.startsWith("/student") && method === "GET") {
        const id = url.split("/")[2];

        if(studentDb.length < 1) {
            res.writeHead(404, {"content-type": "text/plain"});
            res.end("no student found");
        } else {
            res.writeHead(200, {"content-type": "application/json"});
            // const student = studentDb.filter((student) => (student.id == id));
            const student = studentDb.find((e) => (e.id === id));
            res.end(JSON.stringify({
                message: "Student below",
                data: student
            }));
        }
    }
    else if(url.startsWith("/update-student") && method === "PATCH") {
        let body = "";
        req.on('data', (chunks) => {
            body += chunks;
        });

        req.on("end", () => {
            const update = JSON.parse(body);
            const id = url.split('/')[2];
            const student = studentDb.find((e) => e.id === id);
            Object.assign(student, update);
            // console.log(student, id);
            const index = studentDb.findIndex((e) => e.id === id);
            if(index !== -1) {
                studentDb[index] = student;
            }
            fs.writeFile("./db/database.json", JSON.stringify(studentDb, null, 2), "utf-8", (err) => {
                if(err) {
                    console.log(err);
                    res.writeHead(500, {"content-header": "text/plain"});
                    res.end("Error updating student");
                } else {
                    res.writeHead(200, {"content-header": "application/json"});
                    console.log(JSON.stringify(studentDb));
                    res.end(JSON.stringify(student));
                }
            });

            // res.end(JSON.stringify({data: student, index}));
        });
    }
    else if (url.startsWith("/delete-student/") && method === "DELETE") {
        const id = url.split("/")[2];
        const index = studentDb.findIndex((student) => student.id === id);

        if (index === -1) {
            res.writeHead(404, { "content-type": "application/json" });
            res.end(JSON.stringify({ message: "Student not found" }));
        } else {
            const deletedStudent = studentDb.splice(index, 1)[0];
            fs.writeFile("./db/database.json", JSON.stringify(studentDb, null, 2), "utf-8", (err) => {
                if (err) {
                    res.writeHead(500, { "content-type": "application/json" });
                    res.end(JSON.stringify({ message: "Error deleting student" }));
                } else {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ message: "Student deleted successfully", data: deletedStudent }));
                }
            });
        }
    }
});
// console.log(new URL(`http://${process.env.HOST ?? 'localhost'}${http.request.url}`));

server.listen(PORT, () => {
    console.log(`Your server is running `, PORT);
});
