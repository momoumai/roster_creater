class DutyUser{

  // いずれかの当番を担当できるユーザーを扱うクラス

  // 利用者id(メンバー一覧シートの並び順)、利用者名、担当可能な当番のリストをメンバ変数に持つ
  constructor(userId, userName, dutyList){
    this.userId = userId;
    this.userName = userName;
    this.dutyList = dutyList;
  }

  // 次に担当する当番を返す
  getNextDutyId(){
    return this.dutyList[0];
  }

  // 次の担当の当番
  assignDuty(index, dutyNum){
    this.dutyList.splice(index, 1);
    this.dutyList.push(dutyNum);
  }

}