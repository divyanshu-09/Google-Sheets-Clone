let body = document.querySelector("body");
body.spellcheck = false;

let grid = document.querySelector(".grid");
let formulaSelectCell = document.querySelector("#select-cell");

let menuBarPtags = document.querySelectorAll(".menu-bar p");

let columnTags = document.querySelector(".column-tags");
let rowNumber = document.querySelector(".row-numbers");

let formulaInput = document.querySelector("#complete-formula");

let oldcell;

let dataObj = {};

let fileOptions = menuBarPtags[0];

fileOptions.addEventListener("click", function (e) {

    if (e.currentTarget.classList.length == 0) {
        e.currentTarget.innerHTML = `File
        <span>
        <span>Clear</span>
        <span>Open</span>
        <span>Save</span>
        </span>`;

        let allFileoptions = document.querySelectorAll("span span");
       
        //clear
        allFileoptions[0].addEventListener("click", function () {
            
            let allcells = document.querySelectorAll(".cell");

            for(let i=0;i<allcells.length;i++) {

                allcells[i].innerText = "";

                let cellAdd = allcells[i].getAttribute("data-address");
                dataObj[cellAdd] = {

                        valvalue: "",
                        formula: "",
                        upstream: [],
                        downstream: [],
                        fontSize: 10,
                        fontFamily: "Arial",
                        fontWeight: "normal",
                        color: "black",
                        backgroundColor: "white",
                        underline: "none",
                        italics: "normal",
                        textAlign: "left",
                };
            }

            
        });

        //open
        allFileoptions[1].addEventListener("click", function () {
            
            dataObj = JSON.parse(localStorage.getItem("sheet"));

            for (let i = 1; i <= 100; i++) {
            
                for (let j = 0; j < 26; j++) {
            
                    let address = String.fromCharCode(65 + j) + i;
                    let cellobj = dataObj[address];
                    let cellonui = document.querySelector(`[data-address=${address}]`);
                    cellonui.innerText = cellobj.value;
                    cellonui.style.backgroundColor = cellobj.backgroundColor;
                    cellonui.style.color = cellobj.color;
                }
            }
            
        });

        //save
        allFileoptions[2].addEventListener("click", function () {
            
            localStorage.setItem("sheet", JSON.stringify(dataObj));
        });
    } 
    else {
        e.currentTarget.innerHTML = `File`;
    }
});

for (let i = 0; i < menuBarPtags.length; i++) {
    menuBarPtags[i].addEventListener("click", function (e) {
        if (e.currentTarget.classList.contains("menu-bar-option-selected"))
            e.currentTarget.classList.remove("menu-bar-option-selected");
        else {
            for (let j = 0; j < menuBarPtags.length; j++) {
                if (menuBarPtags[j].classList.contains("menu-bar-option-selected"))
                    menuBarPtags[j].classList.remove("menu-bar-option-selected");
            }
            e.currentTarget.classList.add("menu-bar-option-selected");
        }
    });
}

for (let i = 0; i < 26; i++) {
    let div = document.createElement("div");
    div.classList.add("column-tag-cell");
    div.innerText = String.fromCharCode(65 + i);
    columnTags.append(div);
}

for (let i = 1; i <= 100; i++) {
    let div = document.createElement("div");
    div.classList.add("row-number-cell");
    div.innerText = i;
    rowNumber.append(div);
}

for (let i = 1; i <= 100; i++) {

    let row = document.createElement("div");
    row.classList.add("row");

    for (let j = 0; j < 26; j++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.contentEditable = true;

        let address = String.fromCharCode(65 + j) + i;

        cell.setAttribute("data-address", address);

        dataObj[address] = {

            value: "",
            formula: "",
            upstream: [],
            downstream: [],
            fontSize: 10,
            fontFamily: "Arial",
            fontWeight: "normal",
            color: "black",
            backgroundColor: "white",
            underline: "none",
            italics: "normal",
            textAlign: "left",
        };

        cell.addEventListener("click", function (e) {
            // check kro pehle se koi old cell ha selected
            if (oldcell) oldcell.classList.remove("grid-selected-cell"); // agar haan to use deselect kro class remove kr k

            e.currentTarget.classList.add("grid-selected-cell");

            let cellAddress = e.currentTarget.getAttribute("data-address");
            formulaSelectCell.value = cellAddress;
            oldcell = e.currentTarget; // aur yaha p naya seleceted cell daal rha hu for future
        });

        cell.addEventListener("input", function (e) {
            console.log(e.currentTarget.innerText);
            let address = e.currentTarget.getAttribute("data-address");
            dataObj[address].value = Number(e.currentTarget.innerText);

            dataObj[address].formula = "";

            //upstream clear krni hai

            let currCellUpstream = dataObj[address].upstream;

            for (let i = 0; i < currCellUpstream.length; i++) {
                removeFromUpstream(address, currCellUpstream[i]);
            }

            dataObj[address].upstream = [];
            //downstream ke cells ko update krna hai

            let currCellDownstream = dataObj[address].downstream;

            for (let i = 0; i < currCellDownstream.length; i++) {
                updateDownstreamElements(currCellDownstream[i]);
            }
        });

        row.append(cell);
    }
    grid.append(row);
}


