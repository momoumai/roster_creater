class DutyUserListBuilder{

// DutyUserの配列を作成するクラス

  constructor(dutyList, userNameList){ 
    this.dutyList = dutyList;
    this.userNameList = userNameList;
    this.dutyUserIdList = this.getDutyUserIdList();
    this.dutyUserList = this.createDutyUserList();
    this.dutyUserNameList = this.dutyUserIdList.map(userId => this.userNameList[userId]);
  }

  // 当番を行う利用者のリストを作成
  createDutyUserList(){

    let dutyUserList = this.dutyUserIdList.map((userId, index) => 
      new DutyUser(userId, this.userNameList[userId], this.createUsersDutyList(userId, index))
    );

    // 毎月同じ順にならないようにシャッフルする
    return this.shuffleArray(dutyUserList); 
  }

  // 利用者ごとの担当が可能な当番のリストを作成
  createUsersDutyList(userId, userIndex){

    let usersDutyList = new Array();
  
    for(let i = 0; i < this.dutyList.length; i++){
      // 利用者ごとに当番リストの並び順をずらす
      let dutyId = (userIndex + i) % this.dutyList.length;
      if(this.dutyList[dutyId].dutyAvailableList[userId]){
        usersDutyList.push(dutyId);
      }
    }

    return usersDutyList;
  }

  // 1つ以上の当番を担当できる利用者のidリストを取得
  getDutyUserIdList(){

      let dutyUserIdList = new Array();

      for(let userId = 0; userId < this.userNameList.length; userId++){
        if(this.canTakeAnyDuty(userId)){
          dutyUserIdList.push(userId);
        }
      }

    return dutyUserIdList;
  }

  // 利用者がいずれかの当番が可能であるか
  canTakeAnyDuty(userId){
    for(let dutyId = 0; dutyId < this.dutyList.length; dutyId++){
      if(this.dutyList[dutyId].dutyAvailableList[userId]){
        return true;
      }
    }
    return false;
  }

  // 毎月同じ順番にならないように、配列をシャッフルする
  shuffleArray(originalArray){  
    let shuffledArray = new Array();

    for(let length = originalArray.length; length > 0; length--){
      let randomIndex = Math.floor(Math.random() * length);
      shuffledArray.push(originalArray[randomIndex]);
      originalArray.splice(randomIndex, 1);
    }

    return shuffledArray;
  } 
}


