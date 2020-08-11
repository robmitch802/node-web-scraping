// https://www.youtube.com/watch?v=eUYMiztBEdY
// FreeCodeCamp video on node web scraper.

const rp = require ('request-promise');
const cheerio = require('cheerio');
const Table = require('cli-table');

let users = [];
let table = new Table ({
    head: ['username', 'hearts', 'challenges'],
    colWidth: [15, 5, 10]
})

const options = {
    url: 'https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received',
    json: true
}

rp(options)
    .then((data) => {
        let userData = [];
        for (let user of data.directory_items) {
            userData.push({ name: user.user.username, likes_received: user.likes_received});
        }
        process.stdout.write('loading');
        getChallengesCompletedAndPushToUserArray(userData);
    })
    .catch((err) => {
        console.log(err);
    })

function getChallengesCompletedAndPushToUserArray(userData) {
    let i = 0;
    console.log('get challenge function started')
    function next() {
        if ( i < userData.length) {
            let options = {
                url: `https://www.freecodecamp.org/u/` + userData[i].name,
                transform: body => cheerio.load(body)
            }
            rp(options)
                .then(function ($) {
                    process.stdout.write('.');
                    const fccAccount = $('div.notfound-page-wrapper').length == 0;
                    const challengesPassed = fccAccount ? $('tbody tr').length : 'unknown'
                    table.push([userData[i].name, userData[i].likes_received, challengesPassed]);
                    ++i;
                    return next();
                })
        } else 
            printData();
    }
    return next();
};
function printData() {
    console.log('checkbox')
    console.log(table.toString());
}