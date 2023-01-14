const fs = require('fs');
const express = require("express");
const sendgrid = require("@sendgrid/mail");
var bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
var app = express();
var cors = require('cors');
const { json } = require('body-parser');
const { buildPathHtml } = require('./buildPaths');
app.use(cors())
app.use(bodyParser.json());
//API => Create html File , Create Pdf and send Pdf...!
app.post("/createpdf", (req, res) => {
  //get postman data 
  const { Categories, student, CourseDetails } = req.body
  //style html form 
  var html = `<style>
            body{
               padding:30px;
             }
             .rangeinput{
               border: 1px solid #333;
               height: 16px;
               width: 350px;
               background-color:darkgray;
               display: flex;
             }
            .score{
               margin-left:58%;
               margin-top: -20px;
               position: absolute;
             } 
             .average{
                margin-left:72%;
                margin-top:-20px;
                position: absolute;
              }
              .checking{
                margin-left:85%;
                margin-top:-20px;
                position: absolute;
              }
             .nameid{
                margin-top: 2rem;
                float: right;
              }
              .motive{
                font-size: 20px;
                font-weight: 600;
              }
              .Title{
                font-size: 28px;
                font-weight: 600;
                margin-top:-15px;
              }
              .divtag{
                text-align: center;
                width:100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin-top:-150px;
              }
              .details{
                margin-top:-30px;
              }
              .topdiv{
                margin-top:2rem;
              }
              .digiimg{
                margin-top: 15px;
              }
              .xfont{
                height: auto;
                width:23rem;
                background-color: e5e7e9;
                font-size: 50px;
                margin-top: -11px;
              }
              .paragraph{
                margin-top:5px;
              }
              .myscore{
                margin-left:48%;
                margin-top:15px;
              } 
              .myaverage{
                margin-left:4%;
                margin-top:15px;
              }
              .mygrade{
                margin-left:3.5%;
                margin-top:15px;
              }
              .hrtag{
                margin-top:20px;
              }
              .maincontent{
                height:20px;
              }
              .detail{
                margin-top:-20px;
              }
              .onex{
                font-size: 50px;
              }
              .xcontent1{
                font-size:15px;
              }
              .xcontent2{
                font-size:15px;
              }
              .justify-even{
                display: flex;
                justify-content: space-evenly;
              }
              .scoreimg{
                height: 20px;
                float: left;
                margin-top: 3px;
              }
              .content1{
                position: absolute;
                margin-left:25px;
                font-size:10px;
              }
              .averageimg{
                height: 20px;
               margin-left:60px;
               margin-top:4px;
              }
              .content2{
                margin-top: -15px;
                margin-left: 110px;
                font-size: 10px;
              }
              .rangeimg{
                height: 20px;
                margin-left: 210px;
                margin-top: -26px;
              }
              .content3{
                margin-top: -21px;
                margin-left: 240px;
                font-size: 10px;
              }
              .wellimg{
                height: 20px;
                margin-left: 320px;
                margin-top: -26px;
              }
              .content4{
                margin-top: -21px;
                margin-left: 350px;
                font-size: 10px;
              }
              .reviewimg{
                height: 20px;
                margin-left: 435px;
                margin-top: -29px;
              }
              .content5{
                margin-top: -23px;
                margin-left: 460px;
                font-size: 10px;
              }
              .improveimg{
                height: 20px;
                margin-left: 550px;
                margin-top: -29px;
              }
              .content6{
                margin-top: -23px;
                margin-left: 574px;
                font-size: 10px;
              }
              .start{
                margin-top:-5px;
              }
             </style>
             <div class="topdiv">
             <img src="http://127.0.0.1:5500/digilogo.png" class="digiimg"><p class="nameid"> ${student.studentName}  ${student.studenID} </p> 
             </div><br><br>
             <div class="divtag"><p class="motive">${CourseDetails.Motive}</p>
             <p class="Title">${CourseDetails.Title}</p>
             <p class="details">Course:${CourseDetails.Course} 
             Instructor: ${CourseDetails.Instructor}
             ${CourseDetails.Date}Questions:${CourseDetails.Questions}</p>
             <p class="detail">StdDev = &nbsp;${CourseDetails.StdDev} Mean = &nbsp; ${CourseDetails.Mean}
             Median = &nbsp; ${CourseDetails.Median}Rank = &nbsp; ${CourseDetails.Rank}</p>
             <div class="xfont"><div class="justify-even"><span class="onex">X</span><span class="twox">X</span></div>
             <div class="justify-even"><span class="xcontent1">My Score</span><span class="xcontent2">Average </span></div></div>
             <p class="paragraph">Overall, you scored above the class average. Please take note of the areas,<br>
             noted in green or red, where you may have opportunities for improvement.</p></div>
             <div class="maincontent"><img src="http://127.0.0.1:5500/star.png" class="scoreimg"><p class="content1">MY SCORE</p>
             <img src="http://127.0.0.1:5500/diamond1.png" class="averageimg"><p class="content2">AVERAGE/MEAN</p>
             <img src="http://127.0.0.1:5500/range.png" class="rangeimg"><p class="content3">SCORE RANGE</p>
             <img src="http://127.0.0.1:5500/yellowstar.png" class="wellimg"><p class="content4">DOING WELL</p>
             <img src="http://127.0.0.1:5500/greenbox.png" class="reviewimg"><p class="content5">NEEDS REVIEW</p>
             <img src="http://127.0.0.1:5500/improve.webp" class="improveimg"><p class="content6">IMPROVEMENT</p></div><br>
             <span>CATEGORY</span> <span class="myscore">MY SCORE</span><span class="myaverage">AVERAGE</span>
             <span class="mygrade">GRADE</span><hr>`
  //mapping std coursename and mark
  Categories.map((data) => {
    const { coursename, Mark } = data
    //check std grade and display 
    var grad = "";
    if (Mark >= 80 && Mark <= 100) { grad = `<img src="http://127.0.0.1:5500/yellowstar.png" height="14"></img>` }
    if (Mark < 80 && Mark >= 60) { grad = `<img src="http://127.0.0.1:5500/greenbox.png" height="14"></img>` }
    if (Mark > 1 && Mark < 60) { grad = `<img src="http://127.0.0.1:5500/improve.webp" height="14"></img>` }
    html = html + `<p class="key"> ${coursename} </p>
  <div class="rangeinput">
  <div class="conainer"> 
    <img src="http://127.0.0.1:5500/star.png" width="12px" style="margin-top :15px; margin-left:${Mark*3.44}px;"></div>
    <p style="margin: 0%;position:absolute;">0</p>
    <p style="margin:170px;margin-top:-1px;position:absolute;">50</p>
    <p style="margin: 325px;margin-top:0px;position:absolute;">100</p></div>
    <span class="score">${Mark}%</span>
    <span class="average">${Mark}%</span><span class="checking">${grad}</span><hr class="hrtag">`;
  })
  fs.writeFileSync(buildPathHtml, html);
  const doesFileExist = (filePath) => {
    try { fs.statSync(filePath); return true; }
    catch (error) { return false }
  };
  /* Check if the file for `html` build exists in system or not */
  try {
    if (doesFileExist(buildPathHtml)) {
      console.log('Deleting old build file');
      /* If the file exists delete the file from system */
      fs.unlinkSync(buildPathHtml);
    }
    fs.writeFileSync(buildPathHtml, html);
    console.log("html file created...!");
  }
  //* if any error accures when u create 'build' html file Error will display...!
  catch (error) { console.log('Error While Creating Html File..!', error); }
  // create pdf using puppeteer npm
  async function add() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let contentHtml = fs.readFileSync(process.cwd() + '/build.html', 'utf8');
    await page.setContent(contentHtml);
    // await page.screenshot({ path: "basith.png" });
    await page.pdf({
      path: "mark.pdf",
      printBackground: true
    });
    await browser.close()
  }
  add();

  // send pdf using sendgrid npm 
  const API_KEY = "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"
  sendgrid.setApiKey(API_KEY);
  setTimeout(async function basith() {
    try {
      let attachment = fs.readFileSync(`${__dirname}/mark.pdf`).toString("base64")
      const message = await {
        to: "basith.developer143@gmail.com",
        from: "basith@digivalsolutions.com",
        subject: "send pdf...!",
        html: "<h1>Your Mark Sheet Pdf</h1>",

        attachments: [{
          content: attachment,
          filename: 'mark.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }],
      }
      sendgrid.send(message)
        .then((response) => {
          console.log("Email Sended Successfully...!");
        })
        .catch((error) => {
          console.log(error.message);
        })
    }
    catch (error) {
      console.log(error)
    }
  }, 8000)
  res.send("PDF Preparing Pls Wait..!")
})
app.listen(8000, () => {
  console.log("server Connected..!")
})