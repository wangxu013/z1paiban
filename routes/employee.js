var express = require('express');
var router = express.Router();

const Employee = require('../mongodb/mg_model_module').Employee;

//引入请求体分析中间件
router.use(express.urlencoded({
  extended: false
}));
router.use(express.json());

// ! --------------------------------------------------------------------------


// * GET home page.
router.get('/', function (req, res, next) {
  res.render('employee');

}); // ! |||||||||||end||||||||||||GET home page.|||||||||||||||||||||||||

// *GET tabledata mongodb data of Employee 
router.get('/tabledata', function (req, res, next) {
  //set headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With,application/json");
  res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies

  //get data from mongodb
  getEmployeeData().then(data => {
    res.json(data);
    res.end();
    // console.log(data);
  }).catch(err => console.log(err));

}); //!|||||end|||||||||||||GET tabledata mongodb data of Employee||||||||

// *insert data from mongodb
router.all('/insert', function (req, res, next) {
  //set headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With,application/json");
  res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies

  let data = req.body;

  //补全数据
  async function fixData() {

    //当data db里只有一项时

    data[0].number = await generateNumber(data[0].date);
    if(!data[0].remarks){
      data[0].remarks = '';
    }
    //save data from mongodb
    let result = await saveEmployeeData(req.body[0]);
    // console.log('result:',result);
    res.json(result);
    res.end();
  }
  //执行
  fixData();

}) // !||||||||||||||end||||||||||||||insert data from mongodb||||||||||||

//*update data from mongodb
router.all('/update', function (req, res, next) {
  //set headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With,application/json");
  res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies

  //!比较修改前后的position一不一样
  let positionUpdate = req.body[0].position;
  let positionOld;
  async function vsPosition() {
    await Employee.find({
      _id: req.body[0]._id
    }).lean().then(data => {
      positionOld = data[0].position;
      console.log(data);
    }).catch(err => console.log(err));

    console.log('123', positionOld, positionUpdate);
    //如果不一样,则重新生成number
    if (positionOld != positionUpdate) {
      async function fixData2() {
        req.body[0].number = await generateNumber(req.body[0].position, req.body[0].date);
        console.log('req.body[0]:', req.body[0]);
        //update data from mongodb
        await updateEmployeeData(req.body[0]._id, req.body[0]).then(data => {
          res.json(data);
          res.end();
          console.log(data);
        }).catch(err => console.log(err));
      }
      //执行
      fixData2();
    } else {
      //update data from mongodb
      await updateEmployeeData(req.body[0]._id, req.body[0]).then(data => {
        res.json(data);
        res.end();
        console.log(data);
      }).catch(err => console.log(err));
    }


  }
  
  //执行
  vsPosition();




}); //!||||||||||||||end||||||||||||||update data from mongodb||||||||||||

//*delete data from mongodb
router.all('/delete', function (req, res, next) {
  //set headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With,application/json");
  res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies

  //delete data from mongodb
  deleteEmployeeData(req.body[0]._id).then(data => {
    res.json(data);
    res.end();
    // console.log(data);
  }).catch(err => console.log(err));

}); //!||||||||||end|||||||||||||||||delete data from mongodb|||||||||||||




// ! ----------------------定义功能模块对象------------------------------------------------
//get data form mongodb
async function getEmployeeData() {
  let data = await Employee.find({},{_v:0}).lean().catch(err => console.log(err));
  console.log(data);
  return data;
}

//delete data form mongodb
async function deleteEmployeeData(id) {
  let data = await Employee.deleteOne({
    _id: id
  }).catch(err => console.log(err));
  return data;
}

//save data form mongodb
async function saveEmployeeData(data) {


return await new Employee(data).save().then((res) => {
    console.log("数据保存成功");
    console.log(res);
    return true;

  }).catch((err) => {
    console.log("数据保存失败");
    console.log(err);
    return false;

  });
}

//update data form mongodb
async function updateEmployeeData(id, data) {
  let res = await Employee.updateOne({
    _id: id
  }, data).catch(err => console.log(err));
  return res;
}

//!自动根据position,date,和已有Number 生成新的Number
async function generateNumber(date) {
  let data = await Employee.find({}).lean().select("number").catch(err => console.log(err));

  let numbers = [];
  let number;
  //得到年的尾部两位,并转为字符串
  let yearString = new Date().getFullYear().toString().slice(2, 4);
  //得到月数,并把1和2月合到'0'上,11月合12月放在'9'上,其余3月到10月依次为'1'到'8'
  let mouthString;
  let mouthNumber = new Date().getMonth() -1;
  if(mouthNumber===-1){
    mouthString = '0'
  } else if(mouthNumber===10){
    mouthString = '9'
  } else{
    mouthString = mouthNumber.toString();
  }
//得到所有员工号的最后两位,并转为数字
  for (let i = 0; i < data.length; i++) {
    numbers.push(+data[i].number%100);
  }

//如果Numbers为空
  if (numbers.length == 0) {

    return yearString + mouthNumber + '01';

    //如果不为空
  } else {
    //求最大值的下一值
    numbers.reverse();
    number = +numbers[0] + 1;
   //转为字符串并拼接
    number = number.toString();
    // console.log('号码2;' + number);
    if (number.length == 1) {
      number = '0' + number;
    };
  
    return yearString + mouthNumber + number;
  }

}



module.exports = router;