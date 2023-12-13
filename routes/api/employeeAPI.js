//引入模块

const express = require('express');
//创建路由对象

const router = express.Router();

//引入数据库操作文件

const Employee = require('../../mongodb/mg_model_module').Employee;



//-----------------------------------------------------------------------------

//^ 上传employee个人资料

router.post('/employee/fill', (req, res) => {

  //?先判断url携带的token参数是否在Employee数据库存在,核对token number
  console.log(11,req.body.data);
  Employee.findOne({ name: "token", phone: req.query.token }).lean().exec().then(
    data => {
      //?检查token是否过期
      if (data && data.date.getTime() < new Date().getTime()) {
        res.send({
          status: '1',
          msg: 'token expired 过期'
        });


        //?检查token在期限内
      } else if (data && data.date.getTime() >= new Date().getTime()) {
  console.log(data);
        console.log(req.body.data);

        saveData(req.body.data).then(data => {
        
          res.send({
            status: '0000',
            msg: 'token is ok 有效,success upload上传成功'
          });
        }).catch(err => {
          res.send({
            status: '1',
            msg: 'fail upload上传失败,token is ok, but filled contents are not right'
          });
        });





        //?token不存在,或者token过期
      } else {
        res.send({
          status: "1",
          msg: "token is not ok 无效"
        });


      }
    }
  );



});



//-----------------------------------------------------------------------------------

//^ 生成员工号, 自动根据position,date,和已有Number 生成新的Number
async function generateNumber(date=new Date()) {
  let data = await Employee.find({}).lean().select("number").catch(err => console.log(err));

  let numbers = [];
  let number;
  //得到年的尾部两位,并转为字符串
  let yearString = new Date(date).getFullYear().toString().slice(2, 4);
  //得到月数,并把1和2月合到'0'上,11月合12月放在'9'上,其余3月到10月依次为'1'到'8'
  let monthString;
  let monthNumber = new Date(date).getMonth() - 1;
  // console.log(101,monthNumber);
  if (monthNumber === -1) {
    monthString = '0';
  } else if (monthNumber === 10) {
    monthString = '9';
  } else {
    monthString = monthNumber.toString();
  }
  //得到所有员工号的最后两位,并转为数字
  for (let i = 0; i < data.length; i++) {
    numbers.push(+data[i].number % 100);
  }

  //如果Numbers为空
  if (numbers.length == 0) {

    return yearString + monthString + '01';

    //如果不为空
  } else {
    //求最大值的下一值
    numbers.sort((a, b) => b - a);
    
    number = +numbers[0] + 1;
    //转为字符串并拼接
    number = number.toString();
    // console.log('号码2;' + number);
    if (number.length == 1) {
      number = '0' + number;
    };

    return yearString + monthString + number;
  }

}

//^保存fill好的数据到Employee数据库

//补全数据并存储
async function saveData(data) {

  //当data db里只有一项时

  data.number = await generateNumber(data.date);
  if (!data.remarks) {
    data.remarks = '';
  }
  //save data from mongodb
  let result = await new Employee(data).save();
  return result;
}



//-----------------------------------------------------------------------
module.exports = router;