formulaInput.addEventListener("change", function (e) {


    let selectedCellAddress = oldcell.getAttribute("data-address");

    let formula = e.currentTarget.value;

    dataObj[selectedCellAddress].formula = formula;

    let formulaArr = formula.split(" ");

    let elementsArr = [];

    for(let j=0;j<formulaArr.length;j++) {

        if(formulaArr[j] != '+' && formulaArr[j] != '-' && formulaArr[j] != '*' && formulaArr[j] != '/' && isNaN(Number(formulaArr[j])))
            elementsArr.push(formulaArr[j]);

    }

    //before setting new upstream clear old upstream
    let oldupstream = dataObj[selectedCellAddress].upstream;

    for(let j=0; j<oldupstream.length;j++) {

        removeFromUpstream(selectedCellAddress, oldupstream[j]);  // basically function name is removefromupstram but is removing elements from downstream
    }

    dataObj[selectedCellAddress].upstream = elementsArr;

    for(let j=0;j<elementsArr.length;j++) {

        addToDownstream(selectedCellAddress, elementsArr[j]);
    }
    
    let valObj = {};

    for(let j=0;j<elementsArr.length;j++) {

        let formulaDependency = elementsArr[j];
        valObj[formulaDependency] = dataObj[formulaDependency].value;
    }

    for(let j=0;j<formulaArr.length;j++) {

        if(valObj[formulaArr[j]] != undefined)
            formulaArr[j] = valObj[formulaArr[j]];
    }

    formula = formulaArr.join("");

    let newvalue = eval(formula);

    dataObj[selectedCellAddress].value = newvalue;

    let selectedCellDownstream = dataObj[selectedCellAddress].downstream;

    for(let j=0;j<selectedCellDownstream.length;j++)
        updateDownstreamElements(selectedCellDownstream[j]);


    oldcell.innerText = newvalue;

});

function addToDownstream(tobeAdded, inWhichWeAreAdding) {

    dataObj[inWhichWeAreAdding].downstream.push(tobeAdded);
}

function removeFromUpstream(dependent, onWhichItIsDepending) {

    let newDownstream = [];

    let oldDownstream = dataObj[onWhichItIsDepending].downstream;

    for (let i = 0; i < oldDownstream.length; i++) {
        if (oldDownstream[i] != dependent) newDownstream.push(oldDownstream[i]);
    }

    dataObj[onWhichItIsDepending].downstream = newDownstream;
}

function updateDownstreamElements(elementAddress) {
    //1- jis element ko update kr rhe hai unki upstream elements ki current value leao
    //unki upstream ke elements ka address use krke dataObj se unki value lao
    //unhe as key value pair store krdo valObj naam ke obj me
    let valObj = {};

    let currCellUpstream = dataObj[elementAddress].upstream;

    for (let i = 0; i < currCellUpstream.length; i++) {
        let upstreamCellAddress = currCellUpstream[i];
        let upstreaCellValue = dataObj[upstreamCellAddress].value;

        valObj[upstreamCellAddress] = upstreaCellValue;
    }

    //2- jis element ko update kr rhe hai uska formula leao
    let currFormula = dataObj[elementAddress].formula;
    //formula ko space ke basis pr split maro
    let forumlaArr = currFormula.split(" ");
    //split marne ke baad jo array mili uspr loop ara and formula me jo variable h(cells) unko unki value se replace krdo using valObj
    for (let j = 0; j < forumlaArr.length; j++) {
        if (valObj[forumlaArr[j]]) {
            forumlaArr[j] = valObj[forumlaArr[j]];
        }
    }

    //3- Create krlo wapis formula from the array by joining it
    currFormula = forumlaArr.join(" ");

    //4- evaluate the new value using eval function
    let newValue = eval(currFormula);

    //update the cell(jispr function call hua) in dataObj
    dataObj[elementAddress].value = newValue;

    //5- Ui pr update krdo new value
    let cellOnUI = document.querySelector(`[data-address=${elementAddress}]`);
    cellOnUI.innerText = newValue;

    //6- Downstream leke ao jis element ko update kra just abhi kuki uspr bhi kuch element depend kr sakte hai
    //unko bhi update krna padega
    let currCellDownstream = dataObj[elementAddress].downstream;

    //check kro ki downstream me elements hai kya agr han to un sab pr yehi function call krdo jise wo bhi update hojai with new value
    if (currCellDownstream.length > 0) {
        for (let k = 0; k < currCellDownstream.length; k++) {
            updateDownstreamElements(currCellDownstream[k]);
        }
    }
}
