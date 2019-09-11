// const html2canvas = require('html2canvas');
// import html2canvas from 'html2canvas';

html2canvas(document.querySelector("#capture")).then(canvas => {
    document.body.appendChild(canvas)
});