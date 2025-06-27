function createRosterSheet(){

  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 利用者一覧シート
  const userListSheet = spreadSheet.getSheetByName(userListSheetName);
  
  // 当番表作成シート
  const createrSheet = spreadSheet.getActiveSheet();

  // 当番表作成シートの情報を取得

  const rosterName = createrSheet.getRange("C2").getValue();

  const date = createrSheet.getRange("C3").getValue();

  const templateSheetName = createrSheet.getRange("C4").getValue();

  const shouldAssignRoleInOrder = createrSheet.getRange("C5").getValue();

  const isFullDayDuty = !(createrSheet.getRange("C6").getValue());

  // 当番数
  const numDuty = createrSheet.getRange("E2").getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() - 2;

  // 当番名のセルの配列
  const dutyCellList = createrSheet.getRange(3, 5, numDuty, 1).getValues().map(value => new Cell(value[0]));

  //当番が必要ない日の配列を作成 
  let noDutyDateList = new Array();
  for(let row = 3; ;row++){
    const value = createrSheet.getRange(row, 6).getValue();
    if(value === "") break;
    noDutyDateList.push(value);
  }

  // 予定表シート
  const scheduleSheet = spreadSheet.getSheetByName(`【予定表】${date.getMonth() + 1}月`);

  // 当番表シートを作成
  const rosterSheetCreater = new RosterSheetCreater(spreadSheet, scheduleSheet, userListSheet, date, shouldAssignRoleInOrder, isFullDayDuty, dutyCellList, noDutyDateList);
  rosterSheetCreater.createRosterSheet(rosterName, templateSheetName);
}


