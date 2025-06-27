// テストシートのテストデータから当番表を作成する

const testSheetId = scriptProperties.getProperty("TEST_SHEET_ID");
const testSpreadSheet = SpreadsheetApp.openById(testSheetId);
const testCaseSheet = testSpreadSheet.getSheetByName("テストケース");

// 特定のテストケースの当番表を作成する
function createTestSpecificRoster(){
  createRosterSheet(2);
}

// すべてのテストケースの当番表を作成する
function createAllTestRoster(){
  const NUM_TEST_CASE = 26;
  for(let i = 1; i< NUM_TEST_CASE; i++){
    createTestRosterSheet(i+1);
  }
}

function createTestRosterSheet(testNum){

  // テストケース一覧内の該当のテストケースの行
  const testCaseSheetRow = testNum + 2;

  // テストデータを取得
  const scheduleSheet = testSpreadSheet.getSheetByName(`テスト${testNum}_schedule`);
  const userListSheet = testSpreadSheet.getSheetByName(`テスト${testNum}_user`);
  const noDutyDateSheet = testSpreadSheet.getSheetByName(`テスト${testNum}_noDutyDate`);
  
  const date = scheduleSheet.getRange("A1").getValue(); 
  const isFullDayDuty = testCaseSheet.getRange(testCaseSheetRow, 9).getValue();
  const shouldAssignRoleInOrder = testCaseSheet.getRange(testCaseSheetRow, 10).getValue();
  
  // 当番名のセルの配列を取得
  let dutyCellList = new Array();
  for(let column = 2; ;column++){
    if(userListSheet.getRange(1, column).getValue() === "") break;
    dutyCellList.push(new Cell(1, column));
  }

  // 当番が必要ない日の数
  const noDutyDateNum = noDutyDateSheet.getRange(1, 1).getValue();
  
  // 当番が必要ない日の配列
  let noDutyDateList = [];
  if(noDutyDateNum > 0){
    noDutyDateList = noDutyDateSheet.getRange(2, 1, noDutyDateNum, 1).getValues().map(value => value[0]);
  }

  const rosterSheetCreater = new RosterSheetCreater(testSpreadSheet, scheduleSheet, userListSheet, date, shouldAssignRoleInOrder, isFullDayDuty, dutyCellList, noDutyDateList);

  // 当番表シートの名前
  const rosterName = `テスト${testNum}_roster`;

  // テンプレートシート名を取得
  const str = isFullDayDuty? "full" : "part"; 
  const templateSheetName = `テンプレート_${dutyCellList.length}duty_${str}`;

  // 当番表を作成
  rosterSheetCreater.createRosterSheet(rosterName, templateSheetName);
}
