var express = require('express');
var router = express.Router();
//引入数据库数据转化模块
const dbTrans = require('../../assets/js/dbTo2DArray_module.js');
//引入日期转化模块
const dateTrans = require('../../assets/js/dateTrans_module.js');

//引入数据库操作文件
const WorkSchedule = require('../../mongodb/mg_model_module.js').WorkSchedule;


//^ 1. GET home page. 
router.get('/', function (req, res, next) {

  res.render('work-schedule');
  return;

});//$ 1. GET home page. 




//^ 2. GET /data_onload
router.all('/data_onload', function (req, res, next) {
  //跨域请求
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1');

  //获取req的参数
  let dateReq = req.query.date;
  // console.log(dateReq,'服务器收到dateReq');
  // console.log(Date.parse(dateReq));
  //判断reqDate日期 是否为合法日期
  if (!Date.parse(dateReq)) {
    res.status(400);
    res.send('Invalid parameters参数不合法');
    console.log('......非时间对象,错误输入');
    res.end();
    return;
  }

  //使用date获得数据库数据,响应page
  async function responseDate(dateReq) {
    //console.log(dateReq,1);
    //获得数据
    let db = await getTwoDArray_schedule(dateReq);
    //console.log(db,666);

    //补全standard化二维数组
    let dbFixed = dbTrans.standard2dArr(db);
    //响应数据
    res.json(dbFixed);
    return;
  }

  //执行
  responseDate(dateReq);
});//$ 2. GET /data_onload




//!--------------------------------------------------------------------


//^ 1. 获得数据库排班表数据
async function getScheduleData(dateReq) {
  // console.log(dateReq,2);
  //获取指定日期的"整周日期数据"
  dates = dateTrans.getWeekDate(dateReq);
  /*
      1.获取指定日期的db数据
      2.整理db数据为[{ idnum: '2301', pos: 'busser', time: 'sat_am' },{...}]
      3.返回结果
 */

  let db = await WorkSchedule.find({
    workdate: {
      $in: dates
    }
  }).select('employeename employeenumber workdate shift position posNumber').lean().sort({
    posNumber: 1,
    employeenumber: 1,
    shift: 1
  }).catch(err => console.log(err));
  //整理db
  let dbFixed;
  if (db) {
    dbFixed = db.map(item => {
      return {
        name: item.employeename,
        pos: item.position,
        time: item.shift,
        date: item.workdate.toLocaleDateString()
      };
    });
  }
  // console.log(dbFixed,1);
  return dbFixed;
}//$ 1. 获得数据库排班表数据


//^ 2. 设置2D Array排班表函数,  输入一个日期,返回该日期的整周的安排,二维数组结果
async function getTwoDArray_schedule(dateReq) {
  let db = await getScheduleData(dateReq);
  //?获取所有名字; all names的键值
  /*
  *let nameValues = dbTrans.getvalues(db, "name");//所有值会自动进行字母排序,不适合这里
  只能手动获取所有name了
  */
  let nameValues;
  if (db) {
    nameValues = db.map(item => item.name);
  }
  //去重
  nameValues = [...new Set(nameValues)];
  // console.log(nameValues,2);


  //?取其一日期生成一周的日期
  let weeks = dateTrans.getWeekDate(dateReq);

  //?headers为name,time,...七天星期+日期
  let headers = ["name", "time", ...weeks];

  //?生成表格body:tableArr; 按nameValues来
  let tableArr = [];
  
  //!每两行第一col为"同个name",第二个col分别为"am","pm"
  for (let i = 0; i < nameValues.length * 2; i++) {
    for (let j = 0; j < headers.length; j++) {
      if (tableArr[i] == undefined) {
        tableArr[i] = [];
      }
      //将db中name和time相同的数据添加到tableArr中,并且按照headers的顺序排列
      if (j === 0) {
        tableArr[i][j] = nameValues[Math.floor(i / 2)];
      } else if (j === 1 && i % 2 === 0) {
        tableArr[i][j] = "am";
      } else if (j === 1 && i % 2 === 1) {
        tableArr[i][j] = "pm";
      } else {
        for (let [kNo, obj] of db.entries()) {
          // console.log(obj.name, nameValues[Math.floor(i / 2)],kNo, obj.time, headers[j]);
          if (obj.name == nameValues[Math.floor(i / 2)] && obj.date == headers[j]&&tableArr[i][1]== obj.time) {
            
            tableArr[i][j]=(obj.pos);
          }
        }
      }
    }
  }
  // console.log(tableArr,4);

  //?更新 新的格式的表头
 let newH= headers.map(item => {
    if (dateTrans.isMDYdate(item)) {
      item = dateTrans.getWeekShortName(item) + item.slice(0, -5);
    }
    return item;
  })
  //新表头插入表格前面
tableArr.unshift(newH);
  // console.log(tableArr,5);
  // console.table(tableArr);

//?优化表格
//!删除空行:如果同一行第三列以及之后的列全部为为空,就删除该整行
  for (let i = 0; i < tableArr.length; i++) {
    let emptyCol = true;
    for (let j = 2; j < tableArr[i].length; j++) {
      if (tableArr[i][j] != "") {
        emptyCol = false;
        break;
      }
    }
    if (emptyCol) {
      tableArr.splice(i, 1);
      i--;
    }
  }
/*
*放到客户端去修改
  //!修改"name"为"^":检查上行的第一列是否和当前行的第一列相同,如果相同就将当前行的第一列值该为"^"
  for (let i = 1; i < tableArr.length; i++) {
    if (tableArr[i][0] == tableArr[i - 1][0]) {
      tableArr[i][0] = "^";
    }
  }
*/

  // console.table(tableArr);

//?返回结果
  return tableArr;

}//$ 2. 设置2D Array排班表函数,  输入一个日期,返回该日期的整周的安排,二维数组结果



//测试
// getTwoDArray_schedule("2023-01-01").then(data => console.log(data))

module.exports = router;