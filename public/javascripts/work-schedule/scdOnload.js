

//按顺序显示出班表
//获取当天日期
let dateReq = new Date().toLocaleDateString();
console.log("当天:", dateReq);

//获取下周日期
let dateReq1 = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString();
// console.log("下周:", dateReq1);

//获取下下周日期
let dateReq2 = new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString();
// console.log("下下周:", dateReq2);

//!display date on page, from xxxx to xxxx
(function displayDate() {
  //获取页面元素
  let date0mon = document.getElementById('date0-mon');
  let date1mon = document.getElementById('date1-mon');
  let date2mon = document.getElementById('date2-mon');
  let date0sun = document.getElementById('date0-sun');
  let date1sun = document.getElementById('date1-sun');
  let date2sun = document.getElementById('date2-sun');
  //设置日期
  date0mon.innerHTML = weektodate('mon', dateReq);
  date1mon.innerHTML = weektodate('mon', dateReq1);
  date2mon.innerHTML = weektodate('mon', dateReq2);
  date0sun.innerHTML = weektodate('sun', dateReq);
  date1sun.innerHTML = weektodate('sun', dateReq1);
  date2sun.innerHTML = weektodate('sun', dateReq2);
})();



//!display schedule table
async function displaySchedule(dateReq) {
  //获取数据
  let data = await getFixedSchedule2DArray(dateReq);
  // console.log("本周数据:",data);
  let data1 = await getFixedSchedule2DArray(dateReq1);
  // console.log("下周数据:",data1);
  let data2 = await getFixedSchedule2DArray(dateReq2);
  // console.log("下下周数据:",data2);


  //转换成HTML
  document.getElementById('schedule-table-0').innerHTML = arrayToTableHTML(data, 'mytable0');
  //获取table并设置样式
  let mytable0 = document.getElementById('mytable0');
  mytable0.className = 'table table-bordered table-striped';
  //转换成HTML
  document.getElementById('schedule-table-1').innerHTML = arrayToTableHTML(data1, 'mytable1');
  //获取table并设置样式
  let mytable1 = document.getElementById('mytable1');
  mytable1.className = 'table table-bordered table-striped';
  //转换成HTML
  document.getElementById('schedule-table-2').innerHTML = arrayToTableHTML(data2, 'mytable2');
  //获取table并设置样式
  let mytable2 = document.getElementById('mytable2');
  mytable2.className = 'table table-bordered table-striped';


}
//执行
displaySchedule(dateReq);








//-----------------------------------------------------------------------------------

//*fetch get table 2dArr table date
async function getFixedSchedule2DArray(dateReq) {
  // console.log(dateReq);
  //fetch服务端

  //构建日期参数对象
  const dateParams = { date: dateReq };

  //转化日期成url参数字符串
  const params = new URLSearchParams(dateParams);
  const paramString = params.toString();
  // console.log(paramString);

  //组装成新的url
  let url = '/work-schedule/data_onload?' + paramString;

//发送带日期参数的get请求
  let data = await fetch(url).then(res => res.json()).then(data => {
    return data;
  }).catch(err => {
    console.log(err, "排班显示,请求班表失败");
  });

  //!修改"name"为"^":检查上行的第一列是否和当前行的第一列相同,如果相同就将当前行的第一列值该为"^"
  let tableArr = data;
  for (let i = 1; i < tableArr.length; i++) {
    if (tableArr[i][0] == tableArr[i - 1][0]) {
      tableArr[i][0] = "^";
    }
  }
  
  //?返回数据
  return tableArr;
}


//*二维数组转换成HTML
/**
 * 这个函数的作用是返回table的HTML字符串,包括了table自身标签
 * @param {array[]} data -参数的作用是提供表格的二维数组数据
 * @param {string} idStr -参数的作用是生成table元素的#id名
 * @returns {string} -返回table的HTML字符串
 */
function arrayToTableHTML(data, idStr) {
  var table = document.createElement('table');
  table.id = idStr;
  for (var i = 0; i < data.length; i++) {
    var row = document.createElement('tr');
    
    //?设置表头样式
    if (i === 0) {
      row.className = 'thead-dark';
    }
        
    //?设置表格内容
    else if (data[i][1]) {
      row.className = `row-`+data[i][1];
    }



    for (var j = 0; j < data[i].length; j++) {
      var cell = document.createElement(i === 0 || j === 0  ? 'th' : 'td');
      cell.textContent = data[i][j];
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  return table.outerHTML;
}