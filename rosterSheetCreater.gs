class RosterSheetCreater {

  // 当番表を作成するクラス
  
  constructor(spreadSheet, scheduleSheet, userListSheet, date, shouldAssignRoleInOrder, isFullDayDuty, dutyCellList, noDutyDateList){

    this.spreadSheet = spreadSheet;
    this.scheduleSheet = scheduleSheet;
    this.userListSheet = userListSheet;
    this.date = date;
    this.shouldAssignRoleInOrder = shouldAssignRoleInOrder;
    this.isFullDayDuty = isFullDayDuty;
    this.noDutyDateList = noDutyDateList;

    // WRの全利用者数
    const userListStartRange = memberStartCell.getRange(this.userListSheet);
    this.numAllUsers = userListStartRange.getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() - (memberStartCell.row - 1);
     
    // 当番リストの作成
    this.dutyList = this.getDutyList(dutyCellList);

    // 1日に必要な当番の数
    this.numDayDutyUsers = this.isFullDayDuty 
    ? this.dutyList.length
    : this.dutyList.length * NUM_TIMEFRAMES;
  } 
  
  // 当番表シートの作成
  createRosterSheet(rosterName, templateSheetName){
    
    // 当番表の値を作成
    const rosterValuesCreater = this.getRosterValuesCreater();
    const rosterSheetData = rosterValuesCreater.createRosterValues();

    // 当番回数表の値を作成
    const dutyUserNameList = this.getDutyUserListBuilder().dutyUserNameList;
    const countTableValues = this.getCountTableValues(dutyUserNameList);

    //当番表シートを作成 
    const rosterSheet = this.copyTemplateSheet(templateSheetName);
    
    let dutyUserNameValues = dutyUserNameList.map(name => [name]);
    let nameListRange = rosterSheet.getRange(2, 9, dutyUserNameList.length, 1);
    nameListRange.setValues(dutyUserNameValues);

    // 当番表に記入
    let rosterRange = rosterStartCell.getRange(rosterSheet, (this.numDayDutyUsers + 1) * NUM_WEEKS, NUM_WEEKDAYS + 1);
    rosterRange.setValues(rosterSheetData);

    // 背景を変更
    this.setNoDutyRangeBG(rosterSheet, rosterValuesCreater.noDutyDateCellList);

    // 当番回数表を記入
    const countTableRange = rosterSheet.getRange(1, 9, dutyUserNameList.length + 1, this.dutyList.length + 2);
    countTableRange.setValues(countTableValues);

    // 月を記入
    rosterMonthCell.getRange(rosterSheet).setValue(this.date);

    // シート名を変更
    rosterSheet.setName(rosterName);
  }

  getDutyList(dutyCellList){
    return dutyCellList.map((cell) => {
      const dutyName = cell.getValue(this.userListSheet);
      const dutyAvaiableList = this.userListSheet.getRange(cell.row + 1, cell.column, this.numAllUsers).getValues().map(v => v[0]);
      return {
        "dutyName": dutyName,
        "dutyAvailableList":dutyAvaiableList
      };
    });
  }

  getDutyUserListBuilder(){
    if(this.dutyUserListBuilder === undefined){
      const userNameList = memberStartCell.getValues(this.userListSheet, this.numAllUsers).map(v => v[0]);
      this.dutyUserListBuilder = new DutyUserListBuilder(this.dutyList, userNameList);
    }
    return this.dutyUserListBuilder;
  }

  copyTemplateSheet(templateSheetName){
    const templateSheet = this.spreadSheet.getSheetByName(templateSheetName);
    return templateSheet.copyTo(this.spreadSheet);
  }

  getRosterValuesCreater(){
    const lastDate = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDate();
    const scheduleSheetData = scheduleStartCell.getValues(this.scheduleSheet, this.numAllUsers * NUM_TIMEFRAMES + 1, lastDate);
    const dateToUserPresentMap = this.getDateToUserPresentMap(scheduleSheetData, this.getDutyUserListBuilder().dutyUserIdList);
    return new RosterValuesCreater(this.dutyList, this.dutyUserListBuilder.dutyUserList, this.shouldAssignRoleInOrder, dateToUserPresentMap, this.getDateToDutyRequireMap(lastDate), this.isFullDayDuty);
  }

  // 日付ごとの当番必要マップの作成
  getDateToDutyRequireMap(lastDate){
    const year = this.date.getFullYear()
    const month = this.date.getMonth();

    let dateToDutyRequireMap = new Map(new Array(lastDate).fill(0).map((_,index) => [new Date(year, month, index+1).toDateString(), true]));

    if(this.noDutyDateList.length > 0){
      this.noDutyDateList.forEach(date => {
        dateToDutyRequireMap.set(date.toDateString(), false);
      });
    }

    return dateToDutyRequireMap;
  }

  // 当番回数表の値を作成
  getCountTableValues(dutyUserNameList){
    
    const countTableHeader = ["名前", "総回数"].concat(this.dutyList.map(duty => duty.dutyName));

    const countTableValue =  dutyUserNameList.map((userName, userIndex) => {
      const row = userIndex + countTableStartCell.row + 1;
      const startColumn = countTableStartCell.column + 2;   // 2:名前+総回数のセル
      const lastColumn = startColumn + this.dutyList.length - 1;
      const sumCountText = `=SUM(R${row}C${startColumn}:R${row}C${lastColumn})`;

      const dutyCountTextList = this.dutyList.map((_,dutyIndex) => {
        if(this.isFullDayDuty){
          return this.getDutyCountText(dutyIndex, userIndex, 1);
        } else {
          for(let timeFrame = 0; timeFrame < NUM_TIMEFRAMES; timeFrame++){
            return this.getDutyCountText(dutyIndex, userIndex, NUM_TIMEFRAMES);
          }
        }
      });

      return [userName, sumCountText].concat(dutyCountTextList);
    });

    return [countTableHeader, ...countTableValue];
  }

  // countif関数を作成
  getDutyCountText(dutyIndex, userIndex, numTimeFrames){

    let countText = "=";

    const startColumn = rosterStartCell.column + 1;
    const lastColumn = startColumn + NUM_WEEKDAYS;
    const nameRow = userIndex + countTableStartCell.row + 1;
    const nameColumn = countTableStartCell.column;

    for(let timeFrame = 0; timeFrame < numTimeFrames; timeFrame++){
      for(let weekIndex = 0; weekIndex < NUM_WEEKS; weekIndex++){
        const row = rosterStartCell.row + weekIndex * (this.numDayDutyUsers + 1) + (dutyIndex + 1) + timeFrame * this.dutyList.length;
        if(weekIndex + timeFrame > 0) countText += "+";
        countText += `COUNTIF(R${row}C${startColumn}:R${row}C${lastColumn}, R${nameRow}C${nameColumn})`;
      }
    }
    return countText;
  }

  // 当番が必要ない日の背景を変える
  setNoDutyRangeBG(rosterSheet, noDutyDateCellList){
    noDutyDateCellList.forEach(cell => {
      // その日のセル全体の色を変える
      const range = rosterSheet.getRange(cell.row, cell.column, this.numDayDutyUsers + 1, 1);
      range.setBackground(NO_DUTY_DATE_COLOR);
    });
  }

  // 日付ごとの利用者出席マップの作成
  getDateToUserPresentMap(scheduleSheetData, dutyUserIdList){

    const entries = scheduleSheetData[0].map((date, index) => {

      // 土日の場合(日曜=0, 土曜=6)はとばす
      if(date.getDay() % 6 === 0) return null;

      const value = new Map(dutyUserIdList.map(userId => [
        userId, [
            this.isUserPresent(scheduleSheetData[userId * NUM_TIMEFRAMES + 1][index]), 
            this.isUserPresent(scheduleSheetData[(userId + 1) * NUM_TIMEFRAMES][index])
        ]
      ]));

      return[date, value];

    }).filter(entry => entry !== null); // nullを除外;

    return new Map(entries);
  }

 // 利用者が出席しているか判定
  isUserPresent(str){
    return str === "通所";
  }
}