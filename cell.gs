class Cell{

  // スプレッドシートのセルを扱うクラス

  constructor(arg1, arg2){
    if(typeof arg1 === "string" && arg2 === undefined){
      // A1形式の場合
      this.row = parseInt(arg1.substring(arg1.length - 1));
      this.column = this.getColumnNum(arg1.substring(0, arg1.length - 1));
    } else if(typeof arg1 === "number" && typeof arg2 === "number"){
      // R1C1形式の場合
      this.row = arg1;
      this.column = arg2;
    }
  }

  // A1形式からカラム番号を取得する
  getColumnNum(columnStr){
    let column = 0;
    for(let i = 0; i < columnStr.length; i++){
      let num = columnStr.charCodeAt(i) - "A".charCodeAt(0) + 1;
      column += (26 ** (columnStr.length - i - 1)) * num;
    }
    return column;
  }

  // スプレッドシートの範囲を返す
  getRange(sheet, numRows=1, numColumns=1){
    return sheet.getRange(this.row, this.column, numRows, numColumns);
  }

  // スプレッドシートの値を返す
  getValue(sheet){
    return this.getRange(sheet).getValue();
  }

  getValues(sheet, numRows=1, numColumns=1){
    return this.getRange(sheet, numRows, numColumns).getValues();
  }

}
