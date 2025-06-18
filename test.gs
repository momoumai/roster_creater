// テストシートのテストデータから当番表を作成

const testSheetId = scriptProperties.getProperty("TEST_SHEET_ID");
const testSpreadSheet = SpreadsheetApp.openById(testSheetId);
const testCaseSheet = testSpreadSheet.getSheetByName("テストケース");

function createTestSpecificRoster(){
  createRosterSheet(2);
}

function createAllTestRoster(){
  const NUM_TEST_CASE = 26;

  for(let i = 1; i< NUM_TEST_CASE; i++){
    createRosterSheet(i+1);
  }
}

function createRosterSheet(testNum){
    
    const testCaseSheetRow = testNum + 2;

    const scheduleSheet = testSpreadSheet.getSheetByName(`テスト${testNum}_schedule`);
    const userListSheet = testSpreadSheet.getSheetByName(`テスト${testNum}_user`);
    const noDutyDateSheet = testSpreadSheet.getSheetByName(`テスト${testNum}_noDutyDate`);

    const date = scheduleSheet.getRange("A1").getValue(); 
    
    const isFullDayDuty = testCaseSheet.getRange(testCaseSheetRow, 9).getValue();
    const shouldAssignRoleInOrder = testCaseSheet.getRange(testCaseSheetRow, 10).getValue();

    let dutyCellList = new Array();

    for(let column = 2; ;column++){
      if(userListSheet.getRange(1, column).getValue() === "") break;
      dutyCellList.push(new Cell(1, column));
    }

    const noDutyDateNum = noDutyDateSheet.getRange(1, 1).getValue();
    let noDutyDateList = [];

    if(noDutyDateNum > 0){
      noDutyDateList = noDutyDateSheet.getRange(2, 1, noDutyDateNum, 1).getValues().map(value => value[0]);
    }

    const rosterSheetCreater = new RosterSheetCreater(testSpreadSheet, scheduleSheet, userListSheet, date, shouldAssignRoleInOrder, isFullDayDuty, dutyCellList, noDutyDateList);

    const rosterName = `テスト${testNum}_roster`;

    const str = isFullDayDuty? "full" : "part"; 

    const templateSheetName = `テンプレート_${dutyCellList.length}duty_${str}`;

    rosterSheetCreater.createRosterSheet(rosterName, templateSheetName);
}

