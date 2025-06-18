class Cell{

  // スプレッドシートのセルを扱うクラス

  constructor(arg1, arg2){

    if(typeof arg1 === "string" && arg2 === undefined){
      this.row = parseInt(arg1.substring(arg1.length - 1));
      this.column = this.getColumnNum(arg1.substring(0, arg1.length - 1));
    } else if(typeof arg1 === "number" && typeof arg2 === "number"){
      this.row = arg1;
      this.column = arg2;
    }
  }

  getColumnNum(columnStr){
    let column = 0;
    for(let i = 0; i < columnStr.length; i++){
      let num = columnStr.charCodeAt(i) - "A".charCodeAt(0) + 1;
      column += (26 ** (columnStr.length - i - 1)) * num;
    }
    return column;
  }

  getRange(sheet, numRows=1, numColumns=1){
    return sheet.getRange(this.row, this.column, numRows, numColumns);
  }

  getValue(sheet){
    return this.getRange(sheet).getValue();
  }

  getValues(sheet, numRows=1, numColumns=1){
    return this.getRange(sheet, numRows, numColumns).getValues();
  }

}
