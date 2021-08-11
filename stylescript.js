let colorSpans = document.querySelectorAll(".colors span");
let fontColorBtn = colorSpans[0];
let backgroundColorBtn = colorSpans[1];

fontColorBtn.addEventListener("click", function () {
    
    console.log("is clicked");
    let colorPicker = document.createElement("input");
    colorPicker.type = "color";
  
    colorPicker.addEventListener("change", function (e) {
      oldCell.style.color = e.currentTarget.value;
      let address = oldCell.getAttribute("data-address");
      dataObj[address].fontColor = e.currentTarget.value;
    });
  
    colorPicker.click();
})