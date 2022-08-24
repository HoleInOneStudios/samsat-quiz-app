/* ================================================================ */
/* Variables */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const PORT = 3000;

const app = express();
const server = http.createServer(app);

let wb = XLSX.readFile(path.join(__dirname, './data/data.xlsx'));

/* ================================================================ */
/* Functions */

function getSheet(sheetName) {
    return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: ["Question", "1", "2", "3", "4", "Correct", "Hint"] });
}

/* ================================================================ */
/* Setup */

fs.watch(path.join(__dirname, "./data/data.xlsx"), (eventType) => {
    if (eventType === "change") {
        wb = XLSX.readFile(path.join(__dirname, './data/data.xlsx'));
    }
});


app.use(express.static(path.join(__dirname, 'public')));

app.set('port', PORT);
app.set('view engine', 'ejs');
app.set('views', './views');

/* ================================================================ */
/* Routes */

app.get(`/quiz/:sheet`, (req, res) => {
    res.render('main', {
        title: 'Quiz',
        message: JSON.stringify(getSheet(req.params.sheet))
    })
})

app.get('/quiz', (req, res) => {
    res.render('list', {sheets: wb.SheetNames})
})

/* ================================================================ */
/* Server */

app.listen(PORT, 'localhost', () => {
    console.log(server.address())
    console.log(`Server is running on port ${PORT}`);
})