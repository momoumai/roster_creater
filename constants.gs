const NUM_TIMEFRAMES = 2; // 午前・午後の二つ

// 曜日の数
const NUM_WEEKDAYS = 5;
// 週の数
const NUM_WEEKS = 5;

// 当番表の、当番の必要ない日のセル背景に設定する色
const NO_DUTY_DATE_COLOR = "#a8a8a8";

const scriptProperties = PropertiesService.getScriptProperties();

// 利用者一覧シート名
const userListSheetName = scriptProperties.getProperty("USER_LIST_SHEET_NAME");

// WR名簿の利用者一覧の開始位置
const memberStartCell = new Cell(scriptProperties.getProperty("MEMBER_START_CELL"));

// スケジュールシートのスケジュール表の開始位置
const scheduleStartCell = new Cell(scriptProperties.getProperty("SCHEDULE_START_CELL"));

// 当番表シートの当番表の開始位置
const rosterStartCell = new Cell(scriptProperties.getProperty("ROSTER_START_CELL"));

// 当番表の月を記入するセル
const rosterMonthCell = new Cell(scriptProperties.getProperty("ROSTER_MONTH_CELL"));

// 当番回数表の開始位置
const countTableStartCell = new Cell(scriptProperties.getProperty("COUNT_TABLE_START_CELL"));

