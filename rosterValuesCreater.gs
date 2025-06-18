class RosterValuesCreater{

  // 当番表の値を作成するクラス
  
  constructor(dutyList, dutyUserList, shouldAssignDutysInOrder, dateToUserPresentMap, dateToDutyRequireMap, isFullDayDuty){
    
    this.dutyList = dutyList;
    this.numDuties = dutyList.length;
    this.numDayDutyUsers = isFullDayDuty ? this.numDuties : this.numDuties * NUM_TIMEFRAMES;
    this.dutyUserList = dutyUserList;
    this.shouldAssignDutysInOrder = shouldAssignDutysInOrder;
    this.dateToUserPresentMap = dateToUserPresentMap;
    this.dateToDutyRequireMap = dateToDutyRequireMap;
    this.isFullDayDuty = isFullDayDuty;

    // 1日の値(日付, 当番)の行数
    this.numDayRow = this.numDayDutyUsers + 1;

    // 当番が必要ない日のセル
    this.noDutyDateCellList = new Array();
  }

  createRosterValues(){

    let rosterValueList = new Array(NUM_WEEKDAYS * NUM_WEEKS);
    rosterValueList.fill(new Array(this.numDayRow));

    let firstWeekOfDay = this.dateToUserPresentMap.keys().next().value.getDay(); // 0(日曜)~6(土曜)
    let rosterValueListIndex = Math.max(0, firstWeekOfDay % 6 - 1);

    this.dateToUserPresentMap.forEach((isUserPresentMap, date) => {

      let dayDutyUserList = new Array();

      if(this.dateToDutyRequireMap.get(date.toDateString())){
        // 当番が必要な日
        if(this.isFullDayDuty){
          // 一日を通しての当番を割り当てる
          dayDutyUserList = this.getDayDutyUserList(0, NUM_TIMEFRAMES, isUserPresentMap);
        } else {
          // 午前・午後で分けて当番を割り当てる
          for(let timeFrame = 0; timeFrame < NUM_TIMEFRAMES; timeFrame++){
            dayDutyUserList.push(...this.getDayDutyUserList(timeFrame, 1, isUserPresentMap));
          }
        }
      } else {
        // 当番が必要でない日
        dayDutyUserList = new Array(this.numDayDutyUsers);
      }
      // 日付＋当番の利用者名の配列
      rosterValueList[rosterValueListIndex++] = new Array(date).concat(dayDutyUserList);
    });

    return this.formatArrayForSheet(rosterValueList);
  }

  // シート書き込み用の配列に整える
  formatArrayForSheet(rosterValueList){
    
    let array = new Array(NUM_WEEKS * this.numDayDutyUsers);

    for(let week = 0; week < NUM_WEEKS; week++){
      for(let row = 0; row < this.numDayRow; row++){
        array[week * this.numDayRow + row] = new Array(NUM_WEEKDAYS + 1).fill(0).map((_,index) => {
          if(index === 0){
            // 空白または当番名
            if(row > 0){
              return this.dutyList[(row-1)%this.numDuties].dutyName;
            }
            return "";
          } else {
            const value = rosterValueList[week * NUM_WEEKDAYS + index - 1][row];
              // 当番が必要ない日のセル
              if(row === 0 && value !== undefined && !this.dateToDutyRequireMap.get(value.toDateString())){
                this.noDutyDateCellList.push(new Cell(week * this.numDayRow + rosterStartCell.row, index + rosterStartCell.column));
              }
            return value;
          }
        });
      }
    }
    return array;
  }

  // 当番可能な利用者を順に探して割り当てる
  getDayDutyUserList(firstRowTimeFrame, numTargetRow, isUserPresentMap){

    let dayDutyUserList = new Array(this.numDuties);
    let assignedCount = 0;

    for(let index = 0; index < this.dutyUserList.length;){

      let dutyUser = this.dutyUserList[index];
      let assignDutyId = -1;
      
      if(this.isPresent(firstRowTimeFrame, numTargetRow, isUserPresentMap.get(dutyUser.userId))){
        assignDutyId = this.getAssignDutyId(dutyUser, dayDutyUserList);
      }

      // 割り当てられなかった場合
      if(assignDutyId < 0){
         index++;
         continue;
      }

      dayDutyUserList[assignDutyId] = dutyUser.userName;

      // 一番後ろに移動
      this.dutyUserList.push(this.dutyUserList.splice(index, 1)[0]);
            
      if(++assignedCount === this.numDuties) break;
    }

    return dayDutyUserList;
  }

  // 割り当てられない場合は-1を返す
  getAssignDutyId(dutyUser, dayDutyUserList){

    let assignDutyId = -1;

    if(this.shouldAssignDutysInOrder){      
      
      // user内で役割を順番に割り当てる場合：userの次の役割が未割当ての場合に、その担当を割り当てる。
      const nextDutyId = dutyUser.getNextDutyId();
      if(dayDutyUserList[nextDutyId] === undefined){
        assignDutyId = nextDutyId
        dutyUser.assignDuty(0, assignDutyId);
      }
    } else {
      // 交互に割り当てない場合
      for(let i = 0; i < dutyUser.dutyList.length; i++){
        
        const dutyId = dutyUser.dutyList[i];

        if(dayDutyUserList[dutyId] === undefined){
          assignDutyId = dutyId;
          dutyUser.assignDuty(i, assignDutyId);
          break;
        }
      }
    }

    return assignDutyId;
  }

  // 利用者が指定範囲すべて出席しているか判定
  isPresent(firstRow, numOfRow, isUserPresentList){
    for(let i = firstRow; i < numOfRow + firstRow; i++){
      if(!isUserPresentList[i]) return false;
    }
    return true;
  }
}