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

  const numDuty = createrSheet.getRange("E2").getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() - 2;

  const dutyCellList = createrSheet.getRange(3, 5, numDuty, 1).getValues().map(value => new Cell(value[0]));

  const numNoDutyDate = createrSheet.getRange("F2").getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() - 2;

  const noDutyDateList = createrSheet.getRange(3, 6, numNoDutyDate, 1).getValues().map(value => value[0]);

  // 予定表シート
  const scheduleSheet = spreadSheet.getSheetByName(`【予定表】${date.getMonth() + 1}月`);

  // 当番表シートを作成
  const rosterSheetCreater = new RosterSheetCreater(spreadSheet, scheduleSheet, userListSheet, date, shouldAssignRoleInOrder, isFullDayDuty, dutyCellList, noDutyDateList);
  rosterSheetCreater.createRosterSheet(rosterName, templateSheetName);
}


